import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Ensure you have a corresponding CSS file
import logo from './techsol_logo.jpg'; // Ensure you have the logo image in the same folder

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login'); // Assuming '/login' is the route for the login page
  };

  return (
    <div className="homepage">
      <header className="homepage-header">
      <img src={logo} alt="TechSolutions Logo" className="logo"  />
      <h1>TechSolutions Inc.</h1>
        <nav className="main-nav">
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><button onClick={handleLoginRedirect} className="login-button">Employee Login</button></li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Welcome to TechSolutions</h1>
          <p>Your partner in innovative IT solutions.</p>
        </section>

        <section id="services" className="services">
          <h2>Our Services</h2>
          <div className="services-list">
            <article>
              <h3>Cloud Solutions</h3>
              <p>Maximize efficiency with our cloud computing services.</p>
            </article>
            <article>
              <h3>Software Development</h3>
              <p>Custom software solutions tailored to your needs.</p>
            </article>
            <article>
              <h3>IT Consulting</h3>
              <p>Expert advice to optimize your IT strategies.</p>
            </article>
          </div>
        </section>

        <section id="about" className="about">
          <h2>About Us</h2>
          <p>TechSolutions has been providing cutting-edge IT solutions since 200X, helping businesses thrive in the digital era.</p>
        </section>

        <section id="contact" className="contact">
          <h2>Contact Us</h2>
          <p>Ready to start your next project? Reach out to our team.</p>
          <a href="mailto:contact@techsolutions.com" className="email-link">contact@techsolutions.com</a>
        </section>
      </main>

      <footer className="homepage-footer">
        <p>&copy; {new Date().getFullYear()} TechSolutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
