// ============================================
// ATTENDANCE MANAGEMENT - TYPE DEFINITIONS
// ============================================

/**
 * Attendance Status Enum
 * Represents the current state of an employee's attendance
 */
export enum AttendanceStatus {
  NOT_CHECKED_IN = 'not_checked_in',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  ABSENT = 'absent',
  ON_LEAVE = 'on_leave',
}

/**
 * Time of Day Enum
 * Used for greeting messages
 */
export enum TimeOfDay {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
}

/**
 * Attendance Record Interface
 * Complete structure for a single attendance entry
 */
export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD format
  checkInTime: string | null; // ISO 8601 format
  checkOutTime: string | null; // ISO 8601 format
  totalWorkingHours: number | null; // in hours (decimal)
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Today's Attendance Interface
 * Simplified view for current day
 */
export interface TodayAttendance {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number | null;
  status: AttendanceStatus;
}

/**
 * Attendance Summary Interface
 * Monthly/weekly statistics
 */
export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  totalWorkingHours: number;
  averageWorkingHours: number;
  attendancePercentage: number;
}

/**
 * Attendance Filter Interface
 * For filtering attendance records
 */
export interface AttendanceFilter {
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
}

/**
 * Check-In Request Interface
 */
export interface CheckInRequest {
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
}

/**
 * Check-Out Request Interface
 */
export interface CheckOutRequest {
  userId: string;
  timestamp: string;
  notes?: string;
}

/**
 * Attendance Response Interface
 * API response structure
 */
export interface AttendanceResponse {
  success: boolean;
  message: string;
  data?: AttendanceRecord;
  error?: string;
}

/**
 * Date Time Info Interface
 * Current date and time information
 */
export interface DateTimeInfo {
  date: string; // "Monday, 10 February 2026"
  time: string; // "14:30:45"
  timeOfDay: TimeOfDay;
  greeting: string; // "Good Afternoon"
  timestamp: number;
  isoString: string;
}
