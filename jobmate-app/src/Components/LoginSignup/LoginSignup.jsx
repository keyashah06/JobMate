import React, {useState} from "react";
import { TbUser, TbMail, TbLock } from "react-icons/tb";
import { Link } from 'react-router-dom';
import './Auth.css'

const LoginSignup = () => {
  const [action,setAction] = useState("Login");
  const [username, setUsername]= useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword]= useState("");
  const [error, setError]= useState("");
  const [message, setMessage]= useState("");

  const handleLogin = async () => {

    setError("");
    setMessage("");

    try {
      const response = await fetch ("http://127.0.0.1:8000/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, password})
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Login successful");
        localStorage.setItem("token", data.token);

      } else {
        setError(data.error || "LOGIN FAILED");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleSignup = async () => {

    setError("");
    setMessage("");

    try {
      const response = await fetch ("http://127.0.0.1:8000/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username,email, password})
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Signup successful");

      } else {
        setError(data.error || "SIGNUP FAILED");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };


  return (
    <div className='container'>
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <TbUser size={20} />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {action === "Sign Up" && (
          <div className="input">
            <TbMail size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        <div className="input">
          <TbLock size={20} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {action === "Sign Up" ? null : (
        <div
          className="links"
          onClick={() => {
            setAction("Forgot Password")
          }}>
          Forgot Password? <span><Link to= "/forgot-password">
            Click Here!</Link></span>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="submit-container">
        {/* Sign Up button */}
        <div
          className="submit"
          onClick={() => {
            if (action === "Login") {
              setAction("Sign Up");
            } else {
              handleSignup();
            }
          }}
        >
          Sign Up
        </div>


        {/* Login button */}
        <div
          className="submit"
          onClick={() => {
            if (action === "Sign Up") {
              setAction("Login");
            } else {
              handleLogin();
            }
          }}
        >
          Login
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;