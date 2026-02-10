/**
 * QuickActionCard Component
 */

import React from 'react';
import { QuickAction } from '../../types';

interface QuickActionCardProps {
  action: QuickAction;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ action, onClick }) => {
  return (
    <div 
      style={{...styles.card, background: action.color}} 
      onClick={onClick}
    >
      <div style={styles.icon}>{action.icon}</div>
      <h3 style={styles.title}>{action.title}</h3>
      <p style={styles.description}>{action.description}</p>
    </div>
  );
};

const styles = {
  card: {
    padding: '30px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    color: 'white'
  },
  icon: {
    fontSize: '48px',
    marginBottom: '15px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  description: {
    fontSize: '14px',
    opacity: 0.9
  }
};

export default QuickActionCard;
