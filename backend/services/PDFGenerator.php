<?php
// Check if FPDF library exists
$fpdfPath = __DIR__ . '/../lib/fpdf/fpdf.php';
if (file_exists($fpdfPath)) {
    require_once $fpdfPath;
} else {
    error_log("FPDF library not found at: " . $fpdfPath);
    throw new Exception("PDF library not available");
}

/**
 * PDFGenerator - Service for generating payslip PDFs
 */
class PDFGenerator {
    private $basePath;
    
    /**
     * Constructor
     */
    public function __construct() {
        // Define paths
        if (defined('PDF_PATH')) {
            $this->basePath = PDF_PATH;
        } else {
            // Fallback path
            $this->basePath = dirname(__DIR__, 2) . '/frontend/pdfs';
        }
        
        // Ensure directories exist
        $this->ensureDirectoriesExist();
    }
    
    /**
     * Ensure PDF directories exist
     */
    private function ensureDirectoriesExist() {
        $agentPath = $this->basePath . '/agent';
        $adminPath = $this->basePath . '/admin';
        
        if (!file_exists($this->basePath)) {
            mkdir($this->basePath, 0755, true);
        }
        
        if (!file_exists($agentPath)) {
            mkdir($agentPath, 0755, true);
        }
        
        if (!file_exists($adminPath)) {
            mkdir($adminPath, 0755, true);
        }
        
        // Create .htaccess to protect directories but allow API access
        $htaccessContent = "# Deny direct access but allow API access\n";
        $htaccessContent .= "RewriteEngine On\n";
        $htaccessContent .= "RewriteCond %{REQUEST_URI} !^/bm-payslip/backend/api/pdf/\n";
        $htaccessContent .= "RewriteRule ^.*$ - [F,L]\n";
        
        if (!file_exists($this->basePath . '/.htaccess')) {
            file_put_contents($this->basePath . '/.htaccess', $htaccessContent);
        }
    }
    
    /**
     * Generate Agent payslip (Variation 1)
     *
     * @param array $data Payslip data
     * @return array Path information
     */
    public function generateAgentPayslip($data) {
        try {
            // Generate filename
            $filename = 'agent_' . $data['payslip_no'] . '_' . date('Ymd_His') . '.pdf';
            $fullPath = $this->basePath . '/agent/' . $filename;
            
            // For the database, store relative path that can be used by the API
            $relativePath = 'pdfs/agent/' . $filename;
            
            // Create PDF
            $pdf = new FPDF();
            $pdf->AddPage();
            
            // Set document information
            $pdf->SetTitle('Agent Payslip - ' . $data['payslip_no']);
            $pdf->SetAuthor('BM Outsourcing');
            $pdf->SetCreator('Pay Slip Generator');
            
            // Add company logo if exists
            $logoPath = dirname(__DIR__, 2) . '/frontend/assets/img/logo.png';
            if (file_exists($logoPath)) {
                $pdf->Image($logoPath, 10, 10, 30);
            }
            
            // Add company name
            $pdf->SetFont('Arial', 'B', 16);
            $pdf->Cell(0, 10, 'BM OUTSOURCING', 0, 1, 'R');
            
            $pdf->Ln(10);
            
            // Add payslip header
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, 'AGENT PAYSLIP', 0, 1, 'C');
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(0, 5, 'Payslip No: ' . $data['payslip_no'], 0, 1, 'C');
            
            $pdf->Ln(10);
            
            // Employee information
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 10, 'Employee Information', 0, 1);
            
            $pdf->SetFont('Arial', '', 10);
            
            // Agent name
            $pdf->Cell(50, 8, 'Agent Name:', 0);
            $pdf->Cell(0, 8, $data['employee_name'], 0, 1);
            
            // Employee ID
            $pdf->Cell(50, 8, 'Employee ID:', 0);
            $pdf->Cell(0, 8, $data['employee_id'], 0, 1);
            
            // Payment date
            $pdf->Cell(50, 8, 'Payment Date:', 0);
            $pdf->Cell(0, 8, date('F d, Y', strtotime($data['payment_date'])), 0, 1);
            
            $pdf->Ln(5);
            
            // Add payment details
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 10, 'Payment Information', 0, 1);
            
            // Table header
            $pdf->SetFillColor(240, 240, 240);
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(100, 8, 'Description', 1, 0, 'L', true);
            $pdf->Cell(60, 8, 'Amount', 1, 1, 'R', true);
            
            // Table content
            $pdf->SetFont('Arial', '', 10);
            
            // Salary
            $pdf->Cell(100, 8, 'Salary', 1, 0, 'L');
            $pdf->Cell(60, 8, number_format($data['salary'], 2), 1, 1, 'R');
            
            // Bonus
            $pdf->Cell(100, 8, 'Bonus', 1, 0, 'L');
            $pdf->Cell(60, 8, number_format($data['bonus'], 2), 1, 1, 'R');
            
            // Total
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(100, 8, 'Total', 1, 0, 'L', true);
            $pdf->Cell(60, 8, number_format($data['total_salary'], 2), 1, 1, 'R', true);
            
            $pdf->Ln(10);
            
            // Footer
            $pdf->SetFont('Arial', 'I', 8);
            $pdf->Cell(0, 10, 'This is a system-generated document. No signature required.', 0, 1, 'C');
            
            // Output PDF
            $pdf->Output('F', $fullPath);
            
            return [
                'filename' => $filename,
                'path' => $relativePath,
                'full_path' => $fullPath
            ];
            
        } catch (Exception $e) {
            error_log("Error generating agent payslip: " . $e->getMessage());
            throw new Exception("Failed to generate agent payslip: " . $e->getMessage());
        }
    }
    
    /**
     * Generate Admin payslip (Variation 2)
     *
     * @param array $data Payslip data
     * @return array Path information
     */
    public function generateAdminPayslip($data) {
        try {
            // Generate filename
            $filename = 'admin_' . $data['payslip_no'] . '_' . date('Ymd_His') . '.pdf';
            $fullPath = $this->basePath . '/admin/' . $filename;
            
            // For the database, store relative path that can be used by the API
            $relativePath = 'pdfs/admin/' . $filename;
            
            // Create PDF
            $pdf = new FPDF();
            $pdf->AddPage();
            
            // Set document information
            $pdf->SetTitle('Admin Payslip - ' . $data['payslip_no']);
            $pdf->SetAuthor('BM Outsourcing');
            $pdf->SetCreator('Pay Slip Generator');
            
            // Add company logo if exists
            $logoPath = dirname(__DIR__, 2) . '/frontend/assets/img/logo.png';
            if (file_exists($logoPath)) {
                $pdf->Image($logoPath, 10, 10, 30);
            }
            
            // Add company name
            $pdf->SetFont('Arial', 'B', 16);
            $pdf->Cell(0, 10, 'BM OUTSOURCING', 0, 1, 'R');
            
            $pdf->Ln(10);
            
            // Add payslip header
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, 'ADMIN PAYSLIP', 0, 1, 'C');
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(0, 5, 'Payslip No: ' . $data['payslip_no'], 0, 1, 'C');
            
            $pdf->Ln(10);
            
            // Employee information
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 10, 'Employee Information', 0, 1);
            
            $pdf->SetFont('Arial', '', 10);
            
            // Agent name
            $pdf->Cell(50, 8, 'Agent Name:', 0);
            $pdf->Cell(0, 8, $data['employee_name'], 0, 1);
            
            // Employee ID
            $pdf->Cell(50, 8, 'Employee ID:', 0);
            $pdf->Cell(0, 8, $data['employee_id'], 0, 1);
            
            $pdf->Ln(5);
            
            // Banking details
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 10, 'Banking Information', 0, 1);
            
            $pdf->SetFont('Arial', '', 10);
            
            // Bank Name
            $pdf->Cell(50, 8, 'Bank Name:', 0);
            $pdf->Cell(0, 8, $data['bank_details']['preferred_bank'], 0, 1);
            
            // Account Number
            $pdf->Cell(50, 8, 'Account Number:', 0);
            $pdf->Cell(0, 8, $data['bank_details']['bank_account_number'], 0, 1);
            
            // Account Name
            $pdf->Cell(50, 8, 'Account Name:', 0);
            $pdf->Cell(0, 8, $data['bank_details']['bank_account_name'], 0, 1);
            
            $pdf->Ln(5);
            
            // Payment details
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 10, 'Payment Information', 0, 1);
            
            $pdf->SetFont('Arial', '', 10);
            
            // Person In Charge
            $pdf->Cell(50, 8, 'Person In Charge:', 0);
            $pdf->Cell(0, 8, $data['person_in_charge'], 0, 1);
            
            // Payment Date
            $pdf->Cell(50, 8, 'Payment Date:', 0);
            $pdf->Cell(0, 8, date('F d, Y', strtotime($data['payment_date'])), 0, 1);
            
            $pdf->Ln(5);
            
            // Table header
            $pdf->SetFillColor(240, 240, 240);
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(100, 8, 'Description', 1, 0, 'L', true);
            $pdf->Cell(60, 8, 'Amount', 1, 1, 'R', true);
            
            // Table content
            $pdf->SetFont('Arial', '', 10);
            
            // Salary
            $pdf->Cell(100, 8, 'Salary', 1, 0, 'L');
            $pdf->Cell(60, 8, number_format($data['salary'], 2), 1, 1, 'R');
            
            // Bonus
            $pdf->Cell(100, 8, 'Bonus', 1, 0, 'L');
            $pdf->Cell(60, 8, number_format($data['bonus'], 2), 1, 1, 'R');
            
            // Total
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(100, 8, 'Total', 1, 0, 'L', true);
            $pdf->Cell(60, 8, number_format($data['total_salary'], 2), 1, 1, 'R', true);
            
            $pdf->Ln(5);
            
            // Payment Status
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(50, 8, 'Payment Status:', 0);
            
            // Set color based on status
            if ($data['payment_status'] === 'Paid') {
                $pdf->SetTextColor(0, 128, 0); // Green
            } else if ($data['payment_status'] === 'Pending') {
                $pdf->SetTextColor(255, 128, 0); // Orange
            } else {
                $pdf->SetTextColor(255, 0, 0); // Red
            }
            
            $pdf->Cell(0, 8, $data['payment_status'], 0, 1);
            
            // Reset text color
            $pdf->SetTextColor(0);
            
            $pdf->Ln(10);
            
            // Signature line
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(0, 8, 'Authorized by: _________________________', 0, 1);
            $pdf->Cell(0, 8, 'Date: _________________________', 0, 1);
            
            $pdf->Ln(5);
            
            // Footer
            $pdf->SetFont('Arial', 'I', 8);
            $pdf->Cell(0, 10, 'This is a system-generated document.', 0, 1, 'C');
            
            // Output PDF
            $pdf->Output('F', $fullPath);
            
            return [
                'filename' => $filename,
                'path' => $relativePath,
                'full_path' => $fullPath
            ];
            
        } catch (Exception $e) {
            error_log("Error generating admin payslip: " . $e->getMessage());
            throw new Exception("Failed to generate admin payslip: " . $e->getMessage());
        }
    }
}