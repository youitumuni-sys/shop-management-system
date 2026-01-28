// 連絡履歴の型定義

export const ContactMethod = {
  PHONE: "phone",
  LINE: "line",
  EMAIL: "email",
  VISIT: "visit",
  OTHER: "other",
} as const;

export type ContactMethodType = (typeof ContactMethod)[keyof typeof ContactMethod];

export const ContactResult = {
  CONNECTED: "connected",     // 連絡取れた
  NO_ANSWER: "no_answer",     // 不在
  CALLBACK: "callback",       // 折り返し待ち
  COMPLETED: "completed",     // 対応完了
} as const;

export type ContactResultType = (typeof ContactResult)[keyof typeof ContactResult];

export interface ContactRecord {
  id: string;
  girlId: string;
  girlName: string;
  contactedAt: string;        // ISO日時
  method: ContactMethodType;
  result: ContactResultType;
  note: string;
  staffName: string;          // 対応スタッフ
}
