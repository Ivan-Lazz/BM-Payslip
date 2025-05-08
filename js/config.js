/**
 * Configuration settings for the PaySlip Generator application
 */
const CONFIG = {
    // API Base URL
    API_BASE_URL: 'https://localhost/PaySlipGen/',
    
    // Company Information
    COMPANY: {
        NAME: 'TechPay Solutions',
        ADDRESS: '123 Innovation Drive, Silicon Valley, CA 94025',
        EMAIL: 'payroll@techpaysolutions.com',
        PHONE: '+1 (555) 123-4567',
        WEBSITE: 'www.techpaysolutions.com',
        LOGO_URL: 'img/company-logo.png'
    },
    
    // Pagination settings
    PAGINATION: {
        DEFAULT_ITEMS_PER_PAGE: 10,
        ITEMS_PER_PAGE_OPTIONS: [5, 10, 25, 50]
    },
    
    // Account types
    ACCOUNT_TYPES: [
        'Team Leader',
        'Overflow',
        'Auto-Warranty',
        'Commissions'
    ],
    
    // Account statuses
    ACCOUNT_STATUSES: [
        'Active',
        'Inactive',
        'Suspended'
    ],
    
    // Payment statuses
    PAYMENT_STATUSES: [
        'Paid',
        'Pending',
        'Cancelled'
    ],
    
    // Bank options
    BANKS: [
        'BDO',
        'BPI',
        'Metrobank',
        'Landbank',
        'RCBC',
        'Security Bank',
        'Union Bank',
        'PNB',
        'China Bank',
        'Eastwest Bank'
    ],
    
    // Date format for display
    DATE_FORMAT: {
        SHORT: 'MM/DD/YYYY',
        MEDIUM: 'MMM DD, YYYY',
        LONG: 'MMMM DD, YYYY',
        WITH_TIME: 'MMMM DD, YYYY HH:mm:ss'
    },
    
    // Local storage keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'payslipgen_auth_token',
        USER_DATA: 'payslipgen_user_data'
    }
};