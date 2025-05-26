import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';

class AccountsPage extends BasePage {
    constructor() {
        super();
        this.currentPage = 1;
        this.perPage = 10;
        this.totalPages = 1;
        this.accounts = [];
        this.filters = {
            search: '',
            sort_field: 'account_id',
            sort_direction: 'asc'
        };
        
        // Additional DOM Elements
        this.elements = {
            ...this.elements,
            accountsTableBody: document.getElementById('accounts-table-body'),
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
            deleteAccountId: document.getElementById('delete-account-id'),
            deleteAccountEmail: document.getElementById('delete-account-email'),
            closeDeleteModal: document.getElementById('close-delete-modal'),
            toggleFilters: document.getElementById('toggle-filters'),
            filtersContainer: document.getElementById('filters-container'),
            resetFilters: document.getElementById('reset-filters')
        };
        
        this.initializeAccountsPage();
    }
    
    initializeAccountsPage() {
        // Initialize accounts-specific event listeners
        this.initializeAccountsEventListeners();
        
        // Load initial data
        this.loadAccounts();
    }
    
    initializeAccountsEventListeners() {
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
                await this.loadAccounts();
            });
        }
        
        // Reset filters
        if (this.elements.resetFilters) {
            this.elements.resetFilters.addEventListener('click', () => {
                this.elements.filterForm.reset();
                this.filters = {
                    search: '',
                    sort_field: 'account_id',
                    sort_direction: 'asc'
                };
                this.currentPage = 1;
                this.loadAccounts();
            });
        }
        
        // Per page change
        if (this.elements.perPageSelect) {
            this.elements.perPageSelect.addEventListener('change', (e) => {
                this.perPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadAccounts();
            });
        }
        
        // Sort field change
        if (this.elements.sortField) {
            this.elements.sortField.addEventListener('change', () => {
                this.filters.sort_field = this.elements.sortField.value;
                this.loadAccounts();
            });
        }
        
        // Sort direction change
        if (this.elements.sortDirection) {
            this.elements.sortDirection.addEventListener('change', () => {
                this.filters.sort_direction = this.elements.sortDirection.value;
                this.loadAccounts();
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
                    
                    await this.deleteAccount();
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
                
                // Reload accounts with new sort
                this.loadAccounts();
            });
        });
    }
    
    async loadAccounts() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                per_page: this.perPage,
                search: this.filters.search,
                sort_field: this.filters.sort_field,
                sort_direction: this.filters.sort_direction
            };
            
            const response = await apiService.getAccounts(params);
            
            if (response.success) {
                this.accounts = response.data || [];
                const total = response.pagination.total_records || 0;
                
                this.renderAccounts();
                this.updatePagination(total);
                
                // Show/hide no results message
                if (this.accounts.length === 0 && this.filters.search) {
                    this.showNotification(`No accounts found matching "${this.filters.search}"`, 'info');
                }
            } else {
                throw new Error(response.message || 'Error loading accounts');
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
            this.showNotification(error.message || 'Error loading accounts', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    renderAccounts() {
        if (!this.elements.accountsTableBody) return;
        
        this.elements.accountsTableBody.innerHTML = '';
        
        if (this.accounts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="text-center">No accounts found</td>
            `;
            this.elements.accountsTableBody.appendChild(row);
            return;
        }
        
        this.accounts.forEach(account => {
            const row = document.createElement('tr');
            const fullName = `${account.firstname || ''} ${account.lastname || ''}`.trim();
            
            // Handle different status values and provide fallback
            let statusBadge = '';
            const status = (account.account_status || '').toUpperCase();
            switch(status) {
                case 'ACTIVE':
                    statusBadge = '<span class="badge badge-success">Active</span>';
                    break;
                case 'INACTIVE':
                    statusBadge = '<span class="badge badge-danger">Inactive</span>';
                    break;
                case 'SUSPENDED':
                    statusBadge = '<span class="badge badge-warning">Suspended</span>';
                    break;
                default:
                    statusBadge = '<span class="badge badge-success">Active</span>';
            }
            
            row.innerHTML = `
                <td>${account.employee_id || '-'}</td>
                <td>${fullName || '-'}</td>
                <td>${account.account_email || '-'}</td>
                <td>${account.account_type || '-'}</td>
                <td>${statusBadge}</td>
                <td class="table-actions">
                    <a href="form.html?id=${account.account_id}" class="btn btn-sm btn-primary" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button type="button" class="btn btn-sm btn-danger delete-btn" title="Delete" 
                        data-id="${account.account_id}" 
                        data-employee-id="${account.employee_id || ''}"
                        data-email="${account.account_email || ''}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-info dropdown-toggle" title="More Actions">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a href="../banking/form.html?employee_id=${account.employee_id}" class="dropdown-item">
                                <i class="fas fa-university"></i> Add Banking Details
                            </a>
                            <a href="../payslips/form.html?employee_id=${account.employee_id}" class="dropdown-item">
                                <i class="fas fa-file-invoice-dollar"></i> Generate Payslip
                            </a>
                            <a href="../employees/form.html?id=${account.employee_id}" class="dropdown-item">
                                <i class="fas fa-user-edit"></i> Edit Employee
                            </a>
                            <a href="../banking/index.html?employee_id=${account.employee_id}" class="dropdown-item">
                                <i class="fas fa-list"></i> View Banking Details
                            </a>
                            <a href="../payslips/index.html?employee_id=${account.employee_id}" class="dropdown-item">
                                <i class="fas fa-list"></i> View Payslips
                            </a>
                        </div>
                    </div>
                </td>
            `;
            this.elements.accountsTableBody.appendChild(row);
        });

        // Setup delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const accountId = btn.getAttribute('data-id');
                const employeeId = btn.getAttribute('data-employee-id');
                const email = btn.getAttribute('data-email');
                this.showDeleteModal(accountId, employeeId, email);
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
        
        this.elements.paginationInfo.textContent = `Showing ${total > 0 ? start : 0}-${end} of ${total} accounts`;
        
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
                this.loadAccounts();
            });
        });
    }
    
    showDeleteModal(accountId, employeeId, email) {
        this.selectedAccountId = accountId;
        this.elements.deleteAccountId.textContent = employeeId || 'N/A';
        this.elements.deleteAccountEmail.textContent = email || 'N/A';
        this.elements.deleteModal.classList.add('show');
    }
    
    hideDeleteModal() {
        this.selectedAccountId = null;
        this.elements.deleteModal.classList.remove('show');
    }
    
    async deleteAccount() {
        if (!this.selectedAccountId) return;
        
        try {
            // Disable confirm button immediately
            this.elements.deleteConfirmBtn.disabled = true;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            
            const response = await apiService.deleteAccount(this.selectedAccountId);
            
            if (response.success) {
                this.showNotification('Account deleted successfully', 'success');
                this.hideDeleteModal();
                await this.loadAccounts();
            } else {
                throw new Error(response.message || 'Error deleting account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            this.showNotification(error.message || 'Error deleting account', 'error');
        } finally {
            // Re-enable confirm button
            this.elements.deleteConfirmBtn.disabled = false;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-trash-alt btn-icon"></i> Delete Account';
        }
    }
    
    showLoading() {
        if (this.elements.accountsTableBody) {
            this.elements.accountsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="loading-container">
                            <div class="loading-spinner"></div>
                            <p>Loading accounts...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    hideLoading() {
        // Loading state is handled by renderAccounts
    }
}

// Create and export page instance
const accountsPage = new AccountsPage();
export default accountsPage;