import React, { useState, useEffect } from 'react';
import { Calendar, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Calendar.css'; // Ensure you have a .css file with this name for custom styles

const CalendarPage = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3002/holidays')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setHolidays(data);
      })
      .catch(error => {
        console.error('Error fetching holidays:', error);
      });
  }, []);

  // Custom render function for Calendar cells
  const cellRender = (value) => {
    // Format the value to match the date format from your data
    const formattedDate = value.format('YYYY-MM-DD');
    // Use startsWith to match the date without considering the time
    const holiday = holidays.find(holiday => holiday.date.startsWith(formattedDate));
    return holiday ? <div className="holiday">{holiday.name}</div> : null;
  };
  
  
  return (
    <div className="calendar-container">
      <div className="calendar-navigation">
        <Button onClick={() => navigate('/holidays')}>Detailed Holidays</Button>
      </div>

      <h1>Yearly Calendar</h1>
      {/* Pass the dateCellRender function as a prop to the Calendar component */}

      <Calendar fullscreen={true} cellRender={cellRender} />
    </div>
  );
};

export default CalendarPage;
