import React, {useState} from "react";
import { TbMail, TbLock } from "react-icons/tb";
import './Auth.css'
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [action,setAction] = useState("Forgot Password"); 
  
  return (
    <div className='container'>
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <TbMail size={20} />  
          <input type="email" placeholder="Email Id" />
        </div>
        <div className="input">
          <TbLock size={20} />  
          <input type="password" placeholder="Old Password" />
        </div>
        <div className="input">
          <TbLock size={20} />  
          <input type="password" placeholder="New Password" />
        </div>
        <div className="input">
          <TbLock size={20} />  
          <input type="password" placeholder="Confirm New Password" />
        </div>
     </div> 
     {action==="Login"?<div></div>:<div className="links" >Remember Password?  <span onClick={()=>{setAction("Login")}}><Link to="/">Click Here!</Link></span></div>}
     <div className="submit-container">
      <div className={action==="Forgot Password"?"submit gray":"submit"}> Reset Password </div>
     </div>
    </div>
  );
};

export default ForgotPassword
