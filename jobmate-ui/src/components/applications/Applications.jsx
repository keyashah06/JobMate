"use client";

import { useState } from "react";
import "./Applications.css";

const Applications = ({ onNavigate }) => {
  const [applications] = useState([
    {
      id: 1,
      jobTitle: "Frontend Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      appliedDate: "2025-03-20",
      status: "Applied",
      nextStep: "Awaiting review",
    },
    {
      id: 2,
      jobTitle: "UX Designer",
      company: "DesignHub",
      location: "Remote",
      appliedDate: "2025-03-15",
      status: "Interview",
      nextStep: "Technical interview scheduled for March 28",
    },
    {
      id: 3,
      jobTitle: "Product Manager",
      company: "InnoSoft",
      location: "New York, NY",
      appliedDate: "2025-03-10",
      status: "Rejected",
      nextStep: "Position filled",
    },
    {
      id: 4,
      jobTitle: "React Developer",
      company: "WebWorks",
      location: "Austin, TX",
      appliedDate: "2025-03-05",
      status: "Offer",
      nextStep: "Review offer by April 2",
    },
  ]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "status-applied";
      case "Interview":
        return "status-interview";
      case "Rejected":
        return "status-rejected";
      case "Offer":
        return "status-offer";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="applications-page">
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
              className="nav-link active"
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
            <div className="initials">JD</div>
          </div>
        </div>
      </header>

      <main className="applications-content">
        <div className="applications-container">
          <div className="applications-header">
            <h2>Your Job Applications</h2>
            <div className="applications-filters">
              <select className="filter-select">
                <option value="all">All Applications</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
              <select className="sort-select">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="applications-summary">
            <div className="summary-card">
              <div className="summary-value">4</div>
              <div className="summary-label">Total Applications</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">1</div>
              <div className="summary-label">Applied</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">1</div>
              <div className="summary-label">Interviewing</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">1</div>
              <div className="summary-label">Offers</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">1</div>
              <div className="summary-label">Rejected</div>
            </div>
          </div>

          <div className="applications-list">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Next Step</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="job-info">
                        <div className="job-title">{app.jobTitle}</div>
                        <div className="job-location">{app.location}</div>
                      </div>
                    </td>
                    <td>{app.company}</td>
                    <td>{formatDate(app.appliedDate)}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td>{app.nextStep}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-button view-button">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button className="action-button edit-button">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button className="action-button delete-button">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="add-application">
            <button className="add-application-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Application
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Applications;