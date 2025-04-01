import { useState } from "react";
import LoginPage from "./components/auth/LoginPage";
import Dashboard from "./components/dashboard/Dashboard";
import Jobs from "./components/jobs/Jobs";
import Applications from "./components/applications/Applications";
import "./App.css";

function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("John Doe");

  // Navigation state
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Handle login
  const handleLogin = (email, password) => {
    console.log("Login attempt with:", { email, password });
    // In a real app, this would validate credentials with an API
    setIsLoggedIn(true);
  };

  // Handle page navigation
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // For demo purposes, add logout functionality
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Render the current page based on auth state and navigation
  const renderPage = () => {
    if (!isLoggedIn) {
      return <LoginPage onLoginSuccess={handleLogin} />;
    }

    switch (currentPage) {
      case "dashboard":
        return <Dashboard userName={userName} onNavigate={handleNavigation} />;
      case "jobs":
        return <Jobs onNavigate={handleNavigation} />;
      case "applications":
        return <Applications onNavigate={handleNavigation} />;
      default:
        return <Dashboard userName={userName} onNavigate={handleNavigation} />;
    }
  };

  return <div className="App">{renderPage()}</div>;
}

export default App;
