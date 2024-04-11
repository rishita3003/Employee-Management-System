import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';
import { Select } from 'antd';
import { List,Button, DatePicker, Form, Input,Modal } from 'antd';

const {Option} = Select;

function ProjectDetailPopover({ project, onClose }) {
  if (!project) return null;

  return (
    <div className="project-detail-popover">
      <button onClick={onClose}>Close</button>
      <h2>{project.name}</h2>
      <p><strong>Description:</strong> {project.description}</p>
      <p><strong>Start Date:</strong> {project.startDate}</p>
      <p><strong>End Date:</strong> {project.endDate}</p>
      <p><strong>Budget:</strong> ${project.budget}</p>
      <p><strong>Status:</strong> {project.status}</p>
      <p><strong>Department:</strong> {project.departmentName}</p>
      <p><strong>Employees:</strong> {project.employeeNames}</p> {/* Ensure plural 'Names' */}
    </div>
  );
}


function ProjectListBox({ projects, onSelectProject }) {
  return (
    <div className="project-list-box">
      <ul>
        {projects.map((project) => (
          <li key={project.projectID}>
            <a href="#!" onClick={() => onSelectProject(project)}>{project.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const LeaveApplicationForm = ({ onClose }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    console.log('Received values of form: ', values);
    const formattedValues = {
      ...values,
      reason: values.reason,
      start_date: values.startDate.format('YYYY-MM-DD'),
      end_date: values.endDate.format('YYYY-MM-DD')
    };
    console.log('Formatted values:', formattedValues);

    try {
      // Send a POST request to the server endpoint
      const response = await axios.post('http://localhost:3002/apply-leave', formattedValues, {
        withCredentials: true // If your backend setup requires sending cookies for authentication
      });
  
      // Check if the request was successful
      if (response.data.success) {
        console.log('Leave application submitted successfully:', response.data);
        // Optionally, show a success message to the user
  
        // After successful submission, close the form
        onClose();
      } else {
        // Handle the case where the server responded with some error
        console.error('Failed to submit leave application:', response.data.message);
        // Optionally, show an error message to the user
      }
    } catch (error) {
      console.error('An error occurred while submitting the leave application:', error);
      // Handle errors, for example, show an error message to the user
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="reason"
        label="Reason for Leave"
        rules={[{ required: true, message: 'Please input your reason for leave!' }]}
      >
        <Input.TextArea placeholder="Enter the reason for your leave" />
      </Form.Item>
      <Form.Item
        name="startDate"
        label="Start Date"
        rules={[{ required: true, message: 'Please select your start date of leave!' }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item
        name="endDate"
        label="End Date"
        rules={[{ required: true, message: 'Please select your end date of leave!' }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit Leave Application
        </Button>
      </Form.Item>
    </Form>
  );
};

function EmployeeDashboard() {
  const [employeeDetails, setEmployeeDetails] = useState({
    employeeInfo: {},
    completedProjects: [],
    ongoingProjects: [] // Initialize this to an empty array as well
  });
  const [showOngoingProjects, setShowOngoingProjects] = useState(false);
  const [showCompletedProjects, setShowCompletedProjects] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);

  const [isLeaveStatusModalVisible, setIsLeaveStatusModalVisible] = useState(false);
  const [isPaymentStatusModalVisible, setIsPaymentStatusModalVisible] = useState(false);
const [paymentStatus, setPaymentStatus] = useState([]);

const fetchPaymentStatus = async () => {
  try {
    const response = await axios.get('http://localhost:3002/payment-status', { withCredentials: true });
    if (response.data.success) {
      setPaymentStatus(response.data.payments);
    } else {
      setError('Failed to fetch payment status.');
    }
  } catch (err) {
    setError('Failed to fetch payment status. Please try again.');
  }
};


  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleCloseDetails = () => {
    setShowProjectDetails(false);
    setSelectedProject(null);
  };
  const handleOpenLeaveApplication = () => {
    setIsLeaveModalVisible(true);
    setIsLeaveStatusModalVisible(false); // Ensure that leave status modal is not open
  };

  const handleOpenLeaveStatus = () => {
    setIsLeaveModalVisible(false);
    setIsLeaveStatusModalVisible(true);
  };

  // New component to render leave requests
  const LeaveStatus = ({ leaveRequests }) => {
    // Function to format the dates for display
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
  
    return (
      <div>
        <h2>My Leave Requests</h2>
        {leaveRequests.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={leaveRequests}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<span>Leave Request — {formatDate(item.start_date)} to {formatDate(item.end_date)}</span>}
                  description={
                    <>
                      <p><strong>Reason for Leave:</strong> {item.reason}</p>
                      <p><strong>Status:</strong> {item.status.charAt(0).toUpperCase() + item.status.slice(1)}</p>
                      <p><strong>Submitted on:</strong> {formatDate(item.created_at)}</p>
                      <p><strong>Last Updated:</strong> {formatDate(item.updated_at)}</p>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <p>You have no leave requests.</p>
        )}
      </div>
    );
  };



  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const response = await fetch('http://localhost:3002/get-employee-info', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          setEmployeeDetails(data); // Save the entire object including employee info and projects
          console.log(employeeDetails);
        } else {
          setError(data.message || 'Failed to fetch employee details.');
        }
      } catch (err) {
        setError('Failed to fetch employee details. Please try again.');
      }
    };

    fetchEmployeeInfo();
  }, []);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        // Replace this URL with the correct endpoint for fetching leave requests for the current user
        const response = await axios.get('http://localhost:3002/leave-requests-employee', { withCredentials: true });
        if (response.status === 200 && response.data.success) {
          // Assuming the data returned is an array of leave requests
          setLeaveRequests(response.data.leaveRequests);
        } else {
          // Handle any errors or unsuccessful responses here
          console.error('Failed to fetch leave requests:', response.data.message);
          setError('Failed to fetch leave requests.');
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        setError('Error fetching leave requests.');
      }
    };
  
    fetchLeaveRequests();
  }, []); // Empty dependency array means this runs once on mount

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!employeeDetails) {
    return <div>Loading...</div>;
  }

  const { employeeInfo, completedProjects , ongoingProjects} = employeeDetails;

  const handleLogout = async () => {
    // Logout logic
try {
        const response = await axios.post('http://localhost:3002/logout', {}, { withCredentials: true });
        const responseData = response.data;
        if (responseData.status === 'success') {
            navigate('/login'); 
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('There was an error!', error);
    }
};

const handleProjectDropdown = (value) => {
  if (value === 'ongoing') {
    setShowOngoingProjects(true);
    setShowCompletedProjects(false);
  } else if (value === 'completed') {
    setShowOngoingProjects(false);
    setShowCompletedProjects(true);
  }
};



  return (
    <div className="employee-dashboard">
      <header className='employee-header'>
      <h1>TechSolutions Inc.</h1>
      <nav className="nav-links">
        <Link to="/calendar">View Calendar</Link>
        <button onClick={handleOpenLeaveApplication}>Apply for Leave</button>
        <Modal
        title="Apply for Leave"
        open={isLeaveModalVisible}
        onCancel={() => setIsLeaveModalVisible(false)}
        footer={null}
      >
       <LeaveApplicationForm onClose={() => setIsLeaveModalVisible(false)} />
      </Modal>
      <Button onClick={handleOpenLeaveStatus}>Leave Status</Button>
          <Modal
            title="Leave Requests"
            open={isLeaveStatusModalVisible}
            onCancel={() => setIsLeaveStatusModalVisible(false)}            
            footer={null}
          >
            <LeaveStatus leaveRequests={leaveRequests} />
          </Modal>
        {/* ... other navigation links */}
        <Select
         defaultValue="Projects"
          style={{ width: 200 }}
          onChange={handleProjectDropdown}
          >
            <Option value="ongoing">Ongoing Projects</Option>
            <Option value="completed">Completed Projects</Option>
          </Select>
        <button onClick={()=>{
          setIsPaymentStatusModalVisible(true);
          fetchPaymentStatus();
        }}>
          Payment Status
        </button>
        <Modal
  title="Payment Status"
  open={isPaymentStatusModalVisible}
  onCancel={() => setIsPaymentStatusModalVisible(false)}
  footer={null} // You might not want any footer buttons in this modal
>
  {/* Here you would map over paymentStatus to display the data */}
  {paymentStatus.length > 0 ? (
    paymentStatus.map((payment) => (
      <div key={payment.id}>
        {/* Display payment details */}
        <p><strong>Amount Paid:</strong> {payment.amount}</p>
        <p><strong>Months Covered:</strong> {payment.months}</p>
        <p><strong>Payment Date:</strong> {payment.payment_date}</p>
        {/* Add other details as needed */}
      </div>
    ))
  ) : (
    <p>No payment records found.</p>
  )}
</Modal>

        <button onClick={handleLogout} className="employee-logout-button">
          Logout
        </button>
      </nav>
        
      </header>
      <h1>Welcome, {employeeInfo.name}</h1>
      <div className="employee-info">
        <p><strong>Name:</strong> {employeeInfo.name}</p>
        <p><strong>Email:</strong> {employeeInfo.email}</p>
        <p><strong>Date of Birth:</strong> {employeeInfo.date_of_birth}</p>
        <p><strong>Address:</strong> {employeeInfo.address}</p>
        <p><strong>Phone Number:</strong> {employeeInfo.phoneNumber}</p>
        <p><strong>Role: </strong>{employeeInfo.roleName}</p>
        <p><strong>Current Salary:</strong> {employeeInfo.salary}</p>
        <p><strong>Date of Joining:</strong> {employeeInfo.hireDate}</p>
        <p><strong>Department: </strong>{employeeInfo.departmentName}</p>
        {/* Display more employee details here */}
      </div>
      
      {showOngoingProjects && (
  <>
    <h2>Ongoing Projects</h2>
    {ongoingProjects.length > 0 ? (
      <ProjectListBox
        projects={ongoingProjects}
        onSelectProject={handleSelectProject} // Use onSelectProject instead of onClose
      />
    ) : (
      <div>No Ongoing projects</div>
    )}
  </>
)}
{showCompletedProjects && (
  <>
    <h2>Completed Projects</h2>
    {completedProjects.length > 0 ? (
      <ProjectListBox
        projects={completedProjects}
        onSelectProject={handleSelectProject} // Use onSelectProject instead of onClose
      />
    ) : (
      <div>No completed projects</div>
    )}
  </>
)}
      {/* Repeat for completedProjects */}
      {showProjectDetails && (
        <ProjectDetailPopover project={selectedProject} onClose={handleCloseDetails} />
      )}
    </div>

  );
}

export default EmployeeDashboard;
