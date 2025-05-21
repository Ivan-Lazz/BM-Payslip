/**
 * Users API client
 */

/**
 * Get all users with pagination
 * 
 * @param {number} page Page number
 * @param {number} perPage Items per page
 * @param {string} search Search term
 * @returns {Promise<Object>} Paginated users data
 */
async function getUsers(page = 1, perPage = 10, search = '') {
    const queryParams = {
        page,
        per_page: perPage,
        search: search || undefined
    };
    
    try {
        return await apiGet('users', queryParams);
    } catch (error) {
        handleApiError(error, 'Failed to fetch users');
        throw error;
    }
}

/**
 * Get a single user by ID
 * 
 * @param {number} id User ID
 * @returns {Promise<Object>} User data
 */
async function getUser(id) {
    try {
        return await apiGet(`users/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to fetch user details');
        throw error;
    }
}

/**
 * Create a new user
 * 
 * @param {Object} userData User data
 * @returns {Promise<Object>} Created user data
 */
async function createUser(userData) {
    try {
        return await apiPost('users', userData);
    } catch (error) {
        handleApiError(error, 'Failed to create user');
        throw error;
    }
}

/**
 * Update a user
 * 
 * @param {number} id User ID
 * @param {Object} userData User data
 * @returns {Promise<Object>} Updated user data
 */
async function updateUser(id, userData) {
    try {
        return await apiPut(`users/${id}`, userData);
    } catch (error) {
        handleApiError(error, 'Failed to update user');
        throw error;
    }
}

/**
 * Delete a user
 * 
 * @param {number} id User ID
 * @returns {Promise<Object>} Response data
 */
async function deleteUser(id) {
    try {
        return await apiDelete(`users/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to delete user');
        throw error;
    }
}

/**
 * Update user password
 * 
 * @param {number} id User ID
 * @param {string} currentPassword Current password
 * @param {string} newPassword New password
 * @returns {Promise<Object>} Response data
 */
async function updatePassword(id, currentPassword, newPassword) {
    try {
        return await apiPost(`users/${id}/password`, {
            current_password: currentPassword,
            new_password: newPassword
        });
    } catch (error) {
        handleApiError(error, 'Failed to update password');
        throw error;
    }
}

/**
 * Get current user profile
 * 
 * @returns {Promise<Object>} User profile data
 */
async function getCurrentUser() {
    try {
        return await apiGet('users/profile');
    } catch (error) {
        handleApiError(error, 'Failed to fetch user profile');
        throw error;
    }
}