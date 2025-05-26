import BasePage from './BasePage.js';
import apiService from '../services/api.js';

class DashboardPage extends BasePage {
    constructor() {
        super();
        
        // Initialize dashboard-specific elements
        this.initializeDashboard();
    }
    
    initializeDashboard() {
        // Load dashboard data
        this.loadDashboardData();
    }
    
    async loadDashboardData() {
        try {
            // Load employee count
            const employeesResponse = await apiService.getEmployees();
            const employeesStat = document.getElementById('employees-stat');
            if (employeesStat) {
                employeesStat.querySelector('.stat-value').textContent = 
                    employeesResponse.data.length;
            }
            
            // Load payslips data
            const payslipsResponse = await apiService.getPayslips();
            const payslips = payslipsResponse.data;
            
            // Update payslips count
            const payslipsStat = document.getElementById('payslips-stat');
            if (payslipsStat) {
                payslipsStat.querySelector('.stat-value').textContent = 
                    payslips.length;
            }
            
            // Update pending and paid counts
            const pendingCount = payslips.filter(p => p.payment_status === 'Pending').length;
            const paidCount = payslips.filter(p => p.payment_status === 'Paid').length;
            
            const pendingStat = document.getElementById('pending-stat');
            if (pendingStat) {
                pendingStat.querySelector('.stat-value').textContent = 
                    pendingCount;
            }
            
            const paidStat = document.getElementById('paid-stat');
            if (paidStat) {
                paidStat.querySelector('.stat-value').textContent = 
                    paidCount;
            }
            
            // Load recent payslips
            this.loadRecentPayslips(payslips.slice(0, 5));
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data. Please refresh the page.', 'error');
        }
    }
    
    loadRecentPayslips(payslips) {
        const tbody = document.getElementById('recent-payslips');
        if (!tbody) return;
        
        if (payslips.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No payslips found</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = payslips.map(payslip => `
            <tr>
                <td>${payslip.payslip_no}</td>
                <td>${payslip.employee_name}</td>
                <td>${new Date(payslip.payment_date).toLocaleDateString()}</td>
                <td>₱${parseFloat(payslip.total_salary).toLocaleString()}</td>
                <td>
                    <span class="badge badge-${payslip.payment_status === 'Paid' ? 'success' : 'warning'}">
                        ${payslip.payment_status}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <a href="payslips/view.html?id=${payslip.id}" class="btn btn-sm btn-info">
                            <i class="fas fa-eye"></i>
                        </a>
                        <a href="payslips/edit.html?id=${payslip.id}" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i>
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Initialize dashboard page
new DashboardPage(); 