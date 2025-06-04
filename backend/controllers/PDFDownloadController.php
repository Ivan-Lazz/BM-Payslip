<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Payslip.php';

/**
 * PDFDownloadController - Handles secure PDF file downloads and viewing
 */
class PDFDownloadController extends BaseController {
    
    /**
     * Handle PDF download requests
     * 
     * @param string $method HTTP method
     * @param string|null $id Resource identifier (payslip ID)
     * @param string|null $subResource Sub-resource name (agent/admin)
     */
    public function handleRequest($method, $id = null, $subResource = null) {
        if ($method !== 'GET') {
            ResponseHandler::badRequest('Only GET method is allowed for PDF downloads');
            return;
        }
        
        if (!$id) {
            ResponseHandler::badRequest('Payslip ID is required');
            return;
        }
        
        if (!$subResource || !in_array($subResource, ['agent', 'admin'])) {
            ResponseHandler::badRequest('PDF type must be either "agent" or "admin"');
            return;
        }
        
        $this->downloadPDF($id, $subResource);
    }
    
    /**
     * Handle PDF view requests (for viewing in browser)
     * 
     * @param string $payslipId Payslip ID
     * @param string $type PDF type (agent or admin)
     */
    public function handleViewRequest($payslipId, $type) {
        if (!$payslipId) {
            ResponseHandler::badRequest('Payslip ID is required');
            return;
        }
        
        if (!$type || !in_array($type, ['agent', 'admin'])) {
            ResponseHandler::badRequest('PDF type must be either "agent" or "admin"');
            return;
        }
        
        $this->viewPDF($payslipId, $type);
    }
    
    /**
     * Download PDF file for a payslip
     *
     * @param string $payslipId Payslip ID
     * @param string $type PDF type (agent or admin)
     */
    private function downloadPDF($payslipId, $type) {
        try {
            // Load payslip model
            $payslipModel = new Payslip($this->db);
            
            // Get payslip data
            $stmt = $payslipModel->readOne($payslipId);
            
            if ($stmt->rowCount() === 0) {
                ResponseHandler::notFound('Payslip not found');
                return;
            }
            
            $payslip = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get PDF path based on type
            $pdfPath = null;
            $filename = null;
            
            if ($type === 'agent') {
                $pdfPath = $payslip['agent_pdf_path'];
                $filename = "agent_payslip_{$payslip['payslip_no']}.pdf";
            } else {
                $pdfPath = $payslip['admin_pdf_path'];
                $filename = "admin_payslip_{$payslip['payslip_no']}.pdf";
            }
            
            if (!$pdfPath) {
                ResponseHandler::notFound('PDF file not available. Please regenerate the payslip.');
                return;
            }
            
            // Construct full file path
            $fullPath = $this->getFullPDFPath($pdfPath);
            
            // Check if file exists
            if (!file_exists($fullPath)) {
                ResponseHandler::notFound('PDF file not found on server. Please regenerate the payslip.');
                return;
            }
            
            // Set headers for PDF download
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . filesize($fullPath));
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            
            // Clear any previous output
            if (ob_get_level()) {
                ob_end_clean();
            }
            
            // Output file
            readfile($fullPath);
            exit;
            
        } catch (Exception $e) {
            error_log("PDF download error: " . $e->getMessage());
            ResponseHandler::serverError('Error downloading PDF file');
        }
    }
    
    /**
     * Stream PDF file for viewing in browser
     *
     * @param string $payslipId Payslip ID
     * @param string $type PDF type (agent or admin)
     */
    private function viewPDF($payslipId, $type) {
        try {
            // Load payslip model
            $payslipModel = new Payslip($this->db);
            
            // Get payslip data
            $stmt = $payslipModel->readOne($payslipId);
            
            if ($stmt->rowCount() === 0) {
                ResponseHandler::notFound('Payslip not found');
                return;
            }
            
            $payslip = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get PDF path based on type
            $pdfPath = null;
            $filename = null;
            
            if ($type === 'agent') {
                $pdfPath = $payslip['agent_pdf_path'];
                $filename = "agent_payslip_{$payslip['payslip_no']}.pdf";
            } else {
                $pdfPath = $payslip['admin_pdf_path'];
                $filename = "admin_payslip_{$payslip['payslip_no']}.pdf";
            }
            
            if (!$pdfPath) {
                ResponseHandler::notFound('PDF file not available');
                return;
            }
            
            // Construct full file path
            $fullPath = $this->getFullPDFPath($pdfPath);
            
            // Check if file exists
            if (!file_exists($fullPath)) {
                ResponseHandler::notFound('PDF file not found on server');
                return;
            }
            
            // Set headers for PDF viewing in browser
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="' . $filename . '"');
            header('Content-Length: ' . filesize($fullPath));
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            
            // Clear any previous output
            if (ob_get_level()) {
                ob_end_clean();
            }
            
            // Output file
            readfile($fullPath);
            exit;
            
        } catch (Exception $e) {
            error_log("PDF view error: " . $e->getMessage());
            ResponseHandler::serverError('Error viewing PDF file');
        }
    }
    
    /**
     * Get full PDF file path
     *
     * @param string $relativePath Relative path from database
     * @return string Full file system path
     */
    private function getFullPDFPath($relativePath) {
        // Remove leading slash if present
        $relativePath = ltrim($relativePath, '/');
        
        // Define base paths
        $frontendPath = dirname(__DIR__, 2) . '/frontend';
        
        // Construct full path
        return $frontendPath . '/' . $relativePath;
    }
    
    /**
     * Regenerate PDF files for a payslip
     * This method can be called via POST to /pdf/{id}/regenerate
     *
     * @param string $payslipId Payslip ID
     */
    public function regeneratePDFs($payslipId) {
        try {
            // Check if payslip exists
            $payslipModel = new Payslip($this->db);
            $stmt = $payslipModel->readOne($payslipId);
            
            if ($stmt->rowCount() === 0) {
                ResponseHandler::notFound('Payslip not found');
                return;
            }
            
            $payslip = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Load required classes for PDF generation
            require_once __DIR__ . '/../models/Employee.php';
            require_once __DIR__ . '/../services/PDFGenerator.php';
            
            // Get employee details
            $employeeModel = new Employee($this->db);
            $employeeStmt = $employeeModel->readOne($payslip['employee_id']);
            $employee = $employeeStmt->fetch(PDO::FETCH_ASSOC);
            
            // Prepare data for PDF generation
            $pdfData = [
                'payslip_no' => $payslip['payslip_no'],
                'employee_id' => $payslip['employee_id'],
                'employee_name' => $employee['firstname'] . ' ' . $employee['lastname'],
                'bank_details' => [
                    'preferred_bank' => $payslip['preferred_bank'],
                    'bank_account_number' => $payslip['bank_account_number'],
                    'bank_account_name' => $payslip['bank_account_name']
                ],
                'salary' => $payslip['salary'],
                'bonus' => $payslip['bonus'],
                'total_salary' => $payslip['total_salary'],
                'person_in_charge' => $payslip['person_in_charge'],
                'cutoff_date' => $payslip['cutoff_date'],
                'payment_date' => $payslip['payment_date'],
                'payment_status' => $payslip['payment_status']
            ];
            
            // Generate PDFs
            if (class_exists('PDFGenerator')) {
                $pdfGenerator = new PDFGenerator();
                $agentPdfResult = $pdfGenerator->generateAgentPayslip($pdfData);
                $adminPdfResult = $pdfGenerator->generateAdminPayslip($pdfData);
                
                // Update payslip with PDF paths
                $payslipModel->id = $payslipId;
                $payslipModel->agent_pdf_path = $agentPdfResult['path'];
                $payslipModel->admin_pdf_path = $adminPdfResult['path'];
                
                if ($payslipModel->updatePDFPaths()) {
                    ResponseHandler::success('PDFs regenerated successfully', [
                        'agent_pdf_path' => $payslipModel->agent_pdf_path,
                        'admin_pdf_path' => $payslipModel->admin_pdf_path
                    ]);
                } else {
                    ResponseHandler::serverError('Failed to update PDF paths');
                }
            } else {
                ResponseHandler::serverError('PDF Generator not available');
            }
        } catch (Exception $e) {
            error_log("Error regenerating PDFs: " . $e->getMessage());
            ResponseHandler::serverError('Error regenerating PDFs: ' . $e->getMessage());
        }
    }
}