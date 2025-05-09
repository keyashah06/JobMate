"use client";

import { useState, useEffect } from "react";
import {
  FiX,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiLoader,
  FiClock,
  FiTag,
  FiGlobe,
  FiLayers,
} from "react-icons/fi";
import "./JobDetail.css";

const JobDetail = ({ jobId, jobUrl, onClose }) => {
  const [jobDetail, setJobDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // If we have a jobId, fetch from backend
        if (jobId) {
          const token = localStorage.getItem("jobmate_token");
          const response = await fetch(
            `http://127.0.0.1:8000/api/linkedin/jobs/${jobId}/`,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Error fetching job details: ${response.status}`);
          }

          const data = await response.json();
          setJobDetail(data);
        } else {
          // If no jobId but we have jobUrl, use fallback data
          setJobDetail({
            position: "Job Details Not Available",
            company: "Please visit the LinkedIn job page for complete details",
            location: "Unknown",
            description:
              "The full job description could not be retrieved. Please click the 'View on LinkedIn' button below to see the complete job details on LinkedIn.",
            jobUrl: jobUrl || "#",
          });
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);
        setError(err.message || "Failed to load job details");

        // Set fallback data
        setJobDetail({
          position: "Job Details Not Available",
          company: "Please visit the LinkedIn job page for complete details",
          location: "Unknown",
          description:
            "The full job description could not be retrieved. Please click the 'View on LinkedIn' button below to see the complete job details on LinkedIn.",
          jobUrl: jobUrl || "#",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId, jobUrl]);

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return "Recently posted";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch (error) {
      return dateString; // Return original if formatting fails
    }
  };

  // Helper function to determine if a job is new (posted within 24 hours)
  const isNewJob = (job) => {
    if (!job.date && !job.agoTime) return false;

    if (job.agoTime) {
      return (
        job.agoTime.includes("hour") ||
        job.agoTime.includes("Just now") ||
        job.agoTime.includes("minute")
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

  return (
    <div className={`job-detail-modal ${jobDetail ? "active" : ""}`}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>

        {loading ? (
          <div className="job-detail-loading">
            <FiLoader className="spinner" />
            <p>Loading job details...</p>
          </div>
        ) : error ? (
          <div className="job-detail-error">
            <h3>Error Loading Job Details</h3>
            <p>{error}</p>
            <div className="job-detail-actions">
              <a
                href={jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="apply-button"
              >
                View on LinkedIn
              </a>
              <button className="secondary-button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : jobDetail ? (
          <>
            <div className="job-detail-header">
              <div className="job-detail-company">
                <div className="job-detail-company-logo">
                  {jobDetail.companyLogo ? (
                    <img
                      src={jobDetail.companyLogo || "/placeholder.svg"}
                      alt={`${jobDetail.company} logo`}
                    />
                  ) : (
                    <FiBriefcase />
                  )}
                </div>
                <div className="job-detail-info">
                  <h3>{jobDetail.position}</h3>
                  <p className="job-company-name">{jobDetail.company}</p>
                </div>
              </div>

              <div className="job-detail-meta">
                <div className="job-detail-meta-item">
                  <FiMapPin />
                  <span>{jobDetail.location}</span>
                </div>
                {jobDetail.date && (
                  <div className="job-detail-meta-item">
                    <FiCalendar />
                    <span>Posted: {formatDate(jobDetail.date)}</span>
                  </div>
                )}
                {jobDetail.agoTime && (
                  <div className="job-detail-meta-item">
                    <FiClock />
                    <span>Posted: {jobDetail.agoTime}</span>
                  </div>
                )}
                {jobDetail.salary && jobDetail.salary !== "Not specified" && (
                  <div className="job-detail-meta-item">
                    <FiDollarSign />
                    <span>{jobDetail.salary}</span>
                  </div>
                )}
              </div>

              {/* Job Detail Tags */}
              <div className="job-card-tags">
                {/* Job type tag */}
                {jobDetail.type && (
                  <span className="job-tag type-tag">
                    <FiBriefcase className="tag-icon" />
                    {jobDetail.type}
                  </span>
                )}

                {/* Remote/Hybrid/On-site tag */}
                {jobDetail.remoteFilter && (
                  <span className="job-tag">
                    <FiGlobe className="tag-icon" />
                    {jobDetail.remoteFilter}
                  </span>
                )}

                {/* Experience level tag */}
                {jobDetail.experienceLevel && (
                  <span className="job-tag level-tag">
                    <FiLayers className="tag-icon" />
                    {jobDetail.experienceLevel}
                  </span>
                )}

                {/* New job tag */}
                {isNewJob(jobDetail) && (
                  <span className="job-tag new-tag">
                    <FiTag className="tag-icon" />
                    New
                  </span>
                )}

                {/* Salary tag */}
                {jobDetail.salary && jobDetail.salary !== "Not specified" && (
                  <span className="job-tag salary-tag">
                    <FiDollarSign className="tag-icon" />
                    {jobDetail.salary}
                  </span>
                )}
              </div>
            </div>

            <div className="job-detail-content">
              <div className="job-detail-section">
                <h4>Job Description</h4>
                <div className="job-detail-description">
                  <p>{jobDetail.description}</p>
                </div>
              </div>

              {jobDetail.requirements && (
                <div className="job-detail-section">
                  <h4>Requirements</h4>
                  <ul>
                    {jobDetail.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="job-detail-actions">
              <a
                href={jobDetail.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="apply-button"
              >
                Apply Now
              </a>
              <button className="save-job-button">Save Job</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default JobDetail;


