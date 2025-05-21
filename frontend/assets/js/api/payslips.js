/**
 * Payslips API client
 */

/**
 * Get all payslips with pagination
 * 
 * @param {number} page Page number
 * @param {number} perPage Items per page
 * @param {string} search Search term
 * @param {string} status Payment status filter
 * @param {string} startDate Start date filter (YYYY-MM-DD)
 * @param {string} endDate End date filter (YYYY-MM-DD)
 * @returns {Promise<Object>} Paginated payslips data
 */
async function getPayslips(page = 1, perPage = 10, search = '', status = '', startDate = '', endDate = '') {
    const queryParams = {
        page,
        per_page: perPage,
        search: search || undefined,
        status: status || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined
    };
    
    try {
        return await apiGet('payslips', queryParams);
    } catch (error) {
        handleApiError(error, 'Failed to fetch payslips');
        throw error;
    }
}

/**
 * Get a single payslip by ID
 * 
 * @param {number|string} id Payslip ID or number
 * @returns {Promise<Object>} Payslip data
 */
async function getPayslip(id) {
    try {
        return await apiGet(`payslips/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to fetch payslip details');
        throw error;
    }
}

/**
 * Get payslips for an employee
 * 
 * @param {string} employeeId Employee ID
 * @returns {Promise<Object>} Payslips data
 */
async function getEmployeePayslips(employeeId) {
    try {
        return await apiGet(`payslips/employee/${employeeId}`);
    } catch (error) {
        handleApiError(error, 'Failed to fetch employee payslips');
        throw error;
    }
}

/**
 * Create a new payslip
 * 
 * @param {Object} payslipData Payslip data
 * @returns {Promise<Object>} Created payslip data
 */
async function createPayslip(payslipData) {
    try {
        return await apiPost('payslips', payslipData);
    } catch (error) {
        handleApiError(error, 'Failed to create payslip');
        throw error;
    }
}

/**
 * Update a payslip
 * 
 * @param {number} id Payslip ID
 * @param {Object} payslipData Payslip data
 * @returns {Promise<Object>} Updated payslip data
 */
async function updatePayslip(id, payslipData) {
    try {
        return await apiPut(`payslips/${id}`, payslipData);
    } catch (error) {
        handleApiError(error, 'Failed to update payslip');
        throw error;
    }
}

/**
 * Delete a payslip
 * 
 * @param {number} id Payslip ID
 * @returns {Promise<Object>} Response data
 */
async function deletePayslip(id) {
    try {
        return await apiDelete(`payslips/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to delete payslip');
        throw error;
    }
}

/**
 * Regenerate PDFs for a payslip
 * 
 * @param {number} id Payslip ID
 * @returns {Promise<Object>} Updated PDF paths
 */
async function regeneratePayslipPDFs(id) {
    try {
        return await apiPost(`payslips/${id}/generate-pdf`);
    } catch (error) {
        handleApiError(error, 'Failed to regenerate payslip PDFs');
        throw error;
    }
}

/**
 * Get available payment statuses
 * 
 * @returns {Promise<Array>} List of payment statuses
 */
async function getPaymentStatuses() {
    try {
        return await apiGet('payslips/statuses');
    } catch (error) {
        handleApiError(error, 'Failed to fetch payment statuses');
        throw error;
    }
}