from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token

from rest_framework.response import Response
# Create your views here.

#login
@api_view(['POST'])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})
    else:
        return Response({"error": "Invalid credentials"}, status = 400)

#signup
@api_view(['POST'])
def register_view(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    
    if User.objects.filter(username = username).exists():
        return Response({"error": "Username already taken"}, status = 400)
    if User.objects.filter(email = email).exists():
        return Response({"error": "Email already taken"}, status = 400)
    
    user = User.objects.create_user(username=username, email = email, password=password)

    return Response({"message": "User registered successfully"}, status = 201)
    
