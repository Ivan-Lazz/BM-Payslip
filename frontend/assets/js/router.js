/**
 * Simple client-side router for the application
 */

// Store for registered routes
const routes = [];

/**
 * Register a route
 * 
 * @param {string} path Route path
 * @param {Function} handler Route handler function
 */
function registerRoute(path, handler) {
    routes.push({ path, handler });
}

/**
 * Navigate to a route
 * 
 * @param {string} path Route path
 * @param {boolean} pushState Whether to push state to history
 */
function navigateTo(path, pushState = true) {
    if (pushState) {
        history.pushState(null, null, path);
    }
    
    // Find matching route
    const route = routes.find(r => r.path === path);
    
    if (route) {
        route.handler();
    } else {
        console.error(`Route not found: ${path}`);
        // Navigate to 404 page or dashboard
        navigateTo('/pages/dashboard.html', true);
    }
}

/**
 * Initialize the router
 */
function initRouter() {
    // Handle link clicks
    document.addEventListener('click', e => {
        const link = e.target.closest('a');
        
        if (link && link.getAttribute('href').startsWith('/')) {
            e.preventDefault();
            navigateTo(link.getAttribute('href'));
        }
    });
    
    // Handle back/forward browser buttons
    window.addEventListener('popstate', () => {
        navigateTo(window.location.pathname, false);
    });
    
    // Initial route
    navigateTo(window.location.pathname, false);
}

// Export functions
window.registerRoute = registerRoute;
window.navigateTo = navigateTo;
window.initRouter = initRouter;