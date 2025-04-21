from django.urls import path
from .views import detect_fake_job
from .serp_scan.views import scan_serpapi_jobs
from .indeed_scan.views import scan_indeed_jobs

urlpatterns = [
    path("detect-fake-job/", detect_fake_job, name="detect_fake_job"),
    path("scan-serpapi-jobs/", scan_serpapi_jobs, name="scan_serpapi_jobs"),
    path("scan-indeed-jobs/", scan_indeed_jobs, name="scan_indeed_jobs"),
]