# Shogun Manager - 風俗店舗管理システム

風俗店舗の日常業務を効率化するための管理ダッシュボードアプリケーションです。

## 機能

- **出勤管理**: 出勤スケジュールの確認とカレンダー表示
- **写メ日記チェック**: キャストの写メ日記投稿状況の確認
- **女の子管理**: キャスト情報の管理（レギュラー/レア/退店の自動分類）
- **CityHeaven連携**: シティヘブンのアクセス統計取得
- **イベント管理**: 店舗イベントの計画と管理
- **TODO管理**: 日常タスクの管理
- **リマインダー**: 定期見直し（イベント/パネル）のリマインダー

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **UI**: React, Tailwind CSS, shadcn/ui
- **スクレイピング**: Puppeteer (ローカル環境のみ)
- **データ保存**: JSONファイル (ローカル) / localStorage (Vercel)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env.local` にコピーして、必要な値を設定してください。

```bash
cp .env.example .env.local
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## Vercelへのデプロイ

### 制限事項

Vercel（サーバーレス環境）には以下の制限があります:

1. **スクレイピング機能は利用不可**: Puppeteerはサーバーレス環境で動作しません
2. **ファイルシステムは読み取り専用**: JSONファイルへのデータ保存は永続化されません

### デプロイ手順

1. **GitHubリポジトリの作成とプッシュ**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

2. **Vercelでのプロジェクト作成**:
   - [Vercel](https://vercel.com) にログイン
   - "Add New" > "Project" をクリック
   - GitHubリポジトリをインポート
   - フレームワークは自動検出されます (Next.js)

3. **環境変数の設定**:
   Vercelのプロジェクト設定で以下の環境変数を設定してください:

   | 変数名 | 説明 |
   |--------|------|
   | `CITYHEAVEN_LOGIN_ID` | CityHeavenログインID |
   | `CITYHEAVEN_PASSWORD` | CityHeavenパスワード |
   | `CITYHEAVEN_SHOP_DIR` | CityHeavenショップディレクトリ |
   | `SPARK_SCHEDULE_ID` | Sparkスケジュール ID |
   | `SPARK_SCHEDULE_PASSWORD` | Sparkスケジュールパスワード |
   | `SPARK_SCHEDULE_SHOP` | Sparkスケジュール店舗名 |

   **注意**: これらの環境変数はスクレイピング機能用ですが、Vercelではスクレイピング自体が動作しないため、現時点では設定は必須ではありません。

4. **デプロイ**:
   - "Deploy" をクリックしてデプロイを開始
   - ビルドが完了すると、デプロイURLが発行されます

### 推奨運用方法

Vercel環境でのスクレイピング機能の代替として、以下の運用を推奨します:

1. **ローカルでスクレイピングを実行**:
   - ローカル環境で `npm run dev` を起動
   - スクレイピング機能を実行してデータを取得
   - データは `data/` ディレクトリに保存されます

2. **データのエクスポート/インポート**:
   - 将来的には外部データベース（Vercel KV、Supabase等）との連携を検討

3. **UIのみVercelで確認**:
   - Vercelデプロイ版は主にUI確認用として使用
   - 実運用はローカル環境で行う

## ディレクトリ構造

```
app/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── api/       # APIルート
│   │   └── (pages)/   # 各ページ
│   ├── components/    # Reactコンポーネント
│   ├── hooks/         # カスタムフック
│   └── lib/           # ユーティリティ・スクレイパー
├── data/              # データ保存ディレクトリ（ローカルのみ）
├── public/            # 静的ファイル
└── vercel.json        # Vercel設定
```

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバー起動 |
| `npm run lint` | ESLintによるコードチェック |

## ライセンス

Private - All rights reserved
