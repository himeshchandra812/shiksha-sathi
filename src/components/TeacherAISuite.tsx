import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Settings, 
  Play, 
  Send, 
  ChevronRight, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  AlertCircle, 
  Bot, 
  Sliders, 
  CheckCircle2, 
  Printer, 
  Copy, 
  RotateCcw, 
  FileText, 
  Search, 
  BarChart2, 
  User, 
  HelpCircle,
  HelpCircle as HelpIcon,
  MessageSquare
} from 'lucide-react';

interface TeacherAISuiteProps {
  language: 'en' | 'hi' | 'te';
  onAskAI: (query: string) => void;
  selectedModel?: string;
}

// Simulated Student Data for Assessment & Analytics
const initialStudents = [
  { id: '1', name: 'Rahul Sharma', grade: 'Class 6A', scratchLogic: 85, hardwareWiring: 45, loopConcept: 90, variableConcept: 80, hardwareErrors: 12 },
  { id: '2', name: 'Ananya Rao', grade: 'Class 6A', scratchLogic: 95, hardwareWiring: 90, loopConcept: 95, variableConcept: 95, hardwareErrors: 2 },
  { id: '3', name: 'Kabir Patel', grade: 'Class 6A', scratchLogic: 60, hardwareWiring: 80, loopConcept: 55, variableConcept: 70, hardwareErrors: 5 },
  { id: '4', name: 'Diya Sen', grade: 'Class 6A', scratchLogic: 75, hardwareWiring: 40, loopConcept: 70, variableConcept: 60, hardwareErrors: 14 },
  { id: '5', name: 'Rohan Verma', grade: 'Class 6A', scratchLogic: 80, hardwareWiring: 75, loopConcept: 85, variableConcept: 75, hardwareErrors: 4 },
];

export default function TeacherAISuite({ language, onAskAI, selectedModel = 'sarvam-105b' }: TeacherAISuiteProps) {
  const [activeFeature, setActiveFeature] = useState<'automation' | 'personalized' | 'realtime-sos' | 'improved-assessment'>('automation');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string>('');
  
  // Local states for translation UI labels (fallback)
  const translations = {
    en: {
      suiteTitle: "Teacher's AI Suite",
      suiteSubtitle: "Supercharge your classroom, automate routine chores, and customize instruction in seconds.",
      tabAutomation: "Task Automation",
      tabPersonalized: "Personalized Paths",
      tabSos: "Live Lesson SOS",
      tabAssessment: "Smart Assessment",
      loading: "Consulting Shiksha Sathi AI...",
      copySuccess: "Copied to clipboard!",
      print: "Download Word Doc",
      copy: "Copy",
    },
    hi: {
      suiteTitle: "शिक्षक एआई सुइट",
      suiteSubtitle: "अपनी कक्षा को सशक्त बनाएं, दिन-प्रतिदिन के कार्यों को स्वचालित करें और शिक्षण को अनुकूलित करें।",
      tabAutomation: "कार्य स्वचालन",
      tabPersonalized: "व्यक्तिगत पथ",
      tabSos: "लाइव कक्षा एसओएस",
      tabAssessment: "स्मार्ट मूल्यांकन",
      loading: "शिक्षा साथी एआई से परामर्श कर रहे हैं...",
      copySuccess: "क्लिपबोर्ड पर कॉपी किया गया!",
      print: "वर्ड डॉक्यूमेंट डाउनलोड करें",
      copy: "कॉपी करें",
    },
    te: {
      suiteTitle: "ఉపాధ్యాయ ఎఐ సూట్",
      suiteSubtitle: "సెకన్లలో మీ బోధనను మెరుగుపరచండి, దినచర్యలను ఆటోమేట్ చేయండి మరియు విద్యార్థుల నైపుణ్యాన్ని పెంచండి.",
      tabAutomation: "టాస్క్ ఆటోమేషన్",
      tabPersonalized: "వ్యక్తిగతీకరించిన మార్గాలు",
      tabSos: "లైవ్ క్లాస్ ఎస్ఓఎస్",
      tabAssessment: "స్మార్ట్ అసెస్‌మెంట్",
      loading: "శిక్షా సతీ ఎఐని సంప్రదిస్తోంది...",
      copySuccess: "క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది!",
      print: "వర్డ్ డాక్యుమెంట్ డౌన్‌లోడ్",
      copy: "కాపీ",
    }
  };

  const t = translations[language] || translations.en;

  // Feature 1: Automation States
  const [automationType, setAutomationType] = useState<'worksheet' | 'coding-challenge'>('worksheet');
  const [worksheetTopic, setWorksheetTopic] = useState('How Ultrasonic sensor Trig & Echo pins calculate obstacle distance');
  const [challengeGrade, setChallengeGrade] = useState('Grade 6');

  // Feature 2: Personalized Path States
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<string>('diyasen');
  const [personalizationInterest, setPersonalizationInterest] = useState('Space Exploration & Rockets');
  const studentProfiles = {
    diyasen: {
      name: 'Diya Sen (Class 6A)',
      strengths: 'Creative storytelling, design, highly interested in science fiction.',
      weaknesses: 'Struggles with mechanical hardware wiring, gets easily frustrated with connection errors.',
      curriculum: 'Variables & Pin outputs'
    },
    kabirpatel: {
      name: 'Kabir Patel (Class 6A)',
      strengths: 'Excellent with hardware wiring, loves building LEGO and motorized cars.',
      weaknesses: 'Finds logic structures like nested loops and conditional statements boring/difficult.',
      curriculum: 'Loops & Conditionals'
    },
    rahulsharma: {
      name: 'Rahul Sharma (Class 6A)',
      strengths: 'Strong analytical logic, quick to write Scratch scripts.',
      weaknesses: 'Prone to loose wires, struggles with breadboard coordinate grids.',
      curriculum: 'Breadboard wiring & Sensors'
    }
  };

  // Feature 3: Realtime Lesson SOS States
  const [sosTopic, setSosTopic] = useState('Infinite loop crashed standard web editor');
  const [sosStudentState, setSosStudentState] = useState('bored'); // 'bored' | 'stuck-error' | 'finishing-early'
  const [customSosQuery, setCustomSosQuery] = useState('');;
  // Feature 5: Improved Assessment States
  const [selectedStudentAnalytics, setSelectedStudentAnalytics] = useState<string>('all');
  const [analyticsClassFilter, setAnalyticsClassFilter] = useState('Class 6A');

  // Trigger Action function that links to Gemini API via `/api/chat`
  const triggerAiQuery = async (promptText: string, targetStateSetter: (res: string) => void) => {
    setIsLoading(true);
    targetStateSetter('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          history: [],
          model: selectedModel
        })
      });
      const data = await response.json();
      if (response.ok && data.text) {
        targetStateSetter(data.text);
      } else {
        throw new Error(data.error || 'Connection issues with AI models.');
      }
    } catch (err: any) {
      console.error(err);
      targetStateSetter(`⚠️ **Failed to contact Sathi AI:** ${err.message || 'Please verify your API settings.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper actions
  const handleRunAutomation = () => {
    let prompt = '';
    if (automationType === 'worksheet') {
      prompt = `TASK: AUTOMATED LEARNING CONTENT & WORKSHEET CREATOR
Create a classroom handout and 5-question printable quick-quiz on this robotics/coding topic: "${worksheetTopic}".
Structure the output beautifully as:
- **Title of Worksheet**
- **Sathi Summary**: (1 paragraph explanation written simple enough for a 11 year old child)
- **Active Class Prompt**: A 3-minute physical group game to demonstrate this topic without computer.
- **5-Question Quiz**: Multiple choice questions with clear marked answers.
Reply in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}.`;
    } else {
      prompt = `TASK: HANDS-ON CODING CHALLENGE GENERATOR
Generate an exciting coding/robotics adventure scenario and hands-on challenge appropriate for ${challengeGrade}.
Topic of challenge: ${worksheetTopic || 'Variables & LED Control'}.
Please include:
1. **Adventure Story Scenario** (e.g. Saving a forest from fire, launching a space capsule).
2. **The Robotics Task** (Specific circuit connections and Scratch/Blockly instructions).
3. **Extension/Level-up task** (for early finishers).
Reply in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}.`;
    }
    triggerAiQuery(prompt, setAiResult);
  };

  const handleGeneratePersonalizedPath = () => {
    const profile = studentProfiles[selectedStudentProfile as keyof typeof studentProfiles];
    if (!profile) return;
    const prompt = `TASK: PERSONALIZED LEARNING PATH GENERATOR (STUDENT RE-ENGAGEMENT)
Create a customized, deeply personalized learning intervention path for a student based on their profile.
Student Profile details:
- **Student Name**: ${profile.name}
- **Current Core Curriculum Concept**: ${profile.curriculum}
- **Strengths**: ${profile.strengths}
- **Learning Barriers/Weaknesses**: ${profile.weaknesses}
- **Student's High-Interest Topic**: "${personalizationInterest}"

Please design a 3-Step Bento-style customized learning roadmap tailored precisely to their strengths, using their high-interest theme to explain the concept.
Format the output as:
- **Pedagogical Recommendation**: How to hook the student using their interest immediately.
- **Step 1: Concept Analogy**: Explain '${profile.curriculum}' using a direct metaphor based on '${personalizationInterest}'.
- **Step 2: Hands-on Sandbox Mini-project**: Describe a step-by-step programming/hardware task themed around their interest.
- **Step 3: Self-Efficacy Check**: A simple positive challenge designed to boost their confidence.
Reply in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}.`;
    triggerAiQuery(prompt, setAiResult);
  };

  const handleGenerateSosSupport = () => {
    const topic = customSosQuery.trim() || sosTopic;
    const prompt = `TASK: LIVE LESSON REAL-TIME ADVISORY
The teacher is currently in a live robotics/coding class and needs immediate pedagogic strategy or troubleshooting.
Current Classroom Issue/Topic: "${topic}"
Status of the students: ${sosStudentState === 'bored' ? 'Restless/Unfocused' : sosStudentState === 'stuck-error' ? 'Frustrated/Stuck on errors' : 'Completed lesson early and looking for challenges'}

Please output a quick-response tactical sheet containing:
1. **The 30-Second Intervention**: Immediate action/activity the teacher can say or do to regain focus or handle the panic.
2. **Alternative Metaphor**: An easy, zero-prep real-world analogy to clarify the stuck concept.
3. **2-Minute Physical Breakout Activity**: A rapid kinesthetic game (e.g., students act as cables or variables) to reinforce the logic on the spot.
4. **Encouraging Word**: A prompt the teacher can say to rebuild trust and resilience in the classroom.
Reply in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}. Keep the layout incredibly brief, structured, and easy to read.`;
    triggerAiQuery(prompt, setAiResult);
  };

  const handleGenerateImprovedAssessment = () => {
    const studentStatsText = initialStudents.map(s => 
      `Name: ${s.name}, Scratch Logic: ${s.scratchLogic}/100, Hardware Wiring: ${s.hardwareWiring}/100, Loops Mastery: ${s.loopConcept}%, Variables Mastery: ${s.variableConcept}%, Errors Reported: ${s.hardwareErrors}`
    ).join('\n');

    const prompt = `TASK: CLASS ASSESSMENT ANALYTICS & PRECISION PEDAGOGICAL RECOMMENDATIONS
Act as an Expert Pedagogic Data Analyst. Below is the current assessment matrix for Class 6A:
\`\`\`
${studentStatsText}
\`\`\`

Analyze the classroom progress and generate:
1. **Precision Diagnostic Summary**: Pinpoint the precise concept where the entire class is lagging (e.g., identify that hardware wiring has a critical average deficit compared to Scratch logic, citing the student data).
2. **Individual Attention Required**: Identify which students need immediate custom remedial help and why based on their metrics.
3. **Classroom Action Plan**: Provide a concrete 2-step instructional adjustment for next class to close the wiring gap.
4. **AI-Driven Mastery Predictions**: Predict what concepts students will master next if recommendations are followed.
Reply in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}. Use clean data headers and bold metrics.`;
    triggerAiQuery(prompt, setAiResult);
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(aiResult);
    alert(t.copySuccess);
  };

  const handlePrintResult = () => {
    if (!aiResult) return;

    // Convert markdown to formatted HTML
    const htmlContent = convertMarkdownToHtml(aiResult);

    // Build the Word document structured as Microsoft Word compatible MIME
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'/><title>Sathi AI Export</title><style>" +
            "body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; padding: 40px; }" +
            "h1 { color: #1a1a1a; font-size: 22pt; border-bottom: 2px solid #5e43ff; padding-bottom: 8px; margin-bottom: 20px; font-weight: bold; }" +
            "h2 { color: #5e43ff; font-size: 16pt; margin-top: 30px; margin-bottom: 12px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 4px; }" +
            "h3 { color: #e11d48; font-size: 13pt; margin-top: 24px; margin-bottom: 10px; font-weight: bold; }" +
            "p { font-size: 11.5pt; margin-bottom: 12px; line-height: 1.6; color: #475569; }" +
            "ul, ol { margin-bottom: 16px; padding-left: 24px; }" +
            "li { font-size: 11pt; margin-bottom: 6px; color: #475569; }" +
            "strong { font-weight: bold; color: #0f172a; }" +
            "pre { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-family: 'Consolas', 'Courier New', monospace; font-size: 10pt; margin-bottom: 16px; white-space: pre-wrap; }" +
            "code { font-family: 'Consolas', 'Courier New', monospace; background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-size: 10pt; color: #0f172a; }" +
            "table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }" +
            "th, td { border: 1px solid #e2e8f0; text-align: left; padding: 10px; font-size: 10pt; }" +
            "th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }" +
            ".footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 9pt; color: #94a3b8; font-family: sans-serif; text-align: center; }" +
            "</style></head><body>" +
            "<div><span style='font-size: 10pt; font-weight: bold; color: #8b5cf6; text-transform: uppercase; letter-spacing: 1px;'>Shiksha Sathi AI • Pedagogy Copilot Workspace Export</span></div>" +
            "<hr style='border: none; border-top: 1px solid #e2e8f0; margin-bottom: 25px;' />";

    const footerDoc = "<div class='footer'>Generated via Sathi AI Pedagogy Copilot — Version 2.6 • Confidentially generated for school educators.</div>" +
            "</body></html>";

    const sourceHTML = header + htmlContent + footerDoc;

    // Create a blob and use URL.createObjectURL for high reliability across all platforms (and standard download mechanisms)
    const blob = new Blob([sourceHTML], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = url;
    
    // Generate filename based on active features
    let filename = 'Sathi_AI_Material';
    if (activeFeature === 'automation') {
      filename = `Sathi_Automation_${worksheetTopic.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}`;
    } else if (activeFeature === 'personalized') {
      filename = `Sathi_Personalized_Lesson_${selectedStudentProfile}`;
    } else if (activeFeature === 'realtime-sos') {
      filename = `Sathi_Live_Class_SOS_Advisory`;
    } else if (activeFeature === 'improved-assessment') {
      filename = `Sathi_Class_Assessment_Report`;
    }
    
    fileDownload.download = `${filename}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="teacher-ai-suite" className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 bg-[#fffdf0] border-3 border-[#1a1a1a] rounded-[24px] shadow-[6px_6px_0px_#1a1a1a] h-full overflow-y-auto font-sans">
      
      {/* LEFT: Tab navigation and interactive form inputs */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        
        {/* Title Block */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-5 shadow-[3px_3px_0px_#1a1a1a]">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-100 border-2 border-[#1a1a1a] rounded-xl text-3xl">🛠️</span>
            <div>
              <h2 className="font-gaegu text-3xl font-black text-[#1a1a1a]">
                {t.suiteTitle}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {t.suiteSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Feature selection grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          {[
            { id: 'automation', icon: '🤖', label: t.tabAutomation, color: 'bg-amber-100 border-amber-600' },
            { id: 'personalized', icon: '🎯', label: t.tabPersonalized, color: 'bg-sky-100 border-sky-600' },
            { id: 'realtime-sos', icon: '🚨', label: t.tabSos, color: 'bg-rose-100 border-rose-600' },
            { id: 'improved-assessment', icon: '📊', label: t.tabAssessment, color: 'bg-emerald-100 border-emerald-600' },
          ].map((feat) => (
            <button
              key={feat.id}
              onClick={() => {
                setActiveFeature(feat.id as any);
                setAiResult('');
              }}
              className={`flex flex-col items-center justify-center p-3 text-center rounded-xl border-2 border-[#1a1a1a] transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a1a] ${
                activeFeature === feat.id 
                  ? 'bg-slate-900 text-white shadow-[2px_2px_0px_#1a1a1a]' 
                  : `${feat.color} text-[#1a1a1a] font-bold`
              }`}
            >
              <span className="text-xl mb-1">{feat.icon}</span>
              <span className="text-[10px] font-extrabold tracking-tight leading-tight">{feat.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Form Area depending on selected Feature */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[3px_3px_0px_#1a1a1a] flex-1">
          
          {/* FEATURE 1: AUTOMATION OF ROUTINE TASKS */}
          {activeFeature === 'automation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="font-gaegu text-2xl font-bold text-amber-600 flex items-center gap-1.5">
                  🤖 Routine Tasks Automation
                </h3>
                <div className="flex bg-[#1a1a1a]/5 p-0.5 rounded-lg border border-[#1a1a1a]">
                  <button 
                    onClick={() => setAutomationType('worksheet')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${automationType === 'worksheet' ? 'bg-[#1a1a1a] text-white' : 'text-slate-600 hover:text-black'}`}
                  >
                    Quiz/Handout
                  </button>
                  <button 
                    onClick={() => setAutomationType('coding-challenge')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${automationType === 'coding-challenge' ? 'bg-[#1a1a1a] text-white' : 'text-slate-600 hover:text-black'}`}
                  >
                    Challenge
                  </button>
                </div>
              </div>

              {automationType === 'worksheet' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Instantly output offline worksheets, summaries, unplugged kinetic activities, and standard multiple-choice quizzes on any technology topic.
                  </p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Worksheet Topic</label>
                    <input 
                      type="text" 
                      value={worksheetTopic} 
                      onChange={(e) => setWorksheetTopic(e.target.value)}
                      placeholder="e.g. Variable Declarations, Breadboards, DC Motors"
                      className="w-full text-xs font-bold p-2.5 border-2 border-[#1a1a1a] rounded-lg bg-slate-50 animate-fade-in"
                    />
                  </div>
                </div>
              )}

              {automationType === 'coding-challenge' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Create captivating STEM challenges with story narratives (e.g., lunar landings, deep ocean rescues) configured with clear circuitry wiring tasks.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Student Age / Grade</label>
                      <select 
                        value={challengeGrade}
                        onChange={(e) => setChallengeGrade(e.target.value)}
                        className="w-full text-xs font-bold p-2 border-2 border-[#1a1a1a] rounded-lg bg-slate-50 text-[#1a1a1a]"
                      >
                        <option>Grade 4 (Ages 9-10)</option>
                        <option>Grade 6 (Ages 11-12)</option>
                        <option>Grade 8 (Ages 13-14)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Core Topic</label>
                      <input 
                        type="text" 
                        value={worksheetTopic} 
                        onChange={(e) => setWorksheetTopic(e.target.value)}
                        className="w-full text-xs font-bold p-2 border-2 border-[#1a1a1a] rounded-lg bg-slate-50 text-[#1a1a1a]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleRunAutomation}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] text-white hover:bg-slate-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_#1a1a1a] transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                {isLoading ? t.loading : "Automate Routine Tasks & Generate Result"}
              </button>
            </div>
          )}

          {/* FEATURE 2: PERSONALIZED LEARNING EXPERIENCES */}
          {activeFeature === 'personalized' && (
            <div className="space-y-4">
              <h3 className="font-gaegu text-2xl font-bold text-sky-600 flex items-center gap-1.5">
                🎯 Personalization Path Builder
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Re-engage struggling or unmotivated students! Select a simulated student, define their favorite non-tech topic (e.g., cricket, makeup, dinosaurs, space), and Sathi AI will customize their coding lesson plans accordingly.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Select Student Profile</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(studentProfiles).map(([key, prof]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedStudentProfile(key)}
                        className={`p-2 rounded-xl text-center border-2 border-[#1a1a1a] text-[10px] font-bold leading-normal transition-all ${
                          selectedStudentProfile === key 
                            ? 'bg-sky-100 border-sky-600 font-extrabold text-sky-800 shadow-[2px_2px_0px_#1a1a1a]' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {prof.name.split(' ')[0]}
                        <span className="block text-[8px] text-slate-400 font-medium">{prof.curriculum}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-sky-50 border-2 border-sky-300 rounded-xl p-3 text-[10px] font-semibold text-sky-950/80 leading-relaxed space-y-1">
                  <div><strong className="text-sky-900">Current Barriers:</strong> {studentProfiles[selectedStudentProfile as keyof typeof studentProfiles]?.weaknesses}</div>
                  <div><strong className="text-sky-900">Academic Strengths:</strong> {studentProfiles[selectedStudentProfile as keyof typeof studentProfiles]?.strengths}</div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Student's Favorite Hobby / Topic Interest</label>
                  <input 
                    type="text" 
                    value={personalizationInterest} 
                    onChange={(e) => setPersonalizationInterest(e.target.value)}
                    placeholder="e.g. Cricket World Cup, Farming, Cats, Princess Stories"
                    className="w-full text-xs font-bold p-2.5 border-2 border-[#1a1a1a] rounded-lg bg-slate-50 text-[#1a1a1a]"
                  />
                </div>
              </div>

              <button
                onClick={handleGeneratePersonalizedPath}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] text-white hover:bg-slate-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_#1a1a1a] transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                {isLoading ? t.loading : "Customize Learning Path & Analogy"}
              </button>
            </div>
          )}

          {/* FEATURE 3: REALTIME SUPPORT DURING LESSONS */}
          {activeFeature === 'realtime-sos' && (
            <div className="space-y-4">
              <h3 className="font-gaegu text-2xl font-bold text-rose-600 flex items-center gap-1.5">
                🚨 Live Class SOS Advisory
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Stuck during a live class? Students are bored, confused, or hit with a massive compilation error? Get immediate alternative explanations and zero-setup kinetic learning breaks.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Select Live Scenario</label>
                    <select
                      value={sosTopic}
                      onChange={(e) => setSosTopic(e.target.value)}
                      className="w-full text-xs font-bold p-2 border-2 border-[#1a1a1a] rounded-lg bg-slate-50 text-[#1a1a1a]"
                    >
                      <option value="Scratch nested loops causing massive confusion">Nested Loops logic confusion</option>
                      <option value="Arduino board not detected error on standard COM ports">Arduino COM port missing</option>
                      <option value="Ultrasonic sensor HC-SR04 giving constant 0 distance readings">HC-SR04 reads 0 constantly</option>
                      <option value="Variables explained theoretically without computer">Expaning variables unplugged</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Current Class Vibe</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'bored', label: '💤 Restless' },
                        { id: 'stuck-error', label: '🛑 Stuck' },
                        { id: 'finishing-early', label: '🚀 Early' }
                      ].map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSosStudentState(v.id)}
                          className={`p-1.5 rounded-lg text-center border text-[9px] font-bold leading-none ${
                            sosStudentState === v.id ? 'bg-rose-100 border-rose-500 text-rose-800' : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Or describe your custom crisis:</label>
                  <input 
                    type="text" 
                    value={customSosQuery} 
                    onChange={(e) => setCustomSosQuery(e.target.value)}
                    placeholder="e.g. Help, girls are not participating in the wiring activity!"
                    className="w-full text-xs font-bold p-2.5 border-2 border-[#1a1a1a] rounded-lg bg-slate-50 text-[#1a1a1a]"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateSosSupport}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-bold text-xs shadow-[3px_3px_0px_#1a1a1a] transition-all disabled:opacity-50"
              >
                <AlertCircle className="w-4 h-4 animate-bounce" />
                {isLoading ? t.loading : "Get 30-Second Classroom SOS Answer"}
              </button>
            </div>
          )}

          {/* FEATURE 5: IMPROVED ASSESSMENT ACCURACY */}
          {activeFeature === 'improved-assessment' && (
            <div className="space-y-4">
              <h3 className="font-gaegu text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
                📊 Assessment Analytics & Precision Advice
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Assess class progress with statistical precision. Review hardware errors and Scratch scores below, then click "Generate Precision Advice" to compile remedial action guidelines automatically.
              </p>

              {/* Class Table */}
              <div className="border-2 border-[#1a1a1a] rounded-xl overflow-hidden text-[10px] bg-white max-h-36 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-[#1a1a1a] font-bold text-slate-700">
                      <th className="p-2 border-r border-slate-200">Student Name</th>
                      <th className="p-2 border-r border-slate-200 text-center">Scratch Logic</th>
                      <th className="p-2 border-r border-slate-200 text-center">Hardware Wiring</th>
                      <th className="p-2 text-center">Hardware Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {initialStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 font-semibold text-slate-800">
                        <td className="p-2 border-r border-slate-100">{s.name}</td>
                        <td className="p-2 border-r border-slate-100 text-center text-emerald-600 font-extrabold">{s.scratchLogic}%</td>
                        <td className={`p-2 border-r border-slate-100 text-center font-extrabold ${s.hardwareWiring < 50 ? 'text-rose-500' : 'text-slate-700'}`}>{s.hardwareWiring}%</td>
                        <td className="p-2 text-center text-rose-500 font-mono">{s.hardwareErrors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleGenerateImprovedAssessment}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] text-white hover:bg-slate-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_#1a1a1a] transition-all disabled:opacity-50"
              >
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                {isLoading ? t.loading : "Assess Class Data & Get Recommendations"}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT: Output Panel / Live response preview */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border-3 border-[#1a1a1a] rounded-[24px] shadow-[6px_6px_0px_#1a1a1a] overflow-hidden">
        
        {/* Output Header */}
        <div className="bg-[#1a1a1a] px-5 py-4 flex items-center justify-between text-white border-b-2 border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="font-mono text-xs font-black tracking-widest uppercase">
              Copilot Workspace Response
            </span>
          </div>

          {aiResult && !isLoading && (
            <div className="flex gap-2">
              <button 
                onClick={handleCopyResult}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/20 transition-all text-[10px] font-bold flex items-center gap-1"
                title={t.copy}
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
              <button 
                onClick={handlePrintResult}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/20 transition-all text-[10px] font-bold flex items-center gap-1"
                title={t.print}
              >
                <Printer className="w-3 h-3" />
                Print
              </button>
            </div>
          )}
        </div>

        {/* Output Body Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fffdfa] relative">
          
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fffdfa]/90 backdrop-blur-xs z-10">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-[#1a1a1a]/15 rounded-full" />
                <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin" />
              </div>
              <p className="font-gaegu text-2xl font-bold text-[#1a1a1a] text-center max-w-xs px-4">
                {t.loading}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Calling Gemini 3.5 Flash Model...</p>
            </div>
          ) : null}

          {aiResult ? (
            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm font-semibold select-text whitespace-pre-line">
              {aiResult}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 select-none py-12">
              <span className="text-4xl filter drop-shadow-sm mb-4">✨</span>
              <p className="text-sm font-bold text-slate-500 max-w-sm">
                Choose one of the AI templates or configure a helper on the left, then click generate to compile beautiful, printable materials.
              </p>
            </div>
          )}

        </div>

        {/* Output Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t-2 border-[#1a1a1a]/10 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
          <span>Sathi-Powered Pedagogy Copilot</span>
          <span>Version 2.6</span>
        </div>

      </div>

    </div>
  );
}

// Markdown to HTML conversion helpers for Microsoft Word export
function parseInlineMarkdown(text: string): string {
  let processed = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Bold **text**
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code `code`
  processed = processed.replace(/`(.*?)`/g, '<code>$1</code>');
  
  return processed;
}

function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  const lines = markdown.split('\n');
  let html = '';
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Escape HTML tags in pre block
        const escapedContent = codeBlockLines.join('\n')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        html += `<pre><code>${escapedContent}</code></pre>\n`;
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // List item check
    const isUl = trimmed.startsWith('- ') || trimmed.startsWith('* ');
    const isOl = /^\d+\.\s/.test(trimmed);

    if (inList && !isUl && !isOl) {
      html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
      inList = false;
      listType = null;
    }

    if (trimmed.startsWith('# ')) {
      html += `<h1>${parseInlineMarkdown(trimmed.substring(2))}</h1>\n`;
    } else if (trimmed.startsWith('## ')) {
      html += `<h2>${parseInlineMarkdown(trimmed.substring(3))}</h2>\n`;
    } else if (trimmed.startsWith('### ')) {
      html += `<h3>${parseInlineMarkdown(trimmed.substring(4))}</h3>\n`;
    } else if (trimmed.startsWith('#### ')) {
      html += `<h4>${parseInlineMarkdown(trimmed.substring(5))}</h4>\n`;
    } else if (isUl) {
      if (!inList || listType !== 'ul') {
        if (inList) html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
        html += '<ul>\n';
        inList = true;
        listType = 'ul';
      }
      const text = trimmed.substring(2);
      html += `  <li>${parseInlineMarkdown(text)}</li>\n`;
    } else if (isOl) {
      if (!inList || listType !== 'ol') {
        if (inList) html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      }
      const text = trimmed.replace(/^\d+\.\s/, '');
      html += `  <li>${parseInlineMarkdown(text)}</li>\n`;
    } else if (trimmed === '') {
      html += '<p>&nbsp;</p>\n';
    } else {
      html += `<p>${parseInlineMarkdown(line)}</p>\n`;
    }
  }

  if (inList) {
    html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
  }

  return html;
}
