import { useState, useEffect } from "react";
// import LoginSignup from "./components/auth/LoginSignup";
import LoginPage from "./components/auth/LoginPage";
import VerifyMFA from "./components/auth/VerifyMFA";
import Dashboard from "./components/dashboard/Dashboard";
import Jobs from "./components/jobs/Jobs";
import SavedJobs from "./components/jobs/SavedJobs";
import Applications from "./components/applications/Applications";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mfaPending, setMfaPending] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    const storedToken = localStorage.getItem("jobmate_token");
    const storedUserName = localStorage.getItem("jobmate_username");
    console.log("Loaded from localStorage:", storedToken, storedUserName);
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      setUserName("User");
    }

    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
      if (storedUserName) setUserName(storedUserName);
    }
  }, []);

  // ✅ This gets triggered *after MFA is successful*
  const handleMFASuccess = (tokenFromMFA, usernameFromMFA) => {
    localStorage.setItem("jobmate_token", tokenFromMFA);
    if (usernameFromMFA) {
        localStorage.setItem("jobmate_username", usernameFromMFA);
        setUserName(usernameFromMFA);
    } else {
        const fallback = localStorage.getItem("jobmate_username") || "User";
        setUserName(fallback);
    }
    setToken(tokenFromMFA);
    setIsLoggedIn(true);
    setMfaPending(false);
  };

  // This gets triggered after login but *before* MFA
  const handleLoginTriggerMFA = (email) => {
    setMfaPending(true);
    localStorage.setItem("email", email); // store for VerifyMFA
  };

  const handleLogout = () => {
    localStorage.removeItem("jobmate_token");
    localStorage.removeItem("jobmate_username");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setToken(null);
    setMfaPending(false);
    setCurrentPage("dashboard");
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (mfaPending) return <VerifyMFA onMFASuccess={handleMFASuccess} />;
    if (!isLoggedIn) return <LoginPage onLoginSuccess={handleLoginTriggerMFA} />;

    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard userName={userName} onNavigate={handleNavigation} onLogout={handleLogout} />
        );
      case "jobs":
        return <Jobs onNavigate={handleNavigation} userName={userName} />;
      case "saved-jobs":
        return <SavedJobs onNavigate={handleNavigation} userName={userName} />;
      case "applications":
        return <Applications onNavigate={handleNavigation} userName={userName} />;
      case "upload-resume":
        return (
          <Dashboard
            userName={userName}
            onNavigate={handleNavigation}
            initialView="upload-resume"
          />
        );
      default:
        return <Dashboard userName={userName} onNavigate={handleNavigation} />;
    }
  };

  // Debugging: Log the current page and userName
  useEffect(() => {
    console.log("Current Page:", currentPage);
    console.log("User Name:", userName);
  }, [currentPage, userName]);

  return <div className="App">{renderPage()}</div>;
}

export default App;
