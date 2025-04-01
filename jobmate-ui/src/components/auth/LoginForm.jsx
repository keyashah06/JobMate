"use client";

import { useState } from "react";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      console.log("Login attempt with:", { email, password });

      // For demo purposes, let's consider any login successful
      if (onLoginSuccess) {
        onLoginSuccess(email, password);
      }

      setIsLoading(false);
      // Here you would typically call your auth API
    }, 1000);
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0110 0v4"></path>
              </svg>
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
              <span className="loading-spinner"></span>
              Logging in...
            </>
          ) : (
            <>
              Sign In
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
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
