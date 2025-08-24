// src/Uploader.js
import React, { useState } from 'react';
import axios from 'axios';

function Uploader({ onUploadSuccess, apiBaseUrl }) {
  // 2. The state now holds an array of files, not a single file
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    // event.target.files is a FileList, we convert it to an array
    setSelectedFiles(Array.from(event.target.files));
  };

  // 3. The upload logic is updated to handle multiple files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    // 4. We create an array of upload promises
    const uploadPromises = selectedFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64Image = reader.result.split(',')[1];
          try {
            const response = await axios.post(`${apiBaseUrl}/upload`, base64Image, {
              headers: { 'Content-Type': 'application/octet-stream' }
            });
            onUploadSuccess(response.data); // Update the main app's state for each success
            resolve(response.data);
          } catch (error) {
            console.error('Error uploading file:', file.name, error);
            reject(error);
          }
        };
      });
    });

    try {
      // 5. Promise.all waits for all uploads to finish
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error("One or more uploads failed.", error);
    } finally {
      setIsUploading(false);
      setSelectedFiles([]); // Reset the input
    }
  };

  return (
    <div className="uploader-container card">
      <h2>Add to Your Wardrobe</h2>
      {/* 1. Add the "multiple" attribute to the input element */}
      <input type="file" onChange={handleFileChange} multiple accept="image/jpeg, image/png" />
      <button onClick={handleUpload} disabled={selectedFiles.length === 0 || isUploading}>
        {isUploading ? `Uploading ${selectedFiles.length} item(s)...` : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Item(s)`}
      </button>
    </div>
  );
}

export default Uploader;