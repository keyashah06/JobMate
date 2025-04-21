import os
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import MFACode
import secrets
from django.http import JsonResponse
from django.views import View
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt

# Helper function to generate MFA codes
def generate_mfa_code():
    """Generates a secure 6-digit MFA code."""
    return str(secrets.randbelow(900000) + 100000)

# Send MFA code to the user's email
def send_mfa_email(user):
    """Generates and sends an MFA code to the user's email with good formatting."""
    try:
        # Invalidate any existing MFA codes for the user
        MFACode.objects.filter(user=user).delete()

        # Generate new MFA code
        code = generate_mfa_code()
        MFACode.objects.create(user=user, code=code)

        # Email subject
        subject = f"Your JobMate MFA Code"

        # Email message (formatted for better readability)
        message = f"""
        Hello {user.username},

        Your JobMate authentication code is **{code}**.
        This code is valid for **5 minutes**.

        If you did not request this code, please ignore this email.

        Thank you,  
        **JobMate Security Team**  
        """
        # print("Attempting to send MFA email...")
        # Send the email
        send_mail(
            subject="🔐 Your JobMate MFA Code",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        # print("send_mail() call complete.")

    except Exception as e:
        print(f"ERROR sending MFA email: {e}")

# MFA code verification view
@csrf_exempt  # Disables CSRF protection for API requests (needed for Postman testing)
@api_view(['POST'])
def verify_mfa_code(request):
    """Verifies MFA code and logs in the user if valid."""
    email_or_username = request.data.get("email")  # Accept email or username
    code = request.data.get("code")

    if not all([email_or_username, code]):
        return JsonResponse({"message": "Email/Username and code are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Check if input is an email or username
        user = User.objects.filter(email=email_or_username).first() or User.objects.filter(username=email_or_username).first()

        if not user:
            return JsonResponse({"message": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the most recent MFA code for the user
        mfa_code = MFACode.objects.filter(user=user, code=code).first()

        if not mfa_code:
            return JsonResponse({"message": "Invalid MFA code."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if MFA code is expired
        if mfa_code.created_at + timedelta(minutes=5) < timezone.now():
            return JsonResponse({"message": "MFA code expired."}, status=status.HTTP_400_BAD_REQUEST)

        # Log in the user
        login(request, user)

        # Invalidate the MFA code after use
        mfa_code.delete()

        return JsonResponse({"message": "MFA verified. Logged in successfully."}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"❌ ERROR during MFA verification: {e}")
        return JsonResponse({"message": "Something went wrong."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View to handle user registration
@api_view(['POST'])
def register_view(request):
    """Handles user registration."""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not all([username, email, password]):
        return Response({"message": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"message": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"message": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    send_mfa_email(user)

    return Response({"message": f"User '{username}' registered. MFA code sent."}, status=status.HTTP_201_CREATED)

# Login view with MFA email sending
@api_view(['POST'])
def login_view(request):
    """Handles login and sends MFA code if credentials are valid."""
    try:
        email_or_username = request.data.get("email")  # Keep field name for frontend compatibility
        password = request.data.get("password")

        if not all([email_or_username, password]):
            return Response({"message": "Email/Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the input is an email or username
        try:
            user = User.objects.get(email=email_or_username)
            username = user.username  # Get the actual username
        except User.DoesNotExist:
            username = email_or_username  # Assume input was a username

        # Authenticate using Django's built-in function
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({"message": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

        send_mfa_email(user)  # Send MFA Code
        return Response({
            "message": "MFA code sent. Please verify to complete login.",
            "mfa_required": True
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"ERROR during login: {e}")
        return Response({"message": "Something went wrong."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View for resending the MFA code
@api_view(['POST'])
def resend_mfa_code(request):
    """Resends a new MFA code to the user's email or username."""
    try:
        email_or_username = request.data.get("email")  # Accepts both email and username

        if not email_or_username:
            return Response({"message": "Email/Username is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Search by email or username
        user = User.objects.filter(email=email_or_username).first() or User.objects.filter(username=email_or_username).first()

        if not user:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        send_mfa_email(user)

        return Response({"message": "New MFA code sent successfully."}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"ERROR resending MFA: {e}")
        return Response({"message": "Something went wrong."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# views.py UPDATED
@api_view(["GET"])
def proxy_serpapi(_):
    import requests
    SERPAPI_KEY = os.getenv("SERPAPI_KEY")
    url = f"https://serpapi.com/search.json?engine=google_jobs&q=work from home&location=United States&hl=en&api_key={SERPAPI_KEY}"
    response = requests.get(url)
    return JsonResponse(response.json())