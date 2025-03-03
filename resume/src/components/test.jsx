import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const MockInterview = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlobs, setVideoBlobs] = useState({});  // Changed to object with question index as key
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [responseStatus, setResponseStatus] = useState("");
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingAllResponses, setProcessingAllResponses] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const videoStreamRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const chunksRef = useRef([]);

  // Sample interview questions
  const questions = [
    "Tell me about yourself and your background.",
    "What are your greatest strengths and weaknesses?",
    "Why are you interested in this position?",
    "Describe a challenging situation you faced and how you resolved it.",
    "Do you have any questions for us?"
  ];

  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start the interview process
  const startInterview = async () => {
    setIsInterviewStarted(true);
    setCurrentQuestionIndex(0);
    setAnalysisResults([]);
    setVideoBlobs({});  // Initialize as empty object
    await startRecording();
  };

  // Start recording for current question
  const startRecording = async () => {
    try {
      // Stop any existing recording first
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      
      // Clear previous chunks
      chunksRef.current = [];
      
      // Get media stream
      if (!videoStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        videoStreamRef.current = stream;
        
        // Set the stream to the video preview element
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
      }

      mediaRecorderRef.current = new MediaRecorder(videoStreamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        // Store each blob with the question index as key to ensure proper pairing
        setVideoBlobs(prevBlobs => ({
          ...prevBlobs,
          [currentQuestionIndex]: blob
        }));
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing media devices.", error);
      setResponseStatus("Error: Could not access camera or microphone");
    }
  };

  // Stop the current recording
  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        // Save the current question index to use in the onstop handler
        const questionIndex = currentQuestionIndex;
        
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          // Use the saved question index to ensure we're saving to the right key
          setVideoBlobs(prevBlobs => ({
            ...prevBlobs,
            [questionIndex]: blob
          }));
          setIsRecording(false);
          resolve();
        };
        mediaRecorderRef.current.stop();
      } else {
        setIsRecording(false);
        resolve();
      }
    });
  };

  // Process all videos at once at the end of the interview
  const processAllResponses = async () => {
    // Add a small delay to ensure the last video blob is fully saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProcessingAllResponses(true);
    setResponseStatus("Processing all your responses...");
    
    try {
      const results = [];
      
      // Process each question
      for (let i = 0; i < questions.length; i++) {
        const blob = videoBlobs[i];
        
        if (!blob) {
          console.warn(`No recording found for question ${i + 1}`);
          results.push({
            questionIndex: i,
            question: questions[i],
            data: { 
              error: true, 
              message: "No recording found for this question" 
            }
          });
          continue;
        }
        
        const formData = new FormData();
        
        // Create a file with a unique name including the question index
        const videoFile = new File([blob], `question_${i + 1}_${Date.now()}.webm`, {
          type: "video/webm"
        });
        
        formData.append("file", videoFile);
        formData.append("question", questions[i]);
        
        setResponseStatus(`Analyzing response ${i + 1} of ${questions.length}...`);
        
        try {
          const response = await axios.post("http://127.0.0.1:8000/video/upload/", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          
          results.push({
            questionIndex: i,
            question: questions[i],
            data: response.data
          });
        } catch (error) {
          console.error(`Error processing response ${i + 1}`, error);
          results.push({
            questionIndex: i,
            question: questions[i],
            data: { 
              error: true, 
              message: "Failed to analyze this response" 
            }
          });
        }
      }
      
      setAnalysisResults(results);
      setResponseStatus("All responses analyzed successfully");
    } catch (error) {
      console.error("Error processing videos", error);
      setResponseStatus("Error processing responses");
    } finally {
      setProcessingAllResponses(false);
    }
  };

  // Handle moving to the next question
  const handleNextQuestion = async () => {
    // Stop current recording first and ensure it's saved
    await stopRecording();
    
    // Check if we've completed all questions
    if (currentQuestionIndex === questions.length - 1) {
      // We need to ensure the final recording is saved before processing
      // Add a small delay to ensure the blob is properly saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
      setIsInterviewCompleted(true);
      setIsInterviewStarted(false);
      
      // Process all responses at once
      await processAllResponses();
    } else {
      // Move to next question and start recording again
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setTimeout(() => {
        startRecording();
      }, 1000); // Small delay to ensure previous recording is fully stopped
    }
  };

  // Reset the interview to start over
  const resetInterview = () => {
    // Stop any ongoing recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    // Clean up video stream if it exists
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    
    setIsInterviewStarted(false);
    setIsInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setVideoBlobs({});
    setResponseStatus("");
    setAnalysisResults([]);
    setIsRecording(false);
  };

  // Debug function to check what video blobs we have
  const checkVideoBlobs = () => {
    console.log("Current video blobs:", videoBlobs);
    console.log("Number of blobs:", Object.keys(videoBlobs).length);
    Object.keys(videoBlobs).forEach(key => {
      console.log(`Question ${key}: ${videoBlobs[key].size} bytes`);
    });
  };

  // Render an individual analysis result
  const renderSingleAnalysisResult = (result, index) => {
    if (!result || !result.data || result.data.error) {
      return (
        <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
          <h3 className="text-lg font-semibold mb-3">Question {index + 1}: {result.question}</h3>
          <p className="text-red-600">{result.data?.message || "Failed to analyze this response."}</p>
        </div>
      );
    }
    
    const analysis = result.data;
    
    return (
      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-3">Question {index + 1}: {result.question}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded shadow">
            <h4 className="font-medium text-gray-700">Transcription</h4>
            <p className="mt-2 text-gray-600">{analysis.transcription}</p>
          </div>
          
          <div className="p-3 bg-white rounded shadow">
            <h4 className="font-medium text-gray-700">Speech Metrics</h4>
            <ul className="mt-2 space-y-1">
              <li className="flex justify-between">
                <span className="text-gray-600">Word Count:</span>
                <span className="font-medium">{analysis.word_count}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Speaking Rate:</span>
                <span className="font-medium">{analysis.speech_rate_wpm} WPM</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Filler Words:</span>
                <span className="font-medium">{analysis.filler_words_count}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Audio Quality (SNR):</span>
                <span className="font-medium">{analysis.snr} dB</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded shadow">
          <h4 className="font-medium text-gray-700">AI Feedback</h4>
          <div className="mt-2 text-gray-600 whitespace-pre-line">
            {analysis.answer_feedback}
          </div>
        </div>
        
        {videoBlobs[result.questionIndex] && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Video Recording</h4>
            <video controls className="w-full rounded">
              <source src={URL.createObjectURL(videoBlobs[result.questionIndex])} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    );
  };

  // Render all analysis results together
  const renderAllAnalysisResults = () => {
    if (!analysisResults.length) return null;
    
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Interview Analysis Results</h2>
        {/* Debug button - add for debugging only */}
        <button onClick={checkVideoBlobs} className="mb-4 text-xs bg-gray-200 p-1 rounded">
          Debug: Check Video Blobs
        </button>
        {analysisResults.map((result, index) => renderSingleAnalysisResult(result, index))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">AI-Powered Mock Interview System</h1>
      
      {!isInterviewStarted && !isInterviewCompleted && (
        <div className="text-center mb-8">
          <p className="mb-4">This interview consists of {questions.length} questions. Your responses will be recorded and analyzed at the end of the interview.</p>
          <button 
            onClick={startInterview}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Interview
          </button>
        </div>
      )}

      {isInterviewStarted && (
        <div className="mb-8">
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Question {currentQuestionIndex + 1} of {questions.length}</h2>
            <p className="text-gray-800">{questions[currentQuestionIndex]}</p>
          </div>
          
          {/* Video preview component */}
          <div className="mb-4">
            <video 
              ref={videoPreviewRef} 
              className="w-full rounded-lg border border-gray-300 shadow-sm bg-black" 
              autoPlay 
              muted
              playsInline 
              style={{ maxHeight: "360px" }}
            />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            {isRecording ? (
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-600 rounded-full inline-block mr-2 animate-pulse"></span>
                <span>Recording...</span>
              </div>
            ) : (
              <span>Recording paused</span>
            )}
            
            <button 
              onClick={handleNextQuestion}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={isLoading}
            >
              {currentQuestionIndex === questions.length - 1 ? "Finish Interview" : "Next Question"}
            </button>
          </div>
        </div>
      )}

      {isInterviewCompleted && (
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-4">Interview Completed</h2>
          {processingAllResponses ? (
            <div className="mb-6">
              <p className="mb-2">{responseStatus}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full animate-pulse" 
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-6">Thank you for completing the mock interview. Your responses have been analyzed.</p>
              <button 
                onClick={resetInterview}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Start New Interview
              </button>
            </>
          )}
        </div>
      )}

      {isInterviewCompleted && !processingAllResponses && renderAllAnalysisResults()}
    </div>
  );
};

export default MockInterview;