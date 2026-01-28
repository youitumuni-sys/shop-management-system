import puppeteer, { Browser, Page } from "puppeteer";

export interface AttendanceInfo {
  name: string;
  startTime: string;
  endTime: string;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD形式
  attendance: AttendanceInfo[];
}

const LOGIN_URL = "https://admin.spark-schedule.com/login";
const BASE_URL = "https://admin.spark-schedule.com";

// 店舗ID (ぷるるん梅田店 = 3)
const SHOP_ID = "3";

let browser: Browser | null = null;
let isLoggedIn = false;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return browser;
}

async function login(page: Page): Promise<boolean> {
  const loginId = process.env.SPARK_SCHEDULE_ID;
  const password = process.env.SPARK_SCHEDULE_PASSWORD;

  if (!loginId || !password) {
    throw new Error("Spark Schedule のログイン情報が設定されていません (SPARK_SCHEDULE_ID, SPARK_SCHEDULE_PASSWORD)");
  }

  try {
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // ログインフォームに入力
    await page.type('input[name="userId"]', loginId);
    await page.type('input[name="userPass"]', password);

    // 送信ボタンをクリックして遷移を待機
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
      page.click('input[type="submit"]'),
    ]);

    // ログイン成功の確認
    const url = page.url();
    isLoggedIn = !url.includes("login");

    return isLoggedIn;
  } catch {
    console.error("Spark Schedule ログインエラー");
    return false;
  }
}

/**
 * 週間スケジュールページから出勤データを抽出する
 * @param page - Puppeteer Page
 * @param baseDate - 基準日（週の開始日を計算するため）
 * @returns 日付ごとの出勤情報
 */
async function extractWeeklySchedule(page: Page, baseDate: Date): Promise<DailyAttendance[]> {
  return await page.evaluate((baseDateStr: string) => {
    const results: { date: string; attendance: { name: string; startTime: string; endTime: string }[] }[] = [];

    // テーブルを取得
    const table = document.querySelector("table");
    if (!table) return results;

    // ヘッダー行から日付を取得
    const headerRow = table.querySelector("tr");
    if (!headerRow) return results;

    const headerCells = headerRow.querySelectorAll("th");
    const dates: string[] = [];
    const baseD = new Date(baseDateStr);
    const year = baseD.getFullYear();
    const baseMonth = baseD.getMonth() + 1;

    // 日付セルの情報を取得（最初のセルは「名前」なのでスキップ）
    headerCells.forEach((th, idx) => {
      if (idx === 0) return;

      // .days クラス内のテキストから日付を取得
      const daysP = th.querySelector("p.days");
      if (daysP) {
        const dayText = daysP.textContent?.trim() || "";
        // "28(水)" のようなパターンから日を抽出
        const dayMatch = dayText.match(/(\d+)/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1], 10);
          // 月を推定
          let month = baseMonth;
          // 日が基準日より小さい場合は来月と判断
          if (day < baseD.getDate() - 7) {
            month = month === 12 ? 1 : month + 1;
          }
          // 年をまたぐ場合の処理
          const useYear = month < baseMonth ? year + 1 : year;
          dates.push(`${useYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
        }
      }
    });

    // 各キャスト行を処理
    const rows = table.querySelectorAll("tr");

    interface CastSchedule {
      name: string;
      schedules: ({ name: string; startTime: string; endTime: string } | null)[];
    }
    const castSchedules: CastSchedule[] = [];

    rows.forEach((row, rowIdx) => {
      if (rowIdx === 0) return; // ヘッダー行スキップ

      const cells = row.querySelectorAll("td");
      if (cells.length === 0) return;

      // キャスト名を取得
      const nameCell = cells[0];
      const name = nameCell?.textContent?.trim() || "";
      if (!name) return;

      const schedules: ({ name: string; startTime: string; endTime: string } | null)[] = [];

      // 各日付のセルを処理
      cells.forEach((cell, cellIdx) => {
        if (cellIdx === 0) return; // 名前セルスキップ

        // schedule-time の div 内の p タグから時間を取得
        const timeDiv = cell.querySelector(".schedule-time");
        const timeP = timeDiv?.querySelector("p");
        const timeText = timeP?.innerHTML?.trim() || "";

        // "10:00<br>17:00" または "10:00<br />17:00" のパターンをパース
        const timeMatch = timeText.match(/(\d{1,2}:\d{2})\s*<br\s*\/?>\s*(\d{1,2}:\d{2})/i);

        if (timeMatch) {
          schedules.push({
            name,
            startTime: timeMatch[1],
            endTime: timeMatch[2],
          });
        } else {
          schedules.push(null);
        }
      });

      castSchedules.push({ name, schedules });
    });

    // 日付ごとにデータを整理
    dates.forEach((date, dateIdx) => {
      const attendance: { name: string; startTime: string; endTime: string }[] = [];

      castSchedules.forEach((cast) => {
        const schedule = cast.schedules[dateIdx];
        if (schedule) {
          attendance.push(schedule);
        }
      });

      results.push({ date, attendance });
    });

    return results;
  }, baseDate.toISOString());
}

/**
 * Spark Schedule から本日の出勤情報を取得する
 * @returns 出勤者一覧（名前、開始時間、終了時間）
 */
export async function scrapeSparkSchedule(): Promise<AttendanceInfo[]> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();

  try {
    // ユーザーエージェントを設定
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // ログイン
    const loggedIn = await login(page);
    if (!loggedIn) {
      throw new Error("Spark Schedule へのログインに失敗しました");
    }

    // 今日の出勤状況ページにアクセス
    const todayListsUrl = `${BASE_URL}/today/lists/${SHOP_ID}`;
    await page.goto(todayListsUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // ページ読み込み待機
    await new Promise((r) => setTimeout(r, 1000));

    // 出勤情報を取得
    const attendance = await page.evaluate(() => {
      const results: { name: string; startTime: string; endTime: string }[] = [];

      // テーブル daySchedule クラスから取得
      const table = document.querySelector("table.daySchedule");
      if (!table) return results;

      const rows = table.querySelectorAll("tr");

      rows.forEach((row, idx) => {
        if (idx === 0) return; // ヘッダー行はスキップ

        const nameCell = row.querySelector("td.name");
        const dateCell = row.querySelector("td.date");

        const name = nameCell?.textContent?.trim() || "";
        const timeText = dateCell?.textContent?.trim() || "";

        if (name && timeText) {
          // 時間フォーマット: "10:00～14:00" または "10:00～00:00"
          const timeMatch = timeText.match(/(\d{1,2}:\d{2})\s*[～~\-ー→]\s*(\d{1,2}:\d{2})/);

          if (timeMatch) {
            results.push({
              name,
              startTime: timeMatch[1],
              endTime: timeMatch[2],
            });
          }
        }
      });

      return results;
    });

    return attendance;
  } finally {
    await page.close();
  }
}

/**
 * 指定日の出勤情報を取得する
 * 週間スケジュールページから該当日のデータを抽出
 * @param date - YYYY-MM-DD形式の日付
 * @returns 出勤者一覧（名前、開始時間、終了時間）
 */
export async function scrapeSparkScheduleForDate(date: string): Promise<AttendanceInfo[]> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();

  try {
    // ユーザーエージェントを設定
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // ログイン
    const loggedIn = await login(page);
    if (!loggedIn) {
      throw new Error("Spark Schedule へのログインに失敗しました");
    }

    // 週間スケジュールページにアクセス
    const weekUrl = `${BASE_URL}/schedule/week/${SHOP_ID}`;
    await page.goto(weekUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // ページ読み込み待機
    await new Promise((r) => setTimeout(r, 1000));

    // 週間データを抽出
    const targetDate = new Date(date);
    const weeklyData = await extractWeeklySchedule(page, targetDate);

    // 指定日のデータを検索
    const dayData = weeklyData.find((d) => d.date === date);
    if (dayData) {
      return dayData.attendance;
    }

    // 翌週ページを確認
    const nextWeekLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      const next = links.find((a) => a.textContent?.includes("翌週"));
      return next?.href || null;
    });

    if (nextWeekLink) {
      await page.goto(nextWeekLink, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1000));

      const nextWeekData = await extractWeeklySchedule(page, targetDate);
      const nextDayData = nextWeekData.find((d) => d.date === date);
      if (nextDayData) {
        return nextDayData.attendance;
      }
    }

    return [];
  } finally {
    await page.close();
  }
}

/**
 * 複数日の出勤情報を一括取得する（週間スケジュールページを使用）
 * @param startDate - 開始日（YYYY-MM-DD形式）
 * @param days - 取得する日数（デフォルト: 14日間）
 * @returns 日付ごとの出勤者一覧
 */
export async function scrapeSparkScheduleRange(startDate: string, days: number = 14): Promise<DailyAttendance[]> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  const allResults: DailyAttendance[] = [];

  try {
    // ユーザーエージェントを設定
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // ログイン
    const loggedIn = await login(page);
    if (!loggedIn) {
      throw new Error("Spark Schedule へのログインに失敗しました");
    }

    // 必要な日付を計算
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + days - 1);
    const endDateStr = endDate.toISOString().split("T")[0];

    // 取得済みの日付を追跡
    const collectedDates = new Set<string>();

    // 週間スケジュールページにアクセス
    const weekUrl = `${BASE_URL}/schedule/week/${SHOP_ID}`;
    await page.goto(weekUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    // 現在の週のデータを取得
    let weeklyData = await extractWeeklySchedule(page, start);
    weeklyData.forEach((day) => {
      if (day.date >= startDate && day.date <= endDateStr && !collectedDates.has(day.date)) {
        allResults.push(day);
        collectedDates.add(day.date);
      }
    });

    // 必要に応じて追加の週を取得
    let maxIterations = 5; // 最大5週間まで
    while (collectedDates.size < days && maxIterations > 0) {
      // 翌週ページへのリンクを取得
      const nextWeekLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("a"));
        const next = links.find((a) => a.textContent?.includes("翌週"));
        return next?.href || null;
      });

      if (!nextWeekLink) {
        break;
      }

      await page.goto(nextWeekLink, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1000));

      weeklyData = await extractWeeklySchedule(page, start);
      let addedThisWeek = false;
      weeklyData.forEach((day) => {
        if (day.date >= startDate && day.date <= endDateStr && !collectedDates.has(day.date)) {
          allResults.push(day);
          collectedDates.add(day.date);
          addedThisWeek = true;
        }
      });

      // 新しいデータが追加されなかった場合は終了
      if (!addedThisWeek) {
        break;
      }

      maxIterations--;
    }

    // 日付順にソート
    allResults.sort((a, b) => a.date.localeCompare(b.date));

    return allResults;
  } finally {
    await page.close();
  }
}

/**
 * ブラウザを閉じる
 */
export async function closeSparkScheduleBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    isLoggedIn = false;
  }
}
