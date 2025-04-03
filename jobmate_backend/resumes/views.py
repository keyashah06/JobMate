from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Resume
import fitz
import docx
import io
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import re
import spacy
from spacy.matcher import Matcher, PhraseMatcher
from skillNer.general_params import SKILL_DB
from skillNer.skill_extractor_class import SkillExtractor
import json

#ML
import numpy as np
from sentence_transformers import SentenceTransformer, util
from .models import Resume
import torch
import matplotlib.pyplot as plt
import nltk
nltk.download("stopwords")
from nltk.corpus import stopwords



nlp = spacy.load("en_core_web_sm")
matcher = Matcher(nlp.vocab)

nlp_2 = spacy.load("en_core_web_lg")
skill_extractor = SkillExtractor(nlp_2, SKILL_DB, PhraseMatcher)

def extract_email(text):
   match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
   return match.group(0) if match else None

def extract_phone_number(text):
    match = re.search(r"(\+?\d{1,4}[\s-]?)?(\(?\d{1,4}\)?[\s-]?)?[\d\s-]{7,15}", text)
    return match.group(0) if match else None


def extract_name(text):
   nlp_text = nlp(text)
   pattern = [{'POS': 'PROPN'}, {'POS': 'PROPN'}]
   matcher.add('NAME', [pattern])
   matches = matcher(nlp_text)
   for match_id, start, end in matches:
      span = nlp_text[start:end]
      return span.text
   

def extract_skills(text):
   annotations = skill_extractor.annotate(text)
   skills = set()
   for match in annotations["results"]["full_matches"]:
      skills.add(match["doc_node_value"])

   for match in annotations["results"]["ngram_scored"]:
      if match["score"] > 0.7:
         skills.add(match["doc_node_value"])
   return list(skills)
  




def extract_experience(text):
    experience_headers = r"(?i)\b(experience|work experience|professional experience)\b"
    stop_headers = r"(?i)\b(education|skills|projects|certifications|summary|technical skills)\b"

    exp_match = re.search(experience_headers, text)
    if not exp_match:
        return ""

    exp_start = exp_match.start()
    stop_match = re.search(stop_headers, text[exp_start:])
    exp_end = exp_start + stop_match.start() if stop_match else len(text)

    experience_text = text[exp_start:exp_end].strip()

    # Normalize line breaks and spacing
    experience_text = re.sub(r"\s*\n\s*", "\n", experience_text)  # Remove extra spaces around newlines
    experience_text = re.sub(r"\n{2,}", "\n\n", experience_text)  # Ensure double newlines for section breaks

    # Add better formatting for experience entries
    experience_text = re.sub(r"(?<=\d{4})\n", "\n\n", experience_text)  # Add extra newline after years

    # Ensure bullet points are on separate lines
    experience_text = re.sub(r"(?<=\.)\s*(?=[A-Z])", "\n- ", experience_text)  # Start new line for each point

    return experience_text






def extract_projects(text):
   
    project_headers = r"(?i)\b(projects|personal projects|academic projects|relevant projects)\b"
    stop_headers = r"(?i)\b(experience|education|skills|certifications|summary|technical skills|leadership)\b"

    
    proj_match = re.search(project_headers, text)
    if not proj_match:
        return ""

    proj_start = proj_match.start()

   
    stop_match = re.search(stop_headers, text[proj_start:])
    proj_end = proj_start + stop_match.start() if stop_match else len(text)

   
    return text[proj_start:proj_end].strip()


def extract_education(text):
  
    education_headers = r"(?i)\b(education|academic background|educational qualifications)\b"
    stop_headers = r"(?i)\b(experience|projects|skills|certifications|summary|technical skills|leadership)\b"

    edu_match = re.search(education_headers, text)
    if not edu_match:
        return {}

    edu_start = edu_match.end() 
    stop_match = re.search(stop_headers, text[edu_start:])
    edu_end = edu_start + stop_match.start() if stop_match else len(text)
    education_text = text[edu_start:edu_end].strip()

    university_pattern = r"(?P<university>(?:The\s)?[\w\s,]+(?:University|Institute|College)(?:\sof\s[\w\s]+)?)"
    date_pattern = r"(?P<start_date>\w+ \d{4})(?:\s*-\s*(?P<end_date>\w+ \d{4}))?"
    degree_pattern = r"(?P<degree>(B\.S\.|M\.S\.|Ph\.D\.|Bachelor|Master)[^GPA\n|]+)"
    gpa_pattern = r"GPA[:\s]+(?P<gpa>[0-9.]+)"

    university = re.search(university_pattern, education_text)
    dates = re.search(date_pattern, education_text)
    degree = re.search(degree_pattern, education_text)
    gpa = re.search(gpa_pattern, education_text)

    start_date, end_date = None, None
    if dates:
        if dates.group("end_date"):
            start_date = dates.group("start_date")
            end_date = dates.group("end_date")
        else:
            end_date = dates.group("start_date")  # Assume it's the End Date if there's only one

    education_info = {
        "University": university.group("university").strip() if university else None,
        "Start Date": start_date,
        "End Date": end_date,
        "Degree": degree.group("degree").strip() if degree else None,
        "GPA": gpa.group("gpa") if gpa else None
    }

    return education_info


def extract_text_from_pdf(uploaded_file):
    try:
       pdf_file = io.BytesIO(uploaded_file.read())
       doc = fitz.open(stream = pdf_file, filetype = "pdf")
       text = "\n".join([page.get_text("text") for page in doc])
       return text
    except Exception as e:
       raise ValueError(f"Error extracting text from PDF: {str(e)}")


def extract_text_from_docx(uploaded_file):
 
    doc = docx.Document(uploaded_file)  
    text = "\n".join([para.text for para in doc.paragraphs])  
    return text



#ML

sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
stop_words = set(stopwords.words("english"))

def compute_match_score(job_description, user):
    try:
        resume = Resume.objects.get(user=user)
        resume_text = f"{resume.name} {resume.education} {resume.experience} {resume.skills} {resume.projects}"
        resume_text = resume_text.replace("{", "").replace("}", "").replace("[", "").replace("]", "").replace('"', '')

        resume_embedding = sbert_model.encode(resume_text, convert_to_tensor = True)
        job_desc_embedding = sbert_model.encode(job_description, convert_to_tensor = True)

        
        similarity_score = util.pytorch_cos_sim(resume_embedding, job_desc_embedding).item()
        match_percentage = round(similarity_score * 100, 2)
       
        resume_words = set(resume_text.lower().split())
        job_words = job_description.lower().split()
        important_words = list(set([word for word in job_words if word in resume_words and word not in stop_words]))

        return {
            "match_percentage": match_percentage,
            "important_words": important_words
        }
      
    
    except Resume.DoesNotExist:
        return {"error": "Resume not found for user"}
    except Exception as e:
       return {"error": str(e)}
    




@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
   if "file" not in request.FILES:
      return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
   uploaded_file = request.FILES["file"]
   if uploaded_file.name.endswith(".pdf"):
      text = extract_text_from_pdf(uploaded_file)
   elif uploaded_file.name.endswith(".docx"):
      text = extract_text_from_docx(uploaded_file)
   else:
      return Response({"error": "Unsupported file format"}, status=status.HTTP_400_BAD_REQUEST)
   
  
   email = extract_email(text)
   phone_number = extract_phone_number(text)
   name = extract_name(text)
   skills = extract_skills(text)
   experience = extract_experience(text)
   projects = extract_projects(text)
   education = extract_education(text)
   

   user = request.user
  
   try:
      resume = Resume.objects.get(user=user)
      resume.name = name
      resume.email = email
      resume.phone = phone_number
      resume.education = json.dumps(education)
      resume.experience = experience
      resume.skills = json.dumps(skills)
      resume.projects = projects
      resume.resume_file = uploaded_file
      resume.save()
     
      return Response ({
         "message": "Resume updated successfully",
         "resume_id": resume.id
      }, status = status.HTTP_200_OK)

   except Resume.DoesNotExist:
      resume = Resume.objects.create(
         user=user,
         name=name,
         email=email,
         phone=phone_number,
         education=json.dumps(education),
         experience=experience,
         skills=json.dumps(skills),
         projects=projects,
         resume_file=uploaded_file
      )
     
      return Response ({
         "message": "Resume uploaded and saved successfully",
         "resume_id": resume.id
      }, status = status.HTTP_201_CREATED)

  
@api_view(["POST"])
def match_job(request):
   print("hi")
   job_description = request.data.get("job_description", "")
   print("step 2")
   if not job_description:
      return Response({"error": "Job description is required"}, status=400)
   
   print("hellooo")
   user = request.user
   print("step 3")
   result = compute_match_score(job_description, user)
   print(result)
   print("step 4")
   return Response(result, status=200 if  result else 404)
