import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';
import payslipApiService from '../../services/payslips.js';

class PayslipViewPage extends BasePage {
    constructor() {
        super();
        this.elements = {
            ...this.elements,
            loadingContainer: document.getElementById('loading-container'),
            payslipContainer: document.getElementById('payslip-container'),
            companyName: document.getElementById('company-name'),
            payslipNo: document.getElementById('payslip-no'),
            employeeName: document.getElementById('employee-name'),
            employeeId: document.getElementById('employee-id'),
            bankName: document.getElementById('bank-name'),
            accountNumber: document.getElementById('account-number'),
            accountName: document.getElementById('account-name'),
            personInCharge: document.getElementById('person-in-charge'),
            paymentDate: document.getElementById('payment-date'),
            cutoffDate: document.getElementById('cutoff-date'),
            paymentStatus: document.getElementById('payment-status'),
            salary: document.getElementById('salary'),
            bonus: document.getElementById('bonus'),
            totalSalary: document.getElementById('total-salary'),
            generatedDate: document.getElementById('generated-date'),
            agentPdfLink: document.getElementById('agent-pdf-link'),
            adminPdfLink: document.getElementById('admin-pdf-link'),
            editLink: document.getElementById('edit-link'),
            printBtn: document.getElementById('print-btn'),
            bankingSection: document.getElementById('banking-section')
        };
        
        this.payslipId = null;
        this.viewType = 'agent'; // Default to agent view
        this.payslipData = null;
        
        this.init();
    }
    
    async init() {
        await super.init();
        this.initializeEventListeners();
        this.checkParameters();
        await this.loadPayslipData();
    }
    
    initializeEventListeners() {
        // Print button
        if (this.elements.printBtn) {
            this.elements.printBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.printPayslip();
            });
        }
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+P or Cmd+P for print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.printPayslip();
            }
            // Escape to go back
            if (e.key === 'Escape') {
                window.location.href = 'index.html';
            }
        });
    }
    
    checkParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        this.payslipId = urlParams.get('id');
        this.viewType = urlParams.get('type') || 'agent';
        
        if (!this.payslipId) {
            // No ID provided, redirect to payslips list
            this.showNotification('No payslip ID provided', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        // Set company name from config
        if (this.elements.companyName) {
            this.elements.companyName.textContent = window.config?.companyName || 'BM Outsourcing';
        }
        
        // Hide banking section for agent view
        if (this.viewType === 'agent' && this.elements.bankingSection) {
            this.elements.bankingSection.style.display = 'none';
        }
        
        // Update page title based on view type
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = this.viewType === 'agent' ? 'Agent Payslip' : 'Admin Payslip';
        }
    }
    
    async loadPayslipData() {
        try {
            // Show loading
            if (this.elements.loadingContainer) {
                this.elements.loadingContainer.style.display = 'flex';
            }
            if (this.elements.payslipContainer) {
                this.elements.payslipContainer.style.display = 'none';
            }
            
            const response = await payslipApiService.getPayslip(this.payslipId);
            
            if (response.success) {
                this.payslipData = response.data;
                this.renderPayslipData(response.data);
                
                // Show payslip container and hide loading
                if (this.elements.loadingContainer) {
                    this.elements.loadingContainer.style.display = 'none';
                }
                if (this.elements.payslipContainer) {
                    this.elements.payslipContainer.style.display = 'block';
                }
            } else {
                throw new Error(response.message || 'Failed to load payslip');
            }
        } catch (error) {
            console.error('Error loading payslip:', error);
            this.showNotification('Failed to load payslip data', 'error');
            
            // Show error message
            if (this.elements.loadingContainer) {
                this.elements.loadingContainer.innerHTML = `
                    <div class="alert alert-danger" style="max-width: 500px; margin: 2rem auto;">
                        <i class="fas fa-exclamation-circle alert-icon"></i>
                        <div>
                            <strong>Error Loading Payslip</strong><br>
                            ${error.message || 'Failed to load payslip. Please try again later.'}
                        </div>
                        <div style="margin-top: 1rem;">
                            <a href="index.html" class="btn btn-secondary">
                                <i class="fas fa-arrow-left btn-icon"></i> Back to Payslips
                            </a>
                            <button onclick="window.location.reload()" class="btn btn-primary">
                                <i class="fas fa-sync-alt btn-icon"></i> Try Again
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    renderPayslipData(payslip) {
        try {
            // Basic payslip info
            this.setElementText('payslipNo', payslip.payslip_no);
            this.setElementText('employeeName', payslip.employee_name);
            this.setElementText('employeeId', payslip.employee_id);
            
            // Banking details (only for admin view)
            if (this.viewType !== 'agent' && payslip.bank_details) {
                this.setElementText('bankName', payslip.bank_details.preferred_bank);
                this.setElementText('accountNumber', payslip.bank_details.bank_account_number);
                this.setElementText('accountName', payslip.bank_details.bank_account_name);
            }
            
            // Payment information
            this.setElementText('personInCharge', payslip.person_in_charge);
            
            // Format and set dates
            if (payslip.payment_date) {
                const paymentDate = this.formatDate(payslip.payment_date);
                this.setElementText('paymentDate', paymentDate);
            }
            
            if (payslip.cutoff_date) {
                const cutoffDate = this.formatDate(payslip.cutoff_date);
                this.setElementText('cutoffDate', cutoffDate);
            }
            
            // Payment status with styling
            if (this.elements.paymentStatus) {
                this.elements.paymentStatus.textContent = payslip.payment_status;
                
                // Add status class
                this.elements.paymentStatus.className = 'status-badge';
                if (payslip.payment_status === 'Paid') {
                    this.elements.paymentStatus.classList.add('status-paid');
                } else if (payslip.payment_status === 'Pending') {
                    this.elements.paymentStatus.classList.add('status-pending');
                } else if (payslip.payment_status === 'Cancelled') {
                    this.elements.paymentStatus.classList.add('status-cancelled');
                }
            }
            
            // Amounts
            const salary = parseFloat(payslip.salary || 0);
            const bonus = parseFloat(payslip.bonus || 0);
            const total = parseFloat(payslip.total_salary || 0);
            
            this.setElementText('salary', '₱' + this.formatCurrency(salary));
            this.setElementText('bonus', '₱' + this.formatCurrency(bonus));
            this.setElementText('totalSalary', '₱' + this.formatCurrency(total));
            
            // Generated date
            if (payslip.created_at) {
                const generatedDate = this.formatDateTime(payslip.created_at);
                this.setElementText('generatedDate', generatedDate);
            }
            
            // PDF links
            if (this.elements.agentPdfLink && payslip.agent_pdf_path) {
                this.elements.agentPdfLink.href = payslip.agent_pdf_path;
                this.elements.agentPdfLink.style.display = 'inline-flex';
            } else if (this.elements.agentPdfLink) {
                this.elements.agentPdfLink.style.display = 'none';
            }
            
            if (this.elements.adminPdfLink && payslip.admin_pdf_path) {
                this.elements.adminPdfLink.href = payslip.admin_pdf_path;
                this.elements.adminPdfLink.style.display = 'inline-flex';
            } else if (this.elements.adminPdfLink) {
                this.elements.adminPdfLink.style.display = 'none';
            }
            
            // Edit link
            if (this.elements.editLink) {
                this.elements.editLink.href = `form.html?id=${payslip.id}`;
            }
            
            // Update document title
            document.title = `Payslip ${payslip.payslip_no} - ${payslip.employee_name} - Pay Slip Generator`;
            
        } catch (error) {
            console.error('Error rendering payslip data:', error);
            this.showNotification('Error displaying payslip data', 'error'); 
        }
    }
    
    setElementText(elementKey, text) {
        const element = this.elements[elementKey];
        if (element) {
            element.textContent = text || '-';
        }
    }
    
    formatCurrency(amount) {
        if (isNaN(amount)) return '0.00';
        
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    formatDate(dateString) {
        if (!dateString) return '-';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }
    
    formatDateTime(dateString) {
        if (!dateString) return '-';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting date time:', error);
            return dateString;
        }
    }
    
    printPayslip() {
        // Hide elements that shouldn't be printed
        const noprint = document.querySelectorAll('.no-print');
        const originalDisplays = [];
        
        noprint.forEach(element => {
            originalDisplays.push(element.style.display);
            element.style.display = 'none';
        });
        
        // Set print-friendly title
        const originalTitle = document.title;
        if (this.payslipData) {
            document.title = `Payslip_${this.payslipData.payslip_no}_${this.payslipData.employee_name.replace(/\s+/g, '_')}`;
        }
        
        // Print
        window.print();
        
        // Restore elements
        noprint.forEach((element, index) => {
            element.style.display = originalDisplays[index];
        });
        
        // Restore title
        document.title = originalTitle;
    }
    
    // Override the loading and notification methods for better UX
    showLoading() {
        if (this.elements.loadingContainer) {
            this.elements.loadingContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading payslip...</p>
                </div>
            `;
            this.elements.loadingContainer.style.display = 'flex';
        }
        
        if (this.elements.payslipContainer) {
            this.elements.payslipContainer.style.display = 'none';
        }
    }
    
    hideLoading() {
        if (this.elements.loadingContainer) {
            this.elements.loadingContainer.style.display = 'none';
        }
        
        if (this.elements.payslipContainer) {
            this.elements.payslipContainer.style.display = 'block';
        }
    }
}

// Create and export page instance
const payslipViewPage = new PayslipViewPage();
export default payslipViewPage;