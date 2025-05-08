/**
 * Utility functions for the PaySlip Generator application
 */

/**
 * Format a date string
 * @param {string} dateString - The date string to format
 * @param {string} format - The format to use
 * @returns {string} The formatted date
 */
function formatDate(dateString, format = 'MEDIUM') {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return '';
    }
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    // Pad single digits with leading zero
    const pad = (num) => num.toString().padStart(2, '0');
    
    // Month names
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthNamesShort = monthNames.map(name => name.substring(0, 3));
    
    switch (format) {
        case 'SHORT':
            return `${pad(month)}/${pad(day)}/${year}`;
        case 'MEDIUM':
            return `${monthNamesShort[month - 1]} ${day}, ${year}`;
        case 'LONG':
            return `${monthNames[month - 1]} ${day}, ${year}`;
        case 'WITH_TIME':
            return `${monthNames[month - 1]} ${day}, ${year} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        default:
            return `${pad(month)}/${pad(day)}/${year}`;
    }
}

/**
 * Format a currency value
 * @param {number} value - The value to format
 * @param {string} currency - The currency code
 * @returns {string} The formatted currency value
 */
function formatCurrency(value, currency = 'PHP') {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
    }
    
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(value);
}

/**
 * Show an alert message
 * @param {string} message - The message to display
 * @param {string} type - The alert type (success, danger, warning)
 * @param {HTMLElement} container - The container element
 * @param {number} timeout - The timeout in ms before auto-dismissing
 */
function showAlert(message, type = 'success', container, timeout = 5000) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.innerHTML = `
        <i class="alert-icon fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
        <div>${message}</div>
    `;
    
    // Add the alert to the container
    container.prepend(alertElement);
    
    // Auto-dismiss after timeout
    if (timeout > 0) {
        setTimeout(() => {
            alertElement.style.opacity = '0';
            setTimeout(() => {
                alertElement.remove();
            }, 300);
        }, timeout);
    }
}

/**
 * Create a loading spinner
 * @param {string} text - The loading text
 * @returns {HTMLElement} The loading element
 */
function createLoadingSpinner(text = 'Loading...') {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-container';
    loadingElement.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">${text}</div>
    `;
    return loadingElement;
}

/**
 * Show a loading spinner
 * @param {HTMLElement} container - The container element
 * @param {string} text - The loading text
 * @returns {HTMLElement} The loading element
 */
function showLoading(container, text = 'Loading...') {
    const loadingElement = createLoadingSpinner(text);
    container.innerHTML = '';
    container.appendChild(loadingElement);
    return loadingElement;
}

/**
 * Hide a loading spinner
 * @param {HTMLElement} loadingElement - The loading element
 */
function hideLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement);
    }
}

/**
 * Create pagination controls
 * @param {Object} paginationData - The pagination data
 * @param {Function} onPageChange - The page change callback
 * @returns {HTMLElement} The pagination element
 */
function createPagination(paginationData, onPageChange) {
    const { current_page, total, per_page } = paginationData;
    const totalPages = Math.ceil(total / per_page);
    
    const paginationElement = document.createElement('div');
    paginationElement.className = 'pagination';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `pagination-button ${current_page === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = current_page === 1;
    prevButton.addEventListener('click', () => {
        if (current_page > 1) {
            onPageChange(current_page - 1);
        }
    });
    paginationElement.appendChild(prevButton);
    
    // Page buttons
    const maxPageButtons = 5;
    let startPage = Math.max(1, current_page - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-button ${i === current_page ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            if (i !== current_page) {
                onPageChange(i);
            }
        });
        paginationElement.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `pagination-button ${current_page === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = current_page === totalPages;
    nextButton.addEventListener('click', () => {
        if (current_page < totalPages) {
            onPageChange(current_page + 1);
        }
    });
    paginationElement.appendChild(nextButton);
    
    return paginationElement;
}

/**
 * Validate a form
 * @param {HTMLFormElement} form - The form element
 * @param {Object} validationRules - The validation rules
 * @returns {Object} The validation result
 */
function validateForm(form, validationRules) {
    const formData = new FormData(form);
    const data = {};
    const errors = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Apply validation rules
    for (const field in validationRules) {
        const rules = validationRules[field];
        
        // Required rule
        if (rules.includes('required') && !data[field]) {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required`;
            continue;
        }
        
        // Skip other validations if field is empty and not required
        if (!data[field]) {
            continue;
        }
        
        // Email rule
        if (rules.includes('email') && !isValidEmail(data[field])) {
            errors[field] = 'Please enter a valid email address';
        }
        
        // Numeric rule
        if (rules.includes('numeric') && isNaN(data[field])) {
            errors[field] = 'Please enter a valid number';
        }
        
        // Min length rule
        const minRule = rules.find(rule => rule.startsWith('min:'));
        if (minRule) {
            const minLength = parseInt(minRule.split(':')[1]);
            if (data[field].length < minLength) {
                errors[field] = `Please enter at least ${minLength} characters`;
            }
        }
        
        // Max length rule
        const maxRule = rules.find(rule => rule.startsWith('max:'));
        if (maxRule) {
            const maxLength = parseInt(maxRule.split(':')[1]);
            if (data[field].length > maxLength) {
                errors[field] = `Please enter no more than ${maxLength} characters`;
            }
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        data
    };
}

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Generate a PDF (Agent Payslip)
 * @param {Object} payslipData - The payslip data
 */
function generateAgentPayslipPDF(payslipData) {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Document title
    doc.setFontSize(20);
    doc.setTextColor(66, 97, 238);
    doc.text(CONFIG.COMPANY.NAME, 105, 20, { align: 'center' });
    
    // Payslip title
    doc.setFontSize(16);
    doc.text('EMPLOYEE PAYSLIP', 105, 30, { align: 'center' });
    
    // Horizontal line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // Employee details section
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('Employee Details', 20, 45);
    
    doc.setFontSize(10);
    doc.text('Name:', 20, 55);
    doc.text(`${payslipData.firstname} ${payslipData.lastname}`, 70, 55);
    
    doc.text('Employee ID:', 20, 62);
    doc.text(payslipData.employee_id, 70, 62);
    
    doc.text('Payment Date:', 20, 69);
    doc.text(formatDate(payslipData.date_of_payment, 'LONG'), 70, 69);
    
    // Horizontal line
    doc.line(20, 75, 190, 75);
    
    // Payment details section
    doc.setFontSize(12);
    doc.text('Payment Details', 20, 85);
    
    // Table header
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 90, 170, 8, 'F');
    doc.text('Description', 25, 96);
    doc.text('Amount', 160, 96, { align: 'right' });
    
    // Table rows
    let y = 104;
    
    // Salary
    doc.text('Basic Salary', 25, y);
    doc.text(formatCurrency(payslipData.salary), 160, y, { align: 'right' });
    y += 8;
    
    // Bonus
    doc.text('Bonus', 25, y);
    doc.text(formatCurrency(payslipData.bonus), 160, y, { align: 'right' });
    y += 8;
    
    // Horizontal line
    doc.line(20, y, 190, y);
    y += 8;
    
    // Total
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Total Amount', 25, y);
    doc.text(formatCurrency(payslipData.amount), 160, y, { align: 'right' });
    
    // Footer
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated document. No signature is required.', 105, 250, { align: 'center' });
    doc.text(`Generated on: ${formatDate(new Date(), 'WITH_TIME')}`, 105, 255, { align: 'center' });
    
    // Save the PDF
    doc.save(`Agent_Payslip_${payslipData.employee_id}_${payslipData.payslip_no}.pdf`);
}

/**
 * Generate a PDF (Admin Payslip)
 * @param {Object} payslipData - The payslip data
 */
function generateAdminPayslipPDF(payslipData) {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Document title
    doc.setFontSize(20);
    doc.setTextColor(66, 97, 238);
    doc.text(CONFIG.COMPANY.NAME, 105, 20, { align: 'center' });
    
    // Payslip title
    doc.setFontSize(16);
    doc.text('ADMIN PAYSLIP', 105, 30, { align: 'center' });
    
    // Horizontal line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // Employee details section
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('Employee Details', 20, 45);
    
    doc.setFontSize(10);
    doc.text('Name:', 20, 55);
    doc.text(`${payslipData.firstname} ${payslipData.lastname}`, 70, 55);
    
    doc.text('Employee ID:', 20, 62);
    doc.text(payslipData.employee_id, 70, 62);
    
    // Banking details
    doc.text('Bank:', 20, 69);
    doc.text(payslipData.preferred_bank, 70, 69);
    
    doc.text('Account Number:', 20, 76);
    doc.text(payslipData.bank_acct, 70, 76);
    
    doc.text('Account Holder:', 20, 83);
    doc.text(payslipData.bank_details || `${payslipData.firstname} ${payslipData.lastname}`, 70, 83);
    
    // Person in charge
    doc.text('Person in Charge:', 20, 90);
    doc.text(payslipData.person_in_charge, 70, 90);
    
    doc.text('Payment Date:', 20, 97);
    doc.text(formatDate(payslipData.date_of_payment, 'LONG'), 70, 97);
    
    // Horizontal line
    doc.line(20, 103, 190, 103);
    
    // Payment details section
    doc.setFontSize(12);
    doc.text('Payment Details', 20, 113);
    
    // Table header
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 118, 170, 8, 'F');
    doc.text('Description', 25, 124);
    doc.text('Amount', 160, 124, { align: 'right' });
    
    // Table rows
    let y = 132;
    
    // Salary
    doc.text('Basic Salary', 25, y);
    doc.text(formatCurrency(payslipData.salary), 160, y, { align: 'right' });
    y += 8;
    
    // Bonus
    doc.text('Bonus', 25, y);
    doc.text(formatCurrency(payslipData.bonus), 160, y, { align: 'right' });
    y += 8;
    
    // Horizontal line
    doc.line(20, y, 190, y);
    y += 8;
    
    // Total
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Total Amount', 25, y);
    doc.text(formatCurrency(payslipData.amount), 160, y, { align: 'right' });
    
    // Payment status
    y += 16;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Payment Status:', 20, y);
    doc.text(payslipData.payment_status, 70, y);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated document. No signature is required.', 105, 250, { align: 'center' });
    doc.text(`Generated on: ${formatDate(new Date(), 'WITH_TIME')}`, 105, 255, { align: 'center' });
    
    // Save the PDF
    doc.save(`Admin_Payslip_${payslipData.employee_id}_${payslipData.payslip_no}.pdf`);
}