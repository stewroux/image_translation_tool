# Image Japanese Translator

Providing a seamless experience where anyone can intuitively translate Japanese text within images to English and save the result as an image while preserving the original layout.

This is a web application that automatically detects and translates Japanese text found in images, manga, or screenshots using AI (Google Gemini 2.5 Flash), and seamlessly composites the translated English text back onto the original layout.

![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white.svg)

[🇯🇵 日本語 (Japanese)](./README_ja.md)

<div align="center">
  <img src="images/app-light-mode.png" alt="App Light Mode" width="80%">
  <img src="images/app-dark-mode.png" alt="App Dark Mode" width="80%">
</div>

## Key Features

- 🖼️ **Smart Image Loading**: Quickly load images via drag and drop.
- 🔍 **High-Accuracy OCR & Translation**: Utilizes Google Gemini AI to accurately detect Japanese text and translate it into natural, context-aware English.
- ✏️ **Intuitive Canvas Editing**: Select translated text blocks with a mouse click to drag them for position adjustment or use corner handles to resize them.
- 📁 **Versatile Export Functions**: Supports adjusting image quality from 10% to 100%, and downloading in original size, HD, Full HD, 4K, as well as preset sizes for various SNS platforms.
- 🔒 **Secure Design**: All processing is done between the browser and Google API.

## Tech Stack

- **Framework**: Next.js 15+ (React 19)
- **Styling**: Tailwind CSS v4
- **AI/LLM**: Google Gemini API (`@google/genai`)
- **Deployment**: Next.js compatible hosting (e.g., Vercel)

## Prerequisites

- Node.js 18 or higher
- npm, pnpm, or yarn
- A Google Gemini API Key

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

Create a `.env.local` file at the root of the project:

```bash
echo "NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
```

Alternatively, you can provide the API key directly within the app's settings UI after starting the server (the key will be stored in your browser's local storage).

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Directory Structure

```
├── app/
│   ├── globals.css        # Global Tailwind styles
│   ├── layout.tsx         # Root layout (fonts, metadata)
│   └── page.tsx           # Main application UI and state logic
├── components/
│   ├── ExportSettings.tsx # Image export UI and settings
│   ├── ImageUploader.tsx  # Drag & drop upload component
│   ├── ProgressBar.tsx    # Translation progress indicator
│   ├── ResultDisplay.tsx  # Canvas implementation for moving translated text
│   └── SettingsModal.tsx  # API key configuration modal
├── services/
│   └── geminiService.ts   # Integration with Google Gemini API
├── types/
│   └── index.ts           # TypeScript type definitions
└── public/                # Static assets
```

### Request Lifecycle

1. User uploads an image via `ImageUploader`.
2. Image is converted to Base64 and processed through `geminiService` running in the server environment (or client to Gemini directly).
3. Gemini API analyzes the image, detects Japanese text bounding boxes, and returns English translations.
4. `ResultDisplay` renders the image on an HTML5 `<canvas>` and overlays the translated text blocks.
5. User adjusts the text blocks with the mouse and exports the final composited image.

### Data Flow

```
User Upload → Base64 Encode → Gemini 2.5 Flash API → JSON Response (Boxes, Translations) → React State → Canvas Render
```

### Key Components

**Canvas Interaction (`ResultDisplay.tsx`)**
- Renders original image on canvas.
- Renders bounding boxes and translated text based on Gemini API output.
- Handles mouse events to drag, resize, and edit text blocks.

**Gemini Integration (`geminiService.ts`)**
- Uses `@google/genai` to send image data to the `gemini-2.5-flash` model.
- Instructs Gemini to return a structured JSON response specifying bounding box coordinates, translated text, and estimated background colors.

## Environment Variables

### Optional

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Your Google Gemini API Key. | `AIzaSy...` |

*(If this variable is not provided, the user is required to enter their API key via the settings modal within the application.)*

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build application for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code checks |

## Testing

Currently, there are no automated tests configured for this project. Features should be manually verified by starting the development server and running a sample image translation.

## Deployment

### Vercel (Recommended for Next.js)

The easiest way to deploy this Next.js application is to use the Vercel Platform.

1. Push your code to a GitHub repository.
2. Import your repository into Vercel.
3. Add the `NEXT_PUBLIC_GEMINI_API_KEY` as an Environment Variable in your Vercel project settings (if providing a default key for all users is preferred over local individual input).
4. Deploy!

## Troubleshooting

### API Key Required Error

**Error:** The application prompts "API Key Required" and the translate button is disabled.

**Solution:**
1. Click the settings icon (⚙️) in the top right.
2. Enter your valid Google Gemini API Key.
3. Save the settings. Ensure you have the necessary billing enabled for your Google Cloud Project if required.

### Next.js Cache Issues

**Error:** `Caching failed for pack: Error: ENOENT: no such file or directory` or conflicting dev servers.

**Solution:**
Stop all running dev servers, clear the `.next` cache, and restart.
```bash
killall node
rm -rf .next
npm run dev
```

---

## Author

- **Developer**: Ryoma Sato (or Your Name)
- If you have any questions or feedback, please let me know via Issues.

## License

This project is licensed under the MIT License.
