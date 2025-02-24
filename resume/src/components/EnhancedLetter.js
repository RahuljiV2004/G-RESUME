// src/components/EnhancedLetter.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EnhancedLetter.css';

const EnhancedLetter = () => {
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchCoverLetter = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/get-cover-letter/');
        setCoverLetter(response.data.cover_letter);
      } catch (error) {
        console.error('Error fetching cover letter:', error);
      }
    };

    fetchCoverLetter();
  }, []);

  return (
    <section className="cover-letter-page">
      <h2>Generated Cover Letter</h2>
      <pre>{coverLetter}</pre>
      <button onClick={() => window.print()} className="download-button">
        Download as PDF
      </button>
    </section>
  );
};

export default EnhancedLetter;
