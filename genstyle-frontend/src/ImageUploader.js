import React, { useState } from 'react';
import axios from 'axios';

// Your specific API endpoint URL from Phase 1
const API_ENDPOINT = 'https://oxhk1toahl.execute-api.eu-north-1.amazonaws.com/default/genstyle-image-handler'; 

function ImageUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('Please select an image (PNG with no background works best)');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setStatus('Image selected. Ready to upload.');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus('Please select a file first!');
      return;
    }

    setStatus('Uploading...');
    
    // Read the file as a base64 string
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      // Remove the "data:image/png;base64," part to get the raw base64 data
      const base64Image = reader.result.split(',')[1]; 
      
      try {
        const response = await axios.post(API_ENDPOINT, {
          image: base64Image,
          type: selectedFile.type
        });
        
        setStatus('Upload successful!');
        // Pass the S3 URL from the backend response to the parent App component
        onUploadSuccess(response.data.s3Url); 

      } catch (error) {
        console.error("Error uploading image:", error);
        setStatus('Upload failed. Check the console for details.');
      }
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setStatus('Failed to read the file.');
    }
  };

  return (
    <div className="uploader">
      <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Image</button>
      <p>{status}</p>
    </div>
  );
}

export default ImageUploader;