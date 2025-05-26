<?php
// Application configuration

// Environment settings - change to 'production' for live site
define('APP_ENV', 'development');

// Base paths and URLs
define('BASE_PATH', dirname(__DIR__));
define('API_URL', '/bm-payslip/backend/api');

// Security settings
define('JWT_SECRET', 'your_strong_secret_key_here_change_in_production'); // Change this in production!
define('JWT_EXPIRY', 3600); // Token validity in seconds (1 hour)
define('PASSWORD_COST', 12); // Cost factor for password_hash
define('SESSION_TIMEOUT', 1800); // Session timeout in seconds (30 minutes)

// CSRF Protection
define('CSRF_ENABLED', true);
define('CSRF_TOKEN_EXPIRY', 3600); // 1 hour

// PDF Generation settings
define('COMPANY_NAME', 'BM Outsourcing');
define('COMPANY_LOGO', BASE_PATH . '/frontend/assets/img/logo.png');

// Pagination defaults
define('DEFAULT_PAGE_SIZE', 10);
define('MAX_PAGE_SIZE', 100);

// Error reporting based on environment
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', BASE_PATH . '/backend/logs/php_errors.log');
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', BASE_PATH . '/backend/logs/php_errors.log');
}

// PDF paths
define('PDF_PATH', BASE_PATH . '/frontend/pdfs');
define('AGENT_PDF_PATH', PDF_PATH . '/agent');
define('ADMIN_PDF_PATH', PDF_PATH . '/admin');

// Set default timezone
date_default_timezone_set('Asia/Manila');

// Initialize required directories
function initDirectories() {
    $directories = [
        BASE_PATH . '/backend/logs',
        PDF_PATH,
        AGENT_PDF_PATH,
        ADMIN_PDF_PATH,
    ];

    foreach ($directories as $dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    // Create .htaccess to protect PDF directories
    $htaccess = "Order Deny,Allow\nDeny from all\n";
    if (!file_exists(PDF_PATH . '/.htaccess')) {
        file_put_contents(PDF_PATH . '/.htaccess', $htaccess);
    }
    
    // Create logs directory .htaccess
    $logsHtaccess = "Order Deny,Allow\nDeny from all\n";
    if (!file_exists(BASE_PATH . '/backend/logs/.htaccess')) {
        file_put_contents(BASE_PATH . '/backend/logs/.htaccess', $logsHtaccess);
    }
}

// Initialize directories when config is loaded
initDirectories();

// Additional error handling for development
if (APP_ENV === 'development') {
    // Custom error handler for better debugging
    set_error_handler(function($errno, $errstr, $errfile, $errline) {
        $error_message = "[" . date('Y-m-d H:i:s') . "] PHP Error ($errno): $errstr in $errfile on line $errline\n";
        error_log($error_message);
        
        // Don't show errors in JSON responses
        if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
            return true; // Don't display error, just log it
        }
        
        return false; // Let PHP handle the error display
    });
}