import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';

class EmployeeFormPage extends BasePage {
    constructor() {
        super();
        this.elements = {
            ...this.elements,
            form: document.getElementById('employeeForm'),
            employeeIdInput: document.getElementById('employee_id'),
            firstnameInput: document.getElementById('firstname'),
            lastnameInput: document.getElementById('lastname'),
            contactNumberInput: document.getElementById('contact_number'),
            emailInput: document.getElementById('email'),
            submitBtn: document.getElementById('submit-btn'),
            resetBtn: document.getElementById('reset-btn'),
            formTitle: document.getElementById('form-title'),
            successModal: document.getElementById('success-modal'),
            successMessage: document.getElementById('success-message'),
            successCloseBtn: document.getElementById('close-success-modal'),
            successReturnBtn: document.getElementById('back-to-list-btn'),
            successCreateAnotherBtn: document.getElementById('add-another-btn'),
            generateIdBtn: document.getElementById('generate-id-btn')
        };
        
        this.isEditMode = false;
        this.employeeId = null;
        
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
                e.preventDefault(); // Prevent default form submission
                e.stopPropagation(); // Stop event propagation
                
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
                e.preventDefault(); // Prevent default button behavior
                if (confirm('Are you sure you want to reset the form?')) {
                    this.resetForm();
                }
            });
        }
        
        // Generate ID button
        if (this.elements.generateIdBtn) {
            this.elements.generateIdBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                this.generateEmployeeId();
            });
        }
        
        // Success modal buttons
        if (this.elements.successModal) {
            if (this.elements.successCloseBtn) {
                this.elements.successCloseBtn.addEventListener('click', () => {
                    this.elements.successModal.classList.remove('show');
                });
            }
            
            if (this.elements.successReturnBtn) {
                this.elements.successReturnBtn.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
            
            if (this.elements.successCreateAnotherBtn) {
                this.elements.successCreateAnotherBtn.addEventListener('click', () => {
                    this.elements.successModal.classList.remove('show');
                    this.resetForm();
                });
            }
        }
    }
    
    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.employeeId = urlParams.get('id');
        
        if (this.employeeId) {
            this.isEditMode = true;
            this.elements.formTitle.textContent = 'Edit Employee';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Update Employee';
            this.loadEmployeeData();
            
            // Hide generate ID button in edit mode
            if (this.elements.generateIdBtn) {
                this.elements.generateIdBtn.style.display = 'none';
            }
        } else {
            this.isEditMode = false;
            this.elements.formTitle.textContent = 'Add New Employee';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Add Employee';
            this.generateEmployeeId();
        }
    }
    
    async generateEmployeeId() {
        try {
            const response = await apiService.getEmployees({
                sort_field: 'employee_id',
                sort_direction: 'desc',
                per_page: 1
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to generate employee ID');
            }

            let newId;
            if (response.data && response.data.length > 0) {
                const lastEmployee = response.data[0];
                const lastId = lastEmployee.employee_id;
                const currentYear = new Date().getFullYear().toString();
                
                // Extract the number part and increment it
                const numberPart = parseInt(lastId.slice(-5)) + 1;
                newId = currentYear + numberPart.toString().padStart(5, '0');
            } else {
                // If no employees exist, start with 00001
                const currentYear = new Date().getFullYear().toString();
                newId = currentYear + '00001';
            }

            this.elements.employeeIdInput.value = newId;
        } catch (error) {
            console.error('Error generating employee ID:', error);
            alert('Failed to generate employee ID. Please try again.');
        }
    }
    
    async loadEmployeeData() {
        try {
            this.showLoading();
            
            const response = await apiService.getEmployee(this.employeeId);
            
            if (response.success) {
                const employee = response.data;
                this.elements.employeeIdInput.value = employee.employee_id;
                this.elements.firstnameInput.value = employee.firstname;
                this.elements.lastnameInput.value = employee.lastname;
                this.elements.contactNumberInput.value = employee.contact_number || '';
                this.elements.emailInput.value = employee.email || '';
            } else {
                this.showNotification(response.message || 'Error loading employee data', 'error');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error loading employee data:', error);
            this.showNotification('Error loading employee data', 'error');
            window.location.href = 'index.html';
        } finally {
            this.hideLoading();
        }
    }
    
    async handleSubmit() {
        try {
            // Disable submit button immediately
            this.elements.submitBtn.disabled = true;
            this.elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            const formData = {
                employee_id: this.elements.employeeIdInput.value,
                firstname: this.elements.firstnameInput.value,
                lastname: this.elements.lastnameInput.value,
                contact_number: this.elements.contactNumberInput.value || null,
                email: this.elements.emailInput.value || null
            };
            
            let response;
            if (this.isEditMode) {
                response = await apiService.updateEmployee(this.employeeId, formData);
            } else {
                response = await apiService.createEmployee(formData);
            }
            
            if (response.success) {
                this.showSuccessModal();
            } else {
                throw new Error(response.message || 'Error saving employee');
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            this.showNotification(error.message || 'Error saving employee', 'error');
        } finally {
            // Re-enable submit button
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.innerHTML = this.isEditMode 
                ? '<i class="fas fa-save btn-icon"></i> Update Employee'
                : '<i class="fas fa-save btn-icon"></i> Add Employee';
        }
    }
    
    showSuccessModal() {
        const message = this.isEditMode
            ? 'Employee updated successfully'
            : 'Employee created successfully';
        
        this.elements.successMessage.textContent = message;
        this.elements.successModal.classList.add('show');
    }
    
    resetForm() {
        this.elements.form.reset();
        this.isEditMode = false;
        this.employeeId = null;
        this.elements.formTitle.textContent = 'Add New Employee';
        this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Add Employee';
        this.generateEmployeeId();
        
        // Show generate ID button
        if (this.elements.generateIdBtn) {
            this.elements.generateIdBtn.style.display = 'inline-block';
        }
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
const employeeFormPage = new EmployeeFormPage();
export default employeeFormPage; 