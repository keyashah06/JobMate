"use client";

import { useState, useEffect } from "react";
import "./Jobs.css";
import {
  FiBell,
  FiSettings,
  FiSearch,
  FiMapPin,
  FiBookmark,
  FiAlertCircle,
  FiFilter,
  FiLoader,
  FiBriefcase,
  FiX,
  FiDollarSign,
  FiClock,
  FiLayers,
  FiGlobe,
  FiTag,
  FiChevronDown,
  FiCalendar,
} from "react-icons/fi";

const Jobs = ({ onNavigate, userName = "User" }) => {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [remoteFilter, setRemoteFilter] = useState("");
  const [dateSincePosted, setDateSincePosted] = useState("");
  const [sortBy, setSortBy] = useState("relevant");

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugMode, setDebugMode] = useState(false); // For debugging

  // Job detail modal state
  const [selectedJob, setSelectedJob] = useState(null);

  // Show/hide advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Token for auth
  const getToken = () => localStorage.getItem("token");

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Volunteer",
    "Internship",
  ];

  const experienceLevels = [
    "Internship",
    "Entry level",
    "Associate",
    "Mid-Senior",
    "Director",
    "Executive",
  ];

  const remoteOptions = ["On-site", "Remote", "Hybrid"];

  const datePostedOptions = ["Past 24 hours", "Past Week", "Past Month"];

  // Search for jobs when filters change
  useEffect(() => {
    // Initial job search on component mount
    fetchJobs();
  }, []);

  // Helper function to extract job ID from LinkedIn URL
  const extractJobId = (jobUrl) => {
    if (!jobUrl) return null;

    // LinkedIn job URLs typically end with the job ID
    // Example: https://www.linkedin.com/jobs/view/paralegal-at-f45-training-ashrafieh-4204120785/
    const matches = jobUrl.match(/\/(\d+)\/?$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    // Prepare query params
    const queryParams = {
      keyword: searchTerm,
      location: location,
      jobType: jobType,
      experienceLevel: experienceLevel,
      remoteFilter: remoteFilter,
      dateSincePosted: dateSincePosted,
      limit: "20", // Limit results
      sortBy: sortBy === "recent" ? "recent" : "relevant",
    };

    try {
      // Get the auth token
      // const token = localStorage.getItem("token");
      // if (!token) {
      //   throw new Error("Authentication required");
      // }

      // Call the backend API
      const response = await fetch("http://127.0.0.1:8000/api/linkedin/jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Token ${token}`,
        },
        body: JSON.stringify(queryParams),
      });

      if (!response.ok) {
        throw new Error(`Error fetching jobs: ${response.status}`);
      }

      const data = await response.json();

      // Debug: Log the raw data from the API
      if (debugMode) {
        console.log("Raw job data from API:", data);
      }

      // Enhance job data with filter information and extract job IDs
      const enhancedData = await Promise.all(
        data.map(async (job) => {      
        const enhancedJob = { ...job };

        // Extract job ID from URL if not already present
        if (!enhancedJob.jobId && enhancedJob.jobUrl) {
          enhancedJob.jobId = extractJobId(enhancedJob.jobUrl);
        }

        // Add job type from filter if not present in job data
        if (!enhancedJob.type && jobType) {
          enhancedJob.type = jobType;
        }

        // Add experience level from filter if not present in job data
        if (!enhancedJob.experienceLevel && experienceLevel) {
          enhancedJob.experienceLevel = experienceLevel;
        }

        // Add remote filter if not present in job data
        if (!enhancedJob.remoteFilter && remoteFilter) {
          enhancedJob.remoteFilter = remoteFilter;
        }

        // Always ensure these fields exist (even if empty)
        enhancedJob.type = enhancedJob.type || "";
        enhancedJob.experienceLevel = enhancedJob.experienceLevel || "";
        enhancedJob.remoteFilter = enhancedJob.remoteFilter || "";
        enhancedJob.salary = enhancedJob.salary || "";

            // Run phishing detection!
    const scanResult = await scanJobForPhishing(enhancedJob.description || "");

    // Attach results to job
    enhancedJob.scam_prediction = scanResult.scam_prediction;
    enhancedJob.fraud_probability = scanResult.fraud_probability;
    enhancedJob.model_used = scanResult.model_used;

        return enhancedJob;
      }));

      // Debug: Log the enhanced data
      if (debugMode) {
        console.log("Enhanced job data:", enhancedData);
      }

      setJobs(enhancedData);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError(err.message || "Failed to load jobs");
      // If API fails, we could provide fallback with mock data
    } finally {
      setLoading(false);
    }
  };

  const scanJobForPhishing = async (description) => {
    const features = {
      description_word_count: description?.split(" ").length || 0,
      suspicious_word_score: description?.toLowerCase().includes("quick money") ? 5 : 0,
      contains_links: description?.includes("http") ? 1 : 0,
      suspicious_email_domain: 0,
      has_salary_info: 1,
      company_profile_length: 50,
      is_contract: 0
    };
  
    try {
      const res = await fetch("http://127.0.0.1:8000/api/detect-fake-job/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(features)
      });
  
      const result = await res.json();
      return {
        scam_prediction: result?.message || "Unknown",
        fraud_probability: result?.fraud_probability || 0,
        model_used: result?.model_used || "unknown"
      };
    } catch (err) {
      console.error("Phishing scan error:", err);
      return {
        scam_prediction: "Scan failed",
        fraud_probability: 0,
        model_used: "N/A"
      };
    }
  };
  

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setJobType("");
    setExperienceLevel("");
    setRemoteFilter("");
    setDateSincePosted("");
    setSortBy("relevant");
  };

  const handleViewJobDetails = async (job) => {
    // Set the selected job immediately for better UX
    setSelectedJob(job);

    // If we have a job ID, fetch more detailed information
    if (job.jobId) {
      try {
        const token = getToken();
        console.log("TOKEN:", token);
        // Check if token is available
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `http://127.0.0.1:8000/api/linkedin/jobs/${job.jobId}/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        if (response.ok) {
          const detailedJob = await response.json();

          // Debug: Log the detailed job data
          if (debugMode) {
            console.log("Detailed job data:", detailedJob);
          }

          // Update the selected job with more detailed information
          setSelectedJob((prev) => {
            const updatedJob = {
              ...prev,
              ...detailedJob,
              // Preserve the original job URL if the detailed one doesn't have it
              jobUrl: detailedJob.jobUrl || prev.jobUrl,
              // Ensure these fields exist (even if empty)
              type: detailedJob.type || prev.type || "",
              experienceLevel:
                detailedJob.experienceLevel || prev.experienceLevel || "",
              remoteFilter: detailedJob.remoteFilter || prev.remoteFilter || "",
              salary: detailedJob.salary || prev.salary || "",
            };

            // Debug: Log the updated job
            if (debugMode) {
              console.log("Updated selected job:", updatedJob);
            }

            return updatedJob;
          });
        }
      } catch (error) {
        console.error("Failed to fetch detailed job information:", error);
        // Keep using the basic job info we already have
      }
    }
  };

  const handleCloseJobDetails = () => {
    setSelectedJob(null);
  };

  const handleApplyToJob = (job) => {
    // Use job URL directly if available
    if (job.jobUrl) {
      window.open(job.jobUrl, "_blank");
    }
    // Otherwise construct URL from job ID
    else if (job.jobId) {
      window.open(`https://www.linkedin.com/jobs/view/${job.jobId}/`, "_blank");
    }
  };

  const handleSaveJob = (jobIndex) => {
    const job = jobs[jobIndex];

    try {
      // Get existing saved jobs from localStorage
      const savedJobsStr = localStorage.getItem("jobmate_saved_jobs");
      const savedJobs = savedJobsStr ? JSON.parse(savedJobsStr) : [];

      // Check if job is already saved
      const isAlreadySaved = savedJobs.some(
        (savedJob) => savedJob.jobUrl === job.jobUrl
      );

      if (!isAlreadySaved) {
        // Add to saved jobs
        savedJobs.push(job);
        localStorage.setItem("jobmate_saved_jobs", JSON.stringify(savedJobs));
        alert("Job saved successfully!");
      } else {
        alert("This job is already saved!");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job. Please try again.");
    }
  };

  // Format the date to a human-readable format like "1 hour ago", "2 days ago"
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";

    // If it's already in a relative format like "2 days ago"
    if (dateString.includes("ago")) {
      return dateString;
    }

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  };

  // Helper function to get company initials for logo
  const getCompanyInitials = (companyName) => {
    if (!companyName) return "?";
    const words = companyName.split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper function to determine if a job is new (posted within 24 hours)
  const isNewJob = (job) => {
    if (!job.date && !job.agoTime) return false;

    if (job.agoTime) {
      return (
        job.agoTime.includes("hour") ||
        job.agoTime.includes("minute") ||
        job.agoTime.includes("Just now")
      );
    }

    if (job.date) {
      const jobDate = new Date(job.date);
      const now = new Date();
      const diffTime = Math.abs(now - jobDate);
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      return diffHours < 24;
    }

    return false;
  };

  // Helper function to generate a salary range for display purposes
  const getSalaryDisplay = (job) => {
    // Only return actual salary data from the API, no placeholders
    if (job.salary && job.salary !== "Not specified") {
      return job.salary;
    }
    return null;
  };

  // Helper function to get the appropriate CSS class for experience level
  const getExperienceLevelClass = (level) => {
    if (!level) return "entry-level-tag";

    const normalizedLevel = level.toLowerCase();

    if (normalizedLevel.includes("intern")) {
      return "intern-tag";
    } else if (
      normalizedLevel.includes("entry") ||
      normalizedLevel.includes("junior")
    ) {
      return "entry-level-tag";
    } else if (normalizedLevel.includes("associate")) {
      return "associate-tag";
    } else if (
      normalizedLevel.includes("mid") ||
      normalizedLevel.includes("senior")
    ) {
      return "mid-senior-tag";
    } else if (normalizedLevel.includes("director")) {
      return "director-tag";
    } else if (normalizedLevel.includes("exec")) {
      return "executive-tag";
    }

    return "entry-level-tag"; // default
  };

  // Toggle debug mode (for development)
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    if (!debugMode) {
      console.log("Debug mode enabled");
      console.log("Current jobs:", jobs);
      console.log("Selected job:", selectedJob);
    } else {
      console.log("Debug mode disabled");
    }
  };

  // Render job tags based on available data
  const renderJobTags = (job) => {
    return (
      <div className="job-card-meta">
        {/* Time posted tag - always show if we have date info */}
        {(job.agoTime || job.date) && (
          <div className="job-time-tag">
            <FiClock className="tag-icon" />
            <span>{job.agoTime || formatTimeAgo(job.date)}</span>
          </div>
        )}

        {/* New job tag - always show for new jobs */}
        {isNewJob(job) && (
          <div className="job-new-tag">
            <span>New</span>
          </div>
        )}

        {/* Job type tag - show if available or from filter */}
        {job.type && (
          <div className="job-type-tag">
            <FiBriefcase className="tag-icon" />
            <span>{job.type}</span>
          </div>
        )}

        {/* Remote/Hybrid/On-site tag - show if available or from filter */}
        {job.remoteFilter && (
          <div className="job-remote-tag">
            <FiGlobe className="tag-icon" />
            <span>{job.remoteFilter}</span>
          </div>
        )}

        {/* Experience level tag - show if available or from filter with dynamic color */}
        {job.experienceLevel && (
          <div
            className={`job-experience-tag ${getExperienceLevelClass(
              job.experienceLevel
            )}`}
          >
            <FiLayers className="tag-icon" />
            <span>{job.experienceLevel}</span>
          </div>
        )}

        {/* Salary tag - show if available or can be estimated */}
        {getSalaryDisplay(job) && (
          <div className="job-salary-tag">
            <FiDollarSign className="tag-icon" />
            <span>{getSalaryDisplay(job)}</span>
          </div>
        )}

        {/* Fallback tag - if no other tags are shown, show at least one */}
        {!job.type &&
          !job.remoteFilter &&
          !job.experienceLevel &&
          !getSalaryDisplay(job) &&
          !isNewJob(job) && (
            <div className="job-type-tag">
              <FiTag className="tag-icon" />
              <span>{jobType || "Job"}</span>
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="jobs-page">
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
              className="nav-link active"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("jobs");
              }}
            >
              Jobs
            </a>
          </nav>
        </div>
        <div className="user-section">
          <button className="notification-button">
            <FiBell />
          </button>
          <button
            className="settings-button"
            onClick={toggleDebugMode} // Double-click to toggle debug mode
            onDoubleClick={toggleDebugMode}
          >
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

      <main className="jobs-content">
        <div className="jobs-container">
          <div className="search-section">
            <h2>Find Your Perfect Job</h2>
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-inputs">
                <div className="search-input-wrapper">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="search-input-wrapper">
                  <FiMapPin />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="search-input-wrapper select-wrapper">
                  <select
                    className="job-type-select"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="">Any Job Type</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="chevron-icon" />
                </div>
              </div>

              <div className="advanced-filters-toggle">
                <button
                  type="button"
                  className="toggle-filters-button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <FiFilter />{" "}
                  {showAdvancedFilters
                    ? "Hide Advanced Filters"
                    : "Show Advanced Filters"}
                </button>
              </div>

              {showAdvancedFilters && (
                <div className="advanced-filters">
                  <div className="advanced-filters-grid">
                    <div className="filter-group">
                      <label>Experience Level</label>
                      <div className="select-container">
                        <FiLayers className="select-icon" />
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                        >
                          <option value="">Any Experience</option>
                          {experienceLevels.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="chevron-icon" />
                      </div>
                    </div>

                    <div className="filter-group">
                      <label>Remote Preference</label>
                      <div className="select-container">
                        <FiGlobe className="select-icon" />
                        <select
                          value={remoteFilter}
                          onChange={(e) => setRemoteFilter(e.target.value)}
                        >
                          <option value="">Any Location Type</option>
                          {remoteOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="chevron-icon" />
                      </div>
                    </div>

                    <div className="filter-group">
                      <label>Date Posted</label>
                      <div className="select-container">
                        <FiCalendar className="select-icon" />
                        <select
                          value={dateSincePosted}
                          onChange={(e) => setDateSincePosted(e.target.value)}
                        >
                          <option value="">Any Time</option>
                          {datePostedOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="chevron-icon" />
                      </div>
                    </div>

                    <div className="filter-group">
                      <label>Sort By</label>
                      <div className="select-container">
                        <FiFilter className="select-icon" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="relevant">Most Relevant</option>
                          <option value="recent">Most Recent</option>
                        </select>
                        <FiChevronDown className="chevron-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="search-buttons">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="clear-button"
                >
                  Clear
                </button>
                <button type="submit" className="search-button">
                  {loading ? (
                    <>
                      <FiLoader className="spinner" /> Searching...
                    </>
                  ) : (
                    <>Search Jobs</>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="jobs-results">
            <div className="results-header">
              <h3>
                {loading
                  ? "Searching for jobs..."
                  : jobs.length > 0
                  ? `Showing ${jobs.length} jobs`
                  : "No jobs found"}
              </h3>
            </div>

            {error && (
              <div className="error-message">
                <FiAlertCircle /> {error}
              </div>
            )}

            <div className="job-cards">
              {loading ? (
                <div className="loading-indicator">
                  <FiLoader className="spinner" />
                  <p>Searching for jobs...</p>
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job, index) => {
                  return (
                    <div
                      className="job-card"
                      key={index}
                      onClick={() => handleViewJobDetails(job)}
                    >
                      <div className="job-card-header">
                        <div className="job-company-logo">
                          {job.companyLogo ? (
                            <img
                              src={job.companyLogo || "/placeholder.svg"}
                              alt={`${job.company} logo`}
                            />
                          ) : (
                            <div className="company-logo-placeholder">
                              {getCompanyInitials(job.company)}
                            </div>
                          )}
                        </div>

                        <div className="job-card-info">
                          <h3 className="job-title">{job.position}</h3>
                          <span className="job-company">{job.company}</span>
                          <span className="job-location">{job.location}</span>

                          {job.scam_prediction && (
                            <div className="text-sm mt-2 text-red-600 font-medium">
                              <strong>⚠️ Scam Check:</strong> {job.scam_prediction}{" "}
                              {job.fraud_probability && `(Confidence: ${Math.round(job.fraud_probability * 100)}%)`}
                            </div>
                          )}


                          {/* Job Tags Section - using the renderJobTags helper */}
                          {renderJobTags(job)}
                        </div>
                      </div>

                      <div
                        className="job-card-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="save-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(index);
                          }}
                        >
                          <FiBookmark />
                          <span>Save</span>
                        </button>
                        <button
                          className="apply-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyToJob(job);
                          }}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-jobs-found">
                  <FiAlertCircle />
                  <h3>No jobs found</h3>
                  <p>
                    Try adjusting your search filters or try a different keyword
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="reset-search-button"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="job-detail-modal active">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseJobDetails}>
              <FiX />
            </button>

            <div className="job-detail-header">
              <div className="job-detail-company">
                <div className="job-detail-company-logo">
                  {selectedJob.companyLogo ? (
                    <img
                      src={selectedJob.companyLogo || "/placeholder.svg"}
                      alt={`${selectedJob.company} logo`}
                    />
                  ) : (
                    <div className="company-logo-placeholder">
                      {getCompanyInitials(selectedJob.company)}
                    </div>
                  )}
                </div>
                <div className="job-detail-info">
                  <h3>{selectedJob.position}</h3>
                  <p className="job-company-name">{selectedJob.company}</p>
                </div>
              </div>

              <div className="job-detail-meta">
                <div className="job-detail-meta-item">
                  <FiMapPin />
                  <span>{selectedJob.location}</span>
                </div>
                {(selectedJob.agoTime || selectedJob.date) && (
                  <div className="job-detail-meta-item">
                    <FiClock />
                    <span>
                      Posted:{" "}
                      {selectedJob.agoTime || formatTimeAgo(selectedJob.date)}
                    </span>
                  </div>
                )}
                {selectedJob.type && (
                  <div className="job-detail-meta-item">
                    <FiBriefcase />
                    <span>{selectedJob.type}</span>
                  </div>
                )}
                {selectedJob.remoteFilter && (
                  <div className="job-detail-meta-item">
                    <FiGlobe />
                    <span>{selectedJob.remoteFilter}</span>
                  </div>
                )}
                {selectedJob.experienceLevel && (
                  <div className="job-detail-meta-item">
                    <FiLayers />
                    <span>{selectedJob.experienceLevel}</span>
                  </div>
                )}
                {getSalaryDisplay(selectedJob) && (
                  <div className="job-detail-meta-item">
                    <FiDollarSign />
                    <span>{getSalaryDisplay(selectedJob)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job description section */}
            <div className="job-detail-content">
              <div className="job-detail-section">
                <h4>Job Description</h4>
                <div className="job-detail-description">
                  {selectedJob.description ? (
                    <p>{selectedJob.description}</p>
                  ) : (
                    <p className="no-description">
                      No detailed description available. Please click "Apply on
                      LinkedIn" to view the full job details.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="job-detail-actions">
              <a
                href={
                  selectedJob.jobUrl ||
                  (selectedJob.jobId
                    ? `https://www.linkedin.com/jobs/view/${selectedJob.jobId}/`
                    : "#")
                }
                target="_blank"
                rel="noopener noreferrer"
                className="apply-button"
              >
                Apply on LinkedIn
              </a>
              <button
                className="save-button"
                onClick={() =>
                  handleSaveJob(
                    jobs.findIndex((j) => j.jobUrl === selectedJob.jobUrl)
                  )
                }
              >
                <FiBookmark /> Save Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
