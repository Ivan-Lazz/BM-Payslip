/**
 * Make an API request
 * 
 * @param {string} endpoint API endpoint path
 * @param {Object} options Fetch options
 * @returns {Promise<Object>} Response data
 * @throws {Error} Request error
 */
async function apiRequest(endpoint, options = {}) {
    // Set default options
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'  // Include cookies for cross-origin requests
    };
    
    // Merge options
    const requestOptions = { ...defaultOptions, ...options };
    
    // Add CSRF token if available
    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken) {
        requestOptions.headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Build URL - ensure there's no double slashes except in protocol
    const baseUrl = config.apiBaseUrl;
    let url = `${baseUrl}/${endpoint}`;
    url = url.replace(/([^:]\/)\/+/g, "$1"); // Replace multiple slashes with single slash
    
    // For debugging
    console.log(`Making API request to: ${url}`);
    console.log('Request options:', JSON.stringify(requestOptions));
    
    try {
        // Make request
        const response = await fetch(url, requestOptions);
        
        // Log response status for debugging
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        // Get CSRF token from response headers if available
        const newCsrfToken = response.headers.get('X-CSRF-Token');
        if (newCsrfToken) {
            localStorage.setItem('csrf_token', newCsrfToken);
        }
        
        // Parse response
        let data;
        
        try {
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                data = { success: false, message: 'Invalid response format', raw: responseText };
            }
        } catch (e) {
            console.error('Error reading response text:', e);
            data = { success: false, message: 'Invalid response format' };
        }
        
        // Handle error responses
        if (!response.ok) {
            const errorMessage = data.message || `Error: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        return data;
    } catch (error) {
        console.error(`API Request Error (${endpoint}):`, error);
        throw error;
    }
}