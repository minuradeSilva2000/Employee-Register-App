/**
 * DataList Component - FIXED: Edit functionality, validation, error handling
 */

import React, { useState, useEffect } from 'react';
import { getAllData, updateData, deleteData } from '../../services/dataService';
import { DataItem } from '../../types';
import { validateRequired, validateMaxLength } from '../../utils/sanitize';

interface DataListProps {
  editMode?: boolean;
  deleteMode?: boolean;
}

const DataList: React.FC<DataListProps> = ({ editMode, deleteMode }) => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    category: string;
    status: 'active' | 'inactive';
  }>({
    title: '',
    description: '',
    category: '',
    status: 'active'
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  // ESC key to cancel edit
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingId) {
        handleCancelEdit();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [editingId]);

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

  const handleEdit = (item: DataItem) => {
    setEditingId(item.id || null);
    // FIX: Properly extract only the editable fields
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      status: item.status || 'active'
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    if (updateLoading) return;
    
    const hasChanges = editingId && data.find(item => {
      if (item.id !== editingId) return false;
      return item.title !== editForm.title ||
             item.description !== editForm.description ||
             item.category !== editForm.category ||
             item.status !== editForm.status;
    });

    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }

    setEditingId(null);
    setEditForm({ title: '', description: '', category: '', status: 'active' });
    setError('');
  };

  const handleUpdate = async (id: string) => {
    // FIX: Validate before update
    setError('');
    setSuccess('');

    const titleError = validateRequired(editForm.title, 'Title');
    if (titleError) {
      setError(titleError);
      return;
    }

    const descError = validateRequired(editForm.description, 'Description');
    if (descError) {
      setError(descError);
      return;
    }

    const catError = validateRequired(editForm.category, 'Category');
    if (catError) {
      setError(catError);
      return;
    }

    const titleLengthError = validateMaxLength(editForm.title, 100, 'Title');
    if (titleLengthError) {
      setError(titleLengthError);
      return;
    }

    const descLengthError = validateMaxLength(editForm.description, 500, 'Description');
    if (descLengthError) {
      setError(descLengthError);
      return;
    }

    setUpdateLoading(true);

    try {
      // FIX: Only send the fields that should be updated
      const updates = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        status: editForm.status
      };

      await updateData(id, updates);
      
      // FIX: Optimistic UI update
      setData(prevData => prevData.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      setSuccess('✅ Updated successfully!');
      setEditingId(null);
      
      // Refresh data to get server timestamp
      await loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to update: ' + (err.message || 'Unknown error'));
      console.error('Failed to update:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const item = data.find(d => d.id === id);
    const itemTitle = item?.title || 'this item';
    
    // FIX: Show what's being deleted
    if (!window.confirm(`Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await deleteData(id);
      
      // FIX: Optimistic UI update
      setData(prevData => prevData.filter(item => item.id !== id));
      
      setSuccess('✅ Deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to delete: ' + (err.message || 'Unknown error'));
      console.error('Failed to delete:', err);
      // Reload data on error
      await loadData();
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading data...</div>;
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
    return <div style={styles.empty}>No data found. Create your first entry!</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {editMode ? '✏️ Update Data' : deleteMode ? '🗑️ Delete Data' : '👁️ View Data'}
      </h2>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      
      <div style={styles.list}>
        {data.map((item) => (
          <div key={item.id} style={styles.card}>
            {editingId === item.id ? (
              <div style={styles.editForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    style={styles.input}
                    disabled={updateLoading}
                    maxLength={100}
                    placeholder="Enter title"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description *</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    style={{...styles.input, minHeight: '80px'}}
                    disabled={updateLoading}
                    maxLength={500}
                    placeholder="Enter description"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category *</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    style={styles.input}
                    disabled={updateLoading}
                    placeholder="Enter category"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status *</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value as 'active' | 'inactive'})}
                    style={styles.input}
                    disabled={updateLoading}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div style={styles.buttonGroup}>
                  <button 
                    onClick={() => handleUpdate(item.id!)} 
                    style={updateLoading ? {...styles.saveButton, opacity: 0.6} : styles.saveButton}
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancelEdit} 
                    style={styles.cancelButton}
                    disabled={updateLoading}
                  >
                    Cancel (ESC)
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardDescription}>{item.description}</p>
                <div style={styles.cardMeta}>
                  <span style={styles.badge}>{item.category}</span>
                  <span style={item.status === 'active' ? styles.badgeActive : styles.badgeInactive}>
                    {item.status}
                  </span>
                </div>
                <div style={styles.buttonGroup}>
                  {editMode && (
                    <button onClick={() => handleEdit(item)} style={styles.editButton}>
                      ✏️ Edit
                    </button>
                  )}
                  {deleteMode && (
                    <button onClick={() => handleDelete(item.id!)} style={styles.deleteButton}>
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {},
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333'
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
  success: {
    padding: '12px',
    background: '#efe',
    color: '#3c3',
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
  list: {
    display: 'grid',
    gap: '20px'
  },
  card: {
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333'
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
    lineHeight: '1.5'
  },
  cardMeta: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  },
  badge: {
    padding: '4px 12px',
    background: '#e0e0e0',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
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
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  editButton: {
    padding: '8px 16px',
    background: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  deleteButton: {
    padding: '8px 16px',
    background: '#F44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none'
  },
  saveButton: {
    padding: '8px 16px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  cancelButton: {
    padding: '8px 16px',
    background: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  }
};

export default DataList;
