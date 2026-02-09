/**
 * Employee Management Home Page
 * Creative dashboard with Quick Actions and CRUD functionality
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiUserCheck, FiBriefcase, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Components
import StatCard from '../components/dashboard/StatCard';
import QuickActionGrid from '../components/dashboard/QuickActionGrid';
import EmployeeModal from '../components/modals/EmployeeModal';
import EmployeeList from '../components/employees/EmployeeList';

// Models & Services
import { Employee } from '../models/Employee.model';
import { QuickActionType, QuickActionPayload } from '../models/QuickAction.model';
import { employeeService } from '../services/EmployeeService';
import { handleQuickAction } from '../services/QuickActionHandler';

// Utils
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  onProbation: number;
}

const EmployeeManagement: React.FC = () => {
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    onProbation: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: QuickActionType | null;
    employee?: Employee;
  }>({
    isOpen: false,
    type: null
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load employees and statistics
   */
  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [employeesData, statsData] = await Promise.all([
        employeeService.getAllEmployees(),
        employeeService.getStatistics()
      ]);
      
      setEmployees(employeesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle quick action click
   */
  const handleQuickActionClick = (actionType: QuickActionType, employee?: Employee): void => {
    setModalState({
      isOpen: true,
      type: actionType,
      employee
    });
  };

  /**
   * Handle modal close
   */
  const handleModalClose = (): void => {
    setModalState({
      isOpen: false,
      type: null,
      employee: undefined
    });
  };

  /**
   * Handle action execution
   */
  const handleActionExecute = async (payload: QuickActionPayload): Promise<void> => {
    try {
      const result = await handleQuickAction(payload);
      
      if (result.success) {
        toast.success(result.message || 'Action completed successfully');
        await loadData(); // Reload data
        handleModalClose();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (error) {
      console.error('Action execution error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  /**
   * Handle employee edit
   */
  const handleEmployeeEdit = (employee: Employee): void => {
    handleQuickActionClick(QuickActionType.UPDATE_EMPLOYEE, employee);
  };

  /**
   * Handle employee delete
   */
  const handleEmployeeDelete = async (employee: Employee): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete ${employee.fullName}?`)) {
      return;
    }

    await handleActionExecute({
      type: QuickActionType.DELETE_EMPLOYEE,
      employee
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Employee Management System
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your workforce efficiently and effectively
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuickActionClick(QuickActionType.ADD_EMPLOYEE)}
                className="btn-primary"
              >
                <FiUsers className="mr-2" />
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<FiUsers className="w-6 h-6" />}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Employees"
            value={stats.activeEmployees}
            icon={<FiUserCheck className="w-6 h-6" />}
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Departments"
            value={stats.departments}
            icon={<FiBriefcase className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="On Probation"
            value={stats.onProbation}
            icon={<FiClock className="w-6 h-6" />}
            color="orange"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <QuickActionGrid onActionClick={handleQuickActionClick} />
        </motion.div>

        {/* Employee List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Employees</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="form-input"
                  onChange={(e) => {
                    // Implement search
                    const searchTerm = e.target.value;
                    if (searchTerm) {
                      employeeService.searchEmployees(searchTerm).then(setEmployees);
                    } else {
                      loadData();
                    }
                  }}
                />
              </div>
            </div>
            <EmployeeList
              employees={employees}
              onEdit={handleEmployeeEdit}
              onDelete={handleEmployeeDelete}
            />
          </div>
        </motion.div>
      </main>

      {/* Employee Modal */}
      <AnimatePresence>
        {modalState.isOpen && modalState.type && (
          <EmployeeModal
            isOpen={modalState.isOpen}
            actionType={modalState.type}
            employee={modalState.employee}
            onClose={handleModalClose}
            onSubmit={handleActionExecute}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeManagement;
