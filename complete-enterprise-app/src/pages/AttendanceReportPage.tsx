// ============================================
// ATTENDANCE REPORT PAGE
// Comprehensive reporting with charts and export
// ============================================

import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import DateTimeDisplay from '../components/DateTimeDisplay'
import {
  Download, Calendar, TrendingUp, Clock, CheckCircle,
  XCircle, AlertCircle, BarChart3, PieChart as PieChartIcon,
  FileText, Filter
} from 'lucide-react'
import {
  getAttendanceRecords,
  getMonthlyAttendanceSummary,
} from '../services/attendanceService'
import { AttendanceRecord, AttendanceStatus } from '../types/attendance'
import { formatHoursToHHMM, getCurrentMonthRange } from '../utils/dateTimeUtils'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function AttendanceReportPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month')
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all')

  const currentUser = {
    id: 'user_1',
    name: 'Admin User',
    email: 'admin@example.com',
  }

  useEffect(() => {
    loadReportData()
  }, [dateRange, statusFilter])

  const loadReportData = () => {
    let allRecords = getAttendanceRecords(currentUser.id, 1000)
    
    // Apply date range filter
    const today = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate.setDate(today.getDate() - 30)
        break
      case 'quarter':
        startDate.setDate(today.getDate() - 90)
        break
      case 'all':
        startDate = new Date(0) // Beginning of time
        break
    }
    
    allRecords = allRecords.filter(r => new Date(r.date) >= startDate)
    
    // Apply status filter
    if (statusFilter !== 'all') {
      allRecords = allRecords.filter(r => r.status === statusFilter)
    }
    
    setRecords(allRecords)
    setFilteredRecords(allRecords)
  }

  // Calculate statistics
  const calculateStats = () => {
    const totalDays = filteredRecords.length
    const presentDays = filteredRecords.filter(
      r => r.status === AttendanceStatus.CHECKED_IN || r.status === AttendanceStatus.CHECKED_OUT
    ).length
    const absentDays = filteredRecords.filter(r => r.status === AttendanceStatus.ABSENT).length
    const leaveDays = filteredRecords.filter(r => r.status === AttendanceStatus.ON_LEAVE).length
    const totalHours = filteredRecords.reduce((sum, r) => sum + (r.totalWorkingHours || 0), 0)
    const avgHours = presentDays > 0 ? totalHours / presentDays : 0
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

    return {
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      totalHours: Math.round(totalHours * 100) / 100,
      avgHours: Math.round(avgHours * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    }
  }

  const stats = calculateStats()

  // Prepare chart data
  const prepareWeeklyData = () => {
    const weeklyData: { [key: string]: number } = {}
    
    filteredRecords.forEach(record => {
      const date = new Date(record.date)
      const weekDay = date.toLocaleDateString('en-US', { weekday: 'short' })
      
      if (!weeklyData[weekDay]) {
        weeklyData[weekDay] = 0
      }
      
      if (record.totalWorkingHours) {
        weeklyData[weekDay] += record.totalWorkingHours
      }
    })

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      day,
      hours: Math.round((weeklyData[day] || 0) * 100) / 100,
    }))
  }

  const prepareMonthlyTrendData = () => {
    const monthlyData: { [key: string]: { hours: number; count: number } } = {}
    
    filteredRecords.forEach(record => {
      const date = new Date(record.date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { hours: 0, count: 0 }
      }
      
      if (record.totalWorkingHours) {
        monthlyData[monthKey].hours += record.totalWorkingHours
        monthlyData[monthKey].count += 1
      }
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        avgHours: Math.round((data.hours / data.count) * 100) / 100,
        totalHours: Math.round(data.hours * 100) / 100,
      }))
      .slice(-6) // Last 6 months
  }

  const prepareStatusData = () => {
    return [
      { name: 'Present', value: stats.presentDays, color: '#10b981' },
      { name: 'Absent', value: stats.absentDays, color: '#ef4444' },
      { name: 'On Leave', value: stats.leaveDays, color: '#f59e0b' },
    ].filter(item => item.value > 0)
  }

  const weeklyData = prepareWeeklyData()
  const monthlyTrendData = prepareMonthlyTrendData()
  const statusData = prepareStatusData()

  // Export functions
  const exportToCSV = () => {
    const headers = ['Date', 'Day', 'Check-In', 'Check-Out', 'Working Hours', 'Status']
    const rows = filteredRecords.map(record => [
      record.date,
      new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' }),
      record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      record.totalWorkingHours ? formatHoursToHHMM(record.totalWorkingHours) : '--h --m',
      record.status,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const exportToPDF = () => {
    alert('PDF export functionality ready for implementation with jsPDF library')
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Report</h1>
            <p className="text-gray-600 mt-1">Comprehensive attendance analytics and insights</p>
          </div>
          <DateTimeDisplay />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Date Range Filter */}
            <div className="flex gap-2">
              {(['week', 'month', 'quarter', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === 'week' && 'Last 7 Days'}
                  {range === 'month' && 'Last 30 Days'}
                  {range === 'quarter' && 'Last 90 Days'}
                  {range === 'all' && 'All Time'}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value={AttendanceStatus.CHECKED_OUT}>Present</option>
              <option value={AttendanceStatus.ABSENT}>Absent</option>
              <option value={AttendanceStatus.ON_LEAVE}>On Leave</option>
            </select>

            {/* Export Buttons */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.presentDays}</span>
            </div>
            <p className="text-sm text-gray-600">Days Present</p>
            <p className="text-xs text-green-600 mt-1">{stats.attendanceRate}% attendance rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{formatHoursToHHMM(stats.totalHours)}</span>
            </div>
            <p className="text-sm text-gray-600">Total Hours</p>
            <p className="text-xs text-blue-600 mt-1">In selected period</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{formatHoursToHHMM(stats.avgHours)}</span>
            </div>
            <p className="text-sm text-gray-600">Average Hours/Day</p>
            <p className="text-xs text-purple-600 mt-1">Daily average</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalDays}</span>
            </div>
            <p className="text-sm text-gray-600">Total Days</p>
            <p className="text-xs text-orange-600 mt-1">Recorded days</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Hours Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Working Hours</h3>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Distribution</h3>
              <PieChartIcon className="w-5 h-5 text-gray-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgHours" stroke="#8b5cf6" strokeWidth={2} name="Avg Hours" />
                <Line type="monotone" dataKey="totalHours" stroke="#3b82f6" strokeWidth={2} name="Total Hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Detailed Attendance Records</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredRecords.length} records
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
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
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          record.status === AttendanceStatus.CHECKED_OUT
                            ? 'bg-green-100 text-green-800'
                            : record.status === AttendanceStatus.ABSENT
                            ? 'bg-red-100 text-red-800'
                            : record.status === AttendanceStatus.ON_LEAVE
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {record.status === AttendanceStatus.CHECKED_OUT && 'Present'}
                        {record.status === AttendanceStatus.ABSENT && 'Absent'}
                        {record.status === AttendanceStatus.ON_LEAVE && 'On Leave'}
                        {record.status === AttendanceStatus.CHECKED_IN && 'Checked In'}
                      </span>
                    </td>
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
