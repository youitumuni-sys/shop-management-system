import { ContactRecord, ContactMethod, ContactResult } from "./types";

// モック連絡履歴データ
export const mockContactRecords: ContactRecord[] = [
  {
    id: "contact-1",
    girlId: "1",
    girlName: "田中 花子",
    contactedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
    method: ContactMethod.LINE,
    result: ContactResult.CONNECTED,
    note: "明日の出勤確認OK。18時から出勤予定。",
    staffName: "山田",
  },
  {
    id: "contact-2",
    girlId: "2",
    girlName: "佐藤 美咲",
    contactedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2時間前
    method: ContactMethod.PHONE,
    result: ContactResult.NO_ANSWER,
    note: "電話に出ず。後ほど再連絡予定。",
    staffName: "山田",
  },
  {
    id: "contact-3",
    girlId: "3",
    girlName: "鈴木 あかり",
    contactedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5時間前
    method: ContactMethod.LINE,
    result: ContactResult.CALLBACK,
    note: "体調確認中。夕方に折り返し連絡もらえる予定。",
    staffName: "佐々木",
  },
  {
    id: "contact-4",
    girlId: "1",
    girlName: "田中 花子",
    contactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1日前
    method: ContactMethod.VISIT,
    result: ContactResult.COMPLETED,
    note: "来店して新しいプロフィール写真撮影完了。",
    staffName: "田村",
  },
  {
    id: "contact-5",
    girlId: "2",
    girlName: "佐藤 美咲",
    contactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2日前
    method: ContactMethod.EMAIL,
    result: ContactResult.CONNECTED,
    note: "給与明細送付済み。確認OKの返信あり。",
    staffName: "山田",
  },
  {
    id: "contact-6",
    girlId: "4",
    girlName: "高橋 りな",
    contactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3日前
    method: ContactMethod.PHONE,
    result: ContactResult.CONNECTED,
    note: "シフト変更の相談。水曜日を木曜日に変更希望。承認済み。",
    staffName: "佐々木",
  },
  {
    id: "contact-7",
    girlId: "5",
    girlName: "伊藤 まゆ",
    contactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4日前
    method: ContactMethod.LINE,
    result: ContactResult.NO_ANSWER,
    note: "既読つかず。明日再度連絡予定。",
    staffName: "山田",
  },
  {
    id: "contact-8",
    girlId: "3",
    girlName: "鈴木 あかり",
    contactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5日前
    method: ContactMethod.OTHER,
    result: ContactResult.COMPLETED,
    note: "本人来店。契約更新手続き完了。",
    staffName: "田村",
  },
];
