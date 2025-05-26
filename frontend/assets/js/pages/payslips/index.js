import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';
import payslipApiService from '../../services/payslips.js';

class PayslipsPage extends BasePage {
    constructor() {
        super();
        this.currentPage = 1;
        this.perPage = 10;
        this.totalPages = 1;
        this.payslips = [];
        this.filters = {
            search: '',
            status: '',
            start_date: '',
            end_date: ''
        };
        this.sortField = 'payment_date';
        this.sortDirection = 'desc';
        
        // Additional DOM Elements
        this.elements = {
            ...this.elements,
            payslipTableBody: document.getElementById('payslips-table-body'),
            filterForm: document.getElementById('filter-form'),
            searchInput: document.getElementById('search'),
            statusSelect: document.getElementById('status'),
            startDateInput: document.getElementById('start-date'),
            endDateInput: document.getElementById('end-date'),
            perPageSelect: document.getElementById('per-page'),
            paginationInfo: document.getElementById('pagination-info'),
            pagination: document.getElementById('pagination'),
            deleteModal: document.getElementById('delete-modal'),
            deleteConfirmBtn: document.getElementById('confirm-delete-btn'),
            deleteCancelBtn: document.getElementById('cancel-delete-btn'),
            deletePayslipNo: document.getElementById('delete-payslip-no'),
            deleteEmployeeName: document.getElementById('delete-employee-name'),
            closeDeleteModal: document.getElementById('close-delete-modal'),
            toggleFilters: document.getElementById('toggle-filters'),
            filtersContainer: document.getElementById('filters-container'),
            resetFilters: document.getElementById('reset-filters')
        };
        
        this.selectedPayslipId = null;
        
        this.initializePayslipsPage();
    }
    
    initializePayslipsPage() {
        // Initialize payslips-specific event listeners
        this.initializePayslipsEventListeners();
        
        // Load initial data
        this.loadPayslips();
    }
    
    initializePayslipsEventListeners() {
        // Toggle filters
        if (this.elements.toggleFilters) {
            this.elements.toggleFilters.addEventListener('click', () => {
                const isHidden = this.elements.filtersContainer.style.display === 'none';
                this.elements.filtersContainer.style.display = isHidden ? 'block' : 'none';
                this.elements.toggleFilters.innerHTML = isHidden 
                    ? '<i class="fas fa-filter btn-icon"></i> Hide Filters'
                    : '<i class="fas fa-filter btn-icon"></i> Show Filters';
                this.elements.toggleFilters.classList.toggle('active', isHidden);
            });
        }
        
        // Filter form submission
        if (this.elements.filterForm) {
            this.elements.filterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                this.currentPage = 1; // Reset to first page when filtering
                this.filters = {
                    search: this.elements.searchInput.value.trim(),
                    status: this.elements.statusSelect.value,
                    start_date: this.elements.startDateInput.value,
                    end_date: this.elements.endDateInput.value
                };
                await this.loadPayslips();
            });
        }
        
        // Reset filters
        if (this.elements.resetFilters) {
            this.elements.resetFilters.addEventListener('click', () => {
                this.elements.filterForm.reset();
                this.filters = {
                    search: '',
                    status: '',
                    start_date: '',
                    end_date: ''
                };
                this.currentPage = 1;
                this.loadPayslips();
            });
        }
        
        // Per page change
        if (this.elements.perPageSelect) {
            this.elements.perPageSelect.addEventListener('change', (e) => {
                this.perPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadPayslips();
            });
        }
        
        // Delete modal
        if (this.elements.deleteModal) {
            if (this.elements.deleteConfirmBtn) {
                this.elements.deleteConfirmBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Prevent double submission
                    if (this.elements.deleteConfirmBtn.disabled) {
                        return;
                    }
                    
                    await this.deletePayslip();
                });
            }
            if (this.elements.deleteCancelBtn) {
                this.elements.deleteCancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.hideDeleteModal();
                });
            }
            if (this.elements.closeDeleteModal) {
                this.elements.closeDeleteModal.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.hideDeleteModal();
                });
            }
        }

        // Table header sorting
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.getAttribute('data-sort');
                // Toggle direction if same field, otherwise default to desc for dates/amounts
                if (field === this.sortField) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortField = field;
                    this.sortDirection = ['payment_date', 'total_salary'].includes(field) ? 'desc' : 'asc';
                }
                
                // Update UI to show sort direction
                document.querySelectorAll('th[data-sort]').forEach(header => {
                    header.classList.remove('sorted-asc', 'sorted-desc');
                });
                
                th.classList.add(`sorted-${this.sortDirection}`);
                
                // Reload payslips with new sort
                this.loadPayslips();
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-group')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    }
    
    async loadPayslips() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                per_page: this.perPage,
                search: this.filters.search,
                status: this.filters.status,
                start_date: this.filters.start_date,
                end_date: this.filters.end_date,
                sort_field: this.sortField,
                sort_direction: this.sortDirection
            };
            
            const response = await payslipApiService.searchPayslips(params);
            
            if (response.success) {
                this.payslips = response.data || [];
                const total = response.pagination.total_records || 0;
                
                this.renderPayslips();
                this.updatePagination(total);
                
                // Show/hide no results message
                if (this.payslips.length === 0 && (this.filters.search || this.filters.status)) {
                    let filterText = '';
                    if (this.filters.search) filterText += `"${this.filters.search}"`;
                    if (this.filters.status) {
                        filterText += filterText ? ` and status "${this.filters.status}"` : `status "${this.filters.status}"`;
                    }
                    this.showNotification(`No payslips found matching ${filterText}`, 'info');
                }
            } else {
                throw new Error(response.message || 'Error loading payslips');
            }
        } catch (error) {
            console.error('Error loading payslips:', error);
            this.showNotification(error.message || 'Error loading payslips', 'error');
            
            // Show error in table
            if (this.elements.payslipTableBody) {
                this.elements.payslipTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <div class="alert alert-danger">
                                <i class="fas fa-exclamation-circle alert-icon"></i>
                                <div>Error loading payslips. Please try again.</div>
                            </div>
                        </td>
                    </tr>
                `;
            }
        } finally {
            this.hideLoading();
        }
    }
    
    renderPayslips() {
        if (!this.elements.payslipTableBody) return;
        
        this.elements.payslipTableBody.innerHTML = '';
        
        if (this.payslips.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="text-center" style="padding: 2rem;">
                    <div style="color: var(--text-muted);">
                        <i class="fas fa-file-invoice-dollar" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p>No payslips found</p>
                        <a href="form.html" class="btn btn-primary">
                            <i class="fas fa-plus-circle btn-icon"></i> Generate Your First Payslip
                        </a>
                    </div>
                </td>
            `;
            this.elements.payslipTableBody.appendChild(row);
            return;
        }
        
        this.payslips.forEach(payslip => {
            const row = document.createElement('tr');
            
            // Determine status styling
            let statusClass = '';
            let statusIcon = '';
            
            switch (payslip.payment_status) {
                case 'Paid':
                    statusClass = 'text-success';
                    statusIcon = 'check-circle';
                    break;
                case 'Pending':
                    statusClass = 'text-warning';
                    statusIcon = 'clock';
                    break;
                case 'Cancelled':
                    statusClass = 'text-danger';
                    statusIcon = 'times-circle';
                    break;
                default:
                    statusIcon = 'info-circle';
            }
            
            // Format currency
            const totalSalary = parseFloat(payslip.total_salary || 0);
            const formattedAmount = totalSalary.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            // Format date
            let formattedDate = '-';
            if (payslip.payment_date) {
                try {
                    formattedDate = new Date(payslip.payment_date).toLocaleDateString();
                } catch (e) {
                    formattedDate = payslip.payment_date;
                }
            }
            
            row.innerHTML = `
                <td>
                    <strong>${payslip.payslip_no}</strong>
                    ${payslip.cutoff_date ? `<br><small class="text-muted">Cutoff: ${new Date(payslip.cutoff_date).toLocaleDateString()}</small>` : ''}
                </td>
                <td>
                    <strong>${payslip.employee_name || '-'}</strong>
                    ${payslip.employee_id ? `<br><small class="text-muted">ID: ${payslip.employee_id}</small>` : ''}
                </td>
                <td>${formattedDate}</td>
                <td style="text-align: right;">
                    <strong>₱${formattedAmount}</strong>
                    ${payslip.salary && payslip.bonus ? `<br><small class="text-muted">Salary: ₱${parseFloat(payslip.salary).toLocaleString()} + Bonus: ₱${parseFloat(payslip.bonus).toLocaleString()}</small>` : ''}
                </td>
                <td class="${statusClass}">
                    <i class="fas fa-${statusIcon}"></i> ${payslip.payment_status}
                </td>
                <td class="table-actions">
                    <a href="view.html?id=${payslip.id}" class="btn btn-sm btn-info" title="View Payslip">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="form.html?id=${payslip.id}" class="btn btn-sm btn-primary" title="Edit Payslip">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button type="button" class="btn btn-sm btn-danger delete-btn" title="Delete Payslip" 
                        data-id="${payslip.id}" 
                        data-payslip-no="${payslip.payslip_no}" 
                        data-employee="${payslip.employee_name || 'Unknown'}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-secondary dropdown-toggle" title="Download PDFs">
                            <i class="fas fa-download"></i>
                        </button>
                        <div class="dropdown-menu">
                            ${payslip.agent_pdf_path ? `
                                <a href="${payslip.agent_pdf_path}" class="dropdown-item" target="_blank">
                                    <i class="fas fa-file-pdf"></i> Agent Payslip
                                </a>
                            ` : ''}
                            ${payslip.admin_pdf_path ? `
                                <a href="${payslip.admin_pdf_path}" class="dropdown-item" target="_blank">
                                    <i class="fas fa-file-pdf"></i> Admin Payslip
                                </a>
                            ` : ''}
                            ${!payslip.agent_pdf_path && !payslip.admin_pdf_path ? `
                                <span class="dropdown-item text-muted">
                                    <i class="fas fa-exclamation-triangle"></i> No PDFs available
                                </span>
                                <button type="button" class="dropdown-item regenerate-pdf-btn" data-id="${payslip.id}">
                                    <i class="fas fa-sync-alt"></i> Regenerate PDFs
                                </button>
                            ` : `
                                <div class="dropdown-divider"></div>
                                <button type="button" class="dropdown-item regenerate-pdf-btn" data-id="${payslip.id}">
                                    <i class="fas fa-sync-alt"></i> Regenerate PDFs
                                </button>
                            `}
                        </div>
                    </div>
                </td>
            `;
            this.elements.payslipTableBody.appendChild(row);
        });

        // Setup delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const payslipId = btn.getAttribute('data-id');
                const payslipNo = btn.getAttribute('data-payslip-no');
                const employeeName = btn.getAttribute('data-employee');
                this.showDeleteModal(payslipId, payslipNo, employeeName);
            });
        });

        // Setup regenerate PDF buttons
        document.querySelectorAll('.regenerate-pdf-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const payslipId = btn.getAttribute('data-id');
                await this.regeneratePDFs(payslipId);
            });
        });

        // Setup dropdown menus
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const menu = this.nextElementSibling;
                
                // Close all other dropdowns first
                document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
                    if (openMenu !== menu) {
                        openMenu.classList.remove('show');
                    }
                });
                
                // Toggle this dropdown
                menu.classList.toggle('show');
            });
        });
    }
    
    updatePagination(total) {
        if (!this.elements.paginationInfo || !this.elements.pagination) return;
        
        this.totalPages = Math.ceil(total / this.perPage);
        const start = (this.currentPage - 1) * this.perPage + 1;
        const end = Math.min(start + this.perPage - 1, total);
        
        this.elements.paginationInfo.textContent = `Showing ${total > 0 ? start : 0}-${end} of ${total} payslips`;
        
        // Generate pagination buttons
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="pagination-item">
                <button class="pagination-link${this.currentPage === 1 ? ' disabled' : ''}" 
                    ${this.currentPage === 1 ? 'disabled' : 'data-page="' + (this.currentPage - 1) + '"'}>
                    <i class="fas fa-chevron-left"></i>
                </button>
            </li>
        `;
        
        // Page numbers
        const maxPages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
        
        // Adjust start if needed
        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        // First page
        if (startPage > 1) {
            paginationHTML += `
                <li class="pagination-item">
                    <button class="pagination-link" data-page="1">1</button>
                </li>
            `;
            
            if (startPage > 2) {
                paginationHTML += `
                    <li class="pagination-item">
                        <span class="pagination-ellipsis">...</span>
                    </li>
                `;
            }
        }
        
        // Page links
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="pagination-item">
                    <button class="pagination-link${i === this.currentPage ? ' active' : ''}" 
                        data-page="${i}">${i}</button>
                </li>
            `;
        }
        
        // Last page
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += `
                    <li class="pagination-item">
                        <span class="pagination-ellipsis">...</span>
                    </li>
                `;
            }
            
            paginationHTML += `
                <li class="pagination-item">
                    <button class="pagination-link" data-page="${this.totalPages}">${this.totalPages}</button>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="pagination-item">
                <button class="pagination-link${this.currentPage === this.totalPages ? ' disabled' : ''}" 
                    ${this.currentPage === this.totalPages ? 'disabled' : 'data-page="' + (this.currentPage + 1) + '"'}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </li>
        `;
        
        this.elements.pagination.innerHTML = paginationHTML;
        
        // Add click event listeners to pagination buttons
        this.elements.pagination.querySelectorAll('.pagination-link:not(.disabled)').forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.getAttribute('data-page'));
                this.loadPayslips();
            });
        });
    }
    
    showDeleteModal(payslipId, payslipNo, employeeName) {
        this.selectedPayslipId = payslipId;
        this.elements.deletePayslipNo.textContent = payslipNo;
        this.elements.deleteEmployeeName.textContent = employeeName;
        this.elements.deleteModal.classList.add('show');
    }
    
    hideDeleteModal() {
        this.selectedPayslipId = null;
        this.elements.deleteModal.classList.remove('show');
    }
    
    async deletePayslip() {
        if (!this.selectedPayslipId) return;
        
        try {
            // Disable confirm button immediately
            this.elements.deleteConfirmBtn.disabled = true;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            
            const response = await payslipApiService.deletePayslip(this.selectedPayslipId);
            
            if (response.success) {
                this.showNotification('Payslip deleted successfully', 'success');
                this.hideDeleteModal();
                
                // If this was the last item on the page and not page 1, go to previous page
                if (this.payslips.length === 1 && this.currentPage > 1) {
                    this.currentPage--;
                }
                
                await this.loadPayslips();
            } else {
                throw new Error(response.message || 'Error deleting payslip');
            }
        } catch (error) {
            console.error('Error deleting payslip:', error);
            this.showNotification(error.message || 'Error deleting payslip', 'error');
        } finally {
            // Re-enable confirm button
            this.elements.deleteConfirmBtn.disabled = false;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-trash-alt btn-icon"></i> Delete Payslip';
        }
    }
    
    async regeneratePDFs(payslipId) {
        try {
            const response = await payslipApiService.generatePDFs(payslipId);
            
            if (response.success) {
                this.showNotification('PDFs regenerated successfully', 'success');
                // Reload payslips to get updated PDF paths
                await this.loadPayslips();
            } else {
                throw new Error(response.message || 'Error regenerating PDFs');
            }
        } catch (error) {
            console.error('Error regenerating PDFs:', error);
            this.showNotification(error.message || 'Error regenerating PDFs', 'error');
        }
    }
    
    showLoading() {
        if (this.elements.payslipTableBody) {
            this.elements.payslipTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 3rem;">
                        <div class="loading-container">
                            <div class="loading-spinner"></div>
                            <p>Loading payslips...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    hideLoading() {
        // Loading state is handled by renderPayslips
    }
}

// Create and export page instance
const payslipsPage = new PayslipsPage();
export default payslipsPage;