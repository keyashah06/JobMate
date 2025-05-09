"use client";
import { useState } from "react";
import axios from "axios";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import "./LoginForm.css";

const LoginForm = ({
  onSignUpClick,
  onForgotPasswordClick = () => {},
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/login/", {
        username: email, // Make sure we're using email as username
        password: password,
      });

      if (response.data && response.data.token) {
        // Store token in localStorage for future authenticated requests
        localStorage.setItem("jobmate_token", response.data.token);

        if (onLoginSuccess) {
          onLoginSuccess(email, password);
        }
      } else {
        setError("Invalid credentials or unexpected response.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-wrapper">
      <h2 className="form-title">Welcome back</h2>
      <p className="form-subtitle">
        Enter your credentials to access your account
      </p>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="input-icon-wrapper">
            <span className="input-icon">
              <FiMail />
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-icon-wrapper">
            <span className="input-icon">
              <FiLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <div className="forgot-password-wrapper">
          <a
            href="#"
            className="forgot-password"
            onClick={(e) => {
              e.preventDefault();
              onForgotPasswordClick(e);
            }}
          >
            Forgot password?
          </a>
        </div>
        <button type="submit" className="sign-in-button" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="loading-spinner"></span> Logging in...
            </>
          ) : (
            <>
              Sign In
              <FiArrowRight className="ml-2" style={{ marginLeft: "8px" }} />
            </>
          )}
        </button>
      </form>
      <p className="signup-prompt">
        Don't have an account?{" "}
        <a href="#" onClick={onSignUpClick} className="signup-link">
          Sign up
        </a>
      </p>
    </div>
  );
};

export default LoginForm;


