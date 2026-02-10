// ============================================
// AUTH SLICE - Authentication State Management
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'admin' | 'manager' | 'employee'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  department?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
      
      // Store in localStorage
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      state.error = null
      
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    restoreSession: (state) => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        state.token = token
        state.user = JSON.parse(userStr)
        state.isAuthenticated = true
      }
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  restoreSession,
} = authSlice.actions

export default authSlice.reducer
