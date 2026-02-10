// ============================================
// DATE & TIME UTILITY FUNCTIONS
// ============================================

import { TimeOfDay, DateTimeInfo } from '../types/attendance'

/**
 * Get current date and time information
 * Returns formatted date, time, and greeting
 */
export const getCurrentDateTime = (): DateTimeInfo => {
  const now = new Date()
  
  return {
    date: formatDate(now),
    time: formatTime(now),
    timeOfDay: getTimeOfDay(now),
    greeting: getGreeting(now),
    timestamp: now.getTime(),
    isoString: now.toISOString(),
  }
}

/**
 * Format date as "Monday, 10 February 2026"
 */
export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  return date.toLocaleDateString('en-US', options)
}

/**
 * Format time as "HH:MM:SS"
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * Determine time of day based on current hour
 * Morning: 05:00 - 11:59
 * Afternoon: 12:00 - 16:59
 * Night: 17:00 - 04:59
 */
export const getTimeOfDay = (date: Date): TimeOfDay => {
  const hour = date.getHours()
  
  if (hour >= 5 && hour < 12) {
    return TimeOfDay.MORNING
  } else if (hour >= 12 && hour < 17) {
    return TimeOfDay.AFTERNOON
  } else {
    return TimeOfDay.NIGHT
  }
}

/**
 * Get greeting message based on time of day
 */
export const getGreeting = (date: Date): string => {
  const timeOfDay = getTimeOfDay(date)
  
  switch (timeOfDay) {
    case TimeOfDay.MORNING:
      return 'Good Morning'
    case TimeOfDay.AFTERNOON:
      return 'Good Afternoon'
    case TimeOfDay.NIGHT:
      return 'Good Night'
    default:
      return 'Hello'
  }
}

/**
 * Format date as YYYY-MM-DD
 */
export const formatDateYMD = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Calculate working hours between two timestamps
 */
export const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
  const checkInTime = new Date(checkIn).getTime()
  const checkOutTime = new Date(checkOut).getTime()
  const diffMs = checkOutTime - checkInTime
  const diffHours = diffMs / (1000 * 60 * 60)
  return Math.round(diffHours * 100) / 100 // Round to 2 decimal places
}

/**
 * Format hours to HH:MM format
 */
export const formatHoursToHHMM = (hours: number): string => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

/**
 * Check if date is today
 */
export const isToday = (date: string): boolean => {
  const today = formatDateYMD(new Date())
  return date === today
}

/**
 * Get date range for current month
 */
export const getCurrentMonthRange = (): { start: string; end: string } => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return {
    start: formatDateYMD(start),
    end: formatDateYMD(end),
  }
}
