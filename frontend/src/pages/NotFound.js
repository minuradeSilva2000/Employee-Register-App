import React from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-50"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center justify-center space-x-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="btn-outline"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            <FiHome className="w-4 h-4 mr-2" />
            Go Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;
