import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import axios from 'axios';
import Uploader from './Uploader';
import Wardrobe from './Wardrobe';
import Outfits from './Outfits';
import './App.css';

const API_BASE_URL = 'https://plkm9xcz61.execute-api.eu-north-1.amazonaws.com/prod';

function App() {
  const [items, setItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true); 
  const [error, setError] = useState('');

  // 3. This useEffect hook runs once when the app loads
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/items`);
        setItems(response.data); // Populate the wardrobe with existing items
      } catch (err) {
        console.error("Error fetching initial items:", err);
        setError("Could not load your wardrobe. Please try refreshing.");
      } finally {
        setIsInitiallyLoading(false); // Stop the initial loading indicator
      }
    };

    fetchItems();
  }, []); // The empty array [] means this effect runs only once on mount

  const handleUploadSuccess = (newItem) => {
    setItems(prevItems => [...prevItems, newItem]);
  };

  const handleGenerateOutfits = async () => {
    if (items.length < 2) {
      setError('Please upload at least two items to generate outfits.');
      return;
    }
    setIsLoading(true);
    setError('');
    setOutfits([]);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-outfits`);
      setOutfits(response.data);
    } catch (err) {
      console.error('Error generating outfits:', err);
      setError('Sorry, something went wrong while generating outfits.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>GenStyle AI Stylist</h1>
        <p>Your personal AI-powered wardrobe assistant</p>
      </header>
      <main>
        <Uploader onUploadSuccess={handleUploadSuccess} apiBaseUrl={API_BASE_URL} />
        {/* 4. Show a loading message while fetching initial items */}
        {isInitiallyLoading ? (
          <div className="card"><h2>Loading Your Closet...</h2></div>
        ) : (
          <Wardrobe items={items} onGenerateOutfits={handleGenerateOutfits} />
        )}
        {error && <p className="error-message">{error}</p>}
        <Outfits outfits={outfits} allItems={items} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default App;
