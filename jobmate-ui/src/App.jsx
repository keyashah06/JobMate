"use client"

import { useState } from "react"
import LoginPage from "./components/auth/LoginPage"
import Dashboard from "./components/dashboard/Dashboard"
import Jobs from "./components/jobs/Jobs"
import SavedJobs from "./components/jobs/SavedJobs"
import UploadResume from "./components/resume/UploadResume"
import Profile from "./components/profile/Profile"
import "./App.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "User Name",
  })

  const handleLoginSuccess = (email, password) => {
    setIsLoggedIn(true)
    setUserInfo({
      email: email,
      name: email.split("@")[0].replace(/[.]/g, " "),
    })
    localStorage.setItem("jobmate_email", email)
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const renderPage = () => {
    if (!isLoggedIn) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />
    }

    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} userName={userInfo.name} />
      case "jobs":
        return <Jobs onNavigate={handleNavigate} userName={userInfo.name} />
      case "saved-jobs":
        return <SavedJobs onNavigate={handleNavigate} userName={userInfo.name} />
      case "upload-resume":
        return <UploadResume onNavigate={handleNavigate} userName={userInfo.name} />
      case "profile":
        return <Profile onNavigate={handleNavigate} userName={userInfo.name} />
      default:
        return <Dashboard onNavigate={handleNavigate} userName={userInfo.name} />
    }
  }

  return <div className="app">{renderPage()}</div>
}

export default App