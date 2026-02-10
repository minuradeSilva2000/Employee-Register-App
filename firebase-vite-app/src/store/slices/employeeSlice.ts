/**
 * Employee Management Redux Slice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee, Department, LeaveRequest, Attendance } from '../../types/enterprise';

interface EmployeeState {
  employees: Employee[];
  departments: Department[];
  leaveRequests: LeaveRequest[];
  attendance: Attendance[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  departments: [],
  leaveRequests: [],
  attendance: [],
  selectedEmployee: null,
  loading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.unshift(action.payload);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter(e => e.id !== action.payload);
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
    },
    setLeaveRequests: (state, action: PayloadAction<LeaveRequest[]>) => {
      state.leaveRequests = action.payload;
    },
    updateLeaveRequest: (state, action: PayloadAction<LeaveRequest>) => {
      const index = state.leaveRequests.findIndex(l => l.id === action.payload.id);
      if (index !== -1) {
        state.leaveRequests[index] = action.payload;
      }
    },
    setAttendance: (state, action: PayloadAction<Attendance[]>) => {
      state.attendance = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setSelectedEmployee,
  setDepartments,
  setLeaveRequests,
  updateLeaveRequest,
  setAttendance,
  setLoading,
  setError,
} = employeeSlice.actions;

export default employeeSlice.reducer;
