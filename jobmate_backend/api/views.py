import joblib
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Load both models
log_model = joblib.load("fraud_model_logistic.pkl")
nb_model = joblib.load("fraud_model_nb.pkl")

# Define expected feature columns
FEATURE_COLUMNS = ["description_word_count", "suspicious_word_score", "contains_links",
                   "suspicious_email_domain", "has_salary_info", "company_profile_length", "is_contract"]

@csrf_exempt
def detect_fake_job(request):
    """Predicts job scam status using hybrid ML model strategy."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # Check for all required features
            if not all(col in data for col in FEATURE_COLUMNS):
                return JsonResponse({"error": "Missing required features"}, status=400)

            input_df = pd.DataFrame([data])

            # Predict with Logistic
            prob_log = log_model.predict_proba(input_df)[:, 1][0]
            prob_nb = nb_model.predict_proba(input_df)[:, 1][0]

            # Use Naive Bayes if Logistic is "uncertain"
            #if 0.45 < prob_log < 0.6:
            if 0.2 < prob_log < 0.8:
                final_prob = prob_nb
                model_used = "naive_bayes"
            else:
                final_prob = prob_log
                model_used = "logistic_regression"

            prediction = 1 if final_prob > 0.55 else 0

            print("POST DATA:", data)
            print(f"Logistic: {prob_log:.2f}, NB: {prob_nb:.2f}, Used: {model_used}")

            return JsonResponse({
                "is_fake": bool(prediction),
                "fraud_probability": round(final_prob, 2),
                "model_used": model_used,
                "message": "🚨 This job may be fake!" if prediction == 1 else "✅ This job looks legitimate."
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        

    return JsonResponse({"message": "Send a POST request with job features."})