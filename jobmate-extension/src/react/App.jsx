import {useState} from 'react';
//import './App.css';
//import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
//<Link to={{ pathname: "" }} target="_blank"></Link> <Link to={{ pathname: "http://localhost:3000/" }} target="_blank"></Link>
const App = () => {
  return (
    <main style = {{display: 'block', width: '250px', background: '#fff', margin: 'auto', alignItems: 'center', justifyContent: 'center', padding: '10px', textAlign: 'center'}}>
      <h2 className='text' style={{color: '#3c009d', fontSize: '30px', fontWeight: '700'}}>JobMate</h2>
      <br></br>
      <div style = {{color: 'white', justifyContent: 'center', width: '200px',  background: '#4c00b4', alignItems: 'center', borderRadius: '10px', fontSize: '19px', cursor: 'pointer', textAlign: 'center', padding: '15px'}} className='submit'>
      Apply
      </div>
      <p style = {{color: '#4c00b4', justifyContent: 'center', alignItems: 'center', fontSize: '15px', cursor: 'pointer', fontWeight: '200'}} className='submit'>
      Login or Signup
      </p>
    </main>

  );
};

export default App;