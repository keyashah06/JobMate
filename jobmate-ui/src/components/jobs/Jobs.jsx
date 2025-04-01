"use client";

import { useState } from "react";
import "./Jobs.css";

const Jobs = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Remote",
  ];

  const [jobs] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$90,000 - $120,000",
      posted: "2 days ago",
      description:
        "We're looking for a Frontend Developer with React experience to join our growing team.",
      requirements: [
        "3+ years of React experience",
        "TypeScript knowledge",
        "CSS/SCSS proficiency",
        "Experience with REST APIs",
      ],
    },
    {
      id: 2,
      title: "Product Manager",
      company: "InnoSoft",
      location: "New York, NY",
      type: "Full-time",
      salary: "$110,000 - $140,000",
      posted: "1 week ago",
      description:
        "Join our product team to help shape the future of our SaaS platform.",
      requirements: [
        "5+ years in product management",
        "Experience with agile methodologies",
        "Strong communication skills",
        "Data-driven decision making",
      ],
    },
    {
      id: 3,
      title: "UX Designer",
      company: "DesignHub",
      location: "Remote",
      type: "Contract",
      salary: "$70 - $90 per hour",
      posted: "3 days ago",
      description:
        "We need a talented UX Designer to help us create beautiful and intuitive user experiences.",
      requirements: [
        "Portfolio showcasing UI/UX work",
        "Figma proficiency",
        "User research experience",
        "Prototyping skills",
      ],
    },
    {
      id: 4,
      title: "Backend Engineer",
      company: "DataSystems",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$100,000 - $130,000",
      posted: "Just now",
      description: "Build robust backend services for our cloud platform.",
      requirements: [
        "Node.js and Express expertise",
        "MongoDB or SQL database experience",
        "API design knowledge",
        "AWS or Azure cloud services",
      ],
    },
    {
      id: 5,
      title: "Marketing Intern",
      company: "GrowthLabs",
      location: "Chicago, IL",
      type: "Internship",
      salary: "$25 - $30 per hour",
      posted: "5 days ago",
      description:
        "Learn digital marketing strategies while contributing to real campaigns.",
      requirements: [
        "Currently pursuing Marketing or related degree",
        "Social media savvy",
        "Basic analytics knowledge",
        "Strong writing skills",
      ],
    },
  ]);

  const filteredJobs = jobs.filter((job) => {
    const matchesTerm =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      location === "" ||
      job.location.toLowerCase().includes(location.toLowerCase());

    const matchesType = jobType === "" || job.type === jobType;

    return matchesTerm && matchesLocation && matchesType;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this could trigger an API call
    console.log("Searching for:", { searchTerm, location, jobType });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setJobType("");
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

      <main className="jobs-content">
        <div className="jobs-container">
          <div className="search-section">
            <h2>Find Your Perfect Job</h2>
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-inputs">
                <div className="search-input-wrapper">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="search-input-wrapper">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
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
              </div>
              <div className="search-buttons">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="clear-button"
                >
                  Clear
                </button>
                <button type="submit" className="search-button">
                  Search Jobs
                </button>
              </div>
            </form>
          </div>

          <div className="jobs-results">
            <div className="results-header">
              <h3>Showing {filteredJobs.length} jobs</h3>
              <select className="sort-select">
                <option>Most Relevant</option>
                <option>Newest</option>
                <option>Highest Salary</option>
                <option>Lowest Salary</option>
              </select>
            </div>

            <div className="job-cards">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div className="job-card" key={job.id}>
                    <div className="job-card-header">
                      <h3 className="job-title">{job.title}</h3>
                      <span className="job-company">{job.company}</span>
                      <span className="job-location">{job.location}</span>
                    </div>

                    <div className="job-card-details">
                      <span className="job-type">{job.type}</span>
                      <span className="job-salary">{job.salary}</span>
                      <span className="job-posted">{job.posted}</span>
                    </div>

                    <p className="job-description">{job.description}</p>

                    <div className="job-requirements">
                      <h4>Requirements:</h4>
                      <ul>
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="job-card-actions">
                      <button className="save-job-button">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Save
                      </button>
                      <button className="apply-button">Apply Now</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-jobs-found">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
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
    </div>
  );
};

export default Jobs;
