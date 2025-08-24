// src/Wardrobe.js
import React from 'react';

function Wardrobe({ items, onGenerateOutfits }) {
  return (
    <div className="wardrobe-container card">
      <h2>Your Virtual Closet ({items.length} items)</h2>
      <div className="items-grid">
        {items.length === 0 ? (
          <p>Your wardrobe is empty. Upload some items to get started!</p>
        ) : (
          items.map(item => (
            <img key={item.itemId} src={item.s3Url} alt="clothing item" className="wardrobe-item" />
          ))
        )}
      </div>
      <button onClick={onGenerateOutfits} className="generate-button" disabled={items.length < 2}>
        ✨ Generate Outfits
      </button>
    </div>
  );
}

export default Wardrobe;