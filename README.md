# Employee Management System

The Employee Management System is a comprehensive web application designed to streamline the management of employee details, schedules, and administrative processes within an organization. Built with **React and Node.js**, this system offers a user-friendly interface for both administrators and employees to perform various tasks efficiently.

# Features

1. **User Authentication**: Secure login and registration mechanisms for administrators and employees.
2. **Dashboard Views**: Separate dashboard views for Admin, Manager, and Employee roles, each providing role-specific functionalities and data displays.
3. **Employee Management**: Admins can register new employees, manage their details, and assign roles and projects.
4. **Attendance Tracking**: Facilities for recording employee entry and exit times, with options to view and manage attendance records.
5. **Project Management**: Managers and Admins can create, assign, and track ongoing and completed projects.
6. **Leave Management**: Employees can apply for leaves, while Admins and Managers can approve or reject leave requests.
7. **Payment Management**: Admins can manage and record payments, including generating payment statuses and histories.

# Setup

To set up the Employee Management System locally, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory and install the required dependencies using npm install.
3. Start the development server with **npm run dev**.
4. Access the application through http://localhost:3002 in your browser.
5. Run the backend **server.js** file by **node server.js** command
6. Make sure you have Node.js and npm installed on your system before proceeding with the setup.

# Website Pages

* **HomePage:** A welcoming interface that outlines the services offered by **TechSolutions Inc.**, with quick navigation options for services, about us, and contact information. A dedicated employee login button provides easy access to the system.

* **AboutPage:** Detailed information about TechSolutions Inc., including our mission, services offered, and history. Navigation buttons to go back home or to the login page are provided for convenience.

* **HelpPage:** Offers support through FAQs, contact information for further assistance, and access to extensive documentation. Also includes navigation to login and home for ease of use.

# Dashboards

* **Admin Dashboard:** Admin users can register new employees, manage their details, assign roles and projects, and have access to employee registration forms along with search and filter capabilities for employee management.

* **Employee Dashboard:** Provides employees with personal details, leave application forms, a view of ongoing and completed projects, and payment status information. Employees can apply for leaves and view their leave status.

* **Manager Dashboard:** Features for managing projects and employees, reviewing leave applications, and paying salaries. Managers can view and edit their profile, manage projects (including updating project statuses and marking projects as completed), and handle employee leave requests with options to approve or reject.

# Usage

Upon successful setup, you can use the application as follows:

* **Login/Register**: Start by registering as an Admin or logging in with existing credentials.
* **Dashboard Navigation**: Use the dashboard specific to your role (Admin/Manager/Employee) to access various functionalities.
* **Employee Registration**: Admins can register new employees through the Admin Dashboard.
* **Attendance and Leave Management**: Employees can mark their attendance and apply for leaves through their dashboard.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


