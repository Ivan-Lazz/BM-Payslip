import BasePage from '../BasePage.js';
import apiService from '../../services/api.js';

class UsersPage extends BasePage {
    constructor() {
        super();
        this.currentPage = 1;
        this.perPage = 10;
        this.totalPages = 1;
        this.users = [];
        this.filters = {
            search: '',
            sort_field: 'id',
            sort_direction: 'asc'
        };
        
        // Additional DOM Elements
        this.elements = {
            ...this.elements,
            usersTableBody: document.getElementById('users-table-body'),
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
            deleteUserUsername: document.getElementById('delete-user-username'),
            deleteUserEmail: document.getElementById('delete-user-email'),
            closeDeleteModal: document.getElementById('close-delete-modal'),
            toggleFilters: document.getElementById('toggle-filters'),
            filtersContainer: document.getElementById('filters-container'),
            resetFilters: document.getElementById('reset-filters')
        };
        
        this.initializeUsersPage();
    }
    
    initializeUsersPage() {
        // Initialize users-specific event listeners
        this.initializeUsersEventListeners();
        
        // Load initial data
        this.loadUsers();
    }
    
    initializeUsersEventListeners() {
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
                await this.loadUsers();
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
                this.loadUsers();
            });
        }
        
        // Per page change
        if (this.elements.perPageSelect) {
            this.elements.perPageSelect.addEventListener('change', (e) => {
                this.perPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadUsers();
            });
        }
        
        // Sort field change
        if (this.elements.sortField) {
            this.elements.sortField.addEventListener('change', () => {
                this.filters.sort_field = this.elements.sortField.value;
                this.loadUsers();
            });
        }
        
        // Sort direction change
        if (this.elements.sortDirection) {
            this.elements.sortDirection.addEventListener('change', () => {
                this.filters.sort_direction = this.elements.sortDirection.value;
                this.loadUsers();
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
                    
                    await this.deleteUser();
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
                
                // Reload users with new sort
                this.loadUsers();
            });
        });
    }
    
    async loadUsers() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                per_page: this.perPage,
                search: this.filters.search,
                sort_field: this.filters.sort_field,
                sort_direction: this.filters.sort_direction
            };
            
            const response = await apiService.getUsers(params);
            
            if (response.success) {
                this.users = response.data || [];
                const total = response.pagination.total_records || 0;
                
                this.renderUsers();
                this.updatePagination(total);
                
                // Show/hide no results message
                if (this.users.length === 0 && this.filters.search) {
                    this.showNotification(`No users found matching "${this.filters.search}"`, 'info');
                }
            } else {
                throw new Error(response.message || 'Error loading users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showNotification(error.message || 'Error loading users', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    renderUsers() {
        if (!this.elements.usersTableBody) return;
        
        this.elements.usersTableBody.innerHTML = '';
        
        if (this.users.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="text-center">No users found</td>
            `;
            this.elements.usersTableBody.appendChild(row);
            return;
        }
        
        this.users.forEach(user => {
            const row = document.createElement('tr');
            
            // Handle role badge
            let roleBadge = '';
            switch(user.role) {
                case 'admin':
                    roleBadge = '<span class="badge badge-primary">Admin</span>';
                    break;
                case 'user':
                default:
                    roleBadge = '<span class="badge badge-secondary">User</span>';
                    break;
            }
            
            // Handle status badge
            let statusBadge = '';
            switch(user.status) {
                case 'active':
                    statusBadge = '<span class="badge badge-success">Active</span>';
                    break;
                case 'inactive':
                default:
                    statusBadge = '<span class="badge badge-danger">Inactive</span>';
                    break;
            }
            
            row.innerHTML = `
                <td>${user.firstname || '-'}</td>
                <td>${user.lastname || '-'}</td>
                <td>${user.username || '-'}</td>
                <td>${user.email || '-'}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td class="table-actions">
                    <a href="form.html?id=${user.id}" class="btn btn-sm btn-primary" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button type="button" class="btn btn-sm btn-danger delete-btn" title="Delete" 
                        data-id="${user.id}" 
                        data-username="${user.username || ''}"
                        data-email="${user.email || ''}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            this.elements.usersTableBody.appendChild(row);
        });

        // Setup delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');
                const username = btn.getAttribute('data-username');
                const email = btn.getAttribute('data-email');
                this.showDeleteModal(userId, username, email);
            });
        });
    }
    
    updatePagination(total) {
        if (!this.elements.paginationInfo || !this.elements.pagination) return;
        
        this.totalPages = Math.ceil(total / this.perPage);
        const start = (this.currentPage - 1) * this.perPage + 1;
        const end = Math.min(start + this.perPage - 1, total);
        
        this.elements.paginationInfo.textContent = `Showing ${total > 0 ? start : 0}-${end} of ${total} users`;
        
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
                this.loadUsers();
            });
        });
    }
    
    showDeleteModal(userId, username, email) {
        this.selectedUserId = userId;
        this.elements.deleteUserUsername.textContent = username || 'N/A';
        this.elements.deleteUserEmail.textContent = email || 'N/A';
        this.elements.deleteModal.classList.add('show');
    }
    
    hideDeleteModal() {
        this.selectedUserId = null;
        this.elements.deleteModal.classList.remove('show');
    }
    
    async deleteUser() {
        if (!this.selectedUserId) return;
        
        try {
            // Disable confirm button immediately
            this.elements.deleteConfirmBtn.disabled = true;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            
            const response = await apiService.deleteUser(this.selectedUserId);
            
            if (response.success) {
                this.showNotification('User deleted successfully', 'success');
                this.hideDeleteModal();
                await this.loadUsers();
            } else {
                throw new Error(response.message || 'Error deleting user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification(error.message || 'Error deleting user', 'error');
        } finally {
            // Re-enable confirm button
            this.elements.deleteConfirmBtn.disabled = false;
            this.elements.deleteConfirmBtn.innerHTML = '<i class="fas fa-trash-alt btn-icon"></i> Delete User';
        }
    }
    
    showLoading() {
        if (this.elements.usersTableBody) {
            this.elements.usersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="loading-container">
                            <div class="loading-spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    hideLoading() {
        // Loading state is handled by renderUsers
    }
}

// Create and export page instance
const usersPage = new UsersPage();
export default usersPage;