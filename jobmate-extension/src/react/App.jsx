import {useState} from 'react';
//import 'contentScript.js';

const App = () => {
  const autofillForm = () => {
    // Send a message to the content script to change the background color
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'autofillJobApplication' });
    });    
  };

  return (
    <main style = {{display: 'block', width: '250px', background: '#fff', margin: 'auto', alignItems: 'center', justifyContent: 'center', padding: '10px', textAlign: 'center'}}>
      <h2 className='text' style={{color: '#3c009d', fontSize: '30px', fontWeight: '700'}}>JobMate</h2>
      <br></br>
      <div style = {{color: 'white', justifyContent: 'center', width: '200px',  background: '#4c00b4', alignItems: 'center', borderRadius: '10px', fontSize: '19px', cursor: 'pointer', textAlign: 'center', padding: '15px'}} 
      className='submit' id='apply' onClick={autofillForm}>
      Apply
      </div>
      <p style = {{color: '#4c00b4', justifyContent: 'center', alignItems: 'center', fontSize: '15px', cursor: 'pointer', fontWeight: '200'}} className='submit'>
      <a href="http://localhost:3000/" target="_blank">Login or Signup</a>
      </p>
    </main>

  );
};

export default App;