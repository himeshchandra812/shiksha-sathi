import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Timer, 
  Award, 
  Users, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  Layers, 
  Clock, 
  ChevronRight, 
  HelpCircle, 
  Trophy, 
  PlusCircle, 
  Radio, 
  AlertCircle, 
  Hash, 
  Copy, 
  Check 
} from 'lucide-react';

export interface QuizQuestion {
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
  questions: QuizQuestion[];
  participants: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentGrade: string;
    joinedAt: number;
    score: number;
    correctCount: number;
    hasSubmitted: boolean;
  }[];
}

interface StudentQuizHubProps {
  language: 'en' | 'hi' | 'te';
  userRole: 'teacher' | 'student';
  userName: string;
  userEmail: string;
  userGrade: string;
  onOpenLeaderboard: () => void;
  selectedModel?: string;
}

export default function StudentQuizHub({
  language,
  userRole,
  userName,
  userEmail,
  userGrade,
  onOpenLeaderboard,
  selectedModel = 'sarvam-105b'
}: StudentQuizHubProps) {
  // Navigation inside Quiz Hub
  const [viewMode, setViewMode] = useState<'hub' | 'lobby' | 'playing' | 'results' | 'teacher_host' | 'ai_creator'>('hub');
  
  // Active session and presets
  const [activeSession, setActiveSession] = useState<ActiveQuizSession | null>(null);
  const [presets, setPresets] = useState<{ [key: string]: any }>({});
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copiedPin, setCopiedPin] = useState(false);

  // Student test playing state
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ questionIndex: number; selectedOption: number; timeTakenSec: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [currentQStartTime, setCurrentQStartTime] = useState<number>(0);
  const [streakCount, setStreakCount] = useState(0);
  const [scoreAccumulator, setScoreAccumulator] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  // AI Quiz Creator State (Teacher)
  const [aiTopic, setAiTopic] = useState('Scratch Loops and Variables');
  const [aiGrade, setAiGrade] = useState('Class 6');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenerationStatus, setAiGenerationStatus] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active session and presets on mount & polling
  const fetchActiveQuiz = async () => {
    try {
      const res = await fetch('/api/quiz/active');
      const data = await res.json();
      if (data.active && data.session) {
        setActiveSession(data.session);
      } else {
        setActiveSession(null);
      }
    } catch (e) {
      console.warn('Error fetching active quiz session:', e);
    }
  };

  const fetchPresets = async () => {
    setIsLoadingPresets(true);
    try {
      const res = await fetch('/api/quiz/presets');
      const data = await res.json();
      if (data.presets) {
        setPresets(data.presets);
      }
    } catch (e) {
      console.warn('Error fetching quiz presets:', e);
    } finally {
      setIsLoadingPresets(false);
    }
  };

  useEffect(() => {
    fetchActiveQuiz();
    fetchPresets();
    const interval = setInterval(fetchActiveQuiz, 3000);
    return () => clearInterval(interval);
  }, []);

  // Timer loop for playing state
  useEffect(() => {
    if (viewMode === 'playing' && !isAnswerSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewMode, currentQIndex, isAnswerSubmitted]);

  const handleTimeUp = () => {
    if (isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const q = currentQuestions[currentQIndex];
    const timeSpent = q.timeLimitSec;
    // Timeout registered as no answer or incorrect
    setUserAnswers((prev) => [
      ...prev,
      { questionIndex: currentQIndex, selectedOption: -1, timeTakenSec: timeSpent }
    ]);
  };

  // --- Student Actions ---
  const handleJoinByPin = async (pinToUse?: string) => {
    const pin = (pinToUse || pinInput).trim();
    if (!pin || pin.length !== 6) {
      setJoinError(language === 'hi' ? 'कृपया मान्य 6-अंकीय पिन दर्ज करें' : 'Please enter a valid 6-digit PIN code');
      return;
    }

    setJoinError('');
    try {
      const res = await fetch('/api/quiz/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          studentName: userName || 'Rahul S. (You)',
          studentEmail: userEmail || 'rahul.class6@school.edu',
          studentGrade: userGrade || 'Class 6B'
        })
      });
      const data = await res.json();
      if (res.ok && data.session) {
        setActiveSession(data.session);
        setCurrentQuestions(data.session.questions);
        if (data.session.status === 'in_progress') {
          startPlayingQuiz(data.session.questions);
        } else {
          setViewMode('lobby');
        }
      } else {
        setJoinError(data.error || 'Quiz room not found. Check PIN with your teacher.');
      }
    } catch (e) {
      setJoinError('Network error joining room.');
    }
  };

  const startSoloPractice = (presetKey: string) => {
    const preset = presets[presetKey];
    if (!preset) return;
    setCurrentQuestions(preset.questions);
    startPlayingQuiz(preset.questions);
  };

  const startPlayingQuiz = (questions: QuizQuestion[]) => {
    setCurrentQuestions(questions);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setStreakCount(0);
    setScoreAccumulator(0);
    setQuizStartTime(Date.now());
    setCurrentQStartTime(Date.now());
    setTimeLeft(questions[0]?.timeLimitSec || 30);
    setViewMode('playing');
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
    setIsAnswerSubmitted(true);

    const q = currentQuestions[currentQIndex];
    const timeSpent = Math.max(1, Math.round((Date.now() - currentQStartTime) / 1000));
    const isCorrect = index === q.correctIndex;

    if (isCorrect) {
      const speedBonus = Math.max(0, 30 - timeSpent);
      const points = 100 + speedBonus;
      setScoreAccumulator((prev) => prev + points);
      setStreakCount((prev) => prev + 1);
    } else {
      setStreakCount(0);
    }

    setUserAnswers((prev) => [
      ...prev,
      { questionIndex: currentQIndex, selectedOption: index, timeTakenSec: timeSpent }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < currentQuestions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setCurrentQStartTime(Date.now());
      setTimeLeft(currentQuestions[nextIdx]?.timeLimitSec || 30);
    } else {
      finishAndSubmitQuiz();
    }
  };

  const finishAndSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: userName || 'Rahul S. (You)',
          studentEmail: userEmail || 'rahul.class6@school.edu',
          studentGrade: userGrade || 'Class 6B',
          answers: userAnswers,
          quizTitle: activeSession?.title || 'STEM Interactive Sprint',
          timeSpentSec: totalTime
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setFinalResult(data.result);
        setViewMode('results');
      }
    } catch (e) {
      console.error('Error submitting quiz answers:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Teacher Actions ---
  const handleHostPreset = async (presetKey: string) => {
    try {
      const res = await fetch('/api/quiz/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetKey,
          teacherName: userName || 'STEM Faculty'
        })
      });
      const data = await res.json();
      if (data.success && data.session) {
        setActiveSession(data.session);
        setViewMode('teacher_host');
      }
    } catch (e) {
      console.error('Error creating quiz room:', e);
    }
  };

  const handleGenerateAiQuiz = async () => {
    if (!aiTopic.trim()) return;
    setIsGeneratingAi(true);
    setAiGenerationStatus(
      language === 'hi'
        ? 'सर्वम एआई / जेमिनी से एसटीईएम प्रश्न तैयार किए जा रहे हैं...'
        : 'Generating curriculum-aligned questions using Sarvam AI & Gemini...'
    );

    try {
      const res = await fetch('/api/quiz/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          grade: aiGrade,
          questionCount: 4,
          language
        })
      });
      const data = await res.json();
      if (data.success && data.quiz) {
        // Create session with custom questions
        const createRes = await fetch('/api/quiz/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${aiTopic} Live Challenge`,
            topic: aiTopic,
            grade: aiGrade,
            teacherName: userName || 'STEM Faculty',
            customQuestions: data.quiz.questions
          })
        });
        const createData = await createRes.json();
        if (createData.session) {
          setActiveSession(createData.session);
          setViewMode('teacher_host');
        }
      }
    } catch (e) {
      console.error('Error generating AI quiz:', e);
    } finally {
      setIsGeneratingAi(false);
      setAiGenerationStatus('');
    }
  };

  const handleStartLiveQuizForClass = async () => {
    if (!activeSession) return;
    try {
      await fetch('/api/quiz/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress', currentQuestionIndex: 0 })
      });
      fetchActiveQuiz();
    } catch (e) {
      console.error('Error starting live quiz:', e);
    }
  };

  const handleEndQuizSession = async () => {
    try {
      await fetch('/api/quiz/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      fetchActiveQuiz();
      setViewMode('hub');
    } catch (e) {
      console.error('Error ending quiz session:', e);
    }
  };

  const copyRoomPin = () => {
    if (activeSession?.pin) {
      navigator.clipboard.writeText(activeSession.pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  // Helper for localized text
  const getQText = (obj: any) => {
    if (!obj) return '';
    return obj[language] || obj['en'] || '';
  };

  // ==========================================
  // RENDER: PLAYING VIEW (Live Question)
  // ==========================================
  if (viewMode === 'playing' && currentQuestions.length > 0) {
    const q = currentQuestions[currentQIndex];
    const isLastQ = currentQIndex === currentQuestions.length - 1;
    const progressPct = Math.round(((currentQIndex + 1) / currentQuestions.length) * 100);
    const timerPct = Math.round((timeLeft / (q.timeLimitSec || 30)) * 100);

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fadeIn">
        {/* Top Quiz Header bar */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-4 mb-6 shadow-[3px_3px_0px_#1a1a1a] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#5e43ff] text-white font-mono text-xs font-bold rounded-xl border border-[#1a1a1a]">
              Q {currentQIndex + 1}/{currentQuestions.length}
            </span>
            <span className="font-mono text-sm font-extrabold text-[#1a1a1a]">
              {activeSession?.title || 'STEM Challenge'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Multiplier */}
            {streakCount > 1 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 border border-amber-400 text-amber-900 rounded-xl text-xs font-bold font-mono animate-bounce">
                🔥 {streakCount}x Streak
              </div>
            )}

            {/* Score Points Counter */}
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold font-mono">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              {scoreAccumulator} XP
            </div>

            {/* Timer Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
              timeLeft <= 5 ? 'bg-rose-500 text-white animate-pulse border-rose-700' : 'bg-slate-100 text-[#1a1a1a] border-[#1a1a1a]'
            }`}>
              <Timer className="w-4 h-4" />
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="w-full bg-slate-100 rounded-full h-2 border border-[#1a1a1a] mb-6 overflow-hidden">
          <div 
            className="bg-[#5e43ff] h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_#1a1a1a] mb-6">
          <div className="text-xs font-mono font-bold text-[#5e43ff] uppercase tracking-wider mb-2">
            {language === 'hi' ? 'प्रश्न' : language === 'te' ? 'ప్రశ్న' : 'Question'} #{currentQIndex + 1}
          </div>

          <h2 className="text-lg md:text-2xl font-black text-[#1a1a1a] mb-4 leading-snug">
            {getQText(q.question)}
          </h2>

          {/* Optional Code Snippet or Circuit Pinout */}
          {q.codeSnippet && (
            <div className="bg-[#1e1e2e] text-emerald-400 p-4 rounded-xl font-mono text-xs md:text-sm mb-6 border-2 border-[#1a1a1a] shadow-inner overflow-x-auto">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">// STEM Logic / Code Block</div>
              <pre className="whitespace-pre">{q.codeSnippet}</pre>
            </div>
          )}

          {/* 4 Multiple Choice Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
            {(q.options[language] || q.options.en).map((optText: string, idx: number) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === q.correctIndex;
              
              let btnStyle = "bg-slate-50 hover:bg-slate-100 text-[#1a1a1a] border-slate-300 hover:border-[#1a1a1a]";
              
              if (isAnswerSubmitted) {
                if (isCorrectAnswer) {
                  btnStyle = "bg-emerald-500 text-white border-emerald-700 shadow-[2px_2px_0px_#065f46]";
                } else if (isSelected && !isCorrectAnswer) {
                  btnStyle = "bg-rose-500 text-white border-rose-700 shadow-[2px_2px_0px_#9f1239]";
                } else {
                  btnStyle = "bg-slate-50 text-slate-400 border-slate-200 opacity-60";
                }
              } else if (isSelected) {
                btnStyle = "bg-[#5e43ff] text-white border-[#1a1a1a]";
              }

              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border-2 font-mono text-left text-sm md:text-base font-bold transition-all duration-150 flex items-start gap-3 relative cursor-pointer ${btnStyle}`}
                >
                  <span className={`w-7 h-7 rounded-lg border-2 border-[#1a1a1a] flex items-center justify-center text-xs font-black shrink-0 ${
                    isSelected ? 'bg-amber-300 text-[#1a1a1a]' : 'bg-white text-[#1a1a1a]'
                  }`}>
                    {letters[idx]}
                  </span>
                  <span className="flex-1 mt-0.5">{optText}</span>
                  {isAnswerSubmitted && isCorrectAnswer && (
                    <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate Pedagogical Explanation */}
          {isAnswerSubmitted && (
            <div className={`p-4 rounded-xl border-2 mb-4 animate-fadeIn ${
              selectedOption === q.correctIndex 
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900' 
                : 'bg-amber-50 border-amber-400 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs md:text-sm font-mono mb-1">
                {selectedOption === q.correctIndex ? (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    {language === 'hi' ? 'सही उत्तर! शानदार!' : 'Correct! Well done!'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-800">
                    <AlertCircle className="w-4 h-4" />
                    {language === 'hi' ? 'सीखने का अवसर:' : 'Concept Explanation:'}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm leading-relaxed">
                {getQText(q.explanation)}
              </p>
            </div>
          )}

          {/* Action button */}
          {isAnswerSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#5e43ff] hover:bg-[#4b32ea] text-white font-mono text-sm font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {language === 'hi' ? 'परिणाम सहेजा जा रहा है...' : 'Calculating XP...'}
                  </>
                ) : isLastQ ? (
                  <>
                    <Trophy className="w-4 h-4 text-amber-300" />
                    {language === 'hi' ? 'क्विज़ समाप्त करें और अंक जोड़ें' : 'Finish Quiz & Update Leaderboard'}
                  </>
                ) : (
                  <>
                    {language === 'hi' ? 'अगला प्रश्न' : 'Next Question'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: RESULTS VIEW
  // ==========================================
  if (viewMode === 'results' && finalResult) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fadeIn text-center">
        <div className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-6 md:p-10 shadow-[6px_6px_0px_#1a1a1a]">
          {/* Trophy Header */}
          <div className="w-20 h-20 bg-amber-100 border-2 border-[#1a1a1a] rounded-full mx-auto flex items-center justify-center mb-4 shadow-[2px_2px_0px_#1a1a1a] animate-bounce">
            <Trophy className="w-10 h-10 text-amber-600" />
          </div>

          <span className="px-3 py-1 bg-emerald-100 border border-emerald-400 text-emerald-800 rounded-full font-mono text-xs font-black uppercase tracking-wider mb-2 inline-block">
            Quiz Completed!
          </span>

          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-2">
            +{finalResult.score} XP Earned!
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-mono mb-6">
            {language === 'hi'
              ? 'आपके अंक छात्र लीडरबोर्ड में सफलतापूर्वक जुड़ गए हैं!'
              : 'Your test results have been registered and points added to the leaderboard!'}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6 font-mono">
            <div className="bg-amber-50 border-2 border-[#1a1a1a] p-3 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Rank Preview</div>
              <div className="text-lg md:text-xl font-black text-amber-600">#{finalResult.newRank}</div>
            </div>
            <div className="bg-indigo-50 border-2 border-[#1a1a1a] p-3 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Accuracy</div>
              <div className="text-lg md:text-xl font-black text-[#5e43ff]">{finalResult.accuracy}%</div>
            </div>
            <div className="bg-emerald-50 border-2 border-[#1a1a1a] p-3 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Total XP</div>
              <div className="text-lg md:text-xl font-black text-emerald-600">{finalResult.totalPoints}</div>
            </div>
          </div>

          {/* Badges Earned */}
          {finalResult.badgesEarned && finalResult.badgesEarned.length > 0 && (
            <div className="mb-6 bg-slate-50 border border-slate-300 p-4 rounded-2xl">
              <div className="text-xs font-mono font-bold text-slate-600 mb-2">Unlocked Badges:</div>
              <div className="flex flex-wrap justify-center gap-2">
                {finalResult.badgesEarned.map((b: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-[#1a1a1a] rounded-xl text-xs font-mono font-bold shadow-[1px_1px_0px_#1a1a1a]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 font-mono">
            <button
              onClick={() => onOpenLeaderboard()}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-[#1a1a1a] font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <Trophy className="w-4 h-4" />
              {language === 'hi' ? '🏆 लीडरबोर्ड देखें' : '🏆 View Student Leaderboard'}
            </button>
            <button
              onClick={() => setViewMode('hub')}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-[#1a1a1a] font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] transition-all"
            >
              {language === 'hi' ? 'होम पर वापस' : 'Back to Quiz Hub'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: TEACHER HOST LOBBY & LIVE CONTROLS
  // ==========================================
  if (viewMode === 'teacher_host' && activeSession) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fadeIn">
        {/* Host Control Card */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-6 md:p-8 shadow-[5px_5px_0px_#1a1a1a] mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-md text-[10px] font-mono font-black animate-pulse flex items-center gap-1">
                  <Radio className="w-3 h-3" /> LIVE ROOM
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Host: {activeSession.teacherName}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[#1a1a1a]">
                {activeSession.title}
              </h2>
            </div>

            {/* Big PIN Display */}
            <div className="bg-amber-50 border-2 border-[#1a1a1a] rounded-2xl px-5 py-3 text-center shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-3">
              <div>
                <div className="text-[10px] font-mono font-black text-slate-500 uppercase">Room PIN Code</div>
                <div className="text-2xl md:text-3xl font-mono font-black text-[#1a1a1a] tracking-widest">
                  {activeSession.pin}
                </div>
              </div>
              <button
                onClick={copyRoomPin}
                title="Copy PIN"
                className="p-2 border border-[#1a1a1a] rounded-xl bg-white hover:bg-amber-100 transition-all text-xs font-mono"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Participants in Lobby */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-sm font-extrabold text-[#1a1a1a] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5e43ff]" />
                Connected Students in Lobby ({activeSession.participants.length})
              </h3>
              <span className="text-xs font-mono text-slate-500 animate-pulse">
                Auto-syncing live...
              </span>
            </div>

            {activeSession.participants.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 font-mono">
                <p className="text-sm font-bold text-slate-600 mb-1">
                  Tell students to enter PIN <span className="bg-amber-200 px-2 py-0.5 rounded text-black font-black">{activeSession.pin}</span> on their screens!
                </p>
                <p className="text-xs text-slate-400">Waiting for class members to join the live sprint...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {activeSession.participants.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-indigo-50/70 border border-[#1a1a1a] rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-[1px_1px_0px_#1a1a1a] animate-fadeIn"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#5e43ff] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      {p.studentName.charAt(0)}
                    </span>
                    <span className="truncate">{p.studentName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Host Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-slate-100 font-mono">
            <button
              onClick={handleEndQuizSession}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 rounded-xl text-xs font-bold transition-all"
            >
              End Room Session
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('hub')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1a1a1a] border border-[#1a1a1a] rounded-xl text-xs font-bold"
              >
                Minimize Room
              </button>

              <button
                onClick={handleStartLiveQuizForClass}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-[#1a1a1a] rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-2 hover:-translate-y-0.5 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Live Quiz for Class
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN QUIZ HUB (Default View)
  // ==========================================
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#5e43ff] to-[#4323c9] text-white border-2 border-[#1a1a1a] rounded-3xl p-6 md:p-8 shadow-[5px_5px_0px_#1a1a1a] mb-8 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-xs font-mono font-bold mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            {language === 'hi' ? 'लाइव एसटीईएम क्विज़ और लीडरबोर्ड' : 'Live STEM Quizzes & Real-Time XP'}
          </div>

          <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">
            {language === 'hi' ? '🎯 शिक्षा साथी लाइव क्विज़ हब' : '🎯 Shiksha Sathi Live Quiz Arena'}
          </h1>
          <p className="text-xs md:text-sm text-indigo-100 font-mono leading-relaxed mb-6">
            {language === 'hi'
              ? 'शिक्षक लाइव क्विज़ शुरू कर सकते हैं, छात्र कोड के साथ जुड़ सकते हैं, और सही उत्तर देने पर तुरंत अंक प्राप्त कर लीडरबोर्ड पर आगे बढ़ सकते हैं।'
              : 'Teachers host interactive live sprints, students connect instantly via Room PIN, earn speed and accuracy XP, and climb the school-wide STEM leaderboard!'}
          </p>

          <div className="flex flex-wrap gap-3 font-mono">
            <button
              onClick={onOpenLeaderboard}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#1a1a1a] font-black text-xs md:text-sm rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-2 hover:-translate-y-0.5 transition-all"
            >
              <Trophy className="w-4 h-4" />
              {language === 'hi' ? '🏆 छात्र लीडरबोर्ड देखें' : '🏆 View Student Leaderboard'}
            </button>

            {activeSession && (
              <button
                onClick={() => handleJoinByPin(activeSession.pin)}
                className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-[#1a1a1a] font-black text-xs md:text-sm rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-2 animate-pulse hover:-translate-y-0.5 transition-all"
              >
                <Radio className="w-4 h-4 text-emerald-900" />
                {language === 'hi' ? `⚡ लाइव क्लास में जुड़ें (PIN: ${activeSession.pin})` : `⚡ Quick Join Active Class (PIN: ${activeSession.pin})`}
              </button>
            )}
          </div>
        </div>

        {/* Decorative Graphic */}
        <div className="absolute right-4 -bottom-4 opacity-15 md:opacity-25 pointer-events-none">
          <Trophy className="w-64 h-64 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Join Box */}
        <div className="lg:col-span-1 space-y-6">
          {/* Join with PIN Card */}
          <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[4px_4px_0px_#1a1a1a]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-amber-400 border border-[#1a1a1a] flex items-center justify-center text-sm font-black">
                🔑
              </span>
              <h2 className="font-mono text-base font-extrabold text-[#1a1a1a]">
                {language === 'hi' ? 'क्विज़ रूम में जुड़ें' : 'Join Live Class Quiz'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-mono mb-4">
              {language === 'hi'
                ? 'अपने शिक्षक द्वारा दिया गया 6-अंकीय पिन दर्ज करें:'
                : 'Enter the 6-digit Room PIN provided by your teacher on the board:'}
            </p>

            <div className="space-y-3 font-mono">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, ''));
                    setJoinError('');
                  }}
                  placeholder="e.g. 592814"
                  className="w-full text-center text-2xl font-black tracking-widest px-4 py-3 bg-slate-50 border-2 border-[#1a1a1a] rounded-xl outline-none focus:bg-amber-50 focus:border-[#5e43ff] transition-all"
                />
                {joinError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {joinError}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleJoinByPin()}
                className="w-full py-3 bg-[#5e43ff] hover:bg-[#4b32ea] text-white font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                {language === 'hi' ? 'क्विज़ शुरू करें' : 'Join & Start Sprint'}
              </button>
            </div>

            {/* Active Class Indicator */}
            {activeSession ? (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-mono text-emerald-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Active: {activeSession.title}
                </span>
                <span className="font-mono font-black bg-white px-2 py-0.5 rounded border border-emerald-400">
                  {activeSession.pin}
                </span>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-500 text-center">
                ℹ️ No live teacher room currently broadcasting. You can practice solo quizzes below!
              </div>
            )}
          </div>

          {/* Teacher Hosting Quick Card */}
          {userRole === 'teacher' && (
            <div className="bg-amber-50 border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[4px_4px_0px_#1a1a1a]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-xl bg-[#5e43ff] text-white border border-[#1a1a1a] flex items-center justify-center text-sm font-black">
                  👨‍🏫
                </span>
                <h3 className="font-mono text-sm font-extrabold text-[#1a1a1a]">
                  {language === 'hi' ? 'शिक्षक नियंत्रण: एआई क्विज़ बनाएं' : 'Host Custom AI Quiz'}
                </h3>
              </div>
              <p className="text-xs text-slate-600 font-mono mb-4">
                Generate tailored STEM questions using <strong>{selectedModel}</strong> and host live.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block font-bold text-[#1a1a1a] mb-1">Topic / Curriculum Concept:</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g., Ultrasonic Sensor Sonar, Python Loops"
                    className="w-full px-3 py-2 bg-white border border-[#1a1a1a] rounded-xl outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1a1a1a] mb-1">Target Grade:</label>
                  <select
                    value={aiGrade}
                    onChange={(e) => setAiGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#1a1a1a] rounded-xl outline-none text-xs"
                  >
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateAiQuiz}
                  disabled={isGeneratingAi}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-[#1a1a1a] font-black rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] transition-all flex items-center justify-center gap-2"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      🚀 Generate & Launch Room
                    </>
                  )}
                </button>

                {aiGenerationStatus && (
                  <p className="text-[10px] font-mono text-amber-900 animate-pulse">
                    {aiGenerationStatus}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Curated STEM Quizzes & Solo Sprints */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-base font-extrabold text-[#1a1a1a] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#5e43ff]" />
              {language === 'hi' ? 'पाठ्यक्रम आधारित क्विज़ संग्रह' : 'Curated STEM Quizzes & Solo Sprints'}
            </h2>
            <span className="text-xs font-mono text-slate-500">
              {Object.keys(presets).length} modules available
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 font-mono">
            {/* Module 1: Scratch Logic Sprint */}
            <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-5 shadow-[3px_3px_0px_#1a1a1a] hover:border-[#5e43ff] transition-all">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-[#5e43ff] border border-[#1a1a1a] flex items-center justify-center text-xs font-black">
                    🐱
                  </span>
                  <div>
                    <h3 className="font-bold text-sm md:text-base text-[#1a1a1a]">
                      Scratch Logic & Loop Sprint
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Topic: Scratch 3.0, Conditionals, Broadcast Signals & Coordinates
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-[10px] font-bold">
                  Class 5-7 • 4 Questions • 400 XP
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Test understanding of repeat until loops, X/Y Cartesian coordinates, broadcast messaging, and memory variables in visual block programming.
              </p>

              <div className="flex flex-wrap items-center justify-end gap-2.5">
                {userRole === 'teacher' && (
                  <button
                    onClick={() => handleHostPreset('scratch-logic')}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#1a1a1a] rounded-xl text-xs font-extrabold border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-1.5 transition-all"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    🚀 Host Live for Class
                  </button>
                )}
                <button
                  onClick={() => startSoloPractice('scratch-logic')}
                  className="px-4 py-2 bg-[#5e43ff] hover:bg-[#4b32ea] text-white rounded-xl text-xs font-bold border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {language === 'hi' ? 'प्रैक्टिस शुरू करें' : 'Start Solo Sprint'}
                </button>
              </div>
            </div>

            {/* Module 2: Robotics & Arduino Circuits */}
            <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-5 shadow-[3px_3px_0px_#1a1a1a] hover:border-[#5e43ff] transition-all">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 border border-[#1a1a1a] flex items-center justify-center text-xs font-black">
                    🔌
                  </span>
                  <div>
                    <h3 className="font-bold text-sm md:text-base text-[#1a1a1a]">
                      Robotics, Sensors & Arduino Circuits
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Topic: LED Current Limiting, HC-SR04 Sonar & pinMode Setup
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-[10px] font-bold">
                  Class 6-8 • 3 Questions • 300 XP
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Hardware diagnostic questions covering Ohm's Law resistors, ultrasonic echo sound physics, and void setup vs void loop routines.
              </p>

              <div className="flex flex-wrap items-center justify-end gap-2.5">
                {userRole === 'teacher' && (
                  <button
                    onClick={() => handleHostPreset('robotics-circuits')}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#1a1a1a] rounded-xl text-xs font-extrabold border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-1.5 transition-all"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    🚀 Host Live for Class
                  </button>
                )}
                <button
                  onClick={() => startSoloPractice('robotics-circuits')}
                  className="px-4 py-2 bg-[#5e43ff] hover:bg-[#4b32ea] text-white rounded-xl text-xs font-bold border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {language === 'hi' ? 'प्रैक्टिस शुरू करें' : 'Start Solo Sprint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
