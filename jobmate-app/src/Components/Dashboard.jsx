import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/"); // Redirect to login if not authenticated
    } else {
      setLoading(false); // Stop loading once check is complete
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear authentication token
    localStorage.removeItem("email"); // Clear stored email for MFA
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="container">
      {loading ? (
        <h2>Loading...</h2> // Prevents flashing when checking authentication
      ) : (
        <>
          <h2>Welcome to JobMate!</h2>
          <p>This is a placeholder dashboard. Replace this with the actual dashboard.</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
};

export default Dashboard;
