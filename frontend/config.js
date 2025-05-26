/**
 * Pay Slip Generator System Configuration
 */
const config = {
    // API Endpoint URL - Updated to point to the backend in bm-payslip folder
    apiBaseUrl: 'http://localhost/bm-payslip/backend/api',
    
    // Company Information
    companyName: 'BM Outsourcing',
    companyLogo: 'assets/img/logo.png',
    
    // Pagination defaults
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    
    // Account types
    accountTypes: [
        'Team Leader',
        'Overflow',
        'Auto-Warranty',
        'Commissions'
    ],
    
    // Account statuses
    accountStatuses: [
        'Active',
        'Inactive',
        'Suspended'
    ],
    
    // Payment statuses
    paymentStatuses: [
        'Paid',
        'Pending',
        'Cancelled'
    ]
};