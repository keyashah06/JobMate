# api/views.py

# Imports
import joblib
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json

# Load models
log_model = joblib.load("fraud_model_logistic.pkl")
nb_model = joblib.load("fraud_model_nb.pkl")

# Feature list
FEATURE_COLUMNS = ["description_word_count", "suspicious_word_score", "contains_links",
                   "suspicious_email_domain", "has_salary_info", "company_profile_length", "is_contract"]

# PHISHING DETECTION ROUTE
@csrf_exempt
def detect_fake_job(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            if not all(col in data for col in FEATURE_COLUMNS):
                return JsonResponse({"error": "Missing required features"}, status=400)

            input_df = pd.DataFrame([data])
            prob_log = log_model.predict_proba(input_df)[:, 1][0]
            prob_nb = nb_model.predict_proba(input_df)[:, 1][0]

            if 0.2 < prob_log < 0.8:
                final_prob = prob_nb
                model_used = "naive_bayes"
            else:
                final_prob = prob_log
                model_used = "logistic_regression"

            prediction = 1 if final_prob > 0.55 else 0

            return JsonResponse({
                "is_fake": bool(prediction),
                "fraud_probability": round(final_prob, 2),
                "model_used": model_used,
                "message": "🚨 This job may be fake!" if prediction else "✅ This job looks legitimate."
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Send a POST request with job features."})

# LINKEDIN JOBS FETCH ROUTE
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def linkedin_jobs(request):
    # Simulate dummy job postings
    fake_jobs = [
        {
            "position": "Software Engineer",
            "company": "FakeTech Inc.",
            "location": "Remote",
            "jobUrl": "https://www.linkedin.com/jobs/view/1234567890/",
            "description": "Looking for passionate devs. Quick money!",
            "salary": "$100,000",
        },
        {
            "position": "Junior Web Developer",
            "company": "HelloWeb LLC",
            "location": "New York, NY",
            "jobUrl": "https://www.linkedin.com/jobs/view/2345678901/",
            "description": "Exciting opportunity in front-end.",
            "salary": "Not specified",
        },
    ]
    return Response(fake_jobs, status=status.HTTP_200_OK)