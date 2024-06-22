import { addEmojiToPlayArea } from './script.js';
import { setSelectedEmoji, setDraggedElement } from './gameState.js';

export function handleDragStart(e) {
    const draggedElement = e.target;
    if (draggedElement && draggedElement.classList.contains('emoji')) {
        setSelectedEmoji(draggedElement.textContent);
        e.dataTransfer.setData('text/plain', draggedElement.textContent);
        console.log(`Emoji selected: ${draggedElement.textContent}`);
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
        setSelectedEmoji(null);
    } else {
        console.log('No emoji selected');
    }
}

export function handleTouchStart(e) {
    const touchedElement = e.target;
    if (touchedElement && touchedElement.classList.contains('emoji')) {
        setSelectedEmoji(touchedElement.textContent);
        const draggedElement = touchedElement.cloneNode(true);
        draggedElement.style.position = 'absolute';
        draggedElement.style.pointerEvents = 'none';
        document.body.appendChild(draggedElement);
        setDraggedElement(draggedElement);
        console.log(`Emoji touched: ${touchedElement.textContent}`);
    }
}

export function handleTouchMove(e) {
    const draggedElement = window.gameState.draggedElement;
    if (draggedElement) {
        const touch = e.touches[0];
        draggedElement.style.left = `${touch.clientX - 15}px`;
        draggedElement.style.top = `${touch.clientY - 15}px`;
    }
}

export function handleTouchEnd(e, playArea) {
    const selectedEmoji = window.gameState.selectedEmoji;
    const draggedElement = window.gameState.draggedElement;
    if (selectedEmoji && draggedElement) {
        const touch = e.changedTouches[0];
        const x = touch.clientX - playArea.offsetLeft;
        const y = touch.clientY - playArea.offsetTop;
        console.log(`Placing emoji: ${selectedEmoji} at (${x}, ${y})`);
        addEmojiToPlayArea(selectedEmoji, x, y);
        document.body.removeChild(draggedElement);
        setDraggedElement(null);
        setSelectedEmoji(null);
    } else {
        console.log('No emoji selected');
    }
}
