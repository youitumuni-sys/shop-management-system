import puppeteer, { Browser } from "puppeteer";
import { scrapeSparkSchedule } from "./spark-schedule-scraper";

// ダミーキャスト一覧（写メ日記カウントや出勤リストから除外）
const DUMMY_CASTS = [
  "まなみ", "パフェ", "あずさ", "なな", "うい", "いつき",
  "みかん", "ここね", "みず", "ふき", "かりな", "かのん"
];

// ダミーキャスト判定
function isDummyCast(name: string): boolean {
  return DUMMY_CASTS.includes(name);
}

export interface AttendanceInfo {
  name: string;
  startTime: string;
  endTime: string;
}

export interface PhotoDiaryPost {
  name: string;
  title: string;
  postedAt: string;
  imageUrl?: string;
}

export interface UnmatchedDiaryAuthor {
  name: string;
  postCount: number;
  posts: { title: string; time: string }[];
}

export interface ScrapingResult {
  scrapedAt: string;
  attendance: AttendanceInfo[];
  photoDiaries: PhotoDiaryPost[];
  checkResults: PhotoDiaryCheckResult[];
  unmatchedAuthors: UnmatchedDiaryAuthor[];
}

export interface PhotoDiaryCheckResult {
  name: string;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  postCount: number;
  posts: { title: string; time: string }[];
  status: "complete" | "partial" | "none";
}

const SCHEDULE_URL = "https://umeda.pururun-komachi.com/schedule/";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PHOTO_DIARY_URL = "https://umeda.pururun-komachi.com/photo_bbs/";
// 写メ日記は CityHeaven の iframe widget から取得
// num=150 で150件まで取得（目標100件を確実に取得するため余裕を持たせる）
const CITYHEAVEN_WIDGET_URL = "https://blogparts.cityheaven.net/widget/?shopId=1700000418&mode=2&type=22&limitedKind=0&num=150&col=5&color=7&width=340&of=y2";

let browser: Browser | null = null;

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

/**
 * 出勤情報を取得する
 * Spark Schedule から本日の出勤情報を取得
 * ダミーキャストは除外される
 */
export async function scrapeSchedule(): Promise<AttendanceInfo[]> {
  // Spark Schedule から出勤情報を取得
  const sparkAttendance = await scrapeSparkSchedule();

  // AttendanceInfo 形式に変換し、ダミーキャストを除外
  return sparkAttendance
    .filter((item) => !isDummyCast(item.name))
    .map((item) => ({
      name: item.name,
      startTime: item.startTime,
      endTime: item.endTime,
    }));
}

/**
 * 旧: 公式サイトから出勤情報を取得（バックアップ用に残す）
 * @deprecated Spark Schedule を使用してください
 */
export async function scrapeScheduleFromWebsite(): Promise<AttendanceInfo[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // ユーザーエージェントを設定（ブロック回避）
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(SCHEDULE_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // ページ読み込み待機（長めに）
    await new Promise((r) => setTimeout(r, 3000));

    // 出勤情報を取得
    const attendance = await page.evaluate(() => {
      const results: { name: string; startTime: string; endTime: string }[] = [];
      const seen = new Set<string>();

      // プロフィールリンクから女の子を取得
      // セレクタ: ../profile/?id=XXX 形式のリンクを取得
      const girlLinks = document.querySelectorAll('a[href*="profile"]');

      // デバッグ: リンク数を確認
      console.log("Found girl links:", girlLinks.length);

      girlLinks.forEach((el) => {
        // 名前を取得: まずimg altから、なければリンクテキストから
        const imgEl = el.querySelector("img");
        let name = imgEl?.getAttribute("alt")?.trim() || "";

        // img altがない場合はリンクテキストから取得
        if (!name) {
          const fullText = el.textContent?.trim() || "";
          // 年齢や括弧を除去して名前のみ抽出
          const nameMatch = fullText.match(/^([^(（\d\s]+)/);
          name = nameMatch ? nameMatch[1].trim() : "";
        }

        if (name && name.length > 0 && name.length < 20 && !seen.has(name)) {
          seen.add(name);

          // 親要素から時間を探す（最大10階層まで探索）
          let timeText = "";
          let parent = el.parentElement;
          for (let i = 0; i < 10 && parent; i++) {
            const text = parent.textContent || "";
            // 時間パターン: 10:00~22:00, 10:00～22:00, 10:00-22:00, 10:00ー22:00
            const timeMatch = text.match(/(\d{1,2}:\d{2})\s*[~～\-ー→]\s*(\d{1,2}:\d{2})/);
            if (timeMatch) {
              timeText = timeMatch[0];
              break;
            }
            parent = parent.parentElement;
          }

          // 兄弟要素からも時間を探す
          if (!timeText) {
            const siblings = el.parentElement?.children;
            if (siblings) {
              for (const sibling of Array.from(siblings)) {
                const text = sibling.textContent || "";
                const timeMatch = text.match(/(\d{1,2}:\d{2})\s*[~～\-ー→]\s*(\d{1,2}:\d{2})/);
                if (timeMatch) {
                  timeText = timeMatch[0];
                  break;
                }
              }
            }
          }

          const timeMatch = timeText.match(/(\d{1,2}:\d{2})\s*[~～\-ー→]\s*(\d{1,2}:\d{2})/);

          results.push({
            name,
            startTime: timeMatch?.[1] || "",
            endTime: timeMatch?.[2] || "",
          });
        }
      });

      return results;
    });

    return attendance;
  } finally {
    await page.close();
  }
}

export async function scrapePhotoDiaries(): Promise<PhotoDiaryPost[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // ユーザーエージェントを設定
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // CityHeaven の widget URL から直接取得（iframe コンテンツ）
    await page.goto(CITYHEAVEN_WIDGET_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // ページ読み込み待機
    await new Promise((r) => setTimeout(r, 2000));

    // 写メ日記投稿を取得
    const posts = await page.evaluate(() => {
      const results: { name: string; title: string; postedAt: string; imageUrl?: string }[] = [];

      // CityHeaven widget の HTML構造:
      // li.box > a.mkThumb > img
      //        > div.text > p.date, p.subject
      const postElements = document.querySelectorAll("li.box");

      postElements.forEach((el) => {
        // 投稿者名: p.subject
        const nameEl = el.querySelector("p.subject");
        // 投稿日時: p.date
        const dateEl = el.querySelector("p.date");
        // 画像: a.mkThumb img または a.mkThumbL img
        const imgEl = el.querySelector("a.mkThumb img, a.mkThumbL img");

        const name = nameEl?.textContent?.trim() || "";
        const postedAt = dateEl?.textContent?.trim() || "";
        let imageUrl = imgEl?.getAttribute("src") || undefined;

        // 画像URLが // で始まる場合は https: を追加
        if (imageUrl && imageUrl.startsWith("//")) {
          imageUrl = "https:" + imageUrl;
        }

        if (name) {
          results.push({
            name,
            title: "", // widget では title は表示されないため空
            postedAt,
            imageUrl,
          });
        }
      });

      return results;
    });

    // ダミーキャストの投稿を除外
    return posts.filter((post) => !isDummyCast(post.name));
  } finally {
    await page.close();
  }
}

/**
 * 名前を正規化する（マッチング精度向上のため）
 * - 全角スペース・半角スペースを除去
 * - ひらがな・カタカナは区別せずマッチングするため、カタカナをひらがなに変換
 */
function normalizeName(name: string): string {
  // 空白を除去
  let normalized = name.replace(/[\s\u3000]/g, "");
  // 全角英数字を半角に変換
  normalized = normalized.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  );
  // カタカナをひらがなに変換
  normalized = normalized.replace(/[\u30A1-\u30F6]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0x60)
  );
  return normalized.toLowerCase();
}

/**
 * 名前がマッチするかチェック（正規化後に部分一致）
 */
function namesMatch(name1: string, name2: string): boolean {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  // 完全一致
  if (n1 === n2) return true;

  // 部分一致（どちらかが他方を含む）
  // ただし、短い方が2文字以上の場合のみ（1文字だと誤マッチが多い）
  const shorter = n1.length <= n2.length ? n1 : n2;
  const longer = n1.length > n2.length ? n1 : n2;

  if (shorter.length >= 2 && longer.includes(shorter)) {
    return true;
  }

  return false;
}

export async function checkPhotoDiaries(): Promise<ScrapingResult> {
  const scrapedAt = new Date().toISOString();

  // 並行してスクレイピング
  const [attendance, photoDiaries] = await Promise.all([
    scrapeSchedule(),
    scrapePhotoDiaries(),
  ]);

  // 今日の日付を取得（日本時間）
  const now = new Date();
  const jstOffset = 9 * 60; // JST is UTC+9
  const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
  const todayMonth = jstTime.getUTCMonth() + 1;
  const todayDay = jstTime.getUTCDate();
  const todayStr = `${todayMonth}/${todayDay}`;

  // 本日の投稿のみをフィルタリング
  const todayPosts = photoDiaries.filter((post) => {
    // postedAt は "1/28 16:30" のような形式
    return post.postedAt.startsWith(todayStr);
  });

  // マッチした投稿を追跡するセット
  const matchedPostIndices = new Set<number>();

  // 出勤者と写メ日記を照合
  const checkResults: PhotoDiaryCheckResult[] = attendance.map((girl) => {
    const herPosts: PhotoDiaryPost[] = [];

    todayPosts.forEach((post, index) => {
      if (namesMatch(post.name, girl.name)) {
        herPosts.push(post);
        matchedPostIndices.add(index);
      }
    });

    const postCount = herPosts.length;
    let status: "complete" | "partial" | "none" = "none";

    if (postCount >= 3) {
      status = "complete";
    } else if (postCount > 0) {
      status = "partial";
    }

    return {
      name: girl.name,
      isWorking: true,
      startTime: girl.startTime,
      endTime: girl.endTime,
      postCount,
      posts: herPosts.map((p) => ({ title: p.title, time: p.postedAt })),
      status,
    };
  });

  // マッチしなかった投稿者を集計
  const unmatchedPostsByAuthor = new Map<string, PhotoDiaryPost[]>();
  todayPosts.forEach((post, index) => {
    if (!matchedPostIndices.has(index)) {
      const existing = unmatchedPostsByAuthor.get(post.name) || [];
      existing.push(post);
      unmatchedPostsByAuthor.set(post.name, existing);
    }
  });

  const unmatchedAuthors: UnmatchedDiaryAuthor[] = Array.from(unmatchedPostsByAuthor.entries())
    .filter(([name]) => !isDummyCast(name)) // ダミーキャストを除外
    .map(([name, posts]) => ({
      name,
      postCount: posts.length,
      posts: posts.map((p) => ({ title: p.title, time: p.postedAt })),
    }))
    .sort((a, b) => b.postCount - a.postCount); // 投稿数の多い順

  return {
    scrapedAt,
    attendance,
    photoDiaries: todayPosts, // 本日の投稿のみ返す
    checkResults,
    unmatchedAuthors,
  };
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
