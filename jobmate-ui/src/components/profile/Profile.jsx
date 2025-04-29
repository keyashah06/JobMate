"use client"

import { useState, useEffect } from "react";
import {
  FiBell,
  FiSettings,
  FiEdit2,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiSave,
  FiX,
  FiHeart,
} from "react-icons/fi";
import "./Profile.css";

const Profile = ({ onNavigate, userName = "User" }) => {
  // State for personal info
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    birthday: "",
  })

  // State for employment info
  const [employmentInfo, setEmploymentInfo] = useState({
    ethnicity: "",
    workAuthUS: false,
    workAuthCanada: false,
    workAuthUK: false,
    requireSponsorship: false,
    disability: false,
    lgbtq: false,
    gender: "",
    veteran: false,
  })

  // Remove the Education section and its related state/functions
  // 1. Remove the educationInfo state
  // const [educationInfo, setEducationInfo] = useState({
  //   institution: "",
  //   degree: "",
  //   fieldOfStudy: "",
  //   graduationDate: "",
  // });

  // 2. Remove the editingEducation state
  // const [editingEducation, setEditingEducation] = useState(false);

  // Edit states
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingEmployment, setEditingEmployment] = useState(false)
  // const [editingEducation, setEditingEducation] = useState(false);

  // State for skills
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState("")

  // Load user data on component mount
  useEffect(() => {
    // In a real app, you would fetch this from your backend
    // For now, we'll use mock data
    const loadUserData = () => {
      // Check if we have data in localStorage
      const storedPersonalInfo = localStorage.getItem("jobmate_personal_info")
      const storedEmploymentInfo = localStorage.getItem("jobmate_employment_info")
      // const storedEducationInfo = localStorage.getItem("jobmate_education_info")
      const storedSkills = localStorage.getItem("jobmate_skills")

      // Parse and set data if available
      if (storedPersonalInfo) {
        setPersonalInfo(JSON.parse(storedPersonalInfo))
      } else {
        // Set default data based on user info
        setPersonalInfo({
          firstName: userName.split(" ")[0] || "",
          lastName: userName.split(" ")[1] || "",
          email: localStorage.getItem("jobmate_email") || "",
          phone: "",
          location: "",
          birthday: "",
        })
      }

      if (storedEmploymentInfo) {
        setEmploymentInfo(JSON.parse(storedEmploymentInfo))
      }

      // 5. Remove the education info loading from useEffect
      // if (storedEducationInfo) {
      //   setEducationInfo(JSON.parse(storedEducationInfo));
      // }

      if (storedSkills) {
        setSkills(JSON.parse(storedSkills))
      }
    }

    loadUserData()
  }, [userName])

  // Save data to localStorage
  const savePersonalInfo = () => {
    localStorage.setItem("jobmate_personal_info", JSON.stringify(personalInfo))
    setEditingPersonal(false)
  }

  const saveEmploymentInfo = () => {
    localStorage.setItem("jobmate_employment_info", JSON.stringify(employmentInfo))
    setEditingEmployment(false)
  }

  // 3. Remove the saveEducationInfo function
  // const saveEducationInfo = () => {
  //   localStorage.setItem("jobmate_education_info", JSON.stringify(educationInfo));
  //   setEditingEducation(false);
  // };

  const saveSkills = () => {
    localStorage.setItem("jobmate_skills", JSON.stringify(skills))
  }

  // Handle input changes
  const handlePersonalChange = (e) => {
    const { name, value } = e.target
    setPersonalInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmploymentChange = (e) => {
    const { name, value, type, checked } = e.target
    setEmploymentInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // 4. Remove the handleEducationChange function
  // const handleEducationChange = (e) => {
  //   const { name, value } = e.target;
  //   setEducationInfo((prev) => ({ ...prev, [name]: value }));
  // };

  // Handle adding skills
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()]
      setSkills(updatedSkills)
      setNewSkill("")
      localStorage.setItem("jobmate_skills", JSON.stringify(updatedSkills))
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove)
    setSkills(updatedSkills)
    localStorage.setItem("jobmate_skills", JSON.stringify(updatedSkills))
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (personalInfo.firstName && personalInfo.lastName) {
      return `${personalInfo.firstName[0]}${personalInfo.lastName[0]}`
    } else if (userName) {
      return userName
        .split(" ")
        .map((n) => n[0])
        .join("")
    }
    return "U"
  }

  return (
    <div className="profile-page">
      <header className="dashboard-header">
        <div className="logo-section">
          <h1 className="app-logo">JobMate</h1>
          <nav className="main-nav">
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                onNavigate("dashboard")
              }}
            >
              Dashboard
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                onNavigate("jobs")
              }}
            >
              Jobs
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                onNavigate("saved-jobs")
              }}
            >
              Saved Jobs
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                onNavigate("applications")
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
          <div className="user-avatar active">
            <div className="initials">{getUserInitials()}</div>
          </div>
        </div>
      </header>

      <main className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="profile-avatar-inner">{getUserInitials()}</div>
          </div>
          <div className="profile-title">
            <h1>
              {personalInfo.firstName
                ? `${personalInfo.firstName} ${personalInfo.lastName}`
                : userName || "Your Profile"}
            </h1>
            <p className="profile-subtitle">Manage your personal information and preferences</p>
          </div>
        </div>

        <div className="profile-sections">
          {/* Personal Information Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              <button className="edit-button" onClick={() => setEditingPersonal(!editingPersonal)}>
                {editingPersonal ? <FiX /> : <FiEdit2 />}
              </button>
            </div>

            {editingPersonal ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <div className="input-icon-wrapper">
                      <FiUser className="input-icon" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={personalInfo.firstName}
                        onChange={handlePersonalChange}
                        placeholder="First Name"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <div className="input-icon-wrapper">
                      <FiUser className="input-icon" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={personalInfo.lastName}
                        onChange={handlePersonalChange}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-icon-wrapper">
                      <FiMail className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={personalInfo.email}
                        onChange={handlePersonalChange}
                        placeholder="Email Address"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-icon-wrapper">
                      <FiPhone className="input-icon" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handlePersonalChange}
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <div className="input-icon-wrapper">
                      <FiMapPin className="input-icon" />
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={personalInfo.location}
                        onChange={handlePersonalChange}
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="birthday">Birthday</label>
                    <div className="input-icon-wrapper">
                      <FiCalendar className="input-icon" />
                      <input
                        type="date"
                        id="birthday"
                        name="birthday"
                        value={personalInfo.birthday}
                        onChange={handlePersonalChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="cancel-button" onClick={() => setEditingPersonal(false)}>
                    Cancel
                  </button>
                  <button className="save-button" onClick={savePersonalInfo}>
                    <FiSave /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">First Name</span>
                    <span className="info-value">{personalInfo.firstName || "Not specified"}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Last Name</span>
                    <span className="info-value">{personalInfo.lastName || "Not specified"}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{personalInfo.email || "Not specified"}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{personalInfo.phone || "Not specified"}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Location</span>
                    <span className="info-value">{personalInfo.location || "Not specified"}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Birthday</span>
                    <span className="info-value">{personalInfo.birthday || "Not specified"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Employment Information Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Employment Information</h2>
              <button className="edit-button" onClick={() => setEditingEmployment(!editingEmployment)}>
                {editingEmployment ? <FiX /> : <FiEdit2 />}
              </button>
            </div>

            {editingEmployment ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ethnicity">What is your ethnicity?</label>
                    <select
                      id="ethnicity"
                      name="ethnicity"
                      value={employmentInfo.ethnicity}
                      onChange={handleEmploymentChange}
                    >
                      <option value="">Select ethnicity</option>
                      <option value="Asian">Asian</option>
                      <option value="Black or African American">Black or African American</option>
                      <option value="Hispanic or Latino">Hispanic or Latino</option>
                      <option value="Native American">Native American</option>
                      <option value="Pacific Islander">Pacific Islander</option>
                      <option value="White">White</option>
                      <option value="Two or More Races">Two or More Races</option>
                      <option value="Other">Other</option>
                      <option value="Decline to state">Decline to state</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Are you authorized to work in the US?</label>
                    <div className="radio-group">
                      <label className={`radio-label ${employmentInfo.workAuthUS ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="workAuthUS"
                          checked={employmentInfo.workAuthUS === true}
                          onChange={() => setEmploymentInfo((prev) => ({ ...prev, workAuthUS: true }))}
                        />
                        <span></span>
                        Yes
                      </label>
                      <label className={`radio-label ${!employmentInfo.workAuthUS ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="workAuthUS"
                          checked={employmentInfo.workAuthUS === false}
                          onChange={() => setEmploymentInfo((prev) => ({ ...prev, workAuthUS: false }))}
                        />
                        <span></span>
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Are you authorized to work in Canada?</label>
                    <div className="radio-group">
                      <label className={`radio-label ${employmentInfo.workAuthCanada ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="workAuthCanada"
                          checked={employmentInfo.workAuthCanada === true}
                          onChange={() => setEmploymentInfo((prev) => ({ ...prev, workAuthCanada: true }))}
                        />
                        <span></span>
                        Yes
                      </label>
                      <label className={`radio-label ${!employmentInfo.workAuthCanada ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="workAuthCanada"
                          checked={employmentInfo.workAuthCanada === false}
                          onChange={() => setEmploymentInfo((prev) => ({ ...prev, workAuthCanada: false }))}
                        />
                        <span></span>
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Are you authorized to work in the United Kingdom?</label>
                    <div className="radio-group">
                      <label className={`radio-label ${employmentInfo.workAuthUK ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="workAuthUK"
                          checked={employmentInfo.workAuthUK === true}
                          onChange={() => setEmploymentInfo((prev) => ({ ...prev, workAuthUK: true }))}
                        />
                        <span></span>
                        Yes
                      </label>
                      <label className={`radio-label ${!employmentInfo.workAuthUK ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="workAuthUK"
                          checked={employmentInfo.workAuthUK === false}
                          onChange={() => setEmploymentInfo((prev) => ({ ...prev, workAuthUK: false }))}
                        />
                        <span></span>
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Will you now or in the future require sponsorship for employment visa status?</label>
                    <div className="radio-group">
                      <label className={`radio-label ${employmentInfo.requireSponsorship ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="requireSponsorship"
                          checked={employmentInfo.requireSponsorship === true}
                          onChange={() => setEmploymentInfo((prev) => ({ ...prev, requireSponsorship: true }))}
                        />
                        <span></span>
                        Yes
                      </label>
                      <label className={`radio-label ${!employmentInfo.requireSponsorship ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="requireSponsorship"
                          checked={employmentInfo.requireSponsorship === false}
                          onChange={() => setEmploymentInfo((prev) => ({ ...prev, requireSponsorship: false }))}
                        />
                        <span></span>
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>What is your gender?</label>
                    <div className="radio-group">
                      <label className={`radio-label ${employmentInfo.gender === "Male" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={employmentInfo.gender === "Male"}
                          onChange={handleEmploymentChange}
                        />
                        <span></span>
                        Male
                      </label>
                      <label className={`radio-label ${employmentInfo.gender === "Female" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={employmentInfo.gender === "Female"}
                          onChange={handleEmploymentChange}
                        />
                        <span></span>
                        Female
                      </label>
                      <label className={`radio-label ${employmentInfo.gender === "Non-Binary" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Non-Binary"
                          checked={employmentInfo.gender === "Non-Binary"}
                          onChange={handleEmploymentChange}
                        />
                        <span></span>
                        Non-Binary
                      </label>
                      <label className={`radio-label ${employmentInfo.gender === "Decline to state" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Decline to state"
                          checked={employmentInfo.gender === "Decline to state"}
                          onChange={handleEmploymentChange}
                        />
                        <span></span>
                        Decline to state
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="disability"
                        checked={employmentInfo.disability}
                        onChange={handleEmploymentChange}
                      />
                      <span></span>
                      Do you have a disability?
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="lgbtq"
                        checked={employmentInfo.lgbtq}
                        onChange={handleEmploymentChange}
                      />
                      <span></span>
                      Do you identify as LGBTQ+?
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="veteran"
                        checked={employmentInfo.veteran}
                        onChange={handleEmploymentChange}
                      />
                      <span></span>
                      Are you a veteran?
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="cancel-button" onClick={() => setEditingEmployment(false)}>
                    Cancel
                  </button>
                  <button className="save-button" onClick={saveEmploymentInfo}>
                    <FiSave /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Ethnicity</span>
                    <span className="info-value">{employmentInfo.ethnicity || "Not specified"}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{employmentInfo.gender || "Not specified"}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Authorized to work in the US</span>
                    <span className="info-value">{employmentInfo.workAuthUS ? "Yes" : "No"}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Authorized to work in Canada</span>
                    <span className="info-value">{employmentInfo.workAuthCanada ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Authorized to work in the UK</span>
                    <span className="info-value">{employmentInfo.workAuthUK ? "Yes" : "No"}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Requires sponsorship</span>
                    <span className="info-value">{employmentInfo.requireSponsorship ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Has a disability</span>
                    <span className="info-value">{employmentInfo.disability ? "Yes" : "No"}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Identifies as LGBTQ+</span>
                    <span className="info-value">{employmentInfo.lgbtq ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Veteran status</span>
                    <span className="info-value">{employmentInfo.veteran ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. Remove the entire Education Section JSX block */}
          {/* Education Section */}
          {/* <div className="profile-section">
            <div className="section-header">
              <h2>Education</h2>
              <button
                className="edit-button"
                onClick={() => setEditingEducation(!editingEducation)}
              >
                {editingEducation ? <FiX /> : <FiEdit2 />}
              </button>
            </div>

            {editingEducation ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="institution">Educational Institution</label>
                    <div className="input-icon-wrapper">
                      <FiUsers className="input-icon" />
                      <input
                        type="text"
                        id="institution"
                        name="institution"
                        value={educationInfo.institution}
                        onChange={handleEducationChange}
                        placeholder="University or College Name"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="degree">Degree</label>
                    <div className="input-icon-wrapper">
                      <FiBriefcase className="input-icon" />
                      <input
                        type="text"
                        id="degree"
                        name="degree"
                        value={educationInfo.degree}
                        onChange={handleEducationChange}
                        placeholder="Bachelor's, Master's, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fieldOfStudy">Field of Study</label>
                    <div className="input-icon-wrapper">
                      <FiGlobe className="input-icon" />
                      <input
                        type="text"
                        id="fieldOfStudy"
                        name="fieldOfStudy"
                        value={educationInfo.fieldOfStudy}
                        onChange={handleEducationChange}
                        placeholder="Computer Science, Business, etc."
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="graduationDate">Graduation Date</label>
                    <div className="input-icon-wrapper">
                      <FiCalendar className="input-icon" />
                      <input
                        type="date"
                        id="graduationDate"
                        name="graduationDate"
                        value={educationInfo.graduationDate}
                        onChange={handleEducationChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="cancel-button"
                    onClick={() => setEditingEducation(false)}
                  >
                    Cancel
                  </button>
                  <button className="save-button" onClick={saveEducationInfo}>
                    <FiSave /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Educational Institution</span>
                    <span className="info-value">
                      {educationInfo.institution || "Not specified"}
                    </span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Degree</span>
                    <span className="info-value">
                      {educationInfo.degree || "Not specified"}
                    </span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Field of Study</span>
                    <span className="info-value">
                      {educationInfo.fieldOfStudy || "Not specified"}
                    </span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Graduation Date</span>
                    <span className="info-value">
                      {educationInfo.graduationDate || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div> */}

          {/* Skills Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Skills</h2>
            </div>

            <div className="skills-container">
              <div className="skills-input">
                <div className="input-icon-wrapper">
                  <FiHeart className="input-icon" />
                  <input
                    type="text"
                    placeholder="Add a skill (e.g., JavaScript, Project Management)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                  />
                </div>
                <button className="add-skill-button" onClick={handleAddSkill}>
                  Add
                </button>
              </div>

              <div className="skills-list">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <div className="skill-tag" key={index}>
                      {skill}
                      <button className="remove-skill-button" onClick={() => handleRemoveSkill(skill)}>
                        <FiX />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-skills-message">No skills added yet. Add skills to showcase your expertise.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
