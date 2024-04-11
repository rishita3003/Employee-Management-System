import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Assuming you have some global CSS
import App from './App'; // Path to your main App component
import reportWebVitals from './reportWebVitals'; // If you're using Create React App's setup


// Replace 'pk_test_YourPublishableKeyHere' with your actual publishable key from Stripe

ReactDOM.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you're using Create React App's setup
reportWebVitals();
