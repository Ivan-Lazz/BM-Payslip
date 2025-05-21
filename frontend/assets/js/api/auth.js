/**
 * Authentication API client
 */

/**
 * Login user
 * 
 * @param {string} username Username
 * @param {string} password Password
 * @returns {Promise<Object>} Response with user info
 */
async function login(username, password) {
    try {
        const response = await apiPost('auth/login', { username, password });
        
        if (!response.success) {
            throw new Error(response.message || 'Login failed');
        }
        
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Login failed');
    }
}

/**
 * Logout user
 * 
 * @returns {Promise<boolean>} Whether logout was successful
 */
async function logout() {
    try {
        // Call logout endpoint
        await apiPost('auth/logout');
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
}

/**
 * Check authentication status
 * 
 * @returns {Promise<boolean>} Whether user is authenticated
 */
async function checkAuth() {
    try {
        const response = await apiGet('auth/check');
        return response.success;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}