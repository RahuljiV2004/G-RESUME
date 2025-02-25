# utils/audio_extract.py
import subprocess
import os

def extract_audio(input_path, output_path):
    """
    Extract audio track from a video file using ffmpeg
    
    Args:
        input_path (str): Path to the input video file
        output_path (str): Path where the extracted audio will be saved
    
    Returns:
        bool: True if extraction was successful, False otherwise
    """
    try:
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Use ffmpeg to extract audio
        command = [
            'ffmpeg',
            '-i', input_path,  # Input file
            '-q:a', '0',       # High quality audio
            '-map', 'a',       # Extract only audio
            '-y',              # Overwrite output file if it exists
            output_path        # Output file
        ]
        
        # Run the command
        subprocess.run(command, check=True, capture_output=True)
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr.decode() if e.stderr else 'Unknown error'}")
        return False
    except Exception as e:
        print(f"Error extracting audio: {str(e)}")
        return False