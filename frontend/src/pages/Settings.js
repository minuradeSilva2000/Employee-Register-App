import React from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiBell, FiShield, FiDatabase, FiGlobe } from 'react-icons/fi';

const Settings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <FiBell className="w-5 h-5 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email updates</p>
              </div>
              <input type="checkbox" className="form-checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Browser push notifications</p>
              </div>
              <input type="checkbox" className="form-checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Desktop Notifications</p>
                <p className="text-sm text-gray-500">Show desktop alerts</p>
              </div>
              <input type="checkbox" className="form-checkbox" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <FiShield className="w-5 h-5 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <button className="btn-outline btn-sm">Enable</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Session Timeout</p>
                <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
              </div>
              <select className="form-select text-sm">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>4 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <FiDatabase className="w-5 h-5 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Data & Privacy</h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Data Export</p>
                <p className="text-sm text-gray-500">Download your data</p>
              </div>
              <button className="btn-outline btn-sm">Export</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Clear Cache</p>
                <p className="text-sm text-gray-500">Clear application cache</p>
              </div>
              <button className="btn-outline btn-sm">Clear</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <FiGlobe className="w-5 h-5 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Theme</p>
                <p className="text-sm text-gray-500">Choose your preferred theme</p>
              </div>
              <select className="form-select text-sm">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Language</p>
                <p className="text-sm text-gray-500">Select display language</p>
              </div>
              <select className="form-select text-sm">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
