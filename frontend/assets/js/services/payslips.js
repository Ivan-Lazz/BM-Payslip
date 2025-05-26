/**
 * Payslip API Service Helper
 * Extends the main API service with payslip-specific functions
 */

import apiService from './api.js';

class PayslipApiService {
    constructor() {
        this.baseApiService = apiService;
    }

    /**
     * Get all payslips with advanced filtering
     */
    async getPayslips(params = {}) {
        try {
            console.log('PayslipAPI: Getting payslips with params:', params);
            
            // Set defaults for payslip-specific parameters
            const defaultParams = {
                page: 1,
                per_page: 10,
                sort_field: 'payment_date',
                sort_direction: 'desc'
            };
            
            const finalParams = { ...defaultParams, ...params };
            
            const response = await this.baseApiService.getPayslips(finalParams);
            console.log('PayslipAPI: Get payslips response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error getting payslips:', error);
            throw error;
        }
    }

    /**
     * Get a single payslip with full details
     */
    async getPayslip(id) {
        try {
            console.log('PayslipAPI: Getting payslip with ID:', id);
            
            if (!id) {
                throw new Error('Payslip ID is required');
            }
            
            const response = await this.baseApiService.getPayslip(id);
            console.log('PayslipAPI: Get payslip response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error getting payslip:', error);
            throw error;
        }
    }

    /**
     * Create a new payslip
     */
    async createPayslip(payslipData) {
        try {
            console.log('PayslipAPI: Creating payslip with data:', payslipData);
            
            // Validate required fields
            const requiredFields = [
                'employee_id', 'bank_account_id', 'salary', 
                'cutoff_date', 'payment_date', 'payment_status', 'person_in_charge'
            ];
            
            for (const field of requiredFields) {
                if (!payslipData[field] && payslipData[field] !== 0) {
                    throw new Error(`${field} is required`);
                }
            }
            
            // Ensure bonus is at least 0
            if (payslipData.bonus === undefined || payslipData.bonus === null) {
                payslipData.bonus = 0;
            }
            
            // Validate numeric fields
            const numericFields = ['salary', 'bonus'];
            for (const field of numericFields) {
                if (payslipData[field] !== undefined && payslipData[field] !== null) {
                    const value = parseFloat(payslipData[field]);
                    if (isNaN(value) || value < 0) {
                        throw new Error(`${field} must be a valid positive number`);
                    }
                    payslipData[field] = value;
                }
            }
            
            // Validate dates
            const dateFields = ['cutoff_date', 'payment_date'];
            for (const field of dateFields) {
                if (payslipData[field]) {
                    const date = new Date(payslipData[field]);
                    if (isNaN(date.getTime())) {
                        throw new Error(`${field} must be a valid date`);
                    }
                }
            }
            
            const response = await this.baseApiService.createPayslip(payslipData);
            console.log('PayslipAPI: Create payslip response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error creating payslip:', error);
            throw error;
        }
    }

    /**
     * Update an existing payslip
     */
    async updatePayslip(id, payslipData) {
        try {
            console.log('PayslipAPI: Updating payslip with ID:', id, 'data:', payslipData);
            
            if (!id) {
                throw new Error('Payslip ID is required');
            }
            
            // Apply same validation as create
            const requiredFields = [
                'employee_id', 'bank_account_id', 'salary', 
                'cutoff_date', 'payment_date', 'payment_status', 'person_in_charge'
            ];
            
            for (const field of requiredFields) {
                if (!payslipData[field] && payslipData[field] !== 0) {
                    throw new Error(`${field} is required`);
                }
            }
            
            // Ensure bonus is at least 0
            if (payslipData.bonus === undefined || payslipData.bonus === null) {
                payslipData.bonus = 0;
            }
            
            // Validate numeric fields
            const numericFields = ['salary', 'bonus'];
            for (const field of numericFields) {
                if (payslipData[field] !== undefined && payslipData[field] !== null) {
                    const value = parseFloat(payslipData[field]);
                    if (isNaN(value) || value < 0) {
                        throw new Error(`${field} must be a valid positive number`);
                    }
                    payslipData[field] = value;
                }
            }
            
            const response = await this.baseApiService.updatePayslip(id, payslipData);
            console.log('PayslipAPI: Update payslip response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error updating payslip:', error);
            throw error;
        }
    }

    /**
     * Delete a payslip
     */
    async deletePayslip(id) {
        try {
            console.log('PayslipAPI: Deleting payslip with ID:', id);
            
            if (!id) {
                throw new Error('Payslip ID is required');
            }
            
            const response = await this.baseApiService.deletePayslip(id);
            console.log('PayslipAPI: Delete payslip response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error deleting payslip:', error);
            throw error;
        }
    }

    /**
     * Generate/Regenerate PDF files for a payslip
     */
    async generatePDFs(id) {
        try {
            console.log('PayslipAPI: Generating PDFs for payslip ID:', id);
            
            if (!id) {
                throw new Error('Payslip ID is required');
            }
            
            const response = await this.baseApiService.generatePayslipPDF(id);
            console.log('PayslipAPI: Generate PDFs response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error generating PDFs:', error);
            throw error;
        }
    }

    /**
     * Get payslips for a specific employee
     */
    async getPayslipsByEmployee(employeeId) {
        try {
            console.log('PayslipAPI: Getting payslips for employee ID:', employeeId);
            
            if (!employeeId) {
                throw new Error('Employee ID is required');
            }
            
            const response = await this.baseApiService.getPayslipsByEmployee(employeeId);
            console.log('PayslipAPI: Get employee payslips response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error getting employee payslips:', error);
            throw error;
        }
    }

    /**
     * Get payment status options
     */
    async getPaymentStatuses() {
        try {
            console.log('PayslipAPI: Getting payment statuses');
            
            const response = await this.baseApiService.getPaymentStatuses();
            console.log('PayslipAPI: Get payment statuses response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error getting payment statuses:', error);
            // Return default statuses if API fails
            return {
                success: true,
                data: ['Paid', 'Pending', 'Cancelled']
            };
        }
    }

    /**
     * Get employees for payslip creation
     */
    async getEmployeesForPayslip() {
        try {
            console.log('PayslipAPI: Getting employees for payslip');
            
            const response = await this.baseApiService.getEmployees({ 
                per_page: 100,
                sort_field: 'firstname',
                sort_direction: 'asc'
            });
            
            console.log('PayslipAPI: Get employees response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error getting employees:', error);
            throw error;
        }
    }

    /**
     * Get banking details for an employee - FIXED to remove duplicates
     */
    async getBankingDetailsForEmployee(employeeId) {
        try {
            console.log('PayslipAPI: Getting banking details for employee ID:', employeeId);
            
            if (!employeeId) {
                throw new Error('Employee ID is required');
            }
            
            const response = await this.baseApiService.getBankingByEmployee(employeeId);
            console.log('PayslipAPI: Raw banking details response:', response);
            
            if (response.success && response.data) {
                // Remove duplicates from the response data
                const uniqueBankingDetails = this.removeBankingDuplicates(response.data);
                
                // Return cleaned response
                const cleanedResponse = {
                    ...response,
                    data: uniqueBankingDetails
                };
                
                console.log('PayslipAPI: Cleaned banking details response:', cleanedResponse);
                return cleanedResponse;
            }
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error getting banking details:', error);
            throw error;
        }
    }

    /**
     * Search payslips with advanced filters
     */
    async searchPayslips(searchParams = {}) {
        try {
            console.log('PayslipAPI: Searching payslips with params:', searchParams);
            
            const params = {
                page: searchParams.page || 1,
                per_page: searchParams.per_page || 10,
                search: searchParams.search || '',
                status: searchParams.status || '',
                start_date: searchParams.start_date || '',
                end_date: searchParams.end_date || '',
                employee_id: searchParams.employee_id || '',
                sort_field: searchParams.sort_field || 'payment_date',
                sort_direction: searchParams.sort_direction || 'desc'
            };
            
            // Remove empty parameters
            Object.keys(params).forEach(key => {
                if (!params[key] && params[key] !== 0) {
                    delete params[key];
                }
            });
            
            const response = await this.getPayslips(params);
            console.log('PayslipAPI: Search payslips response:', response);
            
            return response;
        } catch (error) {
            console.error('PayslipAPI: Error searching payslips:', error);
            throw error;
        }
    }

    /**
     * Get payslip statistics/summary
     */
    async getPayslipStats(params = {}) {
        try {
            console.log('PayslipAPI: Getting payslip statistics with params:', params);
            
            // This would typically be a separate endpoint, but we can calculate from existing data
            const allPayslips = await this.getPayslips({ 
                per_page: 1000,
                ...params 
            });
            
            if (!allPayslips.success) {
                throw new Error('Failed to get payslip data for statistics');
            }
            
            const payslips = allPayslips.data || [];
            
            const stats = {
                total_payslips: payslips.length,
                paid_count: payslips.filter(p => p.payment_status === 'Paid').length,
                pending_count: payslips.filter(p => p.payment_status === 'Pending').length,
                cancelled_count: payslips.filter(p => p.payment_status === 'Cancelled').length,
                total_amount: payslips.reduce((sum, p) => sum + (parseFloat(p.total_salary) || 0), 0),
                paid_amount: payslips
                    .filter(p => p.payment_status === 'Paid')
                    .reduce((sum, p) => sum + (parseFloat(p.total_salary) || 0), 0),
                pending_amount: payslips
                    .filter(p => p.payment_status === 'Pending')
                    .reduce((sum, p) => sum + (parseFloat(p.total_salary) || 0), 0)
            };
            
            console.log('PayslipAPI: Calculated stats:', stats);
            
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('PayslipAPI: Error getting payslip stats:', error);
            throw error;
        }
    }

    /**
     * Validate payslip data before submission
     */
    validatePayslipData(payslipData) {
        const errors = [];
        
        // Required field validation
        const requiredFields = {
            employee_id: 'Employee',
            bank_account_id: 'Bank Account',
            salary: 'Salary',
            cutoff_date: 'Cutoff Date',
            payment_date: 'Payment Date',
            payment_status: 'Payment Status',
            person_in_charge: 'Person In Charge'
        };
        
        for (const [field, label] of Object.entries(requiredFields)) {
            if (!payslipData[field] && payslipData[field] !== 0) {
                errors.push(`${label} is required`);
            }
        }
        
        // Numeric validation
        if (payslipData.salary !== undefined) {
            const salary = parseFloat(payslipData.salary);
            if (isNaN(salary) || salary < 0) {
                errors.push('Salary must be a valid positive number');
            }
        }
        
        if (payslipData.bonus !== undefined && payslipData.bonus !== null && payslipData.bonus !== '') {
            const bonus = parseFloat(payslipData.bonus);
            if (isNaN(bonus) || bonus < 0) {
                errors.push('Bonus must be a valid positive number');
            }
        }
        
        // Date validation
        const dateFields = ['cutoff_date', 'payment_date'];
        for (const field of dateFields) {
            if (payslipData[field]) {
                const date = new Date(payslipData[field]);
                if (isNaN(date.getTime())) {
                    errors.push(`${requiredFields[field]} must be a valid date`);
                }
            }
        }
        
        // Business logic validation
        if (payslipData.cutoff_date && payslipData.payment_date) {
            const cutoffDate = new Date(payslipData.cutoff_date);
            const paymentDate = new Date(payslipData.payment_date);
            
            if (paymentDate < cutoffDate) {
                errors.push('Payment date cannot be before cutoff date');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    /**
     * Remove duplicate banking details from array
     * @param {Array} bankingDetails - Array of banking details
     * @returns {Array} - Array with duplicates removed
     */
    removeBankingDuplicates(bankingDetails) {
        if (!Array.isArray(bankingDetails) || bankingDetails.length === 0) {
            return bankingDetails;
        }
        
        console.log('Removing duplicates from', bankingDetails.length, 'banking records');
        
        // Use Map to track unique combinations
        const uniqueRecords = new Map();
        
        bankingDetails.forEach(detail => {
            // Create composite key to identify unique records
            const key = `${detail.id}-${detail.employee_id}-${detail.bank_account_number}`;
            
            // Only keep the first occurrence of each unique combination
            if (!uniqueRecords.has(key)) {
                uniqueRecords.set(key, detail);
            } else {
                console.warn('Duplicate banking record found:', {
                    id: detail.id,
                    employee_id: detail.employee_id,
                    account_number: detail.bank_account_number
                });
            }
        });
        
        const uniqueArray = Array.from(uniqueRecords.values());
        console.log('After removing duplicates:', uniqueArray.length, 'unique records');
        
        return uniqueArray;
    }

    /**
     * Additional method to validate banking data integrity
     */
    validateBankingData(bankingDetails) {
        if (!Array.isArray(bankingDetails)) {
            return { isValid: false, errors: ['Banking details must be an array'] };
        }
        
        const errors = [];
        const seenIds = new Set();
        const seenAccountNumbers = new Set();
        
        bankingDetails.forEach((detail, index) => {
            // Check for required fields
            if (!detail.id) {
                errors.push(`Record ${index}: Missing ID`);
            }
            if (!detail.employee_id) {
                errors.push(`Record ${index}: Missing employee ID`);
            }
            if (!detail.bank_account_number) {
                errors.push(`Record ${index}: Missing account number`);
            }
            if (!detail.preferred_bank) {
                errors.push(`Record ${index}: Missing bank name`);
            }
            
            // Check for duplicates
            if (detail.id && seenIds.has(detail.id)) {
                errors.push(`Record ${index}: Duplicate ID ${detail.id}`);
            } else if (detail.id) {
                seenIds.add(detail.id);
            }
            
            // Check for duplicate account numbers (for same employee)
            const accountKey = `${detail.employee_id}-${detail.bank_account_number}`;
            if (seenAccountNumbers.has(accountKey)) {
                errors.push(`Record ${index}: Duplicate account number ${detail.bank_account_number} for employee ${detail.employee_id}`);
            } else {
                seenAccountNumbers.add(accountKey);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Create and export singleton instance
const payslipApiService = new PayslipApiService();
export default payslipApiService;