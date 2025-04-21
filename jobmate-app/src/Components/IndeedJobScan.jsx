import React, { useEffect, useState } from "react";

const IndeedJobScan = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndeedResults = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/indeed-scan/");
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Error fetching from Indeed backend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIndeedResults();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🧪 Indeed Job Results</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        results.map((job, idx) => (
          <div key={idx} className="border p-4 mb-4 rounded bg-gray-50">
            <h3 className="text-green-800 font-bold">{job.title}</h3>
            <p>Company: {job.company}</p>
            <p>{job.message}</p>
            <p>Fraud Probability: {job.fraud_probability}</p>
            <p>Model Used: {job.model_used}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default IndeedJobScan;
// This component fetches job data from the Indeed API and displays it in a user-friendly format.
// It handles loading states and errors gracefully, ensuring a smooth user experience.