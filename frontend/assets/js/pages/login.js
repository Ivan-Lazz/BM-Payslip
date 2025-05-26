import authService from '../services/auth.js';

class LoginPage {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.loginButton = document.getElementById('loginButton');
        this.loginAlert = document.getElementById('login-alert');
        this.alertMessage = document.getElementById('alert-message');
        
        this.init();
    }

    init() {
        // Check if already logged in
        if (authService.isAuthenticated()) {
            window.location.href = '/bm-payslip/frontend/pages/dashboard.html';
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle password visibility
        this.togglePasswordBtn.addEventListener('click', () => {
            const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            this.passwordInput.setAttribute('type', type);
            this.togglePasswordBtn.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });

        // Handle form submission
        this.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    async handleLogin() {
        // Reset errors
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        this.loginAlert.style.display = 'none';

        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Disable login button and show loading
        this.loginButton.disabled = true;
        this.loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        try {
            // Attempt login
            const response = await authService.login(
                this.usernameInput.value,
                this.passwordInput.value
            );

            // Show success notification
            this.showNotification('success', 'Login Successful', 'Welcome back!');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/bm-payslip/frontend/pages/dashboard.html';
            }, 500);
        } catch (error) {
            // Show error
            this.loginAlert.style.display = 'flex';
            this.alertMessage.textContent = error.message || 'Invalid username or password';

            // Reset login button
            this.loginButton.disabled = false;
            this.loginButton.innerHTML = '<i class="fas fa-sign-in-alt btn-icon"></i> Log In';
        }
    }

    validateForm() {
        let isValid = true;

        // Validate username
        if (!this.usernameInput.value.trim()) {
            this.showFieldError('username', 'Username is required');
            isValid = false;
        } else if (this.usernameInput.value.length < 3) {
            this.showFieldError('username', 'Username must be at least 3 characters');
            isValid = false;
        }

        // Validate password
        if (!this.passwordInput.value) {
            this.showFieldError('password', 'Password is required');
            isValid = false;
        } else if (this.passwordInput.value.length < 6) {
            this.showFieldError('password', 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    showNotification(type, title, message) {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${title}</span>
            </div>
            <div class="notification-body">${message}</div>
        `;

        notifications.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize login page
new LoginPage(); 