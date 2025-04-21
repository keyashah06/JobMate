from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
from ..pipeline import predict_phishing

@csrf_exempt
def scan_indeed_jobs(request):
    try:
        url = "https://www.indeed.com/jobs?q=work+from+home&limit=10"
        html = requests.get(url).text
        # For now, return a dummy response until you write the full BeautifulSoup logic
        dummy_description = "Work from home job offering quick money. Apply now!"
        features = {
            "description_word_count": len(dummy_description.split()),
            "suspicious_word_score": 5,
            "contains_links": 0,
            "suspicious_email_domain": 1,
            "has_salary_info": 0,
            "company_profile_length": 20,
            "is_contract": 1
        }
        result = predict_phishing(features)
        return JsonResponse({"results": [result]})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)