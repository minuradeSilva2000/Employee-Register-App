/**
 * CRM Redux Slice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Contact, Lead, Deal, Task } from '../../types/enterprise';

interface CRMState {
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  selectedContact: Contact | null;
  selectedLead: Lead | null;
  selectedDeal: Deal | null;
  loading: boolean;
  error: string | null;
}

const initialState: CRMState = {
  contacts: [],
  leads: [],
  deals: [],
  tasks: [],
  selectedContact: null,
  selectedLead: null,
  selectedDeal: null,
  loading: false,
  error: null,
};

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.unshift(action.payload);
    },
    updateContact: (state, action: PayloadAction<Contact>) => {
      const index = state.contacts.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.contacts[index] = action.payload;
      }
    },
    deleteContact: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter(c => c.id !== action.payload);
    },
    setSelectedContact: (state, action: PayloadAction<Contact | null>) => {
      state.selectedContact = action.payload;
    },
    setLeads: (state, action: PayloadAction<Lead[]>) => {
      state.leads = action.payload;
    },
    addLead: (state, action: PayloadAction<Lead>) => {
      state.leads.unshift(action.payload);
    },
    updateLead: (state, action: PayloadAction<Lead>) => {
      const index = state.leads.findIndex(l => l.id === action.payload.id);
      if (index !== -1) {
        state.leads[index] = action.payload;
      }
    },
    setDeals: (state, action: PayloadAction<Deal[]>) => {
      state.deals = action.payload;
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setContacts,
  addContact,
  updateContact,
  deleteContact,
  setSelectedContact,
  setLeads,
  addLead,
  updateLead,
  setDeals,
  setTasks,
  setLoading,
  setError,
} = crmSlice.actions;

export default crmSlice.reducer;
