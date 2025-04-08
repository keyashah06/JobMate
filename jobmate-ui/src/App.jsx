import { useState, useEffect } from "react";
import LoginPage from "./components/auth/LoginPage";
import Dashboard from "./components/dashboard/Dashboard";
import Jobs from "./components/jobs/Jobs";
import SavedJobs from "./components/jobs/SavedJobs";
import Applications from "./components/applications/Applications";
import "./App.css";

function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [token, setToken] = useState(null);

  // Navigation state
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Check if user is already logged in
  useEffect(() => {
    const storedToken = localStorage.getItem("jobmate_token");
    const storedUserName = localStorage.getItem("jobmate_username");

    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
      if (storedUserName) {
        setUserName(storedUserName);
      }
    }
  }, []);

  // Handle login
  const handleLogin = async (username, password) => {
    try {
      console.log("Logging in with:", { username, password });

      // In a real app, this would make an API call to authenticate
      const response = await fetch("http://127.0.0.1:8000/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      const authToken = data.token;

      localStorage.setItem("jobmate_token", authToken);
      localStorage.setItem("jobmate_username", username);

      setToken(authToken);
      setUserName(username);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  // Handle page navigation
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("jobmate_token");
    localStorage.removeItem("jobmate_username");
    setIsLoggedIn(false);
    setToken(null);
  };

  // Render the current page based on auth state and navigation
  const renderPage = () => {
    if (!isLoggedIn) {
      return <LoginPage onLoginSuccess={handleLogin} />;
    }

    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            userName={userName}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
          />
        );
      case "jobs":
        return <Jobs onNavigate={handleNavigation} userName={userName} />;
      case "saved-jobs":
        return <SavedJobs onNavigate={handleNavigation} userName={userName} />;
      case "applications":
        return (
          <Applications onNavigate={handleNavigation} userName={userName} />
        );
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

  return <div className="App">{renderPage()}</div>;
}

export default App;
