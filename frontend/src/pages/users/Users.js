import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiShield, FiUser } from 'react-icons/fi';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'HR':
        return 'bg-blue-100 text-blue-800';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <FiShield className="w-4 h-4" />;
      case 'HR':
        return <FiUser className="w-4 h-4" />;
      default:
        return <FiUser className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <button className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">User</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Role</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Last Login</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="table-row"
                  >
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {user.email}
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </span>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-600 hover:text-gray-900">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Users;
