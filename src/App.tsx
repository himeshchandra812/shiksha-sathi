import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Wrench, 
  Send, 
  Sparkles, 
  Languages, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Clock, 
  ChevronRight, 
  RefreshCw, 
  User, 
  Bot, 
  FileText, 
  Clipboard, 
  Check, 
  Printer, 
  Sparkle,
  X,
  Play,
  Smartphone,
  KeyRound,
  LogIn,
  LogOut,
  GraduationCap,
  School,
  Cpu
} from 'lucide-react';
import HardwareVisualizer from './components/HardwareVisualizer';
import LoginPortal from './components/LoginPortal';
import TeacherAISuite from './components/TeacherAISuite';
import StudentDoubtsTracker from './components/StudentDoubtsTracker';
import StudentQuizHub from './components/StudentQuizHub';
import LeaderboardTracker from './components/LeaderboardTracker';

// Multi-language translation dictionary for the app interface
const translations = {
  en: {
    title: "Shiksha Sathi",
    subtitle: "Teacher's Coding Copilot",
    statusReady: "AI ASSISTANT READY",
    quickTemplates: "Quick Templates",
    lessonPlanTitle: "Create Lesson Plan",
    doubtTitle: "Explain a Doubt",
    hardwareTitle: "Fix Hardware Issue",
    studentAskDoubtTitle: "Ask Coding Doubt",
    studentHardwareHelpTitle: "Circuit & Wiring Help",
    studentConceptTitle: "Explain Concept to Me",
    quote: '"Coding is just another way of telling a story. Don\'t worry, I am here with you!"',
    placeholderTeacher: "Ask Teacher Co-Pilot (Lesson plans, classroom SOS, hardware diagnostics, analogies)...",
    placeholderStudent: "Ask Student Sathi (Scratch help, circuit questions, debugging, concept doubts)...",
    send: "SEND",
    welcomeMsg: "Hello Teacher! I am Shiksha Sathi, your senior partner in teaching coding and robotics. Ask me to design 45-minute lesson plans, generate classroom analogies, troubleshoot lab hardware, or handle classroom management situations!",
    welcomeStudentMsg: "Hello Student! I am Shiksha Sathi, your friendly coding and robotics buddy! Ask me any doubt about Scratch, Python, or circuits, and I will help you learn step-by-step with fun real-world examples!",
    teacherChatBadge: "👨‍🏫 Teacher STEM Co-Pilot (Pedagogical AI)",
    studentChatBadge: "🎒 Student AI Sathi (Socratic Coding Buddy)",
    guardrailBadge: "🛡️ Academic Safe Mode Active",
    topicLabel: "Topic / Lesson Name",
    topicPlaceholder: "e.g., Intro to Scratch, LED Blinking, Ultrasonic Sensor",
    gradeLabel: "Grade Level / Class",
    gradePlaceholder: "e.g., Class 6, Grade 3-5",
    difficultyLabel: "Difficulty Level",
    generateBtn: "Create Prompt & Send",
    studentDoubtLabel: "What concept or doubt is the student asking?",
    doubtPlaceholder: "e.g., What is a loop? or Why is code compiled?",
    studentAgeLabel: "Student Age Group",
    studentAgePlaceholder: "e.g., 10 years old, 5th standard",
    componentLabel: "Hardware Component",
    componentPlaceholder: "e.g., Arduino Uno, LED, Buzzer, DC Motor",
    problemLabel: "Describe what is happening / error",
    problemPlaceholder: "e.g., LED is not turning on, motor won't spin, computer doesn't detect Arduino",
    causeLabel: "Most Likely Cause",
    analogyLabel: "Simple Real-World Analogy",
    classroomDialogue: "Classroom Dialogue (Say this in class)",
    lessonPlanDetails: "Lesson Plan Details",
    learningObjective: "Learning Objective",
    materialsNeeded: "Materials Needed",
    warmUp: "Warm-up Activity",
    mainActivity: "Main Activity (Step-by-Step)",
    commonQuestions: "Expected Student Questions",
    wrapUp: "Wrap-up & Review",
    totalDuration: "Total Duration",
    closeForm: "Cancel",
    stepInteractiveTip: "Troubleshooting Checklist (Check off as you fix):",
    loadingState: "Thinking with care...",
    noApiKeyWarning: "Warning: GEMINI_API_KEY is not configured on the server. Please add it to your secrets.",
    copySuccess: "Copied successfully!",
    printBtn: "Print Plan",
    copyBtn: "Copy Text",
    faqsTab: "FAQs Guide",
    chatTab: "AI Assistant Chat",
    doubtsTab: "Student Doubts Hub",
    quizTab: "Live Quiz Arena",
    leaderboardTab: "Leaderboard 🏆",
    faqsTitle: "Frequently Asked Questions",
    faqsSubtitle: "Quick, offline answers for common coding, robotics, and classroom challenges.",
    askAiBtn: "Ask Assistant about this",
    loginTitle: "Shiksha Sathi Portal",
    loginSubtitle: "Sign in to access your customized coding & robotics dashboard",
    selectRole: "Select Your Role",
    teacherRole: "Teacher / शिक्षक",
    studentRole: "Student / छात्र",
    loginWithGoogle: "Sign in with Google",
    loginWithMobile: "Verify with Mobile OTP",
    enterMobile: "Enter Mobile Number",
    sendOtp: "Send OTP Verification",
    verifyOtp: "Verify Security Code",
    enterOtp: "Enter 6-digit Code",
    backToRole: "Change Role",
    visualizerTab: "Circuit Visualizer",
    teacherToolsTab: "Teacher AI Suite",
    logoutBtn: "Log Out",
    welcomeUser: "Welcome",
    submitting: "Signing in...",
    clearChat: "Clear Chat History",
    quickStarters: "Quick Starters"
  },
  hi: {
    title: "शिक्षा साथी",
    subtitle: "शिक्षकों का कोडिंग कोपायलट",
    statusReady: "एआई सहायक तैयार है",
    quickTemplates: "त्वरित टेम्प्लेट",
    lessonPlanTitle: "पाठ योजना बनाएं",
    doubtTitle: "छात्र की शंका सुलझाएं",
    hardwareTitle: "हार्डवेयर समस्या सुलझाएं",
    studentAskDoubtTitle: "कोडिंग शंका पूछें",
    studentHardwareHelpTitle: "सर्किट और वायरिंग सहायता",
    studentConceptTitle: "अवधारणा समझें",
    quote: '"कोडिंग कहानी सुनाने का एक और तरीका है। चिंता न करें, मैं आपके साथ हूँ!"',
    placeholderTeacher: "शिक्षक कोपायलट से पूछें (पाठ योजना, कक्षा प्रबंधन, हार्डवेयर निदान)...",
    placeholderStudent: "छात्र साथी से पूछें (स्क्रैच मदद, सर्किट प्रश्न, कोडिंग शंकाएं)...",
    send: "भेजें",
    welcomeMsg: "नमस्ते शिक्षक साथी! मैं शिक्षा साथी हूँ, कोडिंग और रोबोटिक्स सिखाने में आपका वरिष्ठ साथी। मुझसे 45-मिनट की पाठ योजना, कक्षा उदाहरण, या रोबोटिक्स लैब हार्डवेयर सुधारने के लिए कहें!",
    welcomeStudentMsg: "नमस्ते छात्र साथी! मैं शिक्षा साथी हूँ, आपका कोडिंग और रोबोटिक्स मित्र! स्क्रैच, पाइथन या सर्किट से जुड़ी कोई भी शंका पूछें, मैं आसान उदाहरणों के साथ कदम-दर-कदम समझाऊंगा!",
    teacherChatBadge: "👨‍🏫 शिक्षक STEM कोपायलट (शिक्षा विशेषज्ञ AI)",
    studentChatBadge: "🎒 छात्र AI साथी (मित्रवत कोडिंग ट्यूटर)",
    guardrailBadge: "🛡️ शैक्षणिक सुरक्षा मोड सक्रिय",
    topicLabel: "विषय / पाठ का नाम",
    topicPlaceholder: "जैसे: स्क्रैच का परिचय, एलईडी जलाना, सेंसर",
    gradeLabel: "कक्षा का स्तर (Grade)",
    gradePlaceholder: "जैसे: कक्षा 6, कक्षा 3-5",
    difficultyLabel: "कठिनाई स्तर",
    generateBtn: "प्रॉम्ट बनाएं और भेजें",
    studentDoubtLabel: "छात्र क्या अवधारणा या शंका पूछ रहा है?",
    doubtPlaceholder: "जैसे: लूप (loop) क्या है? या वेरिएबल क्या है?",
    studentAgeLabel: "छात्र का आयु वर्ग / कक्षा",
    studentAgePlaceholder: "जैसे: 10 वर्ष, 5वीं कक्षा",
    componentLabel: "हार्डवेयर घटक (Component)",
    componentPlaceholder: "जैसे: आरडूिनो (Arduino), एलईडी, मोटर",
    problemLabel: "समस्या या त्रुटि का वर्णन करें",
    problemPlaceholder: "जैसे: एलईडी नहीं जल रहा, कंप्यूटर आरडूिनो को नहीं पहचान रहा",
    causeLabel: "सबसे संभावित कारण",
    analogyLabel: "सरल वास्तविक-जीवन उदाहरण",
    classroomDialogue: "कक्षा में बच्चों से यह कहें",
    lessonPlanDetails: "पाठ योजना का विवरण",
    learningObjective: "सीखने का उद्देश्य",
    materialsNeeded: "आवश्यक सामग्री",
    warmUp: "शुरुआती गतिविधि (Warm-up)",
    mainActivity: "मुख्य गतिविधि (चरण-दर-चरण)",
    commonQuestions: "संभावित प्रश्न और उत्तर",
    wrapUp: "निष्कर्ष और समीक्षा (Wrap-up)",
    totalDuration: "कुल अवधि",
    closeForm: "रद्द करें",
    stepInteractiveTip: "समस्या निवारण चेकलिस्ट (काम करते समय टिक करें):",
    loadingState: "पूरी समझदारी से विचार कर रहा हूँ...",
    noApiKeyWarning: "चेतावनी: सर्वर पर GEMINI_API_KEY कॉन्फ़िगर नहीं है। कृपया इसे अपने सीक्रेट्स में जोड़ें।",
    copySuccess: "कॉपी हो गया!",
    printBtn: "प्रिंट करें",
    copyBtn: "कॉपी करें",
    faqsTab: "सामान्य प्रश्न",
    chatTab: "एआई सहायक चैट",
    doubtsTab: "छात्र शंका केंद्र",
    quizTab: "लाइव क्विज़",
    leaderboardTab: "लीडरबोर्ड 🏆",
    faqsTitle: "अक्सर पूछे जाने वाले प्रश्न",
    faqsSubtitle: "कोडिंग, रोबोटिक्स और कक्षा प्रबंधन की समस्याओं के त्वरित ऑफ़लाइन समाधान।",
    askAiBtn: "इसके बारे में सहायक से पूछें",
    loginTitle: "शिक्षा साथी पोर्टल",
    loginSubtitle: "अपने कस्टमाइज़्ड कोडिंग और रोबोटिक्स डैशबोर्ड तक पहुंचने के लिए साइन इन करें",
    selectRole: "अपनी भूमिका चुनें",
    teacherRole: "शिक्षक / Teacher",
    studentRole: "छात्र / Student",
    loginWithGoogle: "गूगल अकाउंट से लॉगिन करें",
    loginWithMobile: "मोबाइल ओटीपी से सत्यापित करें",
    enterMobile: "मोबाइल नंबर दर्ज करें",
    sendOtp: "ओटीपी सत्यापन कोड भेजें",
    verifyOtp: "सुरक्षा कोड सत्यापित करें",
    enterOtp: "6-अंकीय कोड दर्ज करें",
    backToRole: "भूमिका बदलें",
    visualizerTab: "सर्किट विज़ुअलाइज़र",
    teacherToolsTab: "शिक्षक एआई सुइट",
    logoutBtn: "लॉग आउट",
    welcomeUser: "स्वागत है",
    submitting: "लॉगिन किया जा रहा है...",
    clearChat: "चैट साफ़ करें",
    quickStarters: "त्वरित सुझाव"
  },
  te: {
    title: "శిక్షా సాథి",
    subtitle: "టీచర్స్ కోడింగ్ కోపైలట్",
    statusReady: "AI సహాయకుడు సిద్ధంగా ఉంది",
    quickTemplates: "త్వరిత టెంప్లేట్లు",
    lessonPlanTitle: "పాఠ్య ప్రణాళిక సృష్టించు",
    doubtTitle: "సందేహం నివృత్తి చేయి",
    hardwareTitle: "హార్డ్‌వేర్ సమస్య పరిష్కరించు",
    studentAskDoubtTitle: "కోడింగ్ సందేహం అడగండి",
    studentHardwareHelpTitle: "సర్క్యూట్ వైరింగ్ సహాయం",
    studentConceptTitle: "కాన్సెప్ట్ వివరించండి",
    quote: '"కోడింగ్ అనేది కథ చెప్పడానికి మరొక మార్గం మాత్రమే. చింతించకండి, నేను మీతో ఉన్నాను!"',
    placeholderTeacher: "టీచర్ కోపైలట్‌ను అడగండి (పాఠ్య ప్రణాళిక, క్లాస్‌రూమ్ నిర్వహణ, హార్డ్‌వేర్)...",
    placeholderStudent: "విద్యార్థి సాథిని అడగండి (స్క్రాచ్ సహాయం, సర్క్యూట్ ప్రశ్నలు, సందేహాలు)...",
    send: "పంపించు",
    welcomeMsg: "నమస్తే ఉపాధ్యాయులారా! నేను మీ శిక్షా సాథి, కోడింగ్ మరియు రోబోటిక్స్ బోధించడంలో మీ సీనియర్ భాగస్వామిని. 45 నిమిషాల పాఠ్య ప్రణాళికలు, క్లాస్‌రూమ్ ఉపమానాలు లేదా రోబోటిక్స్ ల్యాబ్ సమస్యలను పరిష్కరించడానికి నన్ను అడగండి!",
    welcomeStudentMsg: "నమస్తే విద్యార్థి మిత్రమా! నేను మీ శిక్షా సాథి, కోడింగ్ మరియు రోబోటిక్స్ నేర్చుకోవడంలో మీ స్నేహితుడిని! స్క్రాచ్, పైథాన్ లేదా సర్క్యూట్ సందేహాలను అడగండి, సరళమైన ఉదాహరణలతో నేర్పిస్తాను!",
    teacherChatBadge: "👨‍🏫 ఉపాధ్యాయ STEM కోపైలట్ (పెడగోజికల్ AI)",
    studentChatBadge: "🎒 విద్యార్థి AI సాథి (కోడింగ్ మిత్రుడు)",
    guardrailBadge: "🛡️ విద్యా భద్రతా మోడ్ యాక్టివ్",
    topicLabel: "అంశం / పాఠం పేరు",
    topicPlaceholder: "ఉదా: స్క్రాచ్ పరిచయం, LED బ్లింక్ చేయడం",
    gradeLabel: "తరగతి స్థాయి",
    gradePlaceholder: "ఉదా: 6వ తరగతి, 3-5వ తరగతి",
    difficultyLabel: "కఠినత స్థాయి",
    generateBtn: "ప్రాంప్ట్ సృష్టించి పంపండి",
    studentDoubtLabel: "విద్యార్థి అడుగుతున్న సందేహం ఏమిటి?",
    doubtPlaceholder: "ఉదా: లూప్ అంటే ఏమిటి? వేరియబుల్ అంటే ఏమిటి?",
    studentAgeLabel: "విద్యార్థి వయస్సు సమూహం",
    studentAgePlaceholder: "ఉదా: 10 సంవత్సరాలు, 5వ తరగతి",
    componentLabel: "హార్డ్‌వేర్ భాగం (Component)",
    componentPlaceholder: "ఉదా: ఆర్డుఇనో, LED, మోటార్",
    problemLabel: "సమస్యను లేదా లోపాన్ని వివరించండి",
    problemPlaceholder: "ఉదా: LED వెలగడం లేదు, ఆర్డుఇనో గుర్తించడం లేదు",
    causeLabel: "అత్యంత సంభవించే కారణం",
    analogyLabel: "సాధారణ నిజ-ప్రపంచ పోలిక",
    classroomDialogue: "తరగతి గది సంభాషణ (ఇలా చెప్పండి)",
    lessonPlanDetails: "పాఠ్య ప్రణాళిక వివరాలు",
    learningObjective: "నేర్చుకునే లక్ష్యం",
    materialsNeeded: "కావలసిన వస్తువులు",
    warmUp: "వార్మ్-అప్ కార్యాచరణ",
    mainActivity: "ప్రధాన కార్యాచరణ (దశల వారీగా)",
    commonQuestions: "ఆశించే విద్యార్థుల ప్రశ్నలు",
    wrapUp: "ముగింపు & సమీక్ష",
    totalDuration: "మొత్తం సమయం",
    closeForm: "రద్దు చేయి",
    stepInteractiveTip: "సమస్య పరిష్కార చెక్‌లిస్ట్ (చేసేటప్పుడు టిక్ చేయండి):",
    loadingState: "ఆలోచిస్తున్నాను...",
    noApiKeyWarning: "హెచ్చరిక: GEMINI_API_KEY కాన్ఫిగర్ చేయబడలేదు. దయచేసి దీన్ని మీ సీక్రెట్స్‌లో చేర్చండి.",
    copySuccess: "కాపీ చేయబడింది!",
    printBtn: "ప్రింట్ చేయి",
    copyBtn: "కాపీ చేయి",
    faqsTab: "తరచుగా అడిగే ప్రశ్నలు",
    chatTab: "AI సహాయక చాట్",
    doubtsTab: "విద్యార్థుల సందేహాల కేంద్రం",
    quizTab: "లైవ్ క్విజ్",
    leaderboardTab: "లీడర్‌బోర్డ్ 🏆",
    faqsTitle: "తరచుగా అడిగే ప్రశ్నలు (FAQs)",
    faqsSubtitle: "కోడింగ్, రోబోటిక్స్ మరియు క్లాస్‌రూమ్ సమస్యలకు త్వరిత ఆఫ్‌లైన్ సమాధానాలు.",
    askAiBtn: "దీని గురించి సహాయకుడిని అడగండి",
    loginTitle: "శిక్షా సాథి పోర్టల్",
    loginSubtitle: "మీ అనుకూలీకరించిన కోడింగ్ & రోబోటిక్స్ డాష్‌బోర్డ్‌ను యాక్సెస్ చేయడానికి సైన్ ఇన్ చేయండి",
    selectRole: "మీ పాత్రను ఎంచుకోండి",
    teacherRole: "ఉపాధ్యాయుడు / Teacher",
    studentRole: "విద్యార్థి / Student",
    loginWithGoogle: "గూగుల్ ఖాతాతో లాగిన్ అవ్వండి",
    loginWithMobile: "మొబైల్ OTP తో ధృవీకరించండి",
    enterMobile: "మొబైల్ నంబర్ నమోదు చేయండి",
    sendOtp: "OTP ధృవీకరణ కోడ్ పంపండి",
    verifyOtp: "భద్రతా కోడ్‌ను ధృవీకరించండి",
    enterOtp: "6-అంకెల కోడ్‌ను నమోదు చేయండి",
    backToRole: "పాత్రను మార్చండి",
    visualizerTab: "సర్క్యూట్ విజువలైజర్",
    teacherToolsTab: "ఉపాధ్యాయ ఎఐ సూట్",
    logoutBtn: "లాగ్ అవుట్",
    welcomeUser: "స్వాగతం",
    submitting: "లాగిన్ అవుతోంది...",
    clearChat: "చాట్ క్లియర్ చేయి",
    quickStarters: "త్వరిత ప్రాంప్ట్‌లు"
  }
};

interface FAQItem {
  id: string;
  category: {
    en: string;
    hi: string;
    te: string;
  };
  question: {
    en: string;
    hi: string;
    te: string;
  };
  answer: {
    en: string;
    hi: string;
    te: string;
  };
}

const faqsList: FAQItem[] = [
  {
    id: "var-analogy",
    category: {
      en: "Coding Concepts",
      hi: "कोडिंग अवधारणाएं",
      te: "కోడింగ్ కాన్సెప్ట్స్"
    },
    question: {
      en: "How do I explain coding 'variables' to students without computer jargon?",
      hi: "कंप्यूटर की तकनीकी भाषा के बिना छात्रों को कोडिंग 'वेरिएबल्स' कैसे समझाऊं?",
      te: "కంప్యూటర్ పరిభాష లేకుండా విద్యార్థులకు కోడింగ్ 'వేరియబుల్స్' ఎలా వివరించాలి?"
    },
    answer: {
      en: "Use the 'labeled box' analogy: Tell students a variable is like a storage box with a name tag written on it. Inside the box, you can keep a number, a word, or a secret message. If you write 'Score' on the tag, you can store '0' inside. If they win a point, you open the box, rub out '0', and write '1'. You can change what's inside, but the name tag ('Score') stays the same!",
      hi: "नाम-टैग वाले डिब्बे का उदाहरण दें: छात्रों को बताएं कि वेरिएबल एक डिब्बे जैसा है जिसके ऊपर एक नाम-टैग लिखा होता है। इस डिब्बे में आप कोई संख्या, शब्द या गुप्त संदेश रख सकते हैं। यदि आप टैग पर 'अंक' लिखते हैं, तो आप अंदर '0' रख सकते हैं। यदि वे एक अंक जीतते हैं, तो आप डिब्बा खोलते हैं, '0' मिटाते हैं और '1' लिखते हैं। अंदर की चीज़ बदल सकती है, लेकिन डिब्बे का नाम ('अंक') वही रहता है!",
      te: "ఒక 'పేరు ట్యాగ్ కలిగిన పెట్టె' పోలికను ఉపయోగించండి: వేరియబుల్ అనేది పేరు ట్యాగ్ కలిగిన పెట్టె లాంటిదని విద్యార్థులకు చెప్పండి. దీనిలో ఒక సంఖ్యను లేదా పదాన్ని దాచవచ్చు. ఉదాహరణకు పెట్టెపై 'స్కోరు' అని రాసి, లోపల '0' పెట్టవచ్చు. విద్యార్థి గెలిస్తే, పెట్టె తెరిచి '0' తీసివేసి '1' రాయవచ్చు. పెట్టెలో ఉన్న విలువ మారవచ్చు కానీ ట్యాగ్ పేరు మారదు."
    }
  },
  {
    id: "loop-activity",
    category: {
      en: "Coding Concepts",
      hi: "कोडिंग अवधारणाएं",
      te: "కోడింగ్ కాన్సెప్ట్స్"
    },
    question: {
      en: "How can I teach 'loops' through a physical classroom activity?",
      hi: "एक शारीरिक गतिविधि के माध्यम से मैं कक्षा में 'लूप' कैसे सिखा सकता हूँ?",
      te: "శారీరక శ్రమ ద్వారా తరగతి గదిలో 'లూప్స్' ఎలా బోధించగలను?"
    },
    answer: {
      en: "Ask students to stand up and give an instruction: 'Clap 5 times.' Then explain: 'Instead of saying clap, clap, clap, clap, clap, I used a LOOP: Repeat 5 times [Clap].' You can also do a physical dance loop: 'Repeat 3 times [Step right, Clap]'. It saves space in code and effort in speaking, exactly like a computer loop!",
      hi: "छात्रों को खड़ा करें और निर्देश दें: '5 बार ताली बजाएं।' फिर समझाएं: 'मैंने पांच बार ताली, ताली, ताली कहने के बजाय एक लूप (LOOP) का उपयोग किया: 5 बार दोहराएं [ताली बजाएं]। यह कोड में जगह और बोलने में मेहनत बचाता है, बिल्कुल कंप्यूटर लूप की तरह!'",
      te: "విద్యార్థులను నిలబడమని చెప్పి ఒక ఇన్స్ట్రక్షన్ ఇవ్వండి: '5 సార్లు చప్పట్లు కొట్టండి'. 'చప్పట్లు చప్పట్లు...' అని 5 సార్లు చెప్పడానికి బదులుగా, నేను లూప్ (LOOP) ఉపయోగించాను: 5 సార్లు పునరావృతం చేయి [చప్పట్లు]. ఇది కోడింగ్‌లో సమయాన్ని, కంప్యూటర్ శ్రమను ఆదా చేస్తుంది."
    }
  },
  {
    id: "arduino-undetected",
    category: {
      en: "Robotics & Hardware",
      hi: "रोबोटिक्स और हार्डवेयर",
      te: "రోబోటిక్స్ & హార్డ్‌వేర్"
    },
    question: {
      en: "What should I check if the Arduino Uno is not detected by the computer?",
      hi: "यदि कंप्यूटर द्वारा Arduino Uno का पता नहीं चल रहा है, तो मुझे क्या जांचना चाहिए?",
      te: "కంప్యూటర్ ఆర్డుఇనోని గుర్తించనప్పుడు నేను మొదట ఏమి తనిఖీ చేయాలి?"
    },
    answer: {
      en: "1. Check the cable: Ensure the USB cable is fully plugged in. Try a different USB port on your computer.\n2. Check the green power LED on the board: If it is not glowing, the cable or board might be faulty.\n3. Driver issues: Ensure you selected the correct port in the Arduino IDE under Tools -> Port. If Port is greyed out, download the CH340 USB driver (common for clone boards).",
      hi: "1. केबल की जांच करें: सुनिश्चित करें कि यूएसबी केबल पूरी तरह लगा है। कंप्यूटर के दूसरे पोर्ट में लगाकर देखें।\n2. बोर्ड पर हरी बत्ती (LED) देखें: यदि वह नहीं जल रही है, तो केबल या बोर्ड में खराबी हो सकती है।\n3. ड्राइवर समस्या: Arduino IDE में Tools -> Port के तहत सही पोर्ट चुनें। यदि पोर्ट का विकल्प धूसर (greyed out) है, तो CH340 यूएसबी ड्राइवर इंस्टॉल करें।",
      te: "1. కేబుల్ తనిఖీ చేయండి: USB కేబుల్ సరిగ్గా అమర్చబడిందో లేదో చూడండి. వేరే USB పోర్ట్ ప్రయత్నించండి.\n2. బోర్డు పవర్ LED చూడండి: అది వెలగకపోతే కేబుల్ లేదా బోర్డు పాడై ఉండవచ్చు.\n3. పోర్ట్ ఎంచుకోండి: Arduino IDE లో Tools -> Port లో సరైన COM పోర్ట్ ఎంచుకోండి. ఒకవేళ పోర్ట్ ఆప్షన్ కనిపించకపోతే CH340 డ్రైవర్ ఇన్‌స్టాల్ చేసుకోండి."
    }
  },
  {
    id: "led-no-blink",
    category: {
      en: "Robotics & Hardware",
      hi: "रोबोटिक्स और हार्डवेयर",
      te: "రోబోటిక్స్ & హార్డ్‌వేర్"
    },
    question: {
      en: "Why is the LED not blinking even though the code uploaded successfully?",
      hi: "कोड सफलतापूर्वक अपलोड होने के बाद भी एलईडी क्यों नहीं जल रहा है?",
      te: "కోడ్ విజయవంతంగా అప్‌లోడ్ అయినా LED ఎందుకు బ్లింక్ కావడం లేదు?"
    },
    answer: {
      en: "1. Polarity Check: LEDs only work in one direction. The longer leg (positive) must connect to the Arduino signal pin, and the shorter leg (negative) to ground (GND).\n2. Pin Number: Ensure the digital pin specified in your code (e.g., pin 13) matches the physical pin on the board where your wire is plugged.\n3. Bad Connections: Check if wires are loose on the breadboard or Arduino pin holes.",
      hi: "1. ध्रुवीयता (Polarity): एलईडी केवल एक ही दिशा में करंट प्रवाहित करती है। लंबी टांग (पॉजिटिव) को डिजिटल पिन से और छोटी टांग (नेगेटिव) को GND से जोड़ें।\n2. पिन नंबर: सुनिश्चित करें कि कोड में लिखा गया पिन नंबर (जैसे पिन 13) उसी पिन से मेल खाता है जहां तार भौतिक रूप से लगा है।\n3. ढीले कनेक्शन: ब्रेडबोर्ड या आरडूिनो पिन होल पर तारों के ढीले होने की जांच करें।",
      te: "1. ధృవణత (Polarity): LED ఒక దిశలోనే పనిచేస్తుంది. పొడవైన కాలును (పాజిటివ్) సిగ్నల్ పిన్‌కు, పొట్టి కాలును (నెగటివ్) GND కి కలపాలి.\n2. పిన్ నంబర్: కోడ్‌లో రాసిన పిన్ నంబర్, వైరింగ్ చేసిన పిన్ నంబర్ ఒకటో కాదో సరిచూసుకోండి.\n3. లూజ్ కనెక్షన్స్: బ్రెడ్‌బోర్డ్ లేదా ఆర్డుఇనో హోల్స్ లో వైర్లు సరిగ్గా అమర్చబడి ఉన్నాయో లేదో చూడండి."
    }
  },
  {
    id: "offline-work",
    category: {
      en: "Classroom Management",
      hi: "कक्षा प्रबंधन",
      te: "క్లాస్‌రూమ్ మేనేజ్‌మెంట్"
    },
    question: {
      en: "Can we still teach coding and robotics if our school has slow or no internet?",
      hi: "यदि हमारे स्कूल में धीमा या कोई इंटरनेट नहीं है, तो क्या हम अभी भी कोडिंग सिखा सकते हैं?",
      te: "మా పాఠశాలలో ఇంటర్నెట్ లేకపోయినా కోడింగ్, రోబోటిక్స్ బోధించవచ్చా?"
    },
    answer: {
      en: "Yes, absolutely! Download and use the Scratch Desktop Offline version on student computers once—it runs 100% offline. The Arduino IDE also compiles and uploads code to physical boards completely without internet. You can also teach offline paper coding activities using arrow grids!",
      hi: "हाँ, बिल्कुल! छात्र कंप्यूटरों पर एक बार 'Scratch Desktop Offline' संस्करण डाउनलोड कर लें—यह 100% ऑफ़लाइन चलता है। Arduino IDE भी पूरी तरह इंटरनेट के बिना कोड को संकलित और अपलोड करता है। आप कागज़ पर तीरों और ग्रिड की मदद से बिना कंप्यूटर के भी कोडिंग सिखा सकते हैं!",
      te: "అవును, ఖచ్చితంగా! విద్యార్థుల కంప్యూటర్లలో ఒకసారి 'Scratch Desktop Offline' వర్షన్ డౌన్‌లోడ్ చేసుకుంటే ఇది 100% ఆఫ్‌లైన్‌లో పనిచేస్తుంది. Arduino IDE కూడా ఇంటర్నెట్ లేకుండా పనిచేస్తుంది. మీరు పేపర్ మరియు పెన్సిల్ ఉపయోగించి కూడా కోడింగ్ నేర్పించవచ్చు."
    }
  }
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFlagged?: boolean;
  flagReason?: string;
}

interface Section {
  title: string;
  content: string;
  type: 'general' | 'lesson-plan' | 'objective' | 'materials' | 'analogy' | 'cause' | 'steps' | 'dialogue' | 'timing' | 'questions';
}

// A component to print or render parsed sections with proper layout styles and high visual quality
function ParsedMessage({ text, language }: { text: string; language: 'en' | 'hi' | 'te' }) {
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Logic to parse the model output into stylized chunks
  const parseSections = (rawText: string): Section[] => {
    const lines = rawText.split('\n');
    const sections: Section[] = [];
    let currentSection: Section = { title: '', content: '', type: 'general' };

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) {
        if (currentSection.content) {
          currentSection.content += '\n';
        }
        continue;
      }

      // Check if this line is a prominent heading
      const headerMatch = cleanLine.match(/^(?:###|##|\*|-)\s*\*\*?([^*:]+)\*\*?:?/i) || 
                          cleanLine.match(/^\*\*([^*:]+)\*\*:?/i) ||
                          cleanLine.match(/^([A-Z\s]+):/);

      if (headerMatch) {
        if (currentSection.title || currentSection.content) {
          sections.push(currentSection);
        }
        const title = headerMatch[1].trim();
        let type: Section['type'] = 'general';
        const lowerTitle = title.toLowerCase();

        // Map titles to appropriate stylized layouts
        if (lowerTitle.includes('topic') || lowerTitle.includes('grade') || lowerTitle.includes('विषय') || lowerTitle.includes('అంశం') || lowerTitle.includes('level')) {
          type = 'lesson-plan';
        } else if (lowerTitle.includes('objective') || lowerTitle.includes('उद्देश्य') || lowerTitle.includes('లక్ష్యం')) {
          type = 'objective';
        } else if (lowerTitle.includes('material') || lowerTitle.includes('सामग्री') || lowerTitle.includes('వస్తువులు')) {
          type = 'materials';
        } else if (lowerTitle.includes('analogy') || lowerTitle.includes('सादृश्य') || lowerTitle.includes('సాదృశ్యం')) {
          type = 'analogy';
        } else if (lowerTitle.includes('cause') || lowerTitle.includes('कारण') || lowerTitle.includes('కారణం')) {
          type = 'cause';
        } else if (lowerTitle.includes('step') || lowerTitle.includes('fix') || lowerTitle.includes('चरण') || lowerTitle.includes('దశలు') || lowerTitle.includes('troubleshoot')) {
          type = 'steps';
        } else if (lowerTitle.includes('dialogue') || lowerTitle.includes('say this') || lowerTitle.includes('कक्षा') || lowerTitle.includes('సంభాషణ') || lowerTitle.includes('बच्चों') || lowerTitle.includes('say aloud')) {
          type = 'dialogue';
        } else if (lowerTitle.includes('duration') || lowerTitle.includes('timing') || lowerTitle.includes('अवधि') || lowerTitle.includes('సమయం')) {
          type = 'timing';
        } else if (lowerTitle.includes('question') || lowerTitle.includes('doubt') || lowerTitle.includes('प्रश्न') || lowerTitle.includes('ప్రశ్నలు')) {
          type = 'questions';
        }

        currentSection = { title, content: '', type };
      } else {
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    }

    if (currentSection.title || currentSection.content) {
      sections.push(currentSection);
    }

    if (sections.length === 0) {
      sections.push({ title: '', content: rawText, type: 'general' });
    }

    return sections;
  };

  const sections = parseSections(text);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (printContent) {
      try {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(`
            <html>
              <head>
                <title>${t.title} - Lesson Plan / Guide</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
                  h1 { color: #2D3142; border-bottom: 2px solid #FFE4A1; padding-bottom: 10px; }
                  h2 { color: #FF7E5F; margin-top: 24px; font-size: 1.25rem; }
                  .card { background: #FAF9F6; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
                  .analogy { border-left: 4px solid #FBC02D; background: #FFFDE7; padding: 12px; }
                  .dialogue { border-left: 4px solid #4DB6AC; background: #E0F2F1; padding: 12px; font-style: italic; }
                  .step-item { display: flex; align-items: center; margin-bottom: 8px; }
                </style>
              </head>
              <body>
                <h1>Shiksha Sathi Copilot Output</h1>
                ${printContent}
              </body>
            </html>
          `);
          win.document.close();
          win.print();
        } else {
          window.print();
        }
      } catch {
        window.print();
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse individual steps inside a troubleshooting step section
  const renderStepsList = (content: string, sectionTitle: string) => {
    const stepLines = content.split('\n').filter(l => l.trim().length > 0);
    return (
      <div className="p-5 bg-[#F1F8E9] rounded-2xl border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] mt-3">
        <p className="text-xs font-bold text-[#33691E] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
          <Wrench className="w-4 h-4" /> {sectionTitle || t.hardwareTitle}
        </p>
        <p className="text-xs text-slate-500 mb-4 italic">{t.stepInteractiveTip}</p>
        <div className="space-y-3">
          {stepLines.map((line, idx) => {
            const cleanLine = line.replace(/^\d+[\s.)-]+\s*/, '').replace(/^[-*•]\s*/, '');
            const key = `${idx}-${cleanLine.substring(0, 15)}`;
            const isChecked = !!checkedSteps[key];
            return (
              <label 
                key={idx} 
                className={`flex items-start gap-3.5 p-2.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-[#1a1a1a] hover:bg-white/60 ${
                  isChecked ? 'opacity-60 bg-slate-100/50 line-through' : ''
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={() => setCheckedSteps(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="mt-0.5 h-4 w-4 rounded border-2 border-[#1a1a1a] text-[#5e43ff] focus:ring-[#5e43ff]"
                />
                <span className="text-sm font-semibold text-slate-800">
                  <span className="font-bold text-[#33691E] mr-1">{idx + 1}.</span> {cleanLine}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const isLessonPlan = sections.some(s => s.type === 'lesson-plan' || s.type === 'objective');

  return (
    <div className="space-y-5">
      {/* Dynamic Header Actions */}
      <div className="flex justify-end gap-2.5 shrink-0">
        <button 
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border-2 border-[#1a1a1a] rounded-xl hover:-translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a] transition-all ${
            copied ? 'bg-emerald-100 text-emerald-800 border-emerald-700' : 'bg-white text-[#1a1a1a]'
          }`}
        >
          <Clipboard className="w-3.5 h-3.5" /> {copied ? (language === 'hi' ? 'कॉपी हो गया! ✓' : language === 'te' ? 'కాపీ చేయబడింది! ✓' : 'Copied! ✓') : t.copyBtn}
        </button>
        {isLessonPlan && (
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-white bg-[#5e43ff] border-2 border-[#1a1a1a] rounded-xl hover:-translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a] transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> {t.printBtn}
          </button>
        )}
      </div>

      {/* Structured Content Area */}
      <div ref={printRef} className="space-y-5 text-slate-800 leading-relaxed text-sm">
        {sections.map((section, idx) => {
          // 1. Lesson Plan metadata card
          if (section.type === 'lesson-plan') {
            return (
              <div key={idx} className="p-5 bg-[#FFF8E1] rounded-2xl border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a]">
                <h3 className="font-bold text-[#E65100] text-base flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-[#E65100]" /> {section.title}
                </h3>
                <div className="text-slate-850 whitespace-pre-line text-sm font-semibold">
                  {section.content}
                </div>
              </div>
            );
          }

          // 2. Learning Objective card
          if (section.type === 'objective') {
            return (
              <div key={idx} className="p-5 bg-white rounded-2xl border-2 border-dashed border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex gap-3.5">
                <div className="w-9 h-9 bg-[#FFF3E0] rounded-xl flex items-center justify-center border-2 border-[#1a1a1a] shrink-0">
                  <Lightbulb className="w-5 h-5 text-[#E65100]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#E65100] text-sm mb-1">{section.title}</h4>
                  <p className="text-slate-850 whitespace-pre-line font-semibold text-sm">
                    {section.content}
                  </p>
                </div>
              </div>
            );
          }

          // 3. Materials checklist
          if (section.type === 'materials') {
            return (
              <div key={idx} className="p-5 bg-white border-2 border-[#1a1a1a] rounded-2xl shadow-[4px_4px_0px_#1a1a1a]">
                <h4 className="font-bold text-[#1a1a1a] text-sm flex items-center gap-2 mb-2">
                  <span className="text-lg">📦</span> {section.title}
                </h4>
                <div className="text-slate-800 pl-4 border-l-3 border-[#5e43ff] whitespace-pre-line font-semibold">
                  {section.content}
                </div>
              </div>
            );
          }

          // 4. Analogy callout (student doubt resolution)
          if (section.type === 'analogy') {
            return (
              <div key={idx} className="p-5 bg-[#FFF9C4] rounded-2xl border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a]">
                <h4 className="text-xs font-bold text-[#827717] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                  <Sparkle className="w-3.5 h-3.5 animate-pulse" /> {section.title}
                </h4>
                <p className="text-[#1a1a1a] italic font-bold text-sm leading-relaxed">
                  "{section.content.replace(/^["']|["']$/g, '')}"
                </p>
              </div>
            );
          }

          // 5. Classroom dialogue bubble
          if (section.type === 'dialogue') {
            return (
              <div key={idx} className="p-5 bg-[#E0F2F1] rounded-2xl border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex gap-3.5">
                <div className="w-8 h-8 rounded-full bg-teal-100 border-2 border-[#1a1a1a] flex items-center justify-center shrink-0 text-teal-700 text-sm font-bold">🗣️</div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#00695C] uppercase tracking-wide mb-1">{section.title}</h4>
                  <p className="text-slate-800 font-semibold text-sm">
                    {section.content}
                  </p>
                </div>
              </div>
            );
          }

          // 6. Hardware trouble cause
          if (section.type === 'cause') {
            return (
              <div key={idx} className="p-5 bg-[#FFEBEE] rounded-2xl border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex gap-3.5">
                <div className="w-9 h-9 bg-red-100 border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-red-700 text-sm mb-1">{section.title}</h4>
                  <p className="text-slate-800 whitespace-pre-line font-semibold text-sm">
                    {section.content}
                  </p>
                </div>
              </div>
            );
          }

          // 7. Hardware troubleshooting steps
          if (section.type === 'steps') {
            return <div key={idx}>{renderStepsList(section.content, section.title)}</div>;
          }

          // 8. Duration indicator
          if (section.type === 'timing') {
            return (
              <div key={idx} className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FFF3E0] text-[#E65100] rounded-full text-xs font-mono font-bold border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]">
                <Clock className="w-3.5 h-3.5 text-[#E65100]" />
                <span>{section.title}: {section.content}</span>
              </div>
            );
          }

          // 9. Standard markdown / general content blocks
          return (
            <div key={idx} className="p-4 bg-slate-50 border-2 border-[#1a1a1a] rounded-2xl shadow-[2px_2px_0px_#1a1a1a]">
              {section.title && <h4 className="font-bold text-slate-800 text-sm mb-1.5">{section.title}</h4>}
              <p className="text-slate-700 whitespace-pre-line leading-relaxed text-sm font-semibold">
                {section.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [activeTab, setActiveTab] = useState<'chat' | 'faqs' | 'visualizer' | 'teacher-tools' | 'doubts' | 'quiz' | 'leaderboard'>('chat');
  const [selectedModel, setSelectedModel] = useState<string>('sarvam-105b');
  const [pendingDoubtsCount, setPendingDoubtsCount] = useState<number>(2);
  
  // Dedicated user auth states
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const [faqCategory, setFaqCategory] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: translations.en.welcomeMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [timeString, setTimeString] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  // Clock update effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeString(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync / Load role-isolated and account-isolated chat history on userRole or userEmail change
  useEffect(() => {
    if (userRole && userEmail) {
      const storageKey = `shiksha_chat_${userRole}_${userEmail}`;
      const savedHistory = localStorage.getItem(storageKey);
      
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch (e) {
          console.error('Error loading saved chat:', e);
        }
      }

      // Default welcome message if no prior history
      const msg = userRole === 'student' 
        ? translations[language].welcomeStudentMsg 
        : translations[language].welcomeMsg;
      
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: msg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [userRole, userEmail]);

  // Persist messages to role & account specific localStorage
  useEffect(() => {
    if (userRole && userEmail && messages.length > 0) {
      const storageKey = `shiksha_chat_${userRole}_${userEmail}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, userRole, userEmail]);

  // Clear current role's chat history
  const handleClearChat = () => {
    if (userRole && userEmail) {
      const storageKey = `shiksha_chat_${userRole}_${userEmail}`;
      localStorage.removeItem(storageKey);
      const welcomeMsg = userRole === 'student' 
        ? translations[language].welcomeStudentMsg 
        : translations[language].welcomeMsg;
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: welcomeMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Form templates modal states
  const [activeForm, setActiveForm] = useState<'lesson' | 'doubt' | 'hardware' | 'student-doubt' | 'student-circuit' | 'student-concept' | null>(null);

  // Template Form States
  const [lessonTopic, setLessonTopic] = useState('');
  const [lessonGrade, setLessonGrade] = useState('');
  const [lessonDifficulty, setLessonDifficulty] = useState('Beginner');

  const [studentDoubt, setStudentDoubt] = useState('');
  const [studentAge, setStudentAge] = useState('');

  const [hardwareComponent, setHardwareComponent] = useState('');
  const [hardwareProblem, setHardwareProblem] = useState('');

  // Student specific modal states
  const [studentConceptTopic, setStudentConceptTopic] = useState('');
  const [studentCircuitQuery, setStudentCircuitQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Check backend health/apiKey configuration on load & poll pending doubts count
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && !data.hasApiKey) {
            setApiKeyMissing(true);
          } else if (data && data.hasApiKey) {
            setApiKeyMissing(false);
          }
        }
      } catch (err) {
        // Silently tolerate transient network reconnects
        console.warn('[Status] Backend status check pending connection...');
      }

      try {
        const res = await fetch('/api/doubts');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && data.doubts) {
            const pending = data.doubts.filter((d: any) => !d.isResolved).length;
            setPendingDoubtsCount(pending);
          }
        }
      } catch (err) {
        console.warn('[Doubts] Doubts poll pending connection...');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // Switch tab back to chat view
    setActiveTab('chat');

    // Clear main inputs or close forms
    if (!textToSend) {
      setInputText('');
    }
    setActiveForm(null);

    // Append user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          model: selectedModel,
          role: userRole,
          studentDetails: {
            name: userName || (userRole === 'student' ? 'Student in Class' : 'Teacher'),
            email: userEmail || (userRole === 'student' ? 'student@school.edu' : 'teacher@school.edu'),
            grade: 'Class 6A',
            role: userRole
          }
        })
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: data.text,
            isFlagged: data.isFlagged || false,
            flagReason: data.flagReason,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        if (data.isFlagged) {
          setPendingDoubtsCount(prev => prev + 1);
        }

        // If the message is from a student and was not already flagged by backend
        if (userRole === 'student' && !data.isFlagged) {
          const isHardware = /wire|led|sensor|pin|motor|arduino|resistor|breadboard/i.test(text);
          const isLogic = /loop|if|else|repeat|condition|variable/i.test(text);
          const category = isHardware ? 'hardware' : isLogic ? 'logic' : 'coding';

          fetch('/api/doubts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentName: userName || 'Student',
              studentEmail: userEmail || 'student@school.edu',
              studentGrade: 'Class 6A',
              doubt: text,
              category: category,
              topic: category === 'hardware' ? 'Circuits & Components' : category === 'logic' ? 'Control Logic' : 'Coding Inquiry',
              aiResponse: data.text
            })
          }).then(() => {
            setPendingDoubtsCount(prev => prev + 1);
          }).catch(err => console.error('Failed to log student doubt to tracker:', err));
        }

      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ *Error:* ${error.message || 'I had trouble connecting. Please check your internet or configuration.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Prompt using structured template inputs and send
  const handleGenerateLessonPlan = () => {
    if (!lessonTopic) return;
    const prompt = language === 'hi' 
      ? `कृपया कक्षा ${lessonGrade || 'सामान्य'} के लिए '${lessonTopic}' विषय पर ${lessonDifficulty} स्तर की एक सुंदर पाठ योजना (Lesson Plan) तैयार करें।`
      : language === 'te'
      ? `దయచేసి క్లాస్ ${lessonGrade || 'సాధారణ'} కోసం '${lessonTopic}' అంశంపై ${lessonDifficulty} స్థాయి పాఠ్య ప్రణాళికను (Lesson Plan) రూపొందించండి.`
      : `Please create a beautiful ${lessonDifficulty} level Lesson Plan on the topic '${lessonTopic}' for Grade/Class '${lessonGrade || 'General'}'.`;
    
    handleSendMessage(prompt);
    setLessonTopic('');
    setLessonGrade('');
  };

  const handleGenerateDoubtSolution = () => {
    if (!studentDoubt) return;
    const capturedDoubt = studentDoubt;
    const capturedAge = studentAge || 'Class 6';

    const prompt = language === 'hi'
      ? `एक छात्र (उम्र/कक्षा: ${capturedAge}) पूछ रहा है: "${capturedDoubt}"। कृपया मुझे इसे समझाने में मदद करें।`
      : language === 'te'
      ? `ఒక విద్యార్థి (వయస్సు/తరగతి: ${capturedAge}) ఇలా అడుగుతున్నాడు: "${capturedDoubt}"। దీనిని వివరించడానికి నాకు సహాయం చేయండి.`
      : `A student (Age group/Grade: ${capturedAge}) is asking: "${capturedDoubt}". Please help me resolve this doubt with an analogy and dialogue.`;

    // Log to doubts API
    fetch('/api/doubts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: userRole === 'student' ? (userName || 'Student') : 'Student in Class',
        studentEmail: userEmail || 'student@school.edu',
        studentGrade: capturedAge,
        doubt: capturedDoubt,
        category: 'general',
        topic: 'Classroom Doubt Resolution',
        aiResponse: 'Generating explanation...'
      })
    }).then(() => {
      setPendingDoubtsCount(prev => prev + 1);
    }).catch(err => console.error('Failed to log doubt:', err));

    handleSendMessage(prompt);
    setStudentDoubt('');
    setStudentAge('');
  };

  const handleGenerateHardwareFix = () => {
    if (!hardwareComponent) return;
    const prompt = language === 'hi'
      ? `आरडूिनो/रोबोटिक्स लैब में समस्या आ रही है: घटक '${hardwareComponent}' में यह त्रुटि हो रही है: "${hardwareProblem}"। कृपया समस्या निवारण के चरण बताएं।`
      : language === 'te'
      ? `హార్డ్‌వేర్ సమస్య ఉంది: '${hardwareComponent}' భాగంలో లోపం సంభవించింది: "${hardwareProblem}"। దయచేసి పరిష్కార మార్గాలు చూపండి.`
      : `Hardware troubleshooting requested for component: '${hardwareComponent}'. The issue is: "${hardwareProblem}". Please provide causes and fix steps starting with simplest first.`;

    handleSendMessage(prompt);
    setHardwareComponent('');
    setHardwareProblem('');
  };

  // Student specific generator handlers
  const handleStudentConceptSubmit = () => {
    if (!studentConceptTopic) return;
    const prompt = language === 'hi'
      ? `कृपया मुझे '${studentConceptTopic}' को एक मजेदार और आसान वास्तविक जीवन के उदाहरण से समझाएं!`
      : language === 'te'
      ? `దయచేసి '${studentConceptTopic}' ను నిజ జీవిత ఉదాహరణతో సులభంగా వివరించండి!`
      : `Please explain the concept '${studentConceptTopic}' to me using a fun, relatable real-world analogy and step-by-step example!`;
    handleSendMessage(prompt);
    setStudentConceptTopic('');
  };

  const handleStudentCircuitSubmit = () => {
    if (!studentCircuitQuery) return;
    const prompt = language === 'hi'
      ? `सर्किट/हार्डवेयर सवाल: "${studentCircuitQuery}"। कृपया मुझे सुरक्षित कनेक्शन और आसान पिन वायरिंग बताएं।`
      : language === 'te'
      ? `సర్క్యూట్ / హార్డ్‌వేర్ సందేహం: "${studentCircuitQuery}"। దయచేసి సురక్షితమైన కనెక్షన్‌లు మరియు పిన్ వైరింగ్ వివరించండి.`
      : `Circuit & Electronics question: "${studentCircuitQuery}". Please guide me with safe breadboard wiring and pin connections step by step.`;
    handleSendMessage(prompt);
    setStudentCircuitQuery('');
  };

  const t = translations[language];
  const isStudent = userRole === 'student';

  if (userRole === null) {
    return (
      <LoginPortal 
        language={language}
        setLanguage={setLanguage}
        translations={translations}
        onLoginSuccess={(role, name, email) => {
          setUserRole(role);
          setUserName(name);
          setUserEmail(email);
        }}
      />
    );
  }

  return (
    <div id="app-root" className="flex flex-col h-screen w-full text-[#1a1a1a] font-sans overflow-hidden">
      
      {/* Header */}
      <header className="py-4 px-6 md:px-10 flex items-center justify-between gap-4 shrink-0 border-b-3 border-[#1a1a1a] bg-white z-10">
        <div className="flex flex-col items-start">
          <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-[#1a1a1a]/60 font-extrabold">
            {language === 'hi' ? 'शिक्षण सहायक' : language === 'te' ? 'బోధనా సహాయకుడు' : 'Teaching Assistant'}
          </span>
          <h1 className="font-gaegu font-bold text-3xl md:text-4xl text-[#5e43ff] transform -rotate-1 hover:rotate-1 transition-transform cursor-default select-none mt-0.5">
            {t.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-end">
          {/* Custom Interactive Language Selector */}
          <div className="flex bg-[#1a1a1a]/5 p-1 rounded-full border-2 border-[#1a1a1a]">
            {(['en', 'hi', 'te'] as const).map((lang) => (
              <button 
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 md:px-4 rounded-full font-mono text-xs font-bold transition-all duration-150 ${
                  language === lang 
                    ? 'bg-[#1a1a1a] text-white shadow-xs' 
                    : 'text-[#1a1a1a] hover:bg-[#1a1a1a]/10'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'తెలుగు'}
              </button>
            ))}
          </div>

          {/* User Profile Chip with Logout */}
          <div className="flex items-center gap-2 bg-[#FFF3E0] border-2 border-[#1a1a1a] pl-2 pr-3.5 py-1 rounded-full shadow-[2px_2px_0px_#1a1a1a]">
            <div className={`w-6 h-6 rounded-full border border-[#1a1a1a] flex items-center justify-center font-bold text-xs ${userRole === 'teacher' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-[#01579B]'}`}>
              {userName ? userName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-extrabold leading-none truncate max-w-[80px] sm:max-w-[120px]">{userName}</span>
              <span className={`text-[8px] font-bold uppercase leading-none mt-0.5 tracking-wider ${userRole === 'teacher' ? 'text-amber-800' : 'text-sky-800'}`}>
                {userRole === 'teacher' ? t.teacherRole.split(' ')[0] : t.studentRole.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={() => {
                setUserRole(null);
                setUserName('');
                setUserEmail('');
              }}
              className="ml-1 text-slate-500 hover:text-rose-600 transition-colors p-0.5 hover:bg-[#1a1a1a]/5 rounded"
              title={t.logoutBtn}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Assistant Ready Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-white border-2 border-[#1a1a1a] px-3.5 py-1.5 rounded-full shadow-[2px_2px_0px_#1a1a1a]">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#1a1a1a] tracking-wide uppercase">
              {t.statusReady}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar (Quick Templates) */}
        <aside className="hidden lg:flex w-80 bg-white border-r-3 border-[#1a1a1a] p-6 flex-col gap-6 shrink-0 justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-gaegu text-3xl font-extrabold text-[#1a1a1a]">
                  {t.quickTemplates}
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#1a1a1a] ${isStudent ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isStudent ? 'Student Sathi' : 'Teacher Co-Pilot'}
                </span>
              </div>
              
              <div className="space-y-3.5">
                {/* TEACHER TEMPLATES */}
                {!isStudent && (
                  <>
                    <button 
                      onClick={() => setActiveTab('doubts')}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border-2 border-[#1a1a1a] transition-all duration-200 transform ${
                        activeTab === 'doubts'
                          ? 'bg-[#e8e5ff] -translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#1a1a1a]'
                          : 'bg-[#f0edff] hover:bg-[#e8e5ff] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow-xs p-1 bg-white border border-[#1a1a1a] rounded-lg">🙋</span>
                        <div>
                          <span className="block text-sm font-bold text-[#5e43ff]">{t.doubtsTab}</span>
                          <span className="text-[10px] text-indigo-900 font-medium">Student queries & alerts</span>
                        </div>
                      </div>
                      {pendingDoubtsCount > 0 ? (
                        <span className="text-xs font-mono font-black bg-[#E65100] text-white px-2 py-0.5 rounded-full border border-[#1a1a1a]">
                          {pendingDoubtsCount}
                        </span>
                      ) : (
                        <span className="text-[#1a1a1a]/30 font-bold">→</span>
                      )}
                    </button>

                    <button 
                      onClick={() => setActiveForm(activeForm === 'lesson' ? null : 'lesson')}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border-2 border-[#1a1a1a] transition-all duration-200 transform ${
                        activeForm === 'lesson'
                          ? 'bg-[#FFE0B2] -translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#1a1a1a]'
                          : 'bg-[#FFF3E0]/70 hover:bg-[#FFE0B2] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow-xs p-1 bg-white border border-[#1a1a1a] rounded-lg">📝</span>
                        <div>
                          <span className="block text-sm font-bold text-[#E65100]">{t.lessonPlanTitle}</span>
                          <span className="text-[10px] text-amber-800 font-medium">Curriculum & 45-min plans</span>
                        </div>
                      </div>
                      <span className="text-[#1a1a1a]/30 font-bold">→</span>
                    </button>

                    <button 
                      onClick={() => setActiveForm(activeForm === 'doubt' ? null : 'doubt')}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border-2 border-[#1a1a1a] transition-all duration-200 transform ${
                        activeForm === 'doubt'
                          ? 'bg-[#B3E5FC] -translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#1a1a1a]'
                          : 'bg-[#E1F5FE]/70 hover:bg-[#B3E5FC] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow-xs p-1 bg-white border border-[#1a1a1a] rounded-lg">❓</span>
                        <div>
                          <span className="block text-sm font-bold text-[#01579B]">{t.doubtTitle}</span>
                          <span className="text-[10px] text-sky-800 font-medium">Pedagogy & Classroom analogies</span>
                        </div>
                      </div>
                      <span className="text-[#1a1a1a]/30 font-bold">→</span>
                    </button>

                    <button 
                      onClick={() => setActiveForm(activeForm === 'hardware' ? null : 'hardware')}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border-2 border-[#1a1a1a] transition-all duration-200 transform ${
                        activeForm === 'hardware'
                          ? 'bg-[#DCEDC8] -translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#1a1a1a]'
                          : 'bg-[#F1F8E9]/70 hover:bg-[#DCEDC8] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow-xs p-1 bg-white border border-[#1a1a1a] rounded-lg">🔧</span>
                        <div>
                          <span className="block text-sm font-bold text-[#33691E]">{t.hardwareTitle}</span>
                          <span className="text-[10px] text-green-800 font-medium">Lab sensor troubleshooting</span>
                        </div>
                      </div>
                      <span className="text-[#1a1a1a]/30 font-bold">→</span>
                    </button>
                  </>
                )}

                {/* STUDENT TEMPLATES */}
                {isStudent && (
                  <>
                    <button 
                      onClick={() => setActiveForm(activeForm === 'student-concept' ? null : 'student-concept')}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border-2 border-[#1a1a1a] transition-all duration-200 transform ${
                        activeForm === 'student-concept'
                          ? 'bg-[#FFE0B2] -translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#1a1a1a]'
                          : 'bg-[#FFF3E0]/80 hover:bg-[#FFE0B2] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow-xs p-1 bg-white border border-[#1a1a1a] rounded-lg">💡</span>
                        <div>
                          <span className="block text-sm font-bold text-[#E65100]">Explain Concept</span>
                          <span className="text-[10px] text-amber-800 font-medium">Fun real-life analogies</span>
                        </div>
                      </div>
                      <span className="text-[#1a1a1a]/30 font-bold">→</span>
                    </button>

                    <button 
                      onClick={() => setActiveForm(activeForm === 'student-doubt' ? null : 'student-doubt')}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border-2 border-[#1a1a1a] transition-all duration-200 transform ${
                        activeForm === 'student-doubt'
                          ? 'bg-[#B3E5FC] -translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#1a1a1a]'
                          : 'bg-[#E1F5FE]/80 hover:bg-[#B3E5FC] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow-xs p-1 bg-white border border-[#1a1a1a] rounded-lg">❓</span>
                        <div>
                          <span className="block text-sm font-bold text-[#01579B]">Ask Coding Doubt</span>
                          <span className="text-[10px] text-sky-800 font-medium">Scratch, Python & Logic</span>
                        </div>
                      </div>
                      <span className="text-[#1a1a1a]/30 font-bold">→</span>
                    </button>

                    <button 
                      onClick={() => setActiveForm(activeForm === 'student-circuit' ? null : 'student-circuit')}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border-2 border-[#1a1a1a] transition-all duration-200 transform ${
                        activeForm === 'student-circuit'
                          ? 'bg-[#DCEDC8] -translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#1a1a1a]'
                          : 'bg-[#F1F8E9]/80 hover:bg-[#DCEDC8] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow-xs p-1 bg-white border border-[#1a1a1a] rounded-lg">🔌</span>
                        <div>
                          <span className="block text-sm font-bold text-[#33691E]">Circuit & Wiring Help</span>
                          <span className="text-[10px] text-green-800 font-medium">LED, Breadboard, Arduino</span>
                        </div>
                      </div>
                      <span className="text-[#1a1a1a]/30 font-bold">→</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-[#1a1a1a] shadow-[4px_4px_0px_rgba(26,26,26,0.08)]">
            <p className="text-xs font-semibold text-slate-600 italic leading-relaxed text-center">
              {t.quote}
            </p>
            <div className="mt-4 pt-3 border-t-2 border-[#1a1a1a]/5 text-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 block mb-1">Time Tracking</span>
              <span className="font-mono text-xl font-bold text-[#1a1a1a] tracking-wider">{timeString}</span>
            </div>
          </div>
        </aside>

        {/* Chat / Main Dashboard Area */}
        <main className="flex-1 flex flex-col bg-transparent relative overflow-hidden">
          
          {/* Warning Banner if API key is missing */}
          {apiKeyMissing && (
            <div className="bg-amber-100 text-[#1a1a1a] border-b-2 border-[#1a1a1a] px-6 py-2.5 text-xs font-bold flex items-center gap-2 z-10">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t.noApiKeyWarning}</span>
            </div>
          )}

          {/* Tabs for Chat, FAQs, Teacher tools */}
          <div className="px-4 md:px-10 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-10 border-b-2 border-[#1a1a1a]/15 bg-white">
            <div className="flex gap-3 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-5 py-2.5 rounded-t-2xl font-mono text-xs md:text-sm font-extrabold border-2 border-[#1a1a1a] border-b-0 transition-all relative shrink-0 top-[2px] ${
                  activeTab === 'chat'
                    ? 'bg-[#5e43ff] text-white shadow-[2px_-2px_0px_#1a1a1a]'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#1a1a1a]'
                }`}
              >
                💬 {t.chatTab}
              </button>
              <button
                onClick={() => setActiveTab('faqs')}
                className={`px-5 py-2.5 rounded-t-2xl font-mono text-xs md:text-sm font-extrabold border-2 border-[#1a1a1a] border-b-0 transition-all relative shrink-0 top-[2px] ${
                  activeTab === 'faqs'
                    ? 'bg-[#FF7E5F] text-white shadow-[2px_-2px_0px_#1a1a1a]'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#1a1a1a]'
                }`}
              >
                ❓ {t.faqsTab}
              </button>
              <button
                onClick={() => setActiveTab('visualizer')}
                className={`px-5 py-2.5 rounded-t-2xl font-mono text-xs md:text-sm font-extrabold border-2 border-[#1a1a1a] border-b-0 transition-all relative shrink-0 top-[2px] ${
                  activeTab === 'visualizer'
                    ? 'bg-[#2E7D32] text-white shadow-[2px_-2px_0px_#1a1a1a]'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#1a1a1a]'
                }`}
              >
                🔌 {t.visualizerTab}
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-5 py-2.5 rounded-t-2xl font-mono text-xs md:text-sm font-extrabold border-2 border-[#1a1a1a] border-b-0 transition-all relative shrink-0 top-[2px] flex items-center gap-1.5 ${
                  activeTab === 'quiz'
                    ? 'bg-[#5e43ff] text-white shadow-[2px_-2px_0px_#1a1a1a]'
                    : 'bg-indigo-50 hover:bg-indigo-100/70 text-[#1a1a1a]'
                }`}
              >
                <span>⚡ {t.quizTab}</span>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-5 py-2.5 rounded-t-2xl font-mono text-xs md:text-sm font-extrabold border-2 border-[#1a1a1a] border-b-0 transition-all relative shrink-0 top-[2px] flex items-center gap-1.5 ${
                  activeTab === 'leaderboard'
                    ? 'bg-amber-400 text-[#1a1a1a] shadow-[2px_-2px_0px_#1a1a1a]'
                    : 'bg-amber-50 hover:bg-amber-100/70 text-[#1a1a1a]'
                }`}
              >
                <span>🏆 {t.leaderboardTab}</span>
              </button>
              {!isStudent && (
                <button
                  onClick={() => setActiveTab('doubts')}
                  className={`px-5 py-2.5 rounded-t-2xl font-mono text-xs md:text-sm font-extrabold border-2 border-[#1a1a1a] border-b-0 transition-all relative shrink-0 top-[2px] flex items-center gap-2 ${
                    activeTab === 'doubts'
                      ? 'bg-[#5e43ff] text-white shadow-[2px_-2px_0px_#1a1a1a]'
                      : 'bg-indigo-50 hover:bg-indigo-100/60 text-[#1a1a1a]'
                  }`}
                >
                  <span>🙋 {t.doubtsTab}</span>
                  {pendingDoubtsCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-black font-mono bg-[#E65100] text-white rounded-full border border-[#1a1a1a]">
                      {pendingDoubtsCount}
                    </span>
                  )}
                </button>
              )}
              {!isStudent && (
                <button
                  onClick={() => setActiveTab('teacher-tools')}
                  className={`px-5 py-2.5 rounded-t-2xl font-mono text-xs md:text-sm font-extrabold border-2 border-[#1a1a1a] border-b-0 transition-all relative shrink-0 top-[2px] ${
                    activeTab === 'teacher-tools'
                      ? 'bg-amber-500 text-white shadow-[2px_-2px_0px_#1a1a1a]'
                      : 'bg-amber-50 hover:bg-amber-100/50 text-[#1a1a1a]'
                  }`}
                >
                  🛠️ {t.teacherToolsTab}
                </button>
              )}
            </div>

            {/* Right controls: AI Model & Clear Chat */}
            <div className="flex items-center gap-3 pb-2 md:pb-0 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-[#1a1a1a]/60 uppercase tracking-wide whitespace-nowrap">🤖 {language === 'hi' ? 'मॉडल' : language === 'te' ? 'మోడల్' : 'Model'}:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-xs font-bold font-mono px-2.5 py-1 border-2 border-[#1a1a1a] rounded-xl bg-amber-50 text-[#1a1a1a] hover:bg-amber-100/50 shadow-[1px_1px_0px_#1a1a1a] cursor-pointer outline-none transition-all"
                >
                  <option value="sarvam-105b">Sarvam 105B (Primary)</option>
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                </select>
              </div>

              {activeTab === 'chat' && (
                <button
                  onClick={handleClearChat}
                  title="Clear chat history for this account"
                  className="text-[11px] font-mono font-bold px-2.5 py-1 border-2 border-[#1a1a1a] rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-[1px_1px_0px_#1a1a1a] transition-all flex items-center gap-1 shrink-0"
                >
                  🗑️ {language === 'hi' ? 'साफ़ करें' : language === 'te' ? 'క్లియర్' : 'Clear Chat'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Buttons for Mobile */}
          <div className="lg:hidden flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b-2 border-[#1a1a1a] shrink-0 z-10">
            <button 
              onClick={() => { setActiveTab('quiz'); setActiveForm(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                activeTab === 'quiz' 
                  ? 'bg-[#5e43ff] text-white -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                  : 'bg-indigo-50 hover:bg-indigo-100'
              }`}
            >
              ⚡ {t.quizTab}
            </button>
            <button 
              onClick={() => { setActiveTab('leaderboard'); setActiveForm(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                activeTab === 'leaderboard' 
                  ? 'bg-amber-400 text-[#1a1a1a] -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                  : 'bg-amber-50 hover:bg-amber-100'
              }`}
            >
              🏆 {t.leaderboardTab}
            </button>
            {!isStudent && (
              <button 
                onClick={() => { setActiveTab('doubts'); setActiveForm(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                  activeTab === 'doubts' 
                    ? 'bg-[#5e43ff] text-white -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                    : 'bg-[#f0edff] hover:bg-[#e8e5ff]'
                }`}
              >
                🙋 {t.doubtsTab}
                {pendingDoubtsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-[#E65100] text-white rounded-full font-mono">
                    {pendingDoubtsCount}
                  </span>
                )}
              </button>
            )}
            {!isStudent && (
              <button 
                onClick={() => { setActiveTab('teacher-tools'); setActiveForm(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                  activeTab === 'teacher-tools' 
                    ? 'bg-amber-500 text-white -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                    : 'bg-amber-50 hover:bg-amber-100'
                }`}
              >
                🛠️ {t.teacherToolsTab}
              </button>
            )}
            {!isStudent && (
              <button 
                onClick={() => setActiveForm(activeForm === 'lesson' ? null : 'lesson')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                  activeForm === 'lesson' 
                    ? 'bg-[#FFE0B2] -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                    : 'bg-[#FFF3E0] hover:bg-[#FFE0B2]'
                }`}
              >
                📝 Lesson
              </button>
            )}
            {isStudent ? (
              <>
                <button 
                  onClick={() => setActiveForm(activeForm === 'student-concept' ? null : 'student-concept')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                    activeForm === 'student-concept' 
                      ? 'bg-[#FFE0B2] -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                      : 'bg-[#FFF3E0] hover:bg-[#FFE0B2]'
                  }`}
                >
                  💡 Concept
                </button>
                <button 
                  onClick={() => setActiveForm(activeForm === 'student-doubt' ? null : 'student-doubt')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                    activeForm === 'student-doubt' 
                      ? 'bg-[#B3E5FC] -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                      : 'bg-[#E1F5FE] hover:bg-[#B3E5FC]'
                  }`}
                >
                  ❓ Doubt
                </button>
                <button 
                  onClick={() => setActiveForm(activeForm === 'student-circuit' ? null : 'student-circuit')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                    activeForm === 'student-circuit' 
                      ? 'bg-[#DCEDC8] -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                      : 'bg-[#F1F8E9] hover:bg-[#DCEDC8]'
                  }`}
                >
                  🔌 Circuit
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveForm(activeForm === 'doubt' ? null : 'doubt')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                    activeForm === 'doubt' 
                      ? 'bg-[#B3E5FC] -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                      : 'bg-[#E1F5FE] hover:bg-[#B3E5FC]'
                  }`}
                >
                  ❓ Doubt
                </button>
                <button 
                  onClick={() => setActiveForm(activeForm === 'hardware' ? null : 'hardware')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                    activeForm === 'hardware' 
                      ? 'bg-[#DCEDC8] -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]' 
                      : 'bg-[#F1F8E9] hover:bg-[#DCEDC8]'
                  }`}
                >
                  🔧 Hardware
                </button>
              </>
            )}
          </div>

          {activeTab === 'faqs' ? (
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-6 animate-fade-in">
              <div className="bg-[#FFFDF9] border-3 border-[#1a1a1a] rounded-[24px] p-6 md:p-8 shadow-[6px_6px_0px_#1a1a1a]">
                <h2 className="font-gaegu text-4xl font-black text-[#1a1a1a] mb-2">{t.faqsTitle}</h2>
                <p className="text-sm text-slate-600 font-semibold">{t.faqsSubtitle}</p>
                
                {/* Search and Category Filters */}
                <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-t-2 border-[#1a1a1a]/5 pt-6">
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Coding Concepts', 'Robotics & Hardware', 'Classroom Management'].map((cat) => {
                      let translatedCat = cat;
                      if (language === 'hi') {
                        if (cat === 'All') translatedCat = 'सभी';
                        else if (cat === 'Coding Concepts') translatedCat = 'कोडिंग अवधारणाएं';
                        else if (cat === 'Robotics & Hardware') translatedCat = 'रोबोटिक्स और हार्डवेयर';
                        else if (cat === 'Classroom Management') translatedCat = 'कक्षा प्रबंधन';
                      } else if (language === 'te') {
                        if (cat === 'All') translatedCat = 'అన్నీ';
                        else if (cat === 'Coding Concepts') translatedCat = 'కోడింగ్ కాన్సెప్ట్స్';
                        else if (cat === 'Robotics & Hardware') translatedCat = 'రోబోటిక్స్ & హార్డ్‌వేర్';
                        else if (cat === 'Classroom Management') translatedCat = 'క్లాస్‌రూమ్ మేనేజ్‌మెంట్';
                      }
                      
                      const isSelected = faqCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setFaqCategory(cat)}
                          className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl border-2 border-[#1a1a1a] transition-all duration-150 transform ${
                            isSelected
                              ? 'bg-[#5e43ff] text-white -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]'
                              : 'bg-white hover:bg-slate-50 text-[#1a1a1a] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#1a1a1a]'
                          }`}
                        >
                          {translatedCat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-64">
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'खोजें...' : language === 'te' ? 'వెతకండి...' : 'Search questions...'}
                      value={faqSearch}
                      onChange={(e) => setFaqSearch(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs font-semibold border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/50 bg-white text-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]"
                    />
                  </div>
                </div>
              </div>

              {/* FAQ Accordions */}
              <div className="space-y-4 max-w-4xl mx-auto">
                {faqsList
                  .filter((faq) => {
                    const matchesCategory = faqCategory === 'All' || faq.category.en === faqCategory;
                    const query = faqSearch.toLowerCase();
                    const matchesSearch = 
                      faq.question[language].toLowerCase().includes(query) || 
                      faq.answer[language].toLowerCase().includes(query) ||
                      faq.category[language].toLowerCase().includes(query);
                    return matchesCategory && matchesSearch;
                  })
                  .map((faq) => {
                    const isExpanded = expandedFaq === faq.id;
                    return (
                      <div 
                        key={faq.id}
                        className="bg-white border-3 border-[#1a1a1a] rounded-2xl overflow-hidden shadow-[4px_4px_0px_#1a1a1a] hover:shadow-[6px_6px_0px_#1a1a1a] transition-all duration-200"
                      >
                        {/* FAQ Header */}
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 bg-[#FFFDF9] hover:bg-[#F1F8E9]/20 transition-all"
                        >
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase border-2 border-[#1a1a1a] rounded-full bg-amber-100 text-[#1a1a1a]">
                              {faq.category[language]}
                            </span>
                            <h3 className="text-sm md:text-base font-bold text-[#1a1a1a] leading-snug">
                              {faq.question[language]}
                            </h3>
                          </div>
                          <div className={`p-1 rounded-full border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] shrink-0 transform transition-transform duration-200 ${isExpanded ? 'rotate-90 bg-amber-200' : ''}`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </button>

                        {/* FAQ Content (Accordion) */}
                        {isExpanded && (
                          <div className="p-5 bg-white border-t-3 border-[#1a1a1a] space-y-4 animate-fade-in">
                            <p className="text-sm text-[#1a1a1a] whitespace-pre-line leading-relaxed font-semibold">
                              {faq.answer[language]}
                            </p>

                            {/* Action Row */}
                            <div className="flex justify-end pt-2 border-t-2 border-[#1a1a1a]/5">
                              <button
                                onClick={() => handleSendMessage(faq.question[language])}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-white bg-[#5e43ff] border-2 border-[#1a1a1a] rounded-xl hover:-translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a] transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> {t.askAiBtn}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : activeTab === 'doubts' && !isStudent ? (
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 animate-fade-in">
              <StudentDoubtsTracker
                language={language}
                onAskAI={(prompt) => {
                  setActiveTab('chat');
                  handleSendMessage(prompt);
                }}
                currentUserRole={userRole}
                onSwitchToStudent={() => {
                  setUserRole('student');
                  setUserName('Rahul S. (Class 6B)');
                  setUserEmail('rahul.class6@school.edu');
                }}
              />
            </div>
          ) : activeTab === 'teacher-tools' && !isStudent ? (
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 animate-fade-in">
              <TeacherAISuite 
                language={language}
                selectedModel={selectedModel}
                onAskAI={(prompt) => {
                  setActiveTab('chat');
                  handleSendMessage(prompt);
                }}
              />
            </div>
          ) : activeTab === 'visualizer' ? (
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 animate-fade-in">
              <HardwareVisualizer 
                language={language}
                onAskAI={(prompt) => {
                  setActiveTab('chat');
                  handleSendMessage(prompt);
                }}
              />
            </div>
          ) : activeTab === 'quiz' ? (
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 animate-fade-in">
              <StudentQuizHub
                language={language}
                userRole={userRole || 'student'}
                userName={userName || (isStudent ? 'Rahul S. (You)' : 'STEM Faculty')}
                userEmail={userEmail || (isStudent ? 'rahul.class6@school.edu' : 'teacher@school.edu')}
                userGrade={isStudent ? 'Class 6B' : 'Class 6'}
                onOpenLeaderboard={() => setActiveTab('leaderboard')}
                selectedModel={selectedModel}
              />
            </div>
          ) : activeTab === 'leaderboard' ? (
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 animate-fade-in">
              <LeaderboardTracker
                language={language}
                userRole={userRole || 'student'}
                userName={userName || (isStudent ? 'Rahul S. (You)' : 'STEM Faculty')}
                userEmail={userEmail || (isStudent ? 'rahul.class6@school.edu' : 'teacher@school.edu')}
                userGrade={isStudent ? 'Class 6B' : 'Class 6'}
                onOpenQuiz={() => setActiveTab('quiz')}
              />
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {msg.role === 'assistant' && (
                    <div className={`w-10 h-10 border-2 border-[#1a1a1a] rounded-full shrink-0 flex items-center justify-center text-white font-gaegu font-extrabold text-xl shadow-[2px_2px_0px_#1a1a1a] select-none ${isStudent ? 'bg-[#0288D1]' : 'bg-[#5e43ff]'}`}>
                      {isStudent ? '🚀' : 'S'}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div 
                    className={`max-w-2xl transition-all duration-300 ${
                      msg.role === 'user' 
                        ? 'bg-[#E1F5FE] text-[#1a1a1a] p-4 md:p-5 rounded-[24px] rounded-tr-none border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a]' 
                        : msg.id === 'welcome' 
                        ? 'w-full'
                        : 'bg-white text-[#1a1a1a] p-5 rounded-[24px] rounded-tl-none border-2 border-[#1a1a1a] shadow-[4px_4px_0px_rgba(26,26,26,0.08)]'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      msg.id === 'welcome' ? (
                        <div className={`relative text-white p-6 md:p-8 rounded-[32px] rounded-bl-[4px] border-3 border-[#1a1a1a] shadow-[6px_6px_0px_rgba(26,26,26,0.15)] flex flex-col gap-3 overflow-hidden ${isStudent ? 'bg-[#0288D1]' : 'bg-[#5e43ff]'}`}>
                          <span className="absolute -top-4 -left-1 font-gaegu text-8xl text-white opacity-20 select-none">“</span>
                          <div className="flex items-center justify-between relative z-10">
                            <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                              {isStudent 
                                ? (language === 'hi' ? 'नमस्ते छात्र! 🚀' : language === 'te' ? 'నమస్తే విద్యార్థి! 🚀' : 'Welcome, Student! 🚀')
                                : (language === 'hi' ? 'नमस्ते शिक्षक! 🍎' : language === 'te' ? 'నమస్తే ఉపాధ్యాయులారా! 🍎' : 'Welcome, Teacher! 🍎')
                              }
                            </p>
                            <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
                              {isStudent ? 'Student AI Sathi' : 'Teacher STEM Co-Pilot'}
                            </span>
                          </div>
                          
                          <p className="text-sm md:text-base font-semibold leading-relaxed relative z-10 pl-2">
                            {msg.text}
                          </p>

                          {/* Role-Specific Quick Starters */}
                          <div className="mt-2 pt-3 border-t border-white/20 relative z-10">
                            <p className="text-[11px] font-mono font-bold text-white/80 mb-2 uppercase tracking-wide">
                              ⚡ {language === 'hi' ? 'तुरंत पूछें / Quick Starters' : language === 'te' ? 'త్వరిత ప్రశ్నలు / Quick Starters' : 'Quick Starters'}:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {isStudent ? (
                                <>
                                  <button
                                    onClick={() => handleSendMessage('Why is my Scratch sprite not jumping when space key is pressed?')}
                                    className="text-xs font-semibold bg-white/15 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/30 transition-all text-left"
                                  >
                                    🐱 Scratch sprite not jumping
                                  </button>
                                  <button
                                    onClick={() => handleSendMessage('How do I connect an LED and resistor on a breadboard with Arduino safely?')}
                                    className="text-xs font-semibold bg-white/15 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/30 transition-all text-left"
                                  >
                                    💡 LED & resistor breadboard wiring
                                  </button>
                                  <button
                                    onClick={() => handleSendMessage('Explain how Loops work with a simple dance step analogy!')}
                                    className="text-xs font-semibold bg-white/15 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/30 transition-all text-left"
                                  >
                                    💃 Explain Loops with dance analogy
                                  </button>
                                  <button
                                    onClick={() => handleSendMessage('What is the difference between Repeat 10 and Forever loop in block coding?')}
                                    className="text-xs font-semibold bg-white/15 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/30 transition-all text-left"
                                  >
                                    🔄 Repeat vs Forever loops
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleSendMessage('Create a 45-minute Scratch lesson plan for Class 6 introducing Variables')}
                                    className="text-xs font-semibold bg-white/15 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/30 transition-all text-left"
                                  >
                                    📝 45-min Scratch Variables lesson plan
                                  </button>
                                  <button
                                    onClick={() => handleSendMessage('Classroom SOS: 5 students finished lab early while others struggle, what quick extension activity can I give?')}
                                    className="text-xs font-semibold bg-white/15 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/30 transition-all text-left"
                                  >
                                    🆘 Classroom SOS: Fast finishers
                                  </button>
                                  <button
                                    onClick={() => handleSendMessage('Explain Variables in programming using a cricket scorekeeper analogy for Class 7')}
                                    className="text-xs font-semibold bg-white/15 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/30 transition-all text-left"
                                  >
                                    🏏 Cricket analogy for Variables
                                  </button>
                                  <button
                                    onClick={() => handleSendMessage('Troubleshoot: Arduino Uno USB port not recognized in Windows PC lab')}
                                    className="text-xs font-semibold bg-white/15 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/30 transition-all text-left"
                                  >
                                    🔧 Arduino USB not detected
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <ParsedMessage text={msg.text} language={language} />
                      )
                    ) : (
                      <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                    
                    {/* Flagged Alert Banner */}
                    {msg.isFlagged && (
                      <div className="mt-3 p-3 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-rose-700 font-bold">
                          <span className="text-sm">🛡️</span>
                          <span>Non-academic query detected and auto-reported to teacher.</span>
                        </div>
                        {userRole === 'teacher' && (
                          <button
                            onClick={() => setActiveTab('doubts')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-mono font-bold text-[10px] uppercase shadow-sm transition-all"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    )}

                    {/* Footer: Timestamp */}
                    {msg.id !== 'welcome' && (
                      <div className="flex items-center justify-end mt-2 pt-1 border-t border-slate-100/80">
                        <span className="text-[9px] font-mono font-bold text-[#1a1a1a]/40 text-right">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className={`w-10 h-10 border-2 border-[#1a1a1a] rounded-full shrink-0 flex items-center justify-center font-mono font-extrabold text-sm shadow-[2px_2px_0px_#1a1a1a] select-none ${isStudent ? 'bg-sky-100 text-sky-800' : 'bg-amber-200 text-amber-900'}`}>
                      {userName ? userName[0].toUpperCase() : (isStudent ? 'S' : 'T')}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Loader Indicator */}
              {isLoading && (
                <div className="flex justify-start gap-3 md:gap-4 items-end animate-fade-in">
                  <div className="w-10 h-10 bg-[#5e43ff] border-2 border-[#1a1a1a] rounded-full shrink-0 flex items-center justify-center text-white font-gaegu font-extrabold text-xl shadow-[2px_2px_0px_#1a1a1a] select-none">
                    S
                  </div>
                  <div className="bg-white border-2 border-[#1a1a1a] px-5 py-4 rounded-2xl rounded-tl-none shadow-[4px_4px_0px_rgba(26,26,26,0.08)] flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#5e43ff] tracking-wide uppercase">{t.loadingState}</span>
                    <div className="flex gap-1 items-center h-4 pt-1.5">
                      <div className="w-2.5 h-2.5 bg-[#5e43ff] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2.5 h-2.5 bg-[#5e43ff] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2.5 h-2.5 bg-[#5e43ff] rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Floating Form Overlays for Templates */}
          {activeForm && (
            <div className="absolute inset-x-0 bottom-24 mx-auto w-full max-w-lg px-4 z-20 animate-fade-in">
              <div className="bg-white rounded-[24px] border-3 border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] p-6 space-y-4">
                
                {/* Form Header */}
                <div className="flex items-center justify-between border-b-2 border-[#1a1a1a]/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {activeForm === 'lesson' ? '📝' : 
                       activeForm === 'doubt' ? '❓' : 
                       activeForm === 'hardware' ? '🔧' :
                       activeForm === 'student-concept' ? '💡' :
                       activeForm === 'student-doubt' ? '❓' : '🔌'}
                    </span>
                    <h3 className="font-gaegu font-bold text-2.5xl text-[#1a1a1a]">
                      {activeForm === 'lesson' ? t.lessonPlanTitle : 
                       activeForm === 'doubt' ? t.doubtTitle : 
                       activeForm === 'hardware' ? t.hardwareTitle :
                       activeForm === 'student-concept' ? 'Explain STEM Concept' :
                       activeForm === 'student-doubt' ? 'Ask Coding Doubt' :
                       'Circuit & Hardware Help'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveForm(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 border-2 border-transparent hover:border-[#1a1a1a] text-slate-500 hover:text-[#1a1a1a] transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Fields: LESSON PLAN GENERATOR (Teacher) */}
                {activeForm === 'lesson' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">{t.topicLabel}</label>
                      <input 
                        type="text" 
                        value={lessonTopic}
                        onChange={(e) => setLessonTopic(e.target.value)}
                        placeholder={t.topicPlaceholder}
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">{t.gradeLabel}</label>
                        <input 
                          type="text" 
                          value={lessonGrade}
                          onChange={(e) => setLessonGrade(e.target.value)}
                          placeholder={t.gradePlaceholder}
                          className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/50 bg-white font-semibold text-[#1a1a1a]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">{t.difficultyLabel}</label>
                        <select 
                          value={lessonDifficulty}
                          onChange={(e) => setLessonDifficulty(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/50 font-semibold text-[#1a1a1a]"
                        >
                          <option value="Beginner">Beginner / शुरुआती</option>
                          <option value="Intermediate">Intermediate / मध्यम</option>
                          <option value="Advanced">Advanced / उन्नत</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={handleGenerateLessonPlan}
                      disabled={!lessonTopic}
                      className="w-full bg-[#5e43ff] text-white py-3 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-sm shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {t.generateBtn}
                    </button>
                  </div>
                )}

                {/* Form Fields: STUDENT DOUBT RESOLUTION (Teacher) */}
                {activeForm === 'doubt' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">{t.studentDoubtLabel}</label>
                      <textarea 
                        rows={2}
                        value={studentDoubt}
                        onChange={(e) => setStudentDoubt(e.target.value)}
                        placeholder={t.doubtPlaceholder}
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">{t.studentAgeLabel}</label>
                      <input 
                        type="text" 
                        value={studentAge}
                        onChange={(e) => setStudentAge(e.target.value)}
                        placeholder={t.studentAgePlaceholder}
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <button 
                      onClick={handleGenerateDoubtSolution}
                      disabled={!studentDoubt}
                      className="w-full bg-[#5e43ff] text-white py-3 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-sm shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {t.generateBtn}
                    </button>
                  </div>
                )}

                {/* Form Fields: HARDWARE TROUBLESHOOTING (Teacher) */}
                {activeForm === 'hardware' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">{t.componentLabel}</label>
                      <input 
                        type="text" 
                        value={hardwareComponent}
                        onChange={(e) => setHardwareComponent(e.target.value)}
                        placeholder={t.componentPlaceholder}
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">{t.problemLabel}</label>
                      <textarea 
                        rows={2}
                        value={hardwareProblem}
                        onChange={(e) => setHardwareProblem(e.target.value)}
                        placeholder={t.problemPlaceholder}
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43ff]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <button 
                      onClick={handleGenerateHardwareFix}
                      disabled={!hardwareComponent}
                      className="w-full bg-[#5e43ff] text-white py-3 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-sm shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {t.generateBtn}
                    </button>
                  </div>
                )}

                {/* Form Fields: STUDENT CONCEPT HELPER */}
                {activeForm === 'student-concept' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">What concept do you want to learn?</label>
                      <input 
                        type="text" 
                        value={lessonTopic}
                        onChange={(e) => setLessonTopic(e.target.value)}
                        placeholder="e.g. Loops, Variables, Ultrasonic Sensor, Motors..."
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0288D1]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">Your Grade / Class</label>
                      <input 
                        type="text" 
                        value={lessonGrade}
                        onChange={(e) => setLessonGrade(e.target.value)}
                        placeholder="e.g. Class 6"
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0288D1]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <button 
                      onClick={handleStudentConceptSubmit}
                      disabled={!lessonTopic}
                      className="w-full bg-[#0288D1] text-white py-3 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-sm shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      Explain to me! 💡
                    </button>
                  </div>
                )}

                {/* Form Fields: STUDENT CODING DOUBT */}
                {activeForm === 'student-doubt' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">What is your coding question or error?</label>
                      <textarea 
                        rows={3}
                        value={studentDoubt}
                        onChange={(e) => setStudentDoubt(e.target.value)}
                        placeholder="e.g. In Scratch, when I press Green Flag my score becomes 0 immediately. How do I keep my high score?"
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0288D1]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <button 
                      onClick={handleGenerateDoubtSolution}
                      disabled={!studentDoubt}
                      className="w-full bg-[#0288D1] text-white py-3 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-sm shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      Help me solve it! ❓
                    </button>
                  </div>
                )}

                {/* Form Fields: STUDENT CIRCUIT HELPER */}
                {activeForm === 'student-circuit' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">Hardware / Sensor Name</label>
                      <input 
                        type="text" 
                        value={hardwareComponent}
                        onChange={(e) => setHardwareComponent(e.target.value)}
                        placeholder="e.g. LED, Servo Motor, Ultrasonic HC-SR04, LDR"
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0288D1]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1a1a1a] mb-1.5">What problem are you facing?</label>
                      <textarea 
                        rows={2}
                        value={hardwareProblem}
                        onChange={(e) => setHardwareProblem(e.target.value)}
                        placeholder="e.g. The LED is not glowing when I connect to Pin 13 and GND."
                        className="w-full px-4 py-2.5 text-sm border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0288D1]/50 bg-white font-semibold text-[#1a1a1a]"
                      />
                    </div>
                    <button 
                      onClick={handleStudentCircuitSubmit}
                      disabled={!hardwareComponent}
                      className="w-full bg-[#0288D1] text-white py-3 border-2 border-[#1a1a1a] rounded-xl font-mono font-bold text-sm shadow-[2px_2px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      Guide my wiring! 🔌
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Bottom Chat Input Form */}
          {activeTab === 'chat' && (
            <div className="h-28 flex items-center justify-center shrink-0 px-4 md:px-10 z-10">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="w-full max-w-3xl flex gap-3 items-center bg-white p-3 rounded-[32px] border-3 border-[#1a1a1a] shadow-[6px_6px_0px_#1a1a1a] mb-6"
              >
                <div className="w-12 h-12 flex items-center justify-center text-[#5e43ff] shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>

                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.placeholder}
                  className="flex-1 py-3 text-sm focus:outline-none text-[#1a1a1a] font-semibold bg-transparent"
                />

                <div className="flex gap-2 shrink-0">
                  <button 
                    type="submit"
                    className="bg-[#1a1a1a] text-white px-6 md:px-8 py-3 rounded-2xl font-mono font-bold text-sm hover:-translate-y-0.5 shadow-[2px_2px_0px_rgba(26,26,26,0.3)] transition-all active:scale-95"
                  >
                    {t.send}
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
