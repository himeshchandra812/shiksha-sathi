# Shiksha Sathi 🎓

**An AI-powered teaching and learning co-pilot for coding and robotics education.**

Shiksha Sathi is a full-stack educational application designed to support teachers and students in STEM classrooms. It brings AI-assisted teaching workflows, student doubt support, interactive hardware simulations, quizzes, and learning progress tools into one multilingual interface.

> **Project focus:** Make coding and robotics education more approachable for students while helping teachers prepare learning activities and respond to classroom needs.

## ✨ What it can do

### 👩‍🏫 Teacher tools
- **AI teaching assistant:** Ask for help with lesson planning, classroom explanations, coding concepts, and hardware troubleshooting.
- **Teacher AI Suite:** Access task automation, personalized learning-path support, live lesson SOS, and smart-assessment workflows.
- **Learning activity support:** Generate worksheet and coding-challenge content with AI assistance.
- **Student doubt management:** Review student questions, search and filter inquiries, add teacher notes, mark doubts as resolved, and review flagged off-topic queries.

### 🧑‍🎓 Student learning tools
- **AI doubt support:** Ask questions about coding, logic, and electronics and receive guided explanations.
- **Quiz Arena:** Join a teacher-hosted quiz using a room PIN, or practise with quiz activities. Quizzes include timed questions, scoring, and explanations.
- **Progress and motivation:** View leaderboard rankings, points, quiz activity, and achievement indicators.

### 🔌 Interactive hardware learning
Explore a virtual hardware visualizer with interactive scenarios for:
- LED blinking and common wiring faults
- Ultrasonic distance measurement
- Servo motor control

Learners can change circuit settings, simulate common mistakes, inspect diagnostic feedback, and view related Arduino C++ / block-style logic.

### 🌐 Multilingual interface
The interface includes **English, Hindi, and Telugu** language options to make STEM learning more accessible.

## 🧰 Tech stack

| Area | Technologies |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| Styling and UI | Tailwind CSS, Lucide React, Motion |
| Backend | Node.js, Express, TypeScript |
| AI services | Google Gemini API, Sarvam AI API |
| Build tools | Vite, esbuild |

## 🧠 AI integration and reliability

The backend supports Google Gemini and Sarvam AI integrations. Gemini requests include retry handling for transient service errors and fallback across configured model choices. Sarvam requests use a candidate-model fallback flow.

AI provider access is handled by the Express backend. **Keep API keys on the server and never expose them in frontend code or commit a real `.env` file.**

## 🏗️ Project structure

```text
.
├── src/
│   ├── components/
│   │   ├── HardwareVisualizer.tsx
│   │   ├── LeaderboardTracker.tsx
│   │   ├── LoginPortal.tsx
│   │   ├── StudentDoubtsTracker.tsx
│   │   ├── StudentQuizHub.tsx
│   │   └── TeacherAISuite.tsx
│   ├── App.tsx
│   └── index.css
├── server.ts
├── .env.example
├── package.json
└── vite.config.ts
```

## 🚀 Run locally

### Prerequisites
- Node.js 18 or later
- npm
- A Google Gemini API key and/or Sarvam AI API key for the corresponding AI provider features

### 1. Clone the repository

```bash
git clone https://github.com/himeshchandra812/shiksha-sathi.git
cd shiksha-sathi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

Add the API keys you intend to use to `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY2=your_optional_second_gemini_key
SARVAM_API_KEY=your_sarvam_api_key
NODE_ENV=development
```

Only configure keys for providers you plan to use. Never commit secrets.

### 4. Start the development server

```bash
npm run dev
```

### 5. Create a production build

```bash
npm run build
npm start
```

## 🔐 Security

- Store provider API keys in server-side environment variables.
- Do not share or commit your local `.env` file.
- See [SECURITY.md](SECURITY.md) for security-related guidance.

## 🛣️ Roadmap

Ideas for future development:
- Add a hosted live demo and walkthrough video.
- Expand teacher and student analytics with classroom-ready reports.
- Improve accessibility and add more Indian languages.
- Add more interactive STEM simulations and reusable lesson resources.

## 🤝 Contributing

Suggestions, bug reports, and improvements are welcome. Open an issue to discuss a proposed change before submitting a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file if present in the repository.

---

**Built to make teaching and learning coding and robotics more engaging, practical, and accessible.**
