import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { List,Modal,message, Form, Input, Button, Select, Space, Menu  } from 'antd';
import './ManagerDashboard.css';
import {CardElement,useStripe,useElements} from '@stripe/react-stripe-js';

//const stripePromise = loadStripe('your_publishable_key');

const { Option } = Select;

function ManagerDashboard({ }) {
  const [managerInfo, setManagerInfo] = useState({});
  const [activeMenuItem, setActiveMenuItem] = useState('projects');
  const navigate = useNavigate();
  const [error, setError] = useState(null); // or useState('');

  // Data states
  const [projects, setProjects] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  // UI states
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch manager information
        let response = await fetch('http://localhost:3002/manager', {
          method: 'GET',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch manager information');
        let data = await response.json();
        console.log(data);
        setManagerInfo(data);

        // Fetch projects managed by the manager
        response = await fetch('http://localhost:3002/managerProjects', {
          method: 'GET',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch projects');
        data = await response.json();
        setProjects(data);

      
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      }
    };

    fetchData();
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/departmentEmployees?departmentId=${managerInfo.departmentID}`, {
          withCredentials: true,
        });
        setDepartmentEmployees(response.data); // assuming the response has the data array
      } catch (error) {
        message.error('Failed to fetch employees');
      }
    };
  
    if (managerInfo.departmentID) {
      fetchEmployees();
    }
      
  }, [managerInfo.departmentID]);

const LeaveApplications = ({ departmentId }) => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchLeaveApplications();
  }, [departmentId]);

  const fetchLeaveApplications = async () => {
    try {
      const response = await axios.get(`http://localhost:3002/leave-applications?departmentId=${departmentId}&status=pending`, { withCredentials: true });
      setLeaveApplications(response.data.leaveApplications);
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      message.error('Failed to fetch leave applications');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:3002/leave-applications/approve/${id}`, {}, { withCredentials: true });
      message.success('Leave application approved');
      fetchLeaveApplications(); // Refresh the list
    } catch (error) {
      console.error('Error approving leave application:', error);
      message.error('Failed to approve leave application');
    }
  };

  const showModal = (application) => {
    setCurrentApplication(application);
    setIsModalOpen(true);
  };

  const handleReject = async () => {
    try {
      await axios.put(`http://localhost:3002/leave-applications/reject/${currentApplication.id}`, { reason: rejectionReason }, { withCredentials: true });
      message.success('Leave application rejected');
      setIsModalOpen(false);
      setRejectionReason('');
      fetchLeaveApplications(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting leave application:', error);
      message.error('Failed to reject leave application');
    }
  };
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


 
  const handleCancel = () => {
    setIsModalOpen(false);
    setRejectionReason('');
  };

  return (
    <div className='leaveApplications'>
      <h2>Pending Leave Applications</h2>
      <List
        itemLayout="horizontal"
        dataSource={leaveApplications}
        renderItem={item => (
          <List.Item
            actions={[
              <Button key="approve" type="primary" onClick={() => handleApprove(item.id)}>
                Approve
              </Button>,
              <Button key="reject" type="danger" onClick={() => showModal(item)}>
                Reject
              </Button>
            ]}
          >
            <List.Item.Meta
              title={`${item.employeeName}'s Leave Request`}
              description={`Dates: ${formatDate(item.start_date)} to ${formatDate(item.end_date)}\n Reason: ${item.reason}`}
            />
          </List.Item>
        )}
      />
      <Modal title="Rejection Reason" open={isModalOpen} onOk={handleReject} onCancel={handleCancel}>
        <Input.TextArea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter rejection reason" />
      </Modal>
    </div>
  );
};


  
const Projects = ({ projects }) => {
  const [projectStatus, setProjectStatus] = useState({});

  const updateStatus = async (projectId, status) => {
    try {
      const response = await axios.put(`http://localhost:3002/projects/${projectId}/status`, { status });
      if (response.data.success) {
        message.success('Project status updated successfully');
        // Update the status locally to reflect the change immediately
        setProjectStatus(prevStatus => ({ ...prevStatus, [projectId]: status }));
      } else {
        message.error('Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      message.error('Failed to update project status');
    }
  };

  return (
    <div>
      <List
        itemLayout="horizontal"
        dataSource={projects}
        header={<h3>Projects</h3>}
        renderItem={project => (
          <List.Item
            actions={[
              <Select
                value={projectStatus[project.id] || project.status}
                style={{ width: 120 }}
                onChange={status => updateStatus(project.id, status)}
              >
                <Option value="ongoing">Ongoing</Option>
                <Option value="completed">Completed</Option>
                <Option value="dropped">Dropped</Option>
              </Select>,
              <Button type="primary" onClick={() => updateStatus(project.id, 'completed')}>
                Mark as Completed
              </Button>,
              // Other buttons or actions can be added here
            ]}
          >
            <List.Item.Meta
              title={project.name}
              description={`Status: ${projectStatus[project.id] || project.status}`}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

  
  // Component for Employees Section
  const Employees = ({ departmentId }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    useEffect(() => {
      // Function to fetch employees
      const fetchEmployees = async () => {
        try {
          const response = await axios.get(`http://localhost:3002/departmentEmployees?departmentId=${departmentId}`);
          setEmployees(response.data); // assuming the response has the data array
        } catch (error) {
          message.error('Failed to fetch employees');
        }
      };
  
      // Call the function
      if (departmentId) {
        fetchEmployees();
      }
    }, [departmentId]);
  
    const showModal = (employee) => {
      setSelectedEmployee(employee);
      setIsModalOpen(true);
    };
  
    const handleCancel = () => {
      setIsModalOpen(false);
    };
  
    return (
      <div>
        <List
          itemLayout="horizontal"
          dataSource={employees}
          renderItem={employee => (
            <List.Item>
              <List.Item.Meta
                title={<a onClick={() => showModal(employee)}>{employee.name}</a>}
                description={employee.position} // adjust as per your schema
              />
            </List.Item>
          )}
        />
        <Modal
          title="Employee Details"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null} // No footer buttons
        >
          {selectedEmployee && (
            <div>
              <p>Name: {selectedEmployee.name}</p>
              <p>Email: {selectedEmployee.email}</p>
              <p>Position: {selectedEmployee.position}</p>
              <p>Department ID: {selectedEmployee.departmentId}</p>
              {/* Include other fields as necessary */}
            </div>
          )}
        </Modal>
      </div>
    );
  };

  const ProfileForm = ({ managerInfo, onUpdate }) => {
    const [form] = Form.useForm();
  
    useEffect(() => {
      // Set the form fields with the manager's current info
      form.setFieldsValue(managerInfo);
    }, [managerInfo, form]);
  
    const handleSubmit = async (values) => {
      // This function would be passed down from the parent component
      onUpdate(values);
    };
  
    return (
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Name">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input type="email" />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Phone Number">
          <Input />
        </Form.Item>
        {/* Add other fields as needed */}
        <Button type="primary" htmlType="submit">
          Save Changes
        </Button>
      </Form>
    );
  };

  const handleProfileUpdate = async (updatedInfo) => {
    try {
      setLoading(true);
      const response = await axios.put('http://localhost:3002/update-manager-info', updatedInfo, { withCredentials: true });
      if (response.data.success) {
        message.success('Profile updated successfully.');
        // Update local state to reflect the changes
        setManagerInfo({ ...managerInfo, ...updatedInfo });
      } else {
        message.error('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  

  const handleProjectStatusUpdate = () => {
    if (selectedProject && projectStatus) {
      // Update project status
      axios.put(`http://localhost:3002/projects/${selectedProject.id}`, { status: projectStatus })
        .then(response => {
          // Refresh projects list
          axios.get(`http://localhost:3002/managers/${managerId}/projects`)
            .then(response => {
              setProjectStatus(response.data);
            })
            .catch(error => {
              console.error('Error fetching projects:', error);
              setError('Failed to fetch projects');
            });
        })
        .catch(error => {
          console.error('Error updating project status:', error);
          setError('Failed to update project status');
        });
    }
  };

  const handleEmployeeSearch = () => {
    axios.get(`http://localhost:3002/departments/employees?term=${searchTerm}`)
      .then(response => {
        setFilteredEmployees(response.data);
      })
      .catch(error => {
        console.error('Error searching employees:', error);
        setError('Failed to search employees');
      });
  };
  
  const handleLogout = () => {
    fetch('http://localhost:3002/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(response => {
        if (response.ok) {
          navigate('/login');
        } else {
          setError('Failed to logout');
        }
      })
      .catch(error => {
        console.error('Error logging out:', error);
        setError('Failed to logout');
      });
  };
  
   
  const renderProfile = () => {
    return (
      <div className='profile-content'>
        <h2><strong>Department:</strong> {managerInfo.departmentName}</h2>
        <p><strong>Name:</strong> {managerInfo.name}</p>
        <p><strong>Email:</strong> {managerInfo.email}</p>
        <p><strong>Date of Birth:</strong> {managerInfo.dateOfBirth}</p>
        <p><strong>Address:</strong> {managerInfo.address}</p>
        <p><strong>Phone Number:</strong> {managerInfo.phoneNumber}</p>
        <p><strong>Current Salary:</strong> {managerInfo.salary}</p>
        <p><strong>Date of Joining:</strong> {managerInfo.hireDate}</p>
      </div>
    );
  };

  const PaySalaryComponent = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [selectedMonths, setSelectedMonths] = useState('1');
    const [isPayModalVisible, setIsPayModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [paymentId, setPaymentId] = useState('0');

    const showModal = (employee) => {
      setSelectedEmployee(employee);
      setIsPayModalVisible(true);
    };
  
    const handlePaySalary = async () => {
      if (!selectedEmployee) {
        // Stripe.js has not yet loaded or no employee is selected.
        return;
      }
  
    /*  const cardElement = elements.getElement(CardElement);
  
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        console.log('Payment method creation error:', error);
        return;
      }*/

      try {
        const response = await axios.post('http://localhost:3002/verify-and-record-payment', {
          employeeId: selectedEmployee.employeeID,
          paymentId: paymentId,
          amount: (selectedEmployee.salary / 12) * parseInt(selectedMonths),
          months: parseInt(selectedMonths),
          paymentDate: new Date().toISOString().split('T')[0],
        }
      );
        
  
        if (response.data.success) {
          message.success('Salary paid successfully');
          // update the UI accordingly
          setIsPayModalVisible(false);
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error('Payment failed');
      }
    };
  
    return (
      <>
        <div className='payment'>
          <h2>Pay Salary</h2>
          {departmentEmployees.map((employee) => (
            <div key={employee.id} className='pay-employee'>
              <p>Name: {employee.name}</p>
              <p>Annual Salary: {employee.salary}</p>
              <p>Hire Date: {new Date(employee.hireDate).toLocaleDateString()}</p>
              <Button onClick={() => showModal(employee)}>Pay Salary</Button>
            </div>
          ))}
        </div>
        <Modal
          title="Pay Salary"
          open={isPayModalVisible}
          onCancel={() => setIsPayModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsPayModalVisible(false)}>
              Return
            </Button>,
            <Button key="submit" type="primary" onClick={handlePaySalary}>
              Pay Salary
            </Button>,
          ]}
        >
          {selectedEmployee && (
            <Form layout="vertical">
              <Form.Item label="Employee Name">
                <Input value={selectedEmployee.name} readOnly />
              </Form.Item>
              <Form.Item label="Select Months">
                <Select value={selectedMonths} onChange={setSelectedMonths}>
                  {[...Array(12).keys()].map((value) => (
                    <Option key={value + 1} value={`${value + 1}`}>
                      {value + 1} {value + 1 === 1 ? 'Month' : 'Months'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Amount to Pay">
                <Input
                  value={`$${((selectedEmployee.salary / 12) * parseInt(selectedMonths)).toFixed(2)}`}
                  readOnly
                />
              </Form.Item>
              <Form.Item label="Payment ID">
  <Input
    type="number" // Set the type to number
    value={paymentId}
    onChange={(e) => setPaymentId(e.target.value)}
    placeholder="Enter numeric payment ID"
  />
</Form.Item>

            </Form>
          )}
        </Modal>
      </>
    );
  };
  
  const renderContent = () => {
      switch (activeMenuItem) {
        case 'profile':
          return renderProfile();
        case 'projects':
          return <Projects projects={projects} />;
        case 'employees':
          return <Employees departmentId={managerInfo.departmentID} />;
        case 'leaveApplications':
          return <LeaveApplications departmentId={managerInfo.departmentID} />;
        // ... other cases ...
        case 'paySalary':
          return <PaySalaryComponent />;
        default:
          return null;
      }
  };



  if (!managerInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="manager-dashboard">
     <h1>TechSolutions Inc.</h1>
    <header className='manager-header'>
    <h1>Welcome Manager, {managerInfo.name}</h1>
        <nav className="manager-nav">
        <Menu onClick={(e) => setActiveMenuItem(e.key)} selectedKeys={[activeMenuItem]} mode="horizontal">
        <Menu.Item key="profile">Profile</Menu.Item>
        <Menu.Item key="projects">Projects</Menu.Item>
        <Menu.Item key="employees">Employees</Menu.Item>
        <Menu.Item key="leaveApplications">Leave Applications</Menu.Item>
        <Menu.Item key="paySalary">Pay Employees Salary</Menu.Item>
      </Menu>
      </nav>
            <Button onClick={ProfileForm(managerInfo)}>Edit Profile</Button>
            <Button onClick={handleLogout}>Logout</Button>
          <div className="content">{renderContent()}</div>
        
      </header>
    </div>
  );
}

export default ManagerDashboard;
