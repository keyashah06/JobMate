from django.contrib import admin
from django.urls import path
from auth_app.views import login_view, register_view, reset_password_view
from resumes.views import upload_resume
from jobmate_backend.linkedin_api import linkedin_jobs
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/login/", login_view, name="login"),
    path("auth/register/", register_view, name="register"),
    path("auth/reset_password/", reset_password_view, name="reset_password"),
    path("resumes/upload/", upload_resume, name="upload_resume"),
    path("api/linkedin/jobs/", linkedin_jobs, name="linkedin_jobs"),
    path("auth/", include("auth_app.urls")),
    path("api/", include("api.urls")),
]


