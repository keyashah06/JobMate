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
        print("DEBUG: No experience header found!")
        return ""

    exp_start = exp_match.start()
    stop_match = re.search(stop_headers, text[exp_start:])
    exp_end = exp_start + stop_match.start() if stop_match else len(text)

  
    experience_text = text[exp_start:exp_end].strip()
    print("\nDEBUG: Extracted Experience Text\n", experience_text)
    return experience_text




def extract_projects(text):
    # Define headers for "projects" and other sections that should stop the capture
    project_headers = r"(?i)\b(projects|personal projects|academic projects|relevant projects)\b"
    stop_headers = r"(?i)\b(experience|education|skills|certifications|summary|technical skills|leadership)\b"
    
    # Locate the starting point of the projects section
    proj_match = re.search(project_headers, text, re.IGNORECASE)
    if not proj_match:
        return []

    proj_start = proj_match.start()
    
    # Locate the point where the projects section ends (next section header)
    stop_match = re.search(stop_headers, text[proj_start:], re.IGNORECASE)
    proj_end = proj_start + stop_match.start() if stop_match else len(text)

    project_text = text[proj_start:proj_end].strip()

    # Clean up extra spaces and newlines
    project_text = re.sub(r"\n+", " ", project_text)  
    project_text = re.sub(r"\s{2,}", " ", project_text)  

    # Regex to capture project details like titles, dates, and descriptions
    project_pattern = r"([A-Za-z0-9\s\|\-]+)\s\|\s([A-Za-z\s]+)\s(\d{4})\s(.*?)\s*(?=\s{2,}|\b(?:experience|education|skills|certifications|summary|technical skills|leadership)\b|$)"
    
    projects = []
    for match in re.finditer(project_pattern, project_text):
        project_title = match.group(1).strip()  # Exclude "PROJECTS" from title
        project_date = match.group(3).strip()
        project_description = match.group(4).strip()

        projects.append({
            "title": project_title,
            "date": project_date,
            "description": project_description
        })
    
    return projects




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
   return Response({"text": text, "email": email, "phone_number": phone_number, "name": name, "skills": skills, "experience": experience, "projects": projects}, status=status.HTTP_200_OK)