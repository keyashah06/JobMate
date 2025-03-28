from django.urls import path
from .views import detect_fake_job

urlpatterns = [
    path("detect-fake-job/", detect_fake_job, name="detect_fake_job"),
]