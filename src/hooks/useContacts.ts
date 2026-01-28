"use client";

import { useState, useCallback } from 'react';
import { GirlContact, ContactHistory, ContactStatus, mockContacts } from '@/lib/mock-data/contacts';

export function useContacts() {
  const [contacts, setContacts] = useState<GirlContact[]>(mockContacts);

  const addContact = useCallback((contact: Omit<GirlContact, 'id' | 'histories' | 'createdAt' | 'updatedAt'>) => {
    const newContact: GirlContact = {
      ...contact,
      id: Date.now().toString(),
      histories: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContacts(prev => [...prev, newContact]);
    return newContact;
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<GirlContact>) => {
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ));
  }, []);

  const updateStatus = useCallback((id: string, status: ContactStatus) => {
    updateContact(id, { status });
  }, [updateContact]);

  const addHistory = useCallback((girlId: string, history: Omit<ContactHistory, 'id' | 'girlId'>) => {
    const newHistory: ContactHistory = {
      ...history,
      id: Date.now().toString(),
      girlId,
    };
    setContacts(prev => prev.map(c => 
      c.id === girlId 
        ? { ...c, histories: [newHistory, ...c.histories], updatedAt: new Date().toISOString() } 
        : c
    ));
    return newHistory;
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const getContactsByStatus = useCallback((status: ContactStatus) => {
    return contacts.filter(c => c.status === status);
  }, [contacts]);

  return {
    contacts,
    addContact,
    updateContact,
    updateStatus,
    addHistory,
    deleteContact,
    getContactsByStatus,
  };
}
