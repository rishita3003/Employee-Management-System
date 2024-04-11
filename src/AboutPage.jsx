import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css'; // Create an AboutPage.css file for styling

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <header className="about-header">
        <h1>About TechSolutions Inc.</h1>
      </header>
      <main className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            At TechSolutions Inc., our mission is to empower businesses through innovative technology solutions that streamline processes, enhance productivity, and drive growth.
          </p>
        </section>
        <section className="about-section">
          <h2>What We Do</h2>
          <p>
            We specialize in providing end-to-end IT services, from system integration to data management and cybersecurity. Our team of experts works diligently to ensure your business is equipped with cutting-edge technology.
          </p>
        </section>
        <section className="about-section">
          <h2>Our History</h2>
          <p>
            Founded in 2008, TechSolutions Inc. has spent over a decade refining our services and expanding our reach. Today, we're proud to be a leader in the IT services industry.
          </p>
        </section>
        <button onClick={() => navigate('/login')}>Go to Login</button>
        <button onClick={() => navigate('/')}>Go Back to Home</button>
      </main>
      <footer className="about-footer">
        <p>&copy; {new Date().getFullYear()} TechSolutions Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutPage;
