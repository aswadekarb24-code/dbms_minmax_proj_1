-- 1. CLEANUP
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Students;
DROP TABLE IF EXISTS Professors;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS Departments;

-- 2. CREATE TABLES

-- Table 1: Departments
-- Constraint: Standard Primary Key
CREATE TABLE Departments (
    dept_id SERIAL PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    building_location VARCHAR(100)
);

-- Table 2: Roles (Lookup table for 3NF)
CREATE TABLE Roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE -- e.g., 'Admin', 'Professor', 'Student'
);

-- Table 3: Users (Authentication)
-- Constraint: Foreign Key to Roles
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL, -- In real app, hash this!
    role_id INT REFERENCES Roles(role_id) ON DELETE RESTRICT
);

-- Table 4: Professors
-- Constraint: One-to-One with Users (ON DELETE CASCADE)
-- Constraint: Many-to-One with Departments (ON DELETE SET NULL)
CREATE TABLE Professors (
    prof_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES Users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dept_id INT REFERENCES Departments(dept_id) ON DELETE SET NULL,
    hire_date DATE DEFAULT CURRENT_DATE
);

-- Table 5: Students
-- Constraint: One-to-One with Users (ON DELETE CASCADE)
-- Constraint: Many-to-One with Departments (ON DELETE RESTRICT - can't delete dept if students exist)
CREATE TABLE Students (
    student_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES Users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dept_id INT REFERENCES Departments(dept_id) ON DELETE RESTRICT,
    enrollment_year INT NOT NULL
);

-- Table 6: Courses
-- Constraint: Linked to Professor. If Prof deleted, set to NULL (course still exists).
CREATE TABLE Courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    credits INT CHECK (credits > 0),
    dept_id INT REFERENCES Departments(dept_id) ON DELETE CASCADE,
    prof_id INT REFERENCES Professors(prof_id) ON DELETE SET NULL
);

-- Table 7: Enrollments
-- Constraint: Many-to-Many link (Student <-> Course).
-- If Student or Course is deleted, the enrollment record is deleted (CASCADE).
CREATE TABLE Enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES Students(student_id) ON DELETE CASCADE,
    course_id INT REFERENCES Courses(course_id) ON DELETE CASCADE,
    grade VARCHAR(2),
    UNIQUE(student_id, course_id) -- Prevent double enrollment
);

-- 3. SEED DATA

-- Roles
INSERT INTO Roles (role_name) VALUES ('Admin'), ('Professor'), ('Student');

-- Departments
INSERT INTO Departments (dept_name, building_location) VALUES 
('Computer Science', 'Building A'),
('Mathematics', 'Building B'),
('Physics', 'Building C');

-- Users (1 Admin, 2 Profs, 2 Students)
INSERT INTO Users (username, password_hash, role_id) VALUES 
('admin', 'admin123', 1),
('prof_turing', 'pass123', 2),
('prof_curie', 'pass123', 2),
('student_alice', 'pass123', 3),
('student_bob', 'pass123', 3);

-- Professors
INSERT INTO Professors (user_id, first_name, last_name, dept_id) VALUES 
(2, 'Alan', 'Turing', 1),
(3, 'Marie', 'Curie', 3);

-- Students
INSERT INTO Students (user_id, first_name, last_name, dept_id, enrollment_year) VALUES 
(4, 'Alice', 'Wonderland', 1, 2023),
(5, 'Bob', 'Builder', 2, 2024);

-- Courses
INSERT INTO Courses (course_name, credits, dept_id, prof_id) VALUES 
('Database Systems', 4, 1, 1),
('Quantum Mechanics', 3, 3, 2),
('Calculus I', 4, 2, NULL); -- No professor assigned yet

-- Enrollments
INSERT INTO Enrollments (student_id, course_id, grade) VALUES 
(1, 1, 'A'), -- Alice in DB Systems
(1, 3, 'B'), -- Alice in Calculus
(2, 3, 'A'); -- Bob in Calculus