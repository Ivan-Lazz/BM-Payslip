/**
 * Main application script for the PaySlip Generator
 */

// Initialize the authentication service
const authService = new AuthService();

// Global variables
let currentPage = 'dashboard';

// DOM Elements
const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-link');
const logoutBtn = document.getElementById('logout-btn');
const userNameElement = document.getElementById('user-name');
const userRoleElement = document.getElementById('user-role');
const modalContainer = document.getElementById('modal-container');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set user info
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
        userNameElement.textContent = `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim();
        userRoleElement.textContent = currentUser.type || 'User';
    }

    // Check authentication
    authService.checkAuthAndRedirect(currentPage);

    // Load initial page
    loadPage(currentPage);

    // Add event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page !== currentPage) {
                currentPage = page;
                loadPage(page);
                
                // Update active link
                navLinks.forEach(link => link.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Logout event
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authService.logout();
        });
    }

    // Modal close event
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            closeModal();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });
});

/**
 * Load a page into the main content area
 * @param {string} page - The page to load
 */
function loadPage(page) {
    // Clear previous content
    mainContent.innerHTML = '';
    
    // Show loading
    const loadingElement = showLoading(mainContent);
    
    // Load the page content
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'accounts':
            loadAccounts();
            break;
        case 'banking':
            loadBanking();
            break;
        case 'payslips':
            loadPayslips();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
        default:
            loadDashboard();
    }

    // Hide loading after a delay (simulating loading time)
    setTimeout(() => {
        hideLoading(loadingElement);
    }, 500);
}

/**
 * Show a modal dialog
 * @param {string} title - The modal title
 * @param {HTMLElement|string} content - The modal content
 * @param {function} onClose - Callback for when the modal is closed
 */
function showModal(title, content, onClose) {
    modalBody.innerHTML = '';
    
    // Add title
    const titleElement = document.createElement('h2');
    titleElement.className = 'form-title';
    titleElement.textContent = title;
    modalBody.appendChild(titleElement);
    
    // Add content
    if (typeof content === 'string') {
        modalBody.innerHTML += content;
    } else {
        modalBody.appendChild(content);
    }
    
    // Show modal
    modalContainer.style.display = 'block';
    
    // Set close handler
    closeModal.onclick = () => {
        closeModal();
        if (onClose && typeof onClose === 'function') {
            onClose();
        }
    };
}

/**
 * Close the modal dialog
 */
function closeModal() {
    modalContainer.style.display = 'none';
    modalBody.innerHTML = '';
}

/**
 * Load the dashboard page
 */
function loadDashboard() {
    // This function can be expanded to load actual dashboard data
    // For now, we'll just show a placeholder
    mainContent.innerHTML = document.querySelector('.dashboard-page').outerHTML;
    
    // Initialize charts
    initDashboardCharts();
}

/**
 * Initialize dashboard charts
 */
function initDashboardCharts() {
    // Monthly payouts chart
    const monthlyPayoutsCtx = document.getElementById('monthly-payouts-chart');
    if (monthlyPayoutsCtx) {
        // Replace the placeholder
        monthlyPayoutsCtx.innerHTML = '';
        
        // Create canvas for chart
        const canvas = document.createElement('canvas');
        monthlyPayoutsCtx.appendChild(canvas);
        
        // Sample data - in a real app, this would come from an API
        const monthlyData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Total Payouts',
                backgroundColor: 'rgba(67, 97, 238, 0.2)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 2,
                data: [42000, 49000, 44000, 56000, 55000, 60000, 58000, 59000, 63000, 68000, 72000, 75000]
            }]
        };
        
        // Create chart
        new Chart(canvas, {
            type: 'line',
            data: monthlyData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '$' + context.raw.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Department distribution chart
    const deptChartCtx = document.getElementById('department-distribution-chart');
    if (deptChartCtx) {
        // Replace the placeholder
        deptChartCtx.innerHTML = '';
        
        // Create canvas for chart
        const canvas = document.createElement('canvas');
        deptChartCtx.appendChild(canvas);
        
        // Sample data - in a real app, this would come from an API
        const deptData = {
            labels: ['Team Leader', 'Overflow', 'Auto-Warranty', 'Commissions'],
            datasets: [{
                label: 'Employees',
                backgroundColor: [
                    'rgba(67, 97, 238, 0.6)',
                    'rgba(72, 149, 239, 0.6)',
                    'rgba(45, 198, 83, 0.6)',
                    'rgba(114, 9, 183, 0.6)'
                ],
                borderColor: [
                    'rgba(67, 97, 238, 1)',
                    'rgba(72, 149, 239, 1)',
                    'rgba(45, 198, 83, 1)',
                    'rgba(114, 9, 183, 1)'
                ],
                borderWidth: 1,
                data: [42, 65, 38, 111]
            }]
        };
        
        // Create chart
        new Chart(canvas, {
            type: 'doughnut',
            data: deptData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

/**
 * Load the employees page
 * @param {number} page - The page number to load
 * @param {string} search - The search term
 */
async function loadEmployees(page = 1, search = '') {
    try {
        // Show loading
        const loadingElement = showLoading(mainContent, 'Loading employees...');
        
        // Get employees data
        const employeesData = await apiService.getEmployees(page, CONFIG.PAGINATION.DEFAULT_ITEMS_PER_PAGE, search);
        
        // Create the page content
        const pageContent = document.createElement('div');
        pageContent.className = 'employees-page';
        
        // Page header
        const header = document.createElement('div');
        header.className = 'page-header';
        header.innerHTML = `
            <h1 class="page-title">Employees</h1>
            <div class="page-actions">
                <button class="btn btn-primary" id="add-employee-btn">
                    <i class="fas fa-plus"></i> Add Employee
                </button>
            </div>
        `;
        pageContent.appendChild(header);
        
        // Search and filters
        const filters = document.createElement('div');
        filters.className = 'filters';
        filters.innerHTML = `
            <div class="header-search" style="width: 100%; max-width: 400px; margin-bottom: 20px;">
                <i class="fas fa-search"></i>
                <input type="text" id="employee-search" placeholder="Search employees..." value="${search}">
            </div>
        `;
        pageContent.appendChild(filters);
        
        // Employees table
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        if (employeesData.data.length === 0) {
            tableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No employees found</p>
                    <button class="btn btn-primary" id="add-employee-empty-btn">
                        <i class="fas fa-plus"></i> Add Employee
                    </button>
                </div>
            `;
        } else {
            tableContainer.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Contact Number</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employeesData.data.map(employee => `
                            <tr>
                                <td>${employee.employee_id}</td>
                                <td>${employee.firstname}</td>
                                <td>${employee.lastname}</td>
                                <td>${employee.contact_number}</td>
                                <td>${employee.email}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn action-btn-view" data-id="${employee.employee_id}" title="View">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="action-btn action-btn-edit" data-id="${employee.employee_id}" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="action-btn action-btn-delete" data-id="${employee.employee_id}" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            // Add pagination
            const pagination = createPagination({
                current_page: page,
                total: employeesData.total,
                per_page: employeesData.per_page
            }, (newPage) => {
                loadEmployees(newPage, search);
            });
            
            tableContainer.appendChild(pagination);
        }
        
        pageContent.appendChild(tableContainer);
        
        // Replace content
        mainContent.innerHTML = '';
        mainContent.appendChild(pageContent);
        
        // Add event listeners
        document.getElementById('add-employee-btn').addEventListener('click', () => {
            showAddEmployeeForm();
        });
        
        const addEmptyBtn = document.getElementById('add-employee-empty-btn');
        if (addEmptyBtn) {
            addEmptyBtn.addEventListener('click', () => {
                showAddEmployeeForm();
            });
        }
        
        const searchInput = document.getElementById('employee-search');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    loadEmployees(1, searchInput.value);
                }
            });
        }
        
        const viewButtons = document.querySelectorAll('.action-btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const employeeId = button.getAttribute('data-id');
                viewEmployee(employeeId);
            });
        });
        
        const editButtons = document.querySelectorAll('.action-btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const employeeId = button.getAttribute('data-id');
                editEmployee(employeeId);
            });
        });
        
        const deleteButtons = document.querySelectorAll('.action-btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const employeeId = button.getAttribute('data-id');
                deleteEmployee(employeeId);
            });
        });
        
        // Hide loading
        hideLoading(loadingElement);
        
    } catch (error) {
        console.error('Error loading employees:', error);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading employees: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadEmployees()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

/**
 * Show the form to add a new employee
 */
function showAddEmployeeForm() {
    // Create the form
    const form = document.createElement('form');
    form.id = 'add-employee-form';
    form.className = 'form-container';
    
    form.innerHTML = `
        <div class="form-group">
            <label for="employee_id" class="form-label">Employee ID</label>
            <input type="text" id="employee_id" name="employee_id" class="form-control" readonly placeholder="Auto-generated">
        </div>
        <div class="form-group">
            <label for="firstname" class="form-label">First Name</label>
            <input type="text" id="firstname" name="firstname" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="lastname" class="form-label">Last Name</label>
            <input type="text" id="lastname" name="lastname" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="contact_number" class="form-label">Contact Number</label>
            <input type="text" id="contact_number" name="contact_number" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input type="email" id="email" name="email" class="form-control" required>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="cancel-add-employee">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Employee</button>
        </div>
    `;
    
    // Show the modal
    showModal('Add New Employee', form, () => {
        // Modal closed
    });
    
    // Add event listeners
    document.getElementById('cancel-add-employee').addEventListener('click', () => {
        closeModal();
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const employeeData = {
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            contact_number: formData.get('contact_number'),
            email: formData.get('email')
        };
        
        try {
            // Show loading inside the modal
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            
            // Create the employee
            const result = await apiService.createEmployee(employeeData);
            
            // Close the modal and show success message
            closeModal();
            
            // Show success alert
            const alertContainer = document.createElement('div');
            mainContent.prepend(alertContainer);
            showAlert('Employee added successfully!', 'success', alertContainer);
            
            // Reload the employees list
            loadEmployees();
            
        } catch (error) {
            console.error('Error adding employee:', error);
            
            // Show error inside the form
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.innerHTML = `
                <i class="alert-icon fas fa-exclamation-circle"></i>
                <div>Error: ${error.message}</div>
            `;
            form.prepend(errorDiv);
            
            // Reset button
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Employee';
        }
    });
}

/**
 * View an employee
 * @param {string} employeeId - The employee ID
 */
async function viewEmployee(employeeId) {
    try {
        // Show loading in the modal
        const loadingContent = createLoadingSpinner('Loading employee details...');
        showModal('Employee Details', loadingContent);
        
        // Get employee data
        const employee = await apiService.getEmployee(employeeId);
        
        // Create the content
        const content = document.createElement('div');
        content.className = 'employee-details';
        
        content.innerHTML = `
            <div class="detail-section">
                <h3>Employee Information</h3>
                <div class="detail-group">
                    <label>Employee ID:</label>
                    <p>${employee.employee_id}</p>
                </div>
                <div class="detail-group">
                    <label>Name:</label>
                    <p>${employee.firstname} ${employee.lastname}</p>
                </div>
                <div class="detail-group">
                    <label>Contact Number:</label>
                    <p>${employee.contact_number}</p>
                </div>
                <div class="detail-group">
                    <label>Email:</label>
                    <p>${employee.email}</p>
                </div>
            </div>
            
            ${employee.banking && employee.banking.length > 0 ? `
                <div class="detail-section">
                    <h3>Banking Details</h3>
                    ${employee.banking.map(bank => `
                        <div class="bank-detail">
                            <div class="detail-group">
                                <label>Bank:</label>
                                <p>${bank.preferred_bank}</p>
                            </div>
                            <div class="detail-group">
                                <label>Account Number:</label>
                                <p>${bank.bank_account}</p>
                            </div>
                            <div class="detail-group">
                                <label>Details:</label>
                                <p>${bank.bank_details}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${employee.account ? `
                <div class="detail-section">
                    <h3>Account Information</h3>
                    <div class="detail-group">
                        <label>Account Email:</label>
                        <p>${employee.account.account_email}</p>
                    </div>
                    <div class="detail-group">
                        <label>Account Type:</label>
                        <p>${employee.account.account_type}</p>
                    </div>
                    <div class="detail-group">
                        <label>Account Status:</label>
                        <p>${employee.account.account_status}</p>
                    </div>
                </div>
            ` : ''}
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="close-view-employee">Close</button>
                <button type="button" class="btn btn-primary" id="edit-view-employee" data-id="${employee.employee_id}">Edit</button>
            </div>
        `;
        
        // Update modal content
        modalBody.innerHTML = '';
        const titleElement = document.createElement('h2');
        titleElement.className = 'form-title';
        titleElement.textContent = 'Employee Details';
        modalBody.appendChild(titleElement);
        modalBody.appendChild(content);
        
        // Add event listeners
        document.getElementById('close-view-employee').addEventListener('click', () => {
            closeModal();
        });
        
        document.getElementById('edit-view-employee').addEventListener('click', () => {
            const employeeId = this.getAttribute('data-id');
            closeModal();
            editEmployee(employeeId);
        });
        
    } catch (error) {
        console.error('Error viewing employee:', error);
        
        // Show error in the modal
        modalBody.innerHTML = '';
        const titleElement = document.createElement('h2');
        titleElement.className = 'form-title';
        titleElement.textContent = 'Error';
        modalBody.appendChild(titleElement);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <i class="alert-icon fas fa-exclamation-circle"></i>
            <div>Error loading employee details: ${error.message}</div>
        `;
        modalBody.appendChild(errorDiv);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            closeModal();
        });
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'form-actions';
        buttonContainer.appendChild(closeButton);
        modalBody.appendChild(buttonContainer);
    }
}

/**
 * Edit an employee
 * @param {string} employeeId - The employee ID
 */
async function editEmployee(employeeId) {
    try {
        // Show loading in the modal
        const loadingContent = createLoadingSpinner('Loading employee details...');
        showModal('Edit Employee', loadingContent);
        
        // Get employee data
        const employee = await apiService.getEmployee(employeeId);
        
        // Create the form
        const form = document.createElement('form');
        form.id = 'edit-employee-form';
        form.className = 'form-container';
        
        form.innerHTML = `
            <div class="form-group">
                <label for="employee_id" class="form-label">Employee ID</label>
                <input type="text" id="employee_id" name="employee_id" class="form-control" readonly value="${employee.employee_id}">
            </div>
            <div class="form-group">
                <label for="firstname" class="form-label">First Name</label>
                <input type="text" id="firstname" name="firstname" class="form-control" required value="${employee.firstname}">
            </div>
            <div class="form-group">
                <label for="lastname" class="form-label">Last Name</label>
                <input type="text" id="lastname" name="lastname" class="form-control" required value="${employee.lastname}">
            </div>
            <div class="form-group">
                <label for="contact_number" class="form-label">Contact Number</label>
                <input type="text" id="contact_number" name="contact_number" class="form-control" required value="${employee.contact_number}">
            </div>
            <div class="form-group">
                <label for="email" class="form-label">Email Address</label>
                <input type="email" id="email" name="email" class="form-control" required value="${employee.email}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-edit-employee">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        `;
        
        // Update modal content
        modalBody.innerHTML = '';
        const titleElement = document.createElement('h2');
        titleElement.className = 'form-title';
        titleElement.textContent = 'Edit Employee';
        modalBody.appendChild(titleElement);
        modalBody.appendChild(form);
        
        // Add event listeners
        document.getElementById('cancel-edit-employee').addEventListener('click', () => {
            closeModal();
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const employeeData = {
                firstname: formData.get('firstname'),
                lastname: formData.get('lastname'),
                contact_number: formData.get('contact_number'),
                email: formData.get('email')
            };
            
            try {
                // Show loading inside the form
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                
                // Update the employee
                await apiService.updateEmployee(employeeId, employeeData);
                
                // Close the modal and show success message
                closeModal();
                
                // Show success alert
                const alertContainer = document.createElement('div');
                mainContent.prepend(alertContainer);
                showAlert('Employee updated successfully!', 'success', alertContainer);
                
                // Reload the employees list
                loadEmployees();
                
            } catch (error) {
                console.error('Error updating employee:', error);
                
                // Show error inside the form
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger';
                errorDiv.innerHTML = `
                    <i class="alert-icon fas fa-exclamation-circle"></i>
                    <div>Error: ${error.message}</div>
                `;
                form.prepend(errorDiv);
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
        
    } catch (error) {
        console.error('Error loading employee for editing:', error);
        
        // Show error in the modal
        modalBody.innerHTML = '';
        const titleElement = document.createElement('h2');
        titleElement.className = 'form-title';
        titleElement.textContent = 'Error';
        modalBody.appendChild(titleElement);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <i class="alert-icon fas fa-exclamation-circle"></i>
            <div>Error loading employee details: ${error.message}</div>
        `;
        modalBody.appendChild(errorDiv);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            closeModal();
        });
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'form-actions';
        buttonContainer.appendChild(closeButton);
        modalBody.appendChild(buttonContainer);
    }
}

/**
 * Delete an employee
 * @param {string} employeeId - The employee ID
 */
function deleteEmployee(employeeId) {
    // Create confirmation dialog
    const content = document.createElement('div');
    content.innerHTML = `
        <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="cancel-delete-employee">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirm-delete-employee">Delete</button>
        </div>
    `;
    
    // Show the modal
    showModal('Confirm Deletion', content);
    
    // Add event listeners
    document.getElementById('cancel-delete-employee').addEventListener('click', () => {
        closeModal();
    });
    
    document.getElementById('confirm-delete-employee').addEventListener('click', async () => {
        try {
            // Show loading
            const deleteBtn = document.getElementById('confirm-delete-employee');
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            
            // Delete the employee
            await apiService.deleteEmployee(employeeId);
            
            // Close the modal and show success message
            closeModal();
            
            // Show success alert
            const alertContainer = document.createElement('div');
            mainContent.prepend(alertContainer);
            showAlert('Employee deleted successfully!', 'success', alertContainer);
            
            // Reload the employees list
            loadEmployees();
            
        } catch (error) {
            console.error('Error deleting employee:', error);
            
            // Show error inside the modal
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.innerHTML = `
                <i class="alert-icon fas fa-exclamation-circle"></i>
                <div>Error: ${error.message}</div>
            `;
            content.prepend(errorDiv);
            
            // Reset button
            const deleteBtn = document.getElementById('confirm-delete-employee');
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = 'Delete';
        }
    });
}

/**
 * Load the accounts page
 */
function loadAccounts() {
    // This function can be expanded to load actual accounts data
    // For now, we'll just show a placeholder
    mainContent.innerHTML = `
        <div class="accounts-page">
            <h1 class="page-title">Accounts</h1>
            <p>This page is under construction.</p>
        </div>
    `;
}

/**
 * Load the banking page
 */
function loadBanking() {
    // This function can be expanded to load actual banking data
    // For now, we'll just show a placeholder
    mainContent.innerHTML = `
        <div class="banking-page">
            <h1 class="page-title">Banking</h1>
            <p>This page is under construction.</p>
        </div>
    `;
}

/**
 * Load the payslips page
 */
function loadPayslips() {
    // Create the page content
    const pageContent = document.createElement('div');
    pageContent.className = 'payslip-page';
    
    // Page header
    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
        <h1 class="page-title">Payslip Generator</h1>
        <div class="page-actions">
            <button class="btn btn-primary" id="view-payslips-btn">
                <i class="fas fa-list"></i> View All Payslips
            </button>
        </div>
    `;
    pageContent.appendChild(header);
    
    // Create the split container
    const splitContainer = document.createElement('div');
    splitContainer.className = 'split-container';
    
    // Form container
    const formContainer = document.createElement('div');
    formContainer.className = 'payslip-form-container';
    formContainer.innerHTML = `
        <h2>Create Payslip</h2>
        <form id="payslip-form" class="form-container">
            <div class="form-group">
                <label for="employee_id" class="form-label">Employee ID</label>
                <select id="employee_id" name="employee_id" class="form-select" required>
                    <option value="">Select Employee</option>
                    <!-- Options will be loaded dynamically -->
                </select>
            </div>
            <div class="form-group">
                <label for="agent_name" class="form-label">Agent Name</label>
                <input type="text" id="agent_name" name="agent_name" class="form-control" readonly>
            </div>
            <div class="form-group">
                <label for="bank_acct" class="form-label">Bank Account</label>
                <select id="bank_acct" name="bank_acct" class="form-select" required>
                    <option value="">Select Bank Account</option>
                    <!-- Options will be loaded dynamically -->
                </select>
            </div>
            <div class="form-group">
                <label for="bank_details" class="form-label">Bank Details/Holder</label>
                <input type="text" id="bank_details" name="bank_details" class="form-control" readonly>
            </div>
            <div class="form-group">
                <label for="person_in_charge" class="form-label">Person In Charge</label>
                <input type="text" id="person_in_charge" name="person_in_charge" class="form-control" readonly>
            </div>
            <div class="form-group">
                <label for="date_of_payment" class="form-label">Payment Date</label>
                <input type="date" id="date_of_payment" name="date_of_payment" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="cutoff_date" class="form-label">Cutoff Date</label>
                <input type="date" id="cutoff_date" name="cutoff_date" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="salary" class="form-label">Salary</label>
                <input type="number" id="salary" name="salary" class="form-control" required min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="bonus" class="form-label">Bonus</label>
                <input type="number" id="bonus" name="bonus" class="form-control" min="0" step="0.01" value="0">
            </div>
            <div class="form-group">
                <label for="total_salary" class="form-label">Total Salary</label>
                <input type="text" id="total_salary" name="total_salary" class="form-control" readonly>
            </div>
            <div class="form-group">
                <label for="payment_status" class="form-label">Status</label>
                <select id="payment_status" name="payment_status" class="form-select" required>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="reset-payslip-btn">Reset</button>
                <button type="submit" class="btn btn-primary">Generate Payslip</button>
            </div>
        </form>
    `;
    
    // Preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'payslip-preview';
    previewContainer.innerHTML = `
        <h2>Payslip Preview</h2>
        <div id="payslip-preview-content">
            <div class="empty-preview">
                <i class="fas fa-file-invoice-dollar"></i>
                <p>Fill out the form to generate a payslip preview</p>
            </div>
        </div>
    `;
    
    // Add containers to split container
    splitContainer.appendChild(formContainer);
    splitContainer.appendChild(previewContainer);
    
    // Add split container to page
    pageContent.appendChild(splitContainer);
    
    // Replace content
    mainContent.innerHTML = '';
    mainContent.appendChild(pageContent);
    
    // Initialize the payslip form
    initPayslipForm();
}

/**
 * Initialize the payslip form
 */
async function initPayslipForm() {
    try {
        // Get form elements
        const form = document.getElementById('payslip-form');
        const employeeSelect = document.getElementById('employee_id');
        const agentNameInput = document.getElementById('agent_name');
        const bankAccountSelect = document.getElementById('bank_acct');
        const bankDetailsInput = document.getElementById('bank_details');
        const personInChargeInput = document.getElementById('person_in_charge');
        const dateInput = document.getElementById('date_of_payment');
        const cutoffDateInput = document.getElementById('cutoff_date');
        const salaryInput = document.getElementById('salary');
        const bonusInput = document.getElementById('bonus');
        const totalSalaryInput = document.getElementById('total_salary');
        const statusSelect = document.getElementById('payment_status');
        const resetBtn = document.getElementById('reset-payslip-btn');
        const previewContainer = document.getElementById('payslip-preview-content');
        
        // Set current user as person in charge
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            personInChargeInput.value = `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim();
        }
        
        // Set default dates
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
        
        // Calculate cutoff date (15 days ago)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 15);
        cutoffDateInput.value = cutoffDate.toISOString().split('T')[0];
        
        // Load employees
        try {
            const employeesData = await apiService.getEmployees(1, 100); // Get up to 100 employees
            
            employeeSelect.innerHTML = '<option value="">Select Employee</option>';
            
            employeesData.data.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.employee_id;
                option.textContent = `${employee.employee_id} - ${employee.firstname} ${employee.lastname}`;
                option.dataset.firstname = employee.firstname;
                option.dataset.lastname = employee.lastname;
                employeeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading employees:', error);
            showAlert('Error loading employees. Please try again.', 'danger', form.parentNode);
        }
        
        // Employee select change event
        employeeSelect.addEventListener('change', async () => {
            const selectedOption = employeeSelect.options[employeeSelect.selectedIndex];
            
            if (selectedOption.value) {
                // Update agent name
                const firstname = selectedOption.dataset.firstname;
                const lastname = selectedOption.dataset.lastname;
                agentNameInput.value = `${firstname} ${lastname}`;
                
                // Load bank accounts
                try {
                    const employee = await apiService.getEmployee(selectedOption.value);
                    
                    bankAccountSelect.innerHTML = '<option value="">Select Bank Account</option>';
                    
                    if (employee.banking && employee.banking.length > 0) {
                        employee.banking.forEach(bank => {
                            const option = document.createElement('option');
                            option.value = bank.bank_account;
                            option.textContent = `${bank.preferred_bank} - ${bank.bank_account}`;
                            option.dataset.details = bank.bank_details;
                            bankAccountSelect.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('Error loading employee details:', error);
                    bankAccountSelect.innerHTML = '<option value="">No bank accounts found</option>';
                }
            } else {
                // Clear fields
                agentNameInput.value = '';
                bankAccountSelect.innerHTML = '<option value="">Select Bank Account</option>';
                bankDetailsInput.value = '';
            }
            
            // Update preview
            updatePayslipPreview();
        });
        
        // Bank account select change event
        bankAccountSelect.addEventListener('change', () => {
            const selectedOption = bankAccountSelect.options[bankAccountSelect.selectedIndex];
            
            if (selectedOption.value) {
                // Update bank details
                bankDetailsInput.value = selectedOption.dataset.details || '';
            } else {
                bankDetailsInput.value = '';
            }
            
            // Update preview
            updatePayslipPreview();
        });
        
        // Salary and bonus input events
        salaryInput.addEventListener('input', () => {
            calculateTotal();
            updatePayslipPreview();
        });
        
        bonusInput.addEventListener('input', () => {
            calculateTotal();
            updatePayslipPreview();
        });
        
        // Date input events
        dateInput.addEventListener('change', () => {
            updatePayslipPreview();
        });
        
        cutoffDateInput.addEventListener('change', () => {
            updatePayslipPreview();
        });
        
        // Status select change event
        statusSelect.addEventListener('change', () => {
            updatePayslipPreview();
        });
        
        // Calculate total salary
        function calculateTotal() {
            const salary = parseFloat(salaryInput.value) || 0;
            const bonus = parseFloat(bonusInput.value) || 0;
            const total = salary + bonus;
            
            totalSalaryInput.value = formatCurrency(total);
        }
        
        // Reset form
        resetBtn.addEventListener('click', () => {
            form.reset();
            
            // Set default values again
            const today = new Date();
            dateInput.value = today.toISOString().split('T')[0];
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 15);
            cutoffDateInput.value = cutoffDate.toISOString().split('T')[0];
            
            if (currentUser) {
                personInChargeInput.value = `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim();
            }
            
            // Clear preview
            previewContainer.innerHTML = `
                <div class="empty-preview">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <p>Fill out the form to generate a payslip preview</p>
                </div>
            `;
        });
        
        // Form submit event
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate form
            const formData = new FormData(form);
            
            // Convert FormData to object
            const payslipData = {
                employee_id: formData.get('employee_id'),
                bank_acct: formData.get('bank_acct'),
                salary: parseFloat(formData.get('salary')) || 0,
                bonus: parseFloat(formData.get('bonus')) || 0,
                amount: parseFloat(formData.get('salary')) + parseFloat(formData.get('bonus')) || 0,
                person_in_charge: formData.get('person_in_charge'),
                cutoff_date: formData.get('cutoff_date'),
                date_of_payment: formData.get('date_of_payment'),
                payment_status: formData.get('payment_status')
            };
            
            // Validate required fields
            if (!payslipData.employee_id || !payslipData.bank_acct || !payslipData.salary) {
                showAlert('Please fill out all required fields', 'danger', form.parentNode);
                return;
            }
            
            try {
                // Show loading inside the form
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
                
                // Create the payslip
                const result = await apiService.createPayslip(payslipData);
                
                // Show success message
                showAlert('Payslip generated successfully!', 'success', form.parentNode);
                
                // Update the payslip preview with PDF buttons
                updatePayslipPreview(result.payslip_no);
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
            } catch (error) {
                console.error('Error generating payslip:', error);
                
                // Show error message
                showAlert(`Error generating payslip: ${error.message}`, 'danger', form.parentNode);
                
                // Reset button
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Generate Payslip';
            }
        });
        
        // Initialize the preview
        updatePayslipPreview();
        
        // Update payslip preview
        function updatePayslipPreview(payslipNo = null) {
            // Get form data
            const employeeId = employeeSelect.value;
            const employeeName = agentNameInput.value;
            const bankAccount = bankAccountSelect.value;
            const bankDetails = bankDetailsInput.value;
            const personInCharge = personInChargeInput.value;
            const paymentDate = dateInput.value ? formatDate(new Date(dateInput.value), 'LONG') : '';
            const cutoffDate = cutoffDateInput.value ? formatDate(new Date(cutoffDateInput.value), 'LONG') : '';
            const salary = parseFloat(salaryInput.value) || 0;
            const bonus = parseFloat(bonusInput.value) || 0;
            const totalSalary = salary + bonus;
            const status = statusSelect.value;
            
            // Check if we have enough data to show a preview
            if (!employeeId || !employeeName) {
                previewContainer.innerHTML = `
                    <div class="empty-preview">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <p>Fill out the form to generate a payslip preview</p>
                    </div>
                `;
                return;
            }
            
            // Create preview HTML
            let previewHTML = `
                <div class="payslip-preview-header">
                    <img src="${CONFIG.COMPANY.LOGO_URL}" alt="${CONFIG.COMPANY.NAME}" class="company-logo">
                    <div class="company-info">
                        <h3 class="company-name">${CONFIG.COMPANY.NAME}</h3>
                        <p class="company-address">${CONFIG.COMPANY.ADDRESS}</p>
                        <p class="company-contact">${CONFIG.COMPANY.EMAIL} | ${CONFIG.COMPANY.PHONE}</p>
                    </div>
                </div>
                <h2 class="payslip-title">PAYSLIP</h2>
                <div class="payslip-details">
                    <div class="detail-group">
                        <h3>Employee ID</h3>
                        <p class="detail-value">${employeeId}</p>
                    </div>
                    <div class="detail-group">
                        <h3>Name</h3>
                        <p class="detail-value">${employeeName}</p>
                    </div>
                    <div class="detail-group">
                        <h3>Cutoff Date</h3>
                        <p class="detail-value">${cutoffDate}</p>
                    </div>
                    <div class="detail-group">
                        <h3>Payment Date</h3>
                        <p class="detail-value">${paymentDate}</p>
                    </div>
                </div>
                
                ${bankAccount ? `
                <div class="payslip-details">
                    <div class="detail-group">
                        <h3>Bank Account</h3>
                        <p class="detail-value">${bankAccount}</p>
                    </div>
                    <div class="detail-group">
                        <h3>Bank Details</h3>
                        <p class="detail-value">${bankDetails}</p>
                    </div>
                </div>
                ` : ''}
                
                <div class="payment-details">
                    <h3>Payment Details</h3>
                    <div class="payment-row">
                        <span class="payment-label">Basic Salary</span>
                        <span class="payment-value">${formatCurrency(salary)}</span>
                    </div>
                    <div class="payment-row">
                        <span class="payment-label">Bonus</span>
                        <span class="payment-value">${formatCurrency(bonus)}</span>
                    </div>
                    <div class="payment-row total-row">
                        <span class="payment-label">Total Salary</span>
                        <span class="payment-value">${formatCurrency(totalSalary)}</span>
                    </div>
                </div>
                
                <div class="payslip-status">
                    <h3>Status</h3>
                    <p class="detail-value">${status}</p>
                </div>
                
                <div class="payslip-footer">
                    <p>This is a computer-generated document. No signature is required.</p>
                    <p>For any queries regarding this payslip, please contact the person in charge: ${personInCharge}</p>
                </div>
            `;
            
            // Add PDF buttons if payslip has been generated
            if (payslipNo) {
                const payslipData = {
                    payslip_no: payslipNo,
                    employee_id: employeeId,
                    firstname: employeeName.split(' ')[0] || '',
                    lastname: employeeName.split(' ').slice(1).join(' ') || '',
                    bank_acct: bankAccount,
                    preferred_bank: bankAccount ? bankAccount.split(' - ')[0] : '',
                    bank_details: bankDetails,
                    person_in_charge: personInCharge,
                    date_of_payment: dateInput.value,
                    cutoff_date: cutoffDateInput.value,
                    salary: salary,
                    bonus: bonus,
                    amount: totalSalary,
                    payment_status: status
                };
                
                previewHTML += `
                    <div class="pdf-buttons">
                        <button class="pdf-btn pdf-btn-agent" id="generate-agent-pdf">
                            <i class="fas fa-file-pdf"></i> Generate Agent PDF
                        </button>
                        <button class="pdf-btn pdf-btn-admin" id="generate-admin-pdf">
                            <i class="fas fa-file-pdf"></i> Generate Admin PDF
                        </button>
                    </div>
                `;
                
                // Update preview
                previewContainer.innerHTML = previewHTML;
                
                // Add event listeners for PDF buttons
                document.getElementById('generate-agent-pdf').addEventListener('click', () => {
                    generateAgentPayslipPDF(payslipData);
                });
                
                document.getElementById('generate-admin-pdf').addEventListener('click', () => {
                    generateAdminPayslipPDF(payslipData);
                });
            } else {
                // Update preview
                previewContainer.innerHTML = previewHTML;
            }
        }
        
        // View All Payslips button
        document.getElementById('view-payslips-btn').addEventListener('click', () => {
            loadPayslipsList();
        });
        
    } catch (error) {
        console.error('Error initializing payslip form:', error);
        showAlert('Error initializing payslip form. Please try again.', 'danger', mainContent);
    }
}

/**
 * Load the payslips list page
 * @param {number} page - The page number to load
 * @param {string} search - The search term
 */
async function loadPayslipsList(page = 1, search = '') {
    try {
        // Show loading
        const loadingElement = showLoading(mainContent, 'Loading payslips...');
        
        // Get payslips data
        const payslipsData = await apiService.getPayslips(page, CONFIG.PAGINATION.DEFAULT_ITEMS_PER_PAGE, search);
        
        // Create the page content
        const pageContent = document.createElement('div');
        pageContent.className = 'payslips-list-page';
        
        // Page header
        const header = document.createElement('div');
        header.className = 'page-header';
        header.innerHTML = `
            <h1 class="page-title">Payslips</h1>
            <div class="page-actions">
                <button class="btn btn-primary" id="create-payslip-btn">
                    <i class="fas fa-plus"></i> Create Payslip
                </button>
            </div>
        `;
        pageContent.appendChild(header);
        
        // Search and filters
        const filters = document.createElement('div');
        filters.className = 'filters';
        filters.innerHTML = `
            <div class="header-search" style="width: 100%; max-width: 400px; margin-bottom: 20px;">
                <i class="fas fa-search"></i>
                <input type="text" id="payslip-search" placeholder="Search payslips..." value="${search}">
            </div>
        `;
        pageContent.appendChild(filters);
        
        // Payslips table
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        if (payslipsData.data.length === 0) {
            tableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <p>No payslips found</p>
                    <button class="btn btn-primary" id="create-payslip-empty-btn">
                        <i class="fas fa-plus"></i> Create Payslip
                    </button>
                </div>
            `;
        } else {
            tableContainer.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Payslip No</th>
                            <th>Employee ID</th>
                            <th>Payment Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payslipsData.data.map(payslip => `
                            <tr>
                                <td>${payslip.payslip_no}</td>
                                <td>${payslip.employee_id}</td>
                                <td>${formatDate(payslip.date_of_payment, 'MEDIUM')}</td>
                                <td>${formatCurrency(payslip.amount)}</td>
                                <td>
                                    <span class="status-badge status-${payslip.payment_status.toLowerCase()}">
                                        ${payslip.payment_status}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn action-btn-view" data-id="${payslip.payslip_no}" title="View">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="action-btn action-btn-print" data-id="${payslip.payslip_no}" title="Print">
                                            <i class="fas fa-print"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            // Add pagination
            const pagination = createPagination({
                current_page: page,
                total: payslipsData.total,
                per_page: payslipsData.per_page
            }, (newPage) => {
                loadPayslipsList(newPage, search);
            });
            
            tableContainer.appendChild(pagination);
        }
        
        pageContent.appendChild(tableContainer);
        
        // Replace content
        mainContent.innerHTML = '';
        mainContent.appendChild(pageContent);
        
        // Add event listeners
        document.getElementById('create-payslip-btn').addEventListener('click', () => {
            loadPayslips();
        });
        
        const createEmptyBtn = document.getElementById('create-payslip-empty-btn');
        if (createEmptyBtn) {
            createEmptyBtn.addEventListener('click', () => {
                loadPayslips();
            });
        }
        
        const searchInput = document.getElementById('payslip-search');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    loadPayslipsList(1, searchInput.value);
                }
            });
        }
        
        const viewButtons = document.querySelectorAll('.action-btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const payslipId = button.getAttribute('data-id');
                viewPayslip(payslipId);
            });
        });
        
        const printButtons = document.querySelectorAll('.action-btn-print');
        printButtons.forEach(button => {
            button.addEventListener('click', () => {
                const payslipId = button.getAttribute('data-id');
                printPayslip(payslipId);
            });
        });
        
        // Hide loading
        hideLoading(loadingElement);
        
    } catch (error) {
        console.error('Error loading payslips:', error);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading payslips: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadPayslipsList()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

/**
 * View a payslip
 * @param {string} payslipId - The payslip ID
 */
async function viewPayslip(payslipId) {
    try {
        // Show loading in the modal
        const loadingContent = createLoadingSpinner('Loading payslip details...');
        showModal('Payslip Details', loadingContent);
        
        // Get payslip data
        const payslip = await apiService.getPayslip(payslipId);
        
        // Create the content
        const content = document.createElement('div');
        content.className = 'payslip-details-modal';
        
        content.innerHTML = `
            <div class="detail-section">
                <h3>Payslip Information</h3>
                <div class="detail-group">
                    <label>Payslip No:</label>
                    <p>${payslip.payslip_no}</p>
                </div>
                <div class="detail-group">
                    <label>Employee ID:</label>
                    <p>${payslip.employee_id}</p>
                </div>
                <div class="detail-group">
                    <label>Employee Name:</label>
                    <p>${payslip.firstname} ${payslip.lastname}</p>
                </div>
                <div class="detail-group">
                    <label>Cutoff Date:</label>
                    <p>${formatDate(payslip.cutoff_date, 'LONG')}</p>
                </div>
                <div class="detail-group">
                    <label>Payment Date:</label>
                    <p>${formatDate(payslip.date_of_payment, 'LONG')}</p>
                </div>
                <div class="detail-group">
                    <label>Person In Charge:</label>
                    <p>${payslip.person_in_charge}</p>
                </div>
                <div class="detail-group">
                    <label>Payment Status:</label>
                    <p>${payslip.payment_status}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Bank Information</h3>
                <div class="detail-group">
                    <label>Bank:</label>
                    <p>${payslip.preferred_bank}</p>
                </div>
                <div class="detail-group">
                    <label>Account Number:</label>
                    <p>${payslip.bank_acct}</p>
                </div>
                ${payslip.bank_details ? `
                <div class="detail-group">
                    <label>Account Holder:</label>
                    <p>${payslip.bank_details}</p>
                </div>
                ` : ''}
            </div>
            
            <div class="detail-section">
                <h3>Payment Details</h3>
                <div class="detail-group">
                    <label>Salary:</label>
                    <p>${formatCurrency(payslip.salary)}</p>
                </div>
                <div class="detail-group">
                    <label>Bonus:</label>
                    <p>${formatCurrency(payslip.bonus)}</p>
                </div>
                <div class="detail-group">
                    <label>Total Amount:</label>
                    <p>${formatCurrency(payslip.amount)}</p>
                </div>
            </div>
            
            <div class="pdf-buttons">
                <button class="pdf-btn pdf-btn-agent" id="view-agent-pdf">
                    <i class="fas fa-file-pdf"></i> Generate Agent PDF
                </button>
                <button class="pdf-btn pdf-btn-admin" id="view-admin-pdf">
                    <i class="fas fa-file-pdf"></i> Generate Admin PDF
                </button>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="close-view-payslip">Close</button>
            </div>
        `;
        
        // Update modal content
        modalBody.innerHTML = '';
        const titleElement = document.createElement('h2');
        titleElement.className = 'form-title';
        titleElement.textContent = 'Payslip Details';
        modalBody.appendChild(titleElement);
        modalBody.appendChild(content);
        
        // Add event listeners
        document.getElementById('close-view-payslip').addEventListener('click', () => {
            closeModal();
        });
        
        document.getElementById('view-agent-pdf').addEventListener('click', () => {
            generateAgentPayslipPDF(payslip);
        });
        
        document.getElementById('view-admin-pdf').addEventListener('click', () => {
            generateAdminPayslipPDF(payslip);
        });
        
    } catch (error) {
        console.error('Error viewing payslip:', error);
        
        // Show error in the modal
        modalBody.innerHTML = '';
        const titleElement = document.createElement('h2');
        titleElement.className = 'form-title';
        titleElement.textContent = 'Error';
        modalBody.appendChild(titleElement);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <i class="alert-icon fas fa-exclamation-circle"></i>
            <div>Error loading payslip details: ${error.message}</div>
        `;
        modalBody.appendChild(errorDiv);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            closeModal();
        });
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'form-actions';
        buttonContainer.appendChild(closeButton);
        modalBody.appendChild(buttonContainer);
    }
}

/**
 * Print a payslip (show PDF options)
 * @param {string} payslipId - The payslip ID
 */
async function printPayslip(payslipId) {
    try {
        // Show loading in the modal
        const loadingContent = createLoadingSpinner('Loading payslip...');
        showModal('Print Payslip', loadingContent);
        
        // Get payslip data
        const payslip = await apiService.getPayslip(payslipId);
        
        // Create the content
        const content = document.createElement('div');
        content.className = 'print-payslip-modal';
        
        content.innerHTML = `
            <p>Select the PDF format you would like to generate:</p>
            
            <div class="pdf-options">
                <button class="btn btn-primary pdf-option" id="print-agent-pdf">
                    <i class="fas fa-file-pdf"></i>
                    <span>Agent Payslip</span>
                    <small>Basic payslip for the employee</small>
                </button>
                
                <button class="btn btn-primary pdf-option" id="print-admin-pdf">
                    <i class="fas fa-file-pdf"></i>
                    <span>Admin Payslip</span>
                    <small>Detailed payslip with banking information</small>
                </button>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="close-print-payslip">Cancel</button>
            </div>
        `;
        
        // Update modal content
        modalBody.innerHTML = '';
        const titleElement = document.createElement('h2');
        titleElement.className = 'form-title';
        titleElement.textContent = 'Print Payslip';
        modalBody.appendChild(titleElement);
        modalBody.appendChild(content);
        
        // Add event listeners
        document.getElementById('close-print-payslip').addEventListener('click', () => {
            closeModal();
        });
        
        document.getElementById('print-agent-pdf').addEventListener('click', () => {
            generateAgentPayslipPDF(payslip);
            closeModal();
        });
        
        document.getElementById('print-admin-pdf').addEventListener('click', () => {
            generateAdminPayslipPDF(payslip);
            closeModal();
        });
        
    } catch (error) {
        console.error('Error loading payslip for printing:', error);
        
        // Show error in the modal
        modalBody.innerHTML = '';
        const titleElement = document.createElement('h2');
        titleElement.className = 'form-title';
        titleElement.textContent = 'Error';
        modalBody.appendChild(titleElement);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <i class="alert-icon fas fa-exclamation-circle"></i>
            <div>Error loading payslip: ${error.message}</div>
        `;
        modalBody.appendChild(errorDiv);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            closeModal();
        });
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'form-actions';
        buttonContainer.appendChild(closeButton);
        modalBody.appendChild(buttonContainer);
    }
}

/**
 * Load the reports page
 */
function loadReports() {
    // This function can be expanded to load actual reports data
    // For now, we'll just show a placeholder
    mainContent.innerHTML = `
        <div class="reports-page">
            <h1 class="page-title">Reports</h1>
            <p>This page is under construction.</p>
        </div>
    `;
}

/**
 * Load the settings page
 */
function loadSettings() {
    // This function can be expanded to load actual settings data
    // For now, we'll just show a placeholder
    mainContent.innerHTML = `
        <div class="settings-page">
            <h1 class="page-title">Settings</h1>
            <p>This page is under construction.</p>
        </div>
    `;
}

