// 連絡履歴モックデータ
export type ContactStatus = 'not_contacted' | 'contacted' | 'interested' | 'likely' | 'hired' | 'declined';

export const contactStatusLabels: Record<ContactStatus, string> = {
  not_contacted: '未連絡',
  contacted: '連絡済',
  interested: 'いい感じ',
  likely: '来てくれそう',
  hired: '採用',
  declined: '辞退',
};

export const contactStatusColors: Record<ContactStatus, string> = {
  not_contacted: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  interested: 'bg-yellow-100 text-yellow-800',
  likely: 'bg-green-100 text-green-800',
  hired: 'bg-purple-100 text-purple-800',
  declined: 'bg-red-100 text-red-800',
};

export interface ContactHistory {
  id: string;
  girlId: string;
  date: string;
  method: 'line' | 'phone' | 'dm' | 'other';
  content: string;
  result: string;
  nextAction?: string;
}

export interface GirlContact {
  id: string;
  name: string;
  contact: string;
  status: ContactStatus;
  hourlyRate?: number;
  guarantee?: number;
  backRate?: number;
  otherConditions?: string;
  notes?: string;
  histories: ContactHistory[];
  createdAt: string;
  updatedAt: string;
}

export const mockContacts: GirlContact[] = [
  {
    id: '1',
    name: 'あいり',
    contact: 'LINE: airi_xxx',
    status: 'interested',
    hourlyRate: 3000,
    guarantee: 15000,
    backRate: 50,
    otherConditions: '週3以上希望',
    notes: '経験者',
    histories: [
      { id: 'h1', girlId: '1', date: '2024-01-25T14:00:00', method: 'line', content: '条件確認', result: '前向き検討中', nextAction: '週末に再連絡' },
      { id: 'h2', girlId: '1', date: '2024-01-20T10:00:00', method: 'dm', content: '初回DM', result: '興味あり' },
    ],
    createdAt: '2024-01-20T10:00:00',
    updatedAt: '2024-01-25T14:00:00',
  },
  {
    id: '2',
    name: 'みく',
    contact: 'LINE: miku_123',
    status: 'likely',
    hourlyRate: 3500,
    guarantee: 18000,
    backRate: 55,
    notes: '来週面接予定',
    histories: [
      { id: 'h3', girlId: '2', date: '2024-01-26T16:00:00', method: 'phone', content: '面接日程調整', result: '来週月曜に面接' },
    ],
    createdAt: '2024-01-22T11:00:00',
    updatedAt: '2024-01-26T16:00:00',
  },
  {
    id: '3',
    name: 'さくら',
    contact: 'Twitter: @sakura_xx',
    status: 'contacted',
    hourlyRate: 2800,
    notes: '返信待ち',
    histories: [
      { id: 'h4', girlId: '3', date: '2024-01-27T09:00:00', method: 'dm', content: 'スカウトDM', result: '既読、返信待ち' },
    ],
    createdAt: '2024-01-27T09:00:00',
    updatedAt: '2024-01-27T09:00:00',
  },
];
