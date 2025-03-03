# from fastapi import APIRouter, File, UploadFile, HTTPException, Form
# import pdfplumber
# import cohere
# import os
# from dotenv import load_dotenv
# import re

# router = APIRouter(prefix="/resume", tags=["Resume Analysis"])

# # Load environment variables
# load_dotenv()
# COHERE_API_KEY = os.getenv("COHERE_API_KEY")

# if not COHERE_API_KEY:
#     raise ValueError("⚠️ COHERE_API_KEY is missing! Set it in a .env file or environment variable.")

# # Initialize Cohere client
# co = cohere.Client(COHERE_API_KEY)

# # Function to extract text from PDF (format-preserving)
# def extract_text_from_pdf(file: UploadFile):
#     try:
#         text = ""
#         with pdfplumber.open(file.file) as pdf:
#             for page in pdf.pages:
#                 page_text = page.extract_text()
#                 if page_text:
#                     text += page_text + "\n\n"  # Preserve line breaks
#         return text.strip() if text else "⚠️ Could not extract text from PDF."
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

# # Function to enhance cover letter using Cohere
# def enhance_cover_letter(resume_text: str, job_description: str):
#     try:
#         prompt = (
#             "**You are an AI Cover Letter Generator.** \n"
#             "- Create a personalized cover letter for the following resume and job description. \n"
#             "- Emphasize relevant skills and experiences. \n"
#             "- Keep it short and don't exceed 400 words.\n"
#             "- Optimize for the job description using impactful keywords and action verbs.\n\n"
#             "### Job Description: \n"
#             f"{job_description}\n\n"
#             "### Original Resume: \n"
#             f"{resume_text}\n\n"
#             "### ✅ Optimized Cover Letter:"
#         )
        
#         response = co.generate(
#             model="command-xlarge-nightly",  # Adjust model name if needed
#             prompt=prompt,
#             max_tokens=1000,
#             temperature=0.6,
#             stop_sequences=["### ✅ Optimized Cover Letter:"],
#         )

#         return response.generations[0].text.strip()
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error enhancing cover letter: {str(e)}")

# # Function to enhance resume using Cohere
# def enhance_resume(resume_text: str, job_description: str):
#     try:
#         prompt = (
#             "**You are an AI Resume Enhancer.** \n"
#             "- Enhance the resume to better align with the given job description. \n"
#             "- Highlight relevant skills, experiences, and achievements. \n"
#             "- Optimize for Applicant Tracking Systems (ATS).\n"
#             "- Use impactful keywords and action verbs.\n\n"
#             "### Job Description: \n"
#             f"{job_description}\n\n"
#             "### Original Resume: \n"
#             f"{resume_text}\n\n"
#             "### ✅ Enhanced Resume:"
#         )
        
#         response = co.generate(
#             model="command-xlarge-nightly",  # Adjust model name if needed
#             prompt=prompt,
#             max_tokens=1000,
#             temperature=0.6,
#             stop_sequences=["### ✅ Enhanced Resume:"],
#         )

#         return response.generations[0].text.strip()
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error enhancing resume: {str(e)}")


# def generate_interview_questions(resume_text: str, job_description: str):
#     """Generate structured interview questions from the LLM response."""
#     try:
#         prompt = (
#             "**You are an AI Interviewer.** \n"
#             "- Generate **5 technical** and **2 non-technical** questions. \n"
#             "- Difficulty level: **Fresher to Intermediate**.\n"
#             "- Return each question in a **clear format** with numbering or bullet points.\n\n"
#             "### Job Description: \n"
#             f"{job_description}\n\n"
#             "### Candidate Resume: \n"
#             f"{resume_text}\n\n"
#             "### ✅ Interview Questions:"
#         )

#         response = co.generate(
#             model="command-xlarge-nightly",
#             prompt=prompt,
#             max_tokens=500,
#             temperature=0.7,
#             stop_sequences=["### ✅ Interview Questions:"],
#         )

#         raw_text = response.generations[0].text.strip()

#         # ✅ Extract questions properly (handles multiple formats)
#         questions = extract_questions_from_text(raw_text)

#         return questions
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error generating interview questions: {str(e)}")

# def extract_questions_from_text(text):

#     """Extracts questions from formatted text (handles bullet points, numbering, and newlines)."""
    
#     # Normalize bullet points and numbering formats
#     question_patterns = [
#         r"^\d+\.\s*(.+)",   # Matches "1. Question" style
#         r"^- (.+)",         # Matches "- Question" style
#         r"• (.+)",          # Matches "• Question" style
#         r"^\*\s*(.+)",      # Matches "* Question" style
#     ]

#     questions = []

#     # Process line by line
#     for line in text.split("\n"):
#         line = line.strip()
#         for pattern in question_patterns:
#             match = re.match(pattern, line)
#             if match:
#                 questions.append(match.group(1).strip())
#                 break  # Stop checking after first match

#     return questions if questions else ["⚠️ No questions could be extracted. Check formatting."]



# # Endpoint to generate cover letter and enhanced resume
# @router.post("/upload/")
# async def upload_resume(
#     resume_file: UploadFile = File(...),
#     job_description: str = Form(...)
# ):
#     if resume_file.content_type != "application/pdf":
#         raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
#     pdf_text = extract_text_from_pdf(resume_file)
#     enhanced_letter = enhance_cover_letter(pdf_text, job_description)
#     enhanced_resume = enhance_resume(pdf_text, job_description)
#     interview_questions = generate_interview_questions(pdf_text, job_description)
    
#     print(interview_questions)



#     return {
#         "original_resume": pdf_text,
#         "enhanced_letter": enhanced_letter,
#         "enhanced_resume": enhanced_resume,
#         "interview_questions": interview_questions
#     }
import requests
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pdfplumber
import cohere
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
FINDWORK_API_KEY = os.getenv("FINDWORK_API_KEY")


# Initialize Cohere client
co = cohere.Client(COHERE_API_KEY)

# Create FastAPI Router
router = APIRouter()

# Function to extract text from uploaded PDF resume
def extract_text_from_pdf(file: UploadFile):
    try:
        with pdfplumber.open(file.file) as pdf:
            pages = [page.extract_text() for page in pdf.pages]
        return "\n".join(pages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {str(e)}")

# Function to enhance cover letter using Cohere
def enhance_cover_letter(resume_text: str, job_description: str):
    try:
        prompt = (
            "**You are an AI Cover Letter Generator.** \n"
            "- Create a personalized cover letter for the following resume and job description. \n"
            "- Emphasize relevant skills and experiences. \n"
            "- Keep it short and don't exceed 400 words.\n"
            "- Optimize for the job description using impactful keywords and action verbs.\n\n"
            "### Job Description: \n"
            f"{job_description}\n\n"
            "### Original Resume: \n"
            f"{resume_text}\n\n"
            "### ✅ Optimized Cover Letter:"
        )
        response = co.generate(
            model="command-xlarge-nightly",
            prompt=prompt,
            max_tokens=1000,
            temperature=0.7
        )
        return response.generations[0].text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enhancing cover letter: {str(e)}")

# Function to enhance resume using Cohere
def enhance_resume(resume_text: str, job_description: str):
    try:
        prompt = (
            "**You are an AI Resume Enhancer.** \n"
            "- Enhance the resume to better align with the given job description. \n"
            "- Highlight relevant skills, experiences, and achievements. \n"
            "- Optimize for Applicant Tracking Systems (ATS).\n"
            "- Use impactful keywords and action verbs.\n\n"
            "### Job Description: \n"
            f"{job_description}\n\n"
            "### Original Resume: \n"
            f"{resume_text}\n\n"
            "### ✅ Enhanced Resume:"
        )
        response = co.generate(
            model="command-xlarge-nightly",
            prompt=prompt,
            max_tokens=1000,
            temperature=0.7
        )
        return response.generations[0].text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enhancing resume: {str(e)}")

# Function to get job recommendations using Cohere
def get_job_recommendations(resume_text: str, job_description: str):
    try:
        prompt = (
            "**You are an AI Job Recommender.** \n"
            "- Analyze the resume and job description. \n"
            "- Recommend relevant job roles or titles.\n\n"
            f"### Job Description: \n{job_description}\n\n"
            f"### Resume: \n{resume_text}\n\n"
            "### ✅ Job Recommendations:"
        )
        
        response = co.generate(
            model="command-xlarge-nightly",
            prompt=prompt,
            max_tokens=1000,
            temperature=0.7,
            stop_sequences=["### ✅ Job Recommendations:"],
        )
        return response.generations[0].text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating job recommendations: {str(e)}")

# Function to generate interview questions using Cohere
def generate_interview_questions(resume_text:str,job_description: str):
    try:
        prompt = (
            "**You are an AI Interviewer.** \n"
            "- Generate **5 technical** and **2 non-technical** questions. \n"
            "-Give short answers to those questions not exceeding 100 words.\n"
            "- Difficulty level: **Fresher to Intermediate**.\n"
            "- Return each question in a **clear format** with numbering or bullet points.\n\n"
            "### Job Description: \n"
            f"{job_description}\n\n"
            "### Candidate Resume: \n"
            f"{resume_text}\n\n"
            "### ✅ Interview Questions:"
        )
        response = co.generate(
            model="command-xlarge-nightly",
            prompt=prompt,
            max_tokens=1000,
            temperature=0.7
        )
        return response.generations[0].text.strip().split("\n")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating interview questions: {str(e)}")

# API Endpoint to Analyze Resume
@router.post("/resume/upload/")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Extract text from uploaded PDF resume
    resume_text = extract_text_from_pdf(file)
    
    # Generate Enhanced Cover Letter and Resume
    enhanced_cover_letter = enhance_cover_letter(resume_text, job_description)
    enhanced_resume = enhance_resume(resume_text, job_description)
    
    # Generate Job Recommendations
    job_recommendations = get_job_recommendations(resume_text, job_description)
    
    # Generate Interview Questions
    interview_questions = generate_interview_questions(resume_text,job_description)
  
    # JSON Response
    return {
        "original_resume_text": resume_text,
        "enhanced_cover_letter": enhanced_cover_letter,
        "enhanced_resume": enhanced_resume,
  
        "job_recommendations": job_recommendations,
        "interview_questions": interview_questions
    }
