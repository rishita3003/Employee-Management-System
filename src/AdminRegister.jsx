import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminRegister.css';

function AdminRegister({ onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigate for redirection after form submission


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await fetch('http://localhost:3002/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) { // Check if the response status is OK (status code 200-299)
        // If you're expecting any data back, uncomment the next line:
        // const data = await response.json();
        alert('User created successfully');
        navigate('/'); // Redirect to the login page
      } else {
        const data = await response.json(); // Only parse the JSON if the response wasn't ok
        setError(data.message || 'Failed to register. Please try again.');
      }
    } catch (error) {
      setError('Failed to register. Please check your connection and try again.');
    }
  };

  const goToLogin=()=>{
    navigate('/login');
  }

  return (
    <div className="admin-registration-page">
        <div className="reg-top-bar">
            <button onClick={goToLogin} style={{float: 'right', marginRight: '10px', marginTop: '10px'}}>Go to Login</button>
        </div>
      <div className="welcome-message">
        <h2>Welcome to Admin Registration</h2>
        <p>*Please fill in the details to create an admin account.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          placeholder='Enter your full name'
          onChange={handleChange}
          required
        />

        <label htmlFor="username">Username:</label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          placeholder='Enter a username'
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          placeholder='Enter a password'
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder='Enter your email address'
          value={formData.email}
          onChange={handleChange}
          required
        />

        <button type="submit">Register</button>

        {error && <p className="error">{error}</p>}
      </form>
      <div className="support-info">
    Need help? Contact <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>
  </div>
    </div>
  );
}

export default AdminRegister;
