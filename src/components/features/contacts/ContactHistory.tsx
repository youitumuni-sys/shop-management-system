"use client";

import { useState } from 'react';
import { ContactHistory as ContactHistoryType } from '@/lib/mock-data/contacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Mail, MoreHorizontal, Plus } from 'lucide-react';

interface ContactHistoryProps {
  histories: ContactHistoryType[];
  onAddHistory: (history: Omit<ContactHistoryType, 'id' | 'girlId'>) => void;
}

const methodIcons = {
  line: MessageCircle,
  phone: Phone,
  dm: Mail,
  other: MoreHorizontal,
};

const methodLabels = {
  line: 'LINE',
  phone: '電話',
  dm: 'DM',
  other: 'その他',
};

type ContactMethod = 'line' | 'phone' | 'dm' | 'other';

interface NewHistoryState {
  method: ContactMethod;
  content: string;
  result: string;
  nextAction: string;
}

export function ContactHistoryComponent({ histories, onAddHistory }: ContactHistoryProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newHistory, setNewHistory] = useState<NewHistoryState>({
    method: 'line',
    content: '',
    result: '',
    nextAction: '',
  });

  const handleSubmit = () => {
    if (!newHistory.content || !newHistory.result) return;
    onAddHistory({
      date: new Date().toISOString(),
      ...newHistory,
    });
    setNewHistory({ method: 'line', content: '', result: '', nextAction: '' });
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">連絡履歴</CardTitle>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-1" />
          追加
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-4 p-4 border rounded-lg space-y-3 bg-slate-50">
            <div className="flex gap-2">
              {(['line', 'phone', 'dm', 'other'] as const).map(method => (
                <Button
                  key={method}
                  size="sm"
                  variant={newHistory.method === method ? 'default' : 'outline'}
                  onClick={() => setNewHistory(prev => ({ ...prev, method }))}
                >
                  {methodLabels[method]}
                </Button>
              ))}
            </div>
            <Input
              placeholder="連絡内容"
              value={newHistory.content}
              onChange={e => setNewHistory(prev => ({ ...prev, content: e.target.value }))}
            />
            <Input
              placeholder="結果"
              value={newHistory.result}
              onChange={e => setNewHistory(prev => ({ ...prev, result: e.target.value }))}
            />
            <Input
              placeholder="次のアクション（任意）"
              value={newHistory.nextAction}
              onChange={e => setNewHistory(prev => ({ ...prev, nextAction: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>保存</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>キャンセル</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {histories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">履歴がありません</p>
          ) : (
            histories.map(history => {
              const Icon = methodIcons[history.method];
              return (
                <div key={history.id} className="flex gap-3 border-l-2 border-blue-200 pl-4 py-2">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{methodLabels[history.method]}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(history.date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{history.content}</p>
                    <p className="text-sm text-gray-600">結果: {history.result}</p>
                    {history.nextAction && (
                      <p className="text-sm text-blue-600">→ {history.nextAction}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
