/**
 * Dashboard Component
 * Main dashboard with Quick Actions
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import QuickActionCard from './QuickActionCard';
import DataForm from '../data/DataForm';
import DataList from '../data/DataList';
import DataTable from '../data/DataTable';
import { QuickAction, QuickActionType } from '../../types';

const quickActions: QuickAction[] = [
  { id: 'add', title: 'Add Data', description: 'Create new entry', icon: '➕', color: '#4CAF50' },
  { id: 'view', title: 'View Data', description: 'Browse all entries', icon: '👁️', color: '#2196F3' },
  { id: 'update', title: 'Update Data', description: 'Edit existing entry', icon: '✏️', color: '#FF9800' },
  { id: 'delete', title: 'Delete Data', description: 'Remove entry', icon: '🗑️', color: '#F44336' },
  { id: 'report', title: 'Generate Report', description: 'Export data', icon: '📊', color: '#9C27B0' }
];

const Dashboard: React.FC = () => {
  const [activeAction, setActiveAction] = useState<QuickActionType | null>(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleActionClick = (actionId: QuickActionType) => {
    setActiveAction(actionId);
  };

  const handleBack = () => {
    setActiveAction(null);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🔥 Firebase Dashboard</h1>
        <div style={styles.headerRight}>
          <span style={styles.userEmail}>{currentUser?.email}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {!activeAction ? (
          <>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <div style={styles.grid}>
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  onClick={() => handleActionClick(action.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div style={styles.actionView}>
            <button onClick={handleBack} style={styles.backButton}>
              ← Back to Dashboard
            </button>
            
            {activeAction === 'add' && <DataForm onSuccess={handleBack} />}
            {activeAction === 'view' && <DataList />}
            {activeAction === 'update' && <DataList editMode />}
            {activeAction === 'delete' && <DataList deleteMode />}
            {activeAction === 'report' && <DataTable />}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userEmail: {
    fontSize: '14px',
    opacity: 0.9
  },
  logoutButton: {
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid white',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.2s'
  },
  main: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  actionView: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  backButton: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px'
  }
};

export default Dashboard;
