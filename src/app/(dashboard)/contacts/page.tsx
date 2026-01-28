"use client";

import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { ContactList } from '@/components/features/contacts/ContactList';
import { ContactHistoryComponent } from '@/components/features/contacts/ContactHistory';
import { SalaryConditions } from '@/components/features/contacts/SalaryConditions';
import { GirlContact, ContactStatus, contactStatusLabels } from '@/lib/mock-data/contacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

export default function ContactsPage() {
  const { contacts, updateStatus, addHistory } = useContacts();
  const [selectedContact, setSelectedContact] = useState<GirlContact | null>(null);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">声かけリスト</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新規追加
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ContactList
            contacts={contacts}
            selectedId={selectedContact?.id}
            onSelect={setSelectedContact}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedContact ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selectedContact.name}</CardTitle>
                    <p className="text-sm text-gray-500">{selectedContact.contact}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['not_contacted', 'contacted', 'interested', 'likely', 'hired', 'declined'] as ContactStatus[]).map(status => (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedContact.status === status ? 'default' : 'outline'}
                        onClick={() => updateStatus(selectedContact.id, status)}
                      >
                        {contactStatusLabels[status]}
                      </Button>
                    ))}
                  </div>
                  {selectedContact.notes && (
                    <p className="text-sm text-gray-600 bg-slate-50 p-3 rounded">{selectedContact.notes}</p>
                  )}
                </CardContent>
              </Card>

              <SalaryConditions />

              <ContactHistoryComponent
                histories={selectedContact.histories}
                onAddHistory={(history) => addHistory(selectedContact.id, history)}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                左のリストから女の子を選択してください
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
