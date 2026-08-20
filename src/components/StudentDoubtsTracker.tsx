import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Search, 
  Filter, 
  Sparkles, 
  MessageSquare, 
  AlertCircle, 
  ChevronRight, 
  Check, 
  Trash2, 
  RotateCcw, 
  PlusCircle, 
  GraduationCap, 
  BookOpen, 
  Cpu, 
  Tag, 
  Send,
  Lightbulb,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Flame,
  AlertTriangle
} from 'lucide-react';

export interface StudentDoubt {
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

interface StudentDoubtsTrackerProps {
  language: 'en' | 'hi' | 'te';
  onAskAI: (query: string) => void;
  currentUserRole?: 'teacher' | 'student' | null;
  onSwitchToStudent?: () => void;
}

export default function StudentDoubtsTracker({
  language,
  onAskAI,
  currentUserRole,
  onSwitchToStudent
}: StudentDoubtsTrackerProps) {
  const [doubts, setDoubts] = useState<StudentDoubt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'flagged' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(null);
  
  // Teacher note editor state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);

  // Quick simulated doubt modal for testing
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [simName, setSimName] = useState<string>('Aarav Mehta');
  const [simGrade, setSimGrade] = useState<string>('Class 6B');
  const [simDoubt, setSimDoubt] = useState<string>('Why is my servo motor vibrating continuously without moving?');
  const [simCategory, setSimCategory] = useState<'coding' | 'hardware' | 'logic' | 'general' | 'non_academic'>('hardware');
  const [simIsFlagged, setSimIsFlagged] = useState<boolean>(false);
  const [simFlagReason, setSimFlagReason] = useState<string>('');

  const translations = {
    en: {
      trackerTitle: "Student Doubts & Safety Hub",
      trackerSubtitle: "Real-time log of questions, academic doubts, and auto-flagged non-educational queries.",
      searchPlaceholder: "Search by student name, topic, or keyword...",
      filterAll: "All Inquiries",
      filterPending: "Needs Review",
      filterFlagged: "⚠️ Flagged (Non-Academic)",
      filterResolved: "Resolved",
      statTotal: "Total Inquiries",
      statPending: "Action Needed",
      statFlagged: "Reported Off-Topic",
      statResolved: "Resolved",
      resolvedBadge: "Resolved",
      pendingBadge: "Needs Attention",
      flaggedBadge: "Reported to Teacher",
      askedAt: "Asked",
      studentLabel: "Student",
      gradeLabel: "Grade",
      aiExplanationLabel: "AI Sathi's Response",
      teacherNoteLabel: "Teacher's Remarks & Disciplinary Notes",
      addTeacherNote: "Add Teacher Remark / Action",
      saveNote: "Save Remark",
      cancel: "Cancel",
      markResolved: "Mark as Handled",
      markUnresolved: "Reopen Inquiry",
      remedyBtn: "Generate Class Remedial Plan",
      quizBtn: "Create Quick Quiz for this Doubt",
      simulateBtn: "+ Test Student Doubt / Violation",
      noDoubtsFound: "No doubts found matching your filters.",
      emptyStateTip: "When students ask questions in the chat, academic questions and flagged non-educational queries appear here instantly.",
      deleteConfirm: "Delete this record?",
      unflagBtn: "Clear Flag",
      categories: {
        all: "All Categories",
        coding: "Coding & Syntax",
        hardware: "Hardware & Wires",
        logic: "Logic & Loops",
        general: "General Concepts",
        non_academic: "⚠️ Non-Academic Off-Topic"
      }
    },
    hi: {
      trackerTitle: "छात्र प्रश्न व सुरक्षा केंद्र",
      trackerSubtitle: "छात्रों के प्रश्नों, शैक्षणिक शंकाओं और गैर-शैक्षणिक उल्लंघनों का रीयल-टाइम रिकॉर्ड।",
      searchPlaceholder: "छात्र का नाम, विषय या प्रश्न खोजें...",
      filterAll: "सभी प्रश्न",
      filterPending: "सुलझाना बाकी",
      filterFlagged: "⚠️ गैर-शैक्षणिक रिपोर्ट",
      filterResolved: "सुलझा लिए गए",
      statTotal: "कुल प्रश्न",
      statPending: "समीक्षा आवश्यक",
      statFlagged: "शिक्षक को रिपोर्टेड",
      statResolved: "सुलझे हुए",
      resolvedBadge: "सुलझ गया",
      pendingBadge: "ध्यान देने योग्य",
      flaggedBadge: "शिक्षक को रिपोर्टेड",
      askedAt: "पूछा गया",
      studentLabel: "छात्र",
      gradeLabel: "कक्षा",
      aiExplanationLabel: "एआई साथी का उत्तर",
      teacherNoteLabel: "शिक्षक की टिप्पणी (Teacher Notes)",
      addTeacherNote: "शिक्षक टिप्पणी जोड़ें",
      saveNote: "टिप्पणी सहेजें",
      cancel: "रद्द करें",
      markResolved: "सुलझा हुआ चिह्नित करें",
      markUnresolved: "पुनः खोलें",
      remedyBtn: "उपचारात्मक पाठ बनाएं",
      quizBtn: "त्वरित क्विज़ बनाएं",
      simulateBtn: "+ छात्र प्रश्न/उल्लंघन टेस्ट करें",
      noDoubtsFound: "कोई प्रश्न नहीं मिला।",
      emptyStateTip: "जब छात्र चैट में प्रश्न पूछेंगे, तो वे तुरंत यहाँ दिखाई देंगे।",
      deleteConfirm: "क्या आप इस प्रश्न को हटाना चाहते हैं?",
      unflagBtn: "फ्लैग हटाएं",
      categories: {
        all: "सभी श्रेणियां",
        coding: "कोडिंग और सिंटैक्स",
        hardware: "हार्डवेयर और तार",
        logic: "लॉजिक और लूप",
        general: "सामान्य अवधारणाएं",
        non_academic: "⚠️ गैर-शैक्षणिक प्रश्न"
      }
    },
    te: {
      trackerTitle: "విద్యార్థుల సందేహాలు & భద్రతా హబ్",
      trackerSubtitle: "తరగతి గదుల్లో విద్యార్థుల ప్రశ్నలు మరియు అనధికారిక ప్రశ్నల రికార్డు.",
      searchPlaceholder: "విద్యార్థి పేరు లేదా అంశం ద్వారా శోధించండి...",
      filterAll: "అన్ని సందేహాలు",
      filterPending: "పరిశీలన అవసరం",
      filterFlagged: "⚠️ నివేదించబడిన ప్రశ్నలు",
      filterResolved: "పరిష్కరించబడింది",
      statTotal: "మొత్తం సందేహాలు",
      statPending: "చర్య అవసరం",
      statFlagged: "నివేదించబడినవి",
      statResolved: "పరిష్కరించబడింది",
      resolvedBadge: "పరిష్కరించబడింది",
      pendingBadge: "శ్రద్ధ అవసరం",
      flaggedBadge: "ఉపాధ్యాయునికి నివేదించబడింది",
      askedAt: "సమయం",
      studentLabel: "విద్యార్థి",
      gradeLabel: "తరగతి",
      aiExplanationLabel: "AI సాథి సమాధానం",
      teacherNoteLabel: "ఉపాధ్యాయుల గమనికలు",
      addTeacherNote: "వ్యాఖ్యను జోడించండి",
      saveNote: "సేవ్ చేయండి",
      cancel: "రద్దు చేయి",
      markResolved: "పరిష్కరించినట్లు గుర్తించండి",
      markUnresolved: "తిరిగి తెరవండి",
      remedyBtn: "నివారణ ప్రణాళికను రూపొందించండి",
      quizBtn: "క్విజ్ సృష్టించండి",
      simulateBtn: "+ విద్యార్థి సందేహాన్ని పరీక్షించండి",
      noDoubtsFound: "సందేహాలు ఏవీ కనుగొనబడలేదు.",
      emptyStateTip: "విద్యార్థులు చాట్‌లో ప్రశ్నలు అడిగినప్పుడు, అవి ఇక్కడ కనిపిస్తాయి.",
      deleteConfirm: "ఈ సందేహాన్ని తొలగించాలా?",
      unflagBtn: "ఫ్లాగ్ తొలగించు",
      categories: {
        all: "అన్ని వర్గాలు",
        coding: "కోడింగ్ & సింటాక్స్",
        hardware: "హార్డ్‌వేర్ & వైర్లు",
        logic: "లాజిక్ & లూప్‌లు",
        general: "సాధారణ అంశాలు",
        non_academic: "⚠️ విద్యాసంబంధం కానివి"
      }
    }
  };

  const t = translations[language] || translations.en;

  // Fetch doubts from API
  const fetchDoubts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/doubts');
      if (res.ok) {
        const data = await res.json();
        setDoubts(data.doubts || []);
      }
    } catch (err) {
      console.warn('[Doubts Tracker] Could not sync doubts from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
    const interval = setInterval(fetchDoubts, 8000);
    return () => clearInterval(interval);
  }, []);

  // Toggle resolve status
  const handleToggleResolve = async (doubtId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/doubts/${doubtId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: !currentStatus })
      });
      if (res.ok) {
        setDoubts(prev => prev.map(d => d.id === doubtId ? { ...d, isResolved: !currentStatus } : d));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Unflag a reported inquiry
  const handleToggleFlag = async (doubtId: string, currentFlag: boolean) => {
    try {
      const res = await fetch(`/api/doubts/${doubtId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlagged: !currentFlag })
      });
      if (res.ok) {
        setDoubts(prev => prev.map(d => d.id === doubtId ? { ...d, isFlagged: !currentFlag } : d));
      }
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    }
  };

  // Save teacher note
  const handleSaveNote = async (doubtId: string) => {
    try {
      setSavingNote(true);
      const res = await fetch(`/api/doubts/${doubtId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherNotes: noteText })
      });
      if (res.ok) {
        setDoubts(prev => prev.map(d => d.id === doubtId ? { ...d, teacherNotes: noteText } : d));
        setEditingNoteId(null);
        setNoteText('');
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete doubt
  const handleDeleteDoubt = async (doubtId: string) => {
    try {
      const res = await fetch(`/api/doubts/${doubtId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDoubts(prev => prev.filter(d => d.id !== doubtId));
      }
    } catch (err) {
      console.error('Failed to delete doubt:', err);
    }
  };

  // Simulate new student doubt or non-academic violation
  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simDoubt.trim()) return;

    try {
      const res = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: simName.trim() || 'Student',
          studentGrade: simGrade.trim() || 'Class 6',
          doubt: simDoubt.trim(),
          category: simCategory,
          isFlagged: simIsFlagged,
          flagReason: simFlagReason || (simIsFlagged ? 'Non-Educational Topic Inquiry' : undefined),
          topic: simIsFlagged ? `Flagged: ${simFlagReason || 'Off-Topic Activity'}` : (simCategory === 'hardware' ? 'Hardware & Sensors' : simCategory === 'coding' ? 'Programming Syntax' : 'Problem Solving'),
          aiResponse: simIsFlagged 
            ? '⚠️ Non-Academic Query Notice: Shiksha Sathi is an educational copilot. This non-academic inquiry was refused and reported to the teacher.'
            : `Shiksha Sathi analyzed this issue: For ${simDoubt.slice(0, 40)}..., ensure common wiring connections and supply voltage are verified.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDoubts(prev => [data.doubt, ...prev]);
        setShowSimulateModal(false);
        setSimDoubt('');
        setSimIsFlagged(false);
        setSimFlagReason('');
      }
    } catch (err) {
      console.error('Failed to simulate doubt:', err);
    }
  };

  // Ask AI for remedial plan based on doubt
  const handleGenerateRemedialPlan = (doubtItem: StudentDoubt) => {
    const prompt = language === 'hi'
      ? `मेरी कक्षा में छात्र ${doubtItem.studentName} (${doubtItem.studentGrade}) ने यह शंका पूछी है: "${doubtItem.doubt}"। कृपया पूरी कक्षा को यह विषय सरल गतिविधि और सादृश्य (analogy) के माध्यम से समझाने के लिए 10 मिनट की उपचारात्मक शिक्षण योजना (Remedial Lesson) बनाएं।`
      : language === 'te'
      ? `నా తరగతిలో విద్యార్థి ${doubtItem.studentName} (${doubtItem.studentGrade}) ఈ సందేహం అడిగారు: "${doubtItem.doubt}"। దయచేసి మొత్తం తరగతికి ఈ భావనను సులభంగా బోధించడానికి 10 నిమిషాల నివారణ ప్రణాళికను రూపొందించండి.`
      : `In my class, student ${doubtItem.studentName} (${doubtItem.studentGrade}) asked: "${doubtItem.doubt}". Please create a 10-minute micro-remedial teaching plan with a relatable analogy and classroom exercise so I can explain this to the entire class.`;
    
    onAskAI(prompt);
  };

  // Ask AI for quiz based on doubt
  const handleGenerateQuiz = (doubtItem: StudentDoubt) => {
    const prompt = language === 'hi'
      ? `छात्र की शंका "${doubtItem.doubt}" के आधार पर ${doubtItem.studentGrade} के लिए 3 सरल और रोचक बहुविकल्पीय प्रश्न (MCQs) उत्तर और व्याख्या सहित तैयार करें।`
      : language === 'te'
      ? `విద్యార్థి సందేహం "${doubtItem.doubt}" ఆధారంగా ${doubtItem.studentGrade} కోసం సమాధానాలతో 3 చిన్న క్విజ్ ప్రశ్నలను (MCQs) రూపొందించండి.`
      : `Based on the student doubt: "${doubtItem.doubt}", generate 3 engaging multiple-choice classroom check questions (MCQs) with answers and explanations for ${doubtItem.studentGrade}.`;
    
    onAskAI(prompt);
  };

  // Filtered doubts
  const filteredDoubts = doubts.filter(item => {
    // Status filter
    if (statusFilter === 'pending' && item.isResolved) return false;
    if (statusFilter === 'resolved' && !item.isResolved) return false;
    if (statusFilter === 'flagged' && !item.isFlagged) return false;

    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchDoubt = item.doubt.toLowerCase().includes(q);
      const matchTopic = item.topic?.toLowerCase().includes(q) || false;
      const matchGrade = item.studentGrade.toLowerCase().includes(q);
      const matchReason = item.flagReason?.toLowerCase().includes(q) || false;
      if (!matchName && !matchDoubt && !matchTopic && !matchGrade && !matchReason) return false;
    }

    return true;
  });

  // Calculate statistics
  const totalCount = doubts.length;
  const pendingCount = doubts.filter(d => !d.isResolved && !d.isFlagged).length;
  const flaggedCount = doubts.filter(d => d.isFlagged && !d.isResolved).length;
  const resolvedCount = doubts.filter(d => d.isResolved).length;
  const totalTokensSaved = doubts.reduce((acc, d) => acc + (d.tokensSaved || 350), 0);

  return (
    <div id="student-doubts-hub" className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FDFBF7] space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border-3 border-[#1a1a1a] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e8e5ff] border-2 border-[#1a1a1a] rounded-full text-xs font-mono font-bold text-[#5e43ff] shadow-[2px_2px_0px_#1a1a1a]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5e43ff]" />
              <span>ACADEMIC GUARDRAIL ACTIVE</span>
            </div>
            {flaggedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 border-2 border-[#1a1a1a] rounded-full text-xs font-mono font-bold text-rose-700 animate-pulse shadow-[2px_2px_0px_#1a1a1a]">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>{flaggedCount} Flagged Off-Topic Inquiries</span>
              </span>
            )}
          </div>
          <h2 className="font-gaegu text-3xl md:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
            {t.trackerTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
            {t.trackerSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5e43ff] text-white font-mono text-xs md:text-sm font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:-translate-y-0.5 hover:bg-[#4d32f0] transition-all cursor-pointer"
            title="Add a test student doubt or violation"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.simulateBtn}</span>
          </button>
          
          <button
            onClick={fetchDoubts}
            className="p-2.5 bg-white text-[#1a1a1a] rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] hover:bg-slate-50 transition-all cursor-pointer"
            title="Refresh doubts list"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#5e43ff]' : ''}`} />
          </button>
        </div>

        {/* Subtle decorative background watermark */}
        <div className="absolute right-4 bottom-2 text-slate-100 select-none pointer-events-none -rotate-12 hidden lg:block">
          <ShieldAlert className="w-48 h-48 opacity-20" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-4 md:p-5 shadow-[4px_4px_0px_#1a1a1a]">
          <span className="font-mono text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
            {t.statTotal}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-gaegu text-4xl font-extrabold text-[#1a1a1a]">{totalCount}</span>
            <span className="text-xs text-slate-500 font-semibold font-mono">logged</span>
          </div>
        </div>

        <div className="bg-[#FFF3E0] border-2 border-[#1a1a1a] rounded-2xl p-4 md:p-5 shadow-[4px_4px_0px_#1a1a1a]">
          <span className="font-mono text-xs text-amber-900 font-bold uppercase tracking-wider block mb-1">
            {t.statPending}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-gaegu text-4xl font-extrabold text-[#E65100]">{pendingCount}</span>
            <span className="text-xs text-amber-800 font-semibold font-mono">academic</span>
          </div>
        </div>

        <div className={`border-2 border-[#1a1a1a] rounded-2xl p-4 md:p-5 shadow-[4px_4px_0px_#1a1a1a] ${
          flaggedCount > 0 ? 'bg-rose-100 ring-2 ring-rose-400' : 'bg-rose-50'
        }`}>
          <span className="font-mono text-xs text-rose-900 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            {t.statFlagged}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-gaegu text-4xl font-extrabold text-rose-700">{flaggedCount}</span>
            <span className="text-xs text-rose-800 font-semibold font-mono">violations</span>
          </div>
        </div>

        <div className="bg-[#E8F5E9] border-2 border-[#1a1a1a] rounded-2xl p-4 md:p-5 shadow-[4px_4px_0px_#1a1a1a]">
          <span className="font-mono text-xs text-emerald-900 font-bold uppercase tracking-wider block mb-1">
            {t.statResolved}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-gaegu text-4xl font-extrabold text-[#2E7D32]">{resolvedCount}</span>
            <span className="text-xs text-emerald-800 font-semibold font-mono">reviewed</span>
          </div>
        </div>
      </div>

      {/* Safety Guardrail Feature Card */}
      <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border-2 border-[#1a1a1a] rounded-2xl p-4 shadow-[4px_4px_0px_#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-[#1a1a1a] flex items-center justify-center shadow-[2px_2px_0px_#1a1a1a] shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#1a1a1a]" />
          </div>
          <div>
            <div className="font-bold text-xs md:text-sm text-[#1a1a1a] flex items-center gap-2">
              <span>Classroom Safety & Academic Guardrail Active</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-md border border-emerald-300">
                100% Guarded
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Only academic STEM doubts are answered. All off-topic inquiries (gaming, entertainment, gossip) are blocked and automatically reported to this teacher hub.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-[#1a1a1a]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Academic Safety Filter</span>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-4 shadow-[4px_4px_0px_#1a1a1a] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border-2 border-[#1a1a1a] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/30 font-medium transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Status Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border-2 border-[#1a1a1a]">
            {(['all', 'pending', 'flagged', 'resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  statusFilter === status
                    ? (status === 'flagged' ? 'bg-rose-600 text-white shadow-xs' : 'bg-[#1a1a1a] text-white shadow-xs')
                    : 'text-[#1a1a1a] hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? t.filterAll : 
                 status === 'pending' ? t.filterPending : 
                 status === 'flagged' ? t.filterFlagged : t.filterResolved}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-white border-2 border-[#1a1a1a] rounded-xl shadow-[2px_2px_0px_#1a1a1a] outline-none cursor-pointer"
          >
            <option value="all">{t.categories.all}</option>
            <option value="coding">{t.categories.coding}</option>
            <option value="hardware">{t.categories.hardware}</option>
            <option value="logic">{t.categories.logic}</option>
            <option value="general">{t.categories.general}</option>
            <option value="non_academic">{t.categories.non_academic}</option>
          </select>
        </div>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {filteredDoubts.length === 0 ? (
          <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-12 text-center shadow-[4px_4px_0px_#1a1a1a] space-y-4">
            <div className="w-16 h-16 bg-[#e8e5ff] border-2 border-[#1a1a1a] rounded-full mx-auto flex items-center justify-center shadow-[3px_3px_0px_#1a1a1a]">
              <HelpCircle className="w-8 h-8 text-[#5e43ff]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-gaegu text-2xl font-bold text-[#1a1a1a]">
                {t.noDoubtsFound}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium">
                {t.emptyStateTip}
              </p>
            </div>
            <button
              onClick={() => setShowSimulateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD54F] border-2 border-[#1a1a1a] rounded-xl text-xs font-mono font-bold shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.simulateBtn}</span>
            </button>
          </div>
        ) : (
          filteredDoubts.map((item) => {
            const isExpanded = expandedDoubtId === item.id;
            const isFlagged = item.isFlagged || item.category === 'non_academic';

            const categoryColor = 
              isFlagged ? 'bg-rose-100 text-rose-800 border-rose-300' :
              item.category === 'hardware' ? 'bg-[#DCEDC8] text-[#33691E]' :
              item.category === 'coding' ? 'bg-[#B3E5FC] text-[#01579B]' :
              item.category === 'logic' ? 'bg-[#FFE0B2] text-[#E65100]' :
              'bg-[#F3E5F5] text-[#6A1B9A]';

            return (
              <div 
                key={item.id}
                className={`bg-white border-2 rounded-2xl transition-all shadow-[4px_4px_0px_#1a1a1a] overflow-hidden ${
                  isFlagged 
                    ? 'border-rose-500 ring-2 ring-rose-300/60 bg-rose-50/20' 
                    : !item.isResolved ? 'border-[#1a1a1a] hover:border-[#5e43ff]' : 'border-[#1a1a1a] opacity-90'
                }`}
              >
                {/* Doubt Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left Side: Student avatar & question */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className={`w-10 h-10 rounded-xl border-2 border-[#1a1a1a] flex items-center justify-center font-bold font-mono text-sm shadow-[2px_2px_0px_#1a1a1a] shrink-0 mt-0.5 ${
                      isFlagged ? 'bg-rose-200 text-rose-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {isFlagged ? <ShieldAlert className="w-5 h-5 text-rose-700" /> : (item.studentName ? item.studentName.charAt(0).toUpperCase() : 'S')}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      {/* Name, Grade, Timestamp, Status & Category */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-[#1a1a1a]">
                          {item.studentName}
                        </span>
                        <span className="text-[11px] font-mono font-bold bg-slate-100 border border-[#1a1a1a]/40 px-2 py-0.5 rounded-md text-slate-700">
                          {item.studentGrade}
                        </span>
                        
                        {/* Category Badge */}
                        <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md border ${categoryColor}`}>
                          {isFlagged ? '⚠️ Non-Academic' : (item.category || 'General')}
                        </span>

                        {/* Status Badge */}
                        {isFlagged ? (
                          <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border border-rose-600 bg-rose-100 text-rose-800 flex items-center gap-1 animate-pulse">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>{t.flaggedBadge}</span>
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#1a1a1a] flex items-center gap-1 ${
                            item.isResolved 
                              ? 'bg-[#E8F5E9] text-[#2E7D32]' 
                              : 'bg-[#FFF3E0] text-[#E65100]'
                          }`}>
                            {item.isResolved ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
                                <span>{t.resolvedBadge}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-[#E65100]" />
                                <span>{t.pendingBadge}</span>
                              </>
                            )}
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-slate-400 ml-auto hidden sm:inline">
                          {item.timestamp}
                        </span>
                      </div>

                      {/* Flag Alert Warning if Non-Academic */}
                      {isFlagged && item.flagReason && (
                        <div className="bg-rose-100 border border-rose-300 p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800 font-mono">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Violation: {item.flagReason}</span>
                        </div>
                      )}

                      {/* The Doubt Text */}
                      <div className={`p-3 rounded-xl border ${
                        isFlagged 
                          ? 'bg-rose-50/80 border-rose-200' 
                          : 'bg-amber-50/70 border-amber-200/80'
                      }`}>
                        <p className="text-sm font-semibold text-[#1a1a1a] leading-relaxed">
                          "{item.doubt}"
                        </p>
                      </div>

                      {item.topic && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>Topic: <strong className="text-slate-700">{item.topic}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 md:self-center justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {/* Toggle Resolve Status Button */}
                    <button
                      onClick={() => handleToggleResolve(item.id, item.isResolved)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border-2 border-[#1a1a1a] transition-all ${
                        item.isResolved
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-[#C8E6C9] text-[#1B5E20] hover:bg-[#A5D6A7] shadow-[2px_2px_0px_#1a1a1a]'
                      }`}
                      title={item.isResolved ? t.markUnresolved : t.markResolved}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{item.isResolved ? t.markUnresolved : t.markResolved}</span>
                    </button>

                    {/* Expand/Collapse Details */}
                    <button
                      onClick={() => setExpandedDoubtId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-xl border-2 border-[#1a1a1a] bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                      title="View AI answer & teacher actions"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Delete Option */}
                    <button
                      onClick={() => {
                        if (confirm(t.deleteConfirm)) {
                          handleDeleteDoubt(item.id);
                        }
                      }}
                      className="p-1.5 rounded-xl border-2 border-transparent hover:border-[#1a1a1a] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Section: AI Answer, Remedial Plan, Notes */}
                {isExpanded && (
                  <div className="border-t-2 border-[#1a1a1a]/15 bg-slate-50/60 p-5 space-y-4 animate-fade-in">
                    
                    {/* AI's Instant Explanation Provided to Student */}
                    {item.aiResponse && (
                      <div className={`border-2 border-[#1a1a1a] rounded-xl p-4 space-y-2 shadow-xs ${
                        isFlagged ? 'bg-rose-50/60' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-2 text-xs font-mono font-bold ${
                            isFlagged ? 'text-rose-700' : 'text-[#5e43ff]'
                          }`}>
                            {isFlagged ? <ShieldAlert className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                            <span>{isFlagged ? 'AI Guardrail Refusal & Reporting Notice' : t.aiExplanationLabel}</span>
                          </div>
                        </div>
                        <p className={`text-xs md:text-sm font-medium leading-relaxed p-3 rounded-lg border ${
                          isFlagged 
                            ? 'text-rose-900 bg-rose-100/70 border-rose-200' 
                            : 'text-slate-700 bg-[#f6f5ff] border-[#5e43ff]/20'
                        }`}>
                          {item.aiResponse}
                        </p>
                      </div>
                    )}

                    {/* Teacher's Saved Notes or Note Editor */}
                    <div className="bg-white border-2 border-[#1a1a1a] rounded-xl p-4 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-900">
                          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                          <span>{t.teacherNoteLabel}</span>
                        </div>

                        {editingNoteId !== item.id && (
                          <button
                            onClick={() => {
                              setEditingNoteId(item.id);
                              setNoteText(item.teacherNotes || '');
                            }}
                            className="text-[11px] font-mono font-bold text-[#5e43ff] hover:underline cursor-pointer"
                          >
                            {item.teacherNotes ? 'Edit Remark' : '+ Add Remark'}
                          </button>
                        )}
                      </div>

                      {editingNoteId === item.id ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add classroom counseling / disciplinary remark, e.g., 'Discussed with student to keep queries focused on robotics.'"
                            className="w-full p-2.5 text-xs font-medium border-2 border-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/30 bg-amber-50/40"
                            rows={2}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingNoteId(null);
                                setNoteText('');
                              }}
                              className="px-3 py-1 text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              {t.cancel}
                            </button>
                            <button
                              onClick={() => handleSaveNote(item.id)}
                              disabled={savingNote}
                              className="px-3.5 py-1 bg-[#1a1a1a] text-white text-xs font-mono font-bold rounded-lg hover:bg-black transition-all cursor-pointer"
                            >
                              {savingNote ? 'Saving...' : t.saveNote}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                          {item.teacherNotes ? item.teacherNotes : "No teacher notes added yet."}
                        </p>
                      )}
                    </div>

                    {/* Teacher Action Triggers for Academic Doubts */}
                    {!isFlagged && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => handleGenerateRemedialPlan(item)}
                          className="flex items-center gap-2 px-3.5 py-2 bg-[#FFE0B2] text-[#E65100] text-xs font-mono font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>{t.remedyBtn}</span>
                        </button>

                        <button
                          onClick={() => handleGenerateQuiz(item)}
                          className="flex items-center gap-2 px-3.5 py-2 bg-[#B3E5FC] text-[#01579B] text-xs font-mono font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{t.quizBtn}</span>
                        </button>
                      </div>
                    )}

                    {/* Quick Unflag / Dismiss Flag button for teachers */}
                    {isFlagged && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-mono text-slate-500 font-semibold">
                          Recorded as classroom policy violation
                        </span>
                        <button
                          onClick={() => handleToggleFlag(item.id, true)}
                          className="px-3 py-1.5 bg-white border-2 border-[#1a1a1a] text-slate-700 text-xs font-mono font-bold rounded-xl shadow-[2px_2px_0px_#1a1a1a] hover:bg-slate-100 cursor-pointer"
                        >
                          {t.unflagBtn}
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Simulate Live Student Doubt & Non-Educational Violation */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border-3 border-[#1a1a1a] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[8px_8px_0px_#1a1a1a] space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b-2 border-[#1a1a1a]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#5e43ff]/10 border-2 border-[#1a1a1a] rounded-xl">
                  <HelpCircle className="w-5 h-5 text-[#5e43ff]" />
                </div>
                <h3 className="font-gaegu text-2xl font-bold text-[#1a1a1a]">
                  Test Student Intake & Guardrails
                </h3>
              </div>
              <button 
                onClick={() => setShowSimulateModal(false)}
                className="p-1 rounded-lg border-2 border-[#1a1a1a] text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimName('Rohan Sharma');
                    setSimGrade('Class 6A');
                    setSimDoubt('Why is my LED on pin 13 not blinking?');
                    setSimCategory('hardware');
                    setSimIsFlagged(false);
                  }}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-mono font-bold rounded-lg border border-emerald-300 hover:bg-emerald-100 cursor-pointer"
                >
                  ✓ Academic (Arduino LED)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimName('Vikram Singh');
                    setSimGrade('Class 6B');
                    setSimDoubt('Give me Free Fire diamond hacks and cheat codes');
                    setSimCategory('non_academic');
                    setSimIsFlagged(true);
                    setSimFlagReason('Gaming & Non-Curriculum Video Games');
                  }}
                  className="px-2.5 py-1 bg-rose-50 text-rose-800 text-xs font-mono font-bold rounded-lg border border-rose-300 hover:bg-rose-100 cursor-pointer"
                >
                  ⚠️ Non-Academic (Gaming Hack)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimName('Ananya Rao');
                    setSimGrade('Class 6A');
                    setSimDoubt('Who is the best Bollywood movie actor?');
                    setSimCategory('non_academic');
                    setSimIsFlagged(true);
                    setSimFlagReason('Entertainment & Celebrity Gossip');
                  }}
                  className="px-2.5 py-1 bg-rose-50 text-rose-800 text-xs font-mono font-bold rounded-lg border border-rose-300 hover:bg-rose-100 cursor-pointer"
                >
                  ⚠️ Non-Academic (Movie Gossip)
                </button>
              </div>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                    Student Name
                  </label>
                  <input 
                    type="text"
                    required
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="w-full px-3 py-2 text-xs border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                    Grade / Class
                  </label>
                  <input 
                    type="text"
                    required
                    value={simGrade}
                    onChange={(e) => setSimGrade(e.target.value)}
                    placeholder="e.g. Class 6B"
                    className="w-full px-3 py-2 text-xs border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/30 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={simCategory}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setSimCategory(val);
                    if (val === 'non_academic') {
                      setSimIsFlagged(true);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border-2 border-[#1a1a1a] rounded-xl focus:outline-none font-bold bg-slate-50 cursor-pointer"
                >
                  <option value="hardware">Hardware & Wires (Arduino, Servo, LED)</option>
                  <option value="coding">Coding & Syntax (Scratch, C++, Python)</option>
                  <option value="logic">Logic & Loops (If/Else, Repeat, Variables)</option>
                  <option value="general">General Academic Concept</option>
                  <option value="non_academic">⚠️ Non-Academic Violation (Gaming, Movies, Gossip)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Doubt / Question Asked
                </label>
                <textarea
                  required
                  rows={3}
                  value={simDoubt}
                  onChange={(e) => setSimDoubt(e.target.value)}
                  placeholder="e.g. Why does my servo motor twitch when connected to 5V?"
                  className="w-full p-3 text-xs border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/30 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5e43ff] text-white text-xs font-mono font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:-translate-y-0.5 hover:bg-[#4d32f0] transition-all cursor-pointer"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
