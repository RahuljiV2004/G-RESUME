// import React from 'react';
// import Navbar from './components/Navbar';
// import HeroSection from './components/HeroSection';
// import './index.css';

// function App() {
//   return (
//     <div className="App">
//       <Navbar />
//       <HeroSection />
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/HeroSection'
// import Interview from './components/interview';
// import Test from './components/test';
import MockInterview from './components/test';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
      <Route path="/" element={<Hero/>} />
        <Route path="/templates" element={<h1>Resume Templates Page</h1>} />
        <Route path="/examples" element={<h1>Resume Examples Page</h1>} />
        <Route path="/cover-letter" element={<h1>Cover Letter Page</h1>} />
        <Route path="/resources" element={<h1>Resources Page</h1>} />
        <Route path="/faq" element={<h1>FAQ Page</h1>} />
        <Route path="/account" element={<h1>My Account Page</h1>} />
        <Route path="/build" element={<h1>Build My Resume Page</h1>} />
        <Route path='/mock-interview' element={<MockInterview/>}/>
        {/* <Route path="/mock-interview" element={<Interview/>} /> */}
      </Routes>
    </Router>
  );
};

export default App;

