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
  Share2
} from 'lucide-react';

export interface StudentDoubt {
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
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
  const [simCategory, setSimCategory] = useState<'coding' | 'hardware' | 'logic' | 'general'>('hardware');

  const translations = {
    en: {
      trackerTitle: "Student Doubts Hub",
      trackerSubtitle: "Real-time log of questions and doubts asked by students across classrooms.",
      searchPlaceholder: "Search by student name, topic, or keyword...",
      filterAll: "All Doubts",
      filterPending: "Needs Review",
      filterResolved: "Resolved",
      statTotal: "Total Doubts",
      statPending: "Action Needed",
      statResolved: "Resolved",
      statStudents: "Active Students",
      resolvedBadge: "Resolved",
      pendingBadge: "Needs Attention",
      askedAt: "Asked",
      studentLabel: "Student",
      gradeLabel: "Grade",
      aiExplanationLabel: "AI Sathi's Instant Solution",
      teacherNoteLabel: "Teacher's Classroom Notes & Remarks",
      addTeacherNote: "Add Teacher Remark / Action",
      saveNote: "Save Remark",
      cancel: "Cancel",
      markResolved: "Mark as Resolved",
      markUnresolved: "Reopen Doubt",
      remedyBtn: "Generate Class Remedial Plan",
      quizBtn: "Create Quick Quiz for this Doubt",
      simulateBtn: "+ Simulate Live Student Doubt",
      noDoubtsFound: "No doubts found matching your filters.",
      emptyStateTip: "When students ask questions in the chat or use the Doubt Helper, they will appear here instantly.",
      deleteConfirm: "Delete doubt record?",
      categories: {
        all: "All Categories",
        coding: "Coding & Syntax",
        hardware: "Hardware & Wires",
        logic: "Logic & Loops",
        general: "General Concepts"
      }
    },
    hi: {
      trackerTitle: "छात्रों के प्रश्न व शंका केंद्र",
      trackerSubtitle: "छात्रों द्वारा पूछे गए सभी प्रश्नों और शंकाओं का रीयल-टाइम रिकॉर्ड।",
      searchPlaceholder: "छात्र का नाम, विषय या प्रश्न खोजें...",
      filterAll: "सभी प्रश्न",
      filterPending: "सुलझाना बाकी",
      filterResolved: "सुलझा लिए गए",
      statTotal: "कुल प्रश्न",
      statPending: "समीक्षा आवश्यक",
      statResolved: "सुलझे हुए",
      statStudents: "सक्रिय छात्र",
      resolvedBadge: "सुलझ गया",
      pendingBadge: "ध्यान देने योग्य",
      askedAt: "पूछा गया",
      studentLabel: "छात्र",
      gradeLabel: "कक्षा",
      aiExplanationLabel: "एआई साथी का तत्काल उत्तर",
      teacherNoteLabel: "शिक्षक की कक्षा टिप्पणी (Teacher Notes)",
      addTeacherNote: "शिक्षक टिप्पणी जोड़ें",
      saveNote: "टिप्पणी सहेजें",
      cancel: "रद्द करें",
      markResolved: "सुलझा हुआ चिह्नित करें",
      markUnresolved: "पुनः खोलें",
      remedyBtn: "कक्षा के लिए उपचारात्मक पाठ बनाएं",
      quizBtn: "इस शंका पर त्वरित क्विज़ बनाएं",
      simulateBtn: "+ छात्र प्रश्न का परीक्षण करें",
      noDoubtsFound: "कोई प्रश्न नहीं मिला।",
      emptyStateTip: "जब छात्र चैट में प्रश्न पूछेंगे, तो वे तुरंत यहाँ दिखाई देंगे।",
      deleteConfirm: "क्या आप इस प्रश्न को हटाना चाहते हैं?",
      categories: {
        all: "सभी श्रेणियां",
        coding: "कोडिंग और सिंटैक्स",
        hardware: "हार्डवेयर और तार",
        logic: "लॉजिक और लूप",
        general: "सामान्य अवधारणाएं"
      }
    },
    te: {
      trackerTitle: "విద్యార్థుల సందేహాల హబ్",
      trackerSubtitle: "తరగతి గదుల్లో విద్యార్థులు అడిగిన ప్రశ్నలు మరియు సందేహాల రికార్డు.",
      searchPlaceholder: "విద్యార్థి పేరు లేదా అంశం ద్వారా శోధించండి...",
      filterAll: "అన్ని సందేహాలు",
      filterPending: "పరిశీలన అవసరం",
      filterResolved: "పరిష్కరించబడింది",
      statTotal: "మొత్తం సందేహాలు",
      statPending: "చర్య అవసరం",
      statResolved: "పరిష్కరించబడింది",
      statStudents: "విద్యార్థులు",
      resolvedBadge: "పరిష్కరించబడింది",
      pendingBadge: "శ్రద్ధ అవసరం",
      askedAt: "సమయం",
      studentLabel: "విద్యార్థి",
      gradeLabel: "తరగతి",
      aiExplanationLabel: "AI సాథి తక్షణ సమాధానం",
      teacherNoteLabel: "ఉపాధ్యాయుల గమనికలు",
      addTeacherNote: "ఉపాధ్యాయుని వ్యాఖ్యను జోడించండి",
      saveNote: "సేవ్ చేయండి",
      cancel: "రద్దు చేయి",
      markResolved: "పరిష్కరించినట్లు గుర్తించండి",
      markUnresolved: "తిరిగి తెరవండి",
      remedyBtn: "తరగతి నివారణ ప్రణాళికను రూపొందించండి",
      quizBtn: "ఈ సందేహంపై త్వరిత క్విజ్ సృష్టించండి",
      simulateBtn: "+ విద్యార్థి సందేహాన్ని అనుకరించండి",
      noDoubtsFound: "సందేహాలు ఏవీ కనుగొనబడలేదు.",
      emptyStateTip: "విద్యార్థులు చాట్‌లో ప్రశ్నలు అడిగినప్పుడు, అవి ఇక్కడ కనిపిస్తాయి.",
      deleteConfirm: "ఈ సందేహాన్ని తొలగించాలా?",
      categories: {
        all: "అన్ని వర్గాలు",
        coding: "కోడింగ్ & సింటాక్స్",
        hardware: "హార్డ్‌వేర్ & వైర్లు",
        logic: "లాజిక్ & లూప్‌లు",
        general: "సాధారణ అంశాలు"
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
      console.error('Failed to fetch doubts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchDoubts, 10000);
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

  // Simulate new student doubt
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
          topic: simCategory === 'hardware' ? 'Hardware & Sensors' : simCategory === 'coding' ? 'Programming Syntax' : 'Problem Solving',
          aiResponse: `Shiksha Sathi analyzed this issue: For ${simDoubt.slice(0, 40)}..., ensure common wiring connections and supply voltage are verified.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDoubts(prev => [data.doubt, ...prev]);
        setShowSimulateModal(false);
        setSimDoubt('');
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

    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchDoubt = item.doubt.toLowerCase().includes(q);
      const matchTopic = item.topic?.toLowerCase().includes(q) || false;
      const matchGrade = item.studentGrade.toLowerCase().includes(q);
      if (!matchName && !matchDoubt && !matchTopic && !matchGrade) return false;
    }

    return true;
  });

  // Calculate statistics
  const totalCount = doubts.length;
  const pendingCount = doubts.filter(d => !d.isResolved).length;
  const resolvedCount = doubts.filter(d => d.isResolved).length;
  const uniqueStudents = new Set(doubts.map(d => d.studentName.trim().toLowerCase())).size;

  return (
    <div id="student-doubts-hub" className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FDFBF7] space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border-3 border-[#1a1a1a] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e8e5ff] border-2 border-[#1a1a1a] rounded-full text-xs font-mono font-bold text-[#5e43ff] shadow-[2px_2px_0px_#1a1a1a]">
            <HelpCircle className="w-3.5 h-3.5 text-[#5e43ff]" />
            <span>LIVE CLASSROOM INTAKE</span>
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
            title="Add a simulated student doubt for testing"
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
          <HelpCircle className="w-48 h-48 opacity-25" />
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
            <span className="text-xs text-slate-500 font-semibold font-mono">questions</span>
          </div>
        </div>

        <div className="bg-[#FFF3E0] border-2 border-[#1a1a1a] rounded-2xl p-4 md:p-5 shadow-[4px_4px_0px_#1a1a1a]">
          <span className="font-mono text-xs text-amber-900 font-bold uppercase tracking-wider block mb-1">
            {t.statPending}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-gaegu text-4xl font-extrabold text-[#E65100]">{pendingCount}</span>
            <span className="text-xs text-amber-800 font-semibold font-mono">unresolved</span>
          </div>
        </div>

        <div className="bg-[#E8F5E9] border-2 border-[#1a1a1a] rounded-2xl p-4 md:p-5 shadow-[4px_4px_0px_#1a1a1a]">
          <span className="font-mono text-xs text-emerald-900 font-bold uppercase tracking-wider block mb-1">
            {t.statResolved}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-gaegu text-4xl font-extrabold text-[#2E7D32]">{resolvedCount}</span>
            <span className="text-xs text-emerald-800 font-semibold font-mono">addressed</span>
          </div>
        </div>

        <div className="bg-[#E1F5FE] border-2 border-[#1a1a1a] rounded-2xl p-4 md:p-5 shadow-[4px_4px_0px_#1a1a1a]">
          <span className="font-mono text-xs text-sky-900 font-bold uppercase tracking-wider block mb-1">
            {t.statStudents}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-gaegu text-4xl font-extrabold text-[#01579B]">{uniqueStudents}</span>
            <span className="text-xs text-sky-800 font-semibold font-mono">inquiring</span>
          </div>
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
            {(['all', 'pending', 'resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-[#1a1a1a] text-white shadow-xs'
                    : 'text-[#1a1a1a] hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? t.filterAll : status === 'pending' ? t.filterPending : t.filterResolved}
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
            const categoryColor = 
              item.category === 'hardware' ? 'bg-[#DCEDC8] text-[#33691E]' :
              item.category === 'coding' ? 'bg-[#B3E5FC] text-[#01579B]' :
              item.category === 'logic' ? 'bg-[#FFE0B2] text-[#E65100]' :
              'bg-[#F3E5F5] text-[#6A1B9A]';

            return (
              <div 
                key={item.id}
                className={`bg-white border-2 border-[#1a1a1a] rounded-2xl transition-all shadow-[4px_4px_0px_#1a1a1a] overflow-hidden ${
                  !item.isResolved ? 'hover:border-[#5e43ff]' : 'opacity-90'
                }`}
              >
                {/* Doubt Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left Side: Student avatar & question */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-[#1a1a1a] flex items-center justify-center font-bold font-mono text-sm text-amber-900 shadow-[2px_2px_0px_#1a1a1a] shrink-0 mt-0.5">
                      {item.studentName ? item.studentName.charAt(0).toUpperCase() : 'S'}
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
                        <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md border border-[#1a1a1a]/30 ${categoryColor}`}>
                          {item.category || 'General'}
                        </span>

                        {/* Status Badge */}
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

                        <span className="text-[11px] font-mono text-slate-400 ml-auto hidden sm:inline">
                          {item.timestamp}
                        </span>
                      </div>

                      {/* The Doubt Text */}
                      <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl">
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
                      className="p-1.5 rounded-xl border-2 border-[#1a1a1a] bg-slate-50 hover:bg-slate-100 transition-all"
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
                      className="p-1.5 rounded-xl border-2 border-transparent hover:border-[#1a1a1a] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
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
                      <div className="bg-white border-2 border-[#1a1a1a] rounded-xl p-4 space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#5e43ff]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t.aiExplanationLabel}</span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed bg-[#f6f5ff] p-3 rounded-lg border border-[#5e43ff]/20">
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
                            className="text-[11px] font-mono font-bold text-[#5e43ff] hover:underline"
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
                            placeholder="Add classroom follow-up note, e.g., 'Demonstrated polar capacitor in lab period 3'"
                            className="w-full p-2.5 text-xs font-medium border-2 border-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/30 bg-amber-50/40"
                            rows={2}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingNoteId(null);
                                setNoteText('');
                              }}
                              className="px-3 py-1 text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                              {t.cancel}
                            </button>
                            <button
                              onClick={() => handleSaveNote(item.id)}
                              disabled={savingNote}
                              className="px-3.5 py-1 bg-[#1a1a1a] text-white text-xs font-mono font-bold rounded-lg hover:bg-black transition-all"
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

                    {/* Teacher Action Triggers */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleGenerateRemedialPlan(item)}
                        className="flex items-center gap-2 px-3.5 py-2 bg-[#FFE0B2] text-[#E65100] text-xs font-mono font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{t.remedyBtn}</span>
                      </button>

                      <button
                        onClick={() => handleGenerateQuiz(item)}
                        className="flex items-center gap-2 px-3.5 py-2 bg-[#B3E5FC] text-[#01579B] text-xs font-mono font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{t.quizBtn}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Simulate Live Student Doubt */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border-3 border-[#1a1a1a] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[8px_8px_0px_#1a1a1a] space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b-2 border-[#1a1a1a]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#5e43ff]/10 border-2 border-[#1a1a1a] rounded-xl">
                  <HelpCircle className="w-5 h-5 text-[#5e43ff]" />
                </div>
                <h3 className="font-gaegu text-2xl font-bold text-[#1a1a1a]">
                  Simulate Student Doubt
                </h3>
              </div>
              <button 
                onClick={() => setShowSimulateModal(false)}
                className="p-1 rounded-lg border-2 border-[#1a1a1a] text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
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
                  onChange={(e) => setSimCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border-2 border-[#1a1a1a] rounded-xl focus:outline-none font-bold bg-slate-50"
                >
                  <option value="hardware">Hardware & Wires (Arduino, Servo, LED)</option>
                  <option value="coding">Coding & Syntax (Scratch, C++, Python)</option>
                  <option value="logic">Logic & Loops (If/Else, Repeat, Variables)</option>
                  <option value="general">General Concept</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Doubt / Question
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
                  className="px-4 py-2 text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5e43ff] text-white text-xs font-mono font-bold rounded-xl border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:-translate-y-0.5 hover:bg-[#4d32f0] transition-all"
                >
                  Post Student Doubt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
