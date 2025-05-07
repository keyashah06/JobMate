import json
import requests
import random
import time
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bs4 import BeautifulSoup
from phishing.predict import predict_phishing
import logging

# Set up logging
logger = logging.getLogger(__name__)

# List of user agents to rotate through to avoid detection
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
]

def get_random_user_agent():
    return random.choice(USER_AGENTS)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def linkedin_jobs(request):
    """
    Proxy endpoint for LinkedIn Jobs API with phishing detection
    """
    try:
        data = request.data
        keyword = data.get('keyword', '')
        location = data.get('location', '')
        date_since_posted = data.get('dateSincePosted', '')
        job_type = data.get('jobType', '')
        remote_filter = data.get('remoteFilter', '')
        salary = data.get('salary', '')
        experience_level = data.get('experienceLevel', '')
        limit = int(data.get('limit', '20'))

        base_url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
        params = {}

        if keyword:
            params['keywords'] = keyword
        if location:
            params['location'] = location
        if date_since_posted == 'Past 24 hours':
            params['f_TPR'] = 'r86400'
        elif date_since_posted == 'Past Week':
            params['f_TPR'] = 'r604800'
        elif date_since_posted == 'Past Month':
            params['f_TPR'] = 'r2592000'
        if job_type:
            job_type_map = {
                'Full-time': 'F',
                'Part-time': 'P',
                'Contract': 'C',
                'Temporary': 'T',
                'Volunteer': 'V',
                'Internship': 'I'
            }
            if job_type in job_type_map:
                params['f_JT'] = job_type_map[job_type]
        if remote_filter:
            remote_filter_map = {
                'On-site': '1',
                'Remote': '2',
                'Hybrid': '3'
            }
            if remote_filter in remote_filter_map:
                params['f_WT'] = remote_filter_map[remote_filter]
        if salary:
            salary_map = {
                '$40,000+': '1',
                '$60,000+': '2',
                '$80,000+': '3',
                '$100,000+': '4',
                '$120,000+': '5'
            }
            if salary in salary_map:
                params['f_SB2'] = salary_map[salary]
        if experience_level:
            experience_map = {
                'Internship': '1',
                'Entry level': '2',
                'Associate': '3',
                'Senior': '4',
                'Director': '5',
                'Executive': '6'
            }
            if experience_level in experience_map:
                params['f_E'] = experience_map[experience_level]

        params['start'] = 0

        headers = {
            'User-Agent': get_random_user_agent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.linkedin.com/jobs/search/',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'TE': 'Trailers',
        }

        logger.info(f"Fetching LinkedIn jobs with params: {params}")

        try:
            response = requests.get(base_url, params=params, headers=headers, timeout=10)

            if response.status_code != 200:
                logger.error(f"LinkedIn API returned status code: {response.status_code}")
                return Response(
                    {"error": f"LinkedIn API returned status code: {response.status_code}"},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            soup = BeautifulSoup(response.text, 'html.parser')
            job_cards = soup.select('li.jobs-search-results__list-item') or soup.select('div.base-card')

            if not job_cards:
                logger.warning("No job cards found in LinkedIn response, returning empty list")
                return Response([], status=status.HTTP_200_OK)

            jobs = []
            for card in job_cards:
                try:
                    title_element = card.select_one('.base-search-card__title')
                    company_element = card.select_one('.base-search-card__subtitle')
                    location_element = card.select_one('.job-search-card__location')
                    date_element = card.select_one('time')
                    link_element = card.select_one('a.base-card__full-link')
                    job_url = link_element.get('href').split('?')[0] if link_element else None

                    job_description = f"{title_element.text.strip() if title_element else ''} at {company_element.text.strip() if company_element else ''} in {location_element.text.strip() if location_element else ''}"
                    features = {
                        "description_word_count": len(job_description.split()),
                        "suspicious_word_score": sum(1 for word in ["money", "quick", "urgent"] if word in job_description.lower()),
                        "contains_links": "http" in job_description.lower(),
                        "suspicious_email_domain": 0,  # Optional enhancement
                        "has_salary_info": 0,          # You can improve this later
                        "company_profile_length": len(company_element.text.strip() if company_element else ""),
                        "is_contract": 0               # You can adjust if needed
                    }
                    prediction = predict_phishing(features)

                    job = {
                        "position": title_element.text.strip() if title_element else "Unknown Position",
                        "company": company_element.text.strip() if company_element else "Unknown Company",
                        "location": location_element.text.strip() if location_element else location or "Unknown Location",
                        "jobUrl": job_url or "",
                        "is_fake": prediction.get('is_scam', False),
                        "fraud_score": prediction.get('fraud_probability', 0.0),
                        "model_used": prediction.get('model_used', ''),
                    }

                    if date_element:
                        datetime_attr = date_element.get('datetime')
                        if datetime_attr:
                            job["date"] = datetime_attr
                        job["agoTime"] = date_element.text.strip()

                    jobs.append(job)
                    if len(jobs) >= limit:
                        break

                except Exception as e:
                    logger.error(f"Error parsing job card: {str(e)}")
                    continue

            if not jobs:
                logger.warning("Failed to extract jobs from LinkedIn response, returning empty list")
                return Response([], status=status.HTTP_200_OK)

            return Response(jobs)

        except requests.RequestException as e:
            logger.error(f"Request to LinkedIn failed: {str(e)}")
            return Response([], status=status.HTTP_200_OK)

    except Exception as e:
        logger.exception(f"Unexpected error in linkedin_jobs: {str(e)}")
        return Response(
            {"error": f"Failed to fetch LinkedIn jobs: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )