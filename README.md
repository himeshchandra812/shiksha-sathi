# AI-Powered Chat Assistant

A high-performance full-stack chat application built with **React**, **Vite**, and **Express**, featuring multi-model fallback support for **Google Gemini** and **Sarvam AI**.

## 🚀 Features

- **Multi-Model Intelligence**: Seamlessly switch between Gemini and Sarvam AI models.
- **Robust Error Recovery**: Built-in recovery engine that automatically falls back to alternative models if the primary API fails.
- **Streaming-like Reliability**: Optimized backend logic for stable response generation.
- **Modern UI**: Polished interface with responsive design.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, TypeScript.
- **AI Integration**: Google Generative AI SDK, Sarvam AI API.
- **Build System**: esbuild (for server bundling), Vite (for frontend).

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- API Keys for Google Gemini and/or Sarvam AI

## ⚙️ Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd <repository-folder>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`.
   - Add your API keys to the `.env` file.
   ```bash
   cp .env.example .env
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## 🏗️ Project Structure

- `src/`: React frontend application.
- `server.ts`: Express server with AI routing logic.
- `dist/`: Compiled production build (generated).
- `public/`: Static assets.

## 📄 License

MIT
