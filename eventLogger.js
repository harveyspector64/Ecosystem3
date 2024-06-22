// eventLogger.js
export function addEventLogMessage(message) {
    const eventMenu = document.getElementById('event-menu');
    if (!eventMenu) {
        console.error('Event menu not found');
        return;
    }

    const eventMessageElement = document.createElement('div');
    eventMessageElement.className = 'event-message';
    eventMessageElement.textContent = message;
    
    eventMenu.appendChild(eventMessageElement);
    
    // Keep only the last 5 messages
    while (eventMenu.children.length > 6) { // +1 for the header
        eventMenu.removeChild(eventMenu.children[1]); // Remove the oldest message, not the header
    }
    
    console.log(`BREAKING NEWS: ${message}`);
}
