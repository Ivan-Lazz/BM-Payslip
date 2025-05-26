import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';

class AccountFormPage extends BasePage {
    constructor() {
        super();
        this.elements = {
            ...this.elements,
            form: document.getElementById('accountForm'),
            employeeIdInput: document.getElementById('employeeId'),
            firstNameInput: document.getElementById('firstName'),
            lastNameInput: document.getElementById('lastName'),
            accountEmailInput: document.getElementById('accountEmail'),
            accountPasswordInput: document.getElementById('accountPassword'),
            accountTypeSelect: document.getElementById('accountType'),
            accountStatusSelect: document.getElementById('accountStatus'),
            submitBtn: document.getElementById('submit-btn'),
            resetBtn: document.getElementById('reset-btn'),
            formTitle: document.getElementById('form-title'),
            successModal: document.getElementById('success-modal'),
            successMessage: document.getElementById('success-message'),
            closeSuccessModal: document.getElementById('close-success-modal'),
            returnListBtn: document.getElementById('return-list-btn'),
            addBankingBtn: document.getElementById('add-banking-btn'),
            createNewBtn: document.getElementById('create-new-btn')
        };
        
        this.isEditMode = false;
        this.accountId = null;
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
            
            if (this.elements.returnListBtn) {
                this.elements.returnListBtn.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
            
            if (this.elements.addBankingBtn) {
                this.elements.addBankingBtn.addEventListener('click', () => {
                    if (this.employeeData && this.employeeData.employee_id) {
                        window.location.href = `../banking/form.html?employee_id=${this.employeeData.employee_id}`;
                    }
                });
            }
            
            if (this.elements.createNewBtn) {
                this.elements.createNewBtn.addEventListener('click', () => {
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
                // Clear employee name fields when ID changes
                if (this.elements.firstNameInput) this.elements.firstNameInput.value = '';
                if (this.elements.lastNameInput) this.elements.lastNameInput.value = '';
                this.clearError('employeeId');
            });
        }
        
        // Real-time validation
        this.setupRealTimeValidation();
    }
    
    setupRealTimeValidation() {
        // Email validation
        if (this.elements.accountEmailInput) {
            this.elements.accountEmailInput.addEventListener('blur', () => {
                this.validateEmail();
            });
            
            this.elements.accountEmailInput.addEventListener('input', () => {
                this.clearError('accountEmail');
            });
        }
        
        // Password validation
        if (this.elements.accountPasswordInput) {
            this.elements.accountPasswordInput.addEventListener('input', () => {
                this.validatePassword();
            });
        }
        
        // Required field validation
        ['employeeId', 'accountEmail', 'accountPassword', 'accountType'].forEach(fieldName => {
            const element = this.elements[fieldName + 'Input'] || this.elements[fieldName + 'Select'];
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
                
                // Fill in employee name fields
                if (this.elements.firstNameInput) {
                    this.elements.firstNameInput.value = response.data.firstname || '';
                }
                if (this.elements.lastNameInput) {
                    this.elements.lastNameInput.value = response.data.lastname || '';
                }
                
                this.clearError('employeeId');
            } else {
                // Employee not found
                this.showError('employeeId', 'Employee not found');
                if (this.elements.firstNameInput) this.elements.firstNameInput.value = '';
                if (this.elements.lastNameInput) this.elements.lastNameInput.value = '';
                this.employeeData = null;
            }
        } catch (error) {
            console.error('Error looking up employee:', error);
            this.showError('employeeId', 'Error looking up employee');
            if (this.elements.firstNameInput) this.elements.firstNameInput.value = '';
            if (this.elements.lastNameInput) this.elements.lastNameInput.value = '';
            this.employeeData = null;
        }
    }
    
    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.accountId = urlParams.get('id');
        
        if (this.accountId) {
            this.isEditMode = true;
            this.elements.formTitle.textContent = 'Edit Employee Account';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Update Account';
            this.loadAccountData();
        } else {
            this.isEditMode = false;
            this.elements.formTitle.textContent = 'Add New Employee Account';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Save Account';
        }
    }
    
    async loadAccountData() {
        if (!this.accountId) return;
        
        try {
            this.showLoading();
            
            const response = await apiService.getAccount(this.accountId);
            
            if (response.success && response.data) {
                const account = response.data;
                
                // Fill form fields
                if (this.elements.employeeIdInput) {
                    this.elements.employeeIdInput.value = account.employee_id || '';
                }
                if (this.elements.firstNameInput) {
                    this.elements.firstNameInput.value = account.firstname || '';
                }
                if (this.elements.lastNameInput) {
                    this.elements.lastNameInput.value = account.lastname || '';
                }
                if (this.elements.accountEmailInput) {
                    this.elements.accountEmailInput.value = account.account_email || '';
                }
                if (this.elements.accountTypeSelect) {
                    this.elements.accountTypeSelect.value = account.account_type || '';
                }
                if (this.elements.accountStatusSelect) {
                    this.elements.accountStatusSelect.value = account.account_status || 'ACTIVE';
                }
                
                // Store employee data
                this.employeeData = {
                    employee_id: account.employee_id,
                    firstname: account.firstname,
                    lastname: account.lastname
                };
                
                // Make password optional in edit mode
                if (this.elements.accountPasswordInput) {
                    this.elements.accountPasswordInput.required = false;
                    this.elements.accountPasswordInput.placeholder = 'Leave blank to keep current password';
                }
            } else {
                this.showNotification('Account not found', 'error');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error loading account data:', error);
            this.showNotification('Error loading account data', 'error');
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
        
        // Email validation
        if (!this.validateEmail()) {
            isValid = false;
        }
        
        // Password validation (only required for new accounts)
        if (!this.isEditMode) {
            if (!this.validatePassword()) {
                isValid = false;
            }
        } else {
            // In edit mode, validate password only if provided
            const password = this.elements.accountPasswordInput?.value;
            if (password && !this.validatePassword()) {
                isValid = false;
            }
        }
        
        // Account type validation
        const accountType = this.elements.accountTypeSelect?.value;
        if (!accountType) {
            this.showError('accountType', 'Account type is required');
            isValid = false;
        }
        
        return isValid;
    }
    
    validateEmail() {
        const email = this.elements.accountEmailInput?.value?.trim();
        if (!email) {
            this.showError('accountEmail', 'Account email is required');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('accountEmail', 'Please enter a valid email address');
            return false;
        }
        
        this.clearError('accountEmail');
        return true;
    }
    
    validatePassword() {
        const password = this.elements.accountPasswordInput?.value;
        
        if (!this.isEditMode && !password) {
            this.showError('accountPassword', 'Password is required');
            return false;
        }
        
        if (password && password.length < 6) {
            this.showError('accountPassword', 'Password must be at least 6 characters long');
            return false;
        }
        
        this.clearError('accountPassword');
        return true;
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
            accountEmail: 'Account Email',
            accountPassword: 'Password',
            accountType: 'Account Type'
        };
        return labels[fieldName] || fieldName;
    }
    
    showError(fieldName, message) {
        const errorElement = document.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        // Add error class to input
        const inputElement = this.elements[fieldName + 'Input'] || this.elements[fieldName + 'Select'];
        if (inputElement) {
            inputElement.classList.add('is-invalid');
        }
    }
    
    clearError(fieldName) {
        const errorElement = document.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Remove error class from input
        const inputElement = this.elements[fieldName + 'Input'] || this.elements[fieldName + 'Select'];
        if (inputElement) {
            inputElement.classList.remove('is-invalid');
        }
    }
    
    clearAllErrors() {
        ['employeeId', 'accountEmail', 'accountPassword', 'accountType', 'accountStatus'].forEach(fieldName => {
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
                account_email: this.elements.accountEmailInput.value.trim(),
                account_type: this.elements.accountTypeSelect.value,
                account_status: this.elements.accountStatusSelect.value || 'ACTIVE'
            };
            
            // Add password only if provided (required for new, optional for edit)
            const password = this.elements.accountPasswordInput.value;
            if (!this.isEditMode || password) {
                formData.account_password = password;
            }
            
            let response;
            if (this.isEditMode) {
                response = await apiService.updateAccount(this.accountId, formData);
            } else {
                response = await apiService.createAccount(formData);
            }
            
            if (response.success) {
                this.showSuccessModal();
            } else {
                throw new Error(response.message || 'Error saving account');
            }
        } catch (error) {
            console.error('Error saving account:', error);
            this.showNotification(error.message || 'Error saving account', 'error');
        } finally {
            // Re-enable submit button
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.innerHTML = this.isEditMode 
                ? '<i class="fas fa-save btn-icon"></i> Update Account'
                : '<i class="fas fa-save btn-icon"></i> Save Account';
        }
    }
    
    showSuccessModal() {
        const message = this.isEditMode
            ? 'Employee account updated successfully!'
            : 'Employee account has been added successfully!';
        
        if (this.elements.successMessage) {
            this.elements.successMessage.textContent = message;
        }
        
        // Show/hide appropriate buttons based on mode
        if (this.elements.addBankingBtn) {
            this.elements.addBankingBtn.style.display = this.employeeData ? 'inline-flex' : 'none';
        }
        
        if (this.elements.createNewBtn) {
            this.elements.createNewBtn.style.display = this.isEditMode ? 'none' : 'inline-flex';
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
        
        // Clear name fields
        if (this.elements.firstNameInput) this.elements.firstNameInput.value = '';
        if (this.elements.lastNameInput) this.elements.lastNameInput.value = '';
        
        // Clear all errors
        this.clearAllErrors();
        
        // Reset to add mode
        this.isEditMode = false;
        this.accountId = null;
        this.elements.formTitle.textContent = 'Add New Employee Account';
        this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Save Account';
        
        // Make password required again
        if (this.elements.accountPasswordInput) {
            this.elements.accountPasswordInput.required = true;
            this.elements.accountPasswordInput.placeholder = '';
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
const accountFormPage = new AccountFormPage();
export default accountFormPage;