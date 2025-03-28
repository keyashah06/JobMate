import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import ForgotPassword from "./Components/LoginSignup/ForgotPassword";
import VerifyMFA from "./Components/LoginSignup/VerifyMFA";  // Import VerifyMFA component
import Dashboard from "./Components/Dashboard";  // Import the placeholder Dashboard component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-mfa" element={<VerifyMFA />} />  {/* MFA Verification Page */}
        <Route path="/dashboard" element={<Dashboard />} />  {/* Temporary Dashboard */}
      </Routes>
    </Router>
  );
}

export default App;
