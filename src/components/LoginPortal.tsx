import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  KeyRound, 
  GraduationCap, 
  School, 
  Cpu, 
  Languages, 
  X 
} from 'lucide-react';

interface LoginPortalProps {
  language: 'en' | 'hi' | 'te';
  setLanguage: (lang: 'en' | 'hi' | 'te') => void;
  translations: any;
  onLoginSuccess: (role: 'teacher' | 'student', name: string, email: string) => void;
}

export default function LoginPortal({ 
  language, 
  setLanguage, 
  translations, 
  onLoginSuccess 
}: LoginPortalProps) {
  const t = translations[language];
  const [activeLoginStep, setActiveLoginStep] = useState<'role' | 'auth-method' | 'otp' | 'google-picker'>('role');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>('teacher');
  
  // OTP Verification details
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [simulatedOtpCode, setSimulatedOtpCode] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  
  // Custom Floating SMS push notification state
  const [smsNotification, setSmsNotification] = useState<{ show: boolean; text: string } | null>(null);

  // Auto-hide SMS OTP notifications after 10 seconds
  useEffect(() => {
    if (smsNotification?.show) {
      const timer = setTimeout(() => {
        setSmsNotification(prev => prev ? { ...prev, show: false } : null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [smsNotification]);

  return (
    <div id="login-container" className="flex flex-col min-h-screen w-full items-center justify-center p-4 bg-[#fffef2] bg-radial from-[#fffdf0] via-[#fffbf2] to-[#fffae2] relative overflow-hidden font-sans">
      {/* Floating background elements for playful education vibes */}
      <div className="absolute top-10 left-10 text-6xl opacity-15 select-none animate-bounce">🤖</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-15 select-none animate-pulse">💡</div>
      <div className="absolute top-24 right-20 text-5xl opacity-10 select-none -rotate-12">🔌</div>
      <div className="absolute bottom-24 left-20 text-5xl opacity-10 select-none rotate-12">📝</div>

      {/* Global Language Selector on Login Screen */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <Languages className="w-4 h-4 text-[#1a1a1a]/60" />
        <div className="flex bg-[#1a1a1a]/5 p-1 rounded-full border-2 border-[#1a1a1a]">
          {(['en', 'hi', 'te'] as const).map((lang) => (
            <button 
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full font-mono text-xs font-bold transition-all duration-150 ${
                language === lang 
                  ? 'bg-[#1a1a1a] text-white shadow-xs' 
                  : 'text-[#1a1a1a] hover:bg-[#1a1a1a]/10'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'తెలుగు'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white border-3 border-[#1a1a1a] rounded-3xl p-8 shadow-[8px_8px_0px_#1a1a1a] relative z-10 animate-fade-in">
        {/* Header Title with Graduation cap icon */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#e8e5ff] border-2 border-[#1a1a1a] rounded-2xl shadow-[3px_3px_0px_#1a1a1a] mb-4 transform -rotate-3 hover:rotate-3 transition-transform">
            <School className="w-10 h-10 text-[#5e43ff]" />
          </div>
          <h1 className="font-gaegu font-bold text-5xl text-[#5e43ff] mb-2 tracking-tight">
            {t.title}
          </h1>
          <p className="text-slate-600 font-semibold text-sm px-4">
            {t.loginSubtitle}
          </p>
        </div>

        {/* STEP 1: Select Role */}
        {activeLoginStep === 'role' && (
          <div className="space-y-6">
            <h2 className="text-center text-xl font-extrabold text-[#1a1a1a] font-gaegu tracking-wide">
              {t.selectRole}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Teacher Button */}
              <button
                onClick={() => {
                  setSelectedRole('teacher');
                  setActiveLoginStep('auth-method');
                }}
                className="group flex flex-col items-center justify-center p-6 bg-[#FFF3E0] hover:bg-[#FFE0B2] border-3 border-[#1a1a1a] rounded-2xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-[5px_5px_0px_#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]"
              >
                <div className="p-3 bg-white border-2 border-[#1a1a1a] rounded-xl mb-3 shadow-[2px_2px_0px_#1a1a1a] group-hover:bg-[#FFF3E0] transition-colors">
                  <GraduationCap className="w-8 h-8 text-[#E65100]" />
                </div>
                <span className="font-bold text-[#E65100] text-lg">
                  {language === 'hi' ? 'शिक्षक / Teacher' : language === 'te' ? 'ఉపాధ్యాయుడు / Teacher' : 'Teacher / शिक्षक'}
                </span>
                <span className="text-[11px] text-orange-800/80 font-semibold mt-1">
                  {language === 'hi' ? 'पाठ योजना और शंका समाधान' : language === 'te' ? 'పాఠ్య ప్రణాళిక & సందేహాలు' : 'Lesson Planner & Doubts'}
                </span>
              </button>

              {/* Student Button */}
              <button
                onClick={() => {
                  setSelectedRole('student');
                  setActiveLoginStep('auth-method');
                }}
                className="group flex flex-col items-center justify-center p-6 bg-[#E1F5FE] hover:bg-[#B3E5FC] border-3 border-[#1a1a1a] rounded-2xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-[5px_5px_0px_#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]"
              >
                <div className="p-3 bg-white border-2 border-[#1a1a1a] rounded-xl mb-3 shadow-[2px_2px_0px_#1a1a1a] group-hover:bg-[#E1F5FE] transition-colors">
                  <Cpu className="w-8 h-8 text-[#01579B]" />
                </div>
                <span className="font-bold text-[#01579B] text-lg">
                  {language === 'hi' ? 'छात्र / Student' : language === 'te' ? 'విద్యార్థి / Student' : 'Student / छात्र'}
                </span>
                <span className="text-[11px] text-sky-800/80 font-semibold mt-1">
                  {language === 'hi' ? 'सर्किट सिमुलेटर और कोडिंग' : language === 'te' ? 'సర్క్యూట్ సిమ్యులేటర్ & కోడింగ్' : 'Circuit Sim & Coding'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Auth Method */}
        {activeLoginStep === 'auth-method' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 bg-slate-50 border-2 border-[#1a1a1a] p-3 rounded-xl mb-4">
              <div className={`p-2 rounded-lg border border-[#1a1a1a] ${selectedRole === 'teacher' ? 'bg-[#FFF3E0]' : 'bg-[#E1F5FE]'}`}>
                {selectedRole === 'teacher' ? <GraduationCap className="w-5 h-5 text-[#E65100]" /> : <Cpu className="w-5 h-5 text-[#01579B]" />}
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Signing in as</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {selectedRole === 'teacher' ? t.teacherRole : t.studentRole}
                </span>
              </div>
            </div>

            {/* Google Sign in button */}
            <button
              onClick={() => {
                setActiveLoginStep('google-picker');
              }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-slate-50 border-3 border-[#1a1a1a] rounded-xl transition-all duration-150 transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1a1a1a] shadow-[1px_1px_0px_#1a1a1a] font-bold text-slate-800 text-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {t.loginWithGoogle}
            </button>

            {/* Mobile OTP button */}
            <button
              onClick={() => {
                setOtpSent(false);
                setOtpCode('');
                setPhoneNumber('');
                setActiveLoginStep('otp');
              }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-[#e8e5ff] hover:bg-[#dcd8ff] border-3 border-[#1a1a1a] rounded-xl transition-all duration-150 transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1a1a1a] shadow-[1px_1px_0px_#1a1a1a] font-bold text-[#5e43ff] text-sm"
            >
              <Smartphone className="w-5 h-5 shrink-0" />
              {t.loginWithMobile}
            </button>

            <button
              onClick={() => setActiveLoginStep('role')}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mt-2"
            >
              ← {t.backToRole}
            </button>
          </div>
        )}

        {/* STEP 3: Google Account Picker Simulation */}
        {activeLoginStep === 'google-picker' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
              Sign in with Google
            </h3>
            
            <div className="border-2 border-[#1a1a1a] rounded-2xl overflow-hidden bg-slate-50 divide-y-2 divide-[#1a1a1a]">
              {/* Account 1 */}
              <button
                onClick={() => {
                  const email = selectedRole === 'teacher' ? 'himeshchandra03@gmail.com' : 'rahul.robotics@shiksha.in';
                  const name = selectedRole === 'teacher' ? 'Himesh Chandra' : 'Rahul Sharma';
                  onLoginSuccess(selectedRole, name, email);
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] bg-[#FFF3E0] flex items-center justify-center font-bold text-lg text-amber-600 shrink-0">
                  {selectedRole === 'teacher' ? 'H' : 'R'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-slate-800 truncate">
                    {selectedRole === 'teacher' ? 'Himesh Chandra' : 'Rahul Sharma'}
                  </span>
                  <span className="block text-xs text-slate-500 truncate">{selectedRole === 'teacher' ? 'himeshchandra03@gmail.com' : 'rahul.robotics@shiksha.in'}</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#1a1a1a]" title="Authorized" />
              </button>

              {/* Account 2 */}
              <button
                onClick={() => {
                  const email = selectedRole === 'teacher' ? 'guest.teacher@shikshasathi.org' : 'student.sathi@gmail.com';
                  const name = selectedRole === 'teacher' ? 'Guest Teacher' : 'Student Sathi';
                  onLoginSuccess(selectedRole, name, email);
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] bg-[#E1F5FE] flex items-center justify-center font-bold text-lg text-sky-600 shrink-0">
                  {selectedRole === 'teacher' ? 'G' : 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-slate-800 truncate">
                    {selectedRole === 'teacher' ? 'Guest Teacher' : 'Student Sathi'}
                  </span>
                  <span className="block text-xs text-slate-500 truncate">
                    {selectedRole === 'teacher' ? 'guest.teacher@shikshasathi.org' : 'student.sathi@gmail.com'}
                  </span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/15 border border-[#1a1a1a]" />
              </button>
            </div>

            <button
              onClick={() => setActiveLoginStep('auth-method')}
              className="w-full text-center py-2 px-4 bg-slate-100 hover:bg-slate-200 border-2 border-[#1a1a1a] rounded-xl font-bold text-slate-700 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* STEP 4: Mobile OTP Form */}
        {activeLoginStep === 'otp' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 bg-slate-50 border-2 border-[#1a1a1a] p-3 rounded-xl">
              <div className="p-2 rounded-lg border border-[#1a1a1a] bg-[#e8e5ff]">
                <Smartphone className="w-5 h-5 text-[#5e43ff]" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Verification Step</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {selectedRole === 'teacher' ? 'Teacher OTP Access' : 'Student OTP Access'}
                </span>
              </div>
            </div>

            {!otpSent ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (phoneNumber.length < 10) {
                    setOtpError('Please enter a valid 10-digit number');
                    return;
                  }
                  setOtpError('');
                  const code = Math.floor(100000 + Math.random() * 900000).toString();
                  setSimulatedOtpCode(code);
                  setOtpSent(true);
                  setSmsNotification({
                    show: true,
                    text: `🔑 Shiksha Sathi Security Code: ${code}. Valid for 10 minutes. Please enter this to login.`
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.enterMobile}
                  </label>
                  <div className="flex border-3 border-[#1a1a1a] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5e43ff]">
                    <div className="px-3 bg-slate-100 border-r-3 border-[#1a1a1a] flex items-center font-mono text-sm font-bold text-slate-600">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="flex-1 px-4 py-3 bg-white font-mono font-bold text-slate-800 placeholder:text-slate-300 text-lg outline-none"
                      required
                      autoFocus
                    />
                  </div>
                  {otpError && <p className="text-xs font-bold text-rose-600 mt-1.5">{otpError}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#5e43ff] hover:bg-[#4b35e0] border-3 border-[#1a1a1a] text-white rounded-xl transition-all duration-150 transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1a1a1a] shadow-[1px_1px_0px_#1a1a1a] font-bold text-sm"
                >
                  {t.sendOtp}
                </button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (otpCode !== simulatedOtpCode) {
                    setOtpError('Invalid security code. Please check the simulated SMS alert.');
                    return;
                  }
                  setOtpError('');
                  const roleName = selectedRole === 'teacher' ? 'Teacher Sathi' : 'Student Sathi';
                  const email = selectedRole === 'teacher' ? 'teacher.otp@shikshasathi.org' : 'student.otp@shikshasathi.org';
                  onLoginSuccess(selectedRole, roleName, email);
                }}
                className="space-y-4"
              >
                <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 p-3 rounded-xl text-xs font-bold leading-relaxed">
                  🎉 SMS Sent! For testing, check the floating notification on top or enter the code: <span className="font-mono text-sm bg-white border border-emerald-500 px-1.5 py-0.5 rounded">{simulatedOtpCode}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.verifyOtp}
                  </label>
                  <div className="flex border-3 border-[#1a1a1a] rounded-xl overflow-hidden">
                    <div className="px-3 bg-slate-100 border-r-3 border-[#1a1a1a] flex items-center">
                      <KeyRound className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="flex-1 px-4 py-3 bg-white font-mono font-bold text-center tracking-[0.5em] text-slate-800 placeholder:text-slate-200 text-2xl outline-none"
                      required
                      autoFocus
                    />
                  </div>
                  {otpError && <p className="text-xs font-bold text-rose-600 mt-1.5">{otpError}</p>}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      setSimulatedOtpCode(code);
                      setOtpCode('');
                      setOtpError('');
                      setSmsNotification({
                        show: true,
                        text: `🔑 Shiksha Sathi Security Code: ${code}. Valid for 10 minutes. Please enter this to login.`
                      });
                    }}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border-2 border-[#1a1a1a] rounded-xl font-bold text-slate-700 text-xs transition-colors"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#5e43ff] hover:bg-[#4b35e0] border-2 border-[#1a1a1a] text-white rounded-xl font-bold text-xs"
                  >
                    Verify & Sign In
                  </button>
                </div>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtpCode('');
                setOtpError('');
                setActiveLoginStep('auth-method');
              }}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mt-2"
            >
              ← Back
            </button>
          </div>
        )}

      </div>

      {/* Customized footer */}
      <div className="mt-8 text-center text-xs font-bold text-slate-400 select-none">
        Shiksha Sathi © 2026 | Empowering Coding & Robotics Classrooms
      </div>

      {/* CUSTOM SIMULATED FLOATING SMS TOAST */}
      {smsNotification?.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-[#FFFDE7] border-3 border-amber-600 rounded-2xl p-4 shadow-[5px_5px_0px_rgba(217,119,6,0.3)] z-[9999] flex gap-3 animate-bounce">
          <div className="p-2 bg-amber-100 border border-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <span className="block text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">Simulated SMS Alert</span>
            <p className="text-xs font-bold text-slate-800 leading-normal mt-1">
              {smsNotification.text}
            </p>
          </div>
          <button
            onClick={() => setSmsNotification(prev => prev ? { ...prev, show: false } : null)}
            className="p-1 text-amber-800 hover:text-amber-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
