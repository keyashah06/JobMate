from django.urls import path
from .views import verify_mfa_code, register_view, login_view, resend_mfa_code

urlpatterns = [
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('verify-mfa/', verify_mfa_code, name='verify_mfa'),
    path('send-mfa/', resend_mfa_code, name='send_mfa'),
]
