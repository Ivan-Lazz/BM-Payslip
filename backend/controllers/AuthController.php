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
        // Create initial admin user if no users exist
        $this->ensureInitialUserExists();
        
        // Get input data
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $data = $_POST;
        }
        
        // Validate input
        $this->validator->setData($data);
        $this->validator->required(['username', 'password']);
        
        if (!$this->validator->isValid()) {
            ResponseHandler::badRequest('Invalid input', $this->validator->getErrors());
            return;
        }
        
        // Get sanitized data
        $data = $this->validator->getSanitizedData();
        $username = $data['username'];
        $password = $data['password'];
        
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
        
        // Remove password from user data
        unset($user['password']);
        
        // Store user data in session
        $_SESSION['user'] = $user;
        $_SESSION['last_activity'] = time();
        
        ResponseHandler::success('Login successful', $user);
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
            $username = 'admin';
            $password = password_hash('Admin@123', PASSWORD_DEFAULT);
            $role = 'admin';
            $status = 'active';
            
            $query = "INSERT INTO users (username, password, role, status) VALUES (:username, :password, :role, :status)";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':password', $password);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':status', $status);
            $stmt->execute();
        }
    }
}