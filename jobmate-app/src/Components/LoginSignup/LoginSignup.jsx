import React, {useState} from "react";
import { TbUser, TbMail, TbLock } from "react-icons/tb";
import { Link } from 'react-router-dom';
import './Auth.css'

const LoginSignup = () => {
  const [action,setAction] = useState("Login"); 
  
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
          <input type="password" placeholder="Password" />
      </div>
     </div> 
     {action==="Sign Up"?<div></div>:<div className="links" onClick={()=>{setAction("Forgot Password")}}>Forgot Password? <span><Link to="/forgot-password">Click Here!</Link></span> </div>}

     <div className="submit-container">
      <div className={action==="Login"?"submit gray":"submit"} onClick={()=>{setAction("Sign Up")}}>Sign Up</div>
      <div className={action==="Sign Up"?"submit gray":"submit"} onClick={()=>{setAction("Login")}}>Login</div>
     </div>
    </div>
  );
};

export default LoginSignup
