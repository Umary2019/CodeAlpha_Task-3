# CodeAlpha_Task-3


Name: UMAR ABUBAKAR

Company: CODEALPHA

ID: CA/SE1/20845

Domain: Full Stack Web Development

Duration: 20th October to 20th November, 2025

Mentor: SWATI SRIVASTAVA

# ProjectFlow - Project Management App

A complete full-stack project management application built with vanilla JavaScript and Node.js.

## Features

### 🔐 Authentication
- User registration with name, email, and password
- User login with email and password
- JWT token-based authentication
- Persistent login sessions

### 📁 Project Management
- **Create Projects**: Start new projects with detailed information
- **Project Dashboard**: Overview of all projects with statistics
- **Project Status**: Track project progress (planning, in-progress, completed)
- **Team Collaboration**: Add members to projects
- **Progress Tracking**: Visual progress bars and task completion rates

### ✅ Task Management
- **Create Tasks**: Add tasks to projects with assignees
- **Task Status**: Track task progress (todo, in-progress, completed)
- **Priority Levels**: Set task priorities (low, medium, high)
- **Due Dates**: Set and track task deadlines
- **Task Assignment**: Assign tasks to team members

### 💬 Collaboration
- **Comments**: Add comments to tasks for collaboration
- **Real-time Updates**: Live updates for task status changes
- **Team Management**: View project members and their roles

## Project Structure
project-management-app/
├── backend/
│ ├── config/database.js # In-memory database configuration
│ ├── controllers/ # Route controllers
│ ├── middleware/ # Authentication & validation
│ ├── models/ # Data models
│ ├── routes/ # API routes
│ └── server.js # Main server file
├── frontend/
│ ├── css/ # Stylesheets
│ ├── js/ # JavaScript modules
│ └── *.html # HTML pages
└── README.md

