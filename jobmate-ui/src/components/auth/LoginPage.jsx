"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { FiMail, FiCheck, FiLock } from "react-icons/fi";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState("");

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsResetting(true);
    setError("");

    if (!resetEmail) {
      setError("Please enter a valid email");
      setIsResetting(false);
      setError("");
      return;
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError("Please enter the old password and the new password");
      setIsResetting(false);
      setError("");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      setIsResetting(false);
      setError("");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/reset_password/", {
        email: resetEmail,
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      });

      const data = await response.json();
      if (response.ok) {
        setResetSuccess(true);
        setError("");
        setResetEmail("");
        setOldPassword(""); 
        setNewPassword("");
        setConfirmNewPassword("");
        setModalOpen(false);
      } else {
        setError(data.error || "Invalid credentials or unexpected response.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Invalid credentials. Please try again.");
    } finally {
      console.log("Password reset requested for:", resetEmail);  
      console.log("Old Password:", oldPassword);
      console.log("New Password:", newPassword);
      console.log("Confirm New Password:", confirmNewPassword);
      setIsResetting(false);
    }
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
            onClick={() => {
              setError("");
              setNewPassword("");
              setConfirmNewPassword("");
              setModalOpen(false);
            }}
            aria-label="Close"
          >
            &times;
          </button>

          <h3 className="modal-title">
            {resetSuccess ? "Password Reset Successfuly!" : "Reset Your Password"}
          </h3>

          {resetSuccess ? (
            <div className="reset-success">
              <FiCheck className="success-icon" size={48} />
              <p>
                Your password reset was successful! You can now log in with your new password.
              </p>
            </div>
          ) : (
            <div className="reset-div">
              <form onSubmit={handleResetPassword}>
                <p className="form-subtitle">
                  Enter your credentials to reset your password.
                </p>
                {error && <div className="error-message">{error}</div>}
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
                  <div className="input-icon-wrapper">
                    <span className="input-icon">
                      <FiLock />
                    </span>
                    <input
                      type="password"
                      placeholder="Old Password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      aria-label="Old password for password reset"
                    />
                  </div>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">
                      <FiLock />
                    </span>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      aria-label="New password for reset"
                    />
                  </div>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">
                      <FiLock />
                    </span>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      aria-label="Confirm new password for reset"
                    />
                  </div>
                </div>
                <div className="modal-buttons">
                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={() => {
                      setModalOpen(false);
                      setError("");
                      setNewPassword("");
                      setConfirmNewPassword("");
                    }}
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
                      "Change Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
