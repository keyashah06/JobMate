# jobmate_backend/phishing/predict.py
import pandas as pd
from .model_utils import load_model

FEATURE_COLUMNS = [
    "description_word_count", "suspicious_word_score", "contains_links",
    "suspicious_email_domain", "has_salary_info", "company_profile_length", "is_contract",
    "missing_website", "domain_age_days", "grammar_error_score", "title_contains_crypto"
]

log_model, nb_model = load_model()

def predict_phishing(features: dict) -> dict:
    input_features = {col: features.get(col, 0) for col in FEATURE_COLUMNS}
    df = pd.DataFrame([input_features])

    prob_log = log_model.predict_proba(df)[:, 1][0]
    prob_nb = nb_model.predict_proba(df)[:, 1][0]

    if 0.2 < prob_log < 0.8:
        final_prob = prob_nb
        model_used = "naive_bayes"
    else:
        final_prob = prob_log
        model_used = "logistic_regression"

    severity = "Low"
    if final_prob > 0.75:
        severity = "High"
    elif final_prob > 0.55:
        severity = "Medium"

    explanation = []
    if input_features["suspicious_word_score"] > 1:
        explanation.append("Suspicious keywords detected")
    if input_features["contains_links"]:
        explanation.append("Contains a link")
    if input_features["suspicious_email_domain"]:
        explanation.append("Uses free email domain")
    if input_features["missing_website"]:
        explanation.append("Missing company website")
    if input_features["domain_age_days"] < 365:
        explanation.append("Company website is less than 1 year old")
    if input_features["grammar_error_score"] > 1:
        explanation.append("Grammar/spelling errors detected")
    if input_features["title_contains_crypto"]:
        explanation.append("Job title mentions 'crypto'")

    return {
        "is_fake": final_prob > 0.55,
        "fraud_probability": round(final_prob, 2),
        "model_used": model_used,
        "severity": severity,
        "explanation": explanation
    }