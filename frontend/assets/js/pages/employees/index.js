import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';

class EmployeesPage extends BasePage {
    constructor() {
        super();
        this.currentPage = 1;
        this.perPage = 10;
        this.totalPages = 1;
        this.employees = [];
        this.filters = {
            search: '',
            sort_field: 'employee_id',
            sort_direction: 'asc'
        };
        
        // Additional DOM Elements
        this.elements = {
            ...this.elements,
            employeeTableBody: document.getElementById('employees-table-body'),
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
            deleteEmployeeId: document.getElementById('delete-employee-id'),
            deleteEmployeeName: document.getElementById('delete-employee-name'),
            closeDeleteModal: document.getElementById('close-delete-modal'),
            toggleFilters: document.getElementById('toggle-filters'),
            filtersContainer: document.getElementById('filters-container'),
            resetFilters: document.getElementById('reset-filters')
        };
        
        this.initializeEmployeesPage();
    }
    
    initializeEmployeesPage() {
        // Initialize employees-specific event listeners
        this.initializeEmployeesEventListeners();
        
        // Load initial data
        this.loadEmployees();
    }
    
    initializeEmployeesEventListeners() {
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
                await this.loadEmployees();
            });
        }
        
        // Reset filters
        if (this.elements.resetFilters) {
            this.elements.resetFilters.addEventListener('click', () => {
                this.elements.filterForm.reset();
                this.filters = {
                    search: '',
                    sort_field: 'employee_id',
                    sort_direction: 'asc'
                };
                this.currentPage = 1;
                this.loadEmployees();
            });
        }
        
        // Per page change
        if (this.elements.perPageSelect) {
            this.elements.perPageSelect.addEventListener('change', (e) => {
                this.perPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadEmployees();
            });
        }
        
        // Sort field change
        if (this.elements.sortField) {
            this.elements.sortField.addEventListener('change', () => {
                this.filters.sort_field = this.elements.sortField.value;
                this.loadEmployees();
            });
        }
        
        // Sort direction change
        if (this.elements.sortDirection) {
            this.elements.sortDirection.addEventListener('change', () => {
                this.filters.sort_direction = this.elements.sortDirection.value;
                this.loadEmployees();
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
                    
                    await this.deleteEmployee();
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
                
                // Reload employees with new sort
                this.loadEmployees();
            });
        });
    }
    
    async loadEmployees() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                per_page: this.perPage,
                search: this.filters.search,
                sort_field: this.filters.sort_field,
                sort_direction: this.filters.sort_direction
            };
            
            const response = await apiService.getEmployees(params);
            
            if (response.success) {
                this.employees = response.data || [];
                const total = response.pagination.total_records || 0;
                
                this.renderEmployees();
                this.updatePagination(total);
                
                // Show/hide no results message
                if (this.employees.length === 0 && this.filters.search) {
                    this.showNotification(`No employees found matching "${this.filters.search}"`, 'info');
                }
            } else {
                throw new Error(response.message || 'Error loading employees');
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            this.showNotification(error.message || 'Error loading employees', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    renderEmployees() {
        if (!this.elements.employeeTableBody) return;
        
        this.elements.employeeTableBody.innerHTML = '';
        
        if (this.employees.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="text-center">No employees found</td>
            `;
            this.elements.employeeTableBody.appendChild(row);
            return;
        }
        
        this.employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.employee_id}</td>
                <td>${employee.firstname}</td>
                <td>${employee.lastname}</td>
                <td>${employee.email || '-'}</td>
                <td>${employee.contact_number || '-'}</td>
                <td class="table-actions">
                    <a href="form.html?id=${employee.employee_id}" class="btn btn-sm btn-primary" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button type="button" class="btn btn-sm btn-danger delete-btn" title="Delete" 
                        data-id="${employee.employee_id}" 
                        data-name="${employee.firstname} ${employee.lastname}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-info dropdown-toggle" title="More Actions">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a href="../accounts/form.html?employee_id=${employee.employee_id}" class="dropdown-item">
                                <i class="fas fa-user-tag"></i> Add Account
                            </a>
                            <a href="../banking/form.html?employee_id=${employee.employee_id}" class="dropdown-item">
                                <i class="fas fa-university"></i> Add Banking Details
                            </a>
                            <a href="../payslips/form.html?employee_id=${employee.employee_id}" class="dropdown-item">
                                <i class="fas fa-file-invoice-dollar"></i> Generate Payslip
                            </a>
                            <a href="../accounts/index.html?employee_id=${employee.employee_id}" class="dropdown-item">
                                <i class="fas fa-list"></i> View Accounts
                            </a>
                            <a href="../banking/index.html?employee_id=${employee.employee_id}" class="dropdown-item">
                                <i class="fas fa-list"></i> View Banking Details
                            </a>
                            <a href="../payslips/index.html?employee_id=${employee.employee_id}" class="dropdown-item">
                                <i class="fas fa-list"></i> View Payslips
                            </a>
                        </div>
                    </div>
                </td>
            `;
            this.elements.employeeTableBody.appendChild(row);
        });

        // Setup delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const employeeId = btn.getAttribute('data-id');
                const employeeName = btn.getAttribute('data-name');
                this.showDeleteModal(employeeId, employeeName);
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
        
        this.elements.paginationInfo.textContent = `Showing ${total > 0 ? start : 0}-${end} of ${total} employees`;
        
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
                this.loadEmployees();
            });
        });
    }
    
    showDeleteModal(employeeId, employeeName) {
        this.selectedEmployeeId = employeeId;
        this.elements.deleteEmployeeId.textContent = employeeId;
        this.elements.deleteEmployeeName.textContent = employeeName;
        this.elements.deleteModal.classList.add('show');
    }
    
    hideDeleteModal() {
        this.selectedEmployeeId = null;
        this.elements.deleteModal.classList.remove('show');
    }
    
    async deleteEmployee() {
        if (!this.selectedEmployeeId) return;
        
        try {
            // Disable confirm button immediately
            this.elements.deleteConfirmBtn.disabled = true;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            
            const response = await apiService.deleteEmployee(this.selectedEmployeeId);
            
            if (response.success) {
                this.showNotification('Employee deleted successfully', 'success');
                this.hideDeleteModal();
                await this.loadEmployees();
            } else {
                throw new Error(response.message || 'Error deleting employee');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            this.showNotification(error.message || 'Error deleting employee', 'error');
        } finally {
            // Re-enable confirm button
            this.elements.deleteConfirmBtn.disabled = false;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-trash-alt btn-icon"></i> Delete Employee';
        }
    }
    
    showLoading() {
        if (this.elements.employeeTableBody) {
            this.elements.employeeTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="loading-container">
                            <div class="loading-spinner"></div>
                            <p>Loading employees...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    hideLoading() {
        // Loading state is handled by renderEmployees
    }
}

// Create and export page instance
const employeesPage = new EmployeesPage();
export default employeesPage; 