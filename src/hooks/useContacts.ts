"use client";

import { useState, useCallback, useEffect } from 'react';
import { GirlContact, ContactHistory, ContactStatus } from '@/lib/mock-data/contacts';

const STORAGE_KEY = 'contacts-data';

export function useContacts() {
  const [contacts, setContacts] = useState<GirlContact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorageから読み込み
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch {
        setContacts([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // 変更時にlocalStorageに保存
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    }
  }, [contacts, isLoaded]);

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
    isLoaded,
    addContact,
    updateContact,
    updateStatus,
    addHistory,
    deleteContact,
    getContactsByStatus,
  };
}
