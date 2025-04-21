from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
from ..pipeline import predict_phishing

@csrf_exempt
def scan_serpapi_jobs(request):
    try:
        serp_api_key = "YOUR_SERPAPI_KEY"
        serp_url = f"https://serpapi.com/search.json?engine=google_jobs&q=work+from+home&location=United+States&hl=en&api_key={serp_api_key}"

        serp_response = requests.get(serp_url)
        jobs = serp_response.json().get("jobs_results", [])[:10]
        predictions = []

        for job in jobs:
            desc = job.get("description", "")
            features = {
                "description_word_count": len(desc.split()),
                "suspicious_word_score": sum(kw in desc.lower() for kw in ["quick money", "bitcoin", "no investment"]),
                "contains_links": int("http" in desc),
                "suspicious_email_domain": 0,
                "has_salary_info": 1,
                "company_profile_length": 50,
                "is_contract": 0
            }
            result = predict_phishing(features)
            result["title"] = job.get("title", "Untitled")
            result["company"] = job.get("company_name", "Unknown")
            predictions.append(result)

        return JsonResponse({"results": predictions})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)