<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Account.php';
require_once __DIR__ . '/../models/Employee.php';

/**
 * AccountController - Handles employee account-related API endpoints
 */
class AccountController extends BaseController {
    private $accountModel;
    
    /**
     * Constructor
     *
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        parent::__construct($db);
        $this->accountModel = new Account($db);
    }
    
    /**
     * Get all accounts with pagination
     */
    protected function getAll() {
        try {
            // Get pagination and search parameters
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : DEFAULT_PAGE_SIZE;
            $search = isset($_GET['search']) ? $_GET['search'] : '';
            $type = isset($_GET['type']) ? $_GET['type'] : '';
            
            // Debug log
            error_log("Account API Request - Page: $page, PerPage: $perPage, Search: '$search', Type: '$type'");
            
            // Validate pagination parameters
            $page = max(1, $page);
            $perPage = min(max(1, $perPage), MAX_PAGE_SIZE);
            
            // Set pagination properties in the model
            $this->accountModel->page = $page;
            $this->accountModel->records_per_page = $perPage;
            
            // Get account data - use the fixed method
            $stmt = $this->accountModel->readPaginated($search, $type);
            $accounts = [];
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Remove password from response
                unset($row['account_password']);
                $accounts[] = $row;
            }
            
            // Get total count for pagination
            $totalRecords = $this->accountModel->countAll($search, $type);
            
            // Debug log
            error_log("Account API Response - Found " . count($accounts) . " accounts, Total: $totalRecords");
            
            // Return paginated response
            ResponseHandler::paginated($accounts, $page, $perPage, $totalRecords);
        } catch (Exception $e) {
            error_log("Account API Error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            ResponseHandler::serverError('Error retrieving accounts: ' . $e->getMessage());
        }
    }
    
    /**
     * Get a single account by ID
     *
     * @param int $id Account ID
     */
    protected function getOne($id) {
        try {
            $stmt = $this->accountModel->readOne($id);
            
            if ($stmt->rowCount() > 0) {
                $account = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Remove password from response
                unset($account['account_password']);
                
                ResponseHandler::success('Account retrieved successfully', $account);
            } else {
                ResponseHandler::notFound('Account not found');
            }
        } catch (Exception $e) {
            ResponseHandler::serverError('Error retrieving account: ' . $e->getMessage());
        }
    }
    
    /**
     * Create a new account
     */
    protected function create() {
        try {
            // Get posted data
            $data = $this->getJsonInput();
            
            // Set validator and validate input
            $this->validator->setData($data);
            $this->validator
                ->required(['employee_id', 'account_email', 'account_password', 'account_type'])
                ->email('account_email');
            
            if (!$this->validator->isValid()) {
                ResponseHandler::badRequest('Invalid input data', $this->validator->getErrors());
                return;
            }
            
            // Check if employee exists
            $employeeModel = new Employee($this->db);
            if (!$employeeModel->employeeExists($data['employee_id'])) {
                ResponseHandler::badRequest('Employee not found');
                return;
            }
            
            // Set account properties
            $this->accountModel->employee_id = $data['employee_id'];
            $this->accountModel->account_email = $data['account_email'];
            $this->accountModel->account_password = $data['account_password'];
            $this->accountModel->account_type = $data['account_type'];
            $this->accountModel->account_status = $data['account_status'] ?? 'ACTIVE';
            
            // Create the account
            if ($this->accountModel->create()) {
                $account = [
                    'account_id' => $this->accountModel->account_id,
                    'employee_id' => $this->accountModel->employee_id,
                    'account_email' => $this->accountModel->account_email,
                    'account_type' => $this->accountModel->account_type,
                    'account_status' => $this->accountModel->account_status
                ];
                
                ResponseHandler::created('Account created successfully', $account);
            } else {
                ResponseHandler::serverError('Failed to create account');
            }
        } catch (Exception $e) {
            ResponseHandler::serverError('Error creating account: ' . $e->getMessage());
        }
    }
    
    /**
     * Update an existing account
     *
     * @param int $id Account ID
     */
    protected function update($id) {
        try {
            // Check if account exists
            $stmt = $this->accountModel->readOne($id);
            if ($stmt->rowCount() === 0) {
                ResponseHandler::notFound('Account not found');
                return;
            }
            
            // Get posted data
            $data = $this->getJsonInput();
            
            // Set validator and validate input
            $this->validator->setData($data);
            $this->validator
                ->required(['employee_id', 'account_email', 'account_type', 'account_status'])
                ->email('account_email');
            
            if (!$this->validator->isValid()) {
                ResponseHandler::badRequest('Invalid input data', $this->validator->getErrors());
                return;
            }
            
            // Check if employee exists
            $employeeModel = new Employee($this->db);
            if (!$employeeModel->employeeExists($data['employee_id'])) {
                ResponseHandler::badRequest('Employee not found');
                return;
            }
            
            // Set account properties
            $this->accountModel->account_id = $id;
            $this->accountModel->employee_id = $data['employee_id'];
            $this->accountModel->account_email = $data['account_email'];
            $this->accountModel->account_type = $data['account_type'];
            $this->accountModel->account_status = $data['account_status'];
            
            // Set password only if provided
            if (!empty($data['account_password'])) {
                $this->accountModel->account_password = $data['account_password'];
            }
            
            // Update the account
            if ($this->accountModel->update()) {
                $account = [
                    'account_id' => $this->accountModel->account_id,
                    'employee_id' => $this->accountModel->employee_id,
                    'account_email' => $this->accountModel->account_email,
                    'account_type' => $this->accountModel->account_type,
                    'account_status' => $this->accountModel->account_status
                ];
                
                ResponseHandler::success('Account updated successfully', $account);
            } else {
                ResponseHandler::serverError('Failed to update account');
            }
        } catch (Exception $e) {
            ResponseHandler::serverError('Error updating account: ' . $e->getMessage());
        }
    }
    
    /**
     * Delete an account
     *
     * @param int $id Account ID
     */
    protected function delete($id) {
        try {
            // Debug log
            error_log("AccountController::delete called with ID: " . $id);
            
            // Validate ID
            if (empty($id) || !is_numeric($id)) {
                error_log("Invalid account ID provided: " . $id);
                ResponseHandler::badRequest('Invalid account ID');
                return;
            }
            
            // Check if account exists
            $stmt = $this->accountModel->readOne($id);
            if ($stmt->rowCount() === 0) {
                error_log("Account not found with ID: " . $id);
                ResponseHandler::notFound('Account not found');
                return;
            }
            
            // Get account info for logging
            $accountInfo = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("Deleting account: " . json_encode($accountInfo));
            
            // Set ID and delete
            $this->accountModel->account_id = $id;
            
            if ($this->accountModel->delete()) {
                error_log("Account deleted successfully: " . $id);
                ResponseHandler::success('Account deleted successfully');
            } else {
                error_log("Failed to delete account: " . $id);
                ResponseHandler::serverError('Failed to delete account');
            }
        } catch (Exception $e) {
            error_log("Exception in AccountController::delete: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            ResponseHandler::serverError('Error deleting account: ' . $e->getMessage());
        }
    }

    
    /**
     * Get account types
     */
    protected function handleSubresource($id, $subResource, $method = 'GET') {
        if ($subResource === 'types' && $method === 'GET') {
            $types = $this->accountModel->getAccountTypes();
            ResponseHandler::success('Account types retrieved successfully', $types);
        } else if ($subResource === 'statuses' && $method === 'GET') {
            $statuses = $this->accountModel->getAccountStatuses();
            ResponseHandler::success('Account statuses retrieved successfully', $statuses);
        } else {
            ResponseHandler::notFound('Subresource not found');
        }
    }
}