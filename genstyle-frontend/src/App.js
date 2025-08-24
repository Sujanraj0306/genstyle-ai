import React, { useState } from 'react';
import './App.css';
import ImageUploader from './ImageUploader';
import VirtualTryOn from './VirtualTryOn';

function App() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [showTryOn, setShowTryOn] = useState(false);

  // This function is called when the image is successfully uploaded to the backend
  const handleUploadSuccess = (url) => {
    setUploadedImageUrl(url);
    setShowTryOn(false); // Hide the try-on screen if a new image is uploaded
  };

  const startTryOn = () => {
    if (uploadedImageUrl) {
      setShowTryOn(true);
    }
  };
  
  const closeTryOn = () => {
    setShowTryOn(false);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>GenStyle AI - Virtual Try-On</h1>
        <p>This system uses AI to provide a personalized styling experience, including virtual try-ons to reduce fashion waste.</p>
      </header>
      <main>
        {!showTryOn ? (
          <>
            <ImageUploader onUploadSuccess={handleUploadSuccess} />
            {uploadedImageUrl && (
              <div className="image-preview">
                <h3>Your Uploaded Dress:</h3>
                <img src={uploadedImageUrl} alt="Uploaded clothing" style={{ maxWidth: '200px', border: '2px solid #fff' }} />
                <button onClick={startTryOn} className="try-on-button">
                  Virtual Try-On
                </button>
              </div>
            )}
          </>
        ) : (
          <VirtualTryOn clothingUrl={uploadedImageUrl} onBack={closeTryOn}/>
        )}
      </main>
    </div>
  );
}

export default App;