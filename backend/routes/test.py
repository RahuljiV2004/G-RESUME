# # main.py
# from fastapi import APIRouter,FastAPI, File, UploadFile, Form, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# import whisper
# import librosa
# import numpy as np
# import os
# import cohere
# import uuid
# from utils.audio_extract1 import extract_audio


# router = APIRouter(prefix="/video", tags=["interview"])


# UPLOAD_DIR = "static/uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Mount static directory to serve files


# # Load Whisper model
# try:
#     model = whisper.load_model("base")
#     print("Whisper model loaded successfully")
# except Exception as e:
#     print(f"Error loading Whisper model: {str(e)}")
#     model = None

# # Load Cohere API
# COHERE_API_KEY = os.getenv("COHERE_API_KEY")
# try:
#     co = cohere.Client(COHERE_API_KEY) if COHERE_API_KEY else None
#     if co:
#         print("Cohere client initialized successfully")
#     else:
#         print("Cohere API key not found")
# except Exception as e:
#     print(f"Error initializing Cohere client: {str(e)}")
#     co = None


# @router.post("/upload/")
# async def process_video(file: UploadFile = File(...), question: str = Form(...)):
#     """Processes the video file, extracts audio, transcribes response, and analyzes performance."""
#     try:
#         # Generate unique filename
#         file_uuid = uuid.uuid4()
#         original_filename = file.filename
#         extension = original_filename.split(".")[-1] if "." in original_filename else "webm"
#         safe_filename = f"{file_uuid}.{extension}"
        
#         # Save the uploaded video file
#         print(f"Received file: {original_filename}, Content-Type: {file.content_type}")
#         print(f"Using safe filename: {safe_filename}")
#         print(f"Received question: {question}")

#         if file.content_type not in ["video/mp4", "video/webm"]:
#             raise HTTPException(status_code=400, detail="Invalid file format")

#         video_path = os.path.join(UPLOAD_DIR, safe_filename)
#         with open(video_path, "wb") as buffer:
#             buffer.write(await file.read())
#         print(f"Saved file to: {video_path}")
        
#         # Extract audio
#         audio_output_path = os.path.join(UPLOAD_DIR, f"{safe_filename}_audio.mp3")
#         extract_result = extract_audio(input_path=video_path, output_path=audio_output_path)
        
#         if not extract_result:
#             raise HTTPException(status_code=500, detail="Failed to extract audio from video")
        
#         # Initialize default values in case analysis fails
#         result = {
#             "question": question,
#             "transcription": "Transcription unavailable",
#             "snr": 0,
#             "word_count": 0,
#             "speech_rate_wpm": 0,
#             "filler_words_count": 0,
#             "answer_feedback": "Analysis not available"
#         }
        
#         # Perform audio analysis if Whisper model is available
#         if model:
#             transcription = transcribe_audio(audio_output_path)
#             result["transcription"] = transcription
            
#             # Compute audio metrics
#             try:
#                 snr_value = compute_snr(audio_output_path)
#                 result["snr"] = round(snr_value, 2)
#             except Exception as e:
#                 print(f"Error computing SNR: {str(e)}")
            
#             try:
#                 word_count, wpm = analyze_speech_rate(transcription, audio_output_path)
#                 result["word_count"] = word_count
#                 result["speech_rate_wpm"] = round(wpm, 2)
#             except Exception as e:
#                 print(f"Error analyzing speech rate: {str(e)}")
            
#             try:
#                 filler_count = detect_filler_words(transcription)
#                 result["filler_words_count"] = filler_count
#             except Exception as e:
#                 print(f"Error detecting filler words: {str(e)}")
            
#             # Generate AI feedback if Cohere is available
#             if co:
#                 try:
#                     grammar_feedback = check_answer_feedback(question, transcription)
#                     result["answer_feedback"] = grammar_feedback
#                 except Exception as e:
#                     print(f"Error generating AI feedback: {str(e)}")
#                     result["answer_feedback"] = f"⚠️ Error generating feedback: {str(e)}"
#             else:
#                 result["answer_feedback"] = "⚠️ Cohere API Key missing. Cannot generate feedback."
#         else:
#             result["transcription"] = "⚠️ Whisper model not loaded. Cannot transcribe audio."

#         return result
#     except Exception as e:
#         print(f"Error processing video: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# # Transcribe speech using Whisper
# def transcribe_audio(file_path):
#     result = model.transcribe(file_path)
#     return result["text"]

# # Compute Signal-to-Noise Ratio (SNR)
# def compute_snr(audio_file):
#     y, sr = librosa.load(audio_file, sr=None)
#     speech_rms = np.mean(librosa.feature.rms(y=y))
#     noise_rms = np.mean(librosa.feature.rms(y=y[:sr//2]))  # Estimate noise from first half second
#     snr = 20 * np.log10(speech_rms / (noise_rms + 1e-9))
#     return snr

# # Analyze speech rate (WPM)
# def analyze_speech_rate(transcribed_text, audio_file):
#     y, sr = librosa.load(audio_file, sr=None)
#     duration = librosa.get_duration(y=y, sr=sr)
#     words = len(transcribed_text.split())
#     wpm = (words / duration) * 60 if duration > 0 else 0
#     return words, wpm

# # Detect filler words
# def detect_filler_words(transcribed_text):
#     filler_words = ["um", "uh", "like", "you know", "hmm", "ah"]
#     words = transcribed_text.lower().split()
#     filler_count = sum(1 for word in words if word in filler_words)
#     return filler_count

# # Generate AI feedback using Cohere
# def check_answer_feedback(question, answer):
#     if not co:
#         return "⚠️ Cohere API Key missing. Cannot generate feedback."

#     prompt = f"""
#     **Question:** {question}
#     **Answer:** {answer}

#     Provide:
#     - **Grammar Corrections**
#     - **Content Relevance**
#     - **Suggested Improvements**
#     - **Fluency Score (X/10)**
#     """

#     response = co.generate(model="command", prompt=prompt, max_tokens=300, temperature=0.7)
#     return response.generations[0].text.strip()


# main.py
from fastapi import APIRouter, FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import whisper
import librosa
import numpy as np
import os
import cohere
import uuid
import soundfile as sf
import noisereduce as nr
from utils.audio_extract1 import extract_audio

router = APIRouter(prefix="/video", tags=["interview"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load Whisper model
try:
    model = whisper.load_model("medium")  # Upgraded from "base" to "medium"
    print("Whisper model loaded successfully")
except Exception as e:
    print(f"Error loading Whisper model: {str(e)}")
    model = None

# Load Cohere API
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
try:
    co = cohere.Client(COHERE_API_KEY) if COHERE_API_KEY else None
    if co:
        print("Cohere client initialized successfully")
    else:
        print("Cohere API key not found")
except Exception as e:
    print(f"Error initializing Cohere client: {str(e)}")
    co = None

@router.post("/upload/")
async def process_video(file: UploadFile = File(...), question: str = Form(...)):
    """Processes the video file, extracts audio, transcribes response, and analyzes performance."""
    try:
        # Generate unique filename
        file_uuid = uuid.uuid4()
        original_filename = file.filename
        extension = original_filename.split(".")[-1] if "." in original_filename else "webm"
        safe_filename = f"{file_uuid}.{extension}"
        
        # Save the uploaded video file
        print(f"Received file: {original_filename}, Content-Type: {file.content_type}")
        print(f"Using safe filename: {safe_filename}")
        print(f"Received question: {question}")

        if file.content_type not in ["video/mp4", "video/webm"]:
            raise HTTPException(status_code=400, detail="Invalid file format")

        video_path = os.path.join(UPLOAD_DIR, safe_filename)
        with open(video_path, "wb") as buffer:
            buffer.write(await file.read())
        print(f"Saved file to: {video_path}")
        
        # Extract audio
        audio_output_path = os.path.join(UPLOAD_DIR, f"{safe_filename}_audio.mp3")
        extract_result = extract_audio(input_path=video_path, output_path=audio_output_path)
        
        if not extract_result:
            raise HTTPException(status_code=500, detail="Failed to extract audio from video")
        
        # Preprocess audio (normalize, resample, denoise)
        preprocessed_audio = preprocess_audio(audio_output_path)
        denoised_audio = denoise_audio(preprocessed_audio)
        
        # Initialize default values
        result = {
            "question": question,
            "transcription": "Transcription unavailable",
            "snr": 0,
            "word_count": 0,
            "speech_rate_wpm": 0,
            "filler_words_count": 0,
            "answer_feedback": "Analysis not available"
        }
        
        # Perform audio analysis if Whisper model is available
        if model:
            transcription = transcribe_audio(denoised_audio)
            result["transcription"] = transcription
            
            # Compute audio metrics
            try:
                snr_value = compute_snr(denoised_audio)
                result["snr"] = round(snr_value, 2)
            except Exception as e:
                print(f"Error computing SNR: {str(e)}")
            
            try:
                word_count, wpm = analyze_speech_rate(transcription, denoised_audio)
                result["word_count"] = word_count
                result["speech_rate_wpm"] = round(wpm, 2)
            except Exception as e:
                print(f"Error analyzing speech rate: {str(e)}")
            
            try:
                filler_count = detect_filler_words(transcription)
                result["filler_words_count"] = filler_count
            except Exception as e:
                print(f"Error detecting filler words: {str(e)}")
            
            # Generate AI feedback if Cohere is available
            if co:
                try:
                    grammar_feedback = check_answer_feedback(question, transcription)
                    result["answer_feedback"] = grammar_feedback
                except Exception as e:
                    print(f"Error generating AI feedback: {str(e)}")
                    result["answer_feedback"] = f"⚠️ Error generating feedback: {str(e)}"
            else:
                result["answer_feedback"] = "⚠️ Cohere API Key missing. Cannot generate feedback."
        else:
            result["transcription"] = "⚠️ Whisper model not loaded. Cannot transcribe audio."

        return result
    except Exception as e:
        print(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Preprocess Audio (Normalize and Resample to 16kHz)
def preprocess_audio(file_path):
    y, sr = librosa.load(file_path, sr=16000)  # Convert to 16kHz
    y = librosa.util.normalize(y)  # Normalize volume
    output_path = file_path.replace(".mp3", "_cleaned.mp3")
    sf.write(output_path, y, sr)
    return output_path

# Reduce Noise from Audio
def denoise_audio(file_path):
    y, sr = librosa.load(file_path, sr=16000)
    reduced_noise = nr.reduce_noise(y=y, sr=sr, prop_decrease=0.8)
    output_path = file_path.replace(".mp3", "_denoised.mp3")
    sf.write(output_path, reduced_noise, sr)
    return output_path

# Transcribe speech using Whisper
def transcribe_audio(file_path):
    result = model.transcribe(file_path, language="en", temperature=0.0, fp16=False)
    return result["text"]

# Compute Signal-to-Noise Ratio (SNR)
def compute_snr(audio_file):
    y, sr = librosa.load(audio_file, sr=None)
    speech_rms = np.mean(librosa.feature.rms(y=y))
    noise_rms = np.mean(librosa.feature.rms(y=y[:sr//2]))  # Estimate noise from first half second
    snr = 20 * np.log10(speech_rms / (noise_rms + 1e-9))
    return snr

# Analyze speech rate (WPM)
def analyze_speech_rate(transcribed_text, audio_file):
    y, sr = librosa.load(audio_file, sr=None)
    duration = librosa.get_duration(y=y, sr=sr)
    words = len(transcribed_text.split())
    wpm = (words / duration) * 60 if duration > 0 else 0
    return words, wpm

# Detect filler words
def detect_filler_words(transcribed_text):
    filler_words = ["um", "uh", "like", "you know", "hmm", "ah"]
    words = transcribed_text.lower().split()
    filler_count = sum(1 for word in words if word in filler_words)
    return filler_count

# Generate AI feedback using Cohere
def check_answer_feedback(question, answer):
    if not co:
        return "⚠️ Cohere API Key missing. Cannot generate feedback."

    prompt = f"""
    **Question:** {question}
    **Answer:** {answer}

    Provide:
    - **Grammar Corrections**
    - **Content Relevance**
    - **Suggested Improvements**
    - **Fluency Score (X/10)**
    """

    response = co.generate(model="command", prompt=prompt, max_tokens=300, temperature=0.7)
    return response.generations[0].text.strip()
