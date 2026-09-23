# Task Manager — DecodeLabs Full Stack Project 1 (Frontend Phase)

A clean, responsive, accessible task manager built with plain **HTML, CSS, and JavaScript** — no frameworks, no build tools, no backend. Tasks are saved in the browser's `localStorage`, so they persist across page refreshes.

## Features

- Add a task via a labeled text input + "Add Task" button (or press Enter).
- Tasks are shown in a clear, scannable list.
- Mark any task as complete/incomplete with a checkbox (shows strikethrough when done).
- Delete a task with one click.
- A friendly empty state appears when there are no tasks.
- Empty or whitespace-only tasks are rejected, with a visible inline error message.
- All tasks persist in `localStorage` — refreshing or closing the tab won't lose your data.
- Mobile-first, responsive layout that adapts at 768px (tablet) and 1024px (desktop).
- Accessible: visible focus outlines, labeled input, descriptive button names for screen readers.

## Files

```
task-manager/
├── index.html   # Page structure/markup
├── style.css    # All styling and responsive layout
├── script.js    # App logic (state, rendering, localStorage)
└── README.md    # This file
```

## How to Run It Locally

You don't need any build tools or a server for basic use:

1. Download/copy the three files (`index.html`, `style.css`, `script.js`) into the same folder.
2. Double-click `index.html`, or right-click → "Open with" your browser.

That's it — the app runs entirely in the browser.

**Optional (recommended):** Some browsers restrict certain features when opening files directly via `file://`. If you notice anything odd, serve the folder with a simple local server instead:

- **VS Code:** install the "Live Server" extension, right-click `index.html` → "Open with Live Server".
- **Python 3:** run `python3 -m http.server` in the folder, then visit `http://localhost:8000`.
- **Node.js:** run `npx serve` in the folder.

## Testing on Desktop and Mobile (Browser DevTools)

1. Open `index.html` in Chrome, Edge, or Firefox.
2. Open DevTools:
   - Chrome/Edge: press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac).
   - Firefox: press `F12`.
3. **Test mobile view:**
   - Click the "Toggle device toolbar" icon (looks like a phone/tablet, top-left of DevTools) or press `Ctrl+Shift+M` / `Cmd+Shift+M`.
   - Pick a device preset (e.g., iPhone 12, Pixel 7) or drag the edge to resize manually.
   - Confirm the layout is single-column, buttons are easy to tap, and nothing scrolls sideways.
4. **Test tablet/desktop breakpoints:**
   - Still in device toolbar mode, manually resize the viewport width to just above **768px** and then **1024px** to see the form switch from stacked to inline, and spacing increase.
   - Or simply resize your actual browser window wider/narrower.
5. **Test keyboard accessibility:**
   - Click into the page, then press `Tab` repeatedly. You should see a clear, visible orange focus outline move between the input, "Add Task" button, checkboxes, and delete buttons.
   - Try adding a task using only the `Enter` key.
6. **Test persistence:**
   - Add a few tasks, mark one complete, then refresh the page (`F5` / `Cmd+R`). All tasks and their states should still be there.
   - To reset everything, open DevTools → Application (Chrome) or Storage (Firefox) tab → Local Storage → find the key `decodelabs-task-manager-tasks` → delete it, or just run `localStorage.clear()` in the Console.

## How the JavaScript Works (script.js)

The app keeps one array in memory called `tasks`. Every task is a simple object: `{ id, text, completed }`. All the functions below exist to keep that array, `localStorage`, and what's on screen in sync.

| Function | What it does |
|---|---|
| `loadTasks()` | Reads any previously saved tasks from `localStorage` on page load and parses them back into the `tasks` array. If nothing is saved (or it's corrupted), it starts with an empty list instead of crashing. |
| `saveTasks()` | Converts the current `tasks` array to a JSON string and writes it to `localStorage`. Called after every add/toggle/delete so nothing is lost on refresh. |
| `createId()` | Generates a unique ID (timestamp + random number) for each new task, used to find/update/delete the right one later. |
| `renderTasks()` | The core "redraw the screen" function. Clears the `<ul>` and rebuilds every task item from scratch based on the current `tasks` array. Also shows/hides the empty state and updates the "N tasks" counter. Called any time the data changes. |
| `addTask(text)` | Validates the typed text (rejects empty/whitespace-only input and shows an error). If valid, creates a new task object, adds it to `tasks`, saves, and re-renders. |
| `toggleTask(id)` | Finds the task with the given `id` and flips its `completed` value between `true`/`false`, then saves and re-renders. |
| `deleteTask(id)` | Removes the task with the given `id` from the `tasks` array, then saves and re-renders. |
| `handleFormSubmit(event)` | Runs when the form is submitted (button click or Enter key). Stops the page from reloading (`event.preventDefault()`), calls `addTask()`, then clears and refocuses the input. |

**The general pattern to remember:** every user action (add/toggle/delete) → updates the `tasks` array → calls `saveTasks()` → calls `renderTasks()`. If you want to add a new feature (e.g., editing task text, filtering by status), follow this same pattern: change the data first, then re-render from it.

## Ideas for Extending This (Future Phases)

- Add an "Edit task" button to rename an existing task in place.
- Add filter buttons: All / Active / Completed.
- Add a "Clear completed" button.
- Connect to a real backend/database once you move past the frontend-only phase.