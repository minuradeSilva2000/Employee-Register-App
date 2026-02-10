/**
 * DataTable Component
 * Report generation with CSV/PDF export
 */

import React, { useState, useEffect } from 'react';
import { getAllData } from '../../services/dataService';
import { generateReport } from '../../services/reportService';
import { DataItem } from '../../types';

const DataTable: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const items = await getAllData();
      setData(items);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    generateReport(data, format);
  };

  if (loading) {
    return <div style={styles.loading}>Loading report data...</div>;
  }

  if (data.length === 0) {
    return <div style={styles.empty}>No data available for report generation.</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Generate Report</h2>
        <div style={styles.buttonGroup}>
          <button onClick={() => handleExport('csv')} style={styles.csvButton}>
            Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} style={styles.pdfButton}>
            Export PDF
          </button>
        </div>
      </div>

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
                <td style={styles.td}>
                  {item.createdAt instanceof Date 
                    ? item.createdAt.toLocaleDateString()
                    : new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                </td>
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
    marginBottom: '20px'
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
    justifyContent: 'space-between'
  },
  summaryText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  }
};

export default DataTable;
