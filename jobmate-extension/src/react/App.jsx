import {useState} from 'react';

//import './App.css';
//import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
//<Link to={{ pathname: "" }} target="_blank"></Link> <Link to={{ pathname: "http://localhost:3000/" }} target="_blank"></Link>
const App = () => {

  const [loading, setLoading] = useState(false);
  const [matchScore, setMatchScore] = useState(null);

  const extractJobDesc = async () => {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: () => {
              const pageText = document.body.innerText.toLowerCase();
              const keyword = "job description";
              let jobDesc = "";

              if (pageText.includes(keyword.toLowerCase())) {
                jobDesc = pageText.slice(pageText.indexOf(keyword.toLowerCase()));
              }

              return jobDesc || "Job description not found";
            },
          },
          (result) => {
            resolve(result[0]?.result || "");
          }
        );
    });
  });
};

  const getToken = async () => {
    return new Promise((resolve) => {
      chrome.cookies.get({ url: 'http://localhost:3000', name: 'token' }, (cookie) => {
        if (cookie) {
          console.log("COOKIE FOUND:", cookie.value);
          resolve(cookie.value);
        } else {
          console.log("NO COOKIE FOUND");
          resolve(null);
        }
      });
    })};

  
  
  

  const handleButtonClick = async () => {
    setLoading(true);
    const jobDesc = await extractJobDesc();
    if (!jobDesc) {
      alert("No job description found");
      setLoading(false);

  
      return;
    }
    const token = await getToken();
    if (token) {
      console.log("Token retrirved: ", token);
    } else {
      console.log("Token not found");
    }
    
 
    try {
      const response = await fetch('http://localhost:8000/resumes/match_job/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify({ job_description: jobDesc }),
      });
      print(response);
      const data = await response.json();
      if (response.ok) {
        setMatchScore(data.match_percentage);
        //alert(`Match score: ${data.match_percentage.toFixed(2)}%`);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }

    setLoading(false);     
  };

  const autofillForm = () => {
    // Send a message to the content script to change the background color
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'autofillJobApplication' });
    });    
  };
  
//import 'contentScript.js';



  return (
    <main style = {{display: 'block', width: '250px', background: '#fff', margin: 'auto', alignItems: 'center', justifyContent: 'center', padding: '10px', textAlign: 'center'}}>
      <h2 className='text' style={{color: '#3c009d', fontSize: '30px', fontWeight: '700'}}>JobMate</h2>
      <br></br>
      <div style = {{color: 'white', justifyContent: 'center', width: '200px',  background: '#4c00b4', alignItems: 'center', borderRadius: '10px', fontSize: '19px', cursor: 'pointer', textAlign: 'center', padding: '15px'}} 
      className='submit' id='apply' onClick={autofillForm}>
      Apply
      </div>
      <button
        onClick={handleButtonClick} 
        style={{
          padding: '12px 25px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          width: '100%',
          fontWeight: 'bold',
          marginTop: '15px', 
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {loading ? "Loading..." : "Begin Matching"}
      </button>
      <p style = {{color: '#4c00b4', justifyContent: 'center', alignItems: 'center', fontSize: '15px', cursor: 'pointer', fontWeight: '200'}} className='submit'>
      <a href="http://localhost:3000/" target="_blank">Login or Signup</a>
      </p>

      {matchScore !== null && (
        <div style = {{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f0f4ff',
          borderRadius: '12px',
          boxShadow: '0px 0px 8px rgba(60,0,157,0.1)',
          color: '#333',
          fontSize: '16px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
        Your Match Score is:
        <span style = {{ fontSize: '22px', color: '#4c00b4', fontWeight: '700', marginLeft: '6px'}}>
          {matchScore.toFixed(2)}%
        </span>

        </div>
      )}

      

    </main>
    

  );
};

export default App;