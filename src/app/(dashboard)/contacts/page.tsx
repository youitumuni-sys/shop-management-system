"use client";

import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { ContactList } from '@/components/features/contacts/ContactList';
import { ContactHistoryComponent } from '@/components/features/contacts/ContactHistory';
import { SalaryConditions } from '@/components/features/contacts/SalaryConditions';
import { GirlContact, ContactStatus, contactStatusLabels } from '@/lib/mock-data/contacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

export default function ContactsPage() {
  const { contacts, addContact, updateContact, updateStatus, addHistory, deleteContact } = useContacts();
  const [selectedContact, setSelectedContact] = useState<GirlContact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    notes: '',
    status: 'not_contacted' as ContactStatus,
  });

  const resetForm = () => {
    setFormData({ name: '', contact: '', notes: '', status: 'not_contacted' });
  };

  const handleAdd = () => {
    if (!formData.name.trim()) return;
    addContact({
      name: formData.name,
      contact: formData.contact,
      notes: formData.notes,
      status: formData.status,
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = () => {
    if (!selectedContact || !formData.name.trim()) return;
    updateContact(selectedContact.id, {
      name: formData.name,
      contact: formData.contact,
      notes: formData.notes,
    });
    setSelectedContact({
      ...selectedContact,
      name: formData.name,
      contact: formData.contact,
      notes: formData.notes,
    });
    setShowEditModal(false);
  };

  const handleDelete = () => {
    if (!selectedContact) return;
    deleteContact(selectedContact.id);
    setSelectedContact(null);
    setShowDeleteConfirm(false);
  };

  const openEditModal = () => {
    if (!selectedContact) return;
    setFormData({
      name: selectedContact.name,
      contact: selectedContact.contact,
      notes: selectedContact.notes || '',
      status: selectedContact.status,
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">声かけリスト</h1>
        <Button onClick={openAddModal}>
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={openEditModal}>
                      <Pencil className="h-4 w-4 mr-1" />
                      編集
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      削除
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['not_contacted', 'contacted', 'interested', 'likely', 'hired', 'declined'] as ContactStatus[]).map(status => (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedContact.status === status ? 'default' : 'outline'}
                        onClick={() => {
                          updateStatus(selectedContact.id, status);
                          setSelectedContact({ ...selectedContact, status });
                        }}
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

      {/* 新規追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>新規追加</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">名前 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: あいり"
                />
              </div>
              <div>
                <Label htmlFor="contact">連絡先</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="例: LINE: xxx_xxx"
                />
              </div>
              <div>
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="備考など"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  キャンセル
                </Button>
                <Button className="flex-1" onClick={handleAdd} disabled={!formData.name.trim()}>
                  追加
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>編集</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-name">名前 *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-contact">連絡先</Label>
                <Input
                  id="edit-contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">メモ</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                  キャンセル
                </Button>
                <Button className="flex-1" onClick={handleEdit} disabled={!formData.name.trim()}>
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader>
              <CardTitle>削除確認</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                「{selectedContact?.name}」を削除しますか？<br />
                この操作は取り消せません。
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                  キャンセル
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                  削除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
