# 画像日本語翻訳ツール

画像内の日本語テキストを直感的に英語へ翻訳し、元のレイアウトを維持したまま画像として保存できる、シームレスな体験を提供します。

![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.1.12-000000?logo=next.js&logoColor=white.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss&logoColor=white.svg)
![Gemini](https://img.shields.io/badge/Gemini-AI-orange?logo=google-gemini&logoColor=white.svg)

<div align="center">
  <img src="images/app-light-mode.png" alt="App Preview" width="80%">
</div>

[🇺🇸 English is here](./README.md)

## プロジェクト概要

**画像日本語翻訳ツール**は、Google Gemini AIを活用して画像（マンガ、スクリーンショット、資料画像など）に含まれる日本語を自動で検出し、文脈に沿った英語に翻訳するプロフェッショナルなWebアプリケーションです。

翻訳後のテキストは元の画像レイアウト上にオーバーレイ表示され、ユーザーはデザイン知識がなくても直感的に位置やサイズ、書き出し品質を調整できます。

> **Note**: 本プロジェクトは、マンガや技術資料の日本語から英語への翻訳に特化しており、高いOCR精度とレイアウト維持の両立を目的としています。

## 主な機能

- 🚀 **ゼロ設定でOCR＆翻訳**: Google Gemini 2.0 Flashを採用し、超高速かつコンテキストを考慮した高精度な翻訳を実現。
- 🎨 **直感的なキャンバスエディタ**: 配置された翻訳テキストをマウスでドラッグ移動、角のハンドルでリサイズが可能。
- 📐 **スマートなレイアウト保護**: AIが背景色を自動推定し、元の画像に馴染むようにテキストを合成。
- 📁 **プロ仕様のエクスポート**: 4K、HD、各種SNS（Twitter/X等）向けのプリセットと、10%〜100%の画質調整機能を搭載。
- ⚖️ **単位変換ツール**: 図面や資料内の単位（cmからinch, kmからmileなど）を自動で検出し、一括変換する機能を内蔵。
- 🔒 **プライバシー重視**: 処理はユーザーのブラウザとGoogle API間のみで行われ、画像が当サーバーに保存されることはありません。

## 技術スタック

- **フロントエンド**: [Next.js 15.1.12](https://nextjs.org/) (App Router)
- **UIロジック**: [React 19](https://react.dev/)
- **スタイリング**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AIエンジン**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **プログラミング言語**: [TypeScript](https://www.typescriptlang.org/)
- **デプロイ先**: [Vercel](https://vercel.com/) (推奨)

## 前提条件

- **Node.js**: 20.x 以上 (LTS推奨)
- **パッケージマネージャー**: `npm` (v10以上) または `pnpm`
- **APIキー**: 有効な [Google Gemini API キー](https://aistudio.google.com/app/apikey)

## はじめに

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

ルートディレクトリに `.env.local` ファイルを作成します。

```bash
# 翻訳機能を利用するために必須です
NEXT_PUBLIC_GEMINI_API_KEY=あなたのAPIキーをここに入力
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

---

## アーキテクチャとデータフロー

### ディレクトリ構造

```text
├── app/
│   ├── globals.css        # グローバルなデザイン定義とTailwindのインポート
│   ├── layout.tsx         # ルートレイアウト（Google Fonts等の設定）
│   └── page.tsx           # アプリケーションのメインUIと状態管理
├── components/
│   ├── ImageUploader.tsx  # Optimizedなドラッグ＆ドロップゾーン（next/image使用）
│   ├── ExportSettings.tsx # 解像度や画質の詳細設定パネル
│   ├── ProgressBar.tsx    # AI処理の進捗を視覚的に表示
│   ├── ResultDisplay.tsx  # 高性能HTML5 Canvasによる操作レイヤー
│   └── SettingsModal.tsx  # ブラウザ内でのAPIキー管理（LocalStorage使用）
├── services/
│   └── geminiService.ts   # Geminiへの高度なプロンプトエンジニアリング
├── utils/
│   └── unitConverter.ts   # 正規表現による単位検出と変換ロジック
└── public/                # アイコン・静的ファイル
```

### リクエストライフサイクル

1. **アップロード**: ユーザーが画像を `ImageUploader` に投入。
2. **AI分析**: 画像をBase64化し、Gemini 2.0 Flashを呼び出し。
3. **構造化OCR**: Geminiから以下の情報をJSON形式で取得：
    - `boundingBox`: 座標（x, y, width, height）
    - `japaneseText`: 検出された日本語
    - `englishText`: 高精度な英訳
    - `backgroundColor`: 背景色の推定値
4. **描画**: `ResultDisplay` がCanvas上に元画像を描画し、翻訳テキストを重ね合わせ。
5. **手動修正**: ユーザーが位置、サイズ、単位変換を微調整。
6. **エクスポート**: 指定された解像度で再描画し、画像として保存。

---

## 開発工程・ワークフロー

開発プロセスは以下の3つのフェーズに分けて、品質と速度を両立させています。

### フェーズ1: 計画と要件定義 (PRD)
- 対象範囲の策定（日英翻訳特化、ユーザー登録なし）。
- UXフローの設計：アップロード → 翻訳 → 編集 → 保存。
- `要件定義書.md` へのドキュメント化。

### フェーズ2: コアロジック実装
- `@google/genai` の統合。
- CanvasベースのUI操作ロジック（移動・リサイズ）の実装。
- `geminiService` における、完全なJSONレスポンスを保証するためのプロンプト構築。

### フェーズ3: ブラッシュアップと最適化
- セキュリティ監査と脆弱性対応（`next@15.1.12`への更新など）。
- 書き出しパフォーマンスの最適化。
- UX向上（グラスモーフィズム、ダークモードのデザイン洗練）。

---

## 環境変数

| 変数名 | 必須 | 説明 | デフォルト値 |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | はい* | Google Gemini API キー | - |

> **Note**: 環境変数が未設定の場合、アプリ画面の「設定」ボタンから入力したキーが `localStorage` 経由で優先的に利用されます。

## 利用可能なスクリプト

| コマンド | 内容 |
|---------|--------|
| `npm run dev` | 開発用サーバーを起動 (localhost:3000) |
| `npm run build` | 本番用ビルドの生成 |
| `npm run start` | ビルド済みアプリの実行 |
| `npm run lint` | コード規約のチェック |

## テストと検証

現時点では以下の手法で品質を担保しています：
- **ビルドテスト**: `npm run build` による型チェックとLint。
- **マニュアルテスト**: 実際のマンガや技術資料を用いたOCR精度と座標ズレの検証。

## デプロイ

### Vercelでの公開手順
1. GitHubリポジトリを [Vercel](https://vercel.com) に連携。
2. 環境変数 `NEXT_PUBLIC_GEMINI_API_KEY` をプロジェクト設定に登録。
3. デプロイ実行。App Router構成により自動的に最適化されます。

## トラブルシューティング

### APIキーが反映されない
- **原因**: `.env.local` よりも、画面右上の⚙️アイコンから入力した設定（LocalStorage）が優先される場合があります。
- **解決策**: 画面上部の設定パネルを開き、正しいキーが入力されているか確認してください。

### キャンバスの動作が重い
- **原因**: 4Kなどの超高解像度画像を直接操作している。
- **解決策**: プレビュー時は操作性を保つために解像度を調整していますが、保存時は元の解像度を維持してエクスポートされます。

## コントリビューション

1. プロジェクトをフォークします。
2. フィーチャーブランチを作成します (`git checkout -b feature/AmazingFeature`)。
3. 変更をコミットします (`git commit -m 'Add some AmazingFeature'`)。
4. ブランチにプッシュします (`git push origin feature/AmazingFeature`)。
5. プルリクエストを作成してください。

## ライセンスと開発者

- **開発者**: Ryoma Sato
- **ライセンス**: [MIT License](LICENSE)
