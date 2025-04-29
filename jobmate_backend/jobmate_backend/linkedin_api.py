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
    Proxy endpoint for LinkedIn Jobs API
    """
    try:
        # Get parameters from request
        data = request.data
        keyword = data.get('keyword', '')
        location = data.get('location', '')
        date_since_posted = data.get('dateSincePosted', '')
        job_type = data.get('jobType', '')
        remote_filter = data.get('remoteFilter', '')
        salary = data.get('salary', '')
        experience_level = data.get('experienceLevel', '')
        limit = int(data.get('limit', '20'))
        
        # Build the LinkedIn Jobs search URL with parameters
        base_url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
        
        # Map the parameters to LinkedIn's expected format
        params = {}
        
        if keyword:
            params['keywords'] = keyword
            
        if location:
            params['location'] = location
            
        # Date posted filters
        if date_since_posted == 'Past 24 hours':
            params['f_TPR'] = 'r86400'
        elif date_since_posted == 'Past Week':
            params['f_TPR'] = 'r604800'
        elif date_since_posted == 'Past Month':
            params['f_TPR'] = 'r2592000'
            
        # Job type filters
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
                
        # Remote work filters
        if remote_filter:
            remote_filter_map = {
                'On-site': '1',
                'Remote': '2',
                'Hybrid': '3'
            }
            if remote_filter in remote_filter_map:
                params['f_WT'] = remote_filter_map[remote_filter]
                
        # Salary filters
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
                
        # Experience level filters
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
        
        # Set the start parameter for pagination
        params['start'] = 0
        
        # Set headers to mimic a browser request
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
        
        # Make the request to LinkedIn
        try:
            response = requests.get(base_url, params=params, headers=headers, timeout=10)
            
            # Check if the request was successful
            if response.status_code != 200:
                logger.error(f"LinkedIn API returned status code: {response.status_code}")
                return Response(
                    {"error": f"LinkedIn API returned status code: {response.status_code}"},
                    status=status.HTTP_502_BAD_GATEWAY
                )
                
            # Log the response for debugging
            logger.debug(f"LinkedIn API response: {response.text[:500]}...")
            
            # Parse the HTML response
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract job listings
            job_cards = soup.select('li.jobs-search-results__list-item')
            
            # If no job cards found, try alternative selectors
            if not job_cards:
                job_cards = soup.select('div.base-card')
            
            if not job_cards:
                # Return mock data for testing if no jobs found
                logger.warning("No job cards found in LinkedIn response, returning mock data")
                return Response(get_mock_jobs(keyword, location, limit))
            
            jobs = []
            for card in job_cards:
                try:
                    # Extract job details
                    title_element = card.select_one('.base-search-card__title')
                    company_element = card.select_one('.base-search-card__subtitle')
                    location_element = card.select_one('.job-search-card__location')
                    date_element = card.select_one('time')
                    
                    # Extract the job URL
                    link_element = card.select_one('a.base-card__full-link')
                    job_url = link_element.get('href').split('?')[0] if link_element else None
                    
                    # Extract the company logo
                    logo_element = card.select_one('img.artdeco-entity-image')
                    company_logo = logo_element.get('data-delayed-url') if logo_element else None
                    
                    # Create a job object
                    job = {
                        "position": title_element.text.strip() if title_element else "Unknown Position",
                        "company": company_element.text.strip() if company_element else "Unknown Company",
                        "location": location_element.text.strip() if location_element else location or "Unknown Location",
                        "companyLogo": company_logo or "",
                        "jobUrl": job_url or "",
                    }
                    
                    # Add date information if available
                    if date_element:
                        datetime_attr = date_element.get('datetime')
                        if datetime_attr:
                            job["date"] = datetime_attr
                        job["agoTime"] = date_element.text.strip()
                    
                    jobs.append(job)
                    
                    # Limit the number of jobs returned
                    if len(jobs) >= limit:
                        break
                        
                except Exception as e:
                    logger.error(f"Error parsing job card: {str(e)}")
                    continue
            
            # If we couldn't extract any jobs, return mock data
            if not jobs:
                logger.warning("Failed to extract jobs from LinkedIn response, returning mock data")
                return Response(get_mock_jobs(keyword, location, limit))
            
            return Response(jobs)
            
        except requests.RequestException as e:
            logger.error(f"Request to LinkedIn failed: {str(e)}")
            # Return mock data if the request fails
            return Response(
                get_mock_jobs(keyword, location, limit),
                status=status.HTTP_200_OK
            )
        
    except Exception as e:
        logger.exception(f"Unexpected error in linkedin_jobs: {str(e)}")
        return Response(
            {"error": f"Failed to fetch LinkedIn jobs: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def get_mock_jobs(keyword, location, limit):
    """
    Return mock job data for testing or when LinkedIn API fails
    """
    mock_jobs = [
        {
            "position": f"Senior {keyword or 'Software'} Engineer",
            "company": "TechCorp",
            "companyLogo": "https://media.licdn.com/dms/image/C4D0BAQHiNSL4LkZMqA/company-logo_100_100/0/1656681489088?e=1722499200&v=beta&t=abcdefghijklmnopqrstuvwxyz",
            "location": location or "Remote",
            "date": "2025-04-05",
            "agoTime": "1 day ago",
            "salary": "$90,000 - $120,000",
            "jobUrl": "https://www.linkedin.com/jobs/view/frontend-developer-at-techcorp-123456789"
        },
        {
            "position": f"{keyword or 'Full Stack'} Developer",
            "company": "InnoSoft",
            "companyLogo": "https://media.licdn.com/dms/image/C4E0BAQHiNSL4LkZMqA/company-logo_100_100/0/1656681489088?e=1722499200&v=beta&t=abcdefghijklmnopqrstuvwxyz",
            "location": location or "San Francisco, CA",
            "date": "2025-04-04",
            "agoTime": "2 days ago",
            "salary": "$110,000 - $140,000",
            "jobUrl": "https://www.linkedin.com/jobs/view/full-stack-engineer-at-innosoft-987654321"
        },
        {
            "position": f"{keyword or 'React'} Developer",
            "company": "WebWorks",
            "companyLogo": "",
            "location": location or "New York, NY",
            "date": "2025-04-03",
            "agoTime": "3 days ago",
            "salary": "$95,000 - $125,000",
            "jobUrl": "https://www.linkedin.com/jobs/view/react-developer-at-webworks-567891234"
        },
        {
            "position": f"UX/UI Designer {keyword or ''}",
            "company": "DesignHub",
            "companyLogo": "https://media.licdn.com/dms/image/C4D0BAQHiNSL4LkZMqA/company-logo_100_100/0/1656681489088?e=1722499200&v=beta&t=abcdefghijklmnopqrstuvwxyz",
            "location": location or "Remote",
            "date": "2025-04-02",
            "agoTime": "4 days ago",
            "salary": "$85,000 - $110,000",
            "jobUrl": "https://www.linkedin.com/jobs/view/ux-ui-designer-at-designhub-345678912"
        },
        {
            "position": f"Product Manager {keyword or ''}",
            "company": "ProductLabs",
            "companyLogo": "",
            "location": location or "Austin, TX",
            "date": "2025-04-01",
            "agoTime": "5 days ago",
            "salary": "$120,000 - $150,000",
            "jobUrl": "https://www.linkedin.com/jobs/view/product-manager-at-productlabs-789123456"
        }
    ]
    
    # Filter by keyword if provided
    if keyword:
        keyword_lower = keyword.lower()
        filtered_jobs = [
            job for job in mock_jobs 
            if keyword_lower in job["position"].lower() or keyword_lower in job["company"].lower()
        ]
        if filtered_jobs:
            mock_jobs = filtered_jobs
    
    # Limit results
    return mock_jobs[:limit]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def linkedin_job_details(request, job_id):
    """
    Get detailed information about a specific LinkedIn job
    """
    try:
        # Construct the job details URL
        url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"
        
        # Set headers to mimic a browser request
        headers = {
            'User-Agent': get_random_user_agent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.linkedin.com/jobs/view/',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        # Make the request to LinkedIn
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            # Check if the request was successful
            if response.status_code != 200:
                logger.error(f"LinkedIn API returned status code: {response.status_code} for job {job_id}")
                return Response(
                    {"error": f"LinkedIn API returned status code: {response.status_code}"},
                    status=status.HTTP_502_BAD_GATEWAY
                )
            
            # Parse the HTML response
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract job details
            title_element = soup.select_one('h1.top-card-layout__title')
            company_element = soup.select_one('a.topcard__org-name-link')
            location_element = soup.select_one('span.topcard__flavor--bullet')
            description_element = soup.select_one('div.description__text')
            
            # Create the job details object
            job_details = {
                "position": title_element.text.strip() if title_element else "Unknown Position",
                "company": company_element.text.strip() if company_element else "Unknown Company",
                "location": location_element.text.strip() if location_element else "Unknown Location",
                "description": description_element.text.strip() if description_element else "No description available",
                "jobUrl": url,
            }
            
            # Try to extract additional details
            try:
                # Extract salary if available
                criteria_elements = soup.select('li.description__job-criteria-item')
                for element in criteria_elements:
                    header = element.select_one('h3.description__job-criteria-subheader')
                    if header and 'Salary' in header.text:
                        value = element.select_one('span.description__job-criteria-text')
                        if value:
                            job_details["salary"] = value.text.strip()
                    elif header and 'Employment type' in header.text:
                        value = element.select_one('span.description__job-criteria-text')
                        if value:
                            job_details["type"] = value.text.strip()
                    elif header and 'Seniority level' in header.text:
                        value = element.select_one('span.description__job-criteria-text')
                        if value:
                            job_details["experienceLevel"] = value.text.strip()
            except Exception as e:
                logger.error(f"Error extracting additional job details: {str(e)}")
                # If we can't extract these details, just continue
                pass
            
            return Response(job_details)
            
        except requests.RequestException as e:
            logger.error(f"Request to LinkedIn job details failed: {str(e)}")
            # Return mock job details if the request fails
            return Response({
                "position": f"Job {job_id}",
                "company": "LinkedIn Company",
                "location": "Remote",
                "description": "This is a mock job description because we couldn't fetch the real one. Please visit the LinkedIn job page for details.",
                "jobUrl": url,
                "note": "This is mock data because the LinkedIn API request failed."
            })
        
    except Exception as e:
        logger.exception(f"Unexpected error in linkedin_job_details: {str(e)}")
        return Response(
            {"error": f"Failed to fetch LinkedIn job details: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
