const API_URL = "http://localhost:5000/api/tasks";

let tasks = [];
let editingTaskId = null;

const taskForm = document.getElementById("task-form");
const taskIdInput = document.getElementById("task-id");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("due-date");

const formTitle = document.getElementById("form-title");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById("cancel-edit-button");

const taskList = document.getElementById("task-list");
const taskMessage = document.getElementById("task-message");
const visibleTaskCount = document.getElementById("visible-task-count");

const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");
const statusFilter = document.getElementById("status-filter");

const totalTasksElement = document.getElementById("total-tasks");
const pendingTasksElement = document.getElementById("pending-tasks");
const completedTasksElement = document.getElementById("completed-tasks");
const highPriorityTasksElement = document.getElementById(
    "high-priority-tasks"
);

const apiStatus = document.getElementById("api-status");
const apiStatusText = document.getElementById("api-status-text");

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
});

taskForm.addEventListener("submit", handleFormSubmit);
cancelEditButton.addEventListener("click", resetForm);

searchInput.addEventListener("input", renderTasks);
priorityFilter.addEventListener("change", renderTasks);
statusFilter.addEventListener("change", renderTasks);

taskList.addEventListener("click", handleTaskAction);
taskList.addEventListener("change", handleTaskStatusChange);

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    const result = await response.json().catch(() => {
        return {};
    });

    if (!response.ok) {
        throw new Error(result.message || "The request could not be completed");
    }

    return result;
}

async function loadTasks() {
    showTaskMessage("Loading tasks...");
    updateApiStatus("checking");

    try {
        const result = await apiRequest(API_URL);

        tasks = Array.isArray(result.data) ? result.data : [];

        updateApiStatus("connected");
        updateStatistics();
        renderTasks();
    } catch (error) {
        tasks = [];

        updateApiStatus("disconnected");
        updateStatistics();

        showTaskMessage(
            `${error.message}. Make sure the backend server is running.`,
            true
        );
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = priorityInput.value;
    const dueDate = dueDateInput.value || null;

    if (!title) {
        showFormMessage("Please enter a task title.", true);
        titleInput.focus();
        return;
    }

    const existingTask = tasks.find(
        (task) => String(task.id) === String(editingTaskId)
    );

    const taskData = {
        title,
        description,
        priority,
        due_date: dueDate,
        completed: existingTask ? Boolean(existingTask.completed) : false
    };

    setFormLoading(true);
    clearFormMessage();

    try {
        if (editingTaskId) {
            await apiRequest(`${API_URL}/${editingTaskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            });

            resetForm();
            showFormMessage("Task updated successfully.");
        } else {
            await apiRequest(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            });

            taskForm.reset();
            priorityInput.value = "medium";
            showFormMessage("Task created successfully.");
        }

        await loadTasks();
    } catch (error) {
        showFormMessage(error.message, true);
    } finally {
        setFormLoading(false);
    }
}

function renderTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedPriority = priorityFilter.value;
    const selectedStatus = statusFilter.value;

    const filteredTasks = tasks.filter((task) => {
        const title = String(task.title || "").toLowerCase();
        const description = String(task.description || "").toLowerCase();

        const matchesSearch =
            title.includes(searchTerm) ||
            description.includes(searchTerm);

        const matchesPriority =
            selectedPriority === "all" ||
            task.priority === selectedPriority;

        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "completed" && task.completed) ||
            (selectedStatus === "pending" && !task.completed);

        return matchesSearch && matchesPriority && matchesStatus;
    });

    visibleTaskCount.textContent =
        `${filteredTasks.length} ${filteredTasks.length === 1 ? "task" : "tasks"}`;

    taskList.innerHTML = "";
    taskMessage.classList.add("hidden");

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <li class="empty-state">
                <strong>No tasks found</strong>
                <p>Create a new task or change the current filters.</p>
            </li>
        `;

        return;
    }

    filteredTasks.forEach((task) => {
        taskList.appendChild(createTaskElement(task));
    });
}

function createTaskElement(task) {
    const taskItem = document.createElement("li");

    taskItem.className = task.completed
        ? "task-item is-completed"
        : "task-item";

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = Boolean(task.completed);
    checkbox.dataset.action = "toggle";
    checkbox.dataset.id = task.id;
    checkbox.setAttribute(
        "aria-label",
        `Mark ${task.title} as ${task.completed ? "in progress" : "completed"}`
    );

    const content = document.createElement("div");
    content.className = "task-content";

    const titleRow = document.createElement("div");
    titleRow.className = "task-title-row";

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const priorityBadge = document.createElement("span");
    priorityBadge.className =
        `badge priority-${task.priority || "medium"}`;
    priorityBadge.textContent = `${task.priority || "medium"} priority`;

    const statusBadge = document.createElement("span");
    statusBadge.className = task.completed
        ? "badge status-completed"
        : "badge status-pending";
    statusBadge.textContent = task.completed
        ? "Completed"
        : "In progress";

    titleRow.append(title, priorityBadge, statusBadge);
    content.appendChild(titleRow);

    if (task.description) {
        const description = document.createElement("p");

        description.className = "task-description";
        description.textContent = task.description;

        content.appendChild(description);
    }

    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";

    if (task.due_date) {
        const dueDate = document.createElement("span");

        dueDate.textContent = `Due: ${formatDate(task.due_date)}`;
        taskMeta.appendChild(dueDate);
    } else {
        const noDueDate = document.createElement("span");

        noDueDate.textContent = "No due date";
        taskMeta.appendChild(noDueDate);
    }

    content.appendChild(taskMeta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "action-button edit-button";
    editButton.textContent = "Edit";
    editButton.dataset.action = "edit";
    editButton.dataset.id = task.id;

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "action-button delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = task.id;

    actions.append(editButton, deleteButton);
    taskItem.append(checkbox, content, actions);

    return taskItem;
}

function handleTaskAction(event) {
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) {
        return;
    }

    const taskId = actionButton.dataset.id;
    const action = actionButton.dataset.action;

    if (action === "edit") {
        startEditingTask(taskId);
    }

    if (action === "delete") {
        deleteTask(taskId);
    }
}

async function handleTaskStatusChange(event) {
    if (event.target.dataset.action !== "toggle") {
        return;
    }

    const taskId = event.target.dataset.id;
    const task = findTask(taskId);

    if (!task) {
        return;
    }

    event.target.disabled = true;

    try {
        await apiRequest(`${API_URL}/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: task.title,
                description: task.description || "",
                priority: task.priority,
                due_date: normalizeDate(task.due_date),
                completed: event.target.checked
            })
        });

        await loadTasks();
    } catch (error) {
        event.target.checked = Boolean(task.completed);
        event.target.disabled = false;

        showTaskMessage(error.message, true);
    }
}

function startEditingTask(taskId) {
    const task = findTask(taskId);

    if (!task) {
        return;
    }

    editingTaskId = task.id;

    taskIdInput.value = task.id;
    titleInput.value = task.title;
    descriptionInput.value = task.description || "";
    priorityInput.value = task.priority || "medium";
    dueDateInput.value = normalizeDate(task.due_date);

    formTitle.textContent = "Update task";
    submitButton.textContent = "Save Changes";
    cancelEditButton.classList.remove("hidden");

    clearFormMessage();

    document.querySelector(".form-panel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    titleInput.focus();
}

async function deleteTask(taskId) {
    const task = findTask(taskId);

    if (!task) {
        return;
    }

    const shouldDelete = window.confirm(
        `Are you sure you want to delete "${task.title}"?`
    );

    if (!shouldDelete) {
        return;
    }

    try {
        await apiRequest(`${API_URL}/${taskId}`, {
            method: "DELETE"
        });

        if (String(editingTaskId) === String(taskId)) {
            resetForm();
        }

        await loadTasks();
    } catch (error) {
        showTaskMessage(error.message, true);
    }
}

function updateStatistics() {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    const highPriorityTasks = tasks.filter(
        (task) => task.priority === "high" && !task.completed
    ).length;

    totalTasksElement.textContent = tasks.length;
    pendingTasksElement.textContent = pendingTasks;
    completedTasksElement.textContent = completedTasks;
    highPriorityTasksElement.textContent = highPriorityTasks;
}

function resetForm() {
    editingTaskId = null;

    taskForm.reset();
    taskIdInput.value = "";
    priorityInput.value = "medium";

    formTitle.textContent = "Create a task";
    submitButton.textContent = "Add Task";
    cancelEditButton.classList.add("hidden");

    clearFormMessage();
}

function findTask(taskId) {
    return tasks.find(
        (task) => String(task.id) === String(taskId)
    );
}

function normalizeDate(dateValue) {
    if (!dateValue) {
        return null;
    }

    return String(dateValue).split("T")[0];
}

function formatDate(dateValue) {
    const normalizedDate = normalizeDate(dateValue);
    const date = new Date(`${normalizedDate}T00:00:00`);

    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(date);
}

function updateApiStatus(status) {
    apiStatus.classList.remove("connected", "disconnected");

    if (status === "connected") {
        apiStatus.classList.add("connected");
        apiStatusText.textContent = "API Connected";
        return;
    }

    if (status === "disconnected") {
        apiStatus.classList.add("disconnected");
        apiStatusText.textContent = "API Disconnected";
        return;
    }

    apiStatusText.textContent = "Checking API...";
}

function showTaskMessage(message, isError = false) {
    taskList.innerHTML = "";

    taskMessage.textContent = message;
    taskMessage.classList.remove("hidden");
    taskMessage.classList.toggle("error", isError);
}

function showFormMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.className = isError
        ? "form-message error"
        : "form-message success";
}

function clearFormMessage() {
    formMessage.textContent = "";
    formMessage.className = "form-message";
}

function setFormLoading(isLoading) {
    submitButton.disabled = isLoading;

    if (isLoading) {
        submitButton.textContent = editingTaskId
            ? "Saving..."
            : "Creating...";
        return;
    }

    submitButton.textContent = editingTaskId
        ? "Save Changes"
        : "Add Task";
}