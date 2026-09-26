// ---- Constants ----
const STORAGE_KEY = "decodelabs-task-manager-tasks";

// ---- DOM references (grabbed once, reused everywhere) ----
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const tasksCount = document.getElementById("tasks-count");
const formError = document.getElementById("form-error");

// ---- App state ----
let tasks = [];

// Load saved tasks when the app starts.
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    tasks = saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not read saved tasks:", error);
    tasks = [];
  }
}

// Save the current tasks to localStorage.
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks:", error);
  }
}

// Generate an ID to identify each task.
function createId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Update the task list, counter, and empty state.
function renderTasks() {
  taskList.innerHTML = "";

  const hasTasks = tasks.length > 0;
  emptyState.classList.toggle("hidden", hasTasks);
  taskList.classList.toggle("hidden", !hasTasks);

  const remaining = tasks.filter((task) => !task.completed).length;
  tasksCount.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"} · ${remaining} remaining`;

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      `Mark "${task.text}" as ${task.completed ? "incomplete" : "complete"}`
    );
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-icon btn-delete";
    deleteBtn.setAttribute("aria-label", `Delete "${task.text}"`);
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

// Validate and add a new task.
function addTask(text) {
  const trimmedText = text.trim();

  if (trimmedText === "") {
    formError.hidden = false;
    taskInput.setAttribute("aria-invalid", "true");
    return;
  }

  formError.hidden = true;
  taskInput.removeAttribute("aria-invalid");

  tasks.push({
    id: createId(),
    text: trimmedText,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

// Switch a task between complete and incomplete.
function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

// Remove a task by its ID.
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

// Handle form submission without reloading the page.
function handleFormSubmit(event) {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
}

// ---- Event listeners ----
taskForm.addEventListener("submit", handleFormSubmit);

// Clear the error message as soon as the user starts typing again
taskInput.addEventListener("input", () => {
  if (!formError.hidden) {
    formError.hidden = true;
    taskInput.removeAttribute("aria-invalid");
  }
});

// ---- Initial load ----
loadTasks();
renderTasks();