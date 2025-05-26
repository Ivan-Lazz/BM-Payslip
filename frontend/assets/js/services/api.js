import authService from './auth.js';

class ApiService {
    constructor() {
        this.baseUrl = '/bm-payslip/backend/api';
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        // Add auth token if available
        const token = authService.getToken();
        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            console.log('API Request:', url, config); // Debug log
            const response = await fetch(url, config);
            const data = await response.json();
            console.log('API Response:', data); // Debug log
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
    
    // Auth endpoints
    async login(username, password) {
        try {
            const response = await this.request('auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            console.log('API login response:', response); // Debug log
            return response;
        } catch (error) {
            console.error('API login error:', error);
            throw error;
        }
    }
    
    async logout() {
        return this.request('auth/logout', {
            method: 'POST'
        });
    }
    
    async checkAuth() {
        return this.request('auth/check');
    }
    
    // User management endpoints
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`users?${queryString}`);
    }
    
    async getUser(id) {
        return this.request(`users/${id}`);
    }
    
    async createUser(userData) {
        return this.request('users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    async updateUser(id, userData) {
        return this.request(`users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
    
    async deleteUser(id) {
        return this.request(`users/${id}`, {
            method: 'DELETE'
        });
    }
    
    // Employee management endpoints
    async getEmployees(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`employees?${queryString}`);
    }
    
    async getEmployee(id) {
        return this.request(`employees/${id}`);
    }
    
    async createEmployee(employeeData) {
        return this.request('employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    }
    
    async updateEmployee(id, employeeData) {
        return this.request(`employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        });
    }
    
    async deleteEmployee(id) {
        return this.request(`employees/${id}`, {
            method: 'DELETE'
        });
    }
    
    // Account management endpoints
    async getAccounts(params = {}) {
        console.log('API: Getting accounts with params:', params); // Debug log
        const queryString = new URLSearchParams(params).toString();
        const response = await this.request(`accounts?${queryString}`);
        console.log('API: Get accounts response:', response); // Debug log
        return response;
    }

    async getAccount(id) {
        console.log('API: Getting account with ID:', id); // Debug log
        const response = await this.request(`accounts/${id}`);
        console.log('API: Get account response:', response); // Debug log
        return response;
    }

    async createAccount(accountData) {
        console.log('API: Creating account with data:', accountData); // Debug log
        const response = await this.request('accounts', {
            method: 'POST',
            body: JSON.stringify(accountData)
        });
        console.log('API: Create account response:', response); // Debug log
        return response;
    }

    async updateAccount(id, accountData) {
        console.log('API: Updating account with ID:', id, 'data:', accountData); // Debug log
        const response = await this.request(`accounts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(accountData)
        });
        console.log('API: Update account response:', response); // Debug log
        return response;
    }

    async deleteAccount(id) {
        console.log('API: Deleting account with ID:', id); // Debug log
        
        try {
            const response = await this.request(`accounts/${id}`, {
                method: 'DELETE'
            });
            console.log('API: Delete account response:', response); // Debug log
            return response;
        } catch (error) {
            console.error('API: Delete account error:', error); // Debug log
            throw error;
        }
    }

    async getAccountTypes() {
        return this.request('accounts/types');
    }

    async getAccountStatuses() {
        return this.request('accounts/statuses');
    }

    // Banking management endpoints
    async getBankingDetails(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`banking?${queryString}`);
    }

    async getBankingDetail(id) {
        return this.request(`banking/${id}`);
    }

    async createBankingDetail(bankingData) {
        return this.request('banking', {
            method: 'POST',
            body: JSON.stringify(bankingData)
        });
    }

    async updateBankingDetail(id, bankingData) {
        return this.request(`banking/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bankingData)
        });
    }

    async deleteBankingDetail(id) {
        return this.request(`banking/${id}`, {
            method: 'DELETE'
        });
    }

    // Get banking details by employee ID - FIXED VERSION
    async getBankingByEmployee(employeeId) {
        console.log('API: Getting banking details for employee ID:', employeeId);
        
        if (!employeeId) {
            throw new Error('Employee ID is required');
        }
        
        try {
            const response = await this.request(`banking/employee/${employeeId}`);
            console.log('API: Get employee banking response:', response);
            return response;
        } catch (error) {
            console.error('API: Error getting banking details for employee:', error);
            throw error;
        }
    }

    // Payslip management endpoints
    async getPayslips(params = {}) {
        console.log('API: Getting payslips with params:', params);
        const queryString = new URLSearchParams(params).toString();
        const response = await this.request(`payslips?${queryString}`);
        console.log('API: Get payslips response:', response);
        return response;
    }

    async getPayslip(id) {
        console.log('API: Getting payslip with ID:', id);
        const response = await this.request(`payslips/${id}`);
        console.log('API: Get payslip response:', response);
        return response;
    }

    async createPayslip(payslipData) {
        console.log('API: Creating payslip with data:', payslipData);
        const response = await this.request('payslips', {
            method: 'POST',
            body: JSON.stringify(payslipData)
        });
        console.log('API: Create payslip response:', response);
        return response;
    }

    async updatePayslip(id, payslipData) {
        console.log('API: Updating payslip with ID:', id, 'data:', payslipData);
        const response = await this.request(`payslips/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payslipData)
        });
        console.log('API: Update payslip response:', response);
        return response;
    }

    async deletePayslip(id) {
        console.log('API: Deleting payslip with ID:', id);
        
        try {
            const response = await this.request(`payslips/${id}`, {
                method: 'DELETE'
            });
            console.log('API: Delete payslip response:', response);
            return response;
        } catch (error) {
            console.error('API: Delete payslip error:', error);
            throw error;
        }
    }

    async generatePayslipPDF(id) {
        console.log('API: Generating PDF for payslip ID:', id);
        const response = await this.request(`payslips/${id}/generate-pdf`, {
            method: 'POST'
        });
        console.log('API: Generate PDF response:', response);
        return response;
    }

    async getPayslipsByEmployee(employeeId) {
        console.log('API: Getting payslips for employee ID:', employeeId);
        const response = await this.request(`payslips/employee/${employeeId}`);
        console.log('API: Get payslips by employee response:', response);
        return response;
    }

    async getPaymentStatuses() {
        console.log('API: Getting payment statuses');
        const response = await this.request('payslips/statuses');
        console.log('API: Get payment statuses response:', response);
        return response;
    }

    // PDF Download endpoints - NEW METHODS
    /**
     * Get PDF download URL for a payslip
     * @param {string} payslipId - The payslip ID
     * @param {string} type - PDF type ('agent' or 'admin')
     * @returns {string} - Download URL
     */
    getPDFDownloadUrl(payslipId, type) {
        if (!payslipId || !type) {
            throw new Error('Payslip ID and type are required');
        }
        
        if (!['agent', 'admin'].includes(type)) {
            throw new Error('PDF type must be either "agent" or "admin"');
        }
        
        return `${this.baseUrl}/pdf/${payslipId}/${type}`;
    }

    /**
     * Get PDF view URL for displaying in browser
     * @param {string} payslipId - The payslip ID
     * @param {string} type - PDF type ('agent' or 'admin')
     * @returns {string} - View URL
     */
    getPDFViewUrl(payslipId, type) {
        if (!payslipId || !type) {
            throw new Error('Payslip ID and type are required');
        }
        
        if (!['agent', 'admin'].includes(type)) {
            throw new Error('PDF type must be either "agent" or "admin"');
        }
        
        return `${this.baseUrl}/pdf/${payslipId}/view/${type}`;
    }

    /**
     * Download PDF file directly
     * @param {string} payslipId - The payslip ID
     * @param {string} type - PDF type ('agent' or 'admin')
     */
    async downloadPDF(payslipId, type) {
        try {
            const url = this.getPDFDownloadUrl(payslipId, type);
            
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `${type}_payslip_${payslipId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`PDF download initiated for payslip ${payslipId} (${type})`);
        } catch (error) {
            console.error('PDF download error:', error);
            throw error;
        }
    }

    /**
     * Open PDF in new tab/window
     * @param {string} payslipId - The payslip ID
     * @param {string} type - PDF type ('agent' or 'admin')
     */
    async viewPDF(payslipId, type) {
        try {
            const url = this.getPDFViewUrl(payslipId, type);
            window.open(url, '_blank');
            
            console.log(`PDF view opened for payslip ${payslipId} (${type})`);
        } catch (error) {
            console.error('PDF view error:', error);
            throw error;
        }
    }
}

export default new ApiService();