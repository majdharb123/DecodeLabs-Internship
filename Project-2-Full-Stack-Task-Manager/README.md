# Full-Stack Task Manager

A responsive full-stack task management application built during the **Decodelabs Full-Stack Development Internship**. The project combines a clean browser-based interface with a RESTful API and PostgreSQL database, allowing users to organize and manage tasks through a complete CRUD workflow.

[![Live Demo](https://img.shields.io/badge/Live_Demo-8B5CF6?style=for-the-badge&logo=render&logoColor=white)](https://decodelabs-task-manager.onrender.com)
[![API](https://img.shields.io/badge/REST_API-111827?style=for-the-badge&logo=express&logoColor=white)](https://decodelabs-task-manager-api.onrender.com/api/tasks)

## Live Links

- **Frontend:** https://decodelabs-task-manager.onrender.com
- **REST API:** https://decodelabs-task-manager-api.onrender.com/api/tasks
- **Repository:** https://github.com/majdharb123/decodelabs_tasks

> The services use free hosting and may need a short time to wake up after a period of inactivity.

## Features

- Create tasks with a title, description, priority, and due date
- View all tasks stored in PostgreSQL
- Search tasks by title or description
- Filter tasks by priority and completion status
- Edit existing task details
- Mark tasks as completed or in progress
- Delete tasks with confirmation
- Display live task statistics
- Validate task data on the client and server
- Preserve task data after refreshing the page
- Responsive layout for desktop and mobile screens

## Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API

### Backend

- Node.js
- Express.js
- PostgreSQL
- `pg` PostgreSQL client
- CORS
- dotenv

### Development and Deployment

- Postman for API testing
- Neon for the deployed PostgreSQL database
- Render for frontend and backend hosting
- Git and GitHub for version control

## Project Structure

```text
Project-2-Full-Stack-Task-Manager/
├── client/
│   ├── favicon.svg
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── server/
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── task.controller.js
│   │   ├── routes/
│   │   │   └── task.routes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package-lock.json
│   └── package.json
│
└── README.md
```

## API Endpoints

Base URL:

```text
https://decodelabs-task-manager-api.onrender.com/api/tasks
```

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/tasks` | Retrieve all tasks |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update an existing task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Example Request Body

```json
{
  "title": "Finish DecodeLabs project",
  "description": "Test the complete CRUD API using Postman",
  "priority": "high",
  "due_date": "2026-09-30",
  "completed": false
}
```

## Database Schema

The `tasks` table stores:

- Task ID
- Title
- Description
- Priority: `low`, `medium`, or `high`
- Due date
- Completion status
- Creation timestamp
- Last update timestamp

The complete SQL schema is available in [`server/database/schema.sql`](server/database/schema.sql).

## Run the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/majdharb123/decodelabs_tasks.git
cd decodelabs_tasks/Project-2-Full-Stack-Task-Manager
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure the environment

Create a `.env` file inside the `server` folder. Use either a PostgreSQL connection string:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

Or configure a local PostgreSQL database using the variables provided in `.env.example`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_manager_db
DB_USER=postgres
DB_PASSWORD=your_password
```

Never commit the real `.env` file or database credentials to GitHub.

### 4. Create the database schema

Create a PostgreSQL database named `task_manager_db`, then execute:

```text
server/database/schema.sql
```

You can run the schema using pgAdmin or the PostgreSQL command-line tools.

### 5. Start the backend

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The local API will run at:

```text
http://localhost:5000
```

### 6. Start the frontend

Open `client/index.html` with a local development server such as the VS Code Live Server extension.

To use the local backend, set the API base URL in `client/script.js` to:

```javascript
const API_URL = "http://localhost:5000/api/tasks";
```

## Validation and Error Handling

The backend validates:

- Required task title
- Maximum title length
- Description data type
- Allowed priority values
- Due date format: `YYYY-MM-DD`

The API returns structured success and error responses to make frontend integration and debugging easier.

## What I Practiced

- Designing a PostgreSQL database schema
- Building RESTful CRUD endpoints with Express.js
- Organizing backend code into routes, controllers, and configuration modules
- Validating user input and handling API errors
- Connecting a JavaScript frontend to a deployed backend
- Testing endpoints with Postman
- Deploying the database, API, and frontend as connected services

## Author

**Majd Harb**
Junior Software Engineer | Full-Stack and Mobile Developer

- GitHub: https://github.com/majdharb123
