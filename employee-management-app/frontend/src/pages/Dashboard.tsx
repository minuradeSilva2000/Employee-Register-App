/**
 * Dashboard Page - Matching design language
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { reportService } from '../services/reportService';
import { DataItem, DataFormData, QuickActionType } from '../types';
import styles from '../styles/Dashboard.module.css';

const Dashboard: React.FC = () => {
  const [activeAction, setActiveAction] = useState<QuickActionType | null>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DataFormData>({
    title: '',
    description: '',
    category: '',
    status: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeAction && activeAction !== 'add') {
      loadData();
    }
  }, [activeAction]);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await dataService.getAll();
      setData(items);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.status) {
      setMessage('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await dataService.create({
        ...formData,
        status: formData.status as 'active' | 'inactive'
      });
      setMessage('✅ Data created successfully!');
      setFormData({ title: '', description: '', category: '', status: '' });
      setTimeout(() => setActiveAction(null), 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to create data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    try {
      await dataService.update(id, formData);
      setMessage('✅ Data updated successfully!');
      setEditingId(null);
      loadData();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    try {
      await dataService.delete(id);
      setMessage('✅ Data deleted successfully!');
      loadData();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await reportService.downloadCSV();
      setMessage('✅ CSV downloaded successfully!');
    } catch (error) {
      setMessage('Failed to download CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      await reportService.generatePDF();
      setMessage('✅ PDF generated successfully!');
    } catch (error) {
      setMessage('Failed to generate PDF');
    }
  };

  const renderQuickActions = () => (
    <>
      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.grid}>
        {[
          { id: 'add', title: 'Add Data', icon: '➕', color: '#4CAF50', desc: 'Create new entry' },
          { id: 'view', title: 'View Data', icon: '👁️', color: '#2196F3', desc: 'Browse all entries' },
          { id: 'update', title: 'Update Data', icon: '✏️', color: '#FF9800', desc: 'Edit existing entry' },
          { id: 'delete', title: 'Delete Data', icon: '🗑️', color: '#F44336', desc: 'Remove entry' },
          { id: 'report', title: 'Generate Report', icon: '📊', color: '#9C27B0', desc: 'Export data' }
        ].map((action) => (
          <div
            key={action.id}
            className={styles.card}
            style={{background: action.color}}
            onClick={() => setActiveAction(action.id as QuickActionType)}
          >
            <div className={styles.icon}>{action.icon}</div>
            <h3 className={styles.cardTitle}>{action.title}</h3>
            <p className={styles.cardDesc}>{action.desc}</p>
          </div>
        ))}
      </div>
    </>
  );

  const renderAddForm = () => (
    <div>
      <h2 className={styles.title}>➕ Add New Data</h2>
      <form onSubmit={handleCreate} className={styles.form}>
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className={styles.input}
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className={styles.textarea}
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className={styles.input}
        />
        <select
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          className={styles.input}
        >
          <option value="">Select status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {message && <div className={styles.message}>{message}</div>}
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Creating...' : 'Create Data'}
        </button>
      </form>
    </div>
  );

  const renderDataList = (mode: 'view' | 'update' | 'delete') => (
    <div>
      <h2 className={styles.title}>
        {mode === 'view' ? '👁️ View Data' : mode === 'update' ? '✏️ Update Data' : '🗑️ Delete Data'}
      </h2>
      {loading ? <p>Loading...</p> : data.length === 0 ? <p>No data found</p> : (
        <div className={styles.list}>
          {data.map((item) => (
            <div key={item.id} className={styles.listCard}>
              {editingId === item.id ? (
                <div className={styles.form}>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={styles.input}
                  />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className={styles.textarea}
                  />
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className={styles.input}
                  />
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className={styles.input}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={() => handleUpdate(item.id)} className={styles.saveButton}>Save</button>
                    <button onClick={() => setEditingId(null)} className={styles.cancelButton}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Status:</strong> {item.status}</p>
                  {mode === 'update' && (
                    <button onClick={() => {
                      setEditingId(item.id);
                      setFormData({
                        title: item.title,
                        description: item.description,
                        category: item.category,
                        status: item.status
                      });
                    }} className={styles.editButton}>Edit</button>
                  )}
                  {mode === 'delete' && (
                    <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>Delete</button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );

  const renderReport = () => (
    <div>
      <h2 className={styles.title}>📊 Generate Report</h2>
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <button onClick={handleExportCSV} className={styles.csvButton}>Export CSV</button>
        <button onClick={handleExportPDF} className={styles.pdfButton}>Export PDF</button>
      </div>
      {message && <div className={styles.message}>{message}</div>}
      {loading ? <p>Loading...</p> : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{item.category}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Employee Management System</h1>
        <div className={styles.headerRight}>
          <span>{user?.email}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        </div>
      </header>
      <main className={styles.main}>
        {!activeAction ? renderQuickActions() : (
          <div className={styles.actionView}>
            <button onClick={() => setActiveAction(null)} className={styles.backButton}>
              ← Back to Dashboard
            </button>
            {activeAction === 'add' && renderAddForm()}
            {activeAction === 'view' && renderDataList('view')}
            {activeAction === 'update' && renderDataList('update')}
            {activeAction === 'delete' && renderDataList('delete')}
            {activeAction === 'report' && renderReport()}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
