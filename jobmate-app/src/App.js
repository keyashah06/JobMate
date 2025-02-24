//import logo from './logo.svg';

import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import ForgotPassword from "./Components/LoginSignup/ForgotPassword";
import UploadResume from "./Components/UploadResume/UploadResume";

function App() {
  return (
  <>
  <Router>
      <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/UploadResume" element={<UploadResume />} /> {/* New Route */}
      </Routes>
  </Router>
  </>
  );
}

export default App;
