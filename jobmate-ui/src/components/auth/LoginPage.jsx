"use client";

import { useState, useEffect } from "react";
import { FiMail, FiCheck } from "react-icons/fi";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleLoginFormSuccess = (email, password) => {
    if (onLoginSuccess) {
      onLoginSuccess(email, password);
    }
  };

  const handleSignupSuccess = (name, email, password) => {
    console.log("Signup successful:", { name, email });
    handleTabChange("login");
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setModalOpen(true);
    setResetSuccess(false);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (!resetEmail) return;

    setIsResetting(true);
    setTimeout(() => {
      console.log("Password reset requested for:", resetEmail);
      setIsResetting(false);
      setResetSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setResetEmail("");
        setResetSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
    }
  };

  return (
    <div className="login-page">
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-container">
        <h1 className="app-title">JobMate</h1>
        <p className="app-subtitle">Your perfect job match awaits</p>

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
              <FiCheck className="success-icon" size={48} />
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
                    <FiMail />
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


