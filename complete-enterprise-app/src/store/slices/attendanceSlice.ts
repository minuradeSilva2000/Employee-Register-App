// ============================================
// ATTENDANCE SLICE - Attendance State Management
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AttendanceRecord, TodayAttendance } from '../../types/attendance'

interface AttendanceState {
  todayAttendance: TodayAttendance | null
  records: AttendanceRecord[]
  loading: boolean
  error: string | null
}

const initialState: AttendanceState = {
  todayAttendance: null,
  records: [],
  loading: false,
  error: null,
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setTodayAttendance: (state, action: PayloadAction<TodayAttendance>) => {
      state.todayAttendance = action.payload
    },
    setRecords: (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.records = action.payload
    },
    addRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      state.records.unshift(action.payload)
    },
    updateRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      const index = state.records.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.records[index] = action.payload
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setTodayAttendance,
  setRecords,
  addRecord,
  updateRecord,
  setLoading,
  setError,
} = attendanceSlice.actions

export default attendanceSlice.reducer
