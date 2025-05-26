<?php
/**
 * Banking Model - Handles database operations for employee banking details
 */
class Banking {
    private $conn;
    private $table_name = "employee_banking_details";
    
    // Banking properties
    public $id;
    public $employee_id;
    public $preferred_bank;
    public $bank_account_number;
    public $bank_account_name;
    public $created_at;
    public $updated_at;
    
    // Pagination properties
    public $page;
    public $records_per_page;
    
    /**
     * Constructor
     *
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get banking details by employee ID - FIXED to avoid duplicates
     *
     * @param string $employeeId Employee ID
     * @return PDOStatement Query result
     */
    public function readByEmployeeId($employeeId) {
        try {
            // Use DISTINCT to prevent duplicates and simple query without joins
            $query = "SELECT DISTINCT id, employee_id, preferred_bank, bank_account_number, bank_account_name, 
                            created_at, updated_at
                     FROM " . $this->table_name . " 
                     WHERE employee_id = :employee_id
                     ORDER BY id ASC";
            
            $stmt = $this->conn->prepare($query);
            
            if (!$stmt) {
                throw new Exception("Failed to prepare statement: " . implode(', ', $this->conn->errorInfo()));
            }
            
            $stmt->bindParam(':employee_id', $employeeId, PDO::PARAM_STR);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to execute statement: " . implode(', ', $stmt->errorInfo()));
            }
            
            return $stmt;
        } catch (PDOException $e) {
            throw new Exception("Database error in readByEmployeeId: " . $e->getMessage());
        }
    }
    
    /**
     * Get all banking details with pagination
     *
     * @param string $search Search term (optional)
     * @return PDOStatement Query result
     */
    public function readPaginated($search = '') {
        try {
            // Get sort parameters from request
            $sortField = isset($_GET['sort_field']) ? $_GET['sort_field'] : 'id';
            $sortDirection = isset($_GET['sort_direction']) ? strtoupper($_GET['sort_direction']) : 'ASC';
            
            // Validate sort field
            $allowedFields = ['id', 'employee_id', 'preferred_bank', 'bank_account_number', 'bank_account_name', 'created_at', 'firstname', 'lastname'];
            if (!in_array($sortField, $allowedFields)) {
                $sortField = 'id';
            }
            
            // Validate sort direction
            if (!in_array($sortDirection, ['ASC', 'DESC'])) {
                $sortDirection = 'ASC';
            }
            
            // Handle sort field with proper table prefix
            $sortFieldWithPrefix = $sortField;
            if (in_array($sortField, ['firstname', 'lastname'])) {
                $sortFieldWithPrefix = 'e.' . $sortField;
            } elseif (in_array($sortField, ['id', 'employee_id', 'preferred_bank', 'bank_account_number', 'bank_account_name', 'created_at'])) {
                $sortFieldWithPrefix = 'b.' . $sortField;
            }
            
            $offset = ($this->page - 1) * $this->records_per_page;
            
            // Build WHERE clause and parameters
            $whereClause = '';
            $bindParams = [];
            
            if (!empty($search)) {
                $whereClause = "WHERE (b.id LIKE :search1 
                               OR b.employee_id LIKE :search2 
                               OR b.preferred_bank LIKE :search3
                               OR b.bank_account_number LIKE :search4
                               OR b.bank_account_name LIKE :search5
                               OR e.firstname LIKE :search6
                               OR e.lastname LIKE :search7)";
                $bindParams[':search1'] = "%{$search}%";
                $bindParams[':search2'] = "%{$search}%";
                $bindParams[':search3'] = "%{$search}%";
                $bindParams[':search4'] = "%{$search}%";
                $bindParams[':search5'] = "%{$search}%";
                $bindParams[':search6'] = "%{$search}%";
                $bindParams[':search7'] = "%{$search}%";
            }
            
            $query = "SELECT b.id, b.employee_id, b.preferred_bank, b.bank_account_number, b.bank_account_name, 
                            b.created_at, b.updated_at,
                            e.firstname, e.lastname
                     FROM " . $this->table_name . " b
                     LEFT JOIN employees e ON b.employee_id = e.employee_id
                     {$whereClause} 
                     ORDER BY $sortFieldWithPrefix $sortDirection 
                     LIMIT :offset, :limit";
            
            $stmt = $this->conn->prepare($query);
            
            // Bind parameters
            foreach ($bindParams as $param => $value) {
                $stmt->bindValue($param, $value);
            }
            
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $this->records_per_page, PDO::PARAM_INT);
            
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            throw new Exception("Error reading banking details: " . $e->getMessage());
        }
    }
    
    /**
     * Count total banking details
     *
     * @param string $search Search term (optional)
     * @return int Total number of banking details
     */
    public function countAll($search = '') {
        try {
            // Build WHERE clause and parameters
            $whereClause = '';
            $bindParams = [];
            
            if (!empty($search)) {
                $whereClause = "WHERE (b.id LIKE :search1 
                               OR b.employee_id LIKE :search2 
                               OR b.preferred_bank LIKE :search3
                               OR b.bank_account_number LIKE :search4
                               OR b.bank_account_name LIKE :search5
                               OR e.firstname LIKE :search6
                               OR e.lastname LIKE :search7)";
                $bindParams[':search1'] = "%{$search}%";
                $bindParams[':search2'] = "%{$search}%";
                $bindParams[':search3'] = "%{$search}%";
                $bindParams[':search4'] = "%{$search}%";
                $bindParams[':search5'] = "%{$search}%";
                $bindParams[':search6'] = "%{$search}%";
                $bindParams[':search7'] = "%{$search}%";
            }
            
            $query = "SELECT COUNT(DISTINCT b.id) as total 
                     FROM " . $this->table_name . " b
                     LEFT JOIN employees e ON b.employee_id = e.employee_id
                     {$whereClause}";
            
            $stmt = $this->conn->prepare($query);
            
            // Bind parameters
            foreach ($bindParams as $param => $value) {
                $stmt->bindValue($param, $value);
            }
            
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return (int)$row['total'];
        } catch (PDOException $e) {
            throw new Exception("Error counting banking details: " . $e->getMessage());
        }
    }
    
    /**
     * Get single banking detail by ID
     *
     * @param int $id Banking detail ID
     * @return PDOStatement Query result
     */
    public function readOne($id) {
        $query = "SELECT b.id, b.employee_id, b.preferred_bank, b.bank_account_number, b.bank_account_name, 
                        b.created_at, b.updated_at,
                        e.firstname, e.lastname
                 FROM " . $this->table_name . " b
                 LEFT JOIN employees e ON b.employee_id = e.employee_id
                 WHERE b.id = :id 
                 LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Create new banking detail
     *
     * @return bool Whether operation was successful
     */
    public function create() {
        // Check if employee exists
        $employeeModel = new Employee($this->conn);
        if (!$employeeModel->employeeExists($this->employee_id)) {
            return false;
        }
        
        $query = "INSERT INTO " . $this->table_name . "
                (employee_id, preferred_bank, bank_account_number, bank_account_name)
                VALUES
                (:employee_id, :preferred_bank, :bank_account_number, :bank_account_name)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind values
        $this->employee_id = htmlspecialchars(strip_tags($this->employee_id));
        $this->preferred_bank = htmlspecialchars(strip_tags($this->preferred_bank));
        $this->bank_account_number = htmlspecialchars(strip_tags($this->bank_account_number));
        $this->bank_account_name = htmlspecialchars(strip_tags($this->bank_account_name));
        
        $stmt->bindParam(':employee_id', $this->employee_id);
        $stmt->bindParam(':preferred_bank', $this->preferred_bank);
        $stmt->bindParam(':bank_account_number', $this->bank_account_number);
        $stmt->bindParam(':bank_account_name', $this->bank_account_name);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Update banking detail
     *
     * @return bool Whether operation was successful
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    employee_id = :employee_id,
                    preferred_bank = :preferred_bank,
                    bank_account_number = :bank_account_number,
                    bank_account_name = :bank_account_name
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind values
        $this->employee_id = htmlspecialchars(strip_tags($this->employee_id));
        $this->preferred_bank = htmlspecialchars(strip_tags($this->preferred_bank));
        $this->bank_account_number = htmlspecialchars(strip_tags($this->bank_account_number));
        $this->bank_account_name = htmlspecialchars(strip_tags($this->bank_account_name));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        $stmt->bindParam(':employee_id', $this->employee_id);
        $stmt->bindParam(':preferred_bank', $this->preferred_bank);
        $stmt->bindParam(':bank_account_number', $this->bank_account_number);
        $stmt->bindParam(':bank_account_name', $this->bank_account_name);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Delete banking detail
     *
     * @return bool Whether operation was successful
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Check if banking detail exists for employee and account
     *
     * @param string $employeeId Employee ID
     * @param string $accountNumber Account number
     * @return bool Whether banking detail exists
     */
    public function bankingDetailExists($employeeId, $accountNumber) {
        $query = "SELECT id FROM " . $this->table_name . " 
                 WHERE employee_id = :employee_id 
                 AND bank_account_number = :bank_account_number
                 LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':employee_id', $employeeId);
        $stmt->bindParam(':bank_account_number', $accountNumber);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
}