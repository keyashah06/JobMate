"use client";

import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  // State management
  const [activeTab, setActiveTab] = useState("login");
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Component mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle navigation between tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSignUpLinkClick = (e) => {
    e.preventDefault();
    handleTabChange("signup");
  };

  const handleLoginLinkClick = (e) => {
    e.preventDefault();
    handleTabChange("login");
  };

  // Handle login success
  const handleLoginFormSuccess = (email, password) => {
    if (onLoginSuccess) {
      onLoginSuccess(email, password);
    }
  };

  // Handle signup success
  const handleSignupSuccess = (name, email, password) => {
    console.log("Signup successful:", { name, email });
    // In a real app, this would register the user with an API

    // Switch to login tab after successful signup
    handleTabChange("login");
  };

  // Password reset functionality
  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setModalOpen(true);
    setResetSuccess(false);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (!resetEmail) {
      return;
    }

    setIsResetting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Password reset requested for:", resetEmail);
      setIsResetting(false);
      setResetSuccess(true);

      // Close modal after showing success message
      setTimeout(() => {
        setModalOpen(false);
        setResetEmail("");
        setResetSuccess(false);
      }, 3000);

      // Here you would typically call your password reset API
    }, 1000);
  };

  // Close modal when clicking outside
  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background blobs for visual effect */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-container">
        <h1 className="app-title">JobMate</h1>
        <p className="app-subtitle">Your perfect job match awaits</p>

        {/* Tab navigation */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => handleTabChange("login")}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => handleTabChange("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Form container with animation */}
        <div className={`form-container ${mounted ? "visible" : ""}`}>
          {activeTab === "login" ? (
            <LoginForm
              onSignUpClick={handleSignUpLinkClick}
              onForgotPasswordClick={handleForgotPasswordClick}
              onLoginSuccess={handleLoginFormSuccess}
            />
          ) : (
            <SignUpForm
              onLoginClick={handleLoginLinkClick}
              onSignupSuccess={handleSignupSuccess}
            />
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      <div
        className={`modal-overlay ${modalOpen ? "open" : ""}`}
        onClick={handleModalOverlayClick}
      >
        <div className="modal">
          <button
            className="modal-close"
            onClick={() => setModalOpen(false)}
            aria-label="Close"
          >
            &times;
          </button>

          <h3 className="modal-title">
            {resetSuccess ? "Email Sent!" : "Reset Your Password"}
          </h3>

          {resetSuccess ? (
            <div className="reset-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="success-icon"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <p>
                We've sent password reset instructions to {resetEmail}. Please
                check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <p className="form-subtitle">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
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
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    aria-label="Email address for password reset"
                  />
                </div>
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit"
                  disabled={isResetting || !resetEmail}
                >
                  {isResetting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
