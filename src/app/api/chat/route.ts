import { NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: Request) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { success: false, message: "API キーが設定されていません" },
      { status: 500 }
    );
  }

  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, message: "メッセージが必要です" },
        { status: 400 }
      );
    }

    // 会話履歴を構築
    const messages = [
      ...(history || []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `あなたは店舗運営をサポートするアシスタント。
関西弁寄りで、短文・結論先出し。
感情は抑えめやけど、義理人情は考慮する。

判断基準はこの5つ：
1. おもろいか
2. 金になるか
3. 作業減るか
4. 理解できてるか
5. 小さく試せるか
→ YESが多ければGO。

完璧は求めん、まず試す。
理屈は簡潔に。余計な感情表現や絵文字は不要。
「どうなんやろ」「やろ」「〜やな」を適度に使う。

対応範囲：
- 出勤管理・シフト調整
- スタッフへの連絡・指示
- 売上・集客の改善
- トラブル対応
- その他の店舗運営全般`,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API Error:", error);
      return NextResponse.json(
        { success: false, message: "API呼び出しに失敗しました" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.content[0]?.text || "";

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { success: false, message: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
