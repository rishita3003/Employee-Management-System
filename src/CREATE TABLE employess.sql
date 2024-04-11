CREATE TABLE users (
    sr_no int auto_increment primary key,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- This should store the bcrypt hash
    role ENUM('Employee','Admin','Manager') NOT NULL, -- Enum type for predefined roles
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    roleID INT,
    FOREIGN KEY (roleID) REFERENCES roles(roleID) ON DELETE SET NULL
);

CREATE TABLE employees (
    employeeID INT AUTO_INCREMENT PRIMARY KEY,
    roleID INT,
    departmentID INT,
    date_of_birth DATE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phoneNumber VARCHAR(20),
    projectID INT,
    salary DECIMAL(10, 2),
    hireDate DATE,
    FOREIGN KEY (roleID) REFERENCES roles(roleID)
        ON DELETE SET NULL,
    FOREIGN KEY (departmentID) REFERENCES departments(departmentID)
        ON DELETE SET NULL
);

create table departments(
    departmentID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    managerID INT,
    FOREIGN KEY (managerID) REFERENCES employees(employeeID) ON DELETE SET NULL
);

create table department_projects(
    departmentID INT,
    projectID INT,
    primary key (departmentID, projectID),
    FOREIGN KEY (departmentID) REFERENCES departments(departmentID) ON DELETE CASCADE,
    FOREIGN KEY (projectID) REFERENCES projects(projectID) ON DELETE CASCADE
);

CREATE TABLE projects (
    projectID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    startDate DATE,
    endDate DATE,
    budget DECIMAL(10, 2), -- Assuming budget is a decimal value. Adjust precision as needed.
    departmentID INT,
    description TEXT,
    status ENUM('Completed', 'Ongoing', 'Dropped') NOT NULL,
    FOREIGN KEY (departmentID) REFERENCES departments(departmentID) 
        ON DELETE SET NULL -- Adjust this action based on your business requirements
);

CREATE TABLE roles (
    roleID INT AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(255) NOT NULL UNIQUE,
    roleDescription TEXT
);

CREATE TABLE employee_projects (
    employeeId INT,
    projectId INT,
    startDate DATE,
    endDate DATE,
    status ENUM('Active', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Active',
    PRIMARY KEY (employeeId, projectId),
    FOREIGN KEY (employeeId) REFERENCES employees(employeeID) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(projectID) ON DELETE CASCADE
);

CREATE TABLE daily_attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    time_in TIME NULL,
    time_out TIME NULL,
    status ENUM('Present', 'Absent', 'Late', 'On Leave', 'Pending') NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (employee_id) REFERENCES employees(employeeID) ON DELETE CASCADE
);



INSERT INTO projects (name, startDate, endDate, budget, departmentID, description, status) VALUES
('Project Apollo', '2022-01-01', '2024-12-31', 100000, 7, 'A project to develop an advanced space module.', 'Ongoing'),
('Project Orion', '2021-03-15', '2021-11-30', 75000, 7, 'A project to create a new constellation mapping system.', 'Completed'),
('Project Artemis','2019-01-01','2022-12-31',100000,8,'A project to develop a new product line.','Ongoing'),
('Project Athena','2020-02-25','2022-11-30',75000,10,'A project to improve employee engagement.','Ongoing');



INSERT INTO department_projects (departmentID, projectID) VALUES
(1, 1),  -- Assuming department 1 is managing project 1
(2, 2);  -- Assuming department 2 is managing project 2

insert into employee_projects (employeeId, projectId, startDate, endDate, status) values
(5, 1, '2022-01-01', '2022-12-31', 'Active'),
(4, 2, '2021-03-15', '2021-11-30', 'Completed');

INSERT INTO departments (name,managerID) VALUES
('Engineering', 1),
('Marketing', 2),
('Finance', 3),
('HR', 4),
('IT', 5),
('Sales', 6);


CREATE TABLE holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description text NOT NULL
);

INSERT INTO holidays (date, name, description) VALUES
('2024-01-14', 'Pongal', 'Pongal is a significant harvest festival celebrated by Tamils across the world, particularly in the Indian state of Tamil Nadu. It spans over four days and marks the end of the winter solstice, signifying the return of the sun to the northern hemisphere. The festival is dedicated to the Sun God, thanking him for agricultural abundance. Each day of Pongal has its significance, with the most important day being the second day, known as Surya Pongal, during which a special dish called "Pongal" (sweet rice) is prepared.'),
('2024-04-14', 'Good Friday', 'Public Holiday: Good Friday is a solemn holiday observed by Christians worldwide to commemorate the crucifixion of Jesus Christ and his death at Calvary. It is a day of mourning, reflection, and fasting, falling on the Friday before Easter Sunday. Many Christian churches hold services that recount the Passion of Christ and his ultimate sacrifice, often including the veneration of the cross and readings from the Gospels.'),
('2024-10-25', 'Dussehra', 'National Holiday: Dussehra, also known as Vijayadashami, is a major Hindu festival celebrated at the end of Navaratri every year. It marks the victory of Lord Rama over the demon king Ravana and the triumph of good over evil, as narrated in the epic Ramayana. In different parts of India, it is celebrated for various reasons and in various ways. Effigies of Ravana are burnt across the country, and dramatic reenactments of the Ramayana are performed, known as Ramlila. The day also marks the victory of the goddess Durga over the buffalo demon Mahishasura.'),
('2024-11-01', 'Kannada Rajyotsava', 'Regional Holiday: Celebrates the formation of the state of Karnataka.'),
('2024-10-02','Gandhi Jayanti',"Gandhi Jayanti is a national festival celebrated to honor the birthday of Mohandas Karamchand Gandhi, the leader of the Indian independence movement against British rule. It is marked by prayer services and tributes all over India, especially at Raj Ghat, Gandhi's memorial in New Delhi."),
('2024-08-30','Janmashtami',"Janmashtami celebrates the birthday of Lord Krishna, an avatar of the god Vishnu. It is marked by devotional songs, dances, fasting, night vigils, and dramatization of episodes from Krishna's life"),
('2024-05-13','Eid-ul-Fitr',"Eid-ul-Fitr marks the end of Ramadan, the Islamic holy month of fasting. This day is determined by the sighting of the moon and is a celebration of the conclusion of 29 or 30 days of dawn-to-sunset fasting. The festival is observed with prayers, gifts, feasting, and giving to charity."),
('2024-01-01',"New Year's Day", 'Public Holiday: The first day of the Gregorian calendar year; widely celebrated as the beginning of a new year.'),
('2024-12-25', 'Christmas', 'Public Holiday:Christmas commemorates the birth of Jesus Christ, observed by billions of people around the world. Celebrations include gift-giving, family and other social gatherings, symbolic decoration, and feasting.'),
('2024-10-02', 'Gandhi Jayanti', "National Holiday:  Gandhi Jayanti is a national festival celebrated to honor the birthday of Mohandas Karamchand Gandhi, the leader of the Indian independence movement against British rule. It is marked by prayer services and tributes all over India, especially at Raj Ghat, Gandhi's memorial in New Delhi."),
('2024-08-15', 'Independence Day', "National Holiday: Independence Day marks the end of British rule in 1947 and the establishment of a free and independent Indian nation. It is celebrated with flag-hoisting ceremonies, cultural events, and speeches across the country."),
('2024-05-01','Labour Day',"Public Holiday: Labour Day, or International Workers' Day, is observed to honor the contributions of workers and the labor movement. It is a day of recognition for workers' rights and a celebration of laborers and the working classes."),
('2024-03-29', 'Holi', 'National Holiday: Holi, also known as the Festival of Colors, celebrates the arrival of spring, the end of winter, and the blossoming of love. It is a day to meet others, play and laugh, forget and forgive, and repair broken relationships. The festival also celebrates the victory of good over evil, associated with the legend of Holika and Prahlad.'),
('2024-01-14', 'Makara Sankranti', 'Regional Holiday:  Makara Sankranti marks the transition of the sun into the zodiac sign of Makara (Capricorn) on its celestial path. This festival is uniquely observed throughout India by different names and is celebrated with distinct traditions. It symbolizes the end of winter and the beginning of longer days. Common festivities include flying kites, bonfires, feasts, and holy dips in rivers.')
('2024-01-26', 'Republic Day', "National Holiday: Republic Day commemorates the date on which the Constitution of India came into effect on January 26, 1950, turning the nation into a newly formed republic. The main event is the Republic Day Parade in the capital, New Delhi, showcasing India's defense capability and cultural and social heritage.");

CREATE TABLE leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'denied') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);


CREATE TABLE roles (
    roleID INT AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(255) NOT NULL UNIQUE,
    roleDescription TEXT
);

-- Create departments table without managerID foreign key

/*CREATE TABLE departments (
    departmentID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
    -- managerID will be added later
);

-- Create employees table
CREATE TABLE employees (
    employeeID INT AUTO_INCREMENT PRIMARY KEY,
    roleID INT,
    departmentID INT,
    date_of_birth DATE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phoneNumber VARCHAR(20),
    salary DECIMAL(10, 2),
    hireDate DATE,
    FOREIGN KEY (roleID) REFERENCES roles(roleID) ON DELETE SET NULL,
    FOREIGN KEY (departmentID) REFERENCES departments(departmentID) ON DELETE SET NULL
);

-- Now add the managerID foreign key to departments
ALTER TABLE departments ADD COLUMN managerID INT;
ALTER TABLE departments ADD CONSTRAINT FK_ManagerID FOREIGN KEY (managerID) REFERENCES employees(employeeID) ON DELETE SET NULL;
*/

CREATE TABLE employee_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    months INT , -- Number of months the payment is for
    payment_date DATE NOT NULL,
    stripe_payment_method_id int, -- This column is for storing the Stripe payment method ID
    status TEXT NOT NULL DEFAULT 'Pending', -- e.g., 'Pending', 'Completed', 'Failed'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employeeID) -- Adjust to match your employees table
);

ALTER TABLE employees ADD COLUMN payment_id INT;




