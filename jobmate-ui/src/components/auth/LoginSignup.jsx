import React, { useState, useEffect } from "react";
import { TbUser, TbMail, TbLock } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import './LoginSignup.css';

const LoginSignup = () => {
  const [action, setAction] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [debug, setDebug] = useState(null); // Debug state
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    console.log("🔒 Cleared localStorage on page load");
  }, []);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleLogin = async () => {
    setError("");
    setMessage("");
  
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password }),
      });
  
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("❌ Failed to parse login response:", jsonError);
        setError("Could not parse response from server.");
        setDebug({ error: "Failed to parse JSON", raw: await response.text() });
        return;
      }
  
      setDebug(data); // helpful for now
  
      if (response.ok && data.mfa_required) {
        setMessage("Login successful. MFA code sent.");
        // trigger App.jsx to move to MFA screen
        if (typeof onLoginSuccess === "function") {
          onLoginSuccess(email); // Pass email to App.jsx to trigger MFA
        }
      } else {
        console.log("❌ Login Failed Data:", data);
        setError(data.message || "LOGIN FAILED");
      }
    } catch (err) {
      console.error("❌ ERROR during login:", err);
      setDebug({ error: err.message });
      setError("Network or server error.");
    }
  };  

  const handleSignup = async () => {
    setError("");
    setMessage("");

    if (!validateEmail(email)) {
      setError("Invalid email format.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be 8+ chars, include 1 uppercase, 1 number, and 1 special character.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      setDebug(data); // Helpful for debugging signup too

      if (response.ok) {
        setMessage("Signup successful. MFA code sent.");
        localStorage.setItem("email", email);
        navigate("/verify-mfa");
      } else {
        setError(data.message || "SIGNUP FAILED");
      }
    } catch (err) {
      console.error("❌ ERROR during signup:", err);
      setDebug({ error: err.message });
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      {debug && (
        <div style={{ margin: "20px", padding: "10px", background: "#fefefe", color: "#333", border: "1px solid #ccc" }}>
          <strong>🛠 DEBUG:</strong>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </div>
      )}

      <div style={{ color: 'red', fontWeight: 'bold' }}>
        🚨 You are using the latest LoginSignup.jsx
      </div>


      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>

        <div className="inputs">
          {action === "Sign Up" && (
            <div className="input">
              <TbUser size={20} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="input">
            <TbMail size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input password-container">
            <TbLock size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPassword ? (
              <FaEyeSlash
                size={20}
                onClick={() => setShowPassword(false)}
                className="eye-icon"
              />
            ) : (
              <FaEye
                size={20}
                onClick={() => setShowPassword(true)}
                className="eye-icon"
              />
            )}
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <div className="submit-container">
          <div
            className="submit"
            onClick={() => setAction(action === "Login" ? "Sign Up" : "Login")}
          >
            Switch to {action === "Login" ? "Sign Up" : "Login"}
          </div>

          <div
            className="submit"
            onClick={() => (action === "Login" ? handleLogin() : handleSignup())}
          >
            {action === "Login" ? "Login" : "Sign Up Now"}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginSignup;