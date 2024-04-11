import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoginPage.css';

function LoginPage({ }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigate function


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3002/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username, password}),
        credentials: 'include',
      });
      const data = await response.json();
      if(data.message==='Login successful'){
        //onLogin(data.user);
        if(data.user.role==='Admin') navigate('/admin-dashboard');
        else if (data.user.role==='Employee') navigate ('/employee-dashboard');
        else navigate('/manager-dashboard');
      }
      else {
        setError('Login failed: ',data.message);
      }
    } catch (error) {
      setError('Failed to login. Please try again.');
    }
  };

  const navigateToRegister=()=>{
    navigate('/register');
  };
  const goToHome = () => {
    navigate('/'); // Navigate to the homepage
  };

  return (
    <div className="login-page">
      <div className="login-header">
      <div className='header-content'>
        <h1>TechSolutions Inc.</h1>
        <nav>
        <button onClick={goToHome} className="go-home-button">Go to Homepage</button> {/* Button for going to homepage */}

          <a href="/about">About</a>
          <a href="/help">Help</a>
        </nav>
        </div>
      </div>
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
    <div className="register-container">
        <button onClick={navigateToRegister}>Register New Admin</button>
      </div>
    <footer className="login-footer">
        <p>&copy; {new Date().getFullYear()} TechSolutions Inc. All rights reserved.</p>
      </footer>
    </div>
    
  );
}

export default LoginPage;
