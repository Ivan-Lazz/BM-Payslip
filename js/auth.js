/**
 * Authentication Service for the PaySlip Generator application
 * Handles user authentication and session management
 */
class AuthService {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.initFromStorage();
    }

    /**
     * Initialize authentication state from local storage
     */
    initFromStorage() {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);

        if (token && userData) {
            this.isAuthenticated = true;
            this.user = JSON.parse(userData);
        }
    }

    /**
     * Login with credentials
     * @param {string} email - The user email
     * @param {string} password - The user password
     * @returns {Promise} The login response
     */
    async login(email, password) {
        try {
            const response = await apiService.login(email, password);
            this.isAuthenticated = true;
            this.user = response.user;
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Logout the current user
     * @returns {Promise} The logout response
     */
    async logout() {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            this.isAuthenticated = false;
            this.user = null;
            // Redirect to login page
            window.location.href = 'login.html';
        }
    }

    /**
     * Check if the user is authenticated
     * @returns {boolean} True if authenticated, false otherwise
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * Get the current user data
     * @returns {Object|null} The user data
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Check if the current user has a specific role
     * @param {string} role - The role to check
     * @returns {boolean} True if the user has the role, false otherwise
     */
    hasRole(role) {
        if (!this.user || !this.user.type) {
            return false;
        }
        return this.user.type.toUpperCase() === role.toUpperCase();
    }

    /**
     * Check if a route requires authentication
     * @param {string} route - The route to check
     * @returns {boolean} True if the route requires authentication, false otherwise
     */
    routeRequiresAuth(route) {
        // All routes except login require authentication
        return route !== 'login';
    }

    /**
     * Check if the user has permission to access a route
     * @param {string} route - The route to check
     * @returns {boolean} True if the user has permission, false otherwise
     */
    canAccessRoute(route) {
        if (!this.routeRequiresAuth(route)) {
            return true;
        }

        if (!this.isAuthenticated) {
            return false;
        }

        // Add specific route permissions as needed
        // For example, only admins can access the users route
        if (route === 'users' && !this.hasRole('ADMIN')) {
            return false;
        }

        return true;
    }

    /**
     * Validate a login form
     * @param {Object} formData - The form data
     * @returns {Object} The validation result
     */
    validateLoginForm(formData) {
        const errors = {};

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!this.isValidEmail(formData.email)) {
            errors.email = 'Invalid email format';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Validate an email address
     * @param {string} email - The email to validate
     * @returns {boolean} True if valid, false otherwise
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Verify the current authentication token
     * @returns {Promise} The verification response
     */
    async verifyToken() {
        try {
            await apiService.verifyToken();
            return true;
        } catch (error) {
            console.error('Token verification failed:', error);
            this.isAuthenticated = false;
            this.user = null;
            return false;
        }
    }

    /**
     * Check authentication and redirect if needed
     * @param {string} currentRoute - The current route
     */
    checkAuthAndRedirect(currentRoute) {
        // If we're on the login page and already authenticated, redirect to dashboard
        if (currentRoute === 'login' && this.isAuthenticated) {
            window.location.href = 'index.html';
            return;
        }

        // If we require authentication but aren't authenticated, redirect to login
        if (this.routeRequiresAuth(currentRoute) && !this.isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }

        // If we don't have permission for this route, redirect to dashboard
        if (!this.canAccessRoute(currentRoute)) {
            window.location.href = 'index.html';
            return;
        }
    }
}