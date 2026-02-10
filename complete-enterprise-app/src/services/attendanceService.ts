// ============================================
// ATTENDANCE SERVICE - BUSINESS LOGIC
// ============================================

import {
  AttendanceRecord,
  AttendanceStatus,
  TodayAttendance,
  AttendanceSummary,
  CheckInRequest,
  CheckOutRequest,
  AttendanceResponse,
} from '../types/attendance'
import { formatDateYMD, calculateWorkingHours, getCurrentMonthRange } from '../utils/dateTimeUtils'

// In-memory storage (replace with API calls in production)
let attendanceRecords: AttendanceRecord[] = []

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get today's attendance for a user
 */
export const getTodayAttendance = (userId: string): TodayAttendance => {
  const today = formatDateYMD(new Date())
  const record = attendanceRecords.find(
    (r) => r.userId === userId && r.date === today
  )

  if (!record) {
    return {
      hasCheckedIn: false,
      hasCheckedOut: false,
      checkInTime: null,
      checkOutTime: null,
      workingHours: null,
      status: AttendanceStatus.NOT_CHECKED_IN,
    }
  }

  return {
    hasCheckedIn: !!record.checkInTime,
    hasCheckedOut: !!record.checkOutTime,
    checkInTime: record.checkInTime,
    checkOutTime: record.checkOutTime,
    workingHours: record.totalWorkingHours,
    status: record.status,
  }
}

/**
 * Check-in user
 * Validates: User can only check-in once per day
 */
export const checkIn = (request: CheckInRequest): AttendanceResponse => {
  const today = formatDateYMD(new Date())
  
  // Check if already checked in today
  const existingRecord = attendanceRecords.find(
    (r) => r.userId === request.userId && r.date === today
  )

  if (existingRecord && existingRecord.checkInTime) {
    return {
      success: false,
      message: 'You have already checked in today',
      error: 'ALREADY_CHECKED_IN',
    }
  }

  const now = new Date().toISOString()
  
  if (existingRecord) {
    // Update existing record
    existingRecord.checkInTime = request.timestamp
    existingRecord.status = AttendanceStatus.CHECKED_IN
    existingRecord.updatedAt = now
    existingRecord.notes = request.notes

    return {
      success: true,
      message: 'Checked in successfully',
      data: existingRecord,
    }
  }

  // Create new record
  const newRecord: AttendanceRecord = {
    id: generateId(),
    userId: request.userId,
    userName: request.userName,
    date: today,
    checkInTime: request.timestamp,
    checkOutTime: null,
    totalWorkingHours: null,
    status: AttendanceStatus.CHECKED_IN,
    notes: request.notes,
    createdAt: now,
    updatedAt: now,
  }

  attendanceRecords.push(newRecord)

  return {
    success: true,
    message: 'Checked in successfully',
    data: newRecord,
  }
}

/**
 * Check-out user
 * Validates: User must be checked in before checking out
 */
export const checkOut = (request: CheckOutRequest): AttendanceResponse => {
  const today = formatDateYMD(new Date())
  
  const record = attendanceRecords.find(
    (r) => r.userId === request.userId && r.date === today
  )

  if (!record) {
    return {
      success: false,
      message: 'No check-in record found for today',
      error: 'NO_CHECK_IN',
    }
  }

  if (!record.checkInTime) {
    return {
      success: false,
      message: 'You must check in before checking out',
      error: 'NOT_CHECKED_IN',
    }
  }

  if (record.checkOutTime) {
    return {
      success: false,
      message: 'You have already checked out today',
      error: 'ALREADY_CHECKED_OUT',
    }
  }

  // Update record
  record.checkOutTime = request.timestamp
  record.totalWorkingHours = calculateWorkingHours(record.checkInTime, request.timestamp)
  record.status = AttendanceStatus.CHECKED_OUT
  record.updatedAt = new Date().toISOString()
  if (request.notes) {
    record.notes = request.notes
  }

  return {
    success: true,
    message: 'Checked out successfully',
    data: record,
  }
}

/**
 * Get attendance records for a user
 */
export const getAttendanceRecords = (
  userId: string,
  limit: number = 30
): AttendanceRecord[] => {
  return attendanceRecords
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

/**
 * Get monthly attendance summary
 */
export const getMonthlyAttendanceSummary = (userId: string): AttendanceSummary => {
  const { start, end } = getCurrentMonthRange()
  
  const monthRecords = attendanceRecords.filter(
    (r) => r.userId === userId && r.date >= start && r.date <= end
  )

  const totalDays = monthRecords.length
  const presentDays = monthRecords.filter(
    (r) => r.status === AttendanceStatus.CHECKED_IN || r.status === AttendanceStatus.CHECKED_OUT
  ).length
  const absentDays = monthRecords.filter((r) => r.status === AttendanceStatus.ABSENT).length
  const leaveDays = monthRecords.filter((r) => r.status === AttendanceStatus.ON_LEAVE).length
  
  const totalWorkingHours = monthRecords.reduce(
    (sum, r) => sum + (r.totalWorkingHours || 0),
    0
  )
  
  const averageWorkingHours = presentDays > 0 ? totalWorkingHours / presentDays : 0
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

  return {
    totalDays,
    presentDays,
    absentDays,
    leaveDays,
    totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
    averageWorkingHours: Math.round(averageWorkingHours * 100) / 100,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100,
  }
}

/**
 * Get all attendance records (for admin)
 */
export const getAllAttendanceRecords = (): AttendanceRecord[] => {
  return attendanceRecords.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

/**
 * Initialize with sample data (for demo)
 * Creates 90 days of attendance history with realistic patterns
 */
export const initializeSampleData = (userId: string, userName: string) => {
  const today = new Date()
  
  // Generate 90 days of attendance history
  for (let i = 1; i <= 90; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue
    }
    
    // Random patterns for realistic data
    const randomFactor = Math.random()
    
    // 5% chance of being absent
    if (randomFactor < 0.05) {
      const record: AttendanceRecord = {
        id: generateId(),
        userId,
        userName,
        date: formatDateYMD(date),
        checkInTime: null,
        checkOutTime: null,
        totalWorkingHours: null,
        status: AttendanceStatus.ABSENT,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      }
      attendanceRecords.push(record)
      continue
    }
    
    // 3% chance of being on leave
    if (randomFactor < 0.08) {
      const record: AttendanceRecord = {
        id: generateId(),
        userId,
        userName,
        date: formatDateYMD(date),
        checkInTime: null,
        checkOutTime: null,
        totalWorkingHours: null,
        status: AttendanceStatus.ON_LEAVE,
        notes: 'Approved Leave',
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      }
      attendanceRecords.push(record)
      continue
    }
    
    // Varied check-in times (8:30 AM - 9:30 AM)
    const checkInHour = 8
    const checkInMinute = Math.floor(Math.random() * 60) + 30
    const checkInTime = new Date(date)
    checkInTime.setHours(checkInHour, checkInMinute > 59 ? checkInMinute - 60 : checkInMinute, 0, 0)
    if (checkInMinute > 59) checkInTime.setHours(9)
    
    // Varied check-out times (5:00 PM - 6:30 PM)
    const checkOutHour = 17
    const checkOutMinute = Math.floor(Math.random() * 90)
    const checkOutTime = new Date(date)
    checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0)
    if (checkOutMinute > 59) {
      checkOutTime.setHours(18, checkOutMinute - 60, 0, 0)
    }
    
    const workingHours = calculateWorkingHours(
      checkInTime.toISOString(),
      checkOutTime.toISOString()
    )
    
    const record: AttendanceRecord = {
      id: generateId(),
      userId,
      userName,
      date: formatDateYMD(date),
      checkInTime: checkInTime.toISOString(),
      checkOutTime: checkOutTime.toISOString(),
      totalWorkingHours: workingHours,
      status: AttendanceStatus.CHECKED_OUT,
      createdAt: checkInTime.toISOString(),
      updatedAt: checkOutTime.toISOString(),
    }
    
    attendanceRecords.push(record)
  }
}
