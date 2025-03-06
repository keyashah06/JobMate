import React, {useState} from "react";
import { TbMail, TbLock } from "react-icons/tb";
import './Auth.css'
import { Link , useNavigate} from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [action,setAction] = useState("Forgot Password"); 
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      alert("HI!");
      const response = await axios.post("http://localhost:8000/auth/reset_password/", {
        email,
        old_password : oldPassword,
        new_password : newPassword,
        confirm_password : confirmPassword
      });
      setMessage(response.data.message);
      alert("Password reset successfully!");
      navigate("/");
    } catch (error) {
    
      console.log(error);
      setMessage(error.response?.data?.error || "An error occurred");
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
          <TbMail size={20} />  
          <input type="email" placeholder="Email Id" value = {email} onChange = {(e) => setEmail(e.target.value)} />
        </div>
        <div className="input">
          <TbLock size={20} />  
          <input type="password" placeholder="Old Password" value = {oldPassword} onChange = {(e) => setOldPassword(e.target.value)} />
        </div>
        <div className="input">
          <TbLock size={20} />  
          <input type="password" placeholder="New Password" value = {newPassword} onChange = {(e) => setNewPassword(e.target.value)} />
        </div>
        <div className="input">
          <TbLock size={20} />  
          <input type="password" placeholder="Confirm New Password" value = {confirmPassword} onChange = {(e) => setConfirmPassword(e.target.value)}/>
        </div>
     </div> 

     {action==="Login"?<div></div>:<div className="links" >Remember Password?  <span onClick={()=>{setAction("Login")}}><Link to="/">Click Here!</Link></span></div>}
     <div className="submit-container">

      <div className={action==="Forgot Password"?"submit gray":"submit" } onClick = {handleResetPassword}>Reset Password</div>
     </div>
    </div>
  );
};

export default ForgotPassword
