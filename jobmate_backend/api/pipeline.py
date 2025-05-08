# api/pipeline.py
import joblib
import pandas as pd
import os

# Load models once (at module level)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
log_model_path = os.path.join(BASE_DIR, "fraud_model_logistic.pkl")
nb_model_path = os.path.join(BASE_DIR, "fraud_model_nb.pkl")
scaler_path = os.path.join(BASE_DIR, "feature_scaler.pkl")

log_model = joblib.load(log_model_path)
nb_model = joblib.load(nb_model_path)
scaler = joblib.load(scaler_path)

FEATURE_COLUMNS = [
    "description_word_count", "suspicious_word_score", "contains_links",
    "suspicious_email_domain", "has_salary_info", "company_profile_length",
    "is_contract"
]

numeric_features = ["description_word_count", "suspicious_word_score", "company_profile_length"]

def predict_phishing(features: dict):
    df = pd.DataFrame([features])

    print("Features passed to predict_phishing():")
    print(df)

    # Scale numeric features for logistic regression
    df_scaled = df.copy()
    df_scaled[numeric_features] = scaler.transform(df_scaled[numeric_features])

    prob_log = log_model.predict_proba(df_scaled)[:, 1][0]
    prob_nb = nb_model.predict_proba(df)[:, 1][0]  # Naive Bayes expects raw (unscaled)

    if 0.2 < prob_log < 0.8:
        final_prob = prob_nb
        model_used = "naive_bayes"
    else:
        final_prob = prob_log
        model_used = "logistic_regression"

    prediction = int(final_prob > 0.15)

    return {
        "is_fake": bool(prediction),
        "fraud_probability": round(final_prob, 2),
        "model_used": model_used,
        "message": "🚨 This job may be fake!" if prediction else "✅ This job looks legitimate."
    }