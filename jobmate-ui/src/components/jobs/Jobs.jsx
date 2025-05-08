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
  const [debugMode, setDebugMode] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const getToken = () => localStorage.getItem("jobmate_token");

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

  useEffect(() => {
    fetchJobs();
  }, []);

  const extractJobId = (jobUrl) => {
    if (!jobUrl) return null;
    const matches = jobUrl.match(/\/(\d+)\/?$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  };
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    const queryParams = {
      keyword: searchTerm,
      location: location,
      jobType: jobType,
      experienceLevel: experienceLevel,
      remoteFilter: remoteFilter,
      dateSincePosted: dateSincePosted,
      limit: "20",
      sortBy: sortBy === "recent" ? "recent" : "relevant",
    };

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("http://127.0.0.1:8000/api/linkedin/jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          keyword: searchTerm,
          location: location,
          jobType: jobType,
          experienceLevel: experienceLevel,
          remoteFilter: remoteFilter,
          dateSincePosted: dateSincePosted,
          limit: "20",
          sortBy: sortBy === "recent" ? "recent" : "relevant",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error fetching jobs: ${response.status}`);
      }

      const data = await response.json();

      if (debugMode) {
        console.log("Raw job data from API:", data);
      }

      const enhancedData = data.map((job) => {
        const enhancedJob = { ...job };

        // Extract job ID
        if (!enhancedJob.jobId && enhancedJob.jobUrl) {
          enhancedJob.jobId = extractJobId(enhancedJob.jobUrl);
        }

        // Add job type from filter
        if (!enhancedJob.type && jobType) {
          enhancedJob.type = jobType;
        }

        // Add experience level from filter
        if (!enhancedJob.experienceLevel && experienceLevel) {
          enhancedJob.experienceLevel = experienceLevel;
        }

        // Add remote filter if not present
        if (!enhancedJob.remoteFilter && remoteFilter) {
          enhancedJob.remoteFilter = remoteFilter;
        }

        // Always ensure these fields exist
        enhancedJob.type = enhancedJob.type || "";
        enhancedJob.experienceLevel = enhancedJob.experienceLevel || "";
        enhancedJob.remoteFilter = enhancedJob.remoteFilter || "";
        enhancedJob.salary = enhancedJob.salary || "";

        // ✅ PHISHING DETECTION FIELDS
        // Make sure your Django backend includes these:
        enhancedJob.is_scam = job.is_scam || false;
        enhancedJob.confidence = job.confidence || 0;

        enhancedJob.severity = job.severity || "Low";
        enhancedJob.explanation = job.explanation || [];
        enhancedJob.fraud_score = job.fraud_score || 0;

        return enhancedJob;
      });

      if (debugMode) {
        console.log("Enhanced job data:", enhancedData);
      }

      setJobs(enhancedData);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
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
    setSelectedJob(job);

    if (job.jobId) {
      try {
        const token = getToken();
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

          if (debugMode) {
            console.log("Detailed job data:", detailedJob);
          }

          setSelectedJob((prev) => {
            const updatedJob = {
              ...prev,
              ...detailedJob,
              jobUrl: detailedJob.jobUrl || prev.jobUrl,
              type: detailedJob.type || prev.type || "",
              experienceLevel:
                detailedJob.experienceLevel || prev.experienceLevel || "",
              remoteFilter: detailedJob.remoteFilter || prev.remoteFilter || "",
              salary: detailedJob.salary || prev.salary || "",

              // ✅ PHISHING DETECTION IN DETAILS
              is_scam: detailedJob.is_scam || prev.is_scam || false,
              confidence: detailedJob.confidence || prev.confidence || 0,
              fraud_score: detailedJob.fraud_score ?? prev.fraud_score ?? 0,
              severity: detailedJob.severity ?? prev.severity ?? "Low",
              explanation: detailedJob.explanation ?? prev.explanation ?? [],
            };

            if (debugMode) {
              console.log("Updated selected job:", updatedJob);
            }

            return updatedJob;
          });
        }
      } catch (error) {
        console.error("Failed to fetch detailed job information:", error);
      }
    }
  };

  const handleCloseJobDetails = () => {
    setSelectedJob(null);
  };
  const handleApplyToJob = (job) => {
    if (job.jobUrl) {
      window.open(job.jobUrl, "_blank");
    } else if (job.jobId) {
      window.open(`https://www.linkedin.com/jobs/view/${job.jobId}/`, "_blank");
    }
  };

  const handleSaveJob = (jobIndex) => {
    const job = jobs[jobIndex];

    try {
      const savedJobsStr = localStorage.getItem("jobmate_saved_jobs");
      const savedJobs = savedJobsStr ? JSON.parse(savedJobsStr) : [];

      const isAlreadySaved = savedJobs.some(
        (savedJob) => savedJob.jobUrl === job.jobUrl
      );

      if (!isAlreadySaved) {
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

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";

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

  const getSalaryDisplay = (job) => {
    if (job.salary && job.salary !== "Not specified") {
      return job.salary;
    }
    return null;
  };

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

    return "entry-level-tag";
  };

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
  const renderJobTags = (job) => {
    return (
      <div className="job-card-meta">
        {(job.agoTime || job.date) && (
          <div className="job-time-tag">
            <FiClock className="tag-icon" />
            <span>{job.agoTime || formatTimeAgo(job.date)}</span>
          </div>
        )}

        {isNewJob(job) && (
          <div className="job-new-tag">
            <span>New</span>
          </div>
        )}

        {job.type && (
          <div className="job-type-tag">
            <FiBriefcase className="tag-icon" />
            <span>{job.type}</span>
          </div>
        )}

        {job.remoteFilter && (
          <div className="job-remote-tag">
            <FiGlobe className="tag-icon" />
            <span>{job.remoteFilter}</span>
          </div>
        )}

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

        {getSalaryDisplay(job) && (
          <div className="job-salary-tag">
            <FiDollarSign className="tag-icon" />
            <span>{getSalaryDisplay(job)}</span>
          </div>
        )}

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
  
  const runPhishingScan = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
  
      const updatedJobs = await Promise.all(
        jobs.map(async (job) => {
          const features = {
            description_word_count: job.description ? job.description.split(" ").length : 0,
            suspicious_word_score: ["money", "quick", "urgent"].filter(word =>
              job.description?.toLowerCase().includes(word)
            ).length,
            contains_links: job.description?.toLowerCase().includes("http") ? 1 : 0,
            suspicious_email_domain: 0,
            has_salary_info: job.salary && job.salary.toLowerCase() !== "not specified" ? 1 : 0,
            company_profile_length: job.company ? job.company.length : 0,
            is_contract: job.type && job.type.toLowerCase() === "contract" ? 1 : 0
          };          
  
          const response = await fetch("http://127.0.0.1:8000/api/detect-fake-job/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify(features),
          });
      
          if (response.ok) {
            const phishingResult = await response.json();
            return {
              ...job,
              is_fake: phishingResult.is_fake,
              fraud_score: phishingResult.fraud_probability,
              model_used: phishingResult.model_used,
              severity: phishingResult.severity,
              explanation: phishingResult.explanation
            };
          }
      
          return job;
        })
      );
  
      setJobs(updatedJobs);
      alert("Phishing scan complete!");
    } catch (err) {
      console.error("Failed to scan jobs for phishing:", err);
      alert("Failed to run phishing scan. Please try again.");
    }
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
            <a
              href="#"
              className="nav-link"
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
                <button type="button" onClick={handleClearFilters} className="clear-button">
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
                <button
                  type="button"
                  onClick={runPhishingScan}
                  className="scan-button"
                >
                  Scan Jobs for Scams
                </button>
              </div>
            </form>
          </div>

          <div className="jobs-results">
    
          {jobs.some(job => job.is_fake) && (
            <div className="alert-banner scam-detected">
              ⚠️ Warning: Some jobs in the list are flagged as potential scams.
            </div>
          )}

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
                      className={`job-card ${job.is_fake ? "scam-risk" : ""}`}
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
                          <h3 className="job-title">
                            {job.position}
                            {job.is_fake && (
                              <span className="scam-badge" title="Scam Risk">
                                Scam Risk
                              </span>
                            )}
                          </h3>
                          
                          {job.is_fake && (
                            <div className="scam-extra-info">
                              <div className={`scam-severity ${job.severity.toLowerCase()}`}>
                                Severity: {job.severity}
                              </div>
                              {job.explanation && job.explanation.length > 0 && (
                                <details>
                                  <summary>Why flagged?</summary>
                                  <ul>
                                    {job.explanation.map((reason, i) => (
                                      <li key={i}>{reason}</li>
                                    ))}
                                  </ul>
                                </details>
                              )}
                            </div>
                          )}

                          <span className="job-company">{job.company}</span>
                          <span className="job-location">{job.location}</span>
                          {typeof job.fraud_score === "number" && (
                            <div className="fraud-score">
                              Risk: {(job.fraud_score * 100).toFixed(0)}%
                            </div>
                          )}

                          {/* Job Tags Section - using the renderJobTags helper */}
                          {renderJobTags(job)}
                          {job.is_fake && (
                            <div className="job-scam-tag">
                            <FiAlertCircle className="tag-icon" />
                            <span>Scam Risk</span>
                            </div>
                          )}

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

                {typeof selectedJob.fraud_score === "number" && (
                  <div className="job-detail-meta-item scam-risk">
                    <FiAlertCircle />
                    <span>Scam Risk: {(selectedJob.fraud_score * 100).toFixed(0)}%</span>
                  </div>
                )}

                {selectedJob.is_fake && (
                  <div>
                    <div className="phishing-warning">
                      ⚠️ Warning: This job is predicted as a potential scam.
                    </div>
                    <div className={`scam-severity ${selectedJob.severity.toLowerCase()}`}>
                      Severity: {selectedJob.severity}
                    </div>
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