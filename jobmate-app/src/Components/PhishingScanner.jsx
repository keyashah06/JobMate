import React, { useState } from 'react';
import SerpJobScan from './SerpJobScan'; // Importing the SerpJobScan component to handle Google Jobs scanning
import IndeedJobScan from './IndeedJobScan'; // Importing the IndeedJobScan component to handle Indeed Jobs scanning
// This component provides a unified interface for scanning job postings from both Google Jobs and Indeed.

const PhishingScanner = () => {
  const [showSerp, setShowSerp] = useState(false);
  const [showIndeed, setShowIndeed] = useState(false);

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 border rounded-xl shadow bg-white">
      <h1 className="text-2xl font-bold mb-6">Phishing Job Post Detection</h1>

      <div className="flex space-x-4 mb-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            setShowSerp(true);
            setShowIndeed(false);
          }}
        >
          🔍 Scan Google Jobs (SerpAPI)
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => {
            setShowIndeed(true);
            setShowSerp(false);
          }}
        >
          🧪 Scan Indeed Jobs
        </button>
      </div>

      {showSerp && <SerpJobScan />}
      {showIndeed && <IndeedJobScan />}
    </div>
  );
};

export default PhishingScanner;
// This component is designed to provide a unified interface for scanning job postings from both Google Jobs and Indeed.
// It uses two child components, SerpJobScan and IndeedJobScan, to handle the specific logic for each platform.