import os
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from .models import MFACode

# Generate 6-digit MFA code
def generate_mfa_code():
    return str(secrets.randbelow(900000) + 100000)

# Send MFA email
def send_mfa_email(user):
    try:
        MFACode.objects.filter(user=user).delete()
        code = generate_mfa_code()
        MFACode.objects.create(user=user, code=code)

        message = f"""
        Hello {user.username},

        Your JobMate authentication code is: {code}
        This code is valid for 5 minutes.

        If you did not request this, ignore this message.

        - JobMate Security Team
        """

        send_mail(
            subject="🔐 Your JobMate MFA Code",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"ERROR sending MFA email: {e}")

# 🔐 REGISTER
@api_view(['POST'])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not all([username, email, password]):
        return Response({"message": "All fields are required."}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"message": "Username already taken."}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"message": "Email already registered."}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    send_mfa_email(user)

    return Response({"message": f"User '{username}' registered. MFA code sent."}, status=201)

# 🔐 LOGIN (fixed)
@csrf_exempt
@api_view(['POST'])
def login_view(request):
    try:
        email_or_username = request.data.get("email") or request.data.get("username")
        password = request.data.get("password")

        print("📥 Login input:", email_or_username, password)

        if not email_or_username or not password:
            print("🚫 Missing credentials.")
            return Response({"message": "Missing credentials."}, status=400)

        user = User.objects.filter(email=email_or_username).first() or User.objects.filter(username=email_or_username).first()

        if not user:
            print("❌ No user found.")
            return Response({"message": "Invalid credentials."}, status=400)

        auth_user = authenticate(username=user.username, password=password)

        if not auth_user:
            print("❌ Authentication failed.")
            return Response({"message": "Invalid credentials."}, status=400)

        send_mfa_email(auth_user)

        print("✅ MFA email sent successfully.")
        return Response({
            "message": "MFA code sent. Please verify to complete login.",
            "mfa_required": True,
            "username": auth_user.get_full_name() or auth_user.username
        }, status=200)

    except Exception as e:
        print(f"🔥 ERROR during login: {e}")
        return Response({"message": "Something went wrong."}, status=500)

# 🔐 VERIFY MFA
@csrf_exempt
@api_view(['POST'])
def verify_mfa_code(request):
    """Verifies MFA code and logs in the user if valid."""
    email_or_username = request.data.get("email")
    code = request.data.get("code")

    if not all([email_or_username, code]):
        return JsonResponse({"message": "Email/Username and code are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.filter(email=email_or_username).first() or User.objects.filter(username=email_or_username).first()

        if not user:
            return JsonResponse({"message": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)

        mfa_code = MFACode.objects.filter(user=user, code=code).first()

        if not mfa_code:
            return JsonResponse({"message": "Invalid MFA code."}, status=status.HTTP_400_BAD_REQUEST)

        if mfa_code.created_at + timedelta(minutes=5) < timezone.now():
            return JsonResponse({"message": "MFA code expired."}, status=status.HTTP_400_BAD_REQUEST)

        # Log in the user
        login(request, user)

        # Invalidate the MFA code after use
        mfa_code.delete()

        # ➡️ Create or retrieve Token
        token, created = Token.objects.get_or_create(user=user)

        return JsonResponse({
            "message": "MFA verified. Logged in successfully.",
            "token": token.key,
            "username": user.get_full_name() or user.username
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"❌ ERROR during MFA verification: {e}")
        return JsonResponse({"message": "Something went wrong."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 🔁 RESEND MFA
@api_view(['POST'])
def resend_mfa_code(request):
    email_or_username = request.data.get("email")

    if not email_or_username:
        return Response({"message": "Email/Username required."}, status=400)

    user = User.objects.filter(email=email_or_username).first() or User.objects.filter(username=email_or_username).first()

    if not user:
        return Response({"message": "User not found."}, status=404)

    send_mfa_email(user)
    return Response({"message": "New MFA code sent successfully."}, status=200)

# 🧪 SERPAPI Proxy (optional for job fetching)
@api_view(["GET"])
def proxy_serpapi(_):
    import requests
    SERPAPI_KEY = os.getenv("SERPAPI_KEY")
    url = f"https://serpapi.com/search.json?engine=google_jobs&q=work from home&location=United States&hl=en&api_key={SERPAPI_KEY}"
    response = requests.get(url)
    return JsonResponse(response.json())

# 🔑 RESET PASSWORD
@api_view(['POST'])
def reset_password_view(request):
    email = request.data.get("email")
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect"}, status=400)

    if new_password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Password reset successfully"}, status=200)