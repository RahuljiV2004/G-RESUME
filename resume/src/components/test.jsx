// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";

// const MockInterview = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isRecording, setIsRecording] = useState(false);
//   const [videoBlob, setVideoBlob] = useState(null);
//   const [isInterviewStarted, setIsInterviewStarted] = useState(false);
//   const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
//   const [responseStatus, setResponseStatus] = useState("");
//   const [analysisResults, setAnalysisResults] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
  
//   const mediaRecorderRef = useRef(null);
//   const videoStreamRef = useRef(null);
//   const chunksRef = useRef([]);

//   // Sample interview questions
//   const questions = [
//     "Tell me about yourself and your background.",
//     "What are your greatest strengths and weaknesses?",
//     "Why are you interested in this position?",
//     "Describe a challenging situation you faced and how you resolved it.",
//     "Do you have any questions for us?"
//   ];

//   useEffect(() => {
//     // Clean up when component unmounts
//     return () => {
//       if (videoStreamRef.current) {
//         videoStreamRef.current.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   // Start the interview process
//   const startInterview = async () => {
//     setIsInterviewStarted(true);
//     setCurrentQuestionIndex(0);
//     setAnalysisResults(null);
//     await startRecording();
//   };

//   // Start recording for current question
//   const startRecording = async () => {
//     try {
//       // Clear previous chunks
//       chunksRef.current = [];
      
//       // Get media stream
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       videoStreamRef.current = stream;
//       mediaRecorderRef.current = new MediaRecorder(stream);
      
//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           chunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorderRef.current.onstop = async () => {
//         const blob = new Blob(chunksRef.current, { type: "video/webm" });
//         setVideoBlob(blob);
        
//         // Upload the video for the current question
//         await uploadVideo(blob, currentQuestionIndex);
//       };

//       mediaRecorderRef.current.start(1000); // Collect data every second
//       setIsRecording(true);
//     } catch (error) {
//       console.error("Error accessing media devices.", error);
//       setResponseStatus("Error: Could not access camera or microphone");
//     }
//   };

//   // Stop the current recording
//   const stopRecording = () => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   // Upload the recorded video to the backend with question info
//   const uploadVideo = async (blob, questionIndex) => {
//     const formData = new FormData();
    
//     // Create a file with a unique name
//     const videoFile = new File([blob], `question_${questionIndex + 1}_${Date.now()}.webm`, {
//       type: "video/webm"
//     });
    
//     formData.append("file", videoFile);
//     formData.append("question", questions[questionIndex]);

//     setResponseStatus("Uploading and analyzing response...");
//     setIsLoading(true);
    
//     try {
//       const response = await axios.post("http://127.0.0.1:8000/video/upload/", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
      
//       setAnalysisResults(response.data);
//       setResponseStatus(`Response analyzed successfully`);
//     } catch (error) {
//       console.error("Error uploading video", error);
//       setResponseStatus("Error analyzing response");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle moving to the next question
//   const handleNextQuestion = async () => {
//     // Stop current recording first
//     await stopRecording();
    
//     // Check if we've completed all questions
//     if (currentQuestionIndex === questions.length - 1) {
//       setIsInterviewCompleted(true);
//       setIsInterviewStarted(false);
//       if (videoStreamRef.current) {
//         videoStreamRef.current.getTracks().forEach(track => track.stop());
//       }
//     } else {
//       // Move to next question and start recording again
//       setCurrentQuestionIndex(prevIndex => prevIndex + 1);
//       setAnalysisResults(null); // Clear previous analysis
//       setTimeout(() => {
//         startRecording();
//       }, 1000); // Small delay to ensure previous recording is fully stopped
//     }
//   };

//   // Reset the interview to start over
//   const resetInterview = () => {
//     setIsInterviewStarted(false);
//     setIsInterviewCompleted(false);
//     setCurrentQuestionIndex(0);
//     setVideoBlob(null);
//     setResponseStatus("");
//     setAnalysisResults(null);
//   };

//   // Render the analysis results in a formatted way
//   const renderAnalysisResults = () => {
//     if (!analysisResults) return null;
    
//     return (
//       <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
//         <h3 className="text-lg font-semibold mb-3">Speech Analysis:</h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="p-3 bg-white rounded shadow">
//             <h4 className="font-medium text-gray-700">Transcription</h4>
//             <p className="mt-2 text-gray-600">{analysisResults.transcription}</p>
//           </div>
          
//           <div className="p-3 bg-white rounded shadow">
//             <h4 className="font-medium text-gray-700">Speech Metrics</h4>
//             <ul className="mt-2 space-y-1">
//               <li className="flex justify-between">
//                 <span className="text-gray-600">Word Count:</span>
//                 <span className="font-medium">{analysisResults.word_count}</span>
//               </li>
//               <li className="flex justify-between">
//                 <span className="text-gray-600">Speaking Rate:</span>
//                 <span className="font-medium">{analysisResults.speech_rate_wpm} WPM</span>
//               </li>
//               <li className="flex justify-between">
//                 <span className="text-gray-600">Filler Words:</span>
//                 <span className="font-medium">{analysisResults.filler_words_count}</span>
//               </li>
//               <li className="flex justify-between">
//                 <span className="text-gray-600">Audio Quality (SNR):</span>
//                 <span className="font-medium">{analysisResults.snr} dB</span>
//               </li>
//             </ul>
//           </div>
//         </div>
        
//         <div className="mt-4 p-3 bg-white rounded shadow">
//           <h4 className="font-medium text-gray-700">AI Feedback</h4>
//           <div className="mt-2 text-gray-600 whitespace-pre-line">
//             {analysisResults.answer_feedback}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-6 text-center">AI-Powered Mock Interview System</h1>
      
//       {!isInterviewStarted && !isInterviewCompleted && (
//         <div className="text-center mb-8">
//           <p className="mb-4">This interview consists of {questions.length} questions. Your responses will be recorded and analyzed.</p>
//           <button 
//             onClick={startInterview}
//             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//           >
//             Start Interview
//           </button>
//         </div>
//       )}

//       {isInterviewStarted && (
//         <div className="mb-8">
//           <div className="mb-4 p-4 bg-gray-100 rounded-lg">
//             <h2 className="text-lg font-semibold mb-2">Question {currentQuestionIndex + 1} of {questions.length}</h2>
//             <p className="text-gray-800">{questions[currentQuestionIndex]}</p>
//           </div>
          
//           <div className="flex justify-between items-center mb-4">
//             {isRecording ? (
//               <div className="flex items-center">
//                 <span className="w-3 h-3 bg-red-600 rounded-full inline-block mr-2 animate-pulse"></span>
//                 <span>Recording...</span>
//               </div>
//             ) : (
//               <span>Recording paused</span>
//             )}
            
//             <button 
//               onClick={handleNextQuestion}
//               className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <span>Processing...</span>
//               ) : (
//                 currentQuestionIndex === questions.length - 1 ? "Finish Interview" : "Next Question"
//               )}
//             </button>
//           </div>
          
//           {responseStatus && (
//             <div className="text-sm text-gray-600 italic">{responseStatus}</div>
//           )}
//         </div>
//       )}

//       {isInterviewCompleted && (
//         <div className="text-center">
//           <h2 className="text-xl font-bold mb-4">Interview Completed</h2>
//           <p className="mb-6">Thank you for completing the mock interview. All your responses have been recorded and analyzed.</p>
//           <button 
//             onClick={resetInterview}
//             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//           >
//             Start New Interview
//           </button>
//         </div>
//       )}

//       <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {videoBlob && isInterviewStarted && (
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Video Preview:</h3>
//             <video controls className="w-full rounded">
//               <source src={URL.createObjectURL(videoBlob)} type="video/webm" />
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         )}
        
//         {analysisResults && isInterviewStarted && (
//           <div className="lg:col-span-2">
//             {renderAnalysisResults()}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MockInterview;

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const MockInterview = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlobs, setVideoBlobs] = useState([]);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [responseStatus, setResponseStatus] = useState("");
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingAllResponses, setProcessingAllResponses] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const videoStreamRef = useRef(null);
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
    setVideoBlobs([]);
    await startRecording();
  };

  // Start recording for current question
  const startRecording = async () => {
    try {
      // Clear previous chunks
      chunksRef.current = [];
      
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoStreamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoBlobs(prevBlobs => {
          const newBlobs = [...prevBlobs];
          newBlobs[currentQuestionIndex] = blob;
          return newBlobs;
        });
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process all videos at once at the end of the interview
  const processAllResponses = async () => {
    setProcessingAllResponses(true);
    setResponseStatus("Processing all your responses...");
    
    try {
      const results = [];
      
      for (let i = 0; i < videoBlobs.length; i++) {
        const blob = videoBlobs[i];
        if (!blob) continue;
        
        const formData = new FormData();
        
        // Create a file with a unique name
        const videoFile = new File([blob], `question_${i + 1}_${Date.now()}.webm`, {
          type: "video/webm"
        });
        
        formData.append("file", videoFile);
        formData.append("question", questions[i]);
        
        setResponseStatus(`Analyzing response ${i + 1} of ${videoBlobs.length}...`);
        
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
    // Stop current recording first
    await stopRecording();
    
    // Check if we've completed all questions
    if (currentQuestionIndex === questions.length - 1) {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
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
    setIsInterviewStarted(false);
    setIsInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setVideoBlobs([]);
    setResponseStatus("");
    setAnalysisResults([]);
  };

  // Render an individual analysis result
  const renderSingleAnalysisResult = (result, index) => {
    if (!result || !result.data || result.data.error) {
      return (
        <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
          <h3 className="text-lg font-semibold mb-3">Question {index + 1}: {result.question}</h3>
          <p className="text-red-600">Failed to analyze this response.</p>
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