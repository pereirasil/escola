import React, { useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function PhotoUpload({ currentPhoto, onFileSelect, label = 'Foto' }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const photoUrl = currentPhoto
    ? (currentPhoto.startsWith('http') ? currentPhoto : `${API_URL}/uploads/${currentPhoto}`)
    : null;

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const displaySrc = preview || photoUrl;

  return (
    <div className="form-group photo-upload-group">
      <label>{label}</label>
      <div className="photo-upload-container">
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="Foto"
            className="photo-upload-preview"
            onClick={() => inputRef.current?.click()}
          />
        ) : (
          <div
            className="photo-upload-placeholder"
            onClick={() => inputRef.current?.click()}
          >
            <span>Clique para adicionar foto</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
