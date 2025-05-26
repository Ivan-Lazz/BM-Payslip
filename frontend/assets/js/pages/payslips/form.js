import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';
import payslipApiService from '../../services/payslips.js';

class PayslipFormPage extends BasePage {
    constructor() {
        super();
        this.elements = {
            ...this.elements,
            form: document.getElementById('payslipForm'),
            payslipIdInput: document.getElementById('payslip_id'),
            employeeIdSelect: document.getElementById('employee_id'),
            employeeFirstnameInput: document.getElementById('employee_firstname'),
            employeeLastnameInput: document.getElementById('employee_lastname'),
            bankAccountIdSelect: document.getElementById('bank_account_id'),
            bankNameInput: document.getElementById('bank_name'),
            bankAccountNumberInput: document.getElementById('bank_account_number'),
            bankAccountNameInput: document.getElementById('bank_account_name'),
            cutoffDateInput: document.getElementById('cutoff_date'),
            paymentDateInput: document.getElementById('payment_date'),
            salaryInput: document.getElementById('salary'),
            bonusInput: document.getElementById('bonus'),
            totalSalaryInput: document.getElementById('total_salary'),
            paymentStatusSelect: document.getElementById('payment_status'),
            personInChargeInput: document.getElementById('person_in_charge'),
            submitBtn: document.getElementById('submit-btn'),
            resetBtn: document.getElementById('reset-btn'),
            successModal: document.getElementById('success-modal'),
            agentPdfLink: document.getElementById('agent-pdf-link'),
            adminPdfLink: document.getElementById('admin-pdf-link'),
            newPayslipBtn: document.getElementById('new-payslip-btn'),
            viewPayslipsBtn: document.getElementById('view-payslips-btn'),
            closeSuccessModal: document.getElementById('close-success-modal')
        };
        
        this.isEditMode = false;
        this.payslipId = null;
        this.employees = [];
        this.bankingDetails = [];
        
        this.init();
    }

    async init() {
        await super.init();
        this.initializeEventListeners();
        this.checkEditMode();
        await this.loadEmployees();
        this.setDefaultValues();
        this.updatePreview();
    }

    initializeEventListeners() {
        // Form submission
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
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
        
        // Employee selection change
        if (this.elements.employeeIdSelect) {
            this.elements.employeeIdSelect.addEventListener('change', async () => {
                await this.handleEmployeeChange();
            });
        }
        
        // Bank account selection change
        if (this.elements.bankAccountIdSelect) {
            this.elements.bankAccountIdSelect.addEventListener('change', () => {
                this.handleBankAccountChange();
            });
        }
        
        // Salary and bonus input to calculate total
        if (this.elements.salaryInput) {
            this.elements.salaryInput.addEventListener('input', () => {
                this.calculateTotal();
                this.updatePreview();
            });
        }
        
        if (this.elements.bonusInput) {
            this.elements.bonusInput.addEventListener('input', () => {
                this.calculateTotal();
                this.updatePreview();
            });
        }
        
        // Other inputs for preview updates
        const previewInputs = [
            'paymentStatusSelect', 'personInChargeInput', 'paymentDateInput'
        ];
        
        previewInputs.forEach(inputKey => {
            if (this.elements[inputKey]) {
                const eventType = this.elements[inputKey].tagName.toLowerCase() === 'select' ? 'change' : 'input';
                this.elements[inputKey].addEventListener(eventType, () => {
                    this.updatePreview();
                });
            }
        });
        
        // Success modal buttons
        if (this.elements.closeSuccessModal) {
            this.elements.closeSuccessModal.addEventListener('click', () => {
                this.elements.successModal.classList.remove('show');
            });
        }
        
        if (this.elements.newPayslipBtn) {
            this.elements.newPayslipBtn.addEventListener('click', () => {
                this.elements.successModal.classList.remove('show');
                this.resetForm();
            });
        }
        
        if (this.elements.viewPayslipsBtn) {
            this.elements.viewPayslipsBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }

    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.payslipId = urlParams.get('id');
        
        if (this.payslipId) {
            this.isEditMode = true;
            document.querySelector('.page-title').textContent = 'Edit Payslip';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Update Payslip';
            this.loadPayslipData();
        } else {
            this.isEditMode = false;
            document.querySelector('.page-title').textContent = 'Generate Payslip';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Generate Payslip';
        }
    }

    setDefaultValues() {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        if (this.elements.paymentDateInput && !this.elements.paymentDateInput.value) {
            this.elements.paymentDateInput.value = today;
        }
        if (this.elements.cutoffDateInput && !this.elements.cutoffDateInput.value) {
            this.elements.cutoffDateInput.value = today;
        }
        
        // Set person in charge to current user
        const userData = this.authService.getUser();
        if (userData && this.elements.personInChargeInput && !this.elements.personInChargeInput.value) {
            const fullName = `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || userData.username;
            this.elements.personInChargeInput.value = fullName;
        }
        
        // Set default bonus to 0
        if (this.elements.bonusInput && !this.elements.bonusInput.value) {
            this.elements.bonusInput.value = '0';
        }
    }

    async loadEmployees() {
        try {
            const response = await payslipApiService.getEmployeesForPayslip();
            
            if (response.success && this.elements.employeeIdSelect) {
                this.employees = response.data || [];
                this.elements.employeeIdSelect.innerHTML = '<option value="">Select Employee</option>';
                
                this.employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.employee_id;
                    option.textContent = `${employee.firstname} ${employee.lastname} (${employee.employee_id})`;
                    option.dataset.firstname = employee.firstname;
                    option.dataset.lastname = employee.lastname;
                    this.elements.employeeIdSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            this.showNotification('Error loading employees', 'error');
        }
    }

    // Updated handleEmployeeChange method with better error handling
    async handleEmployeeChange() {
        const employeeId = this.elements.employeeIdSelect.value;
        const selectedOption = this.elements.employeeIdSelect.options[this.elements.employeeIdSelect.selectedIndex];
        
        // Clear bank account dropdown first
        if (this.elements.bankAccountIdSelect) {
            this.elements.bankAccountIdSelect.innerHTML = '<option value="">Select Bank Account</option>';
        }
        
        // Reset bank details
        this.clearBankDetails();
        
        if (employeeId) {
            try {
                // Set employee name fields
                if (this.elements.employeeFirstnameInput) {
                    this.elements.employeeFirstnameInput.value = selectedOption.dataset.firstname || '';
                }
                if (this.elements.employeeLastnameInput) {
                    this.elements.employeeLastnameInput.value = selectedOption.dataset.lastname || '';
                }
                
                // Load banking details for selected employee
                await this.loadBankingDetails(employeeId);
            } catch (error) {
                console.error('Error in handleEmployeeChange:', error);
                this.showNotification('Error loading employee data', 'error');
            }
        } else {
            // Clear employee name fields
            if (this.elements.employeeFirstnameInput) {
                this.elements.employeeFirstnameInput.value = '';
            }
            if (this.elements.employeeLastnameInput) {
                this.elements.employeeLastnameInput.value = '';
            }
        }
        
        this.updatePreview();
    }

    // Updated loadBankingDetails method with duplicate prevention
    async loadBankingDetails(employeeId) {
        try {
            console.log('Loading banking details for employee:', employeeId);
            const response = await payslipApiService.getBankingDetailsForEmployee(employeeId);
            console.log('Banking details response:', response);
            
            if (response.success && response.data.length > 0 && this.elements.bankAccountIdSelect) {
                // Clear existing options first
                this.elements.bankAccountIdSelect.innerHTML = '<option value="">Select Bank Account</option>';
                
                // Remove duplicates using Map to track unique combinations
                const uniqueBankingDetails = new Map();
                
                response.data.forEach(account => {
                    // Create a unique key based on account details
                    const uniqueKey = `${account.id}-${account.bank_account_number}-${account.preferred_bank}`;
                    
                    // Only add if not already exists
                    if (!uniqueBankingDetails.has(uniqueKey)) {
                        uniqueBankingDetails.set(uniqueKey, account);
                    }
                });
                
                // Convert back to array and store
                this.bankingDetails = Array.from(uniqueBankingDetails.values());
                console.log('Unique banking details:', this.bankingDetails);
                
                // Populate select options with unique data
                this.bankingDetails.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = `${account.preferred_bank} - ${account.bank_account_number}`;
                    option.dataset.bankName = account.preferred_bank;
                    option.dataset.accountNumber = account.bank_account_number;
                    option.dataset.accountName = account.bank_account_name;
                    this.elements.bankAccountIdSelect.appendChild(option);
                });
                
                // If only one bank account, select it automatically
                if (this.bankingDetails.length === 1) {
                    this.elements.bankAccountIdSelect.value = this.bankingDetails[0].id;
                    this.handleBankAccountChange();
                }
            } else if (response.success && response.data.length === 0) {
                this.showNotification('No banking details found for this employee', 'warning');
            } else {
                throw new Error(response.message || 'Failed to load banking details');
            }
        } catch (error) {
            console.error('Error loading banking details:', error);
            this.showNotification('Error loading banking details', 'error');
            
            // Clear bank account dropdown on error
            if (this.elements.bankAccountIdSelect) {
                this.elements.bankAccountIdSelect.innerHTML = '<option value="">Select Bank Account</option>';
            }
        }
    }

    handleBankAccountChange() {
        const selectedOption = this.elements.bankAccountIdSelect.options[this.elements.bankAccountIdSelect.selectedIndex];
        
        if (selectedOption.value) {
            // Set bank details fields
            if (this.elements.bankNameInput) {
                this.elements.bankNameInput.value = selectedOption.dataset.bankName || '';
            }
            if (this.elements.bankAccountNumberInput) {
                this.elements.bankAccountNumberInput.value = selectedOption.dataset.accountNumber || '';
            }
            if (this.elements.bankAccountNameInput) {
                this.elements.bankAccountNameInput.value = selectedOption.dataset.accountName || '';
            }
        } else {
            this.clearBankDetails();
        }
        
        this.updatePreview();
    }

    clearBankDetails() {
        if (this.elements.bankNameInput) {
            this.elements.bankNameInput.value = '';
        }
        if (this.elements.bankAccountNumberInput) {
            this.elements.bankAccountNumberInput.value = '';
        }
        if (this.elements.bankAccountNameInput) {
            this.elements.bankAccountNameInput.value = '';
        }
    }

    calculateTotal() {
        const salary = parseFloat(this.elements.salaryInput?.value) || 0;
        const bonus = parseFloat(this.elements.bonusInput?.value) || 0;
        const total = salary + bonus;
        
        if (this.elements.totalSalaryInput) {
            this.elements.totalSalaryInput.value = total.toFixed(2);
        }
    }

    updatePreview() {
        // Update employee info
        const employeeName = `${this.elements.employeeFirstnameInput?.value || ''} ${this.elements.employeeLastnameInput?.value || ''}`.trim();
        this.updatePreviewElement('preview-employee-name', employeeName || '-');
        this.updatePreviewElement('preview-employee-id', this.elements.employeeIdSelect?.value || '-');
        
        // Update bank info
        this.updatePreviewElement('preview-bank-name', this.elements.bankNameInput?.value || '-');
        this.updatePreviewElement('preview-account-number', this.elements.bankAccountNumberInput?.value || '-');
        this.updatePreviewElement('preview-account-name', this.elements.bankAccountNameInput?.value || '-');
        
        // Update payment info
        this.updatePreviewElement('preview-person-in-charge', this.elements.personInChargeInput?.value || '-');
        this.updatePreviewElement('preview-payment-status', this.elements.paymentStatusSelect?.value || '-');
        
        // Update payment date
        if (this.elements.paymentDateInput?.value) {
            const date = new Date(this.elements.paymentDateInput.value);
            this.updatePreviewElement('preview-payment-date', date.toLocaleDateString());
        } else {
            this.updatePreviewElement('preview-payment-date', '-');
        }
        
        // Update amounts
        const salary = parseFloat(this.elements.salaryInput?.value) || 0;
        const bonus = parseFloat(this.elements.bonusInput?.value) || 0;
        const total = salary + bonus;
        
        this.updatePreviewElement('preview-salary', this.formatCurrency(salary));
        this.updatePreviewElement('preview-bonus', this.formatCurrency(bonus));
        this.updatePreviewElement('preview-total-salary', this.formatCurrency(total));
    }

    updatePreviewElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatCurrency(amount) {
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    async loadPayslipData() {
        try {
            this.showLoading();
            
            const response = await payslipApiService.getPayslip(this.payslipId);
            
            if (response.success) {
                const payslip = response.data;
                
                // Set form fields
                if (this.elements.payslipIdInput) {
                    this.elements.payslipIdInput.value = payslip.id;
                }
                
                // Set employee
                if (this.elements.employeeIdSelect) {
                    this.elements.employeeIdSelect.value = payslip.employee_id;
                    await this.handleEmployeeChange();
                }
                
                // Set bank account (with delay to allow banking details to load)
                setTimeout(() => {
                    if (this.elements.bankAccountIdSelect) {
                        this.elements.bankAccountIdSelect.value = payslip.bank_account_id;
                        this.handleBankAccountChange();
                    }
                }, 1000);
                
                // Set other fields
                if (this.elements.salaryInput) {
                    this.elements.salaryInput.value = payslip.salary;
                }
                if (this.elements.bonusInput) {
                    this.elements.bonusInput.value = payslip.bonus;
                }
                if (this.elements.personInChargeInput) {
                    this.elements.personInChargeInput.value = payslip.person_in_charge;
                }
                if (this.elements.paymentStatusSelect) {
                    this.elements.paymentStatusSelect.value = payslip.payment_status;
                }
                
                // Format dates
                if (payslip.cutoff_date && this.elements.cutoffDateInput) {
                    this.elements.cutoffDateInput.value = new Date(payslip.cutoff_date).toISOString().split('T')[0];
                }
                if (payslip.payment_date && this.elements.paymentDateInput) {
                    this.elements.paymentDateInput.value = new Date(payslip.payment_date).toISOString().split('T')[0];
                }
                
                // Calculate total and update preview
                this.calculateTotal();
                this.updatePreview();
            } else {
                this.showNotification(response.message || 'Error loading payslip data', 'error');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error loading payslip data:', error);
            this.showNotification('Error loading payslip data', 'error');
            window.location.href = 'index.html';
        } finally {
            this.hideLoading();
        }
    }

    async handleSubmit() {
        try {
            // Disable submit button
            this.elements.submitBtn.disabled = true;
            this.elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Validate required fields
            if (!this.validateForm()) {
                return;
            }
            
            // Prepare data
            const payslipData = {
                employee_id: this.elements.employeeIdSelect.value,
                bank_account_id: this.elements.bankAccountIdSelect.value,
                salary: parseFloat(this.elements.salaryInput.value),
                bonus: parseFloat(this.elements.bonusInput.value) || 0,
                cutoff_date: this.elements.cutoffDateInput.value,
                payment_date: this.elements.paymentDateInput.value,
                payment_status: this.elements.paymentStatusSelect.value,
                person_in_charge: this.elements.personInChargeInput.value
            };
            
            let response;
            if (this.isEditMode) {
                response = await apiService.updatePayslip(this.payslipId, payslipData);
            } else {
                response = await apiService.createPayslip(payslipData);
            }
            
            if (response.success) {
                // Set PDF links
                if (this.elements.agentPdfLink && response.data.agent_pdf_path) {
                    this.elements.agentPdfLink.href = response.data.agent_pdf_path;
                }
                if (this.elements.adminPdfLink && response.data.admin_pdf_path) {
                    this.elements.adminPdfLink.href = response.data.admin_pdf_path;
                }
                
                // Show success modal
                this.elements.successModal.classList.add('show');
            } else {
                throw new Error(response.message || 'Error saving payslip');
            }
        } catch (error) {
            console.error('Error saving payslip:', error);
            this.showNotification(error.message || 'Error saving payslip', 'error');
        } finally {
            // Re-enable submit button
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.innerHTML = this.isEditMode 
                ? '<i class="fas fa-save btn-icon"></i> Update Payslip'
                : '<i class="fas fa-save btn-icon"></i> Generate Payslip';
        }
    }

    validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
        });
        
        // Clear field styling
        document.querySelectorAll('.form-input, .form-select').forEach(field => {
            field.classList.remove('is-invalid');
        });
        
        // Validate required fields
        const requiredFields = [
            { element: this.elements.employeeIdSelect, name: 'employee_id', label: 'Employee' },
            { element: this.elements.bankAccountIdSelect, name: 'bank_account_id', label: 'Bank Account' },
            { element: this.elements.cutoffDateInput, name: 'cutoff_date', label: 'Cutoff Date' },
            { element: this.elements.paymentDateInput, name: 'payment_date', label: 'Payment Date' },
            { element: this.elements.salaryInput, name: 'salary', label: 'Salary' },
            { element: this.elements.paymentStatusSelect, name: 'payment_status', label: 'Payment Status' },
            { element: this.elements.personInChargeInput, name: 'person_in_charge', label: 'Person In Charge' }
        ];
        
        requiredFields.forEach(field => {
            if (!field.element || !field.element.value.trim()) {
                isValid = false;
                if (field.element) {
                    field.element.classList.add('is-invalid');
                }
                const errorElement = document.getElementById(`${field.name}-error`);
                if (errorElement) {
                    errorElement.textContent = `${field.label} is required`;
                }
            }
        });
        
        // Validate salary is a valid number
        if (this.elements.salaryInput && this.elements.salaryInput.value) {
            const salary = parseFloat(this.elements.salaryInput.value);
            if (isNaN(salary) || salary < 0) {
                isValid = false;
                this.elements.salaryInput.classList.add('is-invalid');
                const errorElement = document.getElementById('salary-error');
                if (errorElement) {
                    errorElement.textContent = 'Please enter a valid salary amount';
                }
            }
        }
        
        // Validate bonus is a valid number (if provided)
        if (this.elements.bonusInput && this.elements.bonusInput.value) {
            const bonus = parseFloat(this.elements.bonusInput.value);
            if (isNaN(bonus) || bonus < 0) {
                isValid = false;
                this.elements.bonusInput.classList.add('is-invalid');
                const errorElement = document.getElementById('bonus-error');
                if (errorElement) {
                    errorElement.textContent = 'Please enter a valid bonus amount';
                }
            }
        }
        
        if (!isValid) {
            this.showNotification('Please fix the errors in the form', 'error');
        }
        
        return isValid;
    }

    resetForm() {
        if (this.elements.form) {
            this.elements.form.reset();
        }
        
        this.isEditMode = false;
        this.payslipId = null;
        
        document.querySelector('.page-title').textContent = 'Generate Payslip';
        this.elements.submitBtn.innerHTML = '<i class="fas fa-save btn-icon"></i> Generate Payslip';
        
        // Clear bank account dropdown
        if (this.elements.bankAccountIdSelect) {
            this.elements.bankAccountIdSelect.innerHTML = '<option value="">Select Bank Account</option>';
        }
        
        // Clear error styling
        document.querySelectorAll('.form-input, .form-select').forEach(field => {
            field.classList.remove('is-invalid');
        });
        
        document.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
        });
        
        // Reset defaults
        this.setDefaultValues();
        this.updatePreview();
    }

    showLoading() {
        if (this.elements.form) {
            this.elements.form.style.opacity = '0.6';
            this.elements.form.style.pointerEvents = 'none';
        }
    }

    hideLoading() {
        if (this.elements.form) {
            this.elements.form.style.opacity = '1';
            this.elements.form.style.pointerEvents = 'auto';
        }
    }
    // Additional method to check for duplicates in debugging
    debugBankingData(data) {
        console.group('Banking Data Debug');
        console.log('Raw data length:', data.length);
        
        // Check for duplicate IDs
        const ids = data.map(item => item.id);
        const uniqueIds = [...new Set(ids)];
        console.log('Unique IDs count:', uniqueIds.length);
        
        if (ids.length !== uniqueIds.length) {
            console.warn('Duplicate IDs found!');
            const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
            console.log('Duplicate IDs:', [...new Set(duplicateIds)]);
        }
        
        // Check for duplicate account numbers
        const accountNumbers = data.map(item => item.bank_account_number);
        const uniqueAccountNumbers = [...new Set(accountNumbers)];
        console.log('Unique account numbers:', uniqueAccountNumbers.length);
        
        if (accountNumbers.length !== uniqueAccountNumbers.length) {
            console.warn('Duplicate account numbers found!');
        }
        
        console.groupEnd();
    }
}

// Create and export page instance
const payslipFormPage = new PayslipFormPage();
export default payslipFormPage;