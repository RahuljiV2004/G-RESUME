import cv2
import dlib
import numpy as np
from deepface import DeepFace
import mediapipe as mp
from imutils import face_utils
import os
import shutil

# Disable TensorFlow optimizations
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"




# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# # Construct the relative path to the shape_predictor_68_face_landmarks.dat file
# MODEL_PATH = os.path.join(BASE_DIR, "..", "..", "frontend", "backend", "shape_predictor_68_face_landmarks.dat")

# Normalize the path for Windows (replace single backslashes with double backslashes)
MODEL_PATH = "D:\\hackathon\\G\\frontend\\backend\\shape_predictor_68_face_landmarks.dat"
predictor = dlib.shape_predictor(MODEL_PATH)
# # Load Dlib's shape predictor model
# predictor = dlib.shape_predictor("C:\\G_Resume\\shape_predictor_68_face_landmarks.dat")
detector = dlib.get_frontal_face_detector()

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# Directory for storing frames
FRAME_DIR = "temp_frames"

def clear_previous_frames():
    """Removes all previously stored frames before processing a new video."""
    if os.path.exists(FRAME_DIR):
        shutil.rmtree(FRAME_DIR)  # Delete the folder with previous frames
    os.makedirs(FRAME_DIR)  # Create a fresh directory


def analyze_video(video_path):
    """Analyzes the given video for blink rate, gaze movement, facial emotions, and posture."""

    # Clear all previous frame data
    clear_previous_frames()

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        return {"error": "Could not open video file"}

    # Reset all variables before analyzing a new video
    frame_count = 0
    blink_count = 0
    gaze_movements = []
    confidence_scores = []
    slouch_count = 0
    excessive_movement = 0
    prev_shoulder_y = None
    prev_head_y = None

    # Landmark indices for eyes
    LEFT_EYE = list(range(42, 48))
    RIGHT_EYE = list(range(36, 42))

    def eye_aspect_ratio(eye):
        """Calculates the Eye Aspect Ratio (EAR) to detect blinks."""
        A = np.linalg.norm(eye[1] - eye[5])
        B = np.linalg.norm(eye[2] - eye[4])
        C = np.linalg.norm(eye[0] - eye[3])
        return (A + B) / (2.0 * C)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)

        for face in faces:
            shape = predictor(gray, face)
            shape = face_utils.shape_to_np(shape)

            # Extract eye landmarks
            left_eye = shape[LEFT_EYE]
            right_eye = shape[RIGHT_EYE]

            # Compute EAR to detect blinks
            ear_left = eye_aspect_ratio(left_eye)
            ear_right = eye_aspect_ratio(right_eye)
            ear_avg = (ear_left + ear_right) / 2.0

            # Count blinks (EAR threshold < 0.25)
            if ear_avg < 0.25:
                blink_count += 1

            # Compute gaze direction
            left_eye_center = np.mean(left_eye, axis=0)
            right_eye_center = np.mean(right_eye, axis=0)
            gaze_center = (left_eye_center + right_eye_center) / 2
            gaze_movements.append(gaze_center)

        # Face Emotion Analysis (every 10th frame)
        if frame_count % 10 == 0:
            try:
                frame_path = os.path.join(FRAME_DIR, f"frame_{frame_count}.jpg")
                cv2.imwrite(frame_path, frame)
                analysis = DeepFace.analyze(frame_path, actions=['emotion'], enforce_detection=False)
                dominant_emotion = analysis[0]['dominant_emotion']

                confidence_mapping = {
                    'happy': 1.0, 'neutral': 0.8, 'surprise': 0.6,
                    'sad': 0.3, 'fear': 0.2, 'angry': 0.1
                }

                confidence_score = confidence_mapping.get(dominant_emotion, 0.5)
                confidence_scores.append(confidence_score)
            except Exception as e:
                print(f"Emotion analysis error: {e}")

        # Posture Analysis
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark

            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            nose = landmarks[mp_pose.PoseLandmark.NOSE]

            avg_shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
            head_y = nose.y

            if prev_shoulder_y is not None:
                if avg_shoulder_y - prev_shoulder_y > 0.004:
                    slouch_count += 1
                if abs(head_y - prev_head_y) > 0.005:
                    excessive_movement += 1

            prev_shoulder_y = avg_shoulder_y
            prev_head_y = head_y

    cap.release()

    # Compute final metrics
    fps = 30  # Assume 30 FPS
    blink_rate = blink_count / (frame_count / fps) if frame_count > 0 else 0
    gaze_variance = np.mean(np.var(np.array(gaze_movements), axis=0)) if gaze_movements else 0
    face_avg_confidence = np.mean(confidence_scores) if confidence_scores else 0.5

    # Normalize Scores
    gaze_nervousness = min(np.log1p(gaze_variance) / np.log1p(20000), 1.0)
    blink_nervousness = min(np.log1p(blink_rate) / np.log1p(15), 1.0)
    gaze_final=(blink_nervousness*0.4)+(gaze_nervousness*0.6)
    face_nerv = 1 - face_avg_confidence

    # Posture Nervousness
    total_seconds = frame_count / fps
    slouch_score = min(slouch_count / total_seconds, 1.0)
    movement_score = min(excessive_movement / total_seconds, 1.0)
    pose_nervousness_score = (slouch_score * 0.6) + (movement_score * 0.4)

    # Final Nervousness Score
    final_nervousness = (pose_nervousness_score * 0.3) + \
                        (gaze_final * 0.3) + \
                        (face_nerv * 0.4)

    return {
        "pose_nervousness": round(pose_nervousness_score, 2),
        "gaze_nervousness": round(gaze_final, 2),
        "face_nervousness": round(face_nerv, 2),
        "final_nervousness": round(final_nervousness, 2)
    }







