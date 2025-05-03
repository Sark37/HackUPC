import React, { useState } from 'react';
import './DragAndDrop.css'; 

function DragAndDrop() {
  const [items, setItems] = useState([
    { id: 'item-1', text: 'Item 1' },
    { id: 'item-2', text: 'Item 2' },
    { id: 'item-3', text: 'Item 3' },
  ]);

  const [droppedItems, setDroppedItems] = useState([]);

  const handleDragStart = (event, id) => {
    console.log('Drag started for item:', id);
    event.dataTransfer.setData('text/plain', id); // Store the ID of the dragged item
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Allow drop to happen
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData('text/plain');
    console.log('Item dropped:', itemId);

    // Find the dropped item
    const droppedItem = items.find(item => item.id === itemId);

    if (droppedItem) {
      setDroppedItems([...droppedItems, droppedItem]);
      setItems(items.filter(item => item.id !== itemId)); // Remove from original list
    }
  };

  return (
    <div className="drag-drop-container">
      <div className="draggable-items">
        <h3>Draggable Items</h3>
        {items.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={(event) => handleDragStart(event, item.id)}
            className="draggable"
          >
            {item.text}
          </div>
        ))}
      </div>

      <div
        className="drop-target"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <h3>Drop Here</h3>
        {droppedItems.map(item => (
          <div key={item.id} className="dropped-item">
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DragAndDrop;