//import logo from './logo.svg';

import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import ForgotPassword from "./Components/LoginSignup/ForgotPassword";


function App() {
  return (
  <>
  <Router>
      <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
  </Router>
  </>
  );
}

export default App;
