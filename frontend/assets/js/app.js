import authService from './services/auth.js';
import apiService from './services/api.js';

class App {
    constructor() {
        this.currentPage = null;
        this.routes = {
            '/': 'pages/dashboard.html',
            '/login': 'pages/login.html',
            '/employees': 'pages/employees/index.html',
            '/payslips': 'pages/payslips/index.html',
            '/accounts': 'pages/accounts/index.html',
            '/banking': 'pages/banking/index.html',
            '/users': 'pages/users/index.html'
        };

        this.init();
    }

    async init() {
        // Initialize API service with stored token
        const token = authService.getAuthToken();
        if (token) {
            apiService.setAuthToken(token);
        }

        // Set up navigation
        this.setupNavigation();

        // Handle routing
        this.handleRouting();

        // Listen for route changes
        window.addEventListener('popstate', () => this.handleRouting());
    }

    setupNavigation() {
        const nav = document.getElementById('mainNav');
        if (!nav) return;

        const user = authService.getUser();
        if (!user) return;

        nav.innerHTML = `
            <div class="nav-brand">
                <img src="assets/img/logo.png" alt="BM Outsourcing Logo">
                <span>Pay Slip Generator</span>
            </div>
            <ul class="nav-links">
                <li><a href="/" data-page="dashboard">Dashboard</a></li>
                <li><a href="/employees" data-page="employees">Employees</a></li>
                <li><a href="/payslips" data-page="payslips">Payslips</a></li>
                <li><a href="/accounts" data-page="accounts">Accounts</a></li>
                <li><a href="/banking" data-page="banking">Banking</a></li>
                ${user.role === 'admin' ? '<li><a href="/users" data-page="users">Users</a></li>' : ''}
            </ul>
            <div class="nav-user">
                <span>${user.name}</span>
                <button onclick="app.logout()">Logout</button>
            </div>
        `;

        // Add click handlers for navigation
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = link.getAttribute('href');
                this.navigateTo(path);
            });
        });
    }

    async handleRouting() {
        const path = window.location.pathname;
        const page = this.routes[path] || this.routes['/'];

        // Check authentication
        if (!authService.isAuthenticated() && path !== '/login') {
            this.navigateTo('/login');
            return;
        }

        if (authService.isAuthenticated() && path === '/login') {
            this.navigateTo('/');
            return;
        }

        // Load the page
        try {
            const response = await fetch(page);
            const content = await response.text();
            document.querySelector('.main-content').innerHTML = content;

            // Initialize page-specific scripts
            this.initializePageScripts(path);
        } catch (error) {
            console.error('Error loading page:', error);
            document.querySelector('.main-content').innerHTML = '<div class="error">Error loading page</div>';
        }
    }

    navigateTo(path) {
        window.history.pushState({}, '', path);
        this.handleRouting();
    }

    async logout() {
        try {
            await authService.logout();
            this.navigateTo('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    initializePageScripts(path) {
        // Load page-specific JavaScript modules
        const pageName = path.split('/').pop() || 'dashboard';
        const scriptPath = `assets/js/pages/${pageName}.js`;
        
        // Dynamically import the page script
        import(scriptPath).catch(error => {
            console.warn(`No script found for page: ${pageName}`);
        });
    }
}

// Create and export the app instance
const app = new App();
window.app = app; // Make it globally available for event handlers

export default app; 