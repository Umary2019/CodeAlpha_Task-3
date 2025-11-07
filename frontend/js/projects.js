class ProjectsManager {
    constructor() {
        this.apiBase = 'http://localhost:5000/api';
        this.init();
    }

    init() {
        if (window.location.pathname.includes('dashboard.html')) {
            this.loadDashboard();
        }
        if (window.location.pathname.includes('projects.html')) {
            this.loadProjects();
            this.setupEventListeners();
        }
        if (window.location.pathname.includes('board.html')) {
            this.loadProjectBoard();
        }
    }

    setupEventListeners() {
        const createProjectBtn = document.getElementById('create-project-btn');
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => this.showCreateProjectModal());
        }

        const createProjectForm = document.getElementById('create-project-form');
        if (createProjectForm) {
            createProjectForm.addEventListener('submit', (e) => this.createProject(e));
        }

        const closeModal = document.querySelector('.close');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideModals());
        }
    }

    async loadDashboard() {
        if (!app.isAuthenticated()) {
            this.showLoginPrompt();
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiBase}/projects`, {
                headers: app.getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                this.displayDashboard(data.data);
            } else {
                this.showNoProjects();
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showNoProjects();
        } finally {
            this.showLoading(false);
        }
    }

    displayDashboard(projects) {
        const container = document.getElementById('dashboard-content');
        const statsContainer = document.getElementById('dashboard-stats');
        const noProjects = document.getElementById('no-projects');
        const loginPrompt = document.getElementById('login-prompt');

        if (!container) return;

        if (!projects || projects.length === 0) {
            if (statsContainer) statsContainer.style.display = 'none';
            if (container) container.style.display = 'none';
            if (noProjects) noProjects.style.display = 'block';
            return;
        }

        if (statsContainer) statsContainer.style.display = 'grid';
        if (container) container.style.display = 'block';
        if (noProjects) noProjects.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'none';

        // Calculate stats
        const totalProjects = projects.length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const totalTasks = projects.reduce((sum, project) => sum + project.taskCount, 0);
        const completedTasks = projects.reduce((sum, project) => sum + project.completedTasks, 0);

        // Update stats
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <h3>${totalProjects}</h3>
                    <p>Total Projects</p>
                </div>
                <div class="stat-card">
                    <h3>${completedProjects}</h3>
                    <p>Completed Projects</p>
                </div>
                <div class="stat-card">
                    <h3>${totalTasks}</h3>
                    <p>Total Tasks</p>
                </div>
                <div class="stat-card">
                    <h3>${completedTasks}</h3>
                    <p>Completed Tasks</p>
                </div>
            `;
        }

        // Display recent projects
        const recentProjects = projects.slice(0, 6);
        if (container) {
            container.innerHTML = `
                <h2>Recent Projects</h2>
                <div class="projects-grid">
                    ${recentProjects.map(project => `
                        <div class="project-card" onclick="projectsManager.openProject(${project.id})">
                            <div class="project-header">
                                <h3 class="project-title">${project.name}</h3>
                                <span class="project-status status-${project.status}">${project.status}</span>
                            </div>
                            <p class="project-description">${project.description}</p>
                            <div class="project-meta">
                                <span>👥 ${project.members.length} members</span>
                                <span>✅ ${project.completedTasks}/${project.taskCount} tasks</span>
                            </div>
                            <div class="project-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                                </div>
                            </div>
                            <div class="project-dates">
                                <small>Due: ${app.formatDate(project.endDate)}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${projects.length > 6 ? `
                    <div style="text-align: center; margin-top: 2rem;">
                        <a href="projects.html" class="btn btn-outline">View All Projects</a>
                    </div>
                ` : ''}
            `;
        }
    }

    async loadProjects() {
        if (!app.isAuthenticated()) {
            this.showLoginPrompt();
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiBase}/projects`, {
                headers: app.getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                this.displayProjects(data.data);
            } else {
                this.showNoProjects();
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showNoProjects();
        } finally {
            this.showLoading(false);
        }
    }

    displayProjects(projects) {
        const container = document.getElementById('projects-container');
        const noProjects = document.getElementById('no-projects');
        const loginPrompt = document.getElementById('login-prompt');

        if (!container) return;

        if (!projects || projects.length === 0) {
            container.style.display = 'none';
            if (noProjects) noProjects.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        if (noProjects) noProjects.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'none';

        container.innerHTML = projects.map(project => `
            <div class="project-card" onclick="projectsManager.openProject(${project.id})">
                <div class="project-header">
                    <h3 class="project-title">${project.name}</h3>
                    <span class="project-status status-${project.status}">${project.status}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <span>Owner: ${project.owner.name}</span>
                    <span>👥 ${project.members.length} members</span>
                    <span>✅ ${project.completedTasks}/${project.taskCount} tasks</span>
                </div>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>
                <div class="project-dates">
                    <small>Start: ${app.formatDate(project.startDate)}</small>
                    <small>Due: ${app.formatDate(project.endDate)}</small>
                </div>
            </div>
        `).join('');
    }

    showCreateProjectModal() {
        document.getElementById('create-project-modal').style.display = 'flex';
    }

    hideModals() {
        document.getElementById('create-project-modal').style.display = 'none';
    }

    async createProject(e) {
        e.preventDefault();
        
        if (!app.isAuthenticated()) {
            alert('Please login to create a project');
            return;
        }

        const formData = new FormData(e.target);
        const projectData = {
            name: formData.get('name'),
            description: formData.get('description'),
            status: formData.get('status'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate')
        };

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiBase}/projects`, {
                method: 'POST',
                headers: app.getAuthHeaders(),
                body: JSON.stringify(projectData)
            });

            const data = await response.json();

            if (data.success) {
                this.hideModals();
                this.loadProjects();
                this.showToast('✅ Project created successfully!');
                e.target.reset();
            } else {
                alert('Error creating project: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Network error creating project');
        } finally {
            this.showLoading(false);
        }
    }

    openProject(projectId) {
        window.location.href = `board.html?projectId=${projectId}`;
    }

    async loadProjectBoard() {
        if (!app.isAuthenticated()) {
            this.showLoginPrompt();
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('projectId');

        if (!projectId) {
            window.location.href = 'projects.html';
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiBase}/projects/${projectId}`, {
                headers: app.getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                this.displayProjectBoard(data.data);
            } else {
                this.showError('Project not found');
            }
        } catch (error) {
            console.error('Error loading project:', error);
            this.showError('Error loading project');
        } finally {
            this.showLoading(false);
        }
    }

    displayProjectBoard(projectData) {
        const container = document.getElementById('project-board');
        if (!container) return;

        const { project, tasks } = projectData;

        // Update page title
        document.title = `${project.name} - ProjectFlow`;

        // Display project header
        const header = document.getElementById('project-header');
        if (header) {
            header.innerHTML = `
                <div>
                    <h1>${project.name}</h1>
                    <p>${project.description}</p>
                </div>
                <div>
                    <button class="btn btn-primary" onclick="projectsManager.showCreateTaskModal()">Add Task</button>
                </div>
            `;
        }

        // Group tasks by status
        const todoTasks = tasks.filter(task => task.status === 'todo');
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
        const completedTasks = tasks.filter(task => task.status === 'completed');

        container.innerHTML = `
            <div class="board-columns">
                <div class="board-column">
                    <h3>To Do (${todoTasks.length})</h3>
                    <div class="tasks-list" data-status="todo">
                        ${todoTasks.map(task => this.renderTask(task)).join('')}
                    </div>
                </div>
                <div class="board-column">
                    <h3>In Progress (${inProgressTasks.length})</h3>
                    <div class="tasks-list" data-status="in-progress">
                        ${inProgressTasks.map(task => this.renderTask(task)).join('')}
                    </div>
                </div>
                <div class="board-column">
                    <h3>Completed (${completedTasks.length})</h3>
                    <div class="tasks-list" data-status="completed">
                        ${completedTasks.map(task => this.renderTask(task)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderTask(task) {
        return `
            <div class="task-card" draggable="true" data-task-id="${task.id}">
                <div class="task-header">
                    <span class="task-title">${task.title}</span>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                <p class="task-description">${task.description || 'No description'}</p>
                <div class="task-meta">
                    <span>Assigned to: ${task.assignee.name}</span>
                    <span>Due: ${app.formatDate(task.dueDate)}</span>
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm btn-outline" onclick="projectsManager.editTask(${task.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="projectsManager.deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `;
    }

    showLoginPrompt() {
        const loginPrompt = document.getElementById('login-prompt');
        const dashboardContent = document.getElementById('dashboard-content');
        const projectsContainer = document.getElementById('projects-container');
        const projectBoard = document.getElementById('project-board');
        
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (dashboardContent) dashboardContent.style.display = 'none';
        if (projectsContainer) projectsContainer.style.display = 'none';
        if (projectBoard) projectBoard.style.display = 'none';
    }

    showNoProjects() {
        const noProjects = document.getElementById('no-projects');
        const dashboardContent = document.getElementById('dashboard-content');
        const projectsContainer = document.getElementById('projects-container');
        
        if (noProjects) noProjects.style.display = 'block';
        if (dashboardContent) dashboardContent.style.display = 'none';
        if (projectsContainer) projectsContainer.style.display = 'none';
    }

    showError(message) {
        const container = document.getElementById('project-board');
        if (container) {
            container.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    showLoading(show) {
        app.showLoading(show);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize projects manager
document.addEventListener('DOMContentLoaded', function() {
    window.projectsManager = new ProjectsManager();
});