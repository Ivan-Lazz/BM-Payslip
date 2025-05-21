/**
 * Banking details API client
 */

/**
 * Get all banking details with pagination
 * 
 * @param {number} page Page number
 * @param {number} perPage Items per page
 * @param {string} search Search term
 * @returns {Promise<Object>} Paginated banking details data
 */
async function getBankingDetails(page = 1, perPage = 10, search = '') {
    const queryParams = {
        page,
        per_page: perPage,
        search: search || undefined
    };
    
    try {
        return await apiGet('banking', queryParams);
    } catch (error) {
        handleApiError(error, 'Failed to fetch banking details');
        throw error;
    }
}

/**
 * Get a single banking detail by ID
 * 
 * @param {number} id Banking detail ID
 * @returns {Promise<Object>} Banking detail data
 */
async function getBankingDetail(id) {
    try {
        return await apiGet(`banking/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to fetch banking detail');
        throw error;
    }
}

/**
 * Get banking details for an employee
 * 
 * @param {string} employeeId Employee ID
 * @returns {Promise<Object>} Employee banking details
 */
async function getEmployeeBankingDetails(employeeId) {
    try {
        return await apiGet(`banking/employee/${employeeId}`);
    } catch (error) {
        handleApiError(error, 'Failed to fetch employee banking details');
        throw error;
    }
}

/**
 * Create a new banking detail
 * 
 * @param {Object} bankingData Banking detail data
 * @returns {Promise<Object>} Created banking detail data
 */
async function createBankingDetail(bankingData) {
    try {
        return await apiPost('banking', bankingData);
    } catch (error) {
        handleApiError(error, 'Failed to create banking detail');
        throw error;
    }
}

/**
 * Update a banking detail
 * 
 * @param {number} id Banking detail ID
 * @param {Object} bankingData Banking detail data
 * @returns {Promise<Object>} Updated banking detail data
 */
async function updateBankingDetail(id, bankingData) {
    try {
        return await apiPut(`banking/${id}`, bankingData);
    } catch (error) {
        handleApiError(error, 'Failed to update banking detail');
        throw error;
    }
}

/**
 * Delete a banking detail
 * 
 * @param {number} id Banking detail ID
 * @returns {Promise<Object>} Response data
 */
async function deleteBankingDetail(id) {
    try {
        return await apiDelete(`banking/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to delete banking detail');
        throw error;
    }
}