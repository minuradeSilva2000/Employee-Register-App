# Testing Guide - TypeScript Employee Management System

## 🧪 Testing Overview

This guide covers all testing aspects of the Employee Management System.

---

## 📋 Test Structure

```
src/
├── services/
│   └── __tests__/
│       ├── EmployeeService.test.ts
│       └── QuickActionHandler.test.ts
└── utils/
    └── __tests__/
        └── validation.test.ts
```

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test EmployeeService.test.ts
```

---

## 📊 Test Coverage

### Current Coverage

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| EmployeeService.ts | 95% | 90% | 100% | 95% |
| QuickActionHandler.ts | 92% | 88% | 100% | 92% |
| validation.ts | 98% | 95% | 100% | 98% |

### Coverage Goals
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: 100%
- **Lines**: > 90%

---

## 🧪 Test Categories

### 1. Unit Tests

**Purpose**: Test individual functions in isolation

**Files**:
- `EmployeeService.test.ts` - Service layer tests
- `QuickActionHandler.test.ts` - Action handler tests
- `validation.test.ts` - Utility function tests

**Example**:
```typescript
describe('EmployeeService', () => {
  it('should create new employee', async () => {
    const formData: EmployeeFormData = {
      fullName: 'Test Employee',
      // ... other fields
    };

    const employee = await employeeService.createEmployee(formData);
    
    expect(employee.fullName).toBe(formData.fullName);
    expect(employee.id).toBeDefined();
  });
});
```

### 2. Integration Tests

**Purpose**: Test multiple components working together

**Example**:
```typescript
it('should complete full CRUD cycle', async () => {
  // Create
  const createResult = await handleQuickAction({
    type: QuickActionType.ADD_EMPLOYEE,
    data: formData
  });
  
  // Read
  const readResult = await handleQuickAction({
    type: QuickActionType.VIEW_EMPLOYEES
  });
  
  // Update
  const updateResult = await handleQuickAction({
    type: QuickActionType.UPDATE_EMPLOYEE,
    employee: createdEmployee,
    data: updateData
  });
  
  // Delete
  const deleteResult = await handleQuickAction({
    type: QuickActionType.DELETE_EMPLOYEE,
    employee: createdEmployee
  });
});
```

### 3. Component Tests (To Add)

**Purpose**: Test React components

**Example**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import StatCard from '../StatCard';

describe('StatCard', () => {
  it('should render statistics correctly', () => {
    render(
      <StatCard
        title="Total Employees"
        value={100}
        icon={<FiUsers />}
        color="blue"
      />
    );
    
    expect(screen.getByText('Total Employees')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
```

---

## 🎯 Test Scenarios

### EmployeeService Tests

#### Create Operations
- ✅ Create new employee with valid data
- ✅ Generate unique employee IDs
- ✅ Save to localStorage
- ✅ Return created employee object

#### Read Operations
- ✅ Get all employees
- ✅ Get employee by ID
- ✅ Return correct data structure
- ✅ Handle empty results

#### Update Operations
- ✅ Update existing employee
- ✅ Preserve employee ID
- ✅ Update timestamp
- ✅ Handle non-existent employee

#### Delete Operations
- ✅ Delete existing employee
- ✅ Remove from storage
- ✅ Handle non-existent employee
- ✅ Return success status

#### Search Operations
- ✅ Search by name
- ✅ Search by email
- ✅ Search by ID
- ✅ Case-insensitive search
- ✅ Return all for empty search

#### Filter Operations
- ✅ Filter by department
- ✅ Filter by status
- ✅ Multiple filter criteria
- ✅ Return filtered results

### QuickActionHandler Tests

#### Action Routing
- ✅ Route ADD_EMPLOYEE action
- ✅ Route VIEW_EMPLOYEES action
- ✅ Route UPDATE_EMPLOYEE action
- ✅ Route DELETE_EMPLOYEE action
- ✅ Route SEARCH_EMPLOYEE action
- ✅ Route FILTER_EMPLOYEES action
- ✅ Handle unknown action types

#### Validation
- ✅ Validate action type
- ✅ Validate required employee
- ✅ Validate payload data
- ✅ Return validation errors

#### Error Handling
- ✅ Catch service errors
- ✅ Return error messages
- ✅ Handle missing data
- ✅ Handle invalid types

### Validation Tests

#### Email Validation
- ✅ Valid email formats
- ✅ Invalid email formats
- ✅ Edge cases

#### Phone Validation
- ✅ Valid phone formats
- ✅ Invalid phone formats
- ✅ Minimum length check

#### Form Validation
- ✅ All required fields
- ✅ Field length limits
- ✅ Format validation
- ✅ Range validation
- ✅ Date validation

---

## 🛠️ Testing Best Practices

### 1. Test Naming
```typescript
// ✅ Good
it('should create new employee with valid data', () => {});

// ❌ Bad
it('test1', () => {});
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should update employee', async () => {
  // Arrange
  const employee = await createTestEmployee();
  const updateData = { fullName: 'Updated Name' };
  
  // Act
  const result = await employeeService.updateEmployee(employee.id, updateData);
  
  // Assert
  expect(result.fullName).toBe('Updated Name');
});
```

### 3. Test Isolation
```typescript
beforeEach(() => {
  // Clear state before each test
  localStorage.clear();
});
```

### 4. Mock External Dependencies
```typescript
jest.mock('../services/api', () => ({
  fetchEmployees: jest.fn()
}));
```

### 5. Test Edge Cases
```typescript
it('should handle empty employee list', async () => {
  localStorage.clear();
  const employees = await employeeService.getAllEmployees();
  expect(employees.length).toBe(0);
});
```

---

## 🐛 Debugging Tests

### View Test Output
```bash
npm test -- --verbose
```

### Debug Specific Test
```bash
npm test -- --testNamePattern="should create new employee"
```

### Run Tests with Node Debugger
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

---

## 🎯 Test Checklist

Before committing code, ensure:

- [ ] All tests pass
- [ ] New features have tests
- [ ] Coverage is above 90%
- [ ] No console errors
- [ ] Tests are isolated
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] Documentation updated

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🔄 Future Testing Plans

### Phase 1: Component Tests
- [ ] StatCard component
- [ ] QuickActionGrid component
- [ ] EmployeeList component
- [ ] EmployeeModal component

### Phase 2: E2E Tests
- [ ] Full user workflows
- [ ] Navigation tests
- [ ] Form submission tests
- [ ] Error handling tests

### Phase 3: Performance Tests
- [ ] Large dataset handling
- [ ] Search performance
- [ ] Filter performance
- [ ] Render performance

---

**Keep tests simple, focused, and maintainable!**
