// src/Outfits.js
import React from 'react';

function Outfits({ outfits, allItems, isLoading }) {
  // A helper function to find the full URL from an itemId
  const findItemUrl = (itemId) => {
    const item = allItems.find(i => i.itemId === itemId);
    return item ? item.s3Url : '';
  };

  if (isLoading) {
    return (
      <div className="outfits-container card">
        <h2>Stylist is thinking...</h2>
        <div className="loader"></div>
      </div>
    );
  }

  if (outfits.length === 0) {
    return null; // Don't show anything if there are no outfits
  }

  return (
    <div className="outfits-container card">
      <h2>Here are your outfits!</h2>
      {outfits.map((outfit, index) => (
        <div key={index} className="outfit-card">
          <div className="outfit-images">
            <img src={findItemUrl(outfit.top_item_id)} alt="Top" className="outfit-item" />
            <span className="plus-symbol">+</span>
            <img src={findItemUrl(outfit.bottom_item_id)} alt="Bottom" className="outfit-item" />
          </div>
          <p className="suggestion"><strong>Suggestion:</strong> {outfit.suggestion}</p>
        </div>
      ))}
    </div>
  );
}

export default Outfits;