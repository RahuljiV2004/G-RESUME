

// import React, { useState } from 'react';
// import './HeroSection.css';
// import bookingLogo from './images/booking-logo.webp';
// import appleLogo from './images/download.png';
// import dhlLogo from './images/download1.jpeg';
// import amazonLogo from './images/bny.png';
// import amexLogo from './images/unnamed.webp';
// import axios from 'axios';

// const HeroSection = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [jobDescription, setJobDescription] = useState('');
//   const [coverLetter, setCoverLetter] = useState('');
//   const [enhancedResume, setEnhancedResume] = useState('');
//   const [uploading, setUploading] = useState(false);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file && file.type === 'application/pdf') {
//       setSelectedFile(file);
//     } else {
//       alert('Please select a valid PDF file.');
//     }
//   };

//   const handleDescriptionChange = (event) => {
//     setJobDescription(event.target.value);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!selectedFile || !jobDescription) {
//       alert('Please select a file and enter a job description.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('resume_file', selectedFile);
//     formData.append('job_description', jobDescription);

//     setUploading(true);
//     try {
//       const response = await axios.post('http://127.0.0.1:8000/upload-resume/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       const resumeResponse = await axios.post('http://127.0.0.1:8000/generate-enhanced-resume/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (response.data) {
//         setCoverLetter(response.data.enhanced_letter || '');
//         setEnhancedResume(response.data.enhanced_resume || '');
//       } else {
//         alert('Failed to generate documents.');
//       }
//     } catch (error) {
//       console.error('Error uploading:', error);
//       alert('Failed to upload. Please try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <>
//       <section className="hero-section">
//         <div className="hero-content">
//           <h1>The Ultimate Career Builder</h1>
//           <p>Let's build you a resume that works.</p>
          
//           <div className="file-upload">
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={handleFileChange}
//               style={{ display: 'none' }}
//               id="fileInput"
//             />
//             <label htmlFor="fileInput" className="file-button">
//               {selectedFile ? selectedFile.name : 'Choose PDF File'}
//             </label>
//           </div>
          
//           <textarea
//             className="job-description"
//             placeholder="Enter job description here..."
//             value={jobDescription}
//             onChange={handleDescriptionChange}
//           />

//           <button className="cta-button" onClick={handleSubmit} disabled={uploading}>
//             {uploading ? 'Generating...' : 'Generate Cover Letter & Enhanced Resume'}
//           </button>
//         </div>
//         <div className="hero-image">
//           <img
//             src="https://img.freepik.com/free-vector/white-elegant-minimalist-cv-resume-with-blue_1435-1888.jpg"
//             alt="Resume Preview"
//           />
//         </div>
//       </section>

//       <section className="reviews-section">
//         <div className="companies">
//           <h3>Create your resume with us and open doors to your dream job!</h3>
//           <div className="logos">
//             <img src={amexLogo} alt="Amex" />
//             <img src={bookingLogo} alt="Booking" />
//             <img src={appleLogo} alt="Apple" />
//             <img src={dhlLogo} alt="DHL" />
//             <img src={amazonLogo} alt="Amazon" />
//           </div>
//         </div>
//         <div className="reviews">
//           <h2>Resume Building Made Smart and Simple at Shiv Nadar University !!!</h2>
//           <div className="review-cards">
//             <div className="review-card">
//               <p className="stars">★★★★★</p>
//               <h4>Landed My Dream Job!</h4>
//               <p>This resume builder is a game-changer!</p>
//               <span>Rohit RS • 1 day ago</span>
//             </div>
//             <div className="review-card">
//               <p className="stars">★★★★★</p>
//               <h4>Interview Calls in Days!</h4>
//               <p>Intuitive and impactful templates!</p>
//               <span>Rahulji V • 1 day ago</span>
//             </div>
//             <div className="review-card">
//               <p className="stars">★★★★☆</p>
//               <h4>From Zero to Hired!</h4>
//               <p>This builder made all the difference!</p>
//               <span>Tristan RP • 3 days ago</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {coverLetter && (
//         <section className="cover-letter-section">
//           <h2>Generated Cover Letter</h2>
//           <pre>{coverLetter}</pre>
//         </section>
//       )}

//       {enhancedResume && (
//         <section className="enhanced-resume-section">
//           <h2>Generated Enhanced Resume</h2>
//           <pre>{enhancedResume}</pre>
//         </section>
//       )}
//     </>
//   );
// };

// export default HeroSection;

import React, { useState } from 'react';
import './HeroSection.css';
import bookingLogo from './images/booking-logo.webp';
import appleLogo from './images/download.png';
import dhlLogo from './images/download1.jpeg';
import amazonLogo from './images/bny.png';
import amexLogo from './images/unnamed.webp';
import axios from 'axios';

const HeroSection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [enhancedResume, setEnhancedResume] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile || !jobDescription) {
      alert('Please select a file and enter a job description.');
      return;
    }

    const formData = new FormData();
    formData.append('resume_file', selectedFile);
    formData.append('job_description', jobDescription);

    setUploading(true);
    try {
      const uploadResponse = await axios.post('http://127.0.0.1:8000/upload-resume/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.data) {
        const resumeResponse = await axios.post('http://127.0.0.1:8000/generate-enhanced-resume/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (resumeResponse.data) {
          setCoverLetter(resumeResponse.data.enhanced_letter || '');
          setEnhancedResume(resumeResponse.data.enhanced_resume || '');
        } else {
          alert('Failed to generate documents.');
        }
      } else {
        alert('Failed to upload the file.');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h1>The Ultimate Career Builder</h1>
          <p>Let's build you a resume that works.</p>
          
          <div className="file-upload">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="fileInput"
            />
            <label htmlFor="fileInput" className="file-button">
              {selectedFile ? selectedFile.name : 'Choose PDF File'}
            </label>
          </div>
          
          <textarea
            className="job-description"
            placeholder="Enter job description here..."
            value={jobDescription}
            onChange={handleDescriptionChange}
          />

          <button className="cta-button" onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Generating...' : 'Generate Cover Letter & Enhanced Resume'}
          </button>
        </div>
        <div className="hero-image">
          <img
            src="https://img.freepik.com/free-vector/white-elegant-minimalist-cv-resume-with-blue_1435-1888.jpg"
            alt="Resume Preview"
          />
        </div>
      </section>

      <section className="reviews-section">
        <div className="companies">
          <h3>Create your resume with us and open doors to your dream job!</h3>
          <div className="logos">
            <img src={amexLogo} alt="Amex" />
            <img src={bookingLogo} alt="Booking" />
            <img src={appleLogo} alt="Apple" />
            <img src={dhlLogo} alt="DHL" />
            <img src={amazonLogo} alt="Amazon" />
          </div>
        </div>
        <div className="reviews">
          <h2>Resume Building Made Smart and Simple at Shiv Nadar University !!!</h2>
          <div className="review-cards">
            <div className="review-card">
              <p className="stars">★★★★★</p>
              <h4>Landed My Dream Job!</h4>
              <p>This resume builder is a game-changer!</p>
              <span>Rohit RS • 1 day ago</span>
            </div>
            <div className="review-card">
              <p className="stars">★★★★★</p>
              <h4>Interview Calls in Days!</h4>
              <p>Intuitive and impactful templates!</p>
              <span>Rahulji V • 1 day ago</span>
            </div>
            <div className="review-card">
              <p className="stars">★★★★☆</p>
              <h4>From Zero to Hired!</h4>
              <p>This builder made all the difference!</p>
              <span>Tristan RP • 3 days ago</span>
            </div>
          </div>
        </div>
      </section>

      {coverLetter && (
        <section className="cover-letter-section">
          <h2>Generated Cover Letter</h2>
          <pre>{coverLetter}</pre>
        </section>
      )}

      {enhancedResume && (
        <section className="enhanced-resume-section">
          <h2>Generated Enhanced Resume</h2>
          <pre>{enhancedResume}</pre>
        </section>
      )}
    </>
  );
};

export default HeroSection;
