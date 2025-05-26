import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';

class UserFormPage extends BasePage {
    constructor() {
        super();
        this.elements = {
            ...this.elements,
            form: document.getElementById('userForm'),
            firstNameInput: document.getElementById('firstName'),
            lastNameInput: document.getElementById('lastName'),
            emailInput: document.getElementById('email'),
            usernameInput: document.getElementById('username'),
            passwordInput: document.getElementById('password'),
            confirmPasswordInput: document.getElementById('confirmPassword'),
            roleSelect: document.getElementById('role'),
            statusSelect: document.getElementById('status'),
            submitBtn: document.getElementById('submitBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            formTitle: document.getElementById('form-title'),
            successModal: document.getElementById('success-modal'),
            successMessage: document.getElementById('success-message'),
            closeSuccessModal: document.getElementById('close-success-modal'),
            returnListBtn: document.getElementById('return-list-btn'),
            createNewBtn: document.getElementById('create-new-btn')
        };
        
        this.isEditMode = false;
        this.userId = null;
        
        this.init();
    }
    
    async init() {
        await super.init();
        this.initializeEventListeners();
        this.checkEditMode();
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
        
        // Cancel button
        if (this.elements.cancelBtn) {
            this.elements.cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
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
            
            if (this.elements.createNewBtn) {
                this.elements.createNewBtn.addEventListener('click', () => {
                    this.elements.successModal.classList.remove('show');
                    this.resetForm();
                });
            }
        }
        
        // Real-time validation
        this.setupRealTimeValidation();
    }
    
    setupRealTimeValidation() {
        // Required field validation
        ['firstName', 'lastName', 'email', 'username', 'password', 'confirmPassword'].forEach(fieldName => {
            const element = this.elements[fieldName + 'Input'];
            if (element) {
                element.addEventListener('blur', () => {
                    this.validateField(fieldName);
                });
                
                element.addEventListener('input', () => {
                    this.clearError(fieldName);
                });
            }
        });
        
        // Password confirmation validation
        if (this.elements.confirmPasswordInput) {
            this.elements.confirmPasswordInput.addEventListener('input', () => {
                this.validatePasswordConfirmation();
            });
        }
    }
    
    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.userId = urlParams.get('id');
        
        if (this.userId) {
            this.isEditMode = true;
            this.elements.formTitle.textContent = 'Edit User';
            this.elements.submitBtn.textContent = 'Update User';
            this.loadUserData();
            
            // Make password optional in edit mode
            if (this.elements.passwordInput) {
                this.elements.passwordInput.required = false;
                this.elements.passwordInput.placeholder = 'Leave blank to keep current password';
            }
            if (this.elements.confirmPasswordInput) {
                this.elements.confirmPasswordInput.required = false;
                this.elements.confirmPasswordInput.placeholder = 'Leave blank to keep current password';
            }
        } else {
            this.isEditMode = false;
            this.elements.formTitle.textContent = 'Add New User';
            this.elements.submitBtn.textContent = 'Save User';
        }
    }
    
    async loadUserData() {
        if (!this.userId) return;
        
        try {
            this.showLoading();
            
            const response = await apiService.getUser(this.userId);
            
            if (response.success && response.data) {
                const user = response.data;
                
                // Fill form fields
                if (this.elements.firstNameInput) {
                    this.elements.firstNameInput.value = user.firstname || '';
                }
                if (this.elements.lastNameInput) {
                    this.elements.lastNameInput.value = user.lastname || '';
                }
                if (this.elements.emailInput) {
                    this.elements.emailInput.value = user.email || '';
                }
                if (this.elements.usernameInput) {
                    this.elements.usernameInput.value = user.username || '';
                    // Disable username field in edit mode to prevent conflicts
                    this.elements.usernameInput.disabled = true;
                }
                if (this.elements.roleSelect) {
                    this.elements.roleSelect.value = user.role || 'user';
                }
                if (this.elements.statusSelect) {
                    this.elements.statusSelect.value = user.status || 'active';
                }
            } else {
                this.showNotification('User not found', 'error');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showNotification('Error loading user data', 'error');
            window.location.href = 'index.html';
        } finally {
            this.hideLoading();
        }
    }
    
    validateForm() {
        let isValid = true;
        
        // Clear previous errors
        this.clearAllErrors();
        
        // First name validation
        if (!this.validateField('firstName')) {
            isValid = false;
        }
        
        // Last name validation
        if (!this.validateField('lastName')) {
            isValid = false;
        }
        
        // Email validation
        if (!this.validateField('email')) {
            isValid = false;
        }
        
        // Username validation (only for new users)
        if (!this.isEditMode && !this.validateField('username')) {
            isValid = false;
        }
        
        // Password validation
        if (!this.isEditMode && !this.validateField('password')) {
            isValid = false;
        } else if (this.isEditMode) {
            // In edit mode, validate password only if provided
            const password = this.elements.passwordInput?.value;
            if (password && !this.validateField('password')) {
                isValid = false;
            }
        }
        
        // Password confirmation validation
        if (!this.validatePasswordConfirmation()) {
            isValid = false;
        }
        
        return isValid;
    }
    
    validateField(fieldName) {
        const element = this.elements[fieldName + 'Input'];
        if (!element) return true;
        
        const value = element.value.trim();
        
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!value) {
                    this.showError(fieldName, `${this.getFieldLabel(fieldName)} is required`);
                    return false;
                }
                break;
                
            case 'email':
                if (!value) {
                    this.showError(fieldName, 'Email is required');
                    return false;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.showError(fieldName, 'Please enter a valid email address');
                    return false;
                }
                break;
                
            case 'username':
                if (!value) {
                    this.showError(fieldName, 'Username is required');
                    return false;
                }
                if (value.length < 3) {
                    this.showError(fieldName, 'Username must be at least 3 characters long');
                    return false;
                }
                break;
                
            case 'password':
                if (!this.isEditMode && !value) {
                    this.showError(fieldName, 'Password is required');
                    return false;
                }
                if (value && value.length < 6) {
                    this.showError(fieldName, 'Password must be at least 6 characters long');
                    return false;
                }
                break;
        }
        
        this.clearError(fieldName);
        return true;
    }
    
    validatePasswordConfirmation() {
        const password = this.elements.passwordInput?.value;
        const confirmPassword = this.elements.confirmPasswordInput?.value;
        
        // Only validate if both fields have values or if we're in create mode
        if (!this.isEditMode || (password || confirmPassword)) {
            if (password !== confirmPassword) {
                this.showError('confirmPassword', 'Passwords do not match');
                return false;
            }
        }
        
        this.clearError('confirmPassword');
        return true;
    }
    
    getFieldLabel(fieldName) {
        const labels = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            username: 'Username',
            password: 'Password'
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
        ['firstName', 'lastName', 'email', 'username', 'password', 'confirmPassword'].forEach(fieldName => {
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
                firstname: this.elements.firstNameInput.value.trim(),
                lastname: this.elements.lastNameInput.value.trim(),
                email: this.elements.emailInput.value.trim(),
                username: this.elements.usernameInput.value.trim(),
                role: this.elements.roleSelect.value,
                status: this.elements.statusSelect.value
            };
            
            // Add password only if provided (required for new, optional for edit)
            const password = this.elements.passwordInput.value;
            if (!this.isEditMode || password) {
                formData.password = password;
            }
            
            let response;
            if (this.isEditMode) {
                response = await apiService.updateUser(this.userId, formData);
            } else {
                response = await apiService.createUser(formData);
            }
            
            if (response.success) {
                this.showSuccessModal();
            } else {
                throw new Error(response.message || 'Error saving user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            this.showNotification(error.message || 'Error saving user', 'error');
        } finally {
            // Re-enable submit button
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.innerHTML = this.isEditMode ? 'Update User' : 'Save User';
        }
    }
    
    showSuccessModal() {
        const message = this.isEditMode
            ? 'User updated successfully!'
            : 'User has been added successfully!';
        
        if (this.elements.successMessage) {
            this.elements.successMessage.textContent = message;
        }
        
        // Show/hide appropriate buttons based on mode
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
        
        // Clear all errors
        this.clearAllErrors();
        
        // Reset to add mode
        this.isEditMode = false;
        this.userId = null;
        this.elements.formTitle.textContent = 'Add New User';
        this.elements.submitBtn.innerHTML = 'Save User';
        
        // Make password required again
        if (this.elements.passwordInput) {
            this.elements.passwordInput.required = true;
            this.elements.passwordInput.placeholder = '';
        }
        if (this.elements.confirmPasswordInput) {
            this.elements.confirmPasswordInput.required = true;
            this.elements.confirmPasswordInput.placeholder = '';
        }
        
        // Enable username field
        if (this.elements.usernameInput) {
            this.elements.usernameInput.disabled = false;
        }
        
        // Clear URL parameters
        const url = new URL(window.location);
        url.searchParams.delete('id');
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
const userFormPage = new UserFormPage();
export default userFormPage;