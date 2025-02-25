# utils/audio_extract.py

import subprocess

def extract_audio(input_path, output_path):
    """Extract audio from video file using ffmpeg"""
    command = [
        "ffmpeg", "-i", input_path, 
        "-q:a", "0", "-map", "a", 
        output_path, "-y"
    ]
    subprocess.run(command, check=True)
