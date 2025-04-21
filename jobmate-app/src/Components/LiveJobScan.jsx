import React, { useEffect, useState, useCallback, useMemo } from "react";

const LiveJobScan = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SERPAPI_KEY = "451fa8cfd7c30f60ef6b3f69daf36d0eb67db7a20bce242f56788a5ff2f46ba8";
  const SERP_URL = `https://serpapi.com/search.json?engine=google_jobs&q=work+from+home&location=United+States&hl=en&api_key=${SERPAPI_KEY}`;

  const SCAM_KEYWORDS = useMemo(() => ({
    "quick money": 5, "make money fast": 5, "work from home": 3, "no investment": 5,
    "immediate start": 3, "cash payment": 5, "apply now": 2, "entry level": 1,
    "data entry": 2, "full training provided": 4, "no experience needed": 4,
    "crypto": 5, "bitcoin": 5, "gift card": 5, "send payment": 5, "money transfer": 5,
    "venmo": 5, "western union": 5, "sign up bonus": 4, "easy money": 5, "paid survey": 5,
    "click here": 3, "wire transfer": 5, "guaranteed income": 4, "freelance": 2,
    "no strings attached": 4, "work anytime": 3
  }), []);

  const calculateSuspiciousScore = useCallback((description) => {
    let score = 0;
    const desc = description.toLowerCase();
    for (const word in SCAM_KEYWORDS) {
      if (desc.includes(word)) score += SCAM_KEYWORDS[word];
    }
    return score;
  }, [SCAM_KEYWORDS]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("🌐 Fetching job data from SerpAPI...");

    try {
      const serpRes = await fetch(SERP_URL);
      console.log("📥 SerpAPI raw response:", serpRes);

      if (!serpRes.ok) {
        const errorText = await serpRes.text();
        throw new Error(`SerpAPI error ${serpRes.status}: ${errorText}`);
      }

      const serpData = await serpRes.json();
      console.log("📦 SerpAPI JSON Data:", serpData);

      if (serpData.error) {
        throw new Error(`SerpAPI returned error: ${serpData.error}`);
      }

      const jobResults = serpData.jobs_results || [];

      if (jobResults.length === 0) {
        throw new Error("No jobs returned from SerpAPI.");
      }

      const analyzed = await Promise.all(
        jobResults.slice(0, 10).map(async (job, index) => {
          const description = job.description || "";
          const features = {
            description_word_count: description.split(" ").length,
            suspicious_word_score: calculateSuspiciousScore(description),
            contains_links: description.includes("http") ? 1 : 0,
            suspicious_email_domain: 0,
            has_salary_info: 1,
            company_profile_length: 50,
            is_contract: 0
          };

          console.log(`📤 Sending job #${index + 1} to backend:`, features);

          try {
            const res = await fetch("http://127.0.0.1:8000/api/detect-fake-job/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(features)
            });

            const result = await res.json();
            console.log(`✅ Response from backend for job #${index + 1}:`, result);

            return {
              title: job.title || "Untitled",
              company: job.company_name || "Unknown",
              link: job.related_links?.[0]?.link || "#",
              message: result.message,
              fraud_probability: result.fraud_probability,
              model_used: result.model_used
            };
          } catch (err) {
            console.error(`❌ Backend API error for job #${index + 1}:`, err);
            return {
              title: job.title || "Untitled",
              company: job.company_name || "Unknown",
              message: "⚠️ Error detecting scam",
              fraud_probability: "?",
              model_used: "N/A"
            };
          }
        })
      );

      setJobs(analyzed);
    } catch (err) {
      console.error("❌ Failed fetching from SerpAPI:", err);
      setError(`Something went wrong fetching from SerpAPI: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [SERP_URL, calculateSuspiciousScore]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 border shadow-lg rounded-xl bg-white">
      <h2 className="text-2xl font-bold mb-4">🛰️ Live Job Scam Detection</h2>

      {loading && <p>Loading job postings...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <button
        onClick={fetchJobs}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        🔁 Retry Fetch
      </button>

      {!loading && jobs.length === 0 && !error && (
        <p className="text-gray-500">No job data available right now.</p>
      )}

      <div className="space-y-6">
        {jobs.map((job, index) => (
          <div key={index} className="border p-4 rounded-xl bg-gray-50">
            <h3 className="text-lg font-semibold text-blue-800">{job.title}</h3>
            <p className="text-sm text-gray-600">Company: {job.company}</p>
            <p className="mt-2">{job.message}</p>
            <p className="text-sm text-gray-500">Fraud Probability: {job.fraud_probability}</p>
            <p className="text-sm text-gray-500">Model Used: {job.model_used}</p>
            {job.link && job.link !== "#" && (
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm mt-1 inline-block"
              >
                View Job Posting →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveJobScan;