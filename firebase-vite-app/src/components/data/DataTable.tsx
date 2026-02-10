/**
 * DataTable Component - FIXED: Error handling, Timestamp conversion
 */

import React, { useState, useEffect } from 'react';
import { getAllData } from '../../services/dataService';
import { generateReport } from '../../services/reportService';
import { DataItem } from '../../types';

const DataTable: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [exportLoading, setExportLoading] = useState<'csv' | 'pdf' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const items = await getAllData();
      setData(items);
    } catch (err: any) {
      setError('Failed to load data: ' + (err.message || 'Unknown error'));
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (data.length === 0) {
      alert('No data available to export');
      return;
    }

    setExportLoading(format);
    setError('');

    try {
      await generateReport(data, format);
      // Success feedback
      setTimeout(() => setExportLoading(null), 1000);
    } catch (err: any) {
      setError(`Failed to export ${format.toUpperCase()}: ` + (err.message || 'Unknown error'));
      console.error('Export error:', err);
      setExportLoading(null);
    }
  };

  // FIX: Safe date formatting
  const formatDate = (dateValue: any): string => {
    try {
      if (!dateValue) return 'N/A';
      
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString();
      }
      
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString();
      }
      
      if (typeof dateValue === 'string') {
        return new Date(dateValue).toLocaleDateString();
      }
      
      return 'N/A';
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading report data...</div>;
  }

  if (error && data.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.error}>{error}</div>
        <button onClick={loadData} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return <div style={styles.empty}>No data available for report generation.</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Generate Report</h2>
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => handleExport('csv')} 
            style={exportLoading === 'csv' ? {...styles.csvButton, opacity: 0.6} : styles.csvButton}
            disabled={exportLoading !== null}
          >
            {exportLoading === 'csv' ? 'Exporting...' : '📄 Export CSV'}
          </button>
          <button 
            onClick={() => handleExport('pdf')} 
            style={exportLoading === 'pdf' ? {...styles.pdfButton, opacity: 0.6} : styles.pdfButton}
            disabled={exportLoading !== null}
          >
            {exportLoading === 'pdf' ? 'Exporting...' : '📕 Export PDF'}
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                <td style={styles.td}>{item.title}</td>
                <td style={styles.td}>{item.description}</td>
                <td style={styles.td}>{item.category}</td>
                <td style={styles.td}>
                  <span style={item.status === 'active' ? styles.badgeActive : styles.badgeInactive}>
                    {item.status}
                  </span>
                </td>
                <td style={styles.td}>{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.summary}>
        <p style={styles.summaryText}>Total Records: {data.length}</p>
        <p style={styles.summaryText}>
          Active: {data.filter(d => d.status === 'active').length} | 
          Inactive: {data.filter(d => d.status === 'inactive').length}
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {},
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '15px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  csvButton: {
    padding: '10px 20px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  pdfButton: {
    padding: '10px 20px',
    background: '#F44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '16px',
    color: '#666'
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '16px',
    color: '#666',
    background: '#f9f9f9',
    borderRadius: '8px'
  },
  errorContainer: {
    textAlign: 'center' as const,
    padding: '40px'
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px'
  },
  retryButton: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  tableContainer: {
    overflowX: 'auto' as const,
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  headerRow: {
    background: '#f5f5f5'
  },
  th: {
    padding: '12px',
    textAlign: 'left' as const,
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    borderBottom: '2px solid #e0e0e0'
  },
  evenRow: {
    background: 'white'
  },
  oddRow: {
    background: '#fafafa'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#666',
    borderBottom: '1px solid #e0e0e0'
  },
  badgeActive: {
    padding: '4px 12px',
    background: '#4CAF50',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  badgeInactive: {
    padding: '4px 12px',
    background: '#999',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  summary: {
    marginTop: '20px',
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '10px'
  },
  summaryText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  }
};

export default DataTable;
