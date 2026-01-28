// 写メ日記チェックモックデータ

export interface PhotoDiaryEntry {
  id: string;
  girlId: string;
  girlName: string;
  date: string;
  posts: {
    post1: boolean;
    post2: boolean;
    post3: boolean;
  };
  isComplete: boolean;
}

export const mockPhotoDiaryEntries: PhotoDiaryEntry[] = [
  {
    id: '1',
    girlId: 'g1',
    girlName: 'あいり',
    date: new Date().toISOString().split('T')[0],
    posts: { post1: true, post2: true, post3: false },
    isComplete: false,
  },
  {
    id: '2',
    girlId: 'g2',
    girlName: 'みく',
    date: new Date().toISOString().split('T')[0],
    posts: { post1: true, post2: true, post3: true },
    isComplete: true,
  },
  {
    id: '3',
    girlId: 'g3',
    girlName: 'さくら',
    date: new Date().toISOString().split('T')[0],
    posts: { post1: true, post2: false, post3: false },
    isComplete: false,
  },
  {
    id: '4',
    girlId: 'g4',
    girlName: 'ゆうか',
    date: new Date().toISOString().split('T')[0],
    posts: { post1: false, post2: false, post3: false },
    isComplete: false,
  },
];

export const getTodayAttendees = () => mockPhotoDiaryEntries;
