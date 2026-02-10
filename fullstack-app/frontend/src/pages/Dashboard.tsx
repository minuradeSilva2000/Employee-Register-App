/**
 * Dashboard Page with Quick Actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { reportService } from '../services/reportService';
import { DataItem, DataFormData, QuickActionType } from '../types';

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
      <h2 style={styles.sectionTitle}>Quick Actions</h2>
      <div style={styles.grid}>
        {[
          { id: 'add', title: 'Add Data', icon: '➕', color: '#4CAF50' },
          { id: 'view', title: 'View Data', icon: '👁️', color: '#2196F3' },
          { id: 'update', title: 'Update Data', icon: '✏️', color: '#FF9800' },
          { id: 'delete', title: 'Delete Data', icon: '🗑️', color: '#F44336' },
          { id: 'report', title: 'Generate Report', icon: '📊', color: '#9C27B0' }
        ].map((action) => (
          <div
            key={action.id}
            style={{...styles.card, background: action.color}}
            onClick={() => setActiveAction(action.id as QuickActionType)}
          >
            <div style={styles.icon}>{action.icon}</div>
            <h3 style={styles.cardTitle}>{action.title}</h3>
          </div>
        ))}
      </div>
    </>
  );

  const renderAddForm = () => (
    <div>
      <h2 style={styles.title}>➕ Add New Data</h2>
      <form onSubmit={handleCreate} style={styles.form}>
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          style={styles.input}
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          style={{...styles.input, minHeight: '100px'}}
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          style={styles.input}
        />
        <select
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          style={styles.input}
        >
          <option value="">Select status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {message && <div style={styles.message}>{message}</div>}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Creating...' : 'Create Data'}
        </button>
      </form>
    </div>
  );

  const renderDataList = (mode: 'view' | 'update' | 'delete') => (
    <div>
      <h2 style={styles.title}>
        {mode === 'view' ? '👁️ View Data' : mode === 'update' ? '✏️ Update Data' : '🗑️ Delete Data'}
      </h2>
      {loading ? <p>Loading...</p> : data.length === 0 ? <p>No data found</p> : (
        <div style={styles.list}>
          {data.map((item) => (
            <div key={item.id} style={styles.listCard}>
              {editingId === item.id ? (
                <div style={styles.form}>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    style={styles.input}
                  />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{...styles.input, minHeight: '80px'}}
                  />
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={styles.input}
                  />
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    style={styles.input}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={() => handleUpdate(item.id)} style={styles.saveButton}>Save</button>
                    <button onClick={() => setEditingId(null)} style={styles.cancelButton}>Cancel</button>
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
                    }} style={styles.editButton}>Edit</button>
                  )}
                  {mode === 'delete' && (
                    <button onClick={() => handleDelete(item.id)} style={styles.deleteButton}>Delete</button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {message && <div style={styles.message}>{message}</div>}
    </div>
  );

  const renderReport = () => (
    <div>
      <h2 style={styles.title}>📊 Generate Report</h2>
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <button onClick={handleExportCSV} style={styles.csvButton}>Export CSV</button>
        <button onClick={handleExportPDF} style={styles.pdfButton}>Export PDF</button>
      </div>
      {message && <div style={styles.message}>{message}</div>}
      {loading ? <p>Loading...</p> : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}>{item.title}</td>
                <td style={styles.td}>{item.description}</td>
                <td style={styles.td}>{item.category}</td>
                <td style={styles.td}>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🔐 Dashboard</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <span>{user?.email}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </header>
      <main style={styles.main}>
        {!activeAction ? renderQuickActions() : (
          <div style={styles.actionView}>
            <button onClick={() => setActiveAction(null)} style={styles.backButton}>
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

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  header: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoutButton: { padding: '8px 20px', background: 'rgba(255,255,255,0.2)', border: '1px solid white', borderRadius: '6px', color: 'white', cursor: 'pointer' },
  main: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: { fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  card: { padding: '30px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' as const, color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  icon: { fontSize: '48px', marginBottom: '15px' },
  cardTitle: { fontSize: '20px', fontWeight: 'bold' },
  actionView: { background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  backButton: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
  input: { padding: '12px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '6px' },
  button: { padding: '14px', fontSize: '16px', fontWeight: '600', color: 'white', background: '#4CAF50', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  message: { padding: '12px', background: '#efe', color: '#3c3', borderRadius: '6px', fontSize: '14px' },
  list: { display: 'grid', gap: '15px' },
  listCard: { padding: '20px', background: '#f9f9f9', borderRadius: '8px' },
  editButton: { padding: '8px 16px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' },
  deleteButton: { padding: '8px 16px', background: '#F44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' },
  saveButton: { padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  cancelButton: { padding: '8px 16px', background: '#999', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  csvButton: { padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  pdfButton: { padding: '10px 20px', background: '#F44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: 'white', borderRadius: '8px' },
  th: { padding: '12px', textAlign: 'left' as const, fontWeight: '600', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '12px', borderBottom: '1px solid #e0e0e0' }
};

export default Dashboard;
