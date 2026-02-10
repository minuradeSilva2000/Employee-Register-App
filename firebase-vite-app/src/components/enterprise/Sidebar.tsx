/**
 * Enterprise Sidebar Navigation
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/enterpriseStore';
import { toggleSidebar, setActiveModule } from '../../store/slices/uiSlice';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  module: 'dashboard' | 'crm' | 'employees';
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/enterprise/dashboard', module: 'dashboard' },
  { id: 'crm', label: 'CRM', icon: '👥', path: '/enterprise/crm', module: 'crm' },
  { id: 'employees', label: 'Employees', icon: '👔', path: '/enterprise/employees', module: 'employees' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);

  const handleNavClick = (item: NavItem) => {
    dispatch(setActiveModule(item.module));
    navigate(item.path);
  };

  if (!sidebarOpen) {
    return (
      <div style={styles.collapsedSidebar}>
        <button onClick={() => dispatch(toggleSidebar())} style={styles.toggleButton}>
          ☰
        </button>
        {navItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleNavClick(item)}
            style={{
              ...styles.collapsedItem,
              ...(location.pathname === item.path ? styles.activeCollapsed : {})
            }}
            title={item.label}
          >
            {item.icon}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.logo}>🏢 Enterprise</h2>
        <button onClick={() => dispatch(toggleSidebar())} style={styles.toggleButton}>
          ☰
        </button>
      </div>

      <nav style={styles.nav}>
        {navItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleNavClick(item)}
            style={{
              ...styles.navItem,
              ...(location.pathname === item.path ? styles.activeItem : {})
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={styles.footer}>
        <div style={styles.user}>
          <div style={styles.avatar}>👤</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>Admin User</div>
            <div style={styles.userRole}>Administrator</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    position: 'fixed' as const,
    left: 0,
    top: 0,
    zIndex: 1000,
  },
  collapsedSidebar: {
    width: '70px',
    height: '100vh',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px 0',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    position: 'fixed' as const,
    left: 0,
    top: 0,
    zIndex: 1000,
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  toggleButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px',
  },
  nav: {
    flex: 1,
    padding: '20px 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderLeft: '3px solid transparent',
  },
  activeItem: {
    background: 'rgba(59, 130, 246, 0.1)',
    borderLeft: '3px solid #3b82f6',
  },
  icon: {
    fontSize: '20px',
    marginRight: '12px',
    width: '24px',
    textAlign: 'center' as const,
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
  },
  collapsedItem: {
    padding: '15px',
    cursor: 'pointer',
    fontSize: '24px',
    borderRadius: '8px',
    margin: '10px 0',
    transition: 'all 0.2s',
  },
  activeCollapsed: {
    background: 'rgba(59, 130, 246, 0.2)',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
  },
  userRole: {
    fontSize: '12px',
    opacity: 0.7,
  },
};

export default Sidebar;
