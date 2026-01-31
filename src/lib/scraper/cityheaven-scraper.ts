import puppeteer, { Browser, Page } from "puppeteer";

export interface CityHeavenGirl {
  id: string;
  name: string;
  age?: number;
  height?: number;
  bust?: number;
  waist?: number;
  hip?: number;
  profileUrl?: string;
  photoUrl?: string;
  diaryCount?: number;
  lastDiaryDate?: string;
  accessCount?: number;
  bookmarkCount?: number;
}

/**
 * 女の子別アクセス統計情報
 */
export interface GirlAccessStats {
  name: string;
  dailyAccess: { [date: string]: number }; // 日別アクセス数 (例: "01/01": 100)
  monthlyTotal: number; // 今月合計
  lastMonthTotal: number; // 先月合計
  change: number; // 増減
}

/**
 * 女の子別アクセス統計の取得結果
 */
export interface GirlAccessStatsResult {
  year: number;
  month: number;
  girls: GirlAccessStats[];
  scrapedAt: string;
}

/**
 * 女の子別日記投稿統計情報
 */
export interface GirlDiaryStats {
  name: string;
  dailyDiary: { [date: string]: number }; // 日別日記投稿数 (例: "01/01": 3)
  monthlyTotal: number; // 今月合計
  lastMonthTotal: number; // 先月合計
  change: number; // 増減
}

/**
 * 女の子別日記統計の取得結果
 */
export interface GirlDiaryStatsResult {
  year: number;
  month: number;
  girls: GirlDiaryStats[];
  scrapedAt: string;
}

export interface CityHeavenStats {
  totalGirls: number;
  publishedCount: number;
  nonPublishedCount: number;
  scrapedAt: string;
}

export interface CityHeavenResult {
  stats: CityHeavenStats;
  girls: CityHeavenGirl[];
}

const LOGIN_URL = "https://newmanager.cityheaven.net/C1Login.php";
const BASE_URL = "https://newmanager.cityheaven.net";

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
  const loginId = process.env.CITYHEAVEN_LOGIN_ID;
  const password = process.env.CITYHEAVEN_PASSWORD;
  const shopDir = process.env.CITYHEAVEN_SHOP_DIR;

  if (!loginId || !password) {
    throw new Error("ログイン情報が設定されていません");
  }

  try {
    const loginUrl = `${LOGIN_URL}?shopdir=${shopDir}`;
    await page.goto(loginUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // oldLoginフォーム（表示されている方）のセレクタを使用
    // 入力フィールドは txt_account と txt_password
    const accountSelector = 'form.oldLogin input[name="txt_account"]';
    const passwordSelector = 'form.oldLogin input[name="txt_password"]';
    const submitSelector = 'form.oldLogin button[type="submit"][name="login"]';

    // フォームが読み込まれるのを待機
    await page.waitForSelector(accountSelector, { timeout: 10000 });

    // ログインフォームに入力
    await page.type(accountSelector, loginId);
    await page.type(passwordSelector, password);

    // ログインボタンをクリックして遷移を待機
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
      page.click(submitSelector),
    ]);

    // ログイン成功の確認
    const url = page.url();
    isLoggedIn = !url.includes("Login");

    return isLoggedIn;
  } catch (error) {
    console.error("ログインエラー:", error);
    return false;
  }
}

export async function scrapeGirlsInfo(): Promise<CityHeavenResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const shopDir = process.env.CITYHEAVEN_SHOP_DIR;

  try {
    // ログイン
    const loggedIn = await login(page);
    if (!loggedIn) {
      throw new Error("ログインに失敗しました");
    }

    // キャスト情報一覧ページへ移動（正しいURLは C2GirlList.php）
    await page.goto(`${BASE_URL}/C2GirlList.php?shopdir=${shopDir}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 女の子情報を取得
    // ページ構造: li.draggable > div.galListData 内に女の子情報
    const girls = await page.evaluate(() => {
      const results: {
        id: string;
        name: string;
        age?: number;
        height?: number;
        bust?: number;
        waist?: number;
        hip?: number;
        photoUrl?: string;
      }[] = [];

      // 女の子リストは ul#list > li.draggable
      const girlItems = document.querySelectorAll('ul#list > li.draggable');

      girlItems.forEach((item) => {
        const liElement = item as HTMLLIElement;
        const girlId = liElement.id;

        // 名前は h5 タグ
        const nameEl = item.querySelector('h5');
        const name = nameEl?.textContent?.trim() || "";

        // 詳細情報は .galDetailData 内
        const detailEl = item.querySelector('.galDetailData');
        const detailText = detailEl?.textContent || "";

        // 年齢: 最初の数字
        const ageMatch = detailText.match(/(\d+)歳/);
        const age = ageMatch ? parseInt(ageMatch[1]) : undefined;

        // 身長
        const heightMatch = detailText.match(/(\d+)cm/);
        const height = heightMatch ? parseInt(heightMatch[1]) : undefined;

        // スリーサイズ: B:XXcm W:XXcm H:XXcm
        const bustMatch = detailText.match(/B[：:](\d+)/);
        const waistMatch = detailText.match(/W[：:](\d+)/);
        const hipMatch = detailText.match(/H[：:](\d+)/);

        const bust = bustMatch ? parseInt(bustMatch[1]) : undefined;
        const waist = waistMatch ? parseInt(waistMatch[1]) : undefined;
        const hip = hipMatch ? parseInt(hipMatch[1]) : undefined;

        // 写真URL
        const photoEl = item.querySelector('.photo img') as HTMLImageElement | null;
        const photoUrl = photoEl?.src || undefined;

        if (girlId && name) {
          results.push({
            id: girlId,
            name,
            age,
            height,
            bust,
            waist,
            hip,
            photoUrl,
          });
        }
      });

      return results;
    });

    // 統計情報を取得
    const stats = await page.evaluate(() => {
      // 掲載人数: "■ 掲載人数：XXX人" から抽出
      const statsText = document.body.textContent || "";
      const publishedMatch = statsText.match(/掲載人数[：:](\d+)人/);
      const nonPublishedMatch = statsText.match(/非掲載人数[：:](\d+)人/);

      return {
        totalPublished: publishedMatch ? parseInt(publishedMatch[1]) : 0,
        totalNonPublished: nonPublishedMatch ? parseInt(nonPublishedMatch[1]) : 0,
      };
    });

    return {
      stats: {
        totalGirls: girls.length,
        publishedCount: stats.totalPublished,
        nonPublishedCount: stats.totalNonPublished,
        scrapedAt: new Date().toISOString(),
      },
      girls,
    };
  } finally {
    await page.close();
  }
}

export async function scrapeGirlDetail(girlId: string): Promise<CityHeavenGirl | null> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    if (!isLoggedIn) {
      const loggedIn = await login(page);
      if (!loggedIn) {
        throw new Error("ログインに失敗しました");
      }
    }

    // 女の子詳細ページへ移動
    await page.goto(`${BASE_URL}/C1GirlDetail.php?id=${girlId}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 詳細情報を取得
    const detail = await page.evaluate(() => {
      const nameEl = document.querySelector('.name, h1, .girl-name');
      const ageEl = document.querySelector('[class*="age"]');
      const heightEl = document.querySelector('[class*="height"]');
      const sizeEl = document.querySelector('[class*="size"]');

      const sizeText = sizeEl?.textContent || "";
      const sizeMatch = sizeText.match(/B(\d+)[^\d]+W(\d+)[^\d]+H(\d+)/);

      return {
        name: nameEl?.textContent?.trim() || "",
        age: parseInt(ageEl?.textContent?.replace(/[^0-9]/g, "") || "0"),
        height: parseInt(heightEl?.textContent?.replace(/[^0-9]/g, "") || "0"),
        bust: sizeMatch ? parseInt(sizeMatch[1]) : undefined,
        waist: sizeMatch ? parseInt(sizeMatch[2]) : undefined,
        hip: sizeMatch ? parseInt(sizeMatch[3]) : undefined,
      };
    });

    return {
      id: girlId,
      ...detail,
    };
  } finally {
    await page.close();
  }
}

export async function closeCityHeavenBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    isLoggedIn = false;
  }
}

/**
 * 女の子別アクセス統計を取得する
 * C2TokeiGirl.php から日別・女の子別のアクセス数を取得
 */
export async function scrapeGirlAccessStats(): Promise<GirlAccessStatsResult> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  const shopDir = process.env.CITYHEAVEN_SHOP_DIR;

  try {
    // ログイン
    if (!isLoggedIn) {
      const loggedIn = await login(page);
      if (!loggedIn) {
        throw new Error("ログインに失敗しました");
      }
    }

    // 女の子別アクセス統計ページへ移動
    await page.goto(`${BASE_URL}/C2TokeiGirl.php?shopdir=${shopDir}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // テーブルから統計データを抽出
    // テーブル構造: 横持ち形式
    // - ヘッダー行: [年月, 女の子名1, 女の子名2, ...]
    // - データ行: [日付, アクセス数1, アクセス数2, ...]
    // - 最後の4行: 合計, (空), 今月, 先月, 増減
    const statsData = await page.evaluate(() => {
      const table = document.querySelector("table");
      if (!table) return null;

      const rows = table.querySelectorAll("tr");
      if (rows.length < 2) return null;

      // ヘッダー行から年月と女の子名を取得
      const headerRow = rows[0];
      const headerCells = headerRow.querySelectorAll("th");

      let yearMonth = "";
      const girlNames: string[] = [];

      headerCells.forEach((th, idx) => {
        const text = th.textContent?.trim() || "";
        if (idx === 0) {
          // 年月を抽出 (例: "2026年\n1月")
          yearMonth = text;
        } else {
          // 女の子名
          girlNames.push(text);
        }
      });

      // 年と月を抽出
      const yearMatch = yearMonth.match(/(\d+)年/);
      const monthMatch = yearMonth.match(/(\d+)月/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      const month = monthMatch ? parseInt(monthMatch[1]) : new Date().getMonth() + 1;

      // 各女の子のデータを初期化
      const girlsData: {
        name: string;
        dailyAccess: { [key: string]: number };
        monthlyTotal: number;
        lastMonthTotal: number;
        change: number;
      }[] = girlNames.map((name) => ({
        name,
        dailyAccess: {},
        monthlyTotal: 0,
        lastMonthTotal: 0,
        change: 0,
      }));

      // データ行を処理
      for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const rowHeader = row.querySelector("th");
        const rowLabel = rowHeader?.textContent?.trim() || "";
        const cells = row.querySelectorAll("td");

        // 日付行を判定（MM/DD形式）
        const dateMatch = rowLabel.match(/(\d{2}\/\d{2})/);

        if (dateMatch) {
          // 日別データ
          const dateKey = dateMatch[1];
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              const numValue = value === "---" ? 0 : parseInt(value) || 0;
              girlsData[cellIdx].dailyAccess[dateKey] = numValue;
            }
          });
        } else if (rowLabel === "合計" || rowLabel.includes("合計")) {
          // 合計行（今月の合計）
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].monthlyTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "今月" || rowLabel.includes("今月")) {
          // 今月行
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].monthlyTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "先月" || rowLabel.includes("先月")) {
          // 先月行
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].lastMonthTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "増減" || rowLabel.includes("増減")) {
          // 増減行
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].change = parseInt(value) || 0;
            }
          });
        }
      }

      return {
        year,
        month,
        girls: girlsData,
      };
    });

    if (!statsData) {
      throw new Error("アクセス統計データを取得できませんでした");
    }

    return {
      ...statsData,
      scrapedAt: new Date().toISOString(),
    };
  } finally {
    await page.close();
  }
}

/**
 * 女の子別日記投稿統計を取得する
 * C2TokeiDiary.php から日別・女の子別の日記投稿数を取得
 */
export async function scrapeGirlDiaryStats(): Promise<GirlDiaryStatsResult> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  const shopDir = process.env.CITYHEAVEN_SHOP_DIR;

  try {
    // ログイン
    if (!isLoggedIn) {
      const loggedIn = await login(page);
      if (!loggedIn) {
        throw new Error("ログインに失敗しました");
      }
    }

    // 女の子別日記統計ページへ移動
    await page.goto(`${BASE_URL}/C2TokeiDiary.php?shopdir=${shopDir}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // テーブルから統計データを抽出
    const statsData = await page.evaluate(() => {
      const table = document.querySelector("table");
      if (!table) return null;

      const rows = table.querySelectorAll("tr");
      if (rows.length < 2) return null;

      // ヘッダー行から年月と女の子名を取得
      const headerRow = rows[0];
      const headerCells = headerRow.querySelectorAll("th");

      let yearMonth = "";
      const girlNames: string[] = [];

      headerCells.forEach((th, idx) => {
        const text = th.textContent?.trim() || "";
        if (idx === 0) {
          yearMonth = text;
        } else {
          girlNames.push(text);
        }
      });

      // 年と月を抽出
      const yearMatch = yearMonth.match(/(\d+)年/);
      const monthMatch = yearMonth.match(/(\d+)月/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      const month = monthMatch ? parseInt(monthMatch[1]) : new Date().getMonth() + 1;

      // 各女の子のデータを初期化
      const girlsData: {
        name: string;
        dailyDiary: { [key: string]: number };
        monthlyTotal: number;
        lastMonthTotal: number;
        change: number;
      }[] = girlNames.map((name) => ({
        name,
        dailyDiary: {},
        monthlyTotal: 0,
        lastMonthTotal: 0,
        change: 0,
      }));

      // データ行を処理
      for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const rowHeader = row.querySelector("th");
        const rowLabel = rowHeader?.textContent?.trim() || "";
        const cells = row.querySelectorAll("td");

        // 日付行を判定（MM/DD形式）
        const dateMatch = rowLabel.match(/(\d{2}\/\d{2})/);

        if (dateMatch) {
          // 日別データ
          const dateKey = dateMatch[1];
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              const numValue = value === "---" ? 0 : parseInt(value) || 0;
              girlsData[cellIdx].dailyDiary[dateKey] = numValue;
            }
          });
        } else if (rowLabel === "合計" || rowLabel.includes("合計")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].monthlyTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "今月" || rowLabel.includes("今月")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].monthlyTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "先月" || rowLabel.includes("先月")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].lastMonthTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "増減" || rowLabel.includes("増減")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].change = parseInt(value) || 0;
            }
          });
        }
      }

      return {
        year,
        month,
        girls: girlsData,
      };
    });

    if (!statsData) {
      throw new Error("日記統計データを取得できませんでした");
    }

    return {
      ...statsData,
      scrapedAt: new Date().toISOString(),
    };
  } finally {
    await page.close();
  }
}

/**
 * 女の子情報とアクセス統計・日記統計を結合して取得する
 */
export async function scrapeGirlsInfoWithStats(): Promise<CityHeavenResult & { accessStats: GirlAccessStatsResult; diaryStats: GirlDiaryStatsResult }> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  const shopDir = process.env.CITYHEAVEN_SHOP_DIR;

  try {
    // ログイン
    const loggedIn = await login(page);
    if (!loggedIn) {
      throw new Error("ログインに失敗しました");
    }

    // キャスト情報一覧ページへ移動
    await page.goto(`${BASE_URL}/C2GirlList.php?shopdir=${shopDir}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 女の子基本情報を取得
    const girls = await page.evaluate(() => {
      const results: {
        id: string;
        name: string;
        age?: number;
        height?: number;
        bust?: number;
        waist?: number;
        hip?: number;
        photoUrl?: string;
      }[] = [];

      const girlItems = document.querySelectorAll('ul#list > li.draggable');

      girlItems.forEach((item) => {
        const liElement = item as HTMLLIElement;
        const girlId = liElement.id;
        const nameEl = item.querySelector('h5');
        const name = nameEl?.textContent?.trim() || "";
        const detailEl = item.querySelector('.galDetailData');
        const detailText = detailEl?.textContent || "";

        const ageMatch = detailText.match(/(\d+)歳/);
        const age = ageMatch ? parseInt(ageMatch[1]) : undefined;
        const heightMatch = detailText.match(/(\d+)cm/);
        const height = heightMatch ? parseInt(heightMatch[1]) : undefined;
        const bustMatch = detailText.match(/B[：:](\d+)/);
        const waistMatch = detailText.match(/W[：:](\d+)/);
        const hipMatch = detailText.match(/H[：:](\d+)/);
        const bust = bustMatch ? parseInt(bustMatch[1]) : undefined;
        const waist = waistMatch ? parseInt(waistMatch[1]) : undefined;
        const hip = hipMatch ? parseInt(hipMatch[1]) : undefined;
        const photoEl = item.querySelector('.photo img') as HTMLImageElement | null;
        const photoUrl = photoEl?.src || undefined;

        if (girlId && name) {
          results.push({ id: girlId, name, age, height, bust, waist, hip, photoUrl });
        }
      });

      return results;
    });

    // 統計情報を取得
    const stats = await page.evaluate(() => {
      const statsText = document.body.textContent || "";
      const publishedMatch = statsText.match(/掲載人数[：:](\d+)人/);
      const nonPublishedMatch = statsText.match(/非掲載人数[：:](\d+)人/);
      return {
        totalPublished: publishedMatch ? parseInt(publishedMatch[1]) : 0,
        totalNonPublished: nonPublishedMatch ? parseInt(nonPublishedMatch[1]) : 0,
      };
    });

    // 女の子別アクセス統計ページへ移動
    await page.goto(`${BASE_URL}/C2TokeiGirl.php?shopdir=${shopDir}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // アクセス統計を取得
    const accessStatsData = await page.evaluate(() => {
      const table = document.querySelector("table");
      if (!table) return null;

      const rows = table.querySelectorAll("tr");
      if (rows.length < 2) return null;

      const headerRow = rows[0];
      const headerCells = headerRow.querySelectorAll("th");

      let yearMonth = "";
      const girlNames: string[] = [];

      headerCells.forEach((th, idx) => {
        const text = th.textContent?.trim() || "";
        if (idx === 0) {
          yearMonth = text;
        } else {
          girlNames.push(text);
        }
      });

      const yearMatch = yearMonth.match(/(\d+)年/);
      const monthMatch = yearMonth.match(/(\d+)月/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      const month = monthMatch ? parseInt(monthMatch[1]) : new Date().getMonth() + 1;

      const girlsData: {
        name: string;
        dailyAccess: { [key: string]: number };
        monthlyTotal: number;
        lastMonthTotal: number;
        change: number;
      }[] = girlNames.map((name) => ({
        name,
        dailyAccess: {},
        monthlyTotal: 0,
        lastMonthTotal: 0,
        change: 0,
      }));

      for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const rowHeader = row.querySelector("th");
        const rowLabel = rowHeader?.textContent?.trim() || "";
        const cells = row.querySelectorAll("td");

        const dateMatch = rowLabel.match(/(\d{2}\/\d{2})/);

        if (dateMatch) {
          const dateKey = dateMatch[1];
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              const numValue = value === "---" ? 0 : parseInt(value) || 0;
              girlsData[cellIdx].dailyAccess[dateKey] = numValue;
            }
          });
        } else if (rowLabel === "合計" || rowLabel.includes("合計")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].monthlyTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "今月" || rowLabel.includes("今月")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].monthlyTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "先月" || rowLabel.includes("先月")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].lastMonthTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "増減" || rowLabel.includes("増減")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].change = parseInt(value) || 0;
            }
          });
        }
      }

      return { year, month, girls: girlsData };
    });

    // 女の子別日記統計ページへ移動
    await page.goto(`${BASE_URL}/C2TokeiDiary.php?shopdir=${shopDir}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 日記統計を取得
    const diaryStatsData = await page.evaluate(() => {
      const table = document.querySelector("table");
      if (!table) return null;

      const rows = table.querySelectorAll("tr");
      if (rows.length < 2) return null;

      const headerRow = rows[0];
      const headerCells = headerRow.querySelectorAll("th");

      let yearMonth = "";
      const girlNames: string[] = [];

      headerCells.forEach((th, idx) => {
        const text = th.textContent?.trim() || "";
        if (idx === 0) {
          yearMonth = text;
        } else {
          girlNames.push(text);
        }
      });

      const yearMatch = yearMonth.match(/(\d+)年/);
      const monthMatch = yearMonth.match(/(\d+)月/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      const month = monthMatch ? parseInt(monthMatch[1]) : new Date().getMonth() + 1;

      const girlsData: {
        name: string;
        dailyDiary: { [key: string]: number };
        monthlyTotal: number;
        lastMonthTotal: number;
        change: number;
      }[] = girlNames.map((name) => ({
        name,
        dailyDiary: {},
        monthlyTotal: 0,
        lastMonthTotal: 0,
        change: 0,
      }));

      for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const rowHeader = row.querySelector("th");
        const rowLabel = rowHeader?.textContent?.trim() || "";
        const cells = row.querySelectorAll("td");

        const dateMatch = rowLabel.match(/(\d{2}\/\d{2})/);

        if (dateMatch) {
          const dateKey = dateMatch[1];
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              const numValue = value === "---" ? 0 : parseInt(value) || 0;
              girlsData[cellIdx].dailyDiary[dateKey] = numValue;
            }
          });
        } else if (rowLabel === "合計" || rowLabel.includes("合計")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].monthlyTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "今月" || rowLabel.includes("今月")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].monthlyTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "先月" || rowLabel.includes("先月")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].lastMonthTotal = parseInt(value) || 0;
            }
          });
        } else if (rowLabel === "増減" || rowLabel.includes("増減")) {
          cells.forEach((td, cellIdx) => {
            if (cellIdx < girlsData.length) {
              const value = td.textContent?.trim() || "0";
              girlsData[cellIdx].change = parseInt(value) || 0;
            }
          });
        }
      }

      return { year, month, girls: girlsData };
    });

    // 女の子情報にアクセス統計と日記統計をマージ
    const girlsWithStats = girls.map((girl) => {
      const accessStat = accessStatsData?.girls.find(
        (stat) => stat.name === girl.name
      );
      const diaryStat = diaryStatsData?.girls.find(
        (stat) => stat.name === girl.name
      );
      // 日記数は日別データの合計を使用（monthlyTotalが不正確なため）
      const diaryTotal = diaryStat
        ? Object.values(diaryStat.dailyDiary).reduce((sum, val) => sum + val, 0)
        : 0;
      return {
        ...girl,
        accessCount: accessStat?.monthlyTotal,
        diaryCount: diaryTotal,
      };
    });

    return {
      stats: {
        totalGirls: girls.length,
        publishedCount: stats.totalPublished,
        nonPublishedCount: stats.totalNonPublished,
        scrapedAt: new Date().toISOString(),
      },
      girls: girlsWithStats,
      accessStats: accessStatsData
        ? {
            year: accessStatsData.year,
            month: accessStatsData.month,
            girls: accessStatsData.girls,
            scrapedAt: new Date().toISOString(),
          }
        : {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            girls: [],
            scrapedAt: new Date().toISOString(),
          },
      diaryStats: diaryStatsData
        ? {
            year: diaryStatsData.year,
            month: diaryStatsData.month,
            girls: diaryStatsData.girls,
            scrapedAt: new Date().toISOString(),
          }
        : {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            girls: [],
            scrapedAt: new Date().toISOString(),
          },
    };
  } finally {
    await page.close();
  }
}
