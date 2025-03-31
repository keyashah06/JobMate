import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to login
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="container p-6 max-w-xl mx-auto text-center">
      {loading ? (
        <h2>Loading...</h2>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">👋 Welcome to JobMate!</h2>
          <p className="mb-6">This is your dashboard. Explore tools below:</p>

          <div className="space-y-4">
            <Link
              to="/phishing-detection"
              className="block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Manually Check a Job for Scams
            </Link>

            <Link
              to="/live-jobs"
              className="block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
            >
              🔍 Scan Live Job Postings
            </Link>

            <button
              onClick={handleLogout}
              className="block bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;