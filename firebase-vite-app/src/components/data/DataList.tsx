/**
 * DataList Component
 * List view with edit/delete capabilities
 */

import React, { useState, useEffect } from 'react';
import { getAllData, updateData, deleteData } from '../../services/dataService';
import { DataItem } from '../../types';

interface DataListProps {
  editMode?: boolean;
  deleteMode?: boolean;
}

const DataList: React.FC<DataListProps> = ({ editMode, deleteMode }) => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DataItem>>({});

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

  const handleEdit = (item: DataItem) => {
    setEditingId(item.id || null);
    setEditForm(item);
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateData(id, editForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteData(id);
        loadData();
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading data...</div>;
  }

  if (data.length === 0) {
    return <div style={styles.empty}>No data found. Create your first entry!</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {editMode ? '✏️ Update Data' : deleteMode ? '🗑️ Delete Data' : '👁️ View Data'}
      </h2>
      
      <div style={styles.list}>
        {data.map((item) => (
          <div key={item.id} style={styles.card}>
            {editingId === item.id ? (
              <div style={styles.editForm}>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  style={styles.input}
                />
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  style={{...styles.input, minHeight: '80px'}}
                />
                <input
                  type="text"
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  style={styles.input}
                />
                <select
                  value={editForm.status || ''}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value as 'active' | 'inactive'})}
                  style={styles.input}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div style={styles.buttonGroup}>
                  <button onClick={() => handleUpdate(item.id!)} style={styles.saveButton}>
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} style={styles.cancelButton}>
                    Cancel
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
                      Edit
                    </button>
                  )}
                  {deleteMode && (
                    <button onClick={() => handleDelete(item.id!)} style={styles.deleteButton}>
                      Delete
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
    gap: '10px'
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px'
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
