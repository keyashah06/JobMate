import React, { useState } from 'react';

const PhishingDetection = () => {
  const [formData, setFormData] = useState({
    description_word_count: '',
    suspicious_word_score: '',
    contains_links: '',
    suspicious_email_domain: '',
    has_salary_info: '',
    company_profile_length: '',
    is_contract: '',
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/api/detect-fake-job/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...formData,
        description_word_count: parseInt(formData.description_word_count),
        suspicious_word_score: parseInt(formData.suspicious_word_score),
        contains_links: parseInt(formData.contains_links),
        suspicious_email_domain: parseInt(formData.suspicious_email_domain),
        has_salary_info: parseInt(formData.has_salary_info),
        company_profile_length: parseInt(formData.company_profile_length),
        is_contract: parseInt(formData.is_contract),
      })
    });

    const data = await response.json();
    setResult(data);
  };

  return (
    <div className="max-w-xl mx-auto p-6 rounded-xl shadow-md border mt-6">
      <h1 className="text-2xl font-bold mb-4">Phishing Job Detection</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            <label className="block font-semibold">{key}</label>
            <input
              type="number"
              name={key}
              value={value}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        ))}

        <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-2">
          Detect Scam
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 border rounded-xl bg-gray-50">
          <h2 className="text-xl font-semibold">Result:</h2>
          <p className="mt-2">{result.message}</p>
          <p className="text-sm text-gray-500">Fraud Probability: {result.fraud_probability}</p>
          <p className="text-sm text-gray-500">Model Used: {result.model_used}</p>
        </div>
      )}
    </div>
  );
};

export default PhishingDetection;