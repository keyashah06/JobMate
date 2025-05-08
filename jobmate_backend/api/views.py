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
import traceback

# Load models
log_model = joblib.load("fraud_model_logistic.pkl")
nb_model = joblib.load("fraud_model_nb.pkl")

# Feature list
FEATURE_COLUMNS = [
    "description_word_count", "suspicious_word_score", "contains_links",
    "suspicious_email_domain", "has_salary_info", "company_profile_length", "is_contract"]

# PHISHING DETECTION ROUTE
@csrf_exempt
def detect_fake_job(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            if not all(col in data for col in FEATURE_COLUMNS):
                return JsonResponse({"error": "Missing required features"}, status=400)

            clean_data = {}
            for key in FEATURE_COLUMNS:
                value = data.get(key, 0)
                try:
                    clean_data[key] = float(value) if value != '' else 0
                except ValueError:
                    clean_data[key] = 0

            input_df = pd.DataFrame([clean_data])
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
            import traceback
            traceback_str = traceback.format_exc()
            print(f"Error in detect_fake_job: {traceback_str}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Send a POST request with job features."})

# LINKEDIN JOBS FETCH ROUTE
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def linkedin_jobs(request):
    from phishing.predict import predict_phishing

    try:
        jobs = request.data.get("jobs", [])
        if not isinstance(jobs, list):
            return Response({"error": "Jobs must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        enriched_jobs = []
        for job in jobs:
            try:
                # Use fallback if no description
                description = job.get("description", "") or job.get("title", "") or "urgent quick money http"
                email_domain = job.get("companyEmail", "").split("@")[-1].lower() if "@" in job.get("companyEmail", "") else ""
                free_email_domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]

                features = {
                    "description_word_count": len(description.split()),
                    "suspicious_word_score": sum(1 for word in ["money", "quick", "urgent"] if word in description.lower()),
                    "contains_links": int("http" in description.lower()),
                    "suspicious_email_domain": int(email_domain in free_email_domains),
                    "has_salary_info": int(job.get("salary", "").lower() != "not specified"),
                    "company_profile_length": len(job.get("company", "")),
                    "is_contract": int(job.get("type", "").lower() == "contract"),
                }

                print("🔍 FEATURES SENT TO MODEL:", features)

                phishing_result = predict_phishing(features)
                job.update(phishing_result)
                enriched_jobs.append(job)

            except Exception as e:
                job.update({
                    "is_fake": False,
                    "fraud_probability": 0.0,
                    "model_used": "error",
                    "error": str(e)
                })
                enriched_jobs.append(job)

        return Response(enriched_jobs, status=status.HTTP_200_OK)

    except Exception as e:
        traceback_str = traceback.format_exc()
        print(f"Error in linkedin_jobs: {traceback_str}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)