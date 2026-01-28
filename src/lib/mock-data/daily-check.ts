// 日次チェックモックデータ

export interface DailyCheckItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  howTo?: string;
  checked: boolean;
  checkedAt?: string;
  checkedBy?: string;
  isCustom?: boolean; // カスタムタスクかどうか
}

export interface DailyCheckCategory {
  id: string;
  name: string;
  items: DailyCheckItem[];
  isCustom?: boolean; // カスタムカテゴリかどうか
}

export const dailyCheckCategories: DailyCheckCategory[] = [
  {
    id: 'heaven',
    name: 'ヘブンチャット営業',
    items: [
      { id: 'h1', category: 'heaven', title: 'ヘブンチャット確認', description: '新規メッセージの確認と返信', howTo: 'ヘブンネットにログイン→チャット→未読メッセージを確認→丁寧に返信', checked: false },
      { id: 'h2', category: 'heaven', title: 'プロフィール更新', description: '出勤情報の更新', howTo: '管理画面→プロフィール編集→本日の出勤メンバーを更新', checked: false },
    ],
  },
  {
    id: 'photo',
    name: '写メ日記',
    items: [
      { id: 'p1', category: 'photo', title: '写メ日記投稿確認', description: '各女の子の投稿状況確認', howTo: '写メ日記管理画面で出勤者の投稿数を確認。3本未満は声かけ', checked: false },
      { id: 'p2', category: 'photo', title: '写メ日記内容チェック', description: '投稿内容の品質確認', howTo: '顔出し・服装・文章をチェック。NGがあれば修正依頼', checked: false },
    ],
  },
  {
    id: 'okini',
    name: 'オキニトーク',
    items: [
      { id: 'o1', category: 'okini', title: 'オキニトーク確認', description: 'お気に入り登録者へのメッセージ', howTo: 'オキニトーク画面→本日出勤の女の子→オキニ登録者に出勤告知', checked: false },
    ],
  },
  {
    id: 'other',
    name: 'その他業務',
    items: [
      { id: 'ot1', category: 'other', title: '在籍確認', description: '出勤予定者の確認連絡', howTo: '出勤予定者にLINEで確認。遅刻・欠勤の把握', checked: false },
      { id: 'ot2', category: 'other', title: '売上確認', description: '前日売上の確認', howTo: 'POSシステムで前日売上を確認。目標との差異をチェック', checked: false },
      { id: 'ot3', category: 'other', title: '清掃チェック', description: '店内清掃の確認', howTo: '待機室、施術室、トイレの清掃状況を確認', checked: false },
    ],
  },
];

export const getTodayChecks = (): DailyCheckCategory[] => {
  return dailyCheckCategories.map(cat => ({
    ...cat,
    items: cat.items.map(item => ({ ...item, checked: false })),
  }));
};

// デフォルトのカテゴリIDリスト（削除不可）
export const DEFAULT_CATEGORY_IDS = ['heaven', 'photo', 'okini', 'other'];

// デフォルトのアイテムIDリスト（削除不可）
export const DEFAULT_ITEM_IDS = ['h1', 'h2', 'p1', 'p2', 'o1', 'ot1', 'ot2', 'ot3'];
