import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          let errorMessage = 'Authentication failed';
          switch (error) {
            case 'oauth_failed':
              errorMessage = 'OAuth authentication failed';
              break;
            case 'oauth_error':
              errorMessage = 'An error occurred during authentication';
              break;
            default:
              errorMessage = 'Authentication failed';
          }
          
          toast.error(errorMessage);
          navigate('/login');
          return;
        }

        if (!accessToken || !refreshToken || !userParam) {
          toast.error('Invalid authentication response');
          navigate('/login');
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam));

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Update auth context
        if (setAuthData) {
          setAuthData({ user, accessToken, refreshToken });
        }

        toast.success(`Welcome back, ${user.name}!`);
        
        // Redirect to dashboard
        navigate('/dashboard');
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Failed to complete authentication');
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setAuthData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gray-50"
    >
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-gray-600"
        >
          Completing authentication...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default OAuthCallback;