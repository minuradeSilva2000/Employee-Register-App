// ============================================
// CRM SLICE - Contact Management State
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Contact {
  id: number
  name: string
  email: string
  phone: string
  company: string
  status: 'lead' | 'customer' | 'prospect'
  createdAt: string
  updatedAt: string
}

interface CRMState {
  contacts: Contact[]
  selectedContact: Contact | null
  searchTerm: string
  statusFilter: 'all' | 'lead' | 'customer' | 'prospect'
  loading: boolean
}

const initialState: CRMState = {
  contacts: [],
  selectedContact: null,
  searchTerm: '',
  statusFilter: 'all',
  loading: false,
}

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.unshift(action.payload)
    },
    updateContact: (state, action: PayloadAction<Contact>) => {
      const index = state.contacts.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.contacts[index] = action.payload
      }
    },
    deleteContact: (state, action: PayloadAction<number>) => {
      state.contacts = state.contacts.filter(c => c.id !== action.payload)
    },
    setSelectedContact: (state, action: PayloadAction<Contact | null>) => {
      state.selectedContact = action.payload
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setStatusFilter: (state, action: PayloadAction<'all' | 'lead' | 'customer' | 'prospect'>) => {
      state.statusFilter = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const {
  setContacts,
  addContact,
  updateContact,
  deleteContact,
  setSelectedContact,
  setSearchTerm,
  setStatusFilter,
  setLoading,
} = crmSlice.actions

export default crmSlice.reducer
