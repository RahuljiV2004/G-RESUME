import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './MockInterview.css';

// Define the API base URL - adjust this to match your FastAPI server
const API_BASE_URL = 'http://localhost:8000'; // FastAPI typically runs on port 8000

const MockInterview = () => {
  // Interview states
  const [isStarted, setIsStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // Webcam and recording references
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  // Sample interview questions - replace with your actual questions
  const questions = [
    "Tell me about yourself and your experience.",
    "What are your strengths and weaknesses?",
    "Describe a challenging situation you faced at work and how you handled it.",
    "Why do you want to work for our company?",
    "Where do you see yourself in 5 years?"
  ];

  // Initialize webcam
  const setupWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Error accessing webcam: " + err.message);
      console.error("Error accessing webcam:", err);
    }
  };

  // Start the interview
  const startInterview = async () => {
    await setupWebcam();
    setIsStarted(true);
    startRecording();
  };

  // Start recording from webcam
  const startRecording = () => {
    chunksRef.current = [];
    
    if (streamRef.current) {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Stop the current recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle when recording stops
  const handleRecordingStop = async () => {
    const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
    await uploadVideo(videoBlob, questions[currentQuestionIndex]);
  };

  // Upload the video to the backend
  const uploadVideo = async (blob, question) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      const filename = `question_${currentQuestionIndex + 1}.webm`;
      formData.append('file', blob, filename);
      formData.append('question', question);

      // Use the correct API URL with the API_BASE_URL
      const response = await axios.post(`${API_BASE_URL}/video/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Add results to our results array
      setResults(prevResults => [...prevResults, response.data]);
      setLoading(false);
    } catch (err) {
      console.error("Error uploading video:", err);
      
      // Display more detailed error information
      const errorMessage = err.response 
        ? `Error (${err.response.status}): ${err.response.data.detail || err.message}`
        : `Network error: ${err.message}`;
      
      setError(errorMessage);
      setLoading(false);
      
      // For development: continue to next question even if there's an error
      // Remove this in production
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          startRecording();
        }, 1000);
      } else {
        finishInterview();
      }
    }
  };

  // Move to the next question or finish interview
  const handleNextQuestion = () => {
    stopRecording();
    
    // Wait brief moment for recording to fully stop and upload to complete
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        startRecording();
      } else {
        finishInterview();
      }
    }, 500);
  };

  // End the interview and clean up
  const finishInterview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setInterviewFinished(true);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Render the interview results
  const renderResults = () => {
    return (
      <div className="results-container">
        <h2>Interview Results</h2>
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="result-card">
              <h3>Question {index + 1}: {questions[index]}</h3>
              <div className="result-details">
                <p><strong>Transcription:</strong> {result.transcription}</p>
                <p><strong>Signal-to-Noise Ratio:</strong> {result.snr} dB</p>
                <p><strong>Word Count:</strong> {result.word_count}</p>
                <p><strong>Speech Rate:</strong> {result.speech_rate_wpm} WPM</p>
                <p><strong>Filler Words:</strong> {result.filler_words_count}</p>
                <div className="feedback-section">
                  <h4>Feedback</h4>
                  <pre>{result.answer_feedback}</pre>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No results available. This could be due to connection issues with the API.</p>
            <p>Please check that your FastAPI server is running at: {API_BASE_URL}</p>
          </div>
        )}
        <button className="restart-btn" onClick={() => window.location.reload()}>
          Start New Interview
        </button>
      </div>
    );
  };

  // Show API connection status
  const renderApiStatus = () => {
    return (
      <div className="api-status">
        <p>API connection: <span className={error ? "status-error" : "status-ok"}>
          {error ? "Error" : "Waiting for first submission"}
        </span></p>
        <p className="api-url">Endpoint: {API_BASE_URL}/video/upload/</p>
      </div>
    );
  };

  // Render the interview interface
  const renderInterview = () => {
    return (
      <div className="interview-container">
        {renderApiStatus()}
        
        <div className="question-container">
          <h2>Question {currentQuestionIndex + 1}/{questions.length}</h2>
          <p className="question">{questions[currentQuestionIndex]}</p>
        </div>
        
        <div className="video-container">
          <video 
            ref={videoRef} 
            autoPlay 
            muted={false} 
            playsInline 
            className="webcam-video"
          />
          {isRecording && (
            <div className="recording-indicator">
              <span className="recording-dot"></span> Recording
            </div>
          )}
        </div>
        
        <div className="controls">
          <button 
            className="next-btn" 
            onClick={handleNextQuestion}
            disabled={loading}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
          </button>
          
          {loading && <p className="loading-text">Processing your answer...</p>}
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <p className="error-help">Check that your FastAPI server is running and CORS is enabled.</p>
          </div>
        )}
      </div>
    );
  };

  // Render the welcome screen
  const renderWelcomeScreen = () => {
    return (
      <div className="welcome-container">
        <h1>Mock Interview Simulator</h1>
        <p>
          This simulator will ask you {questions.length} interview questions.
          Your responses will be recorded and analyzed for feedback.
        </p>
        <p>Please ensure your webcam and microphone are working before starting.</p>
        <div className="api-config">
          <p>API Server: {API_BASE_URL}</p>
          <p className="api-instructions">
            Make sure your FastAPI server is running on this address before starting.
          </p>
        </div>
        <button className="start-btn" onClick={startInterview}>
          Start Interview
        </button>
      </div>
    );
  };

  return (
    <div className="mock-interview-app">
      {!isStarted && renderWelcomeScreen()}
      {isStarted && !interviewFinished && renderInterview()}
      {interviewFinished && renderResults()}
    </div>
  );
};

export default MockInterview;