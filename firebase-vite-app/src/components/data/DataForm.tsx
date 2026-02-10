/**
 * DataForm Component - FIXED: Validation, trim, error handling
 */

import React, { useState } from 'react';
import { createData } from '../../services/dataService';
import { DataFormData } from '../../types';
import { validateRequired, validateMaxLength } from '../../utils/sanitize';

interface DataFormProps {
  onSuccess?: () => void;
}

const DataForm: React.FC<DataFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<DataFormData>({
    title: '',
    description: '',
    category: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // FIX: Validate with trim
    const titleError = validateRequired(formData.title, 'Title');
    if (titleError) {
      setError(titleError);
      return;
    }

    const descError = validateRequired(formData.description, 'Description');
    if (descError) {
      setError(descError);
      return;
    }

    const catError = validateRequired(formData.category, 'Category');
    if (catError) {
      setError(catError);
      return;
    }

    if (!formData.status) {
      setError('Status is required');
      return;
    }

    // FIX: Validate max length
    const titleLengthError = validateMaxLength(formData.title, 100, 'Title');
    if (titleLengthError) {
      setError(titleLengthError);
      return;
    }

    const descLengthError = validateMaxLength(formData.description, 500, 'Description');
    if (descLengthError) {
      setError(descLengthError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // FIX: Trim all string values
      await createData({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        status: formData.status as 'active' | 'inactive'
      });
      setSuccess(true);
      setFormData({ title: '', description: '', category: '', status: '' });
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create data. Please try again.');
      console.error('Create data error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>➕ Add New Data</h2>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter title"
            style={styles.input}
            disabled={loading}
            maxLength={100}
          />
          <span style={styles.charCount}>{formData.title.length}/100</span>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            style={{...styles.input, minHeight: '100px'}}
            disabled={loading}
            maxLength={500}
          />
          <span style={styles.charCount}>{formData.description.length}/500</span>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Category *</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Enter category (e.g., Work, Personal, Project)"
            style={styles.input}
            disabled={loading}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={styles.input}
            disabled={loading}
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && <div style={styles.error}>❌ {error}</div>}
        {success && <div style={styles.success}>✅ Data created successfully!</div>}

        <button 
          type="submit" 
          style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Data'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none'
  },
  charCount: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'right' as const
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: '#4CAF50',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px'
  },
  success: {
    padding: '12px',
    background: '#efe',
    color: '#3c3',
    borderRadius: '6px',
    fontSize: '14px'
  }
};

export default DataForm;
