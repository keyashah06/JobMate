import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import ForgotPassword from "./Components/LoginSignup/ForgotPassword";
import VerifyMFA from "./Components/LoginSignup/VerifyMFA";
import PhishingDetection from './Components/PhishingDetection';
import Jobs from './Components/jobs/Jobs';  // This is your working LinkedIn jobs UI
import Dashboard from "./Components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-mfa" element={<VerifyMFA />} />
        <Route path="/phishing-detection" element={<PhishingDetection />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;