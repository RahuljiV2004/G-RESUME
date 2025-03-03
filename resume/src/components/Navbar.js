import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">G Resume</div>
      <ul className="nav-links">
        <li><Link to="/mock-interview ">Mock Interview</Link></li>
        <li><Link to="/examples">Resume Examples</Link></li>
        <li><Link to="/cover-letter">Cover Letter</Link></li>
        <li><Link to="/resources">Resources</Link></li>
        <li><Link to="/faq">FAQ</Link></li>
        <li><Link to="/account" className="account-link">My Account</Link></li>
        <li><Link to="/build"><button className="resume-button">Build my resume</button></Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
