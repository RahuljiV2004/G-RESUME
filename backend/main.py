
# from fastapi import FastAPI, File, UploadFile, HTTPException, Form
# from fastapi.middleware.cors import CORSMiddleware
# import pdfplumber
# import cohere
# import os
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()
# COHERE_API_KEY = os.getenv("COHERE_API_KEY")

# if not COHERE_API_KEY:
#     raise ValueError("⚠️ COHERE_API_KEY is missing! Set it in a .env file or environment variable.")

# # Initialize Cohere client
# co = cohere.Client(COHERE_API_KEY)

# # Initialize FastAPI app
# app = FastAPI()

# # Enable CORS for frontend running on port 3000
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # React frontend URL
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

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

# # Endpoint to generate cover letter
# @app.post("/upload-resume/")
# async def upload_resume(
#     resume_file: UploadFile = File(...),
#     job_description: str = Form(...)
# ):
#     if resume_file.content_type != "application/pdf":
#         raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
#     pdf_text = extract_text_from_pdf(resume_file)
#     enhanced_text = enhance_cover_letter(pdf_text, job_description)

#     return {
#         "original_resume": pdf_text,
#         "enhanced_letter": enhanced_text,
#     }

# # New Endpoint to generate enhanced resume
# @app.post("/generate-enhanced-resume/")
# async def generate_enhanced_resume(
#     resume_file: UploadFile = File(...),
#     job_description: str = Form(...)
# ):
#     if resume_file.content_type != "application/pdf":
#         raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
#     pdf_text = extract_text_from_pdf(resume_file)
#     enhanced_resume = enhance_resume(pdf_text, job_description)

#     return {
#         "original_resume": pdf_text,
#         "enhanced_resume": enhanced_resume,
#     }

# # Run the FastAPI app
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import cohere
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

if not COHERE_API_KEY:
    raise ValueError("⚠️ COHERE_API_KEY is missing! Set it in a .env file or environment variable.")

# Initialize Cohere client
co = cohere.Client(COHERE_API_KEY)

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend running on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to extract text from PDF (format-preserving)
def extract_text_from_pdf(file: UploadFile):
    try:
        text = ""
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"  # Preserve line breaks
        return text.strip() if text else "⚠️ Could not extract text from PDF."
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

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
            model="command-xlarge-nightly",  # Adjust model name if needed
            prompt=prompt,
            max_tokens=1000,
            temperature=0.6,
            stop_sequences=["### ✅ Optimized Cover Letter:"],
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
            model="command-xlarge-nightly",  # Adjust model name if needed
            prompt=prompt,
            max_tokens=1000,
            temperature=0.6,
            stop_sequences=["### ✅ Enhanced Resume:"],
        )

        return response.generations[0].text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enhancing resume: {str(e)}")

# Endpoint to generate cover letter and enhanced resume
@app.post("/upload-resume/")
async def upload_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    if resume_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    pdf_text = extract_text_from_pdf(resume_file)
    enhanced_letter = enhance_cover_letter(pdf_text, job_description)
    enhanced_resume = enhance_resume(pdf_text, job_description)

    return {
        "original_resume": pdf_text,
        "enhanced_letter": enhanced_letter,
        "enhanced_resume": enhanced_resume,
    }

# Run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)