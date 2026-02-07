// MongoDB initialization script for Docker
db = db.getSiblingDB('employee_management');

// Create collections
db.createCollection('users');
db.createCollection('employees');
db.createCollection('departments');
db.createCollection('jobtitles');
db.createCollection('attendances');
db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "googleId": 1 }, { sparse: true });
db.employees.createIndex({ "email": 1 }, { unique: true });
db.employees.createIndex({ "employeeId": 1 }, { unique: true });
db.departments.createIndex({ "name": 1 }, { unique: true });
db.jobtitles.createIndex({ "title": 1 }, { unique: true });
db.attendances.createIndex({ "employee": 1, "date": 1 });
db.notifications.createIndex({ "user": 1, "createdAt": -1 });

print('Database initialized successfully');

// Insert sample data
try {
  // Sample departments
  db.departments.insertMany([
    {
      name: "Human Resources",
      description: "Manages employee relations and company policies",
      manager: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Information Technology",
      description: "Manages technology infrastructure and software development",
      manager: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Finance",
      description: "Manages financial operations and accounting",
      manager: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Sample job titles
  db.jobtitles.insertMany([
    {
      title: "Software Engineer",
      description: "Develops and maintains software applications",
      department: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "HR Manager",
      description: "Manages human resources operations",
      department: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Financial Analyst",
      description: "Analyzes financial data and creates reports",
      department: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  print('Sample data inserted successfully');
} catch (error) {
  print('Error inserting sample data: ' + error);
}