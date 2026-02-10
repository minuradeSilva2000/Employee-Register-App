// ============================================
// ATTENDANCE MANAGEMENT PAGE
// Complete attendance tracking system
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import DateTimeDisplay from '../components/DateTimeDisplay'
import {
  Clock, LogIn, LogOut, Calendar, TrendingUp, Users,
  CheckCircle, XCircle, AlertCircle, BarChart3
} from 'lucide-react'
import {
  getTodayAttendance,
  checkIn,
  checkOut,
  getAttendanceRecords,
  getMonthlyAttendanceSummary,
  initializeSampleData,
} from '../services/attendanceService'
import { TodayAttendance, AttendanceRecord, AttendanceSummary, AttendanceStatus } from '../types/attendance'
import { formatHoursToHHMM } from '../utils/dateTimeUtils'

export default function AttendancePage() {
  const navigate = useNavigate()
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [monthlySummary, setMonthlySummary] = useState<AttendanceSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Mock user data (replace with actual auth context)
  const currentUser = {
    id: 'user_1',
    name: 'Admin User',
    email: 'admin@example.com',
  }

  useEffect(() => {
    loadAttendanceData()
    // Initialize sample data on first load
    const hasData = localStorage.getItem('attendance_initialized')
    if (!hasData) {
      initializeSampleData(currentUser.id, currentUser.name)
      localStorage.setItem('attendance_initialized', 'true')
      loadAttendanceData()
    }
  }, [])

  const loadAttendanceData = () => {
    const today = getTodayAttendance(currentUser.id)
    const records = getAttendanceRecords(currentUser.id, 30)
    const summary = getMonthlyAttendanceSummary(currentUser.id)
    
    setTodayAttendance(today)
    setAttendanceRecords(records)
    setMonthlySummary(summary)
  }

  const handleCheckIn = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = checkIn({
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date().toISOString(),
      })

      if (response.success) {
        setMessage({ type: 'success', text: response.message })
        loadAttendanceData()
      } else {
        setMessage({ type: 'error', text: response.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check in' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = checkOut({
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
      })

      if (response.success) {
        setMessage({ type: 'success', text: response.message })
        loadAttendanceData()
      } else {
        setMessage({ type: 'error', text: response.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check out' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const getStatusBadge = (status: AttendanceStatus) => {
    const badges = {
      [AttendanceStatus.CHECKED_IN]: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Checked In',
      },
      [AttendanceStatus.CHECKED_OUT]: {
        color: 'bg-blue-100 text-blue-800',
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Checked Out',
      },
      [AttendanceStatus.NOT_CHECKED_IN]: {
        color: 'bg-gray-100 text-gray-800',
        icon: <XCircle className="w-4 h-4" />,
        text: 'Not Checked In',
      },
      [AttendanceStatus.ABSENT]: {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />,
        text: 'Absent',
      },
      [AttendanceStatus.ON_LEAVE]: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'On Leave',
      },
    }

    const badge = badges[status]
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Date/Time */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600 mt-1">Track your daily attendance and working hours</p>
          </div>
          <DateTimeDisplay />
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Today's Attendance Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Today's Attendance</h2>
              <p className="text-blue-100 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Clock className="w-8 h-8" />
            </div>
          </div>

          {todayAttendance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-1">Check-In Time</p>
                <p className="text-xl font-bold">
                  {todayAttendance.checkInTime
                    ? new Date(todayAttendance.checkInTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-1">Check-Out Time</p>
                <p className="text-xl font-bold">
                  {todayAttendance.checkOutTime
                    ? new Date(todayAttendance.checkOutTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-1">Working Hours</p>
                <p className="text-xl font-bold">
                  {todayAttendance.workingHours
                    ? formatHoursToHHMM(todayAttendance.workingHours)
                    : '--h --m'}
                </p>
              </div>
            </div>
          )}

          {/* Check-In/Out Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCheckIn}
              disabled={loading || todayAttendance?.hasCheckedIn}
              className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                todayAttendance?.hasCheckedIn
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              <LogIn className="w-5 h-5" />
              {todayAttendance?.hasCheckedIn ? 'Already Checked In' : 'Check In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={loading || !todayAttendance?.hasCheckedIn || todayAttendance?.hasCheckedOut}
              className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                !todayAttendance?.hasCheckedIn || todayAttendance?.hasCheckedOut
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              <LogOut className="w-5 h-5" />
              {todayAttendance?.hasCheckedOut ? 'Already Checked Out' : 'Check Out'}
            </button>
          </div>
        </div>

        {/* Monthly Summary */}
        {monthlySummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{monthlySummary.presentDays}</span>
              </div>
              <p className="text-sm text-gray-600">Days Present</p>
              <p className="text-xs text-green-600 mt-1">{monthlySummary.attendancePercentage}% attendance</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {formatHoursToHHMM(monthlySummary.totalWorkingHours)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-xs text-blue-600 mt-1">This month</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {formatHoursToHHMM(monthlySummary.averageWorkingHours)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Avg Hours/Day</p>
              <p className="text-xs text-purple-600 mt-1">Daily average</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{monthlySummary.totalDays}</span>
              </div>
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-xs text-orange-600 mt-1">Recorded</p>
            </div>
          </div>
        )}

        {/* Attendance History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
                <p className="text-sm text-gray-600 mt-1">Last 30 days attendance records</p>
              </div>
              <button
                onClick={() => navigate('/attendance/report')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <BarChart3 className="w-4 h-4" />
                View Full Report
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.checkInTime
                        ? new Date(record.checkInTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.checkOutTime
                        ? new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {record.totalWorkingHours ? formatHoursToHHMM(record.totalWorkingHours) : '--h --m'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
