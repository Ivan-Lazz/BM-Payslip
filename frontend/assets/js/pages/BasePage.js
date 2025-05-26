import authService from '../services/auth.js';

class BasePage {
    constructor() {
        this.elements = {
            menuToggle: document.getElementById('menu-toggle'),
            sidebar: document.getElementById('sidebar'),
            logoutBtn: document.getElementById('logout-btn'),
            profileBtn: document.getElementById('profile-btn'),
            userName: document.getElementById('user-name')
        };
        
        this.authService = authService;
        
        this.init();
    }
    
    init() {
        // Check authentication
        if (!authService.isAuthenticated()) {
            window.location.href = '/bm-payslip/frontend/pages/login.html';
            return;
        }
        
        // Set user info
        this.updateUserInfo();
        
        // Initialize common event listeners
        this.initializeCommonEventListeners();
    }
    
    updateUserInfo() {
        try {
            const userData = this.authService.getUser();
            console.log('User data from auth service:', userData); // Debug log

            if (!userData) {
                console.warn('No user data found in auth service');
                return;
            }

            const firstName = userData.firstname || '';
            const lastName = userData.lastname || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'User';
            console.log('Full name to display:', fullName); // Debug log

            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = fullName;
            } else {
                console.warn('User name element not found');
            }
        } catch (error) {
            console.error('Error updating user info:', error);
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = 'User';
            }
        }
    }
    
    initializeCommonEventListeners() {
        // Sidebar toggle
        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', () => {
                this.elements.sidebar.classList.toggle('collapsed');
            });
        }
        
        // Logout
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', async () => {
                try {
                    this.elements.logoutBtn.disabled = true;
                    this.elements.logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
                    
                    await authService.logout();
                    window.location.href = '/bm-payslip/frontend/pages/login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    this.showNotification('Error logging out', 'error');
                    this.elements.logoutBtn.disabled = false;
                    this.elements.logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt btn-icon"></i> Logout';
                }
            });
        }
        
        // Profile
        if (this.elements.profileBtn) {
            this.elements.profileBtn.addEventListener('click', () => {
                // TODO: Implement profile page
                this.showNotification('Profile page coming soon', 'info');
            });
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notifications container if it doesn't exist
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.className = 'notifications';
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

export default BasePage; 