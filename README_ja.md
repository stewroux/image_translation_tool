# 画像日本語翻訳ツール

誰もが直感的に、画像内の日本語を英語に翻訳し、レイアウトを保ったまま画像として保存できる体験を提供します。

インターネット上の画像やマンガ、スクリーンショットに含まれる日本語テキストを、AI（Google Gemini 2.5 Flash）が自動で検出・翻訳し、元のレイアウト上にシームレスに合成表示するWebアプリケーションです。

![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white.svg)

[🇺🇸 English is here](README.md)

<div align="center">
  <img src="images/app-light-mode.png" alt="App Light Mode" width="80%">
  <img src="images/app-dark-mode.png" alt="App Dark Mode" width="80%">
</div>

## 主な機能 / Key Features

- 🖼️ **スマート画像読み込み**: ドラッグ＆ドロップで素早く画像を読み込みます。
- 🔍 **高精度なOCR & 翻訳**: Google Gemini AIを使用し、日本語テキストを高精度で検出し、文脈に沿った自然な英語へ自動翻訳します。
- ✏️ **直感的なキャンバス編集**: 翻訳されたテキストブロックをマウスクリックで選択し、ドラッグでの位置調整や角のハンドルを使ったリサイズが可能です。
- 📁 **多彩なエクスポート機能**: 10%〜100%の画質調整に加え、オリジナルサイズのほか、HD、Full HD、4K、さらには各種SNS向けのプリセットサイズでのダウンロードに対応しています。
- 🔒 **セキュアな設計**: 処理はすべてブラウザとGoogle API間で行われます。

## 技術スタック / Tech Stack

- **Framework**: Next.js 15+ (React 19)
- **Styling**: Tailwind CSS v4
- **AI/LLM**: Google Gemini API (`@google/genai`)
- **Deployment**: Next.js 互換ホスティング (例: Vercel)

## 前提条件 / Prerequisites

- Node.js 18 またはそれ以上
- npm, pnpm, または yarn
- Google Gemini API Key

## はじめに / Getting Started

### 1. リポジトリのクローン

```bash
git clone https://github.com/stewroux/image_translation_tool.git
cd image_translation_tool
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

プロジェクトのルートに `.env.local` ファイルを作成します。

```bash
echo "NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
```

または、サーバーを起動した後、アプリケーション内の設定UIに直接APIキーを入力することも可能です（キーはブラウザのローカルストレージに保存されます）。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## アーキテクチャ / Architecture

### ディレクトリ構造

```
├── app/
│   ├── globals.css        # グローバルなTailwindスタイル
│   ├── layout.tsx         # ルートレイアウト（フォント、メタデータ）
│   └── page.tsx           # メインアプリケーションUIと状態管理
├── components/
│   ├── ExportSettings.tsx # 画像エクスポートのUIと設定
│   ├── ImageUploader.tsx  # ドラッグ＆ドロップでのアップロードコンポーネント
│   ├── ProgressBar.tsx    # 翻訳のプログレスバー表示
│   ├── ResultDisplay.tsx  # 翻訳テキストブロック描画用キャンバス
│   └── SettingsModal.tsx  # APIキー設定用のモーダル
├── services/
│   └── geminiService.ts   # Google Gemini API との統合
├── types/
│   └── index.ts           # TypeScriptの型定義
└── public/                # 静的アセット
```

### リクエストライフサイクル

1. ユーザーが `ImageUploader` から画像をアップロード。
2. 画像はBase64にエンコードされ、`geminiService` によって処理される。
3. Gemini APIが画像を解析し、日本語テキスト、バウンディングボックスを検出し、英語の翻訳を返す。
4. `ResultDisplay` がHTML5の `<canvas>` 上に画像をレンダリングし、翻訳されたテキストブロックをオーバーレイ表示。
5. ユーザーがマウスでテキストブロックを調整し、最終的に合成された画像をエクスポート。

### データフロー

```
ユーザー入力 (画像) → Base64 エンコード → Gemini 2.5 Flash API → JSONレスポンス (枠、翻訳結果) → Reactの状態 (State) → Canvas上への描写
```

### 主要コンポーネント

**キャンバス操作 (`ResultDisplay.tsx`)**
- キャンバス上に元画像を描画。
- Gemini APIの出力に基づいて、バウンディングボックスと翻訳テキストを描画。
- テキストブロックのドラッグ、リサイズを処理するマウスイベントを管理。

**Gemini 連携 (`geminiService.ts`)**
- 画像データを `gemini-2.5-flash` モデルに送信。
- バウンディングボックスの座標、翻訳テキスト、背景色等の推定値をJSONで適切に返すようプロンプトを指示。

## 環境変数 / Environment Variables

### オプション設定

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_GEMINI_API_KEY` | ご自身のGoogle Gemini API Key | `AIzaSy...` |

*(この環境変数が設定されていない場合、ユーザーはアプリケーション上の設定モーダルから手動でAPIキーを入力する必要があります。)*

## 利用可能なスクリプト / Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | 開発サーバーを起動する |
| `npm run build` | 本番用ビルドを作成する |
| `npm run start` | 本番サーバーを起動する |
| `npm run lint` | ESLintによるコードチェックを実行する |

## テスト / Testing

現在、このプロジェクトに自動テストは設定されていません。機能の確認は、開発サーバーを起動してサンプルの画像を翻訳することで手動で行ってください。

## デプロイ / Deployment

### Vercel (Next.js推奨)

この Next.js アプリケーションをデプロイする最も簡単な方法は、Vercel Platform を使用することです。

1. ご自身のGitHubリポジトリにコードをプッシュする。
2. そのリポジトリを Vercel にインポート。
3. デフォルトのAPIキーを全ユーザーに提供する場合、Vercelのプロジェクト設定にて `NEXT_PUBLIC_GEMINI_API_KEY` 環境変数を追加する。
4. デプロイ実行！

## トラブルシューティング / Troubleshooting

### APIキー必須エラー

**Error:** アプリケーション上で「API Key Required (APIキーが必要です)」と表示され、翻訳ボタンが押せない。

**Solution:**
1. 画面右上の設定アイコン（⚙️）をクリックします。
2. 有効な Google Gemini API Key を入力してください。
3. 設定を保存します。利用するにはGCPプロジェクトで課金設定が有効になっている必要がある場合があります。

### Next.js キャッシュエラー

**Error:** `Caching failed for pack: Error: ENOENT: no such file or directory` または開発サーバーのポート競合が発生した場合。

**Solution:**
実行中のDevサーバーをすべて停止し、キャッシュをクリアしてから再起動します。
```bash
killall node
rm -rf .next
npm run dev
```

---

## 開発者 / Author

- **開発者**: Ryoma Sato (or Your Name)
- 何かご質問やフィードバックがあれば、Issueを通じてお知らせください。

## ライセンス / License

このプロジェクトは MIT License のもとで公開されています。
