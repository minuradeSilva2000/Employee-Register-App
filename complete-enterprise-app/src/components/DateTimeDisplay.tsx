// ============================================
// DATE & TIME DISPLAY COMPONENT
// Real-time clock with greeting
// ============================================

import { useState, useEffect } from 'react'
import { Clock, Calendar, Sun, Moon, Sunset } from 'lucide-react'
import { getCurrentDateTime } from '../utils/dateTimeUtils'
import { TimeOfDay } from '../types/attendance'

export default function DateTimeDisplay() {
  const [dateTime, setDateTime] = useState(getCurrentDateTime())

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setDateTime(getCurrentDateTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getTimeIcon = () => {
    switch (dateTime.timeOfDay) {
      case TimeOfDay.MORNING:
        return <Sun className="w-5 h-5 text-yellow-500" />
      case TimeOfDay.AFTERNOON:
        return <Sunset className="w-5 h-5 text-orange-500" />
      case TimeOfDay.NIGHT:
        return <Moon className="w-5 h-5 text-blue-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="flex items-center gap-6 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100">
      {/* Greeting */}
      <div className="flex items-center gap-2">
        {getTimeIcon()}
        <span className="text-sm font-semibold text-gray-700">
          {dateTime.greeting}
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">{dateTime.date}</span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-mono font-semibold text-gray-700">
          {dateTime.time}
        </span>
      </div>
    </div>
  )
}
