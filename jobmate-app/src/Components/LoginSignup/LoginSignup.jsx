import React, { useState } from "react";
import { TbUser, TbMail, TbLock } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
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
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Login successful");
        localStorage.setItem("token", data.token);
      } else {
        setError(data.error || "LOGIN FAILED");
      }
    } catch (err) {
      setError("Something went wrong");
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
        setMessage("Signup successful");
      } else {
        setError(data.error || "SIGNUP FAILED");
      }
    } catch (err) {
      setError("Something went wrong");
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
          <div className="error">⚠ Invalid email format</div>
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
            ⚠ Password must be 8+ chars, include 1 uppercase, 1 number, & 1
            special character
          </div>
        )}
      </div>

      {action === "Sign Up" && (
        <div className="signup-requirements">
          <h3>Signup Requirements</h3>
          <ul>
            <li style={{ color: password.length >= 8 ? "green" : "red" }}>
              At least 8 characters
            </li>
            <li style={{ color: /[A-Z]/.test(password) ? "green" : "red" }}>
              1 uppercase letter
            </li>
            <li style={{ color: /\d/.test(password) ? "green" : "red" }}>
              1 number
            </li>
            <li style={{ color: /[@$!%*?&]/.test(password) ? "green" : "red" }}>
              1 special character (@, $, !, %, *, ?, &)
            </li>
          </ul>
        </div>
      )}

      {action === "Login" && (
        <div className="links">
          Forgot Password?{" "}
          <span onClick={() => navigate("/forgot-password")}>Click Here!</span>
        </div>
      )}

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
