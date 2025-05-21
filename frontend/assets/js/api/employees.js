/**
 * Employees API client
 */

/**
 * Get all employees with pagination
 * 
 * @param {number} page Page number
 * @param {number} perPage Items per page
 * @param {string} search Search term
 * @returns {Promise<Object>} Paginated employees data
 */
async function getEmployees(page = 1, perPage = 10, search = '') {
    const queryParams = {
        page,
        per_page: perPage,
        search: search || undefined
    };
    
    try {
        return await apiGet('employees', queryParams);
    } catch (error) {
        handleApiError(error, 'Failed to fetch employees');
        throw error;
    }
}

/**
 * Get a single employee by ID
 * 
 * @param {string} id Employee ID
 * @returns {Promise<Object>} Employee data
 */
async function getEmployee(id) {
    try {
        return await apiGet(`employees/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to fetch employee details');
        throw error;
    }
}

/**
 * Create a new employee
 * 
 * @param {Object} employeeData Employee data
 * @returns {Promise<Object>} Created employee data
 */
async function createEmployee(employeeData) {
    try {
        return await apiPost('employees', employeeData);
    } catch (error) {
        handleApiError(error, 'Failed to create employee');
        throw error;
    }
}

/**
 * Update an employee
 * 
 * @param {string} id Employee ID
 * @param {Object} employeeData Employee data
 * @returns {Promise<Object>} Updated employee data
 */
async function updateEmployee(id, employeeData) {
    try {
        return await apiPut(`employees/${id}`, employeeData);
    } catch (error) {
        handleApiError(error, 'Failed to update employee');
        throw error;
    }
}

/**
 * Delete an employee
 * 
 * @param {string} id Employee ID
 * @returns {Promise<Object>} Response data
 */
async function deleteEmployee(id) {
    try {
        return await apiDelete(`employees/${id}`);
    } catch (error) {
        handleApiError(error, 'Failed to delete employee');
        throw error;
    }
}

/**
 * Get all accounts for an employee
 * 
 * @param {string} employeeId Employee ID
 * @returns {Promise<Object>} Employee accounts data
 */
async function getEmployeeAccounts(employeeId) {
    try {
        return await apiGet(`employees/${employeeId}/accounts`);
    } catch (error) {
        handleApiError(error, 'Failed to fetch employee accounts');
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
        return await apiGet(`employees/${employeeId}/banking`);
    } catch (error) {
        handleApiError(error, 'Failed to fetch employee banking details');
        throw error;
    }
}

/**
 * Generate a new employee ID
 * 
 * @returns {Promise<string>} New employee ID
 */
async function generateEmployeeId() {
    try {
        const response = await apiGet('employees/generate-id');
        return response.data.employee_id;
    } catch (error) {
        handleApiError(error, 'Failed to generate employee ID');
        throw error;
    }
}