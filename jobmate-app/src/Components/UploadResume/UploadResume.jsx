import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbUser, TbSettings, TbUpload } from "react-icons/tb";
import "./UploadResume.css"; 

const UploadResume = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="upload-container">
      <header className="header">
        <h1 className="logo">JobMate</h1>
        <div className="icon-buttons">
          <button className="icon-btn"><TbUser size={20} /></button>
          <button className="icon-btn"><TbSettings size={20} /></button>
        </div>
      </header>

      <div className="upload-card">
        <h2>Upload Your Resume</h2>
        <p>We’ll help you autofill job applications with your resume information</p>

        <div className={`dropzone ${selectedFile ? "selected" : ""}`}>
          {selectedFile ? (
            <div className="file-info">
              <TbUpload size={30} className="icon" />
              <p>{selectedFile.name}</p>
              <button onClick={() => setSelectedFile(null)} className="change-file-btn">Choose a different file</button>
            </div>
          ) : (
            <label className="upload-label">
              <TbUpload size={30} className="icon" />
              <p>Drag and drop your resume, or <span className="browse-text">browse files</span></p>
              <p className="file-types">Supports PDF, DOCX (up to 10MB)</p>
              <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden-file-input" />
            </label>
          )}
        </div>

        <button className="upload-btn" disabled={!selectedFile} onClick={() => alert("Resume Uploaded!")}>Continue</button>
        <button className="logout-btn" onClick={() => navigate("/")}>Logout</button>
      </div>
    </div>
  );
};

export default UploadResume;
