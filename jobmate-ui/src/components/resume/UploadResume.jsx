"use client";

import { useState, useRef } from "react";
import { FiUploadCloud, FiFile, FiX, FiCheck, FiLoader } from "react-icons/fi";
import "./UploadResume.css";

const UploadResume = ({ onNavigate, userName }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // Check file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a PDF or DOCX file");
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = localStorage.getItem("jobmate_token");
    console.log("Using token:", token);

    try {
      console.log("Starting upload of file:", selectedFile.name);
      const response = await fetch("http://127.0.0.1:8000/resumes/upload/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full response data:", data);

      // Debug each extracted field
      console.log("Name:", data.name);
      console.log("Email:", data.email);
      console.log("Phone:", data.phone);
      console.log("Skills:", data.skills);
      console.log("Experience fragment:", data.experience?.substring(0, 100));

      setExtractedData(data);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Upload failed", error);
      setUploadError(error.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    setUploadError(null);
    setExtractedData(null);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="logo-section">
          <h1 className="app-logo">JobMate</h1>
          <nav className="main-nav">
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("dashboard");
              }}
            >
              Dashboard
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("jobs");
              }}
            >
              Jobs
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("applications");
              }}
            >
              Applications
            </a>
          </nav>
        </div>
        <div className="user-section">
          <button className="notification-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <button className="settings-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <div className="user-avatar">
            <div className="initials">
              {userName
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="resume-upload-container">
          <div className="resume-upload-header">
            <h2>Upload Your Resume</h2>
            <p>
              We'll help you autofill job applications with your resume
              information
            </p>
          </div>

          {uploadSuccess ? (
            <div className="upload-success-container">
              <div className="success-icon">
                <FiCheck size={32} />
              </div>
              <h3>Resume Uploaded Successfully!</h3>
              <p>
                We've extracted your information to help you apply for jobs
                faster.
              </p>

              {extractedData && (
                <div className="extracted-data-preview">
                  <h4>Extracted Information</h4>
                  <div className="data-preview-content">
                    {extractedData.name && (
                      <div className="data-item">
                        <span className="data-label">Name:</span>
                        <span className="data-value">{extractedData.name}</span>
                      </div>
                    )}
                    {extractedData.email && (
                      <div className="data-item">
                        <span className="data-label">Email:</span>
                        <span className="data-value">
                          {extractedData.email}
                        </span>
                      </div>
                    )}
                    {extractedData.phone && (
                      <div className="data-item">
                        <span className="data-label">Phone:</span>
                        <span className="data-value">
                          {extractedData.phone}
                        </span>
                      </div>
                    )}
                    {extractedData.skills &&
                      extractedData.skills.length > 0 && (
                        <div className="data-item">
                          <span className="data-label">Skills:</span>
                          <div className="skills-list">
                            {extractedData.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              <div className="success-actions">
                <button
                  className="action-button secondary"
                  onClick={resetUpload}
                >
                  Reupload
                </button>
                <button
                  className="action-button"
                  onClick={() => onNavigate("dashboard")}
                >
                  Return to Dash
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-area-container">
              <div
                className={`resume-dropzone ${isDragging ? "dragging" : ""} ${
                  selectedFile ? "has-file" : ""
                } ${uploadError ? "has-error" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="file-input"
                />

                {selectedFile ? (
                  <div className="selected-file">
                    <div className="file-icon">
                      <FiFile size={28} />
                    </div>
                    <div className="file-details">
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      className="remove-file-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="dropzone-content">
                    <div className="upload-icon">
                      <FiUploadCloud size={48} />
                    </div>
                    <h3>Drag & Drop Your Resume</h3>
                    <p>
                      or <span className="browse-text">browse files</span>
                    </p>
                    <p className="file-types">
                      Supports PDF, DOCX (up to 10MB)
                    </p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="upload-error">
                  <FiX size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="upload-actions">
                <button
                  className="action-button secondary"
                  onClick={() => onNavigate("dashboard")}
                >
                  Cancel
                </button>
                <button
                  className="action-button"
                  disabled={!selectedFile || loading}
                  onClick={handleUpload}
                >
                  {loading ? (
                    <>
                      <FiLoader className="spinner" size={16} />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadResume;
