import React, { useState } from "react";
import { TbUser, TbMail, TbLock } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const LoginSignup = () => {
  const [action, setAction] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Email & Password Validation
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
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log("🔹 Login Response:", data); // LOG RESPONSE IN CONSOLE
  
      if (response.ok && data.mfa_required) {
        setMessage("Login successful. MFA code sent.");
        localStorage.setItem("email", email); // Store email for MFA verification
        navigate("/verify-mfa"); // Go to MFA verification page first!
      } else {
        setError(data.message || "LOGIN FAILED");
      }
    } catch (err) {
      console.error("ERROR during login:", err);
      setError("Something went wrong. Check console for details.");
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
      setError("Password does not meet requirements.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Signup successful. MFA code sent.");
        localStorage.setItem("email", email);
        navigate("/verify-mfa"); // Redirect to MFA verification
      } else {
        setError(data.message || "SIGNUP FAILED");
      }
    } catch (err) {
      console.error("ERROR during signup:", err);
      setError("Something went wrong. Check console for details.");
    }
  };

  return (
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
        {action === "Sign Up" && email && !validateEmail(email) && (
          <div className="error">Invalid email format</div>
        )}

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
        {action === "Sign Up" && password && !validatePassword(password) && (
          <div className="error">
            Password must be 8+ chars, include 1 uppercase, 1 number, & 1
            special character
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="submit-container">
        <div
          className="submit"
          onClick={() => (action === "Login" ? setAction("Sign Up") : handleSignup())}
        >
          Sign Up
        </div>

        <div
          className="submit"
          onClick={() => (action === "Sign Up" ? setAction("Login") : handleLogin())}
        >
          Login
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;