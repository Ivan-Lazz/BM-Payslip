/**
 * Employee accounts API client
 */

/**
 * Get all employee accounts with pagination
 * 
 * @param {number} page Page number
 * @param {number} perPage Items per page
 * @param {string} search Search term
 * @param {string} accountType Account type filter
 * @param {string} status Account status filter
 * @returns {Promise<Object>} Paginated accounts data
 */
async function getAccounts(page = 1, perPage = 10, search = '', accountType = '', status = '') {
    const queryParams = {
        page,
        per_page: perPage,
        search: search || undefined,
        account_type: accountType || undefined,
        status: status || undefined
    };
    
    try {
        return await apiGet('accounts', queryParams);
    } catch (error) {
        handleApiError(error, 'Failed to fetch accounts');
        throw error;
    }
}

/**
 * Get a single account by ID
 * 
 * @param {number} id Account ID
 * @returns {Promise<Object>} Account data
 */
async function getAccount(id) {
    try {
        return await apiGet(`accounts/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to fetch account details');
        throw error;
    }
}

/**
 * Create a new account
 * 
 * @param {Object} accountData Account data
 * @returns {Promise<Object>} Created account data
 */
async function createAccount(accountData) {
    try {
        return await apiPost('accounts', accountData);
    } catch (error) {
        handleApiError(error, 'Failed to create account');
        throw error;
    }
}

/**
 * Update an account
 * 
 * @param {number} id Account ID
 * @param {Object} accountData Account data
 * @returns {Promise<Object>} Updated account data
 */
async function updateAccount(id, accountData) {
    try {
        return await apiPut(`accounts/${id}`, accountData);
    } catch (error) {
        handleApiError(error, 'Failed to update account');
        throw error;
    }
}

/**
 * Delete an account
 * 
 * @param {number} id Account ID
 * @returns {Promise<Object>} Response data
 */
async function deleteAccount(id) {
    try {
        return await apiDelete(`accounts/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to delete account');
        throw error;
    }
}

/**
 * Get account types
 * 
 * @returns {Promise<Array>} List of account types
 */
async function getAccountTypes() {
    try {
        return await apiGet('accounts/types');
    } catch (error) {
        // Fallback to config if API fails
        console.warn('Failed to fetch account types from API, using config defaults');
        return { success: true, data: config.accountTypes };
    }
}

/**
 * Get account statuses
 * 
 * @returns {Promise<Array>} List of account statuses
 */
async function getAccountStatuses() {
    try {
        return await apiGet('accounts/statuses');
    } catch (error) {
        // Fallback to config if API fails
        console.warn('Failed to fetch account statuses from API, using config defaults');
        return { success: true, data: config.accountStatuses };
    }
}