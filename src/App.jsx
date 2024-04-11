import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AdminRegister from './AdminRegister';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import Calendar from './Calendar';
import HolidayPage from './HolidayPage';
import AboutPage from './AboutPage';
import HelpPage from './HelpPage';
import HomePage from './HomePage';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51P3ATzSIpn3KtDEecISw1AE0S5laPAhzMtDTVIZDuOgjajRCsp3i3d1VA0YtpCX59bzeYdu0lJu86cQtHCm4jEs300cKwIAkZc');

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<AdminRegister />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/manager-dashboard" element={
          <Elements stripe={stripePromise}>
          <ManagerDashboard />
          </Elements>
          } />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/holidays" element={<HolidayPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
