/**
 * Form validation utility
 */
class FormValidator {
    constructor() {
        this.errors = {};
    }
    
    /**
     * Validate a form field
     * 
     * @param {HTMLElement} inputElement DOM input element
     * @param {string} fieldName Field name for error messages
     * @param {string} rules Validation rules separated by pipes (e.g., 'required|email|min:8')
     * @param {HTMLElement} errorElement Optional custom error element
     * @returns {boolean} Whether the field is valid
     */
    validate(inputElement, fieldName, rules, errorElement = null) {
        // Clear previous errors for this field
        this.errors[fieldName] = [];
        
        // Reset field styling
        inputElement.classList.remove('is-invalid');
        
        // Get error display element
        const errorDisplay = errorElement || document.getElementById(`${fieldName}-error`);
        if (errorDisplay) {
            errorDisplay.textContent = '';
        }
        
        // Get field value
        const value = inputElement.value;
        
        // Split rules and validate
        const ruleSet = rules.split('|');
        
        for (const rule of ruleSet) {
            // Check if rule has parameters
            const [ruleName, ruleParam] = rule.includes(':') 
                ? rule.split(':') 
                : [rule, null];
                
            // Apply validation rule
            let isValid = true;
            let errorMessage = '';
            
            switch (ruleName) {
                case 'required':
                    isValid = value.trim() !== '';
                    errorMessage = 'This field is required';
                    break;
                    
                case 'email':
                    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                    errorMessage = 'Please enter a valid email address';
                    break;
                    
                case 'minLength':
                    isValid = value.length >= parseInt(ruleParam);
                    errorMessage = `Must be at least ${ruleParam} characters`;
                    break;
                    
                case 'maxLength':
                    isValid = value.length <= parseInt(ruleParam);
                    errorMessage = `Must be no more than ${ruleParam} characters`;
                    break;
                    
                case 'numeric':
                    isValid = /^[0-9]+$/.test(value);
                    errorMessage = 'Please enter a numeric value';
                    break;
                    
                case 'decimal':
                    isValid = /^[0-9]+(\.[0-9]+)?$/.test(value);
                    errorMessage = 'Please enter a valid number';
                    break;
                    
                case 'pattern':
                    isValid = new RegExp(ruleParam).test(value);
                    errorMessage = 'Please enter a valid value';
                    break;
                    
                case 'match':
                    const matchElement = document.getElementById(ruleParam);
                    isValid = matchElement && value === matchElement.value;
                    errorMessage = 'Values do not match';
                    break;
                    
                case 'date':
                    isValid = !isNaN(Date.parse(value));
                    errorMessage = 'Please enter a valid date';
                    break;
                    
                case 'phone':
                    isValid = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value);
                    errorMessage = 'Please enter a valid phone number';
                    break;
                    
                case 'password':
                    // At least 8 characters, one uppercase letter, one lowercase letter, one number
                    isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
                    errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, and number';
                    break;
            }
            
            // Handle empty fields for non-required fields
            if (ruleName !== 'required' && value.trim() === '') {
                isValid = true;
            }
            
            // If validation failed, add error
            if (!isValid) {
                if (!this.errors[fieldName]) {
                    this.errors[fieldName] = [];
                }
                
                this.errors[fieldName].push(errorMessage);
                
                // Update UI
                inputElement.classList.add('is-invalid');
                if (errorDisplay) {
                    errorDisplay.textContent = errorMessage;
                }
                
                // No need to check other rules if this one failed
                break;
            }
        }
        
        // Return true if field is valid
        return !this.errors[fieldName] || this.errors[fieldName].length === 0;
    }
    
    /**
     * Check if any validation errors exist
     * 
     * @returns {boolean} Whether there are validation errors
     */
    hasErrors() {
        return Object.keys(this.errors).some(field => 
            this.errors[field] && this.errors[field].length > 0
        );
    }
    
    /**
     * Get all validation errors
     * 
     * @returns {Object} Object with field names as keys and error arrays as values
     */
    getErrors() {
        return this.errors;
    }
    
    /**
     * Create a validation function for a specific field
     * 
     * @param {string} fieldName Field name for error messages
     * @param {string} rules Validation rules separated by pipes
     * @returns {Function} Function that takes a value and returns whether it's valid
     */
    createValidator(fieldName, rules) {
        return (value) => {
            const dummyInput = { value };
            return this.validate(dummyInput, fieldName, rules);
        };
    }
    
    /**
     * Setup form validation for all inputs with data-validate attribute
     * 
     * @param {HTMLFormElement} formElement Form element
     * @returns {FormValidator} This instance for chaining
     */
    setupFormValidation(formElement) {
        const inputs = formElement.querySelectorAll('[data-validate]');
        
        inputs.forEach(input => {
            const fieldName = input.id || input.name;
            const rules = input.dataset.validate;
            
            // Add validation on blur
            input.addEventListener('blur', () => {
                this.validate(input, fieldName, rules);
            });
            
            // Add validation on input to clear errors when fixed
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    this.validate(input, fieldName, rules);
                }
            });
        });
        
        // Setup form submission validation
        formElement.addEventListener('submit', (e) => {
            let isValid = true;
            
            inputs.forEach(input => {
                const fieldName = input.id || input.name;
                const rules = input.dataset.validate;
                
                if (!this.validate(input, fieldName, rules)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
        
        return this;
    }
}