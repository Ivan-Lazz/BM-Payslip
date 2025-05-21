<?php
require_once __DIR__ . '/../utils/ResponseHandler.php';

/**
 * AuthMiddleware - Handles authentication checking
 */
class AuthMiddleware {
    /**
     * Verify if request is authenticated
     *
     * @return bool Whether user is authenticated
     */
    public static function isAuthenticated() {
        // Check if session-based authentication is active
        if (isset($_SESSION['user']) && !empty($_SESSION['user'])) {
            // Check if session has expired
            if (isset($_SESSION['last_activity']) && 
                (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
                // Session expired
                self::clearSession();
                return false;
            }
            
            // Update last activity time
            $_SESSION['last_activity'] = time();
            return true;
        }
        
        return false;
    }
    
    /**
     * Require authentication for an endpoint
     */
    public static function requireAuth() {
        if (!self::isAuthenticated()) {
            ResponseHandler::unauthorized('Authentication required');
        }
    }
    
    /**
     * Get current user data
     *
     * @return array User data or empty array if not authenticated
     */
    public static function getCurrentUser() {
        if (isset($_SESSION['user'])) {
            return $_SESSION['user'];
        }
        
        return [];
    }
    
    /**
     * Check if user has required role
     *
     * @param string|array $roles Required role(s)
     * @return bool Whether user has required role
     */
    public static function hasRole($roles) {
        $user = self::getCurrentUser();
        
        if (empty($user)) {
            return false;
        }
        
        if (!isset($user['role'])) {
            return false;
        }
        
        if (is_array($roles)) {
            return in_array($user['role'], $roles);
        }
        
        return $user['role'] === $roles;
    }
    
    /**
     * Require specific role for an endpoint
     *
     * @param string|array $roles Required role(s)
     */
    public static function requireRole($roles) {
        self::requireAuth();
        
        if (!self::hasRole($roles)) {
            ResponseHandler::forbidden('You do not have permission to access this resource');
        }
    }
    
    /**
     * Clear session data
     */
    public static function clearSession() {
        session_unset();
        session_destroy();
        session_start();
    }
}