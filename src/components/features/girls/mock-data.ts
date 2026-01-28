import { Girl, GirlTag } from "./types";

// 日付を生成するヘルパー関数
function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

// 複数の日付を生成するヘルパー関数
function generateAttendanceDates(startDaysAgo: number, count: number, interval: number = 1): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(getDaysAgo(startDaysAgo + i * interval));
  }
  return dates;
}

export const mockGirls: Girl[] = [
  {
    id: "1",
    name: "さよ",
    tag: GirlTag.REGULAR,
    interviewed: true,
    lastInterviewDate: getDaysAgo(10),
    attendanceDates: generateAttendanceDates(0, 15, 2), // 直近30日で15日出勤
    lastAttendance: getDaysAgo(0),
    note: "接客スキル高い。お客様からの評価も良好。\n週5日ペースで出勤中。",
    createdAt: getDaysAgo(90),
    updatedAt: getDaysAgo(0),
  },
  {
    id: "2",
    name: "ふう",
    tag: GirlTag.REGULAR,
    interviewed: true,
    lastInterviewDate: getDaysAgo(25),
    attendanceDates: generateAttendanceDates(0, 12, 2), // 直近30日で12日出勤
    lastAttendance: getDaysAgo(0),
    note: "写メ日記を積極的に投稿してくれる。\nモチベーション高い。",
    createdAt: getDaysAgo(60),
    updatedAt: getDaysAgo(0),
  },
  {
    id: "3",
    name: "ゆい",
    tag: GirlTag.RARE,
    interviewed: true,
    lastInterviewDate: getDaysAgo(45),
    attendanceDates: generateAttendanceDates(2, 5, 5), // 直近30日で5日出勤
    lastAttendance: getDaysAgo(2),
    note: "週1ペースの出勤希望。\n他店と掛け持ち。",
    createdAt: getDaysAgo(120),
    updatedAt: getDaysAgo(2),
  },
  {
    id: "4",
    name: "あみ",
    tag: GirlTag.RARE,
    interviewed: false,
    lastInterviewDate: null,
    attendanceDates: generateAttendanceDates(1, 8, 4), // 直近30日で8日出勤
    lastAttendance: getDaysAgo(1),
    note: "新人。接客研修中。\n次回面談で状況確認予定。",
    createdAt: getDaysAgo(30),
    updatedAt: getDaysAgo(1),
  },
  {
    id: "5",
    name: "まり",
    tag: GirlTag.RETIRED,
    interviewed: true,
    lastInterviewDate: getDaysAgo(75),
    attendanceDates: generateAttendanceDates(65, 10, 3), // 2ヶ月以上前の出勤
    lastAttendance: getDaysAgo(65),
    note: "事情により休業中。\n復帰の目途は未定。",
    createdAt: getDaysAgo(180),
    updatedAt: getDaysAgo(65),
  },
];
