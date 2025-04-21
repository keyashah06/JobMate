# jobmate_backend/phishing/predict.py
import pandas as pd
from .model_utils import load_model

FEATURE_COLUMNS = [
    "description_word_count", "suspicious_word_score", "contains_links",
    "suspicious_email_domain", "has_salary_info", "company_profile_length", "is_contract"
]

log_model, nb_model = load_model()

def predict_phishing(features: dict) -> dict:
    df = pd.DataFrame([features])
    prob_log = log_model.predict_proba(df)[:, 1][0]
    prob_nb = nb_model.predict_proba(df)[:, 1][0]

    # Hybrid model logic
    if 0.2 < prob_log < 0.8:
        final_prob = prob_nb
        model_used = "naive_bayes"
    else:
        final_prob = prob_log
        model_used = "logistic_regression"

    return {
        "is_fake": final_prob > 0.55,
        "fraud_probability": round(final_prob, 2),
        "model_used": model_used
    }