# utils/rs.py
import cv2
import numpy as np
from scipy.spatial import distance
import mediapipe as mp
import time
import random  # For demo purposes only

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def analyze_video(video_path):
    """
    Analyzes interview video for non-verbal cues:
    - Confidence level (based on facial expressions and stability)
    - Posture analysis
    - Eye contact
    
    Returns a dictionary with analysis results
    """
    print(f"Starting video analysis for {video_path}")
    
    try:
        # Open the video file
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error: Could not open video {video_path}")
            return default_metrics()
            
        # Video metadata
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = frame_count / fps if fps > 0 else 0
        
        print(f"Video stats: {frame_count} frames, {fps} FPS, {duration:.2f} seconds")
        
        if frame_count == 0:
            print("Error: Video has no frames")
            return default_metrics()
            
        # Analysis variables
        frames_processed = 0
        face_detected_frames = 0
        eye_contact_frames = 0
        smile_frames = 0
        head_movement = []
        
        # Process frames at regular intervals
        frame_interval = max(1, int(fps / 2))  # Process 2 frames per second
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Only process certain frames to improve performance
            if frames_processed % frame_interval == 0:
                # Convert to RGB for MediaPipe
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = face_mesh.process(rgb_frame)
                
                if results.multi_face_landmarks:
                    face_detected_frames += 1
                    landmarks = results.multi_face_landmarks[0]
                    
                    # Track head position (using nose tip landmark #1)
                    nose_tip = landmarks.landmark[1]
                    head_pos = (nose_tip.x, nose_tip.y)
                    head_movement.append(head_pos)
                    
                    # Check for eye contact (approximation)
                    left_eye = landmarks.landmark[362]  # Left eye corner
                    right_eye = landmarks.landmark[263]  # Right eye corner
                    
                    # Simple heuristic: if eyes are relatively horizontal, consider it eye contact
                    eye_y_diff = abs(left_eye.y - right_eye.y)
                    if eye_y_diff < 0.03:  # Threshold for "looking straight"
                        eye_contact_frames += 1
                    
                    # Check for smile (approximation using mouth landmarks)
                    left_mouth = landmarks.landmark[61]  # Left mouth corner
                    right_mouth = landmarks.landmark[291]  # Right mouth corner
                    mouth_height = landmarks.landmark[14].y - landmarks.landmark[13].y
                    
                    # If mouth corners are higher than neutral and mouth is open
                    if mouth_height > 0.01:
                        smile_frames += 1
            
            frames_processed += 1
        
        cap.release()
        
        # No face detected in any frame
        if face_detected_frames == 0:
            print("No face detected in video")
            return default_metrics()
        
        # Calculate metrics
        face_detection_rate = face_detected_frames / (frames_processed / frame_interval)
        eye_contact_rate = eye_contact_frames / face_detected_frames if face_detected_frames > 0 else 0
        smile_rate = smile_frames / face_detected_frames if face_detected_frames > 0 else 0
        
        # Calculate head movement stability
        head_stability = 0
        if len(head_movement) > 1:
            movements = [distance.euclidean(head_movement[i], head_movement[i+1]) 
                         for i in range(len(head_movement)-1)]
            head_stability = 1 - min(1, sum(movements) / len(movements) * 10)
        
        # Calculate confidence score (weighted combination of metrics)
        confidence_score = (
            0.3 * face_detection_rate + 
            0.3 * eye_contact_rate + 
            0.2 * smile_rate + 
            0.2 * head_stability
        )
        
        # Format the results
        metrics = {
            "confidence_level": f"{confidence_score:.2f}",
            "posture": f"{head_stability:.2f}",
            "smile_rate": f"{smile_rate:.2f}",
            "face_detection_rate": f"{face_detection_rate:.2f}"
        }
        
        print(f"Video analysis complete. Metrics: {metrics}")
        return metrics
        
    except Exception as e:
        print(f"Error in video analysis: {str(e)}")
        return default_metrics()

def default_metrics():
    """Return default metrics when analysis fails"""
    return {
        "confidence_level": "0.00",
        "posture": "0.00",
        "smile_rate": "0.00",
        "face_detection_rate": "0.00"
    }