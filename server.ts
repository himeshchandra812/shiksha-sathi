import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';



dotenv.config();

/**
 * Executes a Gemini model call with an automated retry mechanism for transient 503 errors,
 * and a robust fallback to a lightweight alternative model if the primary model remains unavailable.
 */
async function generateContentWithFallback(
  aiInstances: GoogleGenAI[],
  options: {
    contents: any;
    systemInstruction: string;
    temperature: number;
    requestedModel?: string;
  }
) {
  const baseModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash', 
    'gemini-1.5-flash'
  ];
  const requested = options.requestedModel;
  
  const models = [];
  if (requested && baseModels.includes(requested)) {
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
 * Executes a call to Sarvam AI completions endpoint with the specified model and messages.
 */
async function generateContentWithSarvam(options: {
  messages: any[];
  temperature: number;
  model?: string;
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

  // In-memory student doubts database with realistic classroom doubts
  interface StudentDoubt {
    id: string;
    studentName: string;
    studentEmail?: string;
    studentGrade: string;
    doubt: string;
    topic?: string;
    category?: 'coding' | 'hardware' | 'logic' | 'general';
    timestamp: string;
    createdAt: number;
    aiResponse?: string;
    isResolved: boolean;
    teacherNotes?: string;
  }

  let studentDoubts: StudentDoubt[] = [
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
      teacherNotes: 'Demonstrated in class with sponge vs book.'
    }
  ];

  // Doubts API: GET all doubts
  app.get('/api/doubts', (req, res) => {
    // Return sorted newest first
    const sorted = [...studentDoubts].sort((a, b) => b.createdAt - a.createdAt);
    res.json({ doubts: sorted, totalCount: sorted.length });
  });

  // Doubts API: POST a new doubt when student asks
  app.post('/api/doubts', (req, res) => {
    const { studentName, studentEmail, studentGrade, doubt, topic, category, aiResponse } = req.body;
    if (!doubt || !doubt.trim()) {
      return res.status(400).json({ error: 'Doubt text is required' });
    }

    const newDoubt: StudentDoubt = {
      id: `doubt-${Date.now()}`,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || 'student@school.edu',
      studentGrade: studentGrade || 'Class 6',
      doubt: doubt.trim(),
      topic: topic || 'General Doubt',
      category: category || 'general',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Just now)',
      createdAt: Date.now(),
      aiResponse: aiResponse || '',
      isResolved: false
    };

    studentDoubts.unshift(newDoubt);
    console.log(`[Doubts API] Recorded new doubt from student "${newDoubt.studentName}": ${newDoubt.doubt.slice(0, 50)}...`);
    res.status(201).json({ success: true, doubt: newDoubt });
  });

  // Doubts API: PATCH update doubt (resolve / add teacher remarks)
  app.patch('/api/doubts/:id', (req, res) => {
    const { id } = req.params;
    const { isResolved, teacherNotes, topic, category } = req.body;
    
    const index = studentDoubts.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    if (typeof isResolved === 'boolean') {
      studentDoubts[index].isResolved = isResolved;
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

  // Health check/API key status endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.SARVAM_API_KEY || !!process.env.GEMINI_API_KEY,
      hasSarvamApiKey: !!process.env.SARVAM_API_KEY,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      totalDoubts: studentDoubts.length
    });
  });

  // Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, model } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const systemInstruction = `You are "Shiksha Sathi" - an AI assistant/copilot that helps school teachers (especially non-technical teachers) deliver coding and robotics lessons.
Your tone should be warm, encouraging, patient, and humble, like a helpful senior teacher colleague. Never be condescending or overly technical. Always assume the teacher has zero coding, programming, or electronics background.
CRITICAL language rule: Always reply in the exact same language the teacher typed in (e.g., if they ask in Hindi, reply in Hindi. If Telugu, reply in Telugu. If English, reply in English). This is extremely important!

CRITICAL LENGTH RULE: Keep all explanations, steps, and paragraphs extremely short, brief, and highly concise. Use simple words and short sentences so that it is instantly clear and easy to understand.

Depending on the request, you MUST format your response beautifully and clearly as follows:

1. LESSON PLAN GENERATION:
If asked for a lesson plan on a coding/robotics topic, respond with:
- **Topic & Grade Level** (e.g. Grade 5 Intro to Scratch)
- **Learning Objective** (Briefly: What will the children learn?)
- **Materials Needed** (Very short list)
- **Warm-up Activity** (Short, simple step-by-step instructions with timing)
- **Main Activity** (Short step-by-step instructions with timing, explained extremely simply)
- **Common Student Questions** (Keep answers extremely simple)
- **Wrap-up** (Short, clear timing)
- **Total Duration** (e.g., 45 minutes)

2. STUDENT DOUBT RESOLUTION:
If a teacher asks how to explain a concept or relays a student's doubt (e.g. "student is asking what is a variable"), respond with:
- **One-line Simple Answer** (Super short, simple enough for a child)
- **Simple Real-world Analogy** (Short relatable everyday life comparison)
- **Classroom Dialogue** (A brief literal example starting with "Children, think of it as...")

3. HARDWARE TROUBLESHOOTING:
If a teacher describes a hardware issue, respond with:
- **Most Likely Cause** (In one simple, short sentence)
- **Numbered Fix Steps** (Extremely brief, starting with loose wires, correct port/board, USB connections).

Use clear formatting, bold terms, and bullet points to make it extremely easy to read on a mobile or laptop screen. Keep your prose warm, reassuring, and supportive but highly brief!`;

      // Determine the requested model and choose the routing strategy
      const requestedModel = model || 'sarvam-105b';
      const isSarvamModelRequested = requestedModel.toLowerCase().includes('sarvam');

      if (isSarvamModelRequested) {
        // --- PREFER SARVAM AI ROUTE ---
        if (process.env.SARVAM_API_KEY) {
          console.log(`[Sarvam AI] Routing request to Sarvam model "${requestedModel}".`);
          const messages = [
            { role: 'system', content: systemInstruction }
          ];

          if (history && Array.isArray(history)) {
            for (const msg of history) {
              messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content || msg.text || ''
              });
            }
          }

          messages.push({
            role: 'user',
            content: message
          });

          try {
            const reply = await generateContentWithSarvam({
              messages,
              temperature: 0.7,
              model: requestedModel
            });
            return res.json({ text: reply });
          } catch (sarvamErr: any) {
            console.error('[Sarvam AI] Error calling Sarvam API:', sarvamErr);
            if (!process.env.GEMINI_API_KEY) {
              return res.status(500).json({ error: `Sarvam AI Error: ${sarvamErr.message || sarvamErr}` });
            }
            console.log('[Gemini API] Falling back to Gemini due to Sarvam API error...');
          }
        } else if (!process.env.GEMINI_API_KEY) {
          return res.status(400).json({
            error: 'SARVAM_API_KEY is not configured in your Secrets panel.'
          });
        } else {
          console.log('[Gemini API] Sarvam API key not configured. Falling back to Gemini.');
        }
      } else {
        // --- PREFER GEMINI AI ROUTE ---
        if (process.env.GEMINI_API_KEY) {
          console.log(`[Gemini API] Routing request to Gemini model "${requestedModel}".`);
          const contents = [];
          if (history && Array.isArray(history)) {
            for (const msg of history) {
              contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content || msg.text || '' }]
              });
            }
          }

          contents.push({
            role: 'user',
            parts: [{ text: message }]
          });

          try {
            const response = await generateContentWithFallback(aiInstances, {
              contents: contents,
              systemInstruction: systemInstruction,
              temperature: 0.7,
              requestedModel: requestedModel,
            });
            return res.json({ text: response.text });
          } catch (geminiErr: any) {
            console.error('[Gemini API] Error calling Gemini API:', geminiErr);
            if (!process.env.SARVAM_API_KEY) {
              return res.status(500).json({ error: `Gemini API Error: ${geminiErr.message || geminiErr}` });
            }
            console.log('[Sarvam AI] Falling back to Sarvam due to Gemini API error...');
          }
        } else if (!process.env.SARVAM_API_KEY) {
          return res.status(400).json({
            error: 'GEMINI_API_KEY is not configured in your Secrets panel.'
          });
        } else {
          console.log('[Sarvam AI] Gemini API key not configured. Falling back to Sarvam.');
        }
      }

      // --- CROSS-FALLBACK RECOVERY ENGINE ---
      // If we reach this point, either the preferred route failed or was unconfigured, so we attempt the other
      if (process.env.SARVAM_API_KEY) {
        console.log(`[Sarvam AI] Running recovery fallback on Sarvam AI.`);
        const messages = [
          { role: 'system', content: systemInstruction }
        ];

        if (history && Array.isArray(history)) {
          for (const msg of history) {
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content || msg.text || ''
            });
          }
        }

        messages.push({
          role: 'user',
          content: message
        });

        try {
          const reply = await generateContentWithSarvam({
            messages,
            temperature: 0.7,
            model: 'sarvam-105b'
          });
          return res.json({ text: reply + "\n\n*(Note: Fallback recovery utilized Sarvam AI.)*" });
        } catch (sarvamErr: any) {
          return res.status(500).json({ error: `All API routes and fallbacks failed. Sarvam recovery error: ${sarvamErr.message || sarvamErr}` });
        }
      }

      if (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2) {
        console.log(`[Gemini API] Running recovery fallback on Gemini.`);
        const contents = [];
        if (history && Array.isArray(history)) {
          for (const msg of history) {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content || msg.text || '' }]
            });
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        try {
          const response = await generateContentWithFallback(aiInstances, {
            contents: contents,
            systemInstruction: systemInstruction,
            temperature: 0.7,
            requestedModel: 'gemini-2.5-flash',
          });
          return res.json({ text: response.text + "\n\n*(Note: Fallback recovery utilized Gemini.)*" });
        } catch (geminiErr: any) {
          return res.status(500).json({ error: `All API routes and fallbacks failed. Gemini recovery error: ${geminiErr.message || geminiErr}` });
        }
      }

      return res.status(500).json({
        error: 'Neither SARVAM_API_KEY nor GEMINI_API_KEY is configured in your Secrets panel.'
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
