/**
 * API Service for the PaySlip Generator application
 * Handles all communication with the backend API
 */
class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
    }

    /**
     * Get the authentication token
     * @returns {string|null} The authentication token
     */
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Set the authentication token
     * @param {string} token - The authentication token
     */
    setToken(token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    }

    /**
     * Remove the authentication token
     */
    removeToken() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Create request headers with authentication
     * @returns {Object} The request headers
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Make an API request
     * @param {string} endpoint - The API endpoint
     * @param {string} method - The HTTP method
     * @param {Object} data - The request data
     * @returns {Promise} The API response
     */
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}/${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders()
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Something went wrong');
            }

            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Handle the API response
     * @param {Object} response - The API response
     * @returns {Object} The processed response
     */
    handleResponse(response) {
        if (response.status === 'success') {
            return response.data;
        } else {
            throw new Error(response.message || 'API request failed');
        }
    }

    // Authentication endpoints
    /**
     * Login with credentials
     * @param {string} email - The user email
     * @param {string} password - The user password
     * @returns {Promise} The login response
     */
    async login(email, password) {
        const response = await this.request('login', 'POST', { email, password });
        if (response.status === 'success' && response.data && response.data.token) {
            this.setToken(response.data.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        }
        return this.handleResponse(response);
    }

    /**
     * Logout the current user
     * @returns {Promise} The logout response
     */
    async logout() {
        const response = await this.request('logout', 'POST');
        this.removeToken();
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        return this.handleResponse(response);
    }

    /**
     * Verify the current authentication token
     * @returns {Promise} The verification response
     */
    async verifyToken() {
        const token = this.getToken();
        if (!token) {
            return Promise.reject(new Error('No authentication token found'));
        }

        try {
            const response = await this.request('verify', 'POST');
            return this.handleResponse(response);
        } catch (error) {
            this.removeToken();
            throw error;
        }
    }

    // User endpoints
    /**
     * Get all users
     * @param {number} page - The page number
     * @param {number} perPage - The items per page
     * @param {string} search - The search term
     * @returns {Promise} The users response
     */
    async getUsers(page = 1, perPage = CONFIG.PAGINATION.DEFAULT_ITEMS_PER_PAGE, search = '') {
        const endpoint = `users?page=${page}&records_per_page=${perPage}${search ? `&search=${search}` : ''}`;
        const response = await this.request(endpoint);
        return this.handleResponse(response);
    }

    /**
     * Get a single user
     * @param {string} id - The user ID
     * @returns {Promise} The user response
     */
    async getUser(id) {
        const response = await this.request(`users/${id}`);
        return this.handleResponse(response);
    }

    /**
     * Create a new user
     * @param {Object} userData - The user data
     * @returns {Promise} The create user response
     */
    async createUser(userData) {
        const response = await this.request('users', 'POST', userData);
        return this.handleResponse(response);
    }

    /**
     * Update an existing user
     * @param {string} id - The user ID
     * @param {Object} userData - The user data
     * @returns {Promise} The update user response
     */
    async updateUser(id, userData) {
        const response = await this.request(`users/${id}`, 'PUT', userData);
        return this.handleResponse(response);
    }

    /**
     * Delete a user
     * @param {string} id - The user ID
     * @returns {Promise} The delete user response
     */
    async deleteUser(id) {
        const response = await this.request(`users/${id}`, 'DELETE');
        return this.handleResponse(response);
    }

    // Employee endpoints
    /**
     * Get all employees
     * @param {number} page - The page number
     * @param {number} perPage - The items per page
     * @param {string} search - The search term
     * @returns {Promise} The employees response
     */
    async getEmployees(page = 1, perPage = CONFIG.PAGINATION.DEFAULT_ITEMS_PER_PAGE, search = '') {
        const endpoint = `employees?page=${page}&records_per_page=${perPage}${search ? `&search=${search}` : ''}`;
        const response = await this.request(endpoint);
        return this.handleResponse(response);
    }

    /**
     * Get a single employee
     * @param {string} id - The employee ID
     * @returns {Promise} The employee response
     */
    async getEmployee(id) {
        const response = await this.request(`employees/${id}`);
        return this.handleResponse(response);
    }

    /**
     * Create a new employee
     * @param {Object} employeeData - The employee data
     * @returns {Promise} The create employee response
     */
    async createEmployee(employeeData) {
        const response = await this.request('employees', 'POST', employeeData);
        return this.handleResponse(response);
    }

    /**
     * Update an existing employee
     * @param {string} id - The employee ID
     * @param {Object} employeeData - The employee data
     * @returns {Promise} The update employee response
     */
    async updateEmployee(id, employeeData) {
        const response = await this.request(`employees/${id}`, 'PUT', employeeData);
        return this.handleResponse(response);
    }

    /**
     * Delete an employee
     * @param {string} id - The employee ID
     * @returns {Promise} The delete employee response
     */
    async deleteEmployee(id) {
        const response = await this.request(`employees/${id}`, 'DELETE');
        return this.handleResponse(response);
    }

    // Account endpoints
    /**
     * Get all accounts
     * @param {number} page - The page number
     * @param {number} perPage - The items per page
     * @param {string} search - The search term
     * @param {string} type - The account type filter
     * @returns {Promise} The accounts response
     */
    async getAccounts(page = 1, perPage = CONFIG.PAGINATION.DEFAULT_ITEMS_PER_PAGE, search = '', type = '') {
        const endpoint = `accounts?page=${page}&records_per_page=${perPage}${search ? `&search=${search}` : ''}${type ? `&type=${type}` : ''}`;
        const response = await this.request(endpoint);
        return this.handleResponse(response);
    }

    /**
     * Get a single account
     * @param {string} id - The account ID
     * @returns {Promise} The account response
     */
    async getAccount(id) {
        const response = await this.request(`accounts/${id}`);
        return this.handleResponse(response);
    }

    /**
     * Create a new account
     * @param {Object} accountData - The account data
     * @returns {Promise} The create account response
     */
    async createAccount(accountData) {
        const response = await this.request('accounts', 'POST', accountData);
        return this.handleResponse(response);
    }

    /**
     * Update an existing account
     * @param {string} id - The account ID
     * @param {Object} accountData - The account data
     * @returns {Promise} The update account response
     */
    async updateAccount(id, accountData) {
        const response = await this.request(`accounts/${id}`, 'PUT', accountData);
        return this.handleResponse(response);
    }

    /**
     * Delete an account
     * @param {string} id - The account ID
     * @returns {Promise} The delete account response
     */
    async deleteAccount(id) {
        const response = await this.request(`accounts/${id}`, 'DELETE');
        return this.handleResponse(response);
    }

    // Banking details endpoints
    /**
     * Get banking details for an employee
     * @param {string} employeeId - The employee ID
     * @returns {Promise} The banking details response
     */
    async getBankingDetails(employeeId) {
        const response = await this.request(`employees/${employeeId}`);
        return this.handleResponse(response).banking || [];
    }

    /**
     * Add banking details for an employee
     * This is a custom endpoint since the API doesn't provide a direct method
     * We'll have to implement this based on the actual API capabilities
     */
    async addBankingDetails(bankingData) {
        // This would need to be implemented based on the actual API
        // For now, we'll assume there's a banking endpoint
        const response = await this.request('banking', 'POST', bankingData);
        return this.handleResponse(response);
    }

    // Payslip endpoints
    /**
     * Get all payslips
     * @param {number} page - The page number
     * @param {number} perPage - The items per page
     * @param {string} search - The search term
     * @returns {Promise} The payslips response
     */
    async getPayslips(page = 1, perPage = CONFIG.PAGINATION.DEFAULT_ITEMS_PER_PAGE, search = '') {
        const endpoint = `payslips?page=${page}&records_per_page=${perPage}${search ? `&search=${search}` : ''}`;
        const response = await this.request(endpoint);
        return this.handleResponse(response);
    }

    /**
     * Get a single payslip
     * @param {string} id - The payslip ID
     * @returns {Promise} The payslip response
     */
    async getPayslip(id) {
        const response = await this.request(`payslips/${id}`);
        return this.handleResponse(response);
    }

    /**
     * Create a new payslip
     * @param {Object} payslipData - The payslip data
     * @returns {Promise} The create payslip response
     */
    async createPayslip(payslipData) {
        const response = await this.request('payslips', 'POST', payslipData);
        return this.handleResponse(response);
    }

    /**
     * Update an existing payslip
     * @param {string} id - The payslip ID
     * @param {Object} payslipData - The payslip data
     * @returns {Promise} The update payslip response
     */
    async updatePayslip(id, payslipData) {
        const response = await this.request(`payslips/${id}`, 'PUT', payslipData);
        return this.handleResponse(response);
    }

    /**
     * Delete a payslip
     * @param {string} id - The payslip ID
     * @returns {Promise} The delete payslip response
     */
    async deletePayslip(id) {
        const response = await this.request(`payslips/${id}`, 'DELETE');
        return this.handleResponse(response);
    }

    // Report endpoints
    /**
     * Generate a payroll report
     * @param {string} startDate - The start date
     * @param {string} endDate - The end date
     * @returns {Promise} The payroll report response
     */
    async generatePayrollReport(startDate, endDate) {
        const endpoint = `reports/payroll?start_date=${startDate}&end_date=${endDate}`;
        const response = await this.request(endpoint);
        return this.handleResponse(response);
    }

    /**
     * Generate an employee report
     * @param {string} id - The employee ID
     * @returns {Promise} The employee report response
     */
    async generateEmployeeReport(id) {
        const response = await this.request(`reports/employee/${id}`);
        return this.handleResponse(response);
    }
}

// Create a singleton instance of the API Service
const apiService = new ApiService();