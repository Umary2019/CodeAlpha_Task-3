class ProjectManagementApp {
    constructor() {
        this.apiBase = 'http://localhost:5000/api';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupGlobalHandlers();
        this.setupNavigationHandlers(); // Add this line
    }

    setupNavigationHandlers() {
        // Handle navigation links properly
        const navLinks = document.querySelectorAll('.nav-link[href]');
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes('login.html') || 
                link.getAttribute('href').includes('register.html')) {
                // Allow these links to work normally
                return;
            }
            
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#')) {
                    e.preventDefault();
                    this.navigateTo(href);
                }
            });
        });

        // Handle auth buttons specifically
        const loginBtn = document.querySelector('a[href="login.html"]');
        const registerBtn = document.querySelector('a[href="register.html"]');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                // Allow normal navigation to login page
                // No preventDefault() here
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                // Allow normal navigation to register page
                // No preventDefault() here
            });
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Close modals when clicking outside
        this.setupModalCloseHandlers();
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('active');
                // Update toggle icon
                menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    if (menuToggle) menuToggle.textContent = '☰';
                }
            });
            
            // Close menu when clicking on nav links
            const navLinks = navMenu.querySelectorAll('.nav-link, .logout-btn');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    if (menuToggle) menuToggle.textContent = '☰';
                });
            });
        }
    }

    setupGlobalHandlers() {
        // Handle escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkAuth(); // Re-check auth when page becomes visible
            }
        });
    }

    setupModalCloseHandlers() {
        // Close modals when clicking the close button
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && user) {
            // For now, just set the user without verification
            // In a real app, you'd verify the token with the server
            this.currentUser = user;
            this.updateAuthUI();
            this.onAuthStateChange(true);
        } else {
            this.currentUser = null;
            this.updateAuthUI();
            this.onAuthStateChange(false);
        }
    }

    onAuthStateChange(isAuthenticated) {
        // Dispatch custom event for other components to listen to
        const event = new CustomEvent('authStateChange', {
            detail: { isAuthenticated, user: this.currentUser }
        });
        document.dispatchEvent(event);

        // Update page-specific content
        this.updatePageContent();
    }

    updatePageContent() {
        // Update dashboard if on dashboard page
        if (window.location.pathname.includes('dashboard.html') && window.projectsManager) {
            window.projectsManager.loadDashboard();
        }
        
        // Update projects if on projects page
        if (window.location.pathname.includes('projects.html') && window.projectsManager) {
            window.projectsManager.loadProjects();
        }
        
        // Update board if on board page
        if (window.location.pathname.includes('board.html') && window.projectsManager) {
            window.projectsManager.loadProjectBoard();
        }
    }

    updateAuthUI() {
        const authLinks = document.getElementById('auth-links');
        const userLinks = document.getElementById('user-links');
        const userName = document.getElementById('user-name');
        const profileLink = document.getElementById('profile-link');

        if (this.currentUser) {
            if (authLinks) authLinks.style.display = 'none';
            if (userLinks) userLinks.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.name;
            if (profileLink) {
                profileLink.href = `profile.html?id=${this.currentUser.id}`;
                // Update profile link text with avatar
                const firstLetter = this.currentUser.name.charAt(0).toUpperCase();
                profileLink.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 0.5rem;"><span style="width: 24px; height: 24px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: white; font-weight: 600;">${firstLetter}</span> Profile</span>`;
            }
        } else {
            if (authLinks) authLinks.style.display = 'flex';
            if (userLinks) userLinks.style.display = 'none';
        }

        // Update navigation active states
        this.updateNavActiveState();
    }

    updateNavActiveState() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('./', '').replace('/', ''))) {
                link.classList.add('active');
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageDiv = document.getElementById('login-message');
        const loginBtn = document.getElementById('login-btn');

        // Basic validation
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error', messageDiv);
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span>Signing In...</span><span>⏳</span>';
        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.currentUser = data.user;
                
                this.showMessage('✅ Login successful! Redirecting...', 'success', messageDiv);
                
                setTimeout(() => {
                    // Redirect to dashboard or intended page
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirect = urlParams.get('redirect') || 'dashboard.html';
                    window.location.href = redirect;
                }, 1000);
            } else {
                this.showMessage(`❌ ${data.error}`, 'error', messageDiv);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('❌ Network error. Please check your connection and try again.', 'error', messageDiv);
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>Sign In</span><span>→</span>';
            this.showLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        const messageDiv = document.getElementById('register-message');
        const registerBtn = document.getElementById('register-btn');

        // Validation
        if (!name || !email || !password || !role) {
            this.showMessage('Please fill in all fields', 'error', messageDiv);
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error', messageDiv);
            return;
        }

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error', messageDiv);
            return;
        }

        registerBtn.disabled = true;
        registerBtn.innerHTML = '<span>Creating Account...</span><span>⏳</span>';
        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiBase}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.currentUser = data.user;
                
                this.showMessage('✅ Registration successful! Welcome to ProjectFlow!', 'success', messageDiv);
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showMessage(`❌ ${data.error}`, 'error', messageDiv);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('❌ Network error. Please check your connection and try again.', 'error', messageDiv);
        } finally {
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<span>Create Account</span><span>🚀</span>';
            this.showLoading(false);
        }
    }

    handleLogout() {
        // Show confirmation for logout
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.currentUser = null;
            this.updateAuthUI();
            this.onAuthStateChange(false);
            this.showToast('Logged out successfully', 'success');
            
            // Redirect to home page after a brief delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    showMessage(message, type, container) {
        if (container) {
            container.innerHTML = `
                <div class="message ${type}">
                    ${message}
                </div>
            `;
            container.style.display = 'block';
            
            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    container.style.display = 'none';
                }, 5000);
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#06d6a0' : '#6366f1'};
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            z-index: 10000;
            box-shadow: var(--shadow-lg);
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(toast);
        
        // Add CSS animations
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        if (!token) {
            this.showToast('Please login to continue', 'error');
            throw new Error('No authentication token');
        }
        
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Navigate to page with authentication check
    navigateTo(url) {
        if (!this.isAuthenticated() && url !== 'index.html' && !url.includes('login.html') && !url.includes('register.html')) {
            window.location.href = `login.html?redirect=${encodeURIComponent(url)}`;
        } else {
            window.location.href = url;
        }
    }

    // Utility function to debounce API calls
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // API error handler
    handleApiError(error, defaultMessage = 'An error occurred') {
        console.error('API Error:', error);
        
        if (error.message === 'No authentication token') {
            this.showToast('Please login to continue', 'error');
            return;
        }
        
        if (error.message.includes('Network')) {
            this.showToast('Network error. Please check your connection.', 'error');
            return;
        }
        
        this.showToast(defaultMessage, 'error');
    }

    // Check if user has specific role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        return this.currentUser && roles.includes(this.currentUser.role);
    }

    // Get user initials for avatars
    getUserInitials(name) {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new ProjectManagementApp();
    
    // Add global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        if (window.app) {
            window.app.showToast('An unexpected error occurred', 'error');
        }
    });
});

// Utility functions for other components
window.projectUtils = {
    // Format priority for display
    formatPriority(priority) {
        const priorityMap = {
            'low': { text: 'Low', class: 'priority-low' },
            'medium': { text: 'Medium', class: 'priority-medium' },
            'high': { text: 'High', class: 'priority-high' }
        };
        return priorityMap[priority] || { text: priority, class: 'priority-medium' };
    },

    // Format status for display
    formatStatus(status) {
        const statusMap = {
            'todo': { text: 'To Do', class: 'status-todo' },
            'in-progress': { text: 'In Progress', class: 'status-in-progress' },
            'completed': { text: 'Completed', class: 'status-completed' },
            'planning': { text: 'Planning', class: 'status-planning' }
        };
        return statusMap[status] || { text: status, class: 'status-todo' };
    },

    // Calculate progress percentage
    calculateProgress(completed, total) {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    },

    // Generate random color for avatars
    generateColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
};