import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css'; // Create a HelpPage.css file for styling

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="help-page">
      <header className="help-header">
        <h1>Help & Support</h1>
      </header>
      <main className="help-content">
        <section className="help-section">
          <h2>Frequently Asked Questions</h2>
          <p>
            Find answers to common questions about our services, billing, and technical support on our FAQ page.
          </p>
          <button onClick={() => navigate('/faq')}>View FAQs</button>
        </section>
        <section className="help-section">
          <h2>Contact Support</h2>
          <p>
            Need further assistance? Our support team is here to help. Contact us via email, phone, or live chat.
          </p>
          <button onClick={() => navigate('/contact-support')}>Get Support</button>
        </section>
        <section className="help-section">
          <h2>Documentation</h2>
          <p>
            Browse through our extensive library of product manuals, how-to guides, and technical documents.
          </p>
          <button onClick={() => navigate('/documentation')}>View Documentation</button>
        </section>
        <button onClick={() => navigate('/login')}>Go to Login</button>
        <button onClick={() => navigate('/')}>Go Back to Home</button>
      </main>
      <footer className="help-footer">
        <p>&copy; {new Date().getFullYear()} TechSolutions Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HelpPage;
