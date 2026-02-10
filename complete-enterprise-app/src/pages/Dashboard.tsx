import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import EnhancedLayout from '../components/EnhancedLayout'
import DateTimeDisplay from '../components/DateTimeDisplay'
import { Users, Briefcase, TrendingUp, FileText, DollarSign, UserCheck, Clock } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { label: 'Total Employees', value: '248', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Deals', value: '34', change: '+8%', icon: Briefcase, color: 'bg-green-500' },
    { label: 'Revenue', value: '$2.4M', change: '+23%', icon: DollarSign, color: 'bg-purple-500' },
    { label: 'Contacts', value: '1,429', change: '+18%', icon: UserCheck, color: 'bg-orange-500' },
  ]

  const quickActions = [
    { title: 'CRM', description: 'Manage contacts and deals', icon: Briefcase, link: '/crm', color: 'bg-blue-500' },
    { title: 'Employees', description: 'Employee management', icon: Users, link: '/employees', color: 'bg-green-500' },
    { title: 'Attendance', description: 'Track attendance', icon: Clock, link: '/attendance', color: 'bg-purple-500' },
    { title: 'Analytics', description: 'View reports and insights', icon: TrendingUp, link: '/analytics', color: 'bg-orange-500' },
  ]

  return (
    <EnhancedLayout>
      <div className="space-y-6">
        {/* Header with Date/Time */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <DateTimeDisplay />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={action.link}
                  className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </EnhancedLayout>
  )
}
