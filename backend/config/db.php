<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
    private $options;
    
    public function __construct() {
        // Load database configuration
        $config = require __DIR__ . '/database.php';
        
        $this->host = $config['host'];
        $this->db_name = $config['database'];
        $this->username = $config['username'];
        $this->password = $config['password'];
        
        $this->options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ];
    }
    
    public function getConnection() {
        try {
            if ($this->conn === null) {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                    $this->username,
                    $this->password,
                    $this->options
                );
            }
            return $this->conn;
        } catch (PDOException $e) {
            $this->logError($e);
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    // For debugging purposes
    public function getConnectionStatus() {
        try {
            $this->getConnection();
            return "Connected to database: " . $this->db_name;
        } catch (Exception $e) {
            $this->logError($e);
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    /**
     * Creates the database and tables if they don't exist
     * Used during installation
     */
    public function initializeDatabase() {
        try {
            // First connect without selecting a database
            $tempConn = new PDO(
                "mysql:host=" . $this->host,
                $this->username,
                $this->password,
                $this->options
            );
            
            // Create database if not exists
            $tempConn->exec("CREATE DATABASE IF NOT EXISTS `{$this->db_name}`
                            DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
            
            // Select the database
            $tempConn->exec("USE `{$this->db_name}`");
            
            // Now create tables
            $this->createTables($tempConn);
            
            // Store the connection for future use
            $this->conn = $tempConn;
            
            return true;
        } catch (PDOException $e) {
            $this->logError($e);
            error_log("Database initialization failed: " . $e->getMessage());
            throw new Exception("Database initialization failed: " . $e->getMessage());
        }
    }
    
    /**
     * Create all required tables
     */
    private function createTables($conn) {
        // Get SQL from schema file
        $schemaPath = dirname(__DIR__) . '/install/schema.sql';
        
        if (!file_exists($schemaPath)) {
            throw new Exception("Schema file not found: $schemaPath");
        }
        
        $sql = file_get_contents($schemaPath);
        
        if (empty($sql)) {
            throw new Exception("Schema file is empty");
        }
        
        // Split SQL into individual statements
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                $conn->exec($statement);
            }
        }
        
        return true;
    }
    
    /**
     * Log database errors
     */
    private function logError($exception) {
        $logDir = dirname(__DIR__) . '/logs';
        
        // Create logs directory if it doesn't exist
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        // Log error
        $logFile = $logDir . '/db_error.log';
        $message = date('[Y-m-d H:i:s]') . ' ' . $exception->getMessage() .
                 ' in ' . $exception->getFile() . ' on line ' . $exception->getLine() . "\n";
        
        error_log($message, 3, $logFile);
    }
}