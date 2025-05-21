<?php
// Start session for authentication
session_start();

// Load configuration
require_once 'config/config.php';
require_once 'config/db.php';

// Load utilities
require_once 'utils/ResponseHandler.php';
require_once 'utils/InputValidator.php';

// Load middleware
require_once 'middleware/AuthMiddleware.php';

// Set headers for CORS and security
header('Access-Control-Allow-Origin: *'); // Use specific origin in production
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get request URI and method
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Parse URL path
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/testPayRoll/api/', '', $path);
$pathSegments = explode('/', $path);

// Default values
$resource = $pathSegments[0] ?? null;
$id = $pathSegments[1] ?? null;
$subResource = $pathSegments[2] ?? null;

// Log the request (in development mode)
if (defined('APP_ENV') && APP_ENV === 'development') {
    error_log("API Request: " . $requestMethod . " " . $path);
}

// Router function
function routeRequest($resource, $id, $subResource, $method) {
    // Initialize database connection
    $db = (new Database())->getConnection();
    
    // Route to appropriate controller based on resource
    switch ($resource) {
        case 'users':
            require_once __DIR__ . '/controllers/UserController.php';
            $controller = new UserController($db);
            break;
            
        case 'employees':
            require_once __DIR__ . '/controllers/EmployeeController.php';
            $controller = new EmployeeController($db);
            break;
            
        case 'accounts':
            require_once __DIR__ . '/controllers/AccountController.php';
            $controller = new AccountController($db);
            break;
            
        case 'banking':
            require_once __DIR__ . '/controllers/BankingController.php';
            $controller = new BankingController($db);
            break;
            
        case 'payslips':
            require_once __DIR__ . '/controllers/PayslipController.php';
            $controller = new PayslipController($db);
            break;
            
        case 'auth':
            require_once __DIR__ . '/controllers/AuthController.php';
            $controller = new AuthController($db);
            break;
            
        case 'install':
            // Special case for installation
            require_once __DIR__ . '/install/InstallController.php';
            $controller = new InstallController($db);
            break;
            
        default:
            // Resource not found
            ResponseHandler::notFound('Endpoint not found');
            break;
    }
    
    // Call the controller's handleRequest method
    $controller->handleRequest($method, $id, $subResource);
}

// Main execution
try {
    // Route the request
    routeRequest($resource, $id, $subResource, $requestMethod);
} catch (Exception $e) {
    // Log the error
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/errors.log';
    $logData = date('[Y-m-d H:i:s]') . ' ' . $e->getMessage() . ' in ' . 
               $e->getFile() . ' on line ' . $e->getLine() . "\n";
    file_put_contents($logFile, $logData, FILE_APPEND);
    
    // Return error response (without exposing sensitive details in production)
    if (APP_ENV === 'development') {
        ResponseHandler::serverError('Server error: ' . $e->getMessage());
    } else {
        ResponseHandler::serverError('An unexpected error occurred. Please try again later.');
    }
}