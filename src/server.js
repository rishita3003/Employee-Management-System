import express from 'express';
import mysql from 'mysql2';
//import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import session from 'express-session';
//const multer=require('multer') //handle multipart/form-data requests in Express
//const upload=multer({dest: 'uploads/'}) //specify the destination folder for the uploaded files
import mysql2 from 'mysql2/promise';
import Stripe from 'stripe';

const stripe=Stripe('sk_test_51P3ATzSIpn3KtDEeXZXxRncYwCo0VQJ9PybqVIcPGQRJNId45qIq2MOT31tJywrytJKyDeLvYpBNzj7buoa2qxwy00ik67S4Ov');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173',
 credentials: true 
})); // Adjust the origin as per your React app's URL

app.use(session({
    secret: 'your_secret_key', // This secret key is used to sign the session ID cookie. Replace 'your_secret_key' with a real secret string.
    resave: false, // This option forces the session to be saved back to the session store, even if the session was never modified during the request.
    saveUninitialized: false, // This option forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
    cookie: { secure: false } // For development, set secure to false. In production, set it to true if you're using HTTPS.
  }));
  


// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'employee'
});

// Connect to MySQL
db.connect(err => {
  if (err) return console.error('error: ' + err.message);
  console.log('Successfully connected to the MySQL Server.');
});

const PORT = 3002;

const saltRounds = 10;


app.post('/', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const query = `
    SELECT *
    FROM users u
    WHERE u.username = ?
`;

db.query(query, [username], (error, results) => {
    
    if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ message: 'Login failed' });
    }

    if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
        if (err) {
            console.error('Error comparing passwords:', err);
            return res.status(500).json({ message: 'Login failed' });
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Set the user info in session including the specific ID based on their role
        req.session.user = {
            //id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            email: user.email
        };
        console.log("AFter logging: ",req.session.user);
        res.json({ message: 'Login successful', user: req.session.user });
    });
  });
});

app.post('/register', async (req, res) => { // Mark this as an async function
    const { name, username, password, email } = req.body;

    if (!name || !username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds); // Use await with bcrypt.hash

        // Insert into the admin table
        const adminQuery = `INSERT INTO admin (name, email, roleID) VALUES (?, ?, ?)`;
        const adminInsertionResult = await db.promise().query(adminQuery, [name, email, 1]); // '1' is an example roleID for Admin

        // Insert into the users table using the adminId from the admin table
        const userQuery = `
            INSERT INTO users (name, username, password_hash, role, email) 
            VALUES (?, ?, ?, 'Admin', ?)
        `;
        await db.promise().query(userQuery, [name, username, hashedPassword, email]);

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error executing query:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username or email already exists' }); // Handle duplicate entry error
        }
        res.status(500).json({ message: 'Failed to create admin and user' });
    }
});

// ...rest of your Express app setup
app.post('/register-employee', async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      phoneNumber,
      dateOfBirth,
      roleId,
      departmentId,
      projectId,
      salary,
      hireDate,
      username,
      password,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if the role, department, and project exist
    const [roleCheck] = await db.promise().query('SELECT 1 FROM roles WHERE roleID = ?', [roleId]);
    const [departmentCheck] = await db.promise().query('SELECT 1 FROM departments WHERE departmentID = ?', [departmentId]);
    const [projectCheck] = await db.promise().query('SELECT 1 FROM projects WHERE projectID = ?', [projectId]);

    if (roleCheck[0].length === 0 || departmentCheck[0].length === 0 || projectCheck[0].length === 0) {
      return res.status(400).json({ success: false, message: 'Role, Department, or Project does not exist' });
    }

    // Special handling for roleID 3 (Manager)
    if (roleId == 3) {
      const [managerCheck] = await db.promise().query('SELECT managerID FROM departments WHERE departmentID = ?', [departmentId]);
      if (managerCheck[0].managerID) {
        return res.status(400).json({ success: false, message: 'A manager already exists for this department' });
      }
    }

    // Proceed with employee registration
    const [employeeResult] = await db.promise().query('INSERT INTO employees (name, email, address, phoneNumber, date_of_birth, roleID, departmentID, projectID, salary, hireDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, email, address, phoneNumber, dateOfBirth, roleId, departmentId, projectId, salary, hireDate]);

    // If the role is a manager, update the department's managerID
    if (roleId == 3) {
      await db.promise().query('UPDATE departments SET managerID = ? WHERE departmentID = ?', [employeeResult.insertId, departmentId]);
    }

    // Insert user details
    await db.promise().query('INSERT INTO users (name, username, password_hash, role, email) VALUES (?, ?, ?, (SELECT roleName FROM roles WHERE roleID = ?), ?)', [name, username, hashedPassword, roleId, email]);
    
    res.json({ success: true, message: 'Employee registered successfully' });
  } catch (error) {
    console.error('Error registering employee:', error);
    res.status(500).json({ success: false, message: 'Failed to register employee' });
  }
});


  app.get('/get-admin-info', (req, res) => {
    if(!req.session.user){
      return res.status(401).json({message: 'Not authenticated'});
    }
    const { name, email } = req.session.user; // Assuming these are stored in the session
    
    if (!name || !email) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const query = `
        SELECT id, name, email, roleID
        FROM admin
        WHERE name = ? AND email = ?
    `;
    
    db.query(query, [name, email], (error, results) => {
        if (error) {
            console.error('Error fetching admin info:', error);
            return res.status(500).json({ message: 'Failed to fetch admin info' });
        }
    
        if (results.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
    
        const adminData = results[0];
        res.json({
            id: adminData.id,
            name: adminData.name,
            email: adminData.email,
            // ... other admin details to send back
        });
    });
});

app.get('/get-employee-info', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Query for employee information
    const employeeQuery = `
      SELECT e.*, d.name as departmentName, r.roleName
      FROM employees e
      JOIN departments d ON e.departmentID = d.departmentID
      JOIN roles r ON e.roleID = r.roleID
      WHERE e.name = ? AND e.email = ?
    `;

    const [employeeRows] = await db.promise().query(employeeQuery, [req.session.user.name, req.session.user.email]);

    if (employeeRows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employeeInfo = employeeRows[0];

    // Query for completed projects
    const completedProjectsQuery = `
      SELECT p.*, d.name as departmentName,
      (SELECT GROUP_CONCAT(name separator ', ') FROM employees WHERE projectID = p.projectID) as employeeNames
      FROM projects p
      JOIN departments d ON p.departmentID = d.departmentID
      WHERE p.projectID = ? AND p.status = 'Completed'
    `;

    const [completedProjectsRows] = await db.promise().query(completedProjectsQuery, [employeeInfo.projectID]);

    // Query for ongoing projects
    const ongoingProjectsQuery = `
      SELECT p.*, d.name as departmentName,
      (SELECT GROUP_CONCAT(name separator ', ') FROM employees WHERE projectID = p.projectID) as employeeNames
      FROM projects p
      JOIN departments d ON p.departmentID = d.departmentID
      WHERE p.projectID = ? AND p.status = 'Active'
    `;

    const [ongoingProjectsRows] = await db.promise().query(ongoingProjectsQuery, [employeeInfo.projectID]);

    // Construct the response object with conditional messages for no projects
    const response = {
      employeeInfo: employeeInfo,
      completedProjects: completedProjectsRows,
      ongoingProjects: ongoingProjectsRows
    };

    console.log(response.completedProjects);
    console.log(response.ongoingProjects);

    res.json(response);
  } catch (error) {
    console.error('Error fetching employee info:', error);
    res.status(500).json({ message: 'Failed to fetch employee info' });
  }
});


// Assuming express app setup is done

// Record Entry

app.post('/attendance-entry', (req, res) => {
  const { employeeName, date } = req.body;

  // Get employee ID from name
  db.query('SELECT employeeID FROM employees WHERE name = ?', [employeeName], (err, results) => {
    if (err) {
      console.error('Error fetching employee:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const employeeID = results[0].employeeID;

    // Check for existing attendance record
    db.query('SELECT * FROM daily_attendance WHERE employee_id = ? AND date = ?', [employeeID, date], (err, results) => {
      if (err) {
        console.error('Error checking existing attendance:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (results.length > 0) {
        return res.status(409).json({ success: false, message: 'Attendance already recorded' });
      }

      // Insert the attendance entry
      db.query('INSERT INTO daily_attendance (employee_id, date, time_in, status) VALUES (?, ?, CURTIME(), "Present")', [employeeID, date], (err, results) => {
        if (err) {
          console.error('Error inserting attendance entry:', err);
          return res.status(500).json({ success: false, message: 'Server error' });
        }

        res.json({ success: true, message: 'Attendance entry recorded successfully' });
      });
    });
  });
});

app.post('/attendance-exit', (req, res) => {
  const { employeeName, date } = req.body;

  // Get employee ID from name
  db.query('SELECT employeeID FROM employees WHERE name = ?', [employeeName], (err, results) => {
    if (err) {
      console.error('Error fetching employee:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const employeeID = results[0].employeeID;

    // Update the attendance exit record
    db.query('UPDATE daily_attendance SET time_out = CURTIME() WHERE employee_id = ? AND date = ?', [employeeID, date], (err, results) => {
      if (err) {
        console.error('Error updating attendance exit:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Attendance entry not found for this date' });
      }

      res.json({ success: true, message: 'Attendance exit recorded successfully' });
    });
  });
});

app.get('/departments', (req, res) => {
  const query = 'SELECT departmentID as id, name FROM departments';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to fetch departments', error });
    }
    res.json(results);
  });
});

// Fetch all roles
app.get('/roles', (req, res) => {
  const query = 'SELECT roleID as id, roleName FROM roles';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to fetch roles', error });
    }
    res.json(results);
  });
});


// Search for employees
app.get('/search-employees', (req, res) => {
  const { term } = req.query;
  const query = 'SELECT * FROM employees WHERE name LIKE ? OR employeeID LIKE ?';
  const formattedTerm = `%${term}%`;

  db.query(query, [formattedTerm, formattedTerm], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error searching for employees', error });
    }
    res.json(results);
  });
});
// Apply filters
app.get('/filter-employees', (req, res) => {
  const { department, role } = req.query;
  let query = 'SELECT * FROM employees WHERE 1';
  const queryParams = [];

  if (department) {
    query += ' AND departmentID = ?';
    queryParams.push(department);
  }

  if (role) {
    query += ' AND roleID = ?';
    queryParams.push(role);
  }

  db.query(query, queryParams, (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error filtering employees', error });
    }
    res.json(results);
  });
});

app.get('/ongoingprojects', (req, res) => {
  const query = 'SELECT * FROM projects WHERE status = "Ongoing"';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to fetch ongoing projects', error });
    }
    res.json(results);
  });
});

app.get('/manager', (req, res) => {
  console.log("Manager info: ",req.session.user);
  // Check if the user is logged in and has a name set in the session
  if (!req.session.user || !req.session.user.name) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Extract the manager's name from the session
  const managerName = req.session.user.name;

  // Query the employees table for the manager's details
  const query = `
    SELECT e.*, d.name as departmentName, r.roleName, d.departmentID as departmentID
    FROM employees e
    JOIN departments d ON e.departmentID = d.departmentID
    JOIN roles r ON e.roleID = r.roleID
    WHERE e.name = ?
  `;
  
  db.query(query, [managerName], (error, managerResults) => {
    if (error) {
      // Log and send an error response if there's a problem with the query
      console.error('Error:', error);
      return res.status(500).json({ message: 'Failed to process request' });
    }

    // Check if the manager was found in the employees table
    if (managerResults.length === 0) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Since the manager was found, return the manager's details
    const managerInfo = managerResults[0];
    res.json(managerInfo);
  });
});


app.get('/managerProjects', (req, res) => {
  const managerName = req.session.user.name;

  // Initial query to get the managerId based on the managerName
  db.query('SELECT employeeID FROM employees WHERE name = ?', [managerName], (error, managerResults) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to fetch manager information', error });
    }

    // Check if a manager with the given name is found
    if (managerResults.length === 0) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Use let for managerId so it can be reassigned
    let managerId = managerResults[0].employeeID;

    // Second query to get the departmentId based on the managerId
    db.query('SELECT departmentID FROM employees WHERE employeeID = ?', [managerId], (error, departmentResults) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to fetch manager department', error });
      }

      // Check if the department is found for the manager
      if (departmentResults.length === 0) {
        return res.status(404).json({ message: 'Department not found for this manager' });
      }

      let departmentId = departmentResults[0].departmentID;

      // Third query to get the projects based on the departmentId
      db.query('SELECT * FROM projects WHERE departmentID = ?', [departmentId], (error, projectResults) => {
        if (error) {
          return res.status(500).json({ message: 'Failed to fetch projects', error });
        }

        // Send back the project results
        res.json(projectResults);
      });
    });
  });
});

app.get('/departmentEmployees', (req, res) => {
  const { departmentId } = req.query;
  if (!departmentId) {
    return res.status(400).json({ message: 'Department ID is required' });
  }
  console.log("department id: ",departmentId);
  const query = 'SELECT * FROM employees WHERE departmentID = ?';
  db.query(query, [departmentId], (error, results) => {
    if (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({ message: 'Error fetching employees' });
    }
    res.json(results);
  });
});


app.get('/holidays',(req,res)=>{
  const query = 'SELECT * FROM holidays ORDER BY date ASC';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching holidays:', error);
      return res.status(500).json({ message: 'Error fetching holidays' });
    }
    // Send the results as the response
    res.json(results);
  });
});

app.post('/apply-leave', (req, res) => {
  const name = req.session.user.name;
  console.log("body: ",req.body);
  const {reason, start_date,end_date} = req.body;
  console.log("leave: ",name,reason,start_date,end_date);
  if ( !start_date || !end_date || !reason) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // First, fetch the employeeID using the name from the session
  db.query('SELECT employeeID FROM employees WHERE name = ?', [name], (error, results) => {
    if (error || results.length === 0) {
      console.error('Error finding employee:', error);
      return res.status(500).json({ success: false, message: 'Error finding employee' });
    }

    const employee_id = results[0].employeeID;

    // Now we have the employee_id, we can insert into the leave_requests table
    const insertQuery = `
      INSERT INTO leave_requests (employee_id, start_date, end_date, reason, status) 
      VALUES (?, ?, ?, ?, 'pending');
    `;
    
    db.query(insertQuery, [employee_id, start_date, end_date, reason], (insertError, insertResults) => {
      if (insertError) {
        console.error('Error applying for leave:', insertError);
        return res.status(500).json({ success: false, message: 'Error applying for leave' });
      }
      res.json({ success: true, message: 'Leave application submitted successfully', applicationId: insertResults.insertId });
    });
  });
});

app.get('/leave-applications', (req, res) => {
  const { departmentId, status } = req.query;

  // Input validation (basic example, consider more robust validation)
  if (!departmentId || !status) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  
  console.log("department id: ", departmentId);
  console.log("status: ", status);

  // Assuming 'leave_requests' table has a 'departmentId' column and a 'status' column
  const query = `
    SELECT lr.*, e.name AS employeeName
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.employeeID
    WHERE e.departmentID = ? AND lr.status = ?`;

  // Use the callback pattern to handle the database query
  db.query(query, [departmentId, status], (error, results) => {
    if (error) {
      console.error('Database Error:', error);
      return res.status(500).json({ message: 'Failed to fetch leave applications' });
    }
    // Send the results as the response
    res.json({ leaveApplications: results });
  });
});

// Route to approve a leave application
app.put('/leave-applications/approve/:applicationId', (req, res) => {
  const { applicationId } = req.params;

  const approveQuery = 'UPDATE leave_requests SET status = "approved" WHERE id = ?';

  db.query(approveQuery, [applicationId], (error, results) => {
    if (error) {
      console.error('Error approving leave application:', error);
      return res.status(500).json({ message: 'Failed to approve leave application' });
    }

    // Check if the query affected any rows (i.e., successfully updated an entry)
    if (results.affectedRows > 0) {
      res.json({ success: true, message: 'Leave application approved' });
    } else {
      res.status(404).json({ success: false, message: 'Leave application not found' });
    }
  });
});

// Route to reject a leave application
app.put('/leave-applications/reject/:applicationId', (req, res) => {
  const { applicationId } = req.params; // Use application ID instead of employee ID
  const { reason } = req.body; // The reason for rejection

  // Ensure the rejection reason is provided
  if (!reason) {
    return res.status(400).json({ message: 'Rejection reason is required' });
  }

  // Adjust the query to target the application by its unique ID
  const rejectQuery = 'UPDATE leave_requests SET status = "denied", rejection_reason = ? WHERE id = ?';

  db.query(rejectQuery, [reason, applicationId], (error, results) => {
    if (error) {
      console.error('Error rejecting leave application:', error);
      return res.status(500).json({ message: 'Failed to reject leave application' });
    }

    // Check if the query affected any rows
    if (results.affectedRows > 0) {
      res.json({ success: true, message: 'Leave application rejected' });
    } else {
      res.status(404).json({ success: false, message: 'Leave application not found' });
    }
  });
});


app.get('/leave-requests-employee', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const employeeName = req.session.user.name;
  console.log("Employee name: ", employeeName);

  // First, query to find the employee ID based on the name
  const employeeQuery = 'SELECT employeeID FROM employees WHERE name = ?';
  db.query(employeeQuery, [employeeName], (error, employeeResults) => {
    if (error) {
      console.error('Error fetching employee ID:', error);
      return res.status(500).json({ success: false, message: 'Error fetching employee ID' });
    }

    if (employeeResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const employeeId = employeeResults[0].employeeID;
    console.log("Employee ID: ", employeeId);

    // Now, use the employee ID to fetch leave requests
    const leaveRequestsQuery = `
      SELECT *, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at_formatted, DATE_FORMAT(updated_at, '%Y-%m-%d') AS updated_at_formatted 
      FROM leave_requests 
      WHERE employee_id = ? 
      ORDER BY created_at DESC
    `;

    db.query(leaveRequestsQuery, [employeeId], (error, leaveResults) => {
      if (error) {
        console.error('Error fetching leave requests:', error);
        return res.status(500).json({ success: false, message: 'Error fetching leave requests' });
      }

      const leaveRequests = leaveResults.map(req => {
        return {
          ...req,
          created_at: req.created_at_formatted,
          updated_at: req.updated_at_formatted
        };
      });

      res.json({ success: true, leaveRequests });
    });
  });
});

app.post('/verify-and-record-payment', (req, res) => {
  const { employeeId, paymentId, amount, months, paymentDate } = req.body;
  console.log("body: ",req.body);

  // Query the database to get the employee's payment ID
  db.query('SELECT payment_id FROM employees WHERE employeeID = ?', [employeeId], (employeeError, employeeResults) => {
    if (employeeError) {
      console.error('Error verifying payment:', employeeError);
      return res.status(500).json({ success: false, message: 'Failed to verify and record payment' });
    }

    console.log("employee results id: ",employeeResults[0].payment_id);
    console.log("payment id: ",paymentId);

    // Check if the employee exists and if the payment ID matches
    if (employeeResults.length > 0 && parseInt(employeeResults[0].payment_id, 10) === parseInt(paymentId, 10)) {
      // Record the payment in the payments table
      db.query('INSERT INTO employee_payments (employee_id, amount, months, payment_date,stripe_payment_method_id,status) VALUES (?, ?, ?, ?,?,"success")', [employeeId, amount, months, paymentDate,paymentId], (insertError, insertResults) => {
        if (insertError) {
          console.error('Error recording payment:', insertError);
          return res.status(500).json({ success: false, message: 'Failed to record payment' });
        }
        // Send a success response
        res.json({ success: true, message: 'Payment verified and recorded successfully' });
      });
    } else {
      // If the payment ID does not match, send an error response
      res.status(400).json({ success: false, message: 'Invalid payment ID' });
    }
  });
});

app.get('/payment-status',(req,res){
  
   const employeeId = req.user.id;

  try {
    // Query your database for payment information related to the employee.
    // The actual query might differ based on your schema.
    const query = `
      SELECT *
      FROM employee_payments
      WHERE employee_id = ?
      ORDER BY payment_date DESC
    `;
    const values = [employeeId];

    // This example uses a mock db object to represent a database operation.
    // You'll need to replace this with your actual database query logic.
    db.query(query, values, (error, results) => {
      if (error) {
        // Handle the error appropriately.
        console.error('Database query error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
      } else {
        // Send the results back to the client.
        res.json({ success: true, payments: results });
      }
    });
  } catch (err) {
    // Catch and handle any errors that occurred during the process.
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


app.post('/create-payment-intent', (req, res) => {
  const { amount, payment_method } = req.body;

  // Note: Assuming amount is already in cents
  stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card'],
    payment_method: payment_method,
    confirm: true,
  })
  .then(paymentIntent => {
    res.json({ clientSecret: paymentIntent.client_secret });
  })
  .catch(error => {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  });
});

app.post('/record-payment', (req, res) => {
  // Extract the Stripe payment method ID from the request body
  const { employeeId, amount, months, paymentDate, status, stripePaymentMethodId } = req.body;

  // Replace 'db' with your actual database connection variable
  db.query(
    `INSERT INTO employee_payments (employee_id, amount, months, payment_date, status, stripe_payment_method_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [employeeId, amount, months, paymentDate, status, stripePaymentMethodId]
  )
  .then(result => {
    res.status(201).json({ success: true, message: 'Payment recorded successfully' });
  })
  .catch(error => {
    console.error('Failed to record payment:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  });
});


app.put('/update-manager-info', (req, res) => {
  const { name, email, address, phoneNumber } = req.body;
  const managerId = req.session.user.id; // Assuming session management

  const query = `
    UPDATE managers
    SET name = ?, email = ?, address = ?, phoneNumber = ?
    WHERE id = ?`;

  db.query(query, [name, email, address, phoneNumber, managerId], (error, results) => {
    if (error) {
      console.error('Error updating manager info:', error);
      return res.status(500).json({ success: false, message: 'Error updating profile' });
    }

    if (results.affectedRows > 0) {
      res.json({ success: true, message: 'Profile updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Manager not found' });
    }
  });
});





app.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ status: 'error', message: 'Could not log out' });
      }
      res.clearCookie('connect.sid'); // 'connect.sid' is the default name for the session ID cookie. Adjust if you're using a different name.
      res.json({ status: 'success', message: 'Logged out successfully' });
    });
  });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});