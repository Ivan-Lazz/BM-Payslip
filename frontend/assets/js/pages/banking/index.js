import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';

class BankingPage extends BasePage {
    constructor() {
        super();
        this.currentPage = 1;
        this.perPage = 10;
        this.totalPages = 1;
        this.bankingDetails = [];
        this.filters = {
            search: '',
            sort_field: 'id',
            sort_direction: 'asc'
        };
        
        // Additional DOM Elements
        this.elements = {
            ...this.elements,
            bankingTableBody: document.getElementById('banking-table-body'),
            filterForm: document.getElementById('filter-form'),
            searchInput: document.getElementById('search'),
            sortField: document.getElementById('sort_field'),
            sortDirection: document.getElementById('sort_direction'),
            perPageSelect: document.getElementById('per-page'),
            paginationInfo: document.getElementById('pagination-info'),
            pagination: document.getElementById('pagination'),
            deleteModal: document.getElementById('delete-modal'),
            deleteConfirmBtn: document.getElementById('confirm-delete-btn'),
            deleteCancelBtn: document.getElementById('cancel-delete-btn'),
            deleteBankingId: document.getElementById('delete-banking-id'),
            deleteBankingName: document.getElementById('delete-banking-name'),
            closeDeleteModal: document.getElementById('close-delete-modal'),
            toggleFilters: document.getElementById('toggle-filters'),
            filtersContainer: document.getElementById('filters-container'),
            resetFilters: document.getElementById('reset-filters')
        };
        
        this.initializeBankingPage();
    }
    
    initializeBankingPage() {
        // Initialize banking-specific event listeners
        this.initializeBankingEventListeners();
        
        // Load initial data
        this.loadBankingDetails();
    }
    
    initializeBankingEventListeners() {
        // Toggle filters
        if (this.elements.toggleFilters) {
            this.elements.toggleFilters.addEventListener('click', () => {
                this.elements.filtersContainer.style.display = 
                    this.elements.filtersContainer.style.display === 'none' ? 'block' : 'none';
            });
        }
        
        // Filter form submission
        if (this.elements.filterForm) {
            this.elements.filterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                this.currentPage = 1; // Reset to first page when filtering
                this.filters = {
                    search: this.elements.searchInput.value.trim(),
                    sort_field: this.elements.sortField.value,
                    sort_direction: this.elements.sortDirection.value
                };
                await this.loadBankingDetails();
            });
        }
        
        // Reset filters
        if (this.elements.resetFilters) {
            this.elements.resetFilters.addEventListener('click', () => {
                this.elements.filterForm.reset();
                this.filters = {
                    search: '',
                    sort_field: 'id',
                    sort_direction: 'asc'
                };
                this.currentPage = 1;
                this.loadBankingDetails();
            });
        }
        
        // Per page change
        if (this.elements.perPageSelect) {
            this.elements.perPageSelect.addEventListener('change', (e) => {
                this.perPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadBankingDetails();
            });
        }
        
        // Sort field change
        if (this.elements.sortField) {
            this.elements.sortField.addEventListener('change', () => {
                this.filters.sort_field = this.elements.sortField.value;
                this.loadBankingDetails();
            });
        }
        
        // Sort direction change
        if (this.elements.sortDirection) {
            this.elements.sortDirection.addEventListener('change', () => {
                this.filters.sort_direction = this.elements.sortDirection.value;
                this.loadBankingDetails();
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
                    
                    await this.deleteBankingDetail();
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
                // Toggle direction if same field, otherwise default to asc
                if (field === this.filters.sort_field) {
                    this.filters.sort_direction = this.filters.sort_direction === 'asc' ? 'desc' : 'asc';
                } else {
                    this.filters.sort_field = field;
                    this.filters.sort_direction = 'asc';
                }
                
                // Update UI to show sort direction
                document.querySelectorAll('th[data-sort]').forEach(header => {
                    header.classList.remove('sorted-asc', 'sorted-desc');
                });
                
                th.classList.add(`sorted-${this.filters.sort_direction}`);
                
                // Update select values to match
                if (this.elements.sortField) {
                    this.elements.sortField.value = this.filters.sort_field;
                }
                if (this.elements.sortDirection) {
                    this.elements.sortDirection.value = this.filters.sort_direction;
                }
                
                // Reload banking details with new sort
                this.loadBankingDetails();
            });
        });
    }
    
    async loadBankingDetails() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                per_page: this.perPage,
                search: this.filters.search,
                sort_field: this.filters.sort_field,
                sort_direction: this.filters.sort_direction
            };
            
            const response = await apiService.getBankingDetails(params);
            
            if (response.success) {
                this.bankingDetails = response.data || [];
                const total = response.pagination.total_records || 0;
                
                this.renderBankingDetails();
                this.updatePagination(total);
                
                // Show/hide no results message
                if (this.bankingDetails.length === 0 && this.filters.search) {
                    this.showNotification(`No banking details found matching "${this.filters.search}"`, 'info');
                }
            } else {
                throw new Error(response.message || 'Error loading banking details');
            }
        } catch (error) {
            console.error('Error loading banking details:', error);
            this.showNotification(error.message || 'Error loading banking details', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    renderBankingDetails() {
        if (!this.elements.bankingTableBody) return;
        
        this.elements.bankingTableBody.innerHTML = '';
        
        if (this.bankingDetails.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="text-center">No banking details found</td>
            `;
            this.elements.bankingTableBody.appendChild(row);
            return;
        }
        
        this.bankingDetails.forEach(banking => {
            const row = document.createElement('tr');
            const fullName = `${banking.firstname || ''} ${banking.lastname || ''}`.trim();
            
            row.innerHTML = `
                <td>${banking.employee_id || '-'}</td>
                <td>${banking.firstname || '-'}</td>
                <td>${banking.lastname || '-'}</td>
                <td>${banking.preferred_bank || '-'}</td>
                <td>${banking.bank_account_number || '-'}</td>
                <td class="table-actions">
                    <a href="form.html?id=${banking.id}" class="btn btn-sm btn-primary" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button type="button" class="btn btn-sm btn-danger delete-btn" title="Delete" 
                        data-id="${banking.id}" 
                        data-employee-id="${banking.employee_id || ''}"
                        data-bank="${banking.preferred_bank || ''}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-info dropdown-toggle" title="More Actions">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a href="../accounts/form.html?employee_id=${banking.employee_id}" class="dropdown-item">
                                <i class="fas fa-user-tag"></i> Add Account
                            </a>
                            <a href="../payslips/form.html?employee_id=${banking.employee_id}" class="dropdown-item">
                                <i class="fas fa-file-invoice-dollar"></i> Generate Payslip
                            </a>
                            <a href="../employees/form.html?id=${banking.employee_id}" class="dropdown-item">
                                <i class="fas fa-user-edit"></i> Edit Employee
                            </a>
                            <a href="../accounts/index.html?employee_id=${banking.employee_id}" class="dropdown-item">
                                <i class="fas fa-list"></i> View Accounts
                            </a>
                            <a href="../payslips/index.html?employee_id=${banking.employee_id}" class="dropdown-item">
                                <i class="fas fa-list"></i> View Payslips
                            </a>
                        </div>
                    </div>
                </td>
            `;
            this.elements.bankingTableBody.appendChild(row);
        });

        // Setup delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bankingId = btn.getAttribute('data-id');
                const employeeId = btn.getAttribute('data-employee-id');
                const bank = btn.getAttribute('data-bank');
                this.showDeleteModal(bankingId, employeeId, bank);
            });
        });

        // Setup dropdown menus
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const menu = this.nextElementSibling;
                menu.classList.toggle('show');
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
                    if (openMenu !== menu) {
                        openMenu.classList.remove('show');
                    }
                });
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
    
    updatePagination(total) {
        if (!this.elements.paginationInfo || !this.elements.pagination) return;
        
        this.totalPages = Math.ceil(total / this.perPage);
        const start = (this.currentPage - 1) * this.perPage + 1;
        const end = Math.min(start + this.perPage - 1, total);
        
        this.elements.paginationInfo.textContent = `Showing ${total > 0 ? start : 0}-${end} of ${total} banking details`;
        
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
                this.loadBankingDetails();
            });
        });
    }
    
    showDeleteModal(bankingId, employeeId, bank) {
        this.selectedBankingId = bankingId;
        this.elements.deleteBankingId.textContent = employeeId || 'N/A';
        this.elements.deleteBankingName.textContent = bank || 'N/A';
        this.elements.deleteModal.classList.add('show');
    }
    
    hideDeleteModal() {
        this.selectedBankingId = null;
        this.elements.deleteModal.classList.remove('show');
    }
    
    async deleteBankingDetail() {
        if (!this.selectedBankingId) return;
        
        try {
            // Disable confirm button immediately
            this.elements.deleteConfirmBtn.disabled = true;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            
            const response = await apiService.deleteBankingDetail(this.selectedBankingId);
            
            if (response.success) {
                this.showNotification('Banking detail deleted successfully', 'success');
                this.hideDeleteModal();
                await this.loadBankingDetails();
            } else {
                throw new Error(response.message || 'Error deleting banking detail');
            }
        } catch (error) {
            console.error('Error deleting banking detail:', error);
            this.showNotification(error.message || 'Error deleting banking detail', 'error');
        } finally {
            // Re-enable confirm button
            this.elements.deleteConfirmBtn.disabled = false;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-trash-alt btn-icon"></i> Delete Banking Details';
        }
    }
    
    showLoading() {
        if (this.elements.bankingTableBody) {
            this.elements.bankingTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="loading-container">
                            <div class="loading-spinner"></div>
                            <p>Loading banking details...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    hideLoading() {
        // Loading state is handled by renderBankingDetails
    }
}

// Create and export page instance
const bankingPage = new BankingPage();
export default bankingPage;