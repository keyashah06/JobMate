import { useState, useEffect } from "react";
import {
  FiBell,
  FiSettings,
  FiTrash2,
  FiExternalLink,
  FiBriefcase,
  FiSearch,
} from "react-icons/fi";
import JobDetail from "./JobDetail";
import "./SavedJobs.css";

const SavedJobs = ({ onNavigate, userName = "User" }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  // Load saved jobs from localStorage on component mount
  useEffect(() => {
    const loadSavedJobs = () => {
      try {
        const storedJobs = localStorage.getItem("jobmate_saved_jobs");
        if (storedJobs) {
          setSavedJobs(JSON.parse(storedJobs));
        }
      } catch (error) {
        console.error("Failed to load saved jobs:", error);
      }
    };

    loadSavedJobs();
  }, []);

  // Filter jobs based on search term
  const filteredJobs = savedJobs.filter(
    (job) =>
      job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveJob = (index) => {
    const updatedJobs = [...savedJobs];
    updatedJobs.splice(index, 1);
    setSavedJobs(updatedJobs);

    // Update localStorage
    localStorage.setItem("jobmate_saved_jobs", JSON.stringify(updatedJobs));
  };

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
  };

  const handleCloseJobDetails = () => {
    setSelectedJob(null);
  };

  const handleApplyToJob = (jobUrl) => {
    window.open(jobUrl, "_blank");
  };

  return (
    <div className="saved-jobs-page">
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
                onNavigate("saved-jobs");
              }}
            >
              Saved Jobs
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
            <FiBell />
          </button>
          <button className="settings-button">
            <FiSettings />
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

      <main className="saved-jobs-content">
        <div className="saved-jobs-container">
          <div className="saved-jobs-header">
            <h2>Saved Jobs</h2>
            <div className="search-input-wrapper">
              <FiSearch />
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {savedJobs.length === 0 ? (
            <div className="no-saved-jobs">
              <div className="empty-state-icon">
                <FiBriefcase />
              </div>
              <h3>No Saved Jobs Yet</h3>
              <p>
                Save jobs you're interested in to keep track of opportunities
              </p>
              <button
                className="action-button"
                onClick={() => onNavigate("jobs")}
              >
                Find Jobs
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="no-matching-jobs">
              <h3>No matching jobs found</h3>
              <p>Try adjusting your search term</p>
              <button
                className="secondary-button"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="saved-jobs-list">
              {filteredJobs.map((job, index) => (
                <div className="saved-job-card" key={index}>
                  <div
                    className="saved-job-info"
                    onClick={() => handleViewJobDetails(job)}
                  >
                    <div className="job-company-logo">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={`${job.company} logo`}
                        />
                      ) : (
                        <div className="company-logo-placeholder">
                          <FiBriefcase />
                        </div>
                      )}
                    </div>
                    <div className="saved-job-details">
                      <h3 className="job-title">{job.position}</h3>
                      <span className="job-company">{job.company}</span>
                      <span className="job-location">{job.location}</span>
                      {job.agoTime && (
                        <span className="job-posted">{job.agoTime}</span>
                      )}
                    </div>
                  </div>
                  <div className="saved-job-actions">
                    <button
                      className="apply-button"
                      onClick={() => handleApplyToJob(job.jobUrl)}
                    >
                      <FiExternalLink /> Apply
                    </button>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveJob(index)}
                      aria-label="Remove job"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetail
          jobId={selectedJob.id}
          jobUrl={selectedJob.jobUrl}
          onClose={handleCloseJobDetails}
        />
      )}
    </div>
  );
};

export default SavedJobs;


