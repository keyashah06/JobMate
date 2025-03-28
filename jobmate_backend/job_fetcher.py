import requests
import json

SERPAPI_KEY = "451fa8cfd7c30f60ef6b3f69daf36d0eb67db7a20bce242f56788a5ff2f46ba8"

# Google Jobs API
API_URL = "https://serpapi.com/search"

params = {
    "engine": "google_jobs",
    "q": "work from home easy money no experience required",
    "location": "United States",
    "hl": "en",
    "api_key": SERPAPI_KEY
}

#params = {
#    "engine": "google_jobs",
#    "q": "NO EXPERIENCE WORK FROM HOME ",
#    "location": "United States",
#    "hl": "en",
#    "api_key": SERPAPI_KEY
#}

# Scam keywords with weights
SCAM_KEYWORDS = {
    "quick money": 5, "make money fast": 5, "work from home": 3, "no investment": 5,
    "immediate start": 3, "cash payment": 5, "apply now": 2, "entry level": 1,
    "data entry": 2, "full training provided": 4, "no experience needed": 4,
    "crypto": 5, "bitcoin": 5, "gift card": 5, "send payment": 5, "money transfer": 5,
    "venmo": 5, "western union": 5, "sign up bonus": 4, "easy money": 5, "paid survey": 5
}

def calculate_suspicious_score(description):
    score = 0
    description = description.lower()
    for word, weight in SCAM_KEYWORDS.items():
        if word in description:
            score += weight
    return score

# Query SerpAPI
response = requests.get(API_URL, params=params)
jobs = response.json().get("jobs_results", [])

# Your Django API
PHISHING_API = "http://127.0.0.1:8000/api/detect-fake-job/"

results = []
for job in jobs[:50]:
    title = job.get("title", "Unknown")
    description = job.get("description", "")

    # Feature extraction
    job_features = {
        "description_word_count": len(description.split()),
        "suspicious_word_score": calculate_suspicious_score(description),
        "contains_links": 1 if "http" in description else 0,
        "suspicious_email_domain": 0,
        "has_salary_info": 1,
        "company_profile_length": 50,
        "is_contract": 0
    }

    # Send to backend
    phishing_response = requests.post(
        PHISHING_API,
        headers={"Content-Type": "application/json"},
        data=json.dumps(job_features)
    )

    result = phishing_response.json()

    # Collect results
    results.append({
        "title": title,
        "message": result["message"],
        "fraud_probability": result["fraud_probability"],
        "model_used": result.get("model_used", "unknown")
    })

# Display output
for r in results:
    print(f"Job: {r['title']}")
    print(f"Prediction: {r['message']} (Fraud Probability: {r['fraud_probability']}, Model: {r['model_used']})\n")