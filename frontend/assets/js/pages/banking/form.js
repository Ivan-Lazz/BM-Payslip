import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';

class BankingFormPage extends BasePage {
    constructor() {
        super();
        this.elements = {
            ...this.elements,
            form: document.getElementById('bankingForm'),
            employeeIdInput: document.getElementById('employeeId'),
            employeeNameInput: document.getElementById('employeeName'),
            preferredBankInput: document.getElementById('preferredBank'),
            bankAccountInput: document.getElementById('bankAccount'),
            bankHolderInput: document.getElementById('bankHolder'),
            submitBtn: document.getElementById('submit-btn'),
            resetBtn: document.getElementById('reset-btn'),
            formTitle: document.getElementById('form-title'),
            successModal: document.getElementById('success-modal'),
            successMessage: document.getElementById('success-message'),
            closeSuccessModal: document.getElementById('close-success-modal'),
            addAnotherBtn: document.getElementById('add-another-btn'),
            viewAllBtn: document.getElementById('view-all-btn')
        };
        
        this.isEditMode = false;
        this.bankingId = null;
        this.employeeData = null;
        
        this.init();
    }
    
    async init() {
        await super.init();
        this.initializeEventListeners();
        this.checkEditMode();
        this.setupEmployeeIdLookup();
    }
    
    initializeEventListeners() {
        // Form submission
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Prevent double submission
                if (this.elements.submitBtn.disabled) {
                    return;
                }
                
                await this.handleSubmit();
            });
        }
        
        // Reset button
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to reset the form?')) {
                    this.resetForm();
                }
            });
        }
        
        // Success modal buttons
        if (this.elements.successModal) {
            if (this.elements.closeSuccessModal) {
                this.elements.closeSuccessModal.addEventListener('click', () => {
                    this.elements.successModal.classList.remove('show');
                });
            }
            
            if (this.elements.viewAllBtn) {
                this.elements.viewAllBtn.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
            
            if (this.elements.addAnotherBtn) {
                this.elements.addAnotherBtn.addEventListener('click', () => {
                    this.elements.successModal.classList.remove('show');
                    this.resetForm();
                });
            }
        }
        
        // Employee ID input validation
        if (this.elements.employeeIdInput) {
            this.elements.employeeIdInput.addEventListener('blur', async () => {
                const employeeId = this.elements.employeeIdInput.value.trim();
                if (employeeId) {
                    await this.lookupEmployee(employeeId);
                }
            });
            
            this.elements.employeeIdInput.addEventListener('input', () => {
                // Clear employee name field when ID changes
                if (this.elements.employeeNameInput) this.elements.employeeNameInput.value = '';
                this.clearError('employeeId');
            });
        }
        
        // Real-time validation
        this.setupRealTimeValidation();
    }
    
    setupRealTimeValidation() {
        // Required field validation
        ['employeeId', 'preferredBank', 'bankAccount', 'bankHolder'].forEach(fieldName => {
            const element = this.elements[fieldName + 'Input'];
            if (element) {
                element.addEventListener('blur', () => {
                    this.validateRequired(fieldName, element.value);
                });
            }
        });
    }
    
    setupEmployeeIdLookup() {
        // Check if employee_id is provided in URL
        const urlParams = new URLSearchParams(window.location.search);
        const employeeId = urlParams.get('employee_id');
        
        if (employeeId && this.elements.employeeIdInput) {
            this.elements.employeeIdInput.value = employeeId;
            this.lookupEmployee(employeeId);
        }
    }
    
    async lookupEmployee(employeeId) {
        if (!employeeId.trim()) return;
        
        try {
            const response = await apiService.getEmployee(employeeId);
            
            if (response.success && response.data) {
                this.employeeData = response.data;
                
                // Fill in employee name field
                if (this.elements.employeeNameInput) {
                    const fullName = `${response.data.firstname || ''} ${response.data.lastname || ''}`.trim();
                    this.elements.employeeNameInput.value = fullName;
                }
                
                this.clearError('employeeId');
            } else {
                // Employee not found
                this.showError('employeeId', 'Employee not found');
                if (this.elements.employeeNameInput) this.elements.employeeNameInput.value = '';
                this.employeeData = null;
            }
        } catch (error) {
            console.error('Error looking up employee:', error);
            this.showError('employeeId', 'Error looking up employee');
            if (this.elements.employeeNameInput) this.elements.employeeNameInput.value = '';
            this.employeeData = null;
        }
    }
    
    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.bankingId = urlParams.get('id');
        
        if (this.bankingId) {
            this.isEditMode = true;
            this.elements.formTitle.textContent = 'Edit Banking Details';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Update Banking Details';
            this.loadBankingData();
        } else {
            this.isEditMode = false;
            this.elements.formTitle.textContent = 'Add New Banking Details';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Save Banking Details';
        }
    }
    
    async loadBankingData() {
        if (!this.bankingId) return;
        
        try {
            this.showLoading();
            
            const response = await apiService.getBankingDetail(this.bankingId);
            
            if (response.success && response.data) {
                const banking = response.data;
                
                // Fill form fields
                if (this.elements.employeeIdInput) {
                    this.elements.employeeIdInput.value = banking.employee_id || '';
                }
                if (this.elements.employeeNameInput) {
                    const fullName = `${banking.firstname || ''} ${banking.lastname || ''}`.trim();
                    this.elements.employeeNameInput.value = fullName;
                }
                if (this.elements.preferredBankInput) {
                    this.elements.preferredBankInput.value = banking.preferred_bank || '';
                }
                if (this.elements.bankAccountInput) {
                    this.elements.bankAccountInput.value = banking.bank_account_number || '';
                }
                if (this.elements.bankHolderInput) {
                    this.elements.bankHolderInput.value = banking.bank_account_name || '';
                }
                
                // Store employee data
                this.employeeData = {
                    employee_id: banking.employee_id,
                    firstname: banking.firstname,
                    lastname: banking.lastname
                };
                
                // Disable employee ID field when editing
                if (this.elements.employeeIdInput) {
                    this.elements.employeeIdInput.disabled = true;
                }
            } else {
                this.showNotification('Banking detail not found', 'error');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error loading banking data:', error);
            this.showNotification('Error loading banking data', 'error');
            window.location.href = 'index.html';
        } finally {
            this.hideLoading();
        }
    }
    
    validateForm() {
        let isValid = true;
        
        // Clear previous errors
        this.clearAllErrors();
        
        // Employee ID validation
        const employeeId = this.elements.employeeIdInput?.value?.trim();
        if (!employeeId) {
            this.showError('employeeId', 'Employee ID is required');
            isValid = false;
        } else if (!this.employeeData) {
            this.showError('employeeId', 'Please select a valid employee');
            isValid = false;
        }
        
        // Preferred bank validation
        const preferredBank = this.elements.preferredBankInput?.value?.trim();
        if (!preferredBank) {
            this.showError('preferredBank', 'Preferred bank is required');
            isValid = false;
        }
        
        // Bank account validation
        const bankAccount = this.elements.bankAccountInput?.value?.trim();
        if (!bankAccount) {
            this.showError('bankAccount', 'Bank account number is required');
            isValid = false;
        }
        
        // Bank holder validation
        const bankHolder = this.elements.bankHolderInput?.value?.trim();
        if (!bankHolder) {
            this.showError('bankHolder', 'Bank account name is required');
            isValid = false;
        }
        
        return isValid;
    }
    
    validateRequired(fieldName, value) {
        if (!value || value.trim() === '') {
            this.showError(fieldName, this.getFieldLabel(fieldName) + ' is required');
            return false;
        }
        
        this.clearError(fieldName);
        return true;
    }
    
    getFieldLabel(fieldName) {
        const labels = {
            employeeId: 'Employee ID',
            preferredBank: 'Preferred Bank',
            bankAccount: 'Bank Account Number',
            bankHolder: 'Bank Account Name'
        };
        return labels[fieldName] || fieldName;
    }
    
    showError(fieldName, message) {
        const errorElement = document.getElementById(fieldName + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        // Add error class to input
        const inputElement = this.elements[fieldName + 'Input'];
        if (inputElement) {
            inputElement.classList.add('is-invalid');
        }
    }
    
    clearError(fieldName) {
        const errorElement = document.getElementById(fieldName + '-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Remove error class from input
        const inputElement = this.elements[fieldName + 'Input'];
        if (inputElement) {
            inputElement.classList.remove('is-invalid');
        }
    }
    
    clearAllErrors() {
        ['employeeId', 'preferredBank', 'bankAccount', 'bankHolder'].forEach(fieldName => {
            this.clearError(fieldName);
        });
    }
    
    async handleSubmit() {
        try {
            // Validate form
            if (!this.validateForm()) {
                this.showNotification('Please fix the errors below', 'error');
                return;
            }
            
            // Disable submit button
            this.elements.submitBtn.disabled = true;
            this.elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            // Prepare form data
            const formData = {
                employee_id: this.elements.employeeIdInput.value.trim(),
                preferred_bank: this.elements.preferredBankInput.value.trim(),
                bank_account_number: this.elements.bankAccountInput.value.trim(),
                bank_account_name: this.elements.bankHolderInput.value.trim()
            };
            
            let response;
            if (this.isEditMode) {
                response = await apiService.updateBankingDetail(this.bankingId, formData);
            } else {
                response = await apiService.createBankingDetail(formData);
            }
            
            if (response.success) {
                this.showSuccessModal();
            } else {
                throw new Error(response.message || 'Error saving banking detail');
            }
        } catch (error) {
            console.error('Error saving banking detail:', error);
            this.showNotification(error.message || 'Error saving banking detail', 'error');
        } finally {
            // Re-enable submit button
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.innerHTML = this.isEditMode 
                ? '<i class="fas fa-save btn-icon"></i> Update Banking Details'
                : '<i class="fas fa-save btn-icon"></i> Save Banking Details';
        }
    }
    
    showSuccessModal() {
        const message = this.isEditMode
            ? 'Banking details updated successfully!'
            : 'Banking details have been added successfully!';
        
        if (this.elements.successMessage) {
            this.elements.successMessage.textContent = message;
        }
        
        // Show/hide appropriate buttons based on mode
        if (this.elements.addAnotherBtn) {
            this.elements.addAnotherBtn.style.display = this.isEditMode ? 'none' : 'inline-flex';
        }
        
        this.elements.successModal.classList.add('show');
    }
    
    resetForm() {
        // Reset form fields
        if (this.elements.form) {
            this.elements.form.reset();
        }
        
        // Clear employee data
        this.employeeData = null;
        
        // Clear employee name field
        if (this.elements.employeeNameInput) this.elements.employeeNameInput.value = '';
        
        // Clear all errors
        this.clearAllErrors();
        
        // Reset to add mode
        this.isEditMode = false;
        this.bankingId = null;
        this.elements.formTitle.textContent = 'Add New Banking Details';
        this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Save Banking Details';
        
        // Enable employee ID field
        if (this.elements.employeeIdInput) {
            this.elements.employeeIdInput.disabled = false;
        }
        
        // Clear URL parameters
        const url = new URL(window.location);
        url.searchParams.delete('id');
        url.searchParams.delete('employee_id');
        window.history.replaceState({}, '', url);
    }
    
    showLoading() {
        if (this.elements.form) {
            this.elements.form.classList.add('loading');
        }
    }
    
    hideLoading() {
        if (this.elements.form) {
            this.elements.form.classList.remove('loading');
        }
    }
}

// Create and export page instance
const bankingFormPage = new BankingFormPage();
export default bankingFormPage;