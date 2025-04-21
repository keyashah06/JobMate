# jobmate_backend/phishing/model_utils.py
import joblib

def load_model():
    log_model = joblib.load("fraud_model_logistic.pkl")
    nb_model = joblib.load("fraud_model_nb.pkl")
    return log_model, nb_model