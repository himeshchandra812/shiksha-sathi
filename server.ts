import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';



dotenv.config();

/**
 * Retrieves Google GenAI client instances lazily using available environment API keys.
 */
function getGeminiInstances(): GoogleGenAI[] {
  const instances: GoogleGenAI[] = [];
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY2
  ].filter(Boolean) as string[];

  for (const k of keys) {
    try {
      instances.push(new GoogleGenAI({ 
        apiKey: k,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      }));
    } catch (e) {
      console.warn('[Gemini API] Failed to initialize instance with key:', e);
    }
  }

  if (instances.length === 0) {
    try {
      instances.push(new GoogleGenAI({
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      }));
    } catch (e) {
      console.warn('[Gemini API] Failed to initialize default GenAI instance:', e);
    }
  }

  return instances;
}

/**
 * Executes a Gemini model call with an automated retry mechanism for transient 503 errors,
 * and a robust fallback to a lightweight alternative model if the primary model remains unavailable.
 */
async function generateContentWithFallback(
  options: {
    contents: any;
    systemInstruction: string;
    temperature: number;
    requestedModel?: string;
    maxOutputTokens?: number;
  }
) {
  const aiInstances = getGeminiInstances();
  const baseModels = [
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.7-flash'
  ];
  let requested = options.requestedModel;
  if (requested === 'gemini-2.5-flash') {
    requested = 'gemini-3.6-flash';
  }
  
  const models = [];
  if (requested && !requested.toLowerCase().includes('sarvam')) {
    models.push(requested);
  }
  for (const m of baseModels) {
    if (!models.includes(m)) {
      models.push(m);
    }
  }

  let lastError: any = null;

  for (const modelName of models) {
    for (const aiInstance of aiInstances) {
      const attempts = 2;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`[Gemini API] Calling model "${modelName}" (Attempt ${attempt}/${attempts})`);
          const response = await aiInstance.models.generateContent({
            model: modelName,
            contents: options.contents,
            config: {
              systemInstruction: options.systemInstruction,
              temperature: options.temperature,
              maxOutputTokens: options.maxOutputTokens || 2048,
            },
          });
          
          if (response && response.text) {
            console.log(`[Gemini API] Successfully completed generation with model "${modelName}"`);
            return response;
          }
          
          throw new Error('Received empty response from model.');
        } catch (err: any) {
          lastError = err;
          let errMsg = '';
          try {
            errMsg = typeof err === 'string' ? err : (err.message || JSON.stringify(err) || err.toString() || '');
          } catch (e) {
            errMsg = err?.message || err?.toString() || '';
          }
          errMsg = errMsg.toLowerCase();
          
          console.warn(`[Gemini API] Error using model "${modelName}" (Attempt ${attempt}/${attempts}):`, err.message || err);
          
          const isTransient = errMsg.includes('503') || 
                              errMsg.includes('unavailable') || 
                              errMsg.includes('overloaded') || 
                              errMsg.includes('high demand') ||
                              errMsg.includes('temporary') ||
                              err?.status === 503 ||
                              err?.code === 503 ||
                              err?.error?.code === 503 ||
                              err?.error?.status === 'UNAVAILABLE';

          if (isTransient && attempt < attempts) {
            const backoffTime = attempt * 1000;
            console.log(`[Gemini API] Transient error. Backing off for ${backoffTime}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
          } else {
            break;
          }
        }
      }
    }
    console.warn(`[Gemini API] Model "${modelName}" failed all attempts or returned error. Moving to fallback if available.`);
  }

  throw lastError || new Error('All configured models failed to generate content.');
}

/**
 * Executes a call to Sarvam AI completions endpoint with token cost budgeting.
 */
async function generateContentWithSarvam(options: {
  messages: any[];
  temperature: number;
  model?: string;
  maxTokens?: number;
}) {
  const sarvamApiKey = process.env.SARVAM_API_KEY;
  if (!sarvamApiKey) {
    throw new Error('SARVAM_API_KEY is not configured in your Secrets panel.');
  }

  const endpoint = 'https://api.sarvam.ai/v1/chat/completions';
  
  // Available current Sarvam models (replacing deprecated sarvam-30b)
  const candidateModels: string[] = [];
  const reqModel = options.model || 'sarvam-105b';
  
  // If request passed deprecated 'sarvam-30b', remap to 'sarvam-105b'
  const normalizedModel = reqModel === 'sarvam-30b' ? 'sarvam-105b' : reqModel;
  candidateModels.push(normalizedModel);

  // Add backup models in priority order
  const sarvamPool = ['sarvam-105b', 'sarvam-105b-conversations'];
  for (const m of sarvamPool) {
    if (!candidateModels.includes(m)) {
      candidateModels.push(m);
    }
  }

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      console.log(`[Sarvam AI] Sending request to model "${modelName}"...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': sarvamApiKey,
          'X-API-KEY': sarvamApiKey // Dual header coverage for robust authorization
        },
        body: JSON.stringify({
          model: modelName,
          messages: options.messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens || 650, // Cost effectiveness constraint
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Sarvam AI] Model "${modelName}" failed with status ${response.status}: ${errorText}`);
        lastError = new Error(`Sarvam AI API failed with status ${response.status}: ${errorText}`);
        continue;
      }

      const data: any = await response.json();
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        console.log(`[Sarvam AI] Successfully generated text using model "${modelName}"`);
        return data.choices[0].message.content;
      }
    } catch (err: any) {
      console.warn(`[Sarvam AI] Exception when calling "${modelName}":`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('Invalid or empty response format received from Sarvam AI API.');
}

/**
 * Academic Safety & Educational Guardrail Evaluator
 * Checks whether a user inquiry is strictly academic / educational or off-topic / non-educational.
 */
function evaluateAcademicCompliance(text: string): {
  isAcademic: boolean;
  category: 'coding' | 'hardware' | 'logic' | 'general' | 'non_academic';
  reason?: string;
  detectedTopic?: string;
} {
  const lower = text.toLowerCase().trim();

  // Strong Non-Educational / Disallowed Intent Patterns (Gaming, Gossip, Pop Culture, Inappropriate, Casual Banter)
  const nonAcademicPatterns: { regex: RegExp; reason: string; topic: string }[] = [
    {
      regex: /\b(free\s*fire|pubg|bgmi|fortnite|roblox|gta|minecraft|valorant|call\s*of\s*duty|clash\s*of\s*clans|brawl\s*stars|among\s*us)\b/i,
      reason: 'Gaming & Non-Curriculum Video Games',
      topic: 'Video Games & Cheats'
    },
    {
      regex: /\b(aimbot|cheat\s*code|hacks?\s*for\s*game|mod\s*apk|free\s*diamonds|v-bucks|robux|skin\s*hack)\b/i,
      reason: 'Game Cheating & Unauthorized Game Modifications',
      topic: 'Game Hacks / Cheats'
    },
    {
      regex: /\b(movie|bollywood|hollywood|actor|actress|celebrity|gossip|dating|girlfriend|boyfriend|crush|flirt|romance|kiss|love\s*letter)\b/i,
      reason: 'Entertainment, Celebrity Gossip & Personal Romance',
      topic: 'Pop Culture / Romance'
    },
    {
      regex: /\b(instagram\s*followers|tiktok\s*reels|snapchat\s*streak|youtube\s*subscribers|viral\s*video|prank\s*ideas)\b/i,
      reason: 'Social Media & Non-Educational Entertainment',
      topic: 'Social Media Trends'
    },
    {
      regex: /\b(cricket\s*score|ipl\s*match|football\s*betting|bet\s*money|casino|gambling|lottery)\b/i,
      reason: 'Commercial Sports Scores & Betting/Gambling',
      topic: 'Sports Scores / Betting'
    },
    {
      regex: /\b(tell\s*me\s*a\s*dirty\s*joke|insult\s*someone|how\s*to\s*fight|curse\s*words|bad\s*words)\b/i,
      reason: 'Inappropriate or Disrespectful Inquiry',
      topic: 'Inappropriate Conduct'
    }
  ];

  for (const pattern of nonAcademicPatterns) {
    if (pattern.regex.test(lower)) {
      return {
        isAcademic: false,
        category: 'non_academic',
        reason: pattern.reason,
        detectedTopic: pattern.topic
      };
    }
  }

  // Academic Topic Categorization
  const isHardware = /\b(wire|wiring|led|sensor|pin|gpio|motor|servo|arduino|resistor|breadboard|ultrasonic|capacitor|vcc|gnd|multimeter|micro:?bit|battery|circuit)\b/i.test(lower);
  const isCoding = /\b(scratch|python|c\+\+|javascript|html|css|sprite|variable|function|syntax|code|bug|indentation|compile|runtime|method|array|string|import)\b/i.test(lower);
  const isLogic = /\b(loop|if|else|repeat|forever|condition|boolean|algorithm|flowchart|binary|logic|comparison|nested)\b/i.test(lower);

  if (isHardware) {
    return { isAcademic: true, category: 'hardware', detectedTopic: 'Hardware & Electronics' };
  }
  if (isCoding) {
    return { isAcademic: true, category: 'coding', detectedTopic: 'Programming & Syntax' };
  }
  if (isLogic) {
    return { isAcademic: true, category: 'logic', detectedTopic: 'Computational Logic' };
  }

  return { isAcademic: true, category: 'general', detectedTopic: 'Classroom Curriculum' };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Google GenAI
  // It will use process.env.GEMINI_API_KEY and GEMINI_API_KEY2.
  const apiKey1 = process.env.GEMINI_API_KEY;
  const apiKey2 = process.env.GEMINI_API_KEY2;
  const aiInstances: GoogleGenAI[] = [];
  
  if (apiKey1) {
    aiInstances.push(new GoogleGenAI({ 
      apiKey: apiKey1, 
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } 
    }));
  }
  if (apiKey2) {
    aiInstances.push(new GoogleGenAI({ 
      apiKey: apiKey2, 
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } 
    }));
  }

  // In-memory student doubts database with realistic classroom doubts & safety flags
  interface StudentDoubt {
    id: string;
    studentName: string;
    studentEmail?: string;
    studentGrade: string;
    doubt: string;
    topic?: string;
    category?: 'coding' | 'hardware' | 'logic' | 'general' | 'non_academic';
    timestamp: string;
    createdAt: number;
    aiResponse?: string;
    isResolved: boolean;
    teacherNotes?: string;
    isFlagged?: boolean;
    flagType?: 'non_academic' | 'inappropriate' | 'off_topic';
    flagReason?: string;
    tokensUsed?: number;
    tokensSaved?: number;
  }

  let studentDoubts: StudentDoubt[] = [
    {
      id: 'doubt-flagged-1',
      studentName: 'Vikram Singh',
      studentEmail: 'vikram.s@school.edu',
      studentGrade: 'Class 6B',
      doubt: 'How to get unlimited free diamonds and aimbot hack in Free Fire game?',
      topic: 'Non-Academic Violation: Video Games',
      category: 'non_academic',
      timestamp: '11:05 AM (Today)',
      createdAt: Date.now() - 1000 * 60 * 15,
      aiResponse: '⚠️ Non-Academic Query Notice: Shiksha Sathi is an educational and classroom learning copilot. Questions about video games and cheats are not permitted. This incident has been automatically reported to your teacher.',
      isResolved: false,
      isFlagged: true,
      flagType: 'non_academic',
      flagReason: 'Gaming & Non-Curriculum Video Games',
      teacherNotes: 'Flagged during computer lab period. Discussed responsible classroom AI usage.'
    },
    {
      id: 'doubt-1',
      studentName: 'Rahul Sharma',
      studentEmail: 'rahul.s@school.edu',
      studentGrade: 'Class 6A',
      doubt: 'Why is my Scratch sprite moving backwards when I press the right arrow key?',
      topic: 'Scratch Motion Coordinates',
      category: 'coding',
      timestamp: '10:15 AM (Today)',
      createdAt: Date.now() - 1000 * 60 * 45,
      aiResponse: 'In Scratch, moving right requires changing X by a positive number like +10. If the block says "change x by -10", the cat will walk backwards towards the left instead.',
      isResolved: false,
      isFlagged: false,
      teacherNotes: 'Reminded Rahul about the Cartesian coordinate X-axis line in class.'
    },
    {
      id: 'doubt-2',
      studentName: 'Diya Sen',
      studentEmail: 'diya.sen@school.edu',
      studentGrade: 'Class 6A',
      doubt: 'My LED on pin 13 won\'t blink even though pinMode is OUTPUT. Could the LED be backwards?',
      topic: 'Arduino Breadboard Circuits',
      category: 'hardware',
      timestamp: '10:28 AM (Today)',
      createdAt: Date.now() - 1000 * 60 * 30,
      aiResponse: 'Yes! LEDs have polarity. The longer leg (Anode +) must connect to Pin 13, and the shorter leg (Cathode - flat edge) must connect to GND through a resistor.',
      isResolved: false,
      isFlagged: false
    },
    {
      id: 'doubt-3',
      studentName: 'Kabir Patel',
      studentEmail: 'kabir.p@school.edu',
      studentGrade: 'Class 5B',
      doubt: 'What is the difference between a repeat 10 loop and a forever loop?',
      topic: 'Control Flow & Loops',
      category: 'logic',
      timestamp: '09:40 AM (Today)',
      createdAt: Date.now() - 1000 * 60 * 80,
      aiResponse: 'Think of "repeat 10" like clapping your hands 10 times and then stopping. "Forever" is like the ticking of a clock that never stops until the power turns off.',
      isResolved: true,
      isFlagged: false,
      teacherNotes: 'Resolved during morning lab.'
    },
    {
      id: 'doubt-4',
      studentName: 'Ananya Rao',
      studentEmail: 'ananya.r@school.edu',
      studentGrade: 'Class 6A',
      doubt: 'Can the Ultrasonic Sensor detect a soft velvet curtain or only hard wooden obstacles?',
      topic: 'Sensors & Sonar Physics',
      category: 'hardware',
      timestamp: 'Yesterday',
      createdAt: Date.now() - 1000 * 60 * 60 * 20,
      aiResponse: 'Ultrasonic sensors bounce sound waves (echoes). Soft materials like velvet, sponge, or cotton absorb sound waves instead of reflecting them, causing inaccurate distance measurements.',
      isResolved: true,
      isFlagged: false,
      teacherNotes: 'Demonstrated in class with sponge vs book.'
    }
  ];

  // ==========================================
  // STUDENT LEADERBOARD & QUIZ DATA STORE
  // ==========================================

  interface StudentLeaderboardEntry {
    id: string;
    name: string;
    email: string;
    grade: string;
    points: number;
    weeklyPoints: number;
    quizzesTaken: number;
    correctAnswers: number;
    totalQuestionsAnswered: number;
    accuracy: number;
    streak: number;
    badges: string[];
    lastActive: string;
    recentQuizzes: {
      quizTitle: string;
      score: number;
      totalPossible: number;
      accuracy: number;
      timestamp: string;
    }[];
  }

  interface QuizQuestion {
    id: string;
    question: { en: string; hi: string; te: string };
    codeSnippet?: string;
    options: { en: string[]; hi: string[]; te: string[] };
    correctIndex: number;
    explanation: { en: string; hi: string; te: string };
    points: number;
    timeLimitSec: number;
  }

  interface ActiveQuizSession {
    id: string;
    pin: string;
    title: string;
    topic: string;
    grade: string;
    teacherName: string;
    status: 'lobby' | 'in_progress' | 'completed';
    currentQuestionIndex: number;
    createdAt: number;
    startedAt?: number;
    endedAt?: number;
    questions: QuizQuestion[];
    participants: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      studentGrade: string;
      joinedAt: number;
      score: number;
      correctCount: number;
      answersSubmitted: number;
      hasSubmitted: boolean;
      submittedAnswers?: {
        questionIndex: number;
        selectedOption: number;
        isCorrect: boolean;
        timeSpentSec: number;
        pointsEarned: number;
      }[];
    }[];
  }

  // Pre-seeded Student Leaderboard
  let studentLeaderboard: StudentLeaderboardEntry[] = [
    {
      id: 'student-1',
      name: 'Priya Sharma',
      email: 'priya.s@school.edu',
      grade: 'Class 6A',
      points: 2450,
      weeklyPoints: 680,
      quizzesTaken: 9,
      correctAnswers: 38,
      totalQuestionsAnswered: 42,
      accuracy: 90,
      streak: 7,
      badges: ['🏆 Grandmaster', '⚡ Speed Coder', '🤖 Circuit Master', '🎯 Logic Ninja'],
      lastActive: '10 mins ago',
      recentQuizzes: [
        { quizTitle: 'Scratch Logic & Control Flow', score: 480, totalPossible: 500, accuracy: 96, timestamp: 'Today' },
        { quizTitle: 'Ultrasonic Sonar Calibration', score: 380, totalPossible: 400, accuracy: 95, timestamp: 'Yesterday' }
      ]
    },
    {
      id: 'student-2',
      name: 'Aarav Patel',
      email: 'aarav.p@school.edu',
      grade: 'Class 6B',
      points: 2180,
      weeklyPoints: 540,
      quizzesTaken: 8,
      correctAnswers: 32,
      totalQuestionsAnswered: 38,
      accuracy: 84,
      streak: 5,
      badges: ['⚡ Speed Coder', '💡 Sensor Whiz', '🔥 5-Day Streak'],
      lastActive: '25 mins ago',
      recentQuizzes: [
        { quizTitle: 'Arduino GPIO & LEDs', score: 420, totalPossible: 500, accuracy: 84, timestamp: 'Today' }
      ]
    },
    {
      id: 'student-3',
      name: 'Rahul S. (You)',
      email: 'rahul.class6@school.edu',
      grade: 'Class 6B',
      points: 1850,
      weeklyPoints: 490,
      quizzesTaken: 7,
      correctAnswers: 26,
      totalQuestionsAnswered: 32,
      accuracy: 81,
      streak: 4,
      badges: ['🎯 Logic Ninja', '🤖 Circuit Master', '✨ Rising Star'],
      lastActive: 'Just now',
      recentQuizzes: [
        { quizTitle: 'Scratch Loops Challenge', score: 390, totalPossible: 450, accuracy: 87, timestamp: 'Today' }
      ]
    },
    {
      id: 'student-4',
      name: 'Ananya Rao',
      email: 'ananya.r@school.edu',
      grade: 'Class 6A',
      points: 1620,
      weeklyPoints: 380,
      quizzesTaken: 6,
      correctAnswers: 23,
      totalQuestionsAnswered: 28,
      accuracy: 82,
      streak: 3,
      badges: ['💡 Sensor Whiz', '🛠️ Hardware Hacker'],
      lastActive: '1 hour ago',
      recentQuizzes: [
        { quizTitle: 'Robotics Sensors & Sonar', score: 350, totalPossible: 400, accuracy: 88, timestamp: 'Yesterday' }
      ]
    },
    {
      id: 'student-5',
      name: 'Kabir Patel',
      email: 'kabir.p@school.edu',
      grade: 'Class 5B',
      points: 1420,
      weeklyPoints: 310,
      quizzesTaken: 5,
      correctAnswers: 18,
      totalQuestionsAnswered: 24,
      accuracy: 75,
      streak: 2,
      badges: ['🐱 Scratch Champion', '🚀 Fast Learner'],
      lastActive: '3 hours ago',
      recentQuizzes: [
        { quizTitle: 'Scratch Basics for Class 5', score: 310, totalPossible: 400, accuracy: 78, timestamp: 'Yesterday' }
      ]
    },
    {
      id: 'student-6',
      name: 'Diya Sen',
      email: 'diya.sen@school.edu',
      grade: 'Class 6A',
      points: 1350,
      weeklyPoints: 290,
      quizzesTaken: 5,
      correctAnswers: 17,
      totalQuestionsAnswered: 23,
      accuracy: 74,
      streak: 3,
      badges: ['💡 Breadboard Pioneer'],
      lastActive: '4 hours ago',
      recentQuizzes: [
        { quizTitle: 'Arduino GPIO & LEDs', score: 290, totalPossible: 400, accuracy: 72, timestamp: '2 days ago' }
      ]
    },
    {
      id: 'student-7',
      name: 'Rohan Verma',
      email: 'rohan.v@school.edu',
      grade: 'Class 6A',
      points: 1180,
      weeklyPoints: 240,
      quizzesTaken: 4,
      correctAnswers: 14,
      totalQuestionsAnswered: 20,
      accuracy: 70,
      streak: 1,
      badges: ['🎮 Game Maker'],
      lastActive: 'Yesterday',
      recentQuizzes: [
        { quizTitle: 'Scratch Coordinates', score: 240, totalPossible: 350, accuracy: 68, timestamp: '2 days ago' }
      ]
    },
    {
      id: 'student-8',
      name: 'Sneha Gupta',
      email: 'sneha.g@school.edu',
      grade: 'Class 7A',
      points: 1940,
      weeklyPoints: 470,
      quizzesTaken: 7,
      correctAnswers: 28,
      totalQuestionsAnswered: 33,
      accuracy: 85,
      streak: 4,
      badges: ['🐍 Python Pro', '🎯 Logic Ninja'],
      lastActive: '2 hours ago',
      recentQuizzes: [
        { quizTitle: 'Python Control Flow', score: 450, totalPossible: 500, accuracy: 90, timestamp: 'Today' }
      ]
    }
  ];

  // Preset Curated STEM Quizzes
  const defaultStemQuizzes: { [id: string]: { title: string; topic: string; grade: string; questions: QuizQuestion[] } } = {
    'scratch-logic': {
      title: 'Scratch Logic & Loop Sprint',
      topic: 'Scratch 3.0 & Control Flow',
      grade: 'Class 5-7',
      questions: [
        {
          id: 'q1',
          question: {
            en: 'What happens when a sprite runs a "repeat until <touching edge?>" loop?',
            hi: 'जब कोई स्प्राइट "repeat until <touching edge?>" लूप चलाता है तो क्या होता है?',
            te: 'స్ప్రైట్ "repeat until <touching edge?>" లూప్ అమలు చేసినప్పుడు ఏమి జరుగుతుంది?'
          },
          codeSnippet: 'repeat until <touching [edge v]?>\n  move (10) steps\n  next costume\nend',
          options: {
            en: ['It moves 10 steps once and stops', 'It keeps moving until it hits the stage boundary', 'It immediately deletes the sprite', 'It moves backwards'],
            hi: ['यह एक बार 10 कदम चलकर रुक जाता है', 'यह तब तक चलता रहता है जब तक यह किनारे से न टकराए', 'यह स्प्राइट को तुरंत हटा देता है', 'यह पीछे की ओर चलता है'],
            te: ['ఇది ఒకసారి 10 అడుగులు కదిలి ఆగిపోతుంది', 'ఇది అంచుని తాకేవరకు కదులుతూనే ఉంటుంది', 'ఇది వెంటనే స్ప్రైట్‌ను తొలగిస్తుంది', 'ఇది వెనుకకు కదులుతుంది']
          },
          correctIndex: 1,
          explanation: {
            en: 'A "repeat until" loop continuously evaluates its boolean condition and executes blocks inside until the condition turns TRUE.',
            hi: '"repeat until" लूप अपनी शर्त की जांच करता है और जब तक शर्त सच नहीं हो जाती, तब तक ब्लॉक चलाता रहता है।',
            te: '"repeat until" లూప్ షరతు నిజమయ్యే వరకు లోపలి బ్లాక్‌లను అమలు చేస్తూనే ఉంటుంది.'
          },
          points: 100,
          timeLimitSec: 30
        },
        {
          id: 'q2',
          question: {
            en: 'To make a sprite jump upward smoothly and fall back down, which coordinates should change?',
            hi: 'स्प्राइट को सुचारू रूप से ऊपर कूदने और नीचे गिरने के लिए किस निर्देशांक (coordinate) को बदलना चाहिए?',
            te: 'స్ప్రైట్ సజావుగా పైకి ఎగిరి కిందకు పడటానికి ఏ కోఆర్డినేట్‌ను మార్చాలి?'
          },
          options: {
            en: ['Change X by positive, then change X by negative', 'Change Y by positive, then change Y by negative', 'Change Direction by 90 degrees', 'Change Volume by 10%'],
            hi: ['X को धनात्मक फिर X को ऋणात्मक बदलें', 'Y को धनात्मक (+10) फिर Y को ऋणात्मक (-10) बदलें', 'दिशा को 90 डिग्री घुमाएं', 'आवाज़ 10% बढ़ाएं'],
            te: ['X ని పాజిటివ్ తర్వాత నెగటివ్ మార్చాలి', 'Y ని పాజిటివ్ (+10) తర్వాత నెగటివ్ (-10) మార్చాలి', 'దిశను 90 డిగ్రీలు మార్చాలి', 'వాల్యూమ్ మార్చాలి']
          },
          correctIndex: 1,
          explanation: {
            en: 'In Scratch, the Y-axis controls vertical position (+Y goes UP, -Y falls DOWN). The X-axis controls horizontal left/right movement.',
            hi: 'स्क्रैच में Y-अक्ष ऊर्ध्वाधर गति को नियंत्रित करता है (+Y ऊपर, -Y नीचे)।',
            te: 'స్క్రాచ్‌లో Y-యాక్సిస్ నిలువు కదలికను నియంత్రిస్తుంది (+Y పైకి, -Y కిందికి).'
          },
          points: 100,
          timeLimitSec: 30
        },
        {
          id: 'q3',
          question: {
            en: 'Which block should you use to share a signal between multiple sprites at the same time?',
            hi: 'एक ही समय में कई स्प्राइट्स के बीच संदेश या संकेत साझा करने के लिए किस ब्लॉक का उपयोग करना चाहिए?',
            te: 'ఒకే సమయంలో బహుళ స్ప్రైట్‌ల మధ్య సంకేతాన్ని పంపడానికి ఏ బ్లాక్‌ను ఉపయోగించాలి?'
          },
          options: {
            en: ['broadcast (message1)', 'glide (1) secs to random position', 'say (Hello!) for 2 secs', 'pick random (1) to (10)'],
            hi: ['broadcast (message1)', 'glide (1) secs to random position', 'say (Hello!) for 2 secs', 'pick random (1) to (10)'],
            te: ['broadcast (message1)', 'glide (1) secs to random position', 'say (Hello!) for 2 secs', 'pick random (1) to (10)']
          },
          correctIndex: 0,
          explanation: {
            en: '"broadcast" sends an event message across all sprites and backgrounds so they can trigger "when I receive" scripts in parallel.',
            hi: '"broadcast" ब्लॉक सभी स्प्राइट्स को एक साथ संदेश भेजता है ताकि वे संबंधित क्रियाएं शुरू कर सकें।',
            te: '"broadcast" బ్లాక్ అన్ని స్ప్రైట్‌లకు సందేశాన్ని ప్రసారం చేస్తుంది.'
          },
          points: 100,
          timeLimitSec: 25
        },
        {
          id: 'q4',
          question: {
            en: 'What is the purpose of a Variable in coding?',
            hi: 'कोडिंग में एक वेरिएबल (Variable) का क्या उद्देश्य होता है?',
            te: 'కోడింగ్‌లో వేరియబుల్ (Variable) ప్రయోజనం ఏమిటి?'
          },
          options: {
            en: ['To change the color of the computer screen', 'To store and remember data values like score, timer, or health', 'To restart the computer', 'To connect Wi-Fi'],
            hi: ['कंप्यूटर स्क्रीन का रंग बदलना', 'स्कोर, टाइमर या जीवन जैसे डेटा को सहेजना और याद रखना', 'कंप्यूटर को रीस्टार्ट करना', 'वाई-फाई कनेक्ट करना'],
            te: ['స్క్రీన్ రంగును మార్చడం', 'స్కోర్, టైమర్ లేదా డేటా విలువలను నిల్వ చేయడం మరియు గుర్తుంచుకోవడం', 'కంప్యూటర్‌ను రీస్టార్ట్ చేయడం', 'వై-ఫై కనెక్ట్ చేయడం']
          },
          correctIndex: 1,
          explanation: {
            en: 'A variable is like a named storage box in memory that holds values that can change as the program runs.',
            hi: 'वेरिएबल मेमोरी में एक लेबल वाले डिब्बे की तरह होता है जो स्कोर या समय जैसी बदलती जानकारी रखता है।',
            te: 'వేరియబుల్ అనేది ప్రోగ్రామ్ నడుస్తున్నప్పుడు మారే విలువలైన స్కోర్ లేదా టైమర్‌ను నిల్వ చేసే మెమరీ బాక్స్.'
          },
          points: 100,
          timeLimitSec: 25
        }
      ]
    },
    'robotics-circuits': {
      title: 'Robotics, Sensors & Arduino Circuits',
      topic: 'Arduino GPIO & Sensor Physics',
      grade: 'Class 6-8',
      questions: [
        {
          id: 'rq1',
          question: {
            en: 'Why do we connect a 220Ω resistor in series with an LED connected to an Arduino digital pin?',
            hi: 'हम आरडूिनो डिजिटल पिन से जुड़े एलईडी के साथ श्रेणी (series) में 220Ω का प्रतिरोधक (resistor) क्यों जोड़ते हैं?',
            te: 'ఆర్డుఇనో డిజిటల్ పిన్‌కు కనెక్ట్ చేసిన LEDతో సిరీస్‌లో 220Ω రెసిస్టర్‌ను ఎందుకు కనెక్ట్ చేస్తాము?'
          },
          options: {
            en: ['To make the LED glow in different colors', 'To limit electric current and prevent the LED from burning out', 'To increase battery voltage', 'To act as a radio antenna'],
            hi: ['एलईडी को अलग-अलग रंगों में चमकाने के लिए', 'विद्युत प्रवाह को सीमित करने और एलईडी को जलने से बचाने के लिए', 'बैटरी वोल्टेज बढ़ाने के लिए', 'रेडियो एंटीना के रूप में काम करने के लिए'],
            te: ['LED రంగులను మార్చడానికి', 'విద్యుత్ ప్రవాహాన్ని పరిమితం చేసి LED కాలిపోకుండా కాపాడటానికి', 'వోల్టేజ్ పెంచడానికి', 'యాంటెన్నాగా పనిచేయడానికి']
          },
          correctIndex: 1,
          explanation: {
            en: 'Ohm\'s Law (V = IR): Without a current-limiting resistor, excessive current flows through the LED diode junction, causing it to overheat and fail.',
            hi: 'करंट लिमिटिंग रेसिस्टर एलईडी में अत्यधिक विद्युत प्रवाह को रोककर उसे सुरक्षित रखता है।',
            te: 'రెసిస్టర్ అధిక కరెంట్ ప్రవాహాన్ని అడ్డుకుని LED పాడవకుండా కాపాడుతుంది.'
          },
          points: 100,
          timeLimitSec: 30
        },
        {
          id: 'rq2',
          question: {
            en: 'How does an Ultrasonic Sensor (HC-SR04) measure distance to an obstacle?',
            hi: 'अल्ट्रासोनिक सेंसर (HC-SR04) किसी वस्तु की दूरी को कैसे मापता है?',
            te: 'అల్ట్రాసోనిక్ సెన్సార్ (HC-SR04) అడ్డంకికి ఉన్న దూరాన్ని ఎలా కొలుస్తుంది?'
          },
          options: {
            en: ['By measuring temperature of the air', 'By sending high-frequency sound waves and measuring the echo return time', 'By capturing digital photographs', 'By using magnetic gravity'],
            hi: ['हवा के तापमान को मापकर', 'उच्च-आवृत्ति ध्वनि तरंगें भेजकर और उनके वापस आने (इको) के समय को मापकर', 'डिजिटल फोटो खींचकर', 'चुंबकीय गुरुत्वाकर्षण का उपयोग करके'],
            te: ['గాలి ఉష్ణోగ్రతను కొలవడం ద్వారా', 'ధ్వని తరంగాలను పంపి, అవి తిరిగి వచ్చే ప్రతిధ్వని సమయాన్ని కొలవడం ద్వారా', 'ఫోటోలు తీయడం ద్వారా', 'గురుత్వాకర్షణ ద్వారా']
          },
          correctIndex: 1,
          explanation: {
            en: 'Speed of Sound = ~340 m/s. Distance = (Echo Time × Speed of Sound) / 2.',
            hi: 'दूरी = (इको समय × ध्वनि की गति) / 2 सूत्र द्वारा सेंसर दूरी की गणना करता है।',
            te: 'దూరం = (ప్రతిధ్వని సమయం × ధ్వని వేగం) / 2 సూత్రం ద్వారా లెక్కిస్తుంది.'
          },
          points: 100,
          timeLimitSec: 30
        },
        {
          id: 'rq3',
          question: {
            en: 'In an Arduino C++ sketch, where should pinMode(13, OUTPUT) be placed so it runs only once at startup?',
            hi: 'आरडूिनो सी++ कोड में, pinMode(13, OUTPUT) को कहाँ रखा जाना चाहिए ताकि यह स्टार्टअप पर केवल एक बार चले?',
            te: 'ఆర్డుఇనో కోడ్‌లో, ప్రారంభంలో ఒకేసారి అమలు కావడానికి pinMode(13, OUTPUT) ను ఎక్కడ ఉంచాలి?'
          },
          options: {
            en: ['Inside void loop()', 'Inside void setup()', 'Inside digitalRead()', 'At the very end after delay()'],
            hi: ['void loop() के अंदर', 'void setup() के अंदर', 'digitalRead() के अंदर', 'delay() के बाद सबसे अंत में'],
            te: ['void loop() లోపల', 'void setup() లోపల', 'digitalRead() లోపల', 'చివరలో']
          },
          correctIndex: 1,
          explanation: {
            en: 'void setup() runs exactly once when the Arduino board is powered on or reset. void loop() repeats continuously.',
            hi: 'void setup() बोर्ड चालू होने पर केवल एक बार चलता है और पिन कॉन्फ़िगरेशन के लिए आदर्श है।',
            te: 'void setup() బోర్డు ఆన్ అయినప్పుడు ఒకేసారి మాత్రమే నడుస్తుంది.'
          },
          points: 100,
          timeLimitSec: 25
        }
      ]
    }
  };

  // Currently Active Live Quiz Session in Room
  let activeQuizSession: ActiveQuizSession | null = null;

  // Doubts API: GET all doubts
  app.get('/api/doubts', (req, res) => {
    const sorted = [...studentDoubts].sort((a, b) => b.createdAt - a.createdAt);
    const flaggedCount = studentDoubts.filter(d => d.isFlagged && !d.isResolved).length;
    res.json({ doubts: sorted, totalCount: sorted.length, flaggedCount });
  });

  // Doubts API: POST a new doubt when student asks
  app.post('/api/doubts', (req, res) => {
    const { studentName, studentEmail, studentGrade, doubt, topic, category, aiResponse, isFlagged, flagType, flagReason } = req.body;
    if (!doubt || !doubt.trim()) {
      return res.status(400).json({ error: 'Doubt text is required' });
    }

    const compliance = evaluateAcademicCompliance(doubt);
    const shouldFlag = isFlagged || !compliance.isAcademic;
    const finalCategory = (category || (shouldFlag ? 'non_academic' : compliance.category)) as any;
    const finalReason = flagReason || (!compliance.isAcademic ? compliance.reason : undefined);

    const newDoubt: StudentDoubt = {
      id: `doubt-${Date.now()}`,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || 'student@school.edu',
      studentGrade: studentGrade || 'Class 6',
      doubt: doubt.trim(),
      topic: topic || (shouldFlag ? `Flagged: ${compliance.detectedTopic || 'Non-Academic'}` : 'General Doubt'),
      category: finalCategory,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Just now)',
      createdAt: Date.now(),
      aiResponse: aiResponse || '',
      isResolved: false,
      isFlagged: shouldFlag,
      flagType: shouldFlag ? (flagType || 'non_academic') : undefined,
      flagReason: finalReason,
      tokensUsed: Math.ceil(doubt.length / 4) + 85,
      tokensSaved: 420
    };

    studentDoubts.unshift(newDoubt);
    console.log(`[Doubts API] Recorded new doubt (Flagged=${shouldFlag}) from student "${newDoubt.studentName}": ${newDoubt.doubt.slice(0, 50)}...`);
    res.status(201).json({ success: true, doubt: newDoubt });
  });

  // Doubts API: PATCH update doubt (resolve / add teacher remarks / unflag)
  app.patch('/api/doubts/:id', (req, res) => {
    const { id } = req.params;
    const { isResolved, teacherNotes, topic, category, isFlagged } = req.body;
    
    const index = studentDoubts.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    if (typeof isResolved === 'boolean') {
      studentDoubts[index].isResolved = isResolved;
    }
    if (typeof isFlagged === 'boolean') {
      studentDoubts[index].isFlagged = isFlagged;
    }
    if (typeof teacherNotes === 'string') {
      studentDoubts[index].teacherNotes = teacherNotes;
    }
    if (typeof topic === 'string') {
      studentDoubts[index].topic = topic;
    }
    if (category) {
      studentDoubts[index].category = category;
    }

    res.json({ success: true, doubt: studentDoubts[index] });
  });

  // Doubts API: DELETE a doubt
  app.delete('/api/doubts/:id', (req, res) => {
    const { id } = req.params;
    studentDoubts = studentDoubts.filter(d => d.id !== id);
    res.json({ success: true, message: 'Doubt deleted' });
  });

  // ==========================================
  // LEADERBOARD & QUIZ API ENDPOINTS
  // ==========================================

  // Leaderboard API: GET all ranked students
  app.get('/api/leaderboard', (req, res) => {
    const { grade, timeFrame } = req.query;
    let list = [...studentLeaderboard];

    if (grade && grade !== 'all') {
      list = list.filter(s => s.grade.toLowerCase().includes((grade as string).toLowerCase()));
    }

    if (timeFrame === 'weekly') {
      list.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    } else {
      list.sort((a, b) => b.points - a.points);
    }

    const totalStudents = studentLeaderboard.length;
    const totalQuizzesConducted = studentLeaderboard.reduce((acc, s) => acc + s.quizzesTaken, 0);
    const avgAccuracy = Math.round(studentLeaderboard.reduce((acc, s) => acc + s.accuracy, 0) / (totalStudents || 1));

    res.json({
      leaderboard: list,
      stats: {
        totalStudents,
        totalQuizzesConducted,
        avgAccuracy,
        topScorer: studentLeaderboard[0]?.name || 'N/A',
        topScore: studentLeaderboard[0]?.points || 0
      }
    });
  });

  // Leaderboard API: POST teacher bonus merit points
  app.post('/api/leaderboard/award', (req, res) => {
    const { studentId, studentEmail, points, reason } = req.body;
    const pts = parseInt(points, 10) || 50;

    let student = studentLeaderboard.find(s => s.id === studentId || s.email === studentEmail);
    if (!student) {
      return res.status(404).json({ error: 'Student not found on leaderboard' });
    }

    student.points += pts;
    student.weeklyPoints += pts;
    student.lastActive = 'Just now';
    if (pts >= 50 && !student.badges.includes('⭐ Teacher\'s Star')) {
      student.badges.push('⭐ Teacher\'s Star');
    }

    console.log(`[Leaderboard API] Awarded ${pts} XP to ${student.name} for: ${reason || 'Merit bonus'}`);
    res.json({ success: true, student, message: `Awarded ${pts} XP to ${student.name}` });
  });

  // Leaderboard API: POST reset weekly points
  app.post('/api/leaderboard/reset-weekly', (req, res) => {
    studentLeaderboard.forEach(s => {
      s.weeklyPoints = 0;
    });
    res.json({ success: true, message: 'Weekly leaderboard points have been reset' });
  });

  // Quiz API: GET presets
  app.get('/api/quiz/presets', (req, res) => {
    res.json({ presets: defaultStemQuizzes });
  });

  // Quiz API: GET active session
  app.get('/api/quiz/active', (req, res) => {
    if (!activeQuizSession) {
      return res.json({ active: false, session: null });
    }
    res.json({ active: true, session: activeQuizSession });
  });

  // Quiz API: POST create & start live quiz room
  app.post('/api/quiz/create', (req, res) => {
    const { presetKey, title, topic, grade, teacherName, customQuestions } = req.body;
    
    // Generate clean 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    let questions: QuizQuestion[] = [];
    if (customQuestions && Array.isArray(customQuestions) && customQuestions.length > 0) {
      questions = customQuestions;
    } else if (presetKey && defaultStemQuizzes[presetKey]) {
      questions = defaultStemQuizzes[presetKey].questions;
    } else {
      questions = defaultStemQuizzes['scratch-logic'].questions;
    }

    const quizTitle = title || (presetKey && defaultStemQuizzes[presetKey]?.title) || 'Live STEM Lab Challenge';
    const quizTopic = topic || (presetKey && defaultStemQuizzes[presetKey]?.topic) || 'STEM Curriculum';
    const quizGrade = grade || (presetKey && defaultStemQuizzes[presetKey]?.grade) || 'Class 6';

    activeQuizSession = {
      id: `quiz-sess-${Date.now()}`,
      pin,
      title: quizTitle,
      topic: quizTopic,
      grade: quizGrade,
      teacherName: teacherName || 'Teacher',
      status: 'lobby',
      currentQuestionIndex: 0,
      createdAt: Date.now(),
      questions,
      participants: []
    };

    console.log(`[Quiz API] Created Live Room PIN: ${pin} for "${quizTitle}" by ${activeQuizSession.teacherName}`);
    res.status(201).json({ success: true, session: activeQuizSession, pin });
  });

  // Quiz API: POST student join room
  app.post('/api/quiz/join', (req, res) => {
    const { pin, studentName, studentEmail, studentGrade } = req.body;

    if (!activeQuizSession) {
      return res.status(404).json({ error: 'No active quiz session found. Please ask your teacher to host one.' });
    }

    if (activeQuizSession.pin !== pin?.toString().trim()) {
      return res.status(400).json({ error: 'Invalid 6-digit Room PIN code.' });
    }

    const email = studentEmail || 'student@school.edu';
    const name = studentName || 'Student';
    const grade = studentGrade || activeQuizSession.grade || 'Class 6';

    const existingIdx = activeQuizSession.participants.findIndex(p => p.studentEmail === email || p.studentName === name);
    if (existingIdx === -1) {
      activeQuizSession.participants.push({
        studentId: `std-${Date.now()}-${Math.floor(Math.random()*100)}`,
        studentName: name,
        studentEmail: email,
        studentGrade: grade,
        joinedAt: Date.now(),
        score: 0,
        correctCount: 0,
        answersSubmitted: 0,
        hasSubmitted: false,
        submittedAnswers: []
      });
    }

    console.log(`[Quiz API] Student "${name}" joined Live Room PIN: ${pin}. Total in lobby: ${activeQuizSession.participants.length}`);
    res.json({ success: true, session: activeQuizSession });
  });

  // Quiz API: POST update quiz status (Teacher host control)
  app.post('/api/quiz/status', (req, res) => {
    const { status, currentQuestionIndex } = req.body;

    if (!activeQuizSession) {
      return res.status(404).json({ error: 'No active quiz session to update' });
    }

    if (status) {
      activeQuizSession.status = status;
      if (status === 'in_progress' && !activeQuizSession.startedAt) {
        activeQuizSession.startedAt = Date.now();
      }
      if (status === 'completed') {
        activeQuizSession.endedAt = Date.now();
      }
    }

    if (typeof currentQuestionIndex === 'number') {
      activeQuizSession.currentQuestionIndex = currentQuestionIndex;
    }

    console.log(`[Quiz API] Quiz status updated to "${activeQuizSession.status}", Question Index: ${activeQuizSession.currentQuestionIndex}`);
    res.json({ success: true, session: activeQuizSession });
  });

  // Quiz API: POST submit student quiz answers & update Leaderboard
  app.post('/api/quiz/submit', (req, res) => {
    const { studentName, studentEmail, studentGrade, answers, quizTitle, timeSpentSec } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    // Determine questions source from active session or fallback presets
    let questionsPool = activeQuizSession?.questions || defaultStemQuizzes['scratch-logic'].questions;
    
    let totalScore = 0;
    let correctCount = 0;
    const evaluatedAnswers: any[] = [];

    answers.forEach((ans: { questionIndex: number; selectedOption: number; timeTakenSec?: number }) => {
      const q = questionsPool[ans.questionIndex];
      if (q) {
        const isCorrect = ans.selectedOption === q.correctIndex;
        let pointsEarned = 0;
        if (isCorrect) {
          correctCount++;
          // Base 100 points + up to 30 speed bonus
          const speedBonus = Math.max(0, Math.round(30 - (ans.timeTakenSec || 15)));
          pointsEarned = (q.points || 100) + speedBonus;
          totalScore += pointsEarned;
        }
        evaluatedAnswers.push({
          questionIndex: ans.questionIndex,
          selectedOption: ans.selectedOption,
          isCorrect,
          timeSpentSec: ans.timeTakenSec || 10,
          pointsEarned
        });
      }
    });

    const totalPossible = questionsPool.length * 100;
    const accuracy = questionsPool.length > 0 ? Math.round((correctCount / questionsPool.length) * 100) : 0;
    const email = studentEmail || 'rahul.class6@school.edu';
    const name = studentName || 'Rahul S. (You)';
    const grade = studentGrade || 'Class 6B';

    // Update or Insert into Student Leaderboard
    let studentEntry = studentLeaderboard.find(s => s.email.toLowerCase() === email.toLowerCase() || s.name.toLowerCase() === name.toLowerCase());
    
    if (studentEntry) {
      studentEntry.points += totalScore;
      studentEntry.weeklyPoints += totalScore;
      studentEntry.quizzesTaken += 1;
      studentEntry.correctAnswers += correctCount;
      studentEntry.totalQuestionsAnswered += questionsPool.length;
      studentEntry.accuracy = Math.round((studentEntry.correctAnswers / (studentEntry.totalQuestionsAnswered || 1)) * 100);
      studentEntry.streak += 1;
      studentEntry.lastActive = 'Just now';

      // Check for award badges
      if (accuracy === 100 && !studentEntry.badges.includes('🎯 Perfectionist')) {
        studentEntry.badges.push('🎯 Perfectionist');
      }
      if (totalScore >= 350 && !studentEntry.badges.includes('⚡ Speed Coder')) {
        studentEntry.badges.push('⚡ Speed Coder');
      }
      if (studentEntry.quizzesTaken >= 5 && !studentEntry.badges.includes('🔥 Consistent Learner')) {
        studentEntry.badges.push('🔥 Consistent Learner');
      }

      studentEntry.recentQuizzes.unshift({
        quizTitle: quizTitle || activeQuizSession?.title || 'STEM Quiz',
        score: totalScore,
        totalPossible,
        accuracy,
        timestamp: 'Just now'
      });
      if (studentEntry.recentQuizzes.length > 5) {
        studentEntry.recentQuizzes.pop();
      }
    } else {
      studentEntry = {
        id: `student-${Date.now()}`,
        name,
        email,
        grade,
        points: totalScore,
        weeklyPoints: totalScore,
        quizzesTaken: 1,
        correctAnswers: correctCount,
        totalQuestionsAnswered: questionsPool.length,
        accuracy,
        streak: 1,
        badges: accuracy === 100 ? ['🎯 Perfectionist', '✨ Rising Star'] : ['✨ Rising Star'],
        lastActive: 'Just now',
        recentQuizzes: [
          {
            quizTitle: quizTitle || activeQuizSession?.title || 'STEM Quiz',
            score: totalScore,
            totalPossible,
            accuracy,
            timestamp: 'Just now'
          }
        ]
      };
      studentLeaderboard.push(studentEntry);
    }

    // Sort leaderboard by points
    studentLeaderboard.sort((a, b) => b.points - a.points);
    const newRank = studentLeaderboard.findIndex(s => s.email === email || s.name === name) + 1;

    // Update active session participant status if live quiz
    if (activeQuizSession) {
      const p = activeQuizSession.participants.find(part => part.studentEmail === email || part.studentName === name);
      if (p) {
        p.score = totalScore;
        p.correctCount = correctCount;
        p.answersSubmitted = answers.length;
        p.hasSubmitted = true;
        p.submittedAnswers = evaluatedAnswers;
      }
    }

    console.log(`[Quiz API] Test submitted for "${name}": Score ${totalScore} pts, Accuracy ${accuracy}%. New Leaderboard Rank: #${newRank}`);

    res.json({
      success: true,
      result: {
        score: totalScore,
        totalPossible,
        correctCount,
        totalQuestions: questionsPool.length,
        accuracy,
        newRank,
        totalPoints: studentEntry.points,
        streak: studentEntry.streak,
        badgesEarned: studentEntry.badges,
        evaluatedAnswers
      }
    });
  });

  // Quiz API: POST AI-generate a custom quiz using Sarvam AI / Gemini
  app.post('/api/quiz/generate-ai', async (req, res) => {
    try {
      const { topic, grade, questionCount = 4, language = 'en' } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'Quiz topic is required' });
      }

      const prompt = `Generate a ${questionCount}-question multiple choice quiz on the STEM topic "${topic}" for ${grade || 'Class 6'}.
Respond with a JSON object containing an array "questions" where each question has:
- "id": string
- "question": { "en": string, "hi": string, "te": string }
- "codeSnippet": optional code or circuit string if applicable
- "options": { "en": string[4], "hi": string[4], "te": string[4] }
- "correctIndex": number (0 to 3)
- "explanation": { "en": string, "hi": string, "te": string }
- "points": 100
- "timeLimitSec": 30

Return ONLY the JSON object.`;

      let generatedJson: any = null;

      // Try Sarvam AI first
      try {
        const sarvamRes = await generateContentWithSarvam({
          messages: [
            { role: 'system', content: 'You are an Indian STEM and Coding Curriculum Specialist creating interactive classroom quizzes.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          model: 'sarvam-105b',
          maxTokens: 1200
        });

        const textContent = typeof sarvamRes === 'string' ? sarvamRes : ((sarvamRes as any)?.text || '');
        if (textContent) {
          const cleanText = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          if (parsed && Array.isArray(parsed.questions)) {
            generatedJson = parsed;
          }
        }
      } catch (sarvamErr) {
        console.warn('[AI Quiz] Sarvam generation failed, falling back to Gemini:', sarvamErr);
      }

      // Gemini fallback if needed
      if (!generatedJson) {
        const geminiRes = await generateContentWithFallback({
          contents: prompt,
          systemInstruction: 'You are an Indian STEM and Coding Curriculum Specialist creating interactive classroom quizzes. Return strictly valid JSON.',
          temperature: 0.3,
          maxOutputTokens: 1200
        });

        if (geminiRes && geminiRes.text) {
          const cleanText = geminiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          if (parsed && Array.isArray(parsed.questions)) {
            generatedJson = parsed;
          }
        }
      }

      if (generatedJson && generatedJson.questions) {
        res.json({ success: true, quiz: generatedJson });
      } else {
        // Return default curated quiz fallback if AI formatting varied
        res.json({
          success: true,
          quiz: {
            title: `${topic} Quiz (${grade})`,
            topic,
            grade,
            questions: defaultStemQuizzes['scratch-logic'].questions
          }
        });
      }
    } catch (err: any) {
      console.error('[AI Quiz] Error generating quiz:', err);
      res.json({
        success: true,
        quiz: {
          title: `STEM Quiz`,
          topic: 'STEM',
          grade: 'Class 6',
          questions: defaultStemQuizzes['scratch-logic'].questions
        }
      });
    }
  });

  // Health check/API key status endpoint
  app.get('/api/status', (req, res) => {
    const flaggedPending = studentDoubts.filter(d => d.isFlagged && !d.isResolved).length;
    res.json({
      status: 'ok',
      primaryModel: 'sarvam-105b',
      hasApiKey: !!process.env.SARVAM_API_KEY || !!process.env.GEMINI_API_KEY,
      hasSarvamApiKey: !!process.env.SARVAM_API_KEY,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      totalDoubts: studentDoubts.length,
      flaggedPendingDoubts: flaggedPending
    });
  });

  // Chat Endpoint with Academic Guardrail
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, model, studentDetails, role } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const trimmedMessage = message.trim();
      const userRole = role === 'student' ? 'student' : (role === 'teacher' ? 'teacher' : (studentDetails?.role || 'teacher'));
      const isStudent = userRole === 'student';

      // --- FEATURE: ACADEMIC GUARDRAIL CHECK (Strictly for Students) ---
      // For student accounts, evaluate if the query is strictly educational / STEM curriculum
      if (isStudent) {
        const compliance = evaluateAcademicCompliance(trimmedMessage);

        if (!compliance.isAcademic) {
          console.warn(`[Academic Guardrail] Student non-academic query detected: "${trimmedMessage}" -> Reason: ${compliance.reason}`);

          // Construct refusal message matching detected language
          const isHindi = /[\u0900-\u097F]/.test(trimmedMessage);
          const isTelugu = /[\u0C00-\u0C7F]/.test(trimmedMessage);

          let refusalText = '';
          if (isHindi) {
            refusalText = `⚠️ **गैर-शैक्षणिक प्रश्न दर्ज — शिक्षक को सूचित किया गया**\n\nशिक्षा साथी छात्र मित्र केवल कोडिंग, रोबोटिक्स, विज्ञान और स्कूल के पाठ्यक्रम के लिए है। **"${compliance.reason}"** जैसे गैर-शैक्षणिक विषयों पर चर्चा की अनुमति नहीं है।\n\n📌 **सूचना:** आपकी यह शंका शिक्षक डैशबोर्ड पर समीक्षा के लिए दर्ज कर दी गई है। कृपया अपने कोडिंग प्रोजेक्ट या सर्किट से संबंधित प्रश्न पूछें!`;
          } else if (isTelugu) {
            refusalText = `⚠️ **విద్యాసంబంధం కాని ప్రశ్న నమోదు చేయబడింది — ఉపాధ్యాయునికి నివేదించబడింది**\n\nశిక్షా సాథి విద్యార్థి మిత్రుడు కేవలం కోడింగ్, రోబోటిక్స్ మరియు సైన్స్ నేర్చుకోవడానికి మాత్రమే. **"${compliance.reason}"** వంటి విద్యాసంబంధం కాని ప్రశ్నలు అనుమతించబడవు.\n\n📌 **గమనిక:** ఈ ప్రశ్న ఉపాధ్యాయుల సమీక్ష కోసం రిపోర్ట్ చేయబడింది. దయచేసి మీ కోడింగ్ ప్రాజెక్ట్ లేదా సర్క్యూట్‌కు సంబంధించిన ప్రశ్నలను అడగండి!`;
          } else {
            refusalText = `⚠️ **Non-Academic Query Notice — Reported to Teacher**\n\nShiksha Sathi Student Buddy is strictly for school coding, robotics, circuits, and STEM learning. Inquiries regarding **${compliance.reason}** are not permitted.\n\n📌 **Incident Logged:** This query has been recorded on your teacher's dashboard for review. Please ask about your Scratch sprites, Python code, Arduino pins, or logic questions!`;
          }

          // Automatically report non-academic incident to studentDoubts database
          const incidentDoubt: StudentDoubt = {
            id: `doubt-flagged-${Date.now()}`,
            studentName: studentDetails?.name || 'Student in Class',
            studentEmail: studentDetails?.email || 'student@school.edu',
            studentGrade: studentDetails?.grade || 'Class 6',
            doubt: trimmedMessage,
            topic: `⚠️ Flagged: ${compliance.detectedTopic || 'Non-Academic Query'}`,
            category: 'non_academic',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Just now)',
            createdAt: Date.now(),
            aiResponse: refusalText,
            isResolved: false,
            isFlagged: true,
            flagType: 'non_academic',
            flagReason: compliance.reason,
            teacherNotes: 'Auto-flagged student query during AI chat. Awaiting teacher review.'
          };

          studentDoubts.unshift(incidentDoubt);

          return res.json({
            text: refusalText,
            isFlagged: true,
            flagReason: compliance.reason,
            userRole: 'student'
          });
        }
      }

      // --- ROLE-SPECIFIC SYSTEM PROMPT CONFIGURATION ---
      let systemInstruction = '';

      if (isStudent) {
        // STUDENT AI CHAT PERSONA: Socratic, Encouraging, Step-by-Step, Relatable Analogies
        systemInstruction = `You are "Shiksha Sathi (Student AI Sathi)", a friendly, supportive, and Socratic coding & robotics tutor for school students (Classes 4 to 10).
TARGET AUDIENCE: Young school learners exploring Scratch, block coding, Python, Arduino, breadboards, sensors, and basic computational thinking.

PEDAGOGICAL RULES FOR STUDENT CHAT:
1. SOCRATIC COACHING: Never dump full finished code or solve assignments directly for the student. Instead, give encouraging hints, step-by-step guidance, and ask interactive guiding questions (e.g. "What block did you put inside the repeat loop?").
2. RELATABLE ANALOGIES: Explain abstract concepts using fun Indian everyday analogies (e.g. Cricket scoreboard for variables, Traffic light for IF-ELSE conditions, TV remote for input signals, Recipe steps for algorithms).
3. SAFETY & RESTRICTIONS: Never generate teacher lesson plans, teacher rubrics, or internal school grading answers for students. Keep explanations positive, friendly, and empowering.
4. LANGUAGE: Always respond in the EXACT language used by the student (Hindi, Telugu, or English).
5. FORMAT: Keep explanations clear, structured, well-spaced with emojis and clear numbered steps.`;
      } else {
        // TEACHER AI CHAT PERSONA: STEM Pedagogy Specialist, Lesson Designer, Classroom SOS Strategist
        systemInstruction = `You are "Shiksha Sathi (Teacher STEM Co-Pilot)", an expert STEM educator and curriculum copilot helping school teachers teach coding, robotics, and computational thinking.
TARGET AUDIENCE: STEM educators, computer science teachers, and robotics lab instructors.

PEDAGOGICAL RULES FOR TEACHER CHAT:
1. CURRICULUM & LESSON PLANNING: Create structured 45-minute lesson plans (Objectives, Materials, 5-min Warm-up, 20-min Hands-on Lab, 10-min Scaffolding/Differentiation, 10-min Formative Assessment).
2. CLASSROOM SOS & LAB STRATEGIES: Provide instant, actionable solutions when students are stuck, bored, finishing early, or dealing with hardware kit shortages.
3. TEACHER-TO-STUDENT ANALOGIES & DIALOGUE: Provide ready-to-speak classroom dialogues and everyday analogies teachers can deliver directly to young students.
4. HARDWARE DIAGNOSTICS: Provide systematic 3-step troubleshooting checklists for Arduino Uno, micro:bit, breadboards, ultrasonic sensors, and motors (simplest fix first).
5. LANGUAGE: Match the teacher's language (English, Hindi, or Telugu).
6. FORMAT: Clean markdown, bold headings, bulleted action items, concise and actionable.`;
      }

      const prunedHistory = (history && Array.isArray(history)) ? history.slice(-12) : [];

      // Determine the requested model and choose the routing strategy
      const requestedModel = model || 'sarvam-105b';
      const isSarvamModelRequested = requestedModel.toLowerCase().includes('sarvam');

      let replyText = '';
      let lastErrorMessage = '';

      // Helper to construct alternating Gemini content structures
      const buildGeminiContents = () => {
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        for (const msg of prunedHistory) {
          const text = (msg.content || msg.text || '').trim();
          if (!text) continue;
          const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts.push({ text });
          } else {
            contents.push({ role, parts: [{ text }] });
          }
        }
        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts.push({ text: trimmedMessage });
        } else {
          contents.push({ role: 'user', parts: [{ text: trimmedMessage }] });
        }
        return contents;
      };

      // Helper to construct Sarvam message list
      const buildSarvamMessages = () => {
        const messages = [{ role: 'system', content: systemInstruction }];
        for (const msg of prunedHistory) {
          const text = (msg.content || msg.text || '').trim();
          if (text) {
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: text
            });
          }
        }
        messages.push({ role: 'user', content: trimmedMessage });
        return messages;
      };

      // Execution Strategy:
      // Priority 1: If Sarvam requested & key present -> Try Sarvam.
      // Priority 2: Try Gemini.
      // Priority 3: If Gemini failed and Sarvam wasn't tried yet & key present -> Try Sarvam.

      if (isSarvamModelRequested && process.env.SARVAM_API_KEY) {
        try {
          console.log(`[Sarvam AI] Routing request to Sarvam model "${requestedModel}".`);
          const sarvamReply = await generateContentWithSarvam({
            messages: buildSarvamMessages(),
            temperature: 0.6,
            model: requestedModel,
            maxTokens: 1500
          });
          if (sarvamReply) {
            replyText = sarvamReply;
          }
        } catch (sarvamErr: any) {
          console.warn('[Sarvam AI] Error with Sarvam AI API:', sarvamErr.message || sarvamErr);
          lastErrorMessage = `Sarvam AI: ${sarvamErr.message || sarvamErr}`;
        }
      }

      // If not yet answered, try Gemini
      if (!replyText) {
        try {
          console.log(`[Gemini API] Routing request to Gemini with model "${requestedModel}"`);
          const geminiResponse = await generateContentWithFallback({
            contents: buildGeminiContents(),
            systemInstruction: systemInstruction,
            temperature: 0.6,
            requestedModel: isSarvamModelRequested ? 'gemini-3.6-flash' : requestedModel,
            maxOutputTokens: 2048
          });
          if (geminiResponse && geminiResponse.text) {
            replyText = geminiResponse.text;
          }
        } catch (geminiErr: any) {
          console.warn('[Gemini API] Error with Gemini API:', geminiErr.message || geminiErr);
          lastErrorMessage = lastErrorMessage 
            ? `${lastErrorMessage} | Gemini: ${geminiErr.message || geminiErr}` 
            : `Gemini: ${geminiErr.message || geminiErr}`;
        }
      }

      // If still not answered and Sarvam has a key and hasn't succeeded
      if (!replyText && process.env.SARVAM_API_KEY && !isSarvamModelRequested) {
        try {
          console.log('[Sarvam AI] Running recovery fallback on Sarvam AI.');
          const sarvamReply = await generateContentWithSarvam({
            messages: buildSarvamMessages(),
            temperature: 0.6,
            model: 'sarvam-105b',
            maxTokens: 1500
          });
          if (sarvamReply) {
            replyText = sarvamReply;
          }
        } catch (sarvamErr: any) {
          console.warn('[Sarvam AI] Recovery fallback failed:', sarvamErr.message || sarvamErr);
        }
      }

      // Return response if any provider succeeded
      if (replyText) {
        return res.json({
          text: replyText,
          isFlagged: false
        });
      }

      // If all providers failed, return clear diagnostic error
      return res.status(500).json({
        error: `Could not generate response. ${lastErrorMessage || 'Please verify that GEMINI_API_KEY or SARVAM_API_KEY is configured in Settings.'}`
      });
    } catch (error: any) {
      console.error('Error in /api/chat:', error);
      res.status(500).json({ error: error.message || 'Failed to generate response' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    console.log('Running in DEVELOPMENT mode. Starting Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in PRODUCTION mode. Serving static files from dist/');
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
