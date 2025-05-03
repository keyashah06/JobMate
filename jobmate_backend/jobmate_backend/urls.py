"""
URL configuration for jobmate_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from auth_app.views import login_view, register_view, reset_password_view
from resumes.views import upload_resume, match_job, get_resume_details
from jobmate_backend.linkedin_api import linkedin_jobs, linkedin_job_details

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/login/", login_view, name = "login"),
    path("auth/register/", register_view, name = "register"),
    path("auth/reset_password/", reset_password_view, name = "reset_password"),
    path("resumes/upload/", upload_resume, name = "upload_resume"),
    path("resumes/match_job/", match_job, name = "match_job"),
    path("resumes/get_details/", get_resume_details, name = "get_resume_details"),
    path("api/linkedin/jobs/", linkedin_jobs, name="linkedin_jobs"),
    path("api/linkedin/jobs/<int:job_id>/", linkedin_job_details, name="linkedin_job_details"), 
]
    


