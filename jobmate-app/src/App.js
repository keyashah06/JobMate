import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import ForgotPassword from "./Components/LoginSignup/ForgotPassword";
import VerifyMFA from "./Components/LoginSignup/VerifyMFA";  // Import VerifyMFA component
import PhishingDetection from './Components/PhishingDetection';
import LiveJobScan from './Components/LiveJobScan';
import SerpJobScan from './Components/SerpJobScan';  // Import SerpJobScan component
import IndeedJobScan from './Components/IndeedJobScan';  // Import IndeedJobScan component
import PhishingScanner from './Components/PhishingScanner';  // Import PhishingScanner component
import Dashboard from "./Components/Dashboard";  // Import the placeholder Dashboard component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-mfa" element={<VerifyMFA />} />  {/* MFA Verification Page */}
        <Route path="/phishing-detection" element={<PhishingDetection />} />  {/* Phishing Detection Page */}
        <Route path="/live-job-scan" element={<LiveJobScan />} />
        <Route path="/serp-job-scan" element={<SerpJobScan />} />  {/* Google Jobs Scan Page */}
        <Route path="/indeed-job-scan" element={<IndeedJobScan />} />  {/* Indeed Jobs Scan Page */}
        <Route path="/dashboard" element={<Dashboard />} />  {/* Temporary Dashboard */}
        <Route path="/phishing-scanner" element={<PhishingScanner />} />

      </Routes>
    </Router>
  );
}

export default App;
