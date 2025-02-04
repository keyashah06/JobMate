import React, {useState} from "react";
import { TbUser, TbMail, TbLock } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './LoginSignup.css'
//import "./styles.css"; 

const LoginSignup = () => {
  const [action,setAction] = useState("Login");
  const [showPassword, setShowPassword] = useState(false); 
  const [password, setPassword] = useState("");
  
  return (
    <div className='container'>
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        {action==="Login"?<div></div>:<div className="input">
        <TbUser size={20} />  
          <input type="text" placeholder="Username" />
        </div>}
        <div className="input">
          <TbMail size={20} />  
          <input type="email" placeholder="Email Id" />
        </div>
        <div className="input">
          <TbLock size={20} />  
          <input 
            type={showPassword ? "password" : "text"} 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", marginLeft: "10px" }}>
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </span>
      </div>
     </div> 
     {action==="Sign Up"?<div></div>:<div className="forgot-password">Forgot Password? <span>Click Here!</span></div>}
     <div className="submit-container">
      <div className={action==="Login"?"submit gray":"submit"} onClick={()=>{setAction("Sign Up")}}>Sign Up</div>
      <div className={action==="Sign Up"?"submit gray":"submit"} onClick={()=>{setAction("Login")}}>Login</div>
     </div>
    </div>
  );
};

export default LoginSignup
