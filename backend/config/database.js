const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const JobTitle = require('../models/JobTitle');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');

/**
 * Connect to MongoDB and initialize database with sample data
 */
async function initializeDatabase() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Check if database is empty and initialize with sample data
    await initializeSampleData();
    
    // Create indexes for performance
    await createIndexes();
    
    console.log('🎯 Database initialization completed');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Initialize sample data if collections are empty
 */
async function initializeSampleData() {
  try {
    // Check if users collection exists and has data
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('📝 Creating initial data...');
      
      // Create default admin user
      await createDefaultAdmin();
      
      // Create sample departments
      await createSampleDepartments();
      
      // Create sample job titles
      await createSampleJobTitles();
      
      // Create sample employees
      await createSampleEmployees();
      
      // Create sample attendance records
      await createSampleAttendance();
      
      console.log('✅ Sample data created successfully');
    } else {
      console.log('📊 Database already contains data');
    }
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

/**
 * Create default admin user
 */
async function createDefaultAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'Admin'
    });
    
    await adminUser.save();
    console.log('👤 Default admin user created (admin@example.com / Admin@123)');
    
    // Create HR user
    const hrPassword = await bcrypt.hash('Hr@123', 12);
    const hrUser = new User({
      name: 'HR Manager',
      email: 'hr@example.com',
      password: hrPassword,
      role: 'HR'
    });
    
    await hrUser.save();
    console.log('👤 Default HR user created (hr@example.com / Hr@123)');
    
    // Create Viewer user
    const viewerPassword = await bcrypt.hash('Viewer@123', 12);
    const viewerUser = new User({
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: viewerPassword,
      role: 'Viewer'
    });
    
    await viewerUser.save();
    console.log('👤 Default Viewer user created (viewer@example.com / Viewer@123)');
    
  } catch (error) {
    console.error('❌ Error creating default users:', error);
    throw error;
  }
}

/**
 * Create sample departments
 */
async function createSampleDepartments() {
  try {
    const departments = [
      { name: 'Engineering', description: 'Software development and engineering team' },
      { name: 'Human Resources', description: 'HR operations and employee management' },
      { name: 'Sales', description: 'Sales and business development team' },
      { name: 'Marketing', description: 'Marketing and brand management' },
      { name: 'Finance', description: 'Financial planning and accounting' },
      { name: 'Operations', description: 'Operations and logistics management' }
    ];
    
    await Department.insertMany(departments);
    console.log('🏢 Sample departments created');
    
  } catch (error) {
    console.error('❌ Error creating departments:', error);
    throw error;
  }
}

/**
 * Create sample job titles
 */
async function createSampleJobTitles() {
  try {
    const jobTitles = [
      { title: 'Software Engineer', description: 'Develops and maintains software applications' },
      { title: 'Senior Software Engineer', description: 'Lead developer with mentoring responsibilities' },
      { title: 'HR Manager', description: 'Manages HR operations and employee relations' },
      { title: 'Sales Executive', description: 'Handles sales and client relationships' },
      { title: 'Marketing Manager', description: 'Leads marketing campaigns and strategies' },
      { title: 'Financial Analyst', description: 'Analyzes financial data and prepares reports' },
      { title: 'Operations Manager', description: 'Oversees daily operations and logistics' },
      { title: 'Project Manager', description: 'Manages projects and team coordination' },
      { title: 'UX Designer', description: 'Designs user interfaces and experiences' },
      { title: 'Data Analyst', description: 'Analyzes data to provide business insights' }
    ];
    
    await JobTitle.insertMany(jobTitles);
    console.log('💼 Sample job titles created');
    
  } catch (error) {
    console.error('❌ Error creating job titles:', error);
    throw error;
  }
}

/**
 * Create sample employees
 */
async function createSampleEmployees() {
  try {
    // Get departments and job titles for references
    const departments = await Department.find().lean();
    const jobTitles = await JobTitle.find().lean();
    
    const employees = [
      {
        fullName: 'John Smith',
        NIC: '123456789V',
        email: 'john.smith@example.com',
        phone: '+1-555-0101',
        address: '123 Main St, New York, NY 10001',
        jobTitle: jobTitles[0]._id, // Software Engineer
        department: departments[0]._id, // Engineering
        salary: 75000,
        dateJoined: new Date('2022-01-15'),
        status: 'Active'
      },
      {
        fullName: 'Sarah Johnson',
        NIC: '987654321V',
        email: 'sarah.johnson@example.com',
        phone: '+1-555-0102',
        address: '456 Oak Ave, Los Angeles, CA 90001',
        jobTitle: jobTitles[1]._id, // Senior Software Engineer
        department: departments[0]._id, // Engineering
        salary: 95000,
        dateJoined: new Date('2021-03-20'),
        status: 'Active'
      },
      {
        fullName: 'Michael Chen',
        NIC: '456789123V',
        email: 'michael.chen@example.com',
        phone: '+1-555-0103',
        address: '789 Pine St, Chicago, IL 60601',
        jobTitle: jobTitles[2]._id, // HR Manager
        department: departments[1]._id, // Human Resources
        salary: 70000,
        dateJoined: new Date('2020-06-10'),
        status: 'Active'
      },
      {
        fullName: 'Emily Davis',
        NIC: '789123456V',
        email: 'emily.davis@example.com',
        phone: '+1-555-0104',
        address: '321 Elm St, Houston, TX 77001',
        jobTitle: jobTitles[3]._id, // Sales Executive
        department: departments[2]._id, // Sales
        salary: 60000,
        dateJoined: new Date('2022-09-05'),
        status: 'Active'
      },
      {
        fullName: 'Robert Wilson',
        NIC: '321654987V',
        email: 'robert.wilson@example.com',
        phone: '+1-555-0105',
        address: '654 Maple Dr, Phoenix, AZ 85001',
        jobTitle: jobTitles[4]._id, // Marketing Manager
        department: departments[3]._id, // Marketing
        salary: 80000,
        dateJoined: new Date('2021-11-12'),
        status: 'Active'
      },
      {
        fullName: 'Lisa Anderson',
        NIC: '654987321V',
        email: 'lisa.anderson@example.com',
        phone: '+1-555-0106',
        address: '987 Cedar Ln, Philadelphia, PA 19101',
        jobTitle: jobTitles[5]._id, // Financial Analyst
        department: departments[4]._id, // Finance
        salary: 68000,
        dateJoined: new Date('2020-02-28'),
        status: 'Resigned',
        dateResigned: new Date('2023-12-15')
      },
      {
        fullName: 'David Martinez',
        NIC: '147258369V',
        email: 'david.martinez@example.com',
        phone: '+1-555-0107',
        address: '258 Birch Rd, San Antonio, TX 78201',
        jobTitle: jobTitles[6]._id, // Operations Manager
        department: departments[5]._id, // Operations
        salary: 72000,
        dateJoined: new Date('2019-07-22'),
        status: 'Active'
      },
      {
        fullName: 'Jennifer Taylor',
        NIC: '369258147V',
        email: 'jennifer.taylor@example.com',
        phone: '+1-555-0108',
        address: '741 Spruce Way, San Diego, CA 92101',
        jobTitle: jobTitles[7]._id, // Project Manager
        department: departments[0]._id, // Engineering
        salary: 85000,
        dateJoined: new Date('2021-04-18'),
        status: 'Active'
      }
    ];
    
    await Employee.insertMany(employees);
    console.log('👥 Sample employees created');
    
  } catch (error) {
    console.error('❌ Error creating employees:', error);
    throw error;
  }
}

/**
 * Create sample attendance records
 */
async function createSampleAttendance() {
  try {
    const employees = await Employee.find({ status: 'Active' }).lean();
    const attendanceRecords = [];
    
    // Create attendance for the last 30 days
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }
      
      employees.forEach(employee => {
        // Randomly determine attendance status (90% present)
        const isPresent = Math.random() > 0.1;
        
        if (isPresent) {
          // Random check-in time between 8:00 AM and 9:30 AM
          const checkInHour = 8 + Math.floor(Math.random() * 1.5);
          const checkInMinute = Math.floor(Math.random() * 60);
          
          // Random check-out time between 5:00 PM and 7:00 PM
          const checkOutHour = 17 + Math.floor(Math.random() * 2);
          const checkOutMinute = Math.floor(Math.random() * 60);
          
          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
          
          const checkOutTime = new Date(date);
          checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);
          
          attendanceRecords.push({
            employeeId: employee._id,
            date: date,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            status: 'Present'
          });
        } else {
          attendanceRecords.push({
            employeeId: employee._id,
            date: date,
            status: 'Absent'
          });
        }
      });
    }
    
    await Attendance.insertMany(attendanceRecords);
    console.log('📅 Sample attendance records created');
    
  } catch (error) {
    console.error('❌ Error creating attendance records:', error);
    throw error;
  }
}

/**
 * Create database indexes for performance
 */
async function createIndexes() {
  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    
    // Employee indexes
    await Employee.collection.createIndex({ employeeId: 1 }, { unique: true });
    await Employee.collection.createIndex({ email: 1 });
    await Employee.collection.createIndex({ department: 1 });
    await Employee.collection.createIndex({ jobTitle: 1 });
    await Employee.collection.createIndex({ status: 1 });
    
    // Department indexes
    await Department.collection.createIndex({ name: 1 }, { unique: true });
    
    // Job Title indexes
    await JobTitle.collection.createIndex({ title: 1 }, { unique: true });
    
    // Attendance indexes
    await Attendance.collection.createIndex({ employeeId: 1, date: 1 }, { unique: true });
    await Attendance.collection.createIndex({ date: 1 });
    await Attendance.collection.createIndex({ status: 1 });
    
    // Notification indexes
    await Notification.collection.createIndex({ userId: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });
    await Notification.collection.createIndex({ isRead: 1 });
    
    console.log('🔍 Database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

module.exports = initializeDatabase;
