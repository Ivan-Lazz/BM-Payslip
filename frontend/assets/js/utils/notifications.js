/**
 * Notification utility for displaying toast messages
 */

/**
 * Show a notification toast
 * 
 * @param {string} type Notification type (success, warning, danger, info)
 * @param {string} title Notification title
 * @param {string} message Notification message
 * @param {number} duration Duration in milliseconds before the notification is automatically closed
 */
function showNotification(type, title, message, duration = 5000) {
    // Create notification container if it doesn't exist
    let notificationsContainer = document.getElementById('notifications');
    
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.id = 'notifications';
        notificationsContainer.className = 'notifications';
        document.body.appendChild(notificationsContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Generate a unique ID for the notification
    const notificationId = 'notification-' + Date.now();
    notification.id = notificationId;
    
    // Choose icon based on type
    let icon = 'info-circle';
    
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
        case 'danger':
        case 'error':
            icon = 'exclamation-circle';
            type = 'danger'; // Normalize 'error' to 'danger'
            break;
    }
    
    // Set notification content
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button type="button" class="notification-close" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    notificationsContainer.appendChild(notification);
    
    // Set up close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        closeNotification(notificationId);
    });
    
    // Auto-close after duration
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notificationId);
        }, duration);
    }
    
    return notificationId;
}

/**
 * Close a notification
 * 
 * @param {string} notificationId ID of the notification to close
 */
function closeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    
    if (notification) {
        // Add hiding class for animation
        notification.classList.add('hiding');
        
        // Remove after animation completes
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

/**
 * Shorthand for success notification
 * 
 * @param {string} title Notification title
 * @param {string} message Notification message
 * @param {number} duration Duration in milliseconds
 */
function showSuccess(title, message, duration = 5000) {
    return showNotification('success', title, message, duration);
}

/**
 * Shorthand for error notification
 * 
 * @param {string} title Notification title
 * @param {string} message Notification message
 * @param {number} duration Duration in milliseconds
 */
function showError(title, message, duration = 5000) {
    return showNotification('danger', title, message, duration);
}

/**
 * Shorthand for warning notification
 * 
 * @param {string} title Notification title
 * @param {string} message Notification message
 * @param {number} duration Duration in milliseconds
 */
function showWarning(title, message, duration = 5000) {
    return showNotification('warning', title, message, duration);
}

/**
 * Shorthand for info notification
 * 
 * @param {string} title Notification title
 * @param {string} message Notification message
 * @param {number} duration Duration in milliseconds
 */
function showInfo(title, message, duration = 5000) {
    return showNotification('info', title, message, duration);
}