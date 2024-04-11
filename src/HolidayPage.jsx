
import React, { useState, useEffect } from 'react';
import './HolidayPage.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const HolidaysPage = () => {
  // Simplified holidays data - in a real app this could come from an API
  const [holidays, setHolidays] = useState([]);
  useEffect(() => {
    fetch('http://localhost:3002/holidays')
      .then(response => response.json())
      .then(data => {
        const formattedData = data.map(holiday => ({
          ...holiday,
          date: formatDate(holiday.date)
        }));
        setHolidays(formattedData);
      })
      .catch(error => {
        console.error('Error fetching holidays:', error);
      });
  }, []);

  return (
    <div className="holiday-detail-container">
          <a href="./Calendar">Back to Calendar</a>
      <h1>Holidays</h1>
      {holidays.map((holiday) => (
        <article key={holiday.date} className="holiday-detail">
          <h2>{holiday.name}</h2>
          <p><strong>Date:</strong> {holiday.date}</p>
          <p><strong>Description:</strong> {holiday.description}</p>
        </article>
      ))}
    </div>
  );
};

export default HolidaysPage;
