"use client";

import { useState } from 'react';
import { GirlContact, ContactStatus, contactStatusLabels, contactStatusColors } from '@/lib/mock-data/contacts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';

interface ContactListProps {
  contacts: GirlContact[];
  selectedId?: string;
  onSelect: (contact: GirlContact) => void;
}

const statusOrder: ContactStatus[] = ['not_contacted', 'contacted', 'interested', 'likely', 'hired', 'declined'];

export function ContactList({ contacts, selectedId, onSelect }: ContactListProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContactStatus | 'all'>('all');

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="名前・連絠先で検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        <Button size="sm" variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>全て</Button>
        {statusOrder.map(status => (
          <Button key={status} size="sm" variant={filterStatus === status ? 'default' : 'outline'} onClick={() => setFilterStatus(status)}>
            {contactStatusLabels[status]}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredContacts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">該当するデータがありません</p>
        ) : (
          filteredContacts.map(contact => (
            <Card key={contact.id} className={`coursor-pointer hover:bg-slate-50 ${selectedId === contact.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => onSelect(contact)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-oh h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.contact}</p>
                    </div>
                  </div>
                  <Badge className={contactStatusColors[contact.status]}>{contactStatusLabels[contact.status]}</Badge>
                </div>
                {contact.hourlyRate && (
                  <p className="mt-2 text-sm text-gray-600">
                    時給 ¥{contact.hourlyRate.toLocaleString()}
                    {contact.guarantee && ` / 保証 ¥${contact.guarantee.toLocaleString()}`}
                    {contact.backRate && ` / バック ${contact.backRate}%`}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
