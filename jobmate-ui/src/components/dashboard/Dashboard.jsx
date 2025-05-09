"use client";

import { useState, useEffect } from "react";
import "./Dashboard.css";
import UploadResume from "../resume/UploadResume";
import {
  FiUpload,
  FiSearch,
  FiUserPlus,
  FiUser,
  FiFile,
} from "react-icons/fi";

const Dashboard = ({ userName, onNavigate }) => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
  });

  // Load personal info from localStorage
  useEffect(() => {
    const storedPersonalInfo = localStorage.getItem("jobmate_personal_info");
    if (storedPersonalInfo) {
      setPersonalInfo(JSON.parse(storedPersonalInfo));
    }
  }, []);

  // Get the display name (from personal info if available, otherwise use userName)
  const getDisplayName = () => {
    if (personalInfo.firstName) {
      return `${personalInfo.firstName} ${personalInfo.lastName}`;
    }
    return userName;
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (onNavigate) {
      onNavigate(view);
    }
  };

  // Render the UploadResume component when the view is "upload-resume"
  if (currentView === "upload-resume") {
    return <UploadResume userName={getDisplayName()} onNavigate={handleNavigate} />;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="logo-section">
          <h1 className="app-logo">JobMate</h1>
          <nav className="main-nav">
            <a
              href="#"
              className="nav-link active"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("dashboard");
              }}
            >
              Dashboard
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("jobs");
              }}
            >
              Jobs
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("applications");
              }}
            >
              Applications
            </a>
          </nav>
        </div>
        <div className="user-section">
          <div 
            className="user-avatar"
            onClick={() => handleNavigate("profile")}
            style={{ cursor: 'pointer' }}
          >
            <div className="initials">
              {getDisplayName()
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <div className="user-info">
            <div className="user-avatar large">
              <div className="initials">
                {getDisplayName()
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
            <div className="welcome-text">
              <h2>Welcome back, {getDisplayName().split(" ")[0]}!</h2>
              <p>Complete your profile to attract more opportunities</p>
            </div>
          </div>
        </div>

        <div className="action-cards longer">
          <div className="action-card">
            <div className="action-icon upload">
              <FiUpload />
            </div>
            <h3>Upload Resume</h3>
            <p>Let us auto-fill your job applications with your resume data</p>
            <button
              className="action-button"
              onClick={() => handleNavigate("upload-resume")}
            >
              Upload Resume
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon search">
              <FiSearch />
            </div>
            <h3>Find Jobs</h3>
            <p>Browse through thousands of job opportunities</p>
            <button
              className="action-button"
              onClick={() => handleNavigate("jobs")}
            >
              Search Jobs
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon match">
              <FiUserPlus />
            </div>
            <h3>Personal Info</h3>
            <p>Put in information for your resume</p>
            <button 
              className="action-button"
              onClick={() => handleNavigate("profile")}
            >
              Edit Info
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

