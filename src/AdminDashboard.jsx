import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import {Form,Input,Button,Select,DatePicker} from 'antd';
//import 'antd/dist/antd.css';

const {Option} =Select;


function AdminDashboard() {
    const [adminInfo,setAdminInfo]=useState({name:'',email:''}); // Replace 'Admin' with the actual admin name
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phoneNumber: '',
    dateOfBirth: '',
    roleId: '',
    departmentId: '',
    projectId: '',
    salary: '',
    hireDate: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExitForm, setShowExitForm] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ employeeName: '', date: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  const [showSearchAndFilter, setShowSearchAndFilter] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);

  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const onFinish = async (values) => {
    setError('');
    try {
      // Here we send the actual date values formatted as required by the backend, assuming yyyy-mm-dd format
     console.log("values: ",values);
      const response = await axios.post('http://localhost:3002/register-employee', values, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      if (response.data.success) {
        alert('Employee registered successfully');
        form.resetFields();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Error registering employee. Please try again.');
      console.error('Error:', error);
    }
  };
  
  const [form]=Form.useForm();
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch('http://localhost:3002/get-admin-info', {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
        });

        const data = await response.json();
        if (response.ok) {
          setAdminInfo(data);
        } else {
          setError(data.message || 'Failed to fetch admin details.');
          navigate('/'); // Redirect to login if failed to fetch info
        }
      } catch (error) {
        setError('Failed to fetch admin details. Please try again.');
        navigate('/'); // Redirect to login if error occurs
      }
    };
    fetchAdminInfo();
},[navigate]);

useEffect(() => {
  // Fetch departments
  axios.get('http://localhost:3002/departments', { withCredentials: true })
    .then(response => {
      setDepartments(response.data);
    })
    .catch(error => {
      console.error('Error fetching departments:', error);
    });

  // Fetch roles
  axios.get('http://localhost:3002/roles', { withCredentials: true })
    .then(response => {
      setRoles(response.data);
    })
    .catch(error => {
      console.error('Error fetching roles:', error);
    });
  axios.get('http://localhost:3002/ongoingprojects', { withCredentials: true })
    .then(response => {
      console.log("Projects data:", response.data);

      setProjects(response.data);
    })
    .catch(error => {
      console.error('Error fetching projects:', error);
    });
}
    
, []); // The empty array ensures this effect runs once on mount

const toggleSearchAndFilter = () => {
  setShowSearchAndFilter(!showSearchAndFilter);
  setShowEmployees(false);
  setShowEntryForm(false);
  setShowExitForm(false);
};

const handleToggleEmployeeForm = () => {
    setShowEmployees(!showEmployees);
    setShowSearchAndFilter(false);
    setShowEntryForm(false);
    setShowExitForm(false);
};

  // Search Employees
  const searchEmployees = () => {
    axios.get(`http://localhost:3002/search-employees?term=${searchTerm}`, { withCredentials: true })
      .then(response => {
        // Update your state with the response data to display the employees
        console.log(response.data);
        setFilteredEmployees(response.data);

      })
      .catch(error => {
        console.error('Error searching employees:', error);
        setError('Failed to search employees');
      });
  };
  

  // Filter Employees
  const filterEmployees = () => {
    axios.get(`http://localhost:3002/filter-employees?department=${filterDepartment}&role=${filterRole}`, { withCredentials: true })
      .then(response => {
        // Update your state with the response data to display the employees
        console.log(response.data);
        setFilteredEmployees(response.data);

      })
      .catch(error => {
        console.error('Error filtering employees:', error);
        setError('Failed to filter employees');
      });
  };
    

  const handleShowEntryForm = () => {
    setShowEntryForm(true);
    setShowExitForm(false);
    setShowEmployees(false);
    setShowSearchAndFilter(false);
    // Optionally, reset attendance data or set default values
  };
  
  const handleShowExitForm = () => {
    setShowExitForm(true);        
    setShowEntryForm(false);
    setShowEmployees(false);
    setShowSearchAndFilter(false);
    // Optionally, reset attendance data or set default values
  };

  const closeEntryForm = () => {
    setShowEntryForm(false);
  };
  
  const closeExitForm = () => {
    setShowExitForm(false);
  };

  const handleAttendanceChange = (e) => {
    const { name, value } = e.target;
    setAttendanceData(prevData => ({ ...prevData, [name]: value }));
  };
  const handleRecordAttendance = async (type) => {
    try {
      const endpoint = type === 'entry' ? 'attendance-entry' : 'attendance-exit';
      const response = await axios.post(`http://localhost:3002/${endpoint}`, {
        ...attendanceData,
        type: type,
      }, { withCredentials: true });

      if (response.data.success) {
        alert(`Employee ${type} recorded successfully`);
        setAttendanceData({ employeeName: '', date: '' }); // Reset the form data
        if (type === 'entry') {
          setShowEntryForm(false);
        } else {
          setShowExitForm(false);
        }
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(`Error recording employee ${type}. Please try again.`);
      console.error('Error:', error);
    }
  };



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

  return (
    <div className="admin-dashboard">
     <header className="admin-header">
        <nav className="admin-nav">
        <h1>TechSolutions</h1>
          <select onChange={(e) => e.target.value === 'entry' ? handleShowEntryForm() : handleShowExitForm()}>
            <option value="">Attendance Options</option>
            <option value="entry">Record Entry</option>
            <option value="exit">Record Exit</option>
          </select>
          <button onClick={handleToggleEmployeeForm}>Employee Registration</button>
          <button onClick={toggleSearchAndFilter}>Show Employees</button>
          <button onClick={handleLogout} className="admin-logout-button">
            Logout
          </button>
        </nav>  
      </header>
      <div className='admin-content'>
      <h1>Welcome, {adminInfo.name}</h1>
      <p><strong>Email:</strong> {adminInfo.email}</p>
      <p><strong>Role: </strong>Admin</p>
      {showEmployees && (
        <section className="admin-employee-registration-form">
          <h2>Register New Employee</h2>
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item name="name" label="Name" className="admin-form-label" rules={[{ required: true, message: 'Please input the name!' }]}>
            <Input placeholder='Enter Full Name'/>
            </Form.Item>
            {/* ... other form items */}
            <Form.Item name="email" label="Email" className="admin-form-label"  rules={[{ required: true, message: 'Please input the email!' }, { type: 'email', message: 'Please enter a valid email!' }]}>
            <Input placeholder='Enter Personal Email'/>
            </Form.Item>
            <Form.Item name="address" label="Address" className="admin-form-label" rules={[{ required: true, message: 'Please input the address!' }]}>
            <Input placeholder='Enter Residential Address'/>
            </Form.Item>
            <Form.Item name="phoneNumber" label="Phone Number" className="admin-form-label"  rules={[{ required: true, message: 'Please input the phone number!' }]}>
              <Input placeholder='Enter Mobile Number' />
            </Form.Item>
            <Form.Item name="dateOfBirth" label="Date of Birth" className="admin-form-label" rules={[{ required: true, message: 'Please select the date of birth!' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            {/* ... address, phone number, etc. */}
            <Form.Item name="roleId" label="Role ID" className="admin-form-label" rules={[{ required: true, message: 'Please select the role!' }]}>
              <Select placeholder="Select a role">
                {roles.map((role) => (
                  <Option key={role.id} value={role.id}>{role.id} {role.roleName}</Option>
                ))}
              </Select>
              {/*<Input placeholder='Enter Role ID'/>*/}
            </Form.Item>
            <Form.Item name="departmentId" label="Department ID" className="admin-form-label" rules={[{ required: true, message: 'Please select the department!' }]}>
              <Select placeholder="Select a department">
                {departments.map((department) => (
                  <Option key={department.id} value={department.id}>{department.id} {department.name}</Option>
                ))} 
              </Select>
              {/*<Input placeholder='Enter Department ID'/>*/}
            </Form.Item>
            <Form.Item name="projectId" label="Project ID" className="admin-form-label" rules={[{ required: true, message: 'Please select the project!' }]}>
              {/*<Select placeholder="Select a project">
                {projects.map((project) => (
                  <Option key={project.id} value={project.id}>{project.projectID}</Option>
                ))}
              </Select>*/}
              <Input placeholder='Enter Project ID'/>
            </Form.Item>
            
            <Form.Item name="salary" label="Salary" className="admin-form-label" rules={[{ required: true, message: 'Please input the salary!' }]}>
              <Input placeholder='Enter Annual Salary'/>
            </Form.Item>
            {/* ... departmentId, projectId, etc. */}
            <Form.Item name="hireDate" label="Hire Date" className="admin-form-label" rules={[{ required: true, message: 'Please select the hire date!' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            {/* ... username, password */}
            <Form.Item name="username" label="Username" className="admin-form-label" rules={[{ required: true, message: 'Please input the username!' }]}>
              <Input placeholder='Enter Username' />
            </Form.Item>  
            <Form.Item name="password" label="Password" placeholder= "Enter password" className="admin-form-label" rules={[{ required: true, message: 'Please input the password!' }]}>
              <Input.Password placeholder='Enter Password'/>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" >
                Register Employee
              </Button>
            </Form.Item>
          </Form>
          {error && <p className="error">{error}</p>}
        </section>
      )}
      {showSearchAndFilter && (
      <section className="admin-search-and-filter">
        <input
          type="text"
          placeholder="Search Employees"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={searchEmployees}>Search</button>

        <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>{department.name}</option>
          ))}
        </select>

        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>{role.roleName}</option>
          ))}
        </select>

        <button onClick={filterEmployees}>Apply Filters</button>
      </section>
      )}
      {filteredEmployees.length > 0 && (
  <section className="employee-list">
    <h2>Filtered Employees</h2>
    <ul>
      {filteredEmployees.map(employee => (
        <li key={employee.id}>
          <p>Name: {employee.name}</p>
          <p>Email: {employee.email}</p>
          {/* Render other employee information here */}
        </li>
      ))}
    </ul>
  </section>
)}

      <section className="attendance-management">
        {/*<h2>Attendance Management</h2>
        <button onClick={handleShowEntryForm}>Employee Entry</button>
        <button onClick={handleShowExitForm}>Employee Exit</button>*/}
        {showEntryForm && (
          <div className="attendance-form">
            <input
              name="employeeName"
              placeholder="Employee Name"
              value={attendanceData.employeeName}
              onChange={handleAttendanceChange}
            />
            <input
              type="date"
              name="date"
              value={attendanceData.date}
              onChange={handleAttendanceChange}
            />
             <button onClick={closeEntryForm}>Close</button>
            <button onClick={() => handleRecordAttendance('entry')}>Record Entry</button>
          </div>
        )}
        {showExitForm && (
          <div className="attendance-form">
            <input
              name="employeeName"
              placeholder="Employee Name"
              value={attendanceData.employeeName}
              onChange={handleAttendanceChange}
            />
            <input
              type="date"
              name="date"
              value={attendanceData.date}
              onChange={handleAttendanceChange}
            />
            <button onClick={closeExitForm}>Close</button>
            <button onClick={() => handleRecordAttendance('exit')}>Record Exit</button>
          </div>
        )}
      </section>
      </div>
    </div>

  );
}

export default AdminDashboard;