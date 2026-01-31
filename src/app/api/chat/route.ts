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
        system: `あなたは店舗運営をサポートするアシスタントです。
以下の業務について相談に乗ってください：
- 出勤管理・シフト調整
- スタッフへの連絡・指示
- 売上・集客の改善
- トラブル対応
- その他の店舗運営全般

簡潔で実用的なアドバイスを心がけてください。`,
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
