// eventHandlers.js

import { addEmojiToPlayArea } from './gameLogic.js';

export function handleDragStart(e) {
    const draggedElement = e.target;
    if (draggedElement && draggedElement.classList.contains('emoji')) {
        const selectedEmoji = draggedElement.textContent;
        e.dataTransfer.setData('text/plain', draggedElement.textContent);
        console.log(`Emoji selected: ${selectedEmoji}`);
    }
}

export function handleDrop(e, playArea) {
    e.preventDefault();
    const x = e.clientX - playArea.offsetLeft;
    const y = e.clientY - playArea.offsetTop;
    const emoji = e.dataTransfer.getData('text/plain');
    if (emoji) {
        console.log(`Placing emoji: ${emoji} at (${x}, ${y})`);
        addEmojiToPlayArea(emoji, x, y);
    } else {
        console.log('No emoji selected');
    }
}

export function handleTouchStart(e) {
    const touchedElement = e.target;
    if (touchedElement && touchedElement.classList.contains('emoji')) {
        const selectedEmoji = touchedElement.textContent;
        const draggedElement = touchedElement.cloneNode(true);
        draggedElement.style.position = 'absolute';
        draggedElement.style.pointerEvents = 'none';
        document.body.appendChild(draggedElement);
        console.log(`Emoji touched: ${selectedEmoji}`);
        return { selectedEmoji, draggedElement };
    }
    return { selectedEmoji: null, draggedElement: null };
}

export function handleTouchMove(e, draggedElement) {
    if (draggedElement) {
        const touch = e.touches[0];
        draggedElement.style.left = `${touch.clientX - 15}px`;
        draggedElement.style.top = `${touch.clientY - 15}px`;
    }
}

export function handleTouchEnd(e, selectedEmoji, draggedElement, playArea) {
    if (selectedEmoji && draggedElement) {
        const touch = e.changedTouches[0];
        const x = touch.clientX - playArea.offsetLeft;
        const y = touch.clientY - playArea.offsetTop;
        console.log(`Placing emoji: ${selectedEmoji} at (${x}, ${y})`);
        addEmojiToPlayArea(selectedEmoji, x, y);
        document.body.removeChild(draggedElement);
    } else {
        console.log('No emoji selected');
    }
}
