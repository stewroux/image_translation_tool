# Image Japanese Translator

Providing a seamless experience where anyone can intuitively translate Japanese text within images to English and save the result as an image while preserving the original layout.

![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.1.12-000000?logo=next.js&logoColor=white.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss&logoColor=white.svg)
![Gemini](https://img.shields.io/badge/Gemini-AI-orange?logo=google-gemini&logoColor=white.svg)

<div align="center">
  <img src="images/app-light-mode.png" alt="App Light Mode" width="80%">
</div>

[🇯🇵 日本語 (Japanese)](./README_ja.md)

## Overview

**Image Japanese Translator** is a professional-grade web application that automatically detects and translates Japanese text found in images, manga, or screenshots using Google Gemini AI models. It seamlessly composites the translated English text back onto the original layout, allowing users to adjust position, size, and export quality with zero design skills required.

> **Note**: This project is built for high-accuracy translation and layout preservation, specifically optimized for Japanese-to-English manga and technical document translation.

## Key Features

- 🚀 **Zero-Config OCR & Translation**: Leverages Google Gemini 2.0 Flash for ultra-fast, context-aware translation.
- 🎨 **Interactive Canvas Editor**: Intuitive drag-and-drop movement and corner-handle resizing of translated text blocks.
- 📐 **Smart Layout Preservation**: AI-assisted background color estimation ensures translated text blends naturally with the original image.
- 📁 **Pro-Grade Export**: Presets for 4K, HD, and SNS (Twitter/X, etc.), with adjustable JPEG/PNG quality from 10% to 100%.
- ⚖️ **Unit Converter**: Specialized tool for converting units found in technical diagrams (cm to inch, km to mile, etc.).
- 🔒 **Privacy First**: Client-side processing ensures your images are only sent to Google Gemini and are never stored on our servers.

## Tech Stack

- **Frontend**: [Next.js 15.1.12](https://nextjs.org/) (App Router)
- **UI Logic**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Deployment**: [Vercel](https://vercel.com/) (Recommended)

## Prerequisites

- **Node.js**: 20.x or higher (LTS recommended)
- **Package Manager**: `npm` (v10+) or `pnpm`
- **API Key**: A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/stewroux/image_translation_tool.git
cd image_translation_tool
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Required for translation features
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture & Data Flow

### Directory Structure

```text
├── app/
│   ├── globals.css        # Global design tokens and Tailwind imports
│   ├── layout.tsx         # Root layout with Google Fonts (Inter, Roboto)
│   └── page.tsx           # Main application state and orchestration logic
├── components/
│   ├── ImageUploader.tsx  # Optimized drag & drop zone with next/image preview
│   ├── ExportSettings.tsx # Precision control panel for output dimensions/quality
│   ├── ProgressBar.tsx    # Multi-stage visual feedback for AI processing
│   ├── ResultDisplay.tsx  # High-performance HTML5 Canvas interaction layer
│   └── SettingsModal.tsx  # In-browser API key management (via LocalStorage)
├── services/
│   └── geminiService.ts   # Advanced Prompt Engineering for Gemini structured OCR
├── utils/
│   └── unitConverter.ts   # Regex-based measurement unit detection and conversion
└── public/                # Static assets and icons
```

### Request Lifecycle

1. **Upload**: User drops a file (up to 10MB) into `ImageUploader`.
2. **Analysis**: Client encodes image to Base64 and invokes `gemini-2.0-flash`.
3. **Structured OCR**: AI returns a JSON array containing:
    - `boundingBox`: Normalized coordinates (x, y, width, height).
    - `japaneseText`: Original text detected.
    - `englishText`: High-context translation.
    - `backgroundColor`: Estimated dominant color behind the text.
4. **Interactive Render**: `ResultDisplay` draws the image and overlays editable text blocks on the Canvas.
5. **Modification**: User manually refines position/size/units.
6. **Export**: Canvas is re-rendered at the target resolution and downloaded as a blob.

---

## Development Workflow

Our development process follows a strict 3-phase cycle to ensure code quality and performance:

### Phase 1: Planning & Requirements (PRD)
- Define scope (日英翻訳のみ, account-less).
- Map out UX flow: Upload → Translate → Edit → Export.
- Document in `要件定義書.md`.

### Phase 2: Core Logic implementation
- Integrate `@google/genai`.
- Implement Canvas-based interaction logic (Move/Resize).
- Establish the `geminiService` prompt to ensure 100% JSON consistency.

### Phase 3: Polish & Optimization
- Security audits (e.g., upgrading to `next@15.1.12`).
- Performance optimization (replacing `<img>` with `next/image`).
- UI/UX refinements (Gradients, Glassmorphism, Responsive design).

---

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Yes* | Google Gemini API Key | - |

> **Note**: If the environment variable is missing, the app will fallback to the key stored in `localStorage` via the UI Settings menu.

## Available Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Starts the development server at `localhost:3000` |
| `npm run build` | Compiles the production build |
| `npm run start` | Runs the production-built application |
| `npm run lint` | Checks code for style and consistency issues |

## Testing

Verification is currently performed via:
- **Build Validation**: Running `npm run build` to catch type errors and ESLint warnings.
- **Manual QA**: Uploading standard manga/tech-doc samples to verify OCR accuracy and coordinate mapping.

## Deployment

### Vercel Deployment
1. Connect this repo to [Vercel](https://vercel.com).
2. Set the `NEXT_PUBLIC_GEMINI_API_KEY` in the project settings.
3. Deploy. The App Router architecture works out-of-the-box.

## Troubleshooting

### API Key Conflict
- **Issue**: Translation fails despite setting `.env.local`.
- **Solution**: The UI Settings (LocalStorage) takes precedence in some environments. Click the ⚙️ icon and verify the key there.

### Canvas Performance
- **Issue**: Slow dragging on 4K images.
- **Solution**: Resolution is downscaled for preview while maintaining original dimensions for the final export.

## Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License & Author

- **Developer**: Ryoma Sato
- **License**: [MIT License](LICENSE)
