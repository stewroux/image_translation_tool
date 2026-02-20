# 画像日本語翻訳ツール / Image Japanese Translator

![Version](https://img.shields.io/badge/version-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white)

<div align="center">
  <!-- TODO: プロジェクトのロゴやデモGIFを配置してください -->
  <img src="https://placehold.co/800x400/1e293b/6366f1?text=Image+Japanese+Translator+Demo" alt="App Demo" width="100%">
</div>

## Description / Overview
**「誰もが直感的に、画像内の日本語を英語に翻訳し、レイアウトを保ったまま画像として保存できる体験を提供する」**

インターネット上の画像やマンガ、スクリーンショットに含まれる日本語テキストを、AI（Google Gemini 2.5 Flash）が自動で検出・翻訳し、元のレイアウト上にシームレスに合成表示するWebアプリケーションです。

> **Note**: 現在、本アプリケーションはローカル開発環境での利用を前提としています。利用にはご自身の Google Gemini API キーが必要となります。

---

## Features

- 🖼️ **スマート画像読み込み**: ドラッグ＆ドロップで素早く画像を読み込み。AIが画像内容を分析し、最適なファイル名を自動提案。
- 🔍 **高精度なOCR & 翻訳**: Google Gemini AIを使用し、日本語テキストを高精度で検出し、文脈に沿った自然な英語へ自動翻訳。
- ✏️ **直感的なキャンバス編集**: 翻訳されたテキストブロックをマウスクリックで選択し、ドラッグでの位置調整や角のハンドルを使ったリサイズが可能。元の画像背景に応じた文字色・背景色の自動調整機能付き。
- 📁 **多彩なエクスポート機能**: 10%〜100%の画質調整に加え、オリジナルサイズのほか、HD、Full HD、4K、さらには各種SNS（Twitter, Instagram等）向けのプリセットサイズでのダウンロードに対応。
- 🔒 **セキュアな設計**: 処理はすべてブラウザとGoogle間で行われ、画像やデータが中間サーバーに保存されることはありません。

---

## Requirement

- **Node.js**: v18以上を推奨
- **Google Gemini API Key**: APIを利用するために必須

---

## Installation

リポジトリをクローンし、必要な依存関係をインストールします。

```bash
# 1. リポジトリのクローン
git clone https://github.com/stewroux/image_translation_tool.git
cd image_translation_tool

# 2. 依存関係のインストール
npm install

# 3. 環境変数の設定
# .env.local ファイルを作成し、Gemini APIキーを設定してください。
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
```

---

## Usage

1. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
2. ブラウザで `http://localhost:5173` （デフォルト）を開きます。
3. **ブラウザ上の操作**:
   - 画面の「クリックしてアップロード」エリアに画像をドラッグ＆ドロップします。
   - 「画像を翻訳」ボタンをクリックして翻訳を開始します。
   - 処理完了後、プレビュー上でテキストブロックをドラッグ・リサイズして好みのレイアウトに微調整します。
   - 画面右下の「エクスポート設定」から出力サイズ等を選び、「画像をダウンロード」ボタンで保存します。

---

## Contributing

Pull Request や Issue はいつでも歓迎します！
新しい機能の提案、バグの報告、コードの改善など、どなたからの貢献もお待ちしております。

1. このリポジトリを Fork する
2. 機能追加用のブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'Add some amazing feature'`)
4. ブランチに Push する (`git push origin feature/amazing-feature`)
5. Pull Request を作成する

---

## Author

- **開発者**: Ryoma Sato (or Your Name)
- ご不明な点やフィードバックがあれば、Issueを通じてお知らせください。

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
