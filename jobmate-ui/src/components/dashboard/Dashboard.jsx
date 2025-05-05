"use client";

import { useState } from "react";
import "./Dashboard.css";
import UploadResume from "../resume/UploadResume";
import {
  FiBell,
  FiSettings,
  FiUpload,
  FiSearch,
  FiUserPlus,
  FiUser,
  FiFile,
  FiBriefcase,
  FiLogOut,
} from "react-icons/fi";

const Dashboard = ({ userName, onNavigate, onLogout }) => {
  const [isActivelyLooking, setIsActivelyLooking] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");

  const toggleActiveStatus = () => {
    setIsActivelyLooking(!isActivelyLooking);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (onNavigate) {
      onNavigate(view);
    }
  };

  // Render the UploadResume component when the view is "upload-resume"
  if (currentView === "upload-resume") {
    return <UploadResume userName={userName} onNavigate={handleNavigate} />;
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
          <button className="notification-button">
            <FiBell />
          </button>
          <button className="settings-button">
            <FiSettings />
          </button>
          <button className="logout-button" onClick={onLogout}>
            <FiLogOut /> Logout
          </button>
          <div className="user-avatar">
            <div className="initials">
              {userName
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
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
            <div className="welcome-text">
              <h2>Welcome back, {userName.split(" ")[0]}!</h2>
              <p>Complete your profile to attract more opportunities</p>
            </div>
          </div>
          <button
            className={`status-toggle ${
              isActivelyLooking ? "active" : "inactive"
            }`}
            onClick={toggleActiveStatus}
          >
            {isActivelyLooking ? "Actively Looking" : "Not Actively Looking"}
          </button>
        </div>

        <div className="action-cards">
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
            <h3>Company Matches</h3>
            <p>Discover companies that match your preferences</p>
            <button className="action-button">View Matches</button>
          </div>
        </div>

        <div className="profile-section">
          <h2>Complete Your Profile</h2>

          <div className="profile-items">
            <div className="profile-item">
              <div className="profile-icon">
                <FiUser />
              </div>
              <div className="profile-item-content">
                <span>Personal Information</span>
              </div>
              <button className="edit-button">Edit</button>
            </div>

            <div className="profile-item">
              <div className="profile-icon">
                <FiFile />
              </div>
              <div className="profile-item-content">
                <span>Resume</span>
              </div>
              <button
                className="edit-button"
                onClick={() => handleNavigate("upload-resume")}
              >
                Upload
              </button>
            </div>

            <div className="profile-item">
              <div className="profile-icon">
                <FiBriefcase />
              </div>
              <div className="profile-item-content">
                <span>Work Experience</span>
              </div>
              <button className="edit-button">Add</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
