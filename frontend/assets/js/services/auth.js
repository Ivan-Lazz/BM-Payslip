import apiService from './api.js';

class AuthService {
    constructor() {
        this.initializeAuth();
    }

    initializeAuth() {
        try {
            this.token = localStorage.getItem('authToken') || null;
            const userStr = localStorage.getItem('user');
            this.user = userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error initializing auth:', error);
            this.clearAuth();
        }
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getToken() {
        return this.token;
    }

    async login(username, password) {
        try {
            const response = await apiService.login(username, password);
            console.log('Login response:', response); // Debug log
            
            // Check if response exists and has required data
            if (!response || typeof response !== 'object') {
                throw new Error('Invalid server response');
            }

            // Extract token and user data from response
            const token = response.token || response.data?.token;
            const user = response.user || response.data?.user;
            console.log('Extracted user data:', user); // Debug log

            if (!token) {
                throw new Error('No authentication token received');
            }

            this.token = token;
            this.user = user || { username }; // Fallback to basic user info if not provided
            console.log('Stored user data:', this.user); // Debug log
            
            // Store in localStorage
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            console.log('Stored in localStorage:', localStorage.getItem('user')); // Debug log
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            this.clearAuth();
            throw error;
        }
    }

    async logout() {
        try {
            if (this.token) {
                await apiService.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
        }
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    getUser() {
        return this.user;
    }

    hasRole(role) {
        return this.user && this.user.role === role;
    }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService; 