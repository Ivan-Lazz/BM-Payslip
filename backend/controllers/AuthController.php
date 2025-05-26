<?php
require_once __DIR__ . '/../utils/ResponseHandler.php';
require_once __DIR__ . '/../utils/InputValidator.php';
require_once __DIR__ . '/../utils/TokenManager.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

/**
 * AuthController - Handles authentication
 */
class AuthController {
    private $db;
    private $validator;
    
    /**
     * Constructor
     *
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->db = $db;
        $this->validator = new InputValidator();
    }
    
    /**
     * Handle API request
     *
     * @param string $method HTTP method
     * @param string|null $action Action (login, logout, etc.)
     * @param string|null $subResource Sub-resource
     */
    public function handleRequest($method, $action = null, $subResource = null) {
        if ($method !== 'POST' && $method !== 'GET') {
            ResponseHandler::badRequest('Method not allowed for authentication');
            return;
        }
        
        switch ($action) {
            case 'login':
                $this->login();
                break;
            case 'logout':
                $this->logout();
                break;
            case 'check':
                $this->checkAuth();
                break;
            default:
                ResponseHandler::notFound('Auth action not found');
                break;
        }
    }
    
    /**
     * Login user
     */
    private function login() {
        try {
        // Get input data
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $data = $_POST;
        }
            
            // Log received data for debugging
            error_log('Login request data: ' . print_r($data, true));
        
        // Validate input
        $this->validator->setData($data);
        $this->validator->required(['username', 'password']);
        
        if (!$this->validator->isValid()) {
                $errors = $this->validator->getErrors();
                error_log('Validation errors: ' . print_r($errors, true));
                ResponseHandler::badRequest('Invalid input', $errors);
            return;
        }
        
        // Get sanitized data
        $data = $this->validator->getSanitizedData();
        $username = $data['username'];
        $password = $data['password'];
        
            try {
        // Check if user exists
        $query = "SELECT * FROM users WHERE username = :username";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            ResponseHandler::unauthorized('Invalid username or password');
            return;
        }
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if user is active
        if ($user['status'] !== 'active') {
            ResponseHandler::unauthorized('Your account is not active');
            return;
        }
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            ResponseHandler::unauthorized('Invalid username or password');
            return;
                }
                
            } catch (PDOException $e) {
                // If database doesn't exist or tables are missing, try to initialize
                if ($e->getCode() == 1049 || $e->getCode() == '42S02') {
                    error_log('Database or table not found, initializing...');
                    $this->initializeDatabase();
                    
                    // Check if this is the initial admin login
                    if ($username === 'admin' && $password === 'admin123') {
                        // Create initial admin user
                        $this->ensureInitialUserExists();
                        
                        // Retry login
                        $this->login();
                        return;
                    }
                    
                    ResponseHandler::unauthorized('Invalid username or password');
                    return;
                }
                throw $e;
        }
        
        // Remove password from user data
        unset($user['password']);
            
            // Generate JWT token
            $token = TokenManager::generateToken([
                'user_id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]);
        
        // Store user data in session
        $_SESSION['user'] = $user;
        $_SESSION['last_activity'] = time();
        
            // Return success response with token
            ResponseHandler::success('Login successful', [
                'user' => $user,
                'token' => $token
            ]);
            
        } catch (PDOException $e) {
            error_log('Database error: ' . $e->getMessage());
            ResponseHandler::error('Database error: ' . $e->getMessage());
        } catch (Exception $e) {
            error_log('Server error: ' . $e->getMessage());
            ResponseHandler::error('Server error: ' . $e->getMessage());
        }
    }
    
    /**
     * Logout user
     */
    private function logout() {
        session_unset();
        session_destroy();
        session_start();
        ResponseHandler::success('Logout successful');
    }
    
    /**
     * Check authentication status
     */
    private function checkAuth() {
        if (isset($_SESSION['user'])) {
            ResponseHandler::success('Authenticated', $_SESSION['user']);
        } else {
            ResponseHandler::unauthorized('Not authenticated');
        }
    }
    
    /**
     * Check if any users exist and create an initial admin if none found
     * 
     * @return bool Whether an initial user was created
     */
    private function ensureInitialUserExists() {
        // Check if any users exist
        $query = "SELECT COUNT(*) as count FROM users";
        $stmt = $this->db->query($query);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] === 0) {
            // Create initial admin user
            $firstname = "Admin";
            $lastname = "User";
            $username = "admin";
            $password = password_hash("admin123", PASSWORD_DEFAULT);
            $email = "admin@example.com";
            $role = "admin";
            $status = "active";
            
            $query = "INSERT INTO users (firstname, lastname, username, password, email, role, status) 
                     VALUES (:firstname, :lastname, :username, :password, :email, :role, :status)";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':firstname', $firstname);
            $stmt->bindParam(':lastname', $lastname);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':password', $password);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':status', $status);
            $stmt->execute();
        }
    }
    
    /**
     * Initialize database and tables
     */
    private function initializeDatabase() {
        try {
            // Load database configuration
            $config = require __DIR__ . '/../config/database.php';
            
            // Create database instance
            require_once __DIR__ . '/../config/db.php';
            $database = new Database();
            
            // Initialize database and tables
            $database->initializeDatabase();
            
            // Create required directories
            $this->createRequiredDirectories();
            
            error_log('Database initialized successfully');
            return true;
        } catch (Exception $e) {
            error_log('Database initialization failed: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Create required directories for the application
     */
    private function createRequiredDirectories() {
        $directories = [
            __DIR__ . '/../logs',
            __DIR__ . '/../storage/pdfs/agent',
            __DIR__ . '/../storage/pdfs/admin'
        ];
        
        foreach ($directories as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            
            // Create .htaccess to protect PDF directories
            if (strpos($dir, 'pdfs') !== false) {
                $htaccess = $dir . '/.htaccess';
                if (!file_exists($htaccess)) {
                    file_put_contents($htaccess, "Deny from all\n");
                }
            }
        }
    }
}