import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Search, 
  Flame, 
  Award, 
  Filter, 
  RefreshCw, 
  Sparkles, 
  UserCheck, 
  ChevronUp, 
  Plus, 
  Star, 
  Check, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export interface LeaderboardEntry {
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
  recentQuizzes?: {
    quizTitle: string;
    score: number;
    totalPossible: number;
    accuracy: number;
    timestamp: string;
  }[];
}

interface LeaderboardTrackerProps {
  language: 'en' | 'hi' | 'te';
  userRole: 'teacher' | 'student';
  userName: string;
  userEmail: string;
  userGrade: string;
  onOpenQuiz: () => void;
}

export default function LeaderboardTracker({
  language,
  userRole,
  userName,
  userEmail,
  userGrade,
  onOpenQuiz
}: LeaderboardTrackerProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [timeFrame, setTimeFrame] = useState<'all' | 'weekly'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Award Bonus Points Modal (Teacher only)
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedStudentForAward, setSelectedStudentForAward] = useState<LeaderboardEntry | null>(null);
  const [awardPointsAmount, setAwardPointsAmount] = useState<number>(50);
  const [awardReason, setAwardReason] = useState<string>('Outstanding Lab Project');
  const [isAwarding, setIsAwarding] = useState(false);
  const [awardSuccessMsg, setAwardSuccessMsg] = useState('');

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?grade=${gradeFilter}&timeFrame=${timeFrame}`);
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Error loading leaderboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 4000);
    return () => clearInterval(interval);
  }, [gradeFilter, timeFrame]);

  // Filter list by search query
  const filteredList = leaderboard.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const top3 = filteredList.slice(0, 3);
  const restList = filteredList.slice(3);

  // Handle teacher bonus points submission
  const handleAwardBonusPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAward) return;
    setIsAwarding(true);
    try {
      const res = await fetch('/api/leaderboard/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentForAward.id,
          studentEmail: selectedStudentForAward.email,
          points: awardPointsAmount,
          reason: awardReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setAwardSuccessMsg(`+${awardPointsAmount} XP awarded to ${selectedStudentForAward.name}!`);
        fetchLeaderboard();
        setTimeout(() => {
          setShowAwardModal(false);
          setSelectedStudentForAward(null);
          setAwardSuccessMsg('');
        }, 1500);
      }
    } catch (e) {
      console.error('Error awarding bonus points:', e);
    } finally {
      setIsAwarding(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 border-2 border-[#1a1a1a] rounded-3xl p-6 md:p-8 shadow-[5px_5px_0px_#1a1a1a] mb-8 relative overflow-hidden text-[#1a1a1a]">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 border border-[#1a1a1a] rounded-full text-xs font-mono font-black mb-3 shadow-[1px_1px_0px_#1a1a1a]">
            <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            {language === 'hi' ? 'छात्र एसटीईएम अचीवमेंट हॉल' : 'STEM Student Achievement Hall'}
          </div>

          <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">
            {language === 'hi' ? '🏆 छात्र लीडरबोर्ड और स्कोर रैंकिंग' : '🏆 Student STEM Leaderboard & XP Ranks'}
          </h1>
          <p className="text-xs md:text-sm text-[#1a1a1a]/80 font-mono leading-relaxed mb-6 font-semibold">
            {language === 'hi'
              ? 'लाइव टेस्ट, कोडिंग चुनौतियां और हार्डवेयर प्रयोग पूरे करके अंक अर्जित करें। सही उत्तर और गति के आधार पर रैंकिंग तुरंत अपडेट होती है!'
              : 'Earn XP by completing live teacher sprints, Scratch logic challenges, and circuit diagnostics. Ranks auto-update with every quiz score!'}
          </p>

          <div className="flex flex-wrap gap-3 font-mono">
            <button
              onClick={onOpenQuiz}
              className="px-5 py-2.5 bg-[#5e43ff] hover:bg-[#4b32ea] text-white font-black text-xs md:text-sm rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-2 hover:-translate-y-0.5 transition-all"
            >
              <Zap className="w-4 h-4 fill-white" />
              {language === 'hi' ? '🎯 लाइव क्विज़ में भाग लें' : '🎯 Enter Live Quiz Arena'}
            </button>

            <button
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#1a1a1a] font-bold text-xs md:text-sm rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {language === 'hi' ? 'ताज़ा करें' : 'Refresh Ranks'}
            </button>
          </div>
        </div>

        {/* Decorative Medal Graphic */}
        <div className="absolute right-4 -bottom-6 opacity-20 md:opacity-30 pointer-events-none">
          <Medal className="w-64 h-64 text-[#1a1a1a]" />
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="order-2 md:order-1 bg-white border-2 border-[#1a1a1a] rounded-3xl p-5 shadow-[4px_4px_0px_#1a1a1a] flex flex-col justify-between relative overflow-hidden md:mt-6">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-slate-100 rounded-full border border-[#1a1a1a] flex items-end justify-start p-3 text-2xl">
                🥈
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-400 text-slate-700 text-[10px] font-mono font-black rounded-md uppercase">
                  Rank #2 Silver
                </span>
                <h3 className="font-mono font-black text-lg text-[#1a1a1a] mt-2 truncate">
                  {top3[1].name}
                </h3>
                <span className="text-xs font-mono text-slate-500">{top3[1].grade}</span>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">TOTAL XP</span>
                  <span className="text-lg font-black text-[#5e43ff]">
                    {timeFrame === 'weekly' ? top3[1].weeklyPoints : top3[1].points} XP
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">ACCURACY</span>
                  <span className="text-xs font-black text-emerald-600">{top3[1].accuracy}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold Champions Podium) */}
          {top3[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-amber-100/60 border-2 border-[#1a1a1a] rounded-3xl p-6 shadow-[5px_5px_0px_#1a1a1a] flex flex-col justify-between relative overflow-hidden md:-mt-3">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-200 rounded-full border-2 border-[#1a1a1a] flex items-end justify-start p-4 text-3xl animate-pulse">
                🥇
              </div>
              <div>
                <span className="px-3 py-1 bg-amber-300 border border-[#1a1a1a] text-[#1a1a1a] text-xs font-mono font-black rounded-lg uppercase shadow-[1px_1px_0px_#1a1a1a]">
                  👑 #1 Champion
                </span>
                <h3 className="font-mono font-black text-xl text-[#1a1a1a] mt-3 truncate">
                  {top3[0].name}
                </h3>
                <span className="text-xs font-mono text-slate-600 font-bold">{top3[0].grade}</span>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-amber-200/80 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-amber-800 font-bold block">GOLD XP</span>
                  <span className="text-2xl font-black text-amber-700">
                    {timeFrame === 'weekly' ? top3[0].weeklyPoints : top3[0].points} XP
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-800 font-bold block">STREAK</span>
                  <span className="text-sm font-black text-orange-600 flex items-center gap-1 justify-end">
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-500" /> {top3[0].streak}x
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="order-3 md:order-3 bg-white border-2 border-[#1a1a1a] rounded-3xl p-5 shadow-[4px_4px_0px_#1a1a1a] flex flex-col justify-between relative overflow-hidden md:mt-8">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-50 rounded-full border border-[#1a1a1a] flex items-end justify-start p-3 text-2xl">
                🥉
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-orange-100 border border-orange-300 text-orange-800 text-[10px] font-mono font-black rounded-md uppercase">
                  Rank #3 Bronze
                </span>
                <h3 className="font-mono font-black text-lg text-[#1a1a1a] mt-2 truncate">
                  {top3[2].name}
                </h3>
                <span className="text-xs font-mono text-slate-500">{top3[2].grade}</span>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">TOTAL XP</span>
                  <span className="text-lg font-black text-[#5e43ff]">
                    {timeFrame === 'weekly' ? top3[2].weeklyPoints : top3[2].points} XP
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">ACCURACY</span>
                  <span className="text-xs font-black text-emerald-600">{top3[2].accuracy}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter & Controls Toolbar */}
      <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-4 shadow-[3px_3px_0px_#1a1a1a] mb-6 flex flex-wrap items-center justify-between gap-4 font-mono">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'छात्र या कक्षा खोजें...' : 'Search student name or grade...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#1a1a1a] rounded-xl outline-none focus:bg-white focus:border-[#5e43ff]"
          />
        </div>

        {/* Grade Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2 bg-slate-50 border border-[#1a1a1a] rounded-xl outline-none cursor-pointer"
          >
            <option value="all">All Classes</option>
            <option value="Class 5">Class 5</option>
            <option value="Class 6A">Class 6A</option>
            <option value="Class 6B">Class 6B</option>
            <option value="Class 7A">Class 7A</option>
          </select>
        </div>

        {/* Time Frame Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-[#1a1a1a]">
          <button
            onClick={() => setTimeFrame('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              timeFrame === 'all' ? 'bg-[#5e43ff] text-white shadow-sm' : 'text-slate-600 hover:text-[#1a1a1a]'
            }`}
          >
            All-Time XP
          </button>
          <button
            onClick={() => setTimeFrame('weekly')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              timeFrame === 'weekly' ? 'bg-amber-400 text-[#1a1a1a] shadow-sm font-black' : 'text-slate-600 hover:text-[#1a1a1a]'
            }`}
          >
            Weekly Sprint 🔥
          </button>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl shadow-[4px_4px_0px_#1a1a1a] overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-[#1a1a1a] text-[11px] font-black text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4 text-right">Points (XP)</th>
                <th className="py-3.5 px-4 text-center">Accuracy</th>
                <th className="py-3.5 px-4 text-center">Quizzes</th>
                <th className="py-3.5 px-4 text-center">Streak</th>
                <th className="py-3.5 px-4">Badges</th>
                {userRole === 'teacher' && <th className="py-3.5 px-4 text-center">Teacher Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredList.map((student, idx) => {
                const rankNumber = idx + 1;
                const isCurrentUser = 
                  student.email.toLowerCase() === userEmail?.toLowerCase() || 
                  student.name.includes('(You)') ||
                  (userRole === 'student' && student.name.toLowerCase().includes(userName?.toLowerCase() || ''));

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isCurrentUser 
                        ? 'bg-amber-50/80 font-bold border-l-4 border-l-amber-500' 
                        : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    } hover:bg-indigo-50/40`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-4 text-center font-black">
                      {rankNumber === 1 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-300 border border-[#1a1a1a] inline-flex items-center justify-center text-xs">
                          🥇
                        </span>
                      ) : rankNumber === 2 ? (
                        <span className="w-7 h-7 rounded-full bg-slate-200 border border-[#1a1a1a] inline-flex items-center justify-center text-xs">
                          🥈
                        </span>
                      ) : rankNumber === 3 ? (
                        <span className="w-7 h-7 rounded-full bg-orange-200 border border-[#1a1a1a] inline-flex items-center justify-center text-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-sm">#{rankNumber}</span>
                      )}
                    </td>

                    {/* Student Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-slate-200 border border-[#1a1a1a] flex items-center justify-center text-xs font-black text-[#1a1a1a] shrink-0">
                          {student.name.charAt(0)}
                        </span>
                        <div>
                          <div className="font-extrabold text-[#1a1a1a] flex items-center gap-1.5">
                            {student.name}
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 bg-[#5e43ff] text-white rounded text-[9px] font-mono">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{student.lastActive}</span>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3.5 px-4 text-slate-600 font-bold">
                      {student.grade}
                    </td>

                    {/* Points / XP */}
                    <td className="py-3.5 px-4 text-right font-black text-sm">
                      <span className="text-[#5e43ff]">
                        {(timeFrame === 'weekly' ? student.weeklyPoints : student.points).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">XP</span>
                    </td>

                    {/* Accuracy */}
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] border ${
                        student.accuracy >= 85 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : student.accuracy >= 70 
                          ? 'bg-amber-50 border-amber-300 text-amber-700' 
                          : 'bg-slate-50 border-slate-300 text-slate-600'
                      }`}>
                        {student.accuracy}%
                      </span>
                    </td>

                    {/* Quizzes Taken */}
                    <td className="py-3.5 px-4 text-center text-slate-600 font-bold">
                      {student.quizzesTaken}
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center">
                      {student.streak > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-black text-orange-600">
                          <Flame className="w-3.5 h-3.5 fill-orange-500" /> {student.streak}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {student.badges.slice(0, 2).map((b, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] whitespace-nowrap">
                            {b}
                          </span>
                        ))}
                        {student.badges.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] text-slate-500">
                            +{student.badges.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Teacher Action: Award Merit Bonus */}
                    {userRole === 'teacher' && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentForAward(student);
                            setShowAwardModal(true);
                          }}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-400 rounded-lg text-[10px] font-bold shadow-[1px_1px_0px_#1a1a1a] transition-all flex items-center gap-1 mx-auto"
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          +Award XP
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Bonus Points Modal */}
      {showAwardModal && selectedStudentForAward && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1a1a1a] rounded-3xl p-6 max-w-md w-full shadow-[8px_8px_0px_#1a1a1a] animate-fadeIn font-mono">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-[#1a1a1a] flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Award Merit Bonus XP
              </h3>
              <button
                onClick={() => setShowAwardModal(false)}
                className="text-slate-400 hover:text-[#1a1a1a] font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Award merit points to <strong className="text-[#1a1a1a]">{selectedStudentForAward.name}</strong> ({selectedStudentForAward.grade}) for classroom lab performance or helpful peer assistance.
            </p>

            <form onSubmit={handleAwardBonusPoints} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1">XP Points to Award:</label>
                <div className="flex gap-2">
                  {[25, 50, 100, 150].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAwardPointsAmount(amt)}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-black transition-all ${
                        awardPointsAmount === amt
                          ? 'bg-amber-400 border-[#1a1a1a] text-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]'
                          : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      +{amt} XP
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1">Reason / Citation:</label>
                <select
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-[#1a1a1a] rounded-xl text-xs outline-none"
                >
                  <option value="Outstanding Lab Project">Outstanding Lab Project</option>
                  <option value="Peer Helping & Mentoring">Peer Helping & Mentoring</option>
                  <option value="Hardware Debugging Mastery">Hardware Debugging Mastery</option>
                  <option value="Creative Scratch Code Solution">Creative Scratch Code Solution</option>
                  <option value="Consistent Class Participation">Consistent Class Participation</option>
                </select>
              </div>

              {awardSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-800 rounded-xl text-xs font-bold text-center">
                  ✅ {awardSuccessMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAwardModal(false)}
                  className="px-4 py-2 border border-[#1a1a1a] rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAwarding}
                  className="px-5 py-2 bg-[#5e43ff] hover:bg-[#4b32ea] text-white border-2 border-[#1a1a1a] rounded-xl text-xs font-black shadow-[2px_2px_0px_#1a1a1a] flex items-center gap-1.5"
                >
                  {isAwarding ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Awarding...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Confirm & Award +{awardPointsAmount} XP
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
