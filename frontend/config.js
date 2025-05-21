/**
 * Pay Slip Generator System Configuration
 */
const config = {
    // API Endpoint URL - Updated with proper path including /api prefix
    apiBaseUrl: 'http://localhost/testPayRoll/api',
    
    // Company Information
    companyName: 'Your Company Name',
    companyLogo: 'assets/img/logo.png',
    
    // Authentication settings
    authTokenName: 'payslip_auth_token',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
    
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