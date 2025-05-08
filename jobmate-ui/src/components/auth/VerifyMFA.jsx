import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiRotateCcw } from "react-icons/fi";
import "./VerifyMFA.css";

const VerifyMFA = ({ onMFASuccess, onCancelMFA }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("email");

  useEffect(() => {
    if (!email) {
      setError("Session expired. Please log in again.");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [email, navigate]);

  const handleVerifyMFA = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/verify-mfa/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("jobmate_username", data.username); // ✅ store full name here!
        console.log("Saved jobmate_username:", data.username);
        setMessage("✅ MFA verified. Redirecting to dashboard...");
        onMFASuccess(data.token, data.username); // Pass token and username to parent
      } else {
        setError(data.message || "❌ MFA verification failed.");
      }
    } catch (err) {
      console.error("❌ ERROR during MFA verification:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendMFA = async () => {
    setError("");
    setMessage("📧 Resending MFA code...");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/send-mfa/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("🔹 Resend MFA Response:", data);

      if (response.ok) {
        setMessage("📩 MFA code resent. Check your email.");
      } else {
        setError(data.message || "❌ Failed to resend MFA code.");
      }
    } catch (err) {
      console.error("❌ ERROR during MFA resend:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <h1 className="app-title">Verify MFA</h1>
        <p className="app-subtitle">Enter the code sent to <strong>{email}</strong></p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="form-group">
          <div className="input-icon-wrapper">
            <span className="input-icon">
              <FiLock />
            </span>
            <input
              type="text"
              placeholder="Enter MFA Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="button-group">
          <button
            className="primary-button"
            onClick={handleVerifyMFA}
            disabled={loading || !code.trim()}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            className="link-button"
            onClick={handleResendMFA}
            disabled={loading}
          >
            <FiRotateCcw /> Resend Code
          </button>

          <button className="link-button" onClick={onCancelMFA}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyMFA;