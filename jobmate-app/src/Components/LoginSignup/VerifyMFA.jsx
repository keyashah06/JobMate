import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VerifyMFA = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // API call state
  const navigate = useNavigate();

  const email = localStorage.getItem("email"); // Retrieve stored email

  // Redirect to login if no email is stored (if session expired)
  useEffect(() => {
    if (!email) {
      setError("Session expired. Please log in again.");
    }
  }, [email]);

  const handleVerifyMFA = async () => {
    setError("");
    setMessage("");
    setLoading(true); // Disable button while verifying MFA

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/verify-mfa/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      console.log("🔹 MFA Response:", data);

      if (response.ok) {
        setMessage("✅ MFA verified. Redirecting to dashboard...");
        localStorage.setItem("token", data.token); // Store token
        setTimeout(() => navigate("/dashboard"), 2000); // Redirect after 2s delay
      } else {
        setError(data.message || "❌ MFA verification failed.");
      }
    } catch (err) {
      console.error("❌ ERROR during MFA verification:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // Re-enable button
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
    <div className="container">
      <h2>Verify MFA Code</h2>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <p>Enter the MFA code sent to your email.</p>
      )}

      {email ? (
        <>
          <input
            type="text"
            placeholder="Enter MFA Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {message && <div className="success">{message}</div>}

          <button onClick={handleVerifyMFA} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button onClick={handleResendMFA} disabled={loading}>
            {loading ? "Resending..." : "Resend Code"}
          </button>

          {/* NEW: Back to Login Button - Visible at all times */}
          <button onClick={() => navigate("/")} className="back-button">
            Back to Login
          </button>
        </>
      ) : (
        <button onClick={() => navigate("/")} className="back-button">
          Back to Login
        </button>
      )}
    </div>
  );
};

export default VerifyMFA;