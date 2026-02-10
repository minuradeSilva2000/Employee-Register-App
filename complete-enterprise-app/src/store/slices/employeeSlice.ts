// ============================================
// EMPLOYEE SLICE - Employee Management State
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Employee {
  id: number
  name: string
  email: string
  phone: string
  department: string
  position: string
  status: 'active' | 'on-leave' | 'inactive'
  joinDate: string
  avatar?: string
}

interface EmployeeState {
  employees: Employee[]
  selectedEmployee: Employee | null
  searchTerm: string
  departmentFilter: string
  statusFilter: 'all' | 'active' | 'on-leave' | 'inactive'
  loading: boolean
}

const initialState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
  searchTerm: '',
  departmentFilter: 'all',
  statusFilter: 'all',
  loading: false,
}

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.unshift(action.payload)
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(e => e.id === action.payload.id)
      if (index !== -1) {
        state.employees[index] = action.payload
      }
    },
    deleteEmployee: (state, action: PayloadAction<number>) => {
      state.employees = state.employees.filter(e => e.id !== action.payload)
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setDepartmentFilter: (state, action: PayloadAction<string>) => {
      state.departmentFilter = action.payload
    },
    setStatusFilter: (state, action: PayloadAction<'all' | 'active' | 'on-leave' | 'inactive'>) => {
      state.statusFilter = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const {
  setEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setSelectedEmployee,
  setSearchTerm,
  setDepartmentFilter,
  setStatusFilter,
  setLoading,
} = employeeSlice.actions

export default employeeSlice.reducer
