from django.urls import path
from .views import detect_fake_job
from . import views

urlpatterns = [
    path("detect-fake-job/", detect_fake_job, name="detect_fake_job"),
    path("linkedin/jobs/", views.linkedin_jobs, name="linkedin_jobs"),
]