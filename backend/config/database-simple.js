const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const JobTitle = require('../models/JobTitle');

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
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
    } else {
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      
      const adminUser = new User({
        name: 'System Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'Admin'
      });
      
      await adminUser.save();
      console.log('👤 Default admin user created (admin@example.com / Admin@123)');
    }
    
    // Check if HR user already exists
    const existingHR = await User.findOne({ email: 'hr@example.com' });
    if (existingHR) {
      console.log('👤 HR user already exists');
    } else {
      const hrPassword = await bcrypt.hash('Hr@123', 12);
      const hrUser = new User({
        name: 'HR Manager',
        email: 'hr@example.com',
        password: hrPassword,
        role: 'HR'
      });
      
      await hrUser.save();
      console.log('👤 Default HR user created (hr@example.com / Hr@123)');
    }
    
    // Check if Viewer user already exists
    const existingViewer = await User.findOne({ email: 'viewer@example.com' });
    if (existingViewer) {
      console.log('👤 Viewer user already exists');
    } else {
      const viewerPassword = await bcrypt.hash('Viewer@123', 12);
      const viewerUser = new User({
        name: 'Viewer User',
        email: 'viewer@example.com',
        password: viewerPassword,
        role: 'Viewer'
      });
      
      await viewerUser.save();
      console.log('👤 Default Viewer user created (viewer@example.com / Viewer@123)');
    }
    
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
        status: 'Active',
        createdBy: null // Will be set by system
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
        status: 'Active',
        createdBy: null
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
        status: 'Active',
        createdBy: null
      }
    ];
    
    await Employee.insertMany(employees);
    console.log('👥 Sample employees created');
    
  } catch (error) {
    console.error('❌ Error creating employees:', error);
    throw error;
  }
}

module.exports = initializeDatabase;
