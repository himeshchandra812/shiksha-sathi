import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ToggleLeft, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle,
  Code,
  Info,
  RefreshCw
} from 'lucide-react';

interface HardwareVisualizerProps {
  language: 'en' | 'hi' | 'te';
  onAskAI: (query: string) => void;
}

export default function HardwareVisualizer({ language, onAskAI }: HardwareVisualizerProps) {
  const [activeSetup, setActiveSetup] = useState<'led' | 'ultrasonic' | 'servo'>('led');

  // LED states
  const [ledPolarity, setLedPolarity] = useState<boolean>(true); // true = correct, false = reversed
  const [hasResistor, setHasResistor] = useState<boolean>(true); // true = proper 220 ohm, false = direct short (burnout)
  const [wireSecured, setWireSecured] = useState<boolean>(true); // true = connected, false = loose wire
  const [isBlinking, setIsBlinking] = useState<boolean>(true);
  const [blinkState, setBlinkState] = useState<boolean>(true);

  // Ultrasonic states
  const [trigEchoSwapped, setTrigEchoSwapped] = useState<boolean>(false); // true = swapped, false = correct
  const [sensorDistance, setSensorDistance] = useState<number>(35); // 5 to 100 cm
  const [ultrasonicWireConnected, setUltrasonicWireConnected] = useState<boolean>(true);

  // Servo states
  const [servoAngle, setServoAngle] = useState<number>(90);
  const [voltagePin, setVoltagePin] = useState<'5V' | '3.3V'>('5V');
  const [servoWireConnected, setServoWireConnected] = useState<boolean>(true);

  // Auto blink timer for LED
  useEffect(() => {
    if (!isBlinking || !wireSecured || !ledPolarity) {
      setBlinkState(false);
      return;
    }
    const interval = setInterval(() => {
      setBlinkState(prev => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, [isBlinking, wireSecured, ledPolarity]);

  // Translations dictionary for the visualizer
  const vTranslations = {
    en: {
      title: "Interactive Hardware Visualizer",
      subtitle: "Click and toggle pins, simulate faults, and visualize circuits in real time!",
      ledTab: "LED Blink",
      ultrasonicTab: "Ultrasonic Distance",
      servoTab: "Servo Motor Control",
      panelControls: "Fault Simulator & Controls",
      diagnosticConsole: "Virtual Serial Monitor",
      circuitExplanation: "How It Works (Logic)",
      codeBlocks: "Arduino C++ & Blockly",
      looseWire: "Wire Connection State",
      connected: "Secured & Connected",
      disconnected: "Loose Wire / Broken",
      polarity: "LED Polarity Orientation",
      correct: "Correct (+ to Pin 13)",
      reversed: "Reversed (Cathode/Anode Swapped)",
      resistor: "Resistor Protection",
      resistorOk: "220Ω Resistor Installed (Safe)",
      resistorMissing: "No Resistor! (High Current Risk 🔥)",
      swapPins: "Echo / Trig Pin Configuration",
      correctPins: "Correct (Trig: D12, Echo: D11)",
      swappedPins: "Swapped Pins! (Trig/Echo Swapped)",
      obstacleDistance: "Obstacle Distance",
      voltage: "Arduino Power Supply",
      voltage5V: "5V Power (Strong current)",
      voltage3V: "3.3V Power (Weak/Slow rotation)",
      askAiButton: "Ask Sathi to explain this configuration",
      ledStatusOn: "[INFO] Pin 13 HIGH: LED ON",
      ledStatusOff: "[INFO] Pin 13 LOW: LED OFF",
      ledStatusErrPolarity: "[WARNING] Diode is reversed. No current can flow.",
      ledStatusErrResistor: "[DANGER] Over-current! LED is burning out without resistor!",
      ledStatusErrWire: "[ERROR] Connection open. Pin 13 current path broken.",
      ultraStatusOk: (d: number) => `[SERIAL] Distance Measured: ${d} cm`,
      ultraStatusErrPins: "[ERROR] Echo trigger timeout. Swapped Echo/Trig pins?",
      ultraStatusErrWire: "[ERROR] Sensor disconnected. Check VCC/GND wires.",
      servoStatusOk: (a: number, v: string) => `[SERIAL] Angle set: ${a}° (${v} Power)`,
      servoStatusErrWire: "[ERROR] Servo motor control signal line disconnected.",
      blockCode: "Blockly Visual Equivalent",
      cppCode: "Arduino C++ Sketch"
    },
    hi: {
      title: "इंटरएक्टिव हार्डवेयर विज़ुअलाइज़र",
      subtitle: "पिन बदलें, गड़बड़ियों का अनुकरण करें और वास्तविक समय में सर्किट की जांच करें!",
      ledTab: "एलईडी ब्लिंक",
      ultrasonicTab: "अल्ट्रासोनिक दूरी सेंसर",
      servoTab: "सर्वो मोटर नियंत्रण",
      panelControls: "गड़बड़ी सिम्युलेटर और नियंत्रण",
      diagnosticConsole: "वर्चुअल सीरियल मॉनिटर",
      circuitExplanation: "यह कैसे काम करता है (तर्क)",
      codeBlocks: "आरडूिनो C++ और ब्लॉकली",
      looseWire: "तार कनेक्शन की स्थिति",
      connected: "सुरक्षित और कनेक्टेड",
      disconnected: "ढीला तार / टूटा हुआ",
      polarity: "एलईडी ध्रुवीयता (Polarity)",
      correct: "सही (+ पिन 13 से)",
      reversed: "उल्टा (पॉजिटिव/नेगेटिव आपस में बदल गए)",
      resistor: "प्रतिरोधक (Resistor) सुरक्षा",
      resistorOk: "220Ω रेसिस्टर लगा है (सुरक्षित)",
      resistorMissing: "कोई रेसिस्टर नहीं! (जलने का खतरा 🔥)",
      swapPins: "इको / ट्रिग पिन कॉन्फ़िगरेशन",
      correctPins: "सही (Trig: D12, Echo: D11)",
      swappedPins: "उल्टे पिन! (Trig/Echo बदल गए)",
      obstacleDistance: "अवरोध दूरी",
      voltage: "आरडूिनो बिजली की आपूर्ति",
      voltage5V: "5V पावर (मजबूत करंट)",
      voltage3V: "3.3V पावर (कमजोर/धीमी गति)",
      askAiButton: "इस कॉन्फ़िगरेशन को समझाने के लिए साथी से कहें",
      ledStatusOn: "[सूचना] पिन 13 उच्च: एलईडी चालू",
      ledStatusOff: "[सूचना] पिन 13 निम्न: एलईडी बंद",
      ledStatusErrPolarity: "[चेतावनी] एलईडी उल्टी लगी है। करंट प्रवाहित नहीं हो सकता।",
      ledStatusErrResistor: "[खतरा] अत्यधिक करंट! बिना रेसिस्टर के एलईडी जल रही है!",
      ledStatusErrWire: "[त्रुटि] कनेक्शन खुला है। पिन 13 करंट पथ टूटा है।",
      ultraStatusOk: (d: number) => `[सीरियल] मापी गई दूरी: ${d} सेमी`,
      ultraStatusErrPins: "[त्रुटि] इको टाइमआउट। क्या आपने ट्रिग और इको पिन आपस में बदल दिए हैं?",
      ultraStatusErrWire: "[त्रुटि] सेंसर डिस्कनेक्ट हो गया है। वीसीसी/जीएनडी तारों की जांच करें।",
      servoStatusOk: (a: number, v: string) => `[सीरियल] कोण सेट: ${a}° (${v} पावर)`,
      servoStatusErrWire: "[त्रुटि] सर्वो मोटर सिग्नल लाइन डिस्कनेक्ट हो गई है।",
      blockCode: "ब्लॉकली विज़ुअल समतुल्य",
      cppCode: "आरडूिनो C++ स्केच"
    },
    te: {
      title: "ఇంటరాక్టివ్ హార్డ్‌వేర్ విజువలైజర్",
      subtitle: "పిన్‌లను మార్చండి, లోపాలను అనుకరించండి మరియు సర్క్యూట్‌లను నిజ సమయంలో చూడండి!",
      ledTab: "LED బ్లింక్",
      ultrasonicTab: "అల్ట్రాసోనిక్ దూరం",
      servoTab: "సెర్వో మోటార్ కంట్రోల్",
      panelControls: "లోప అనుకరణ & నియంత్రణలు",
      diagnosticConsole: "వర్చువల్ సీరియల్ మానిటర్",
      circuitExplanation: "ఇది ఎలా పనిచేస్తుంది (లాజిక్)",
      codeBlocks: "ఆర్డుఇనో C++ & బ్లాక్లీ",
      looseWire: "వైర్ కనెక్షన్ స్థితి",
      connected: "సురక్షితంగా కలపబడింది",
      disconnected: "లూజ్ వైర్ / తెగిపోయింది",
      polarity: "LED ధృవణత (Polarity)",
      correct: "సరైనది (+ పిన్ 13 కి)",
      reversed: "వ్యతిరేకం (కాథోడ్/ఆనోడ్ మార్చబడ్డాయి)",
      resistor: "రెసిస్టర్ రక్షణ",
      resistorOk: "220Ω రెసిస్టర్ ఉంది (సురక్షితం)",
      resistorMissing: "రెసిస్టర్ లేదు! (కాలిపోయే ప్రమాదం 🔥)",
      swapPins: "ఎకో / ట్రిగ్ పిన్ కాన్ఫిగరేషన్",
      correctPins: "సరైనది (Trig: D12, Echo: D11)",
      swappedPins: "పిన్స్ మారాయి! (Trig/Echo మార్చబడింది)",
      obstacleDistance: "అడ్డంకి దూరం",
      voltage: "ఆర్డుఇనో పవర్ సప్లై",
      voltage5V: "5V పవర్ (బలమైన కరెంట్)",
      voltage3V: "3.3V పవర్ (బలహీనమైన/నెమ్మదిగా తిరుగుతుంది)",
      askAiButton: "ఈ కాన్ఫిగరేషన్ గురించి వివరించమని సతీని అడగండి",
      ledStatusOn: "[సమాచారం] పిన్ 13 HIGH: LED ఆన్",
      ledStatusOff: "[సమాచారం] పిన్ 13 LOW: LED ఆఫ్",
      ledStatusErrPolarity: "[హెచ్చరిక] LED తలక్రిందులుగా ఉంది. కరెంట్ ప్రవహించదు.",
      ledStatusErrResistor: "[ప్రమాదం] అధిక కరెంట్! రెసిస్టర్ లేకుండా LED కాలిపోయే ప్రమాదం ఉంది!",
      ledStatusErrWire: "[లోపం] కనెక్షన్ తెగిపోయింది. పిన్ 13 కరెంట్ వైర్ సరిగ్గా లేదు.",
      ultraStatusOk: (d: number) => `[సీరియల్] కొలిచిన దూరం: ${d} సెం.మీ`,
      ultraStatusErrPins: "[లోపం] ఎకో టైమౌట్. Trig/Echo వైర్లు తారుమారయ్యాయా?",
      ultraStatusErrWire: "[లోపం] సెన్సార్ కనెక్షన్ లేదు. VCC/GND వైర్లు చూడండి.",
      servoStatusOk: (a: number, v: string) => `[సీరియల్] కోణం సెట్ చేయబడింది: ${a}° (${v} పవర్)`,
      servoStatusErrWire: "[లోపం] సెర్వో మోటార్ సిగ్నల్ వైర్ డిస్‌కనెక్ట్ అయింది.",
      blockCode: "బ్లాక్లీ విజువల్స్",
      cppCode: "ఆర్డుఇనో C++ కోడ్"
    }
  };

  const vt = vTranslations[language];

  // Helper to handle sending pre-configured prompts to AI
  const handleQueryAI = () => {
    let query = "";
    if (activeSetup === 'led') {
      query = `Please explain how the LED Blink Arduino circuit works, why we need a 220 ohm resistor, what anode/cathode polarity means, and how to troubleshoot loose wire connections on physical breadboards.`;
    } else if (activeSetup === 'ultrasonic') {
      query = `Explain how the HC-SR04 Ultrasonic Distance sensor measures distance in centimeters using sound waves, how Echo and Trig pins function, and why swapping Trig/Echo pins in code versus hardware results in a timeout error.`;
    } else {
      query = `Help me understand how a Servo motor is controlled using PWM (Pulse Width Modulation) on an Arduino, what the 3 wire lines (Signal, Power, Ground) do, and why a 3.3V power supply makes the servo jitter or move slowly compared to a 5V source.`;
    }
    onAskAI(query);
  };

  return (
    <div id="hardware-visualizer" className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 bg-slate-50 border-3 border-[#1a1a1a] rounded-[24px] shadow-[6px_6px_0px_#1a1a1a] h-full overflow-y-auto">
      
      {/* Visual Workspace and Serial Monitor */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Workspace Title & Selector tabs */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-4 shadow-[3px_3px_0px_#1a1a1a]">
          <h2 className="font-gaegu text-3xl font-black text-[#1a1a1a] flex items-center gap-2">
            🔌 {vt.title}
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            {vt.subtitle}
          </p>

          {/* Circuit Tabs */}
          <div className="flex gap-2.5 mt-4 border-t-2 border-[#1a1a1a]/5 pt-3 overflow-x-auto">
            <button
              onClick={() => setActiveSetup('led')}
              className={`px-4 py-2 text-xs font-mono font-black rounded-xl border-2 border-[#1a1a1a] transition-all transform ${
                activeSetup === 'led'
                  ? 'bg-amber-100 text-amber-900 -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]'
                  : 'bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              💡 {vt.ledTab}
            </button>
            <button
              onClick={() => setActiveSetup('ultrasonic')}
              className={`px-4 py-2 text-xs font-mono font-black rounded-xl border-2 border-[#1a1a1a] transition-all transform ${
                activeSetup === 'ultrasonic'
                  ? 'bg-sky-100 text-sky-900 -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]'
                  : 'bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              📡 {vt.ultrasonicTab}
            </button>
            <button
              onClick={() => setActiveSetup('servo')}
              className={`px-4 py-2 text-xs font-mono font-black rounded-xl border-2 border-[#1a1a1a] transition-all transform ${
                activeSetup === 'servo'
                  ? 'bg-emerald-100 text-emerald-900 -translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a]'
                  : 'bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              ⚙️ {vt.servoTab}
            </button>
          </div>
        </div>

        {/* Visual Circuit Simulation Stage */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 shadow-[3px_3px_0px_#1a1a1a] relative flex items-center justify-center min-h-[260px] md:min-h-[340px] bg-grid overflow-hidden">
          
          {/* Moving electron signal indicator along active wiring */}
          {wireSecured && (blinkState || activeSetup !== 'led') && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{ top: '35%', left: '48%' }}></div>
              <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{ top: '55%', left: '55%' }}></div>
            </div>
          )}

          {/* Render LED BLINK CIRCUIT */}
          {activeSetup === 'led' && (
            <div className="flex flex-col md:flex-row items-center gap-10 select-none">
              
              {/* Virtual Arduino Uno Drawing */}
              <div className="w-52 h-36 bg-blue-900 rounded-xl border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] relative p-3 text-white font-mono text-[8px] flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">ARDUINO UNO</span>
                  <div className="w-10 h-6 bg-slate-300 border-2 border-[#1a1a1a] rounded flex items-center justify-center text-[#1a1a1a] font-bold text-[7px]">USB</div>
                </div>

                <div className="flex justify-center gap-1.5 my-1">
                  <div className="bg-amber-400 w-3 h-2 animate-pulse border border-[#1a1a1a]"></div>
                  <div className="bg-emerald-400 w-3 h-2 border border-[#1a1a1a]"></div>
                </div>

                {/* Pin labels */}
                <div className="flex justify-between border-t border-white/20 pt-1 mt-auto">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-amber-300">GND [•]</span>
                    <span>5V [•]</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={`${wireSecured && blinkState ? 'text-green-300' : 'text-slate-400'} font-bold`}>Pin 13 (Signal) [•]</span>
                    <span>Pin 12 [•]</span>
                  </div>
                </div>

                {/* Wire outputs visual indicators */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                  {/* Ground Wire (black) */}
                  <path 
                    d="M 28 120 C 15 170, 100 190, 145 138" 
                    fill="none" 
                    stroke="#1a1a1a" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 28 120 C 15 170, 100 190, 145 138" 
                    fill="none" 
                    stroke="#374151" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    className={`${wireSecured ? 'stroke-slate-800' : 'stroke-red-400 stroke-dasharray'}`}
                    strokeDasharray={wireSecured ? "none" : "5,5"}
                  />
                  {/* Signal Wire Pin 13 (Yellow/Red) */}
                  <path 
                    d="M 185 120 C 230 180, 240 180, 185 110" 
                    fill="none" 
                    stroke="#1a1a1a" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 185 120 C 230 180, 240 180, 185 110" 
                    fill="none" 
                    stroke={wireSecured && blinkState ? '#fbbf24' : '#9ca3af'} 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    className={`${wireSecured && blinkState ? 'animate-pulse' : ''}`}
                  />
                </svg>
              </div>

              {/* Breadboard component with Resistor & LED */}
              <div className="relative bg-slate-100 rounded-xl border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] p-4 flex flex-col items-center gap-3 w-48 h-36">
                <span className="font-mono text-[8px] font-black tracking-widest text-[#1a1a1a]/50">MINI BREADBOARD</span>
                
                <div className="flex gap-4 items-center mt-2">
                  {/* Resistor Component */}
                  <div className={`flex items-center relative ${hasResistor ? 'opacity-100' : 'opacity-20'}`}>
                    <div className="w-12 h-1 bg-slate-400"></div>
                    <div className="w-8 h-4 bg-amber-100 border-2 border-[#1a1a1a] rounded-sm flex justify-center items-center gap-0.5 absolute left-2 select-none">
                      <div className="w-1 h-full bg-amber-800"></div>
                      <div className="w-1 h-full bg-red-600"></div>
                      <div className="w-1 h-full bg-amber-500"></div>
                    </div>
                  </div>

                  {/* LED Component */}
                  <div className="relative flex flex-col items-center">
                    {/* Glowing aura */}
                    {blinkState && wireSecured && ledPolarity && (
                      <div className={`absolute -top-3 w-12 h-12 rounded-full ${hasResistor ? 'bg-red-400/55 animate-ping' : 'bg-red-500/80 animate-ping'} blur-sm pointer-events-none`}></div>
                    )}
                    
                    {/* LED Diode Body */}
                    <div className={`w-8 h-10 border-2 border-[#1a1a1a] rounded-t-full relative z-10 transition-all ${
                      blinkState && wireSecured && ledPolarity
                        ? hasResistor ? 'bg-red-500' : 'bg-red-200 border-red-800 animate-bounce' // burnout
                        : 'bg-red-900/30'
                    }`}>
                      {/* Inside details */}
                      <div className="absolute top-2 left-1.5 w-1 h-4 bg-white/40 rounded-full"></div>
                      {!hasResistor && blinkState && wireSecured && (
                        <div className="absolute top-2 right-1.5 text-[8px] animate-bounce">💥</div>
                      )}
                    </div>
                    {/* Anode/Cathode Pins */}
                    <div className="flex gap-2">
                      <div className={`w-1.5 h-6 border-l border-r border-b border-[#1a1a1a] ${ledPolarity ? 'h-6' : 'h-4 bg-amber-300'}`}></div>
                      <div className={`w-1.5 h-4 border-l border-r border-b border-[#1a1a1a] ${ledPolarity ? 'h-4 bg-amber-300' : 'h-6'}`}></div>
                    </div>
                    {/* Indicator tags */}
                    <div className="absolute -bottom-6 text-[8px] font-mono font-bold bg-amber-100 border border-[#1a1a1a] px-1 rounded">
                      {ledPolarity ? 'Anode (+)' : 'Cathode (-)'}
                    </div>
                  </div>
                </div>

                {/* Loose wire toggle feedback indicator */}
                {!wireSecured && (
                  <div className="absolute -top-3 right-4 bg-red-500 text-white border-2 border-[#1a1a1a] text-[9px] font-bold px-2 py-0.5 rounded-full shadow-[2px_2px_0px_#1a1a1a] animate-bounce">
                    ⚠️ Wires Disconnected!
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Render ULTRASONIC SENSOR */}
          {activeSetup === 'ultrasonic' && (
            <div className="flex flex-col md:flex-row items-center gap-10 w-full justify-around select-none px-4">
              
              {/* Ultrasonic sensor component drawing */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative bg-teal-800 rounded-xl border-3 border-[#1a1a1a] w-40 h-20 p-2 shadow-[4px_4px_0px_#1a1a1a] flex justify-between items-center">
                  
                  {/* Left cylindrical sensor (Transmitter) */}
                  <div className="w-12 h-12 bg-slate-300 rounded-full border-3 border-[#1a1a1a] flex items-center justify-center relative">
                    <div className="w-8 h-8 rounded-full border border-[#1a1a1a] bg-slate-400 flex items-center justify-center">
                      <div className="w-4 h-4 bg-slate-600 rounded-full"></div>
                    </div>
                    <span className="absolute -bottom-5 font-mono text-[7px] font-black text-white bg-[#1a1a1a] px-1 rounded">T</span>
                  </div>

                  <span className="font-mono text-[7px] font-black text-teal-100 tracking-tighter absolute top-1 left-12">HC-SR04</span>

                  {/* Ultrasonic Waves animation */}
                  {ultrasonicWireConnected && !trigEchoSwapped && (
                    <div className="absolute left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                      <div className="w-1 h-4 bg-sky-400 rounded-full animate-ping [animation-delay:-0.2s]"></div>
                      <div className="w-1 h-4 bg-sky-400 rounded-full animate-ping"></div>
                    </div>
                  )}

                  {/* Right cylindrical sensor (Receiver) */}
                  <div className="w-12 h-12 bg-slate-300 rounded-full border-3 border-[#1a1a1a] flex items-center justify-center relative">
                    <div className="w-8 h-8 rounded-full border border-[#1a1a1a] bg-slate-400 flex items-center justify-center">
                      <div className="w-4 h-4 bg-slate-600 rounded-full"></div>
                    </div>
                    <span className="absolute -bottom-5 font-mono text-[7px] font-black text-white bg-[#1a1a1a] px-1 rounded">R</span>
                  </div>

                  {/* Ground Pins label bottom */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-1 bg-[#1a1a1a] border border-teal-100 rounded text-teal-100 font-mono text-[5px] p-0.5">
                    <span>VCC</span>
                    <span className={trigEchoSwapped ? 'text-red-300' : ''}>Trig</span>
                    <span className={trigEchoSwapped ? 'text-red-300' : ''}>Echo</span>
                    <span>GND</span>
                  </div>
                </div>

                <div className="text-[9px] font-mono font-bold text-slate-500 mt-2 text-center">
                  {trigEchoSwapped ? 'Trig connected to Echo pin, Echo to Trig!' : 'Connected: Trig to D12, Echo to D11'}
                </div>
              </div>

              {/* Dynamic Obstacle Wall */}
              <div className="flex flex-col items-center gap-3 w-40 relative">
                <span className="text-[9px] font-mono font-black text-slate-500 uppercase">Target Obstacle</span>
                
                {/* Distance Slider / Wall visual representation */}
                <div 
                  className="bg-amber-100 border-2 border-dashed border-amber-600 rounded-xl p-3 flex flex-col items-center justify-center shadow-[2px_2px_0px_#1a1a1a] h-24 transition-all"
                  style={{
                    transform: `scale(${1 - (sensorDistance - 5) * 0.004})`,
                    borderColor: sensorDistance < 20 ? '#EF4444' : '#D97706',
                    backgroundColor: sensorDistance < 20 ? '#FEF2F2' : '#FEF3C7'
                  }}
                >
                  <span className="text-xl">🧱</span>
                  <span className="font-mono font-black text-xs mt-1 text-[#1a1a1a]">{sensorDistance} cm</span>
                  <span className={`text-[8px] font-mono font-bold uppercase mt-1 ${sensorDistance < 20 ? 'text-red-600 animate-pulse' : 'text-amber-800'}`}>
                    {sensorDistance < 20 ? 'Too Close!' : 'In Range'}
                  </span>
                </div>

                <input 
                  type="range"
                  min="5"
                  max="100"
                  value={sensorDistance}
                  onChange={(e) => setSensorDistance(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5e43ff]"
                />
              </div>

            </div>
          )}

          {/* Render SERVO MOTOR */}
          {activeSetup === 'servo' && (
            <div className="flex flex-col md:flex-row items-center gap-10 w-full justify-around select-none">
              
              {/* Servo Motor Housing drawing */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-32 h-20 bg-blue-600 rounded-lg border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex justify-center items-center">
                  
                  {/* Metal Shaft gear */}
                  <div 
                    className="absolute -top-4 w-12 h-12 rounded-full border-3 border-[#1a1a1a] bg-slate-100 flex items-center justify-center transition-transform duration-300 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                    style={{ transform: `rotate(${servoAngle}deg)` }}
                  >
                    {/* Visual horn (propeller arm) */}
                    <div className="w-20 h-4 bg-white border-2 border-[#1a1a1a] rounded-full relative">
                      <div className="absolute top-1 left-1.5 w-1 h-1 bg-[#1a1a1a] rounded-full"></div>
                      <div className="absolute top-1 right-1.5 w-1 h-1 bg-[#1a1a1a] rounded-full"></div>
                    </div>
                    {/* Center screw */}
                    <div className="absolute w-3 h-3 bg-slate-400 border border-[#1a1a1a] rounded-full"></div>
                  </div>

                  <span className="font-mono text-[9px] font-black text-white/70 absolute bottom-1">SG90 9g SERVO</span>
                </div>

                <div className="text-[10px] font-mono font-bold text-slate-500 text-center">
                  Signal Wire: PIN D9 | Power: {voltagePin}
                </div>
              </div>

              {/* Slider Controls for Servo angle */}
              <div className="flex flex-col gap-3 w-44">
                <span className="text-[9px] font-mono font-black text-slate-500 uppercase text-center">Control Signal Sweep</span>
                <div className="flex justify-between font-mono text-[10px] font-bold text-slate-600">
                  <span>0°</span>
                  <span className="text-emerald-600 font-extrabold">{servoAngle}°</span>
                  <span>180°</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="180"
                  value={servoAngle}
                  onChange={(e) => setServoAngle(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5e43ff]"
                />
                
                {/* Simulated voltage power status indicator */}
                <div className={`p-2 rounded-xl border border-[#1a1a1a]/10 text-[9px] font-mono font-bold text-center ${voltagePin === '3.3V' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                  {voltagePin === '3.3V' ? '⚠️ 3.3V: Motor underpowered (sweeps slowly)' : '✓ 5V: Normal high-torque operations'}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Diagnostic Serial Monitor Console Output */}
        <div className="bg-[#1a1a1a] text-emerald-400 font-mono text-xs rounded-2xl p-4 shadow-[4px_4px_0px_rgba(26,26,26,0.3)] border-2 border-slate-700 min-h-[90px] flex flex-col select-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <span>{vt.diagnosticConsole}</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>BAUD RATE: 9600</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end font-semibold">
            {activeSetup === 'led' && (
              <>
                {!wireSecured && <div className="text-red-500">{vt.ledStatusErrWire}</div>}
                {wireSecured && !ledPolarity && <div className="text-yellow-400">{vt.ledStatusErrPolarity}</div>}
                {wireSecured && ledPolarity && !hasResistor && <div className="text-red-500 font-extrabold">{vt.ledStatusErrResistor}</div>}
                {wireSecured && ledPolarity && hasResistor && (
                  <div>{blinkState ? vt.ledStatusOn : vt.ledStatusOff}</div>
                )}
              </>
            )}

            {activeSetup === 'ultrasonic' && (
              <>
                {!ultrasonicWireConnected && <div className="text-red-500">{vt.ultraStatusErrWire}</div>}
                {ultrasonicWireConnected && trigEchoSwapped && <div className="text-red-500">{vt.ultraStatusErrPins}</div>}
                {ultrasonicWireConnected && !trigEchoSwapped && (
                  <div>{vt.ultraStatusOk(sensorDistance)}</div>
                )}
              </>
            )}

            {activeSetup === 'servo' && (
              <>
                {!servoWireConnected && <div className="text-red-500">{vt.servoStatusErrWire}</div>}
                {servoWireConnected && (
                  <div>{vt.servoStatusOk(servoAngle, voltagePin)}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fault Sim Control Panel & AI helper */}
      <div className="w-full xl:w-80 shrink-0 space-y-5">
        
        {/* Controls Container Card */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-5 shadow-[3px_3px_0px_#1a1a1a] space-y-4">
          <h3 className="font-gaegu text-2.5xl font-black text-[#1a1a1a] flex items-center gap-1.5 border-b-2 border-[#1a1a1a]/5 pb-2">
            ⚙️ {vt.panelControls}
          </h3>

          {/* Dynamic control options based on active setup */}
          {activeSetup === 'led' && (
            <div className="space-y-4 font-mono text-xs font-bold text-slate-700">
              {/* Toggle Connection wire */}
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#1a1a1a]/10 rounded-xl">
                <span className="flex flex-col gap-0.5">
                  <span>{vt.looseWire}</span>
                  <span className={`text-[10px] ${wireSecured ? 'text-emerald-600' : 'text-red-500'}`}>
                    {wireSecured ? vt.connected : vt.disconnected}
                  </span>
                </span>
                <input 
                  type="checkbox" 
                  checked={wireSecured}
                  onChange={(e) => setWireSecured(e.target.checked)}
                  className="w-10 h-5 bg-gray-200 checked:bg-emerald-500 rounded-full cursor-pointer appearance-none relative border-2 border-[#1a1a1a] before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:border before:border-[#1a1a1a] before:top-0 before:left-0 checked:before:translate-x-5 transition-all"
                />
              </div>

              {/* Toggle Polarity */}
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#1a1a1a]/10 rounded-xl">
                <span className="flex flex-col gap-0.5">
                  <span>{vt.polarity}</span>
                  <span className={`text-[10px] ${ledPolarity ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {ledPolarity ? vt.correct : vt.reversed}
                  </span>
                </span>
                <input 
                  type="checkbox" 
                  checked={ledPolarity}
                  onChange={(e) => setLedPolarity(e.target.checked)}
                  className="w-10 h-5 bg-gray-200 checked:bg-emerald-500 rounded-full cursor-pointer appearance-none relative border-2 border-[#1a1a1a] before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:border before:border-[#1a1a1a] before:top-0 before:left-0 checked:before:translate-x-5 transition-all"
                />
              </div>

              {/* Toggle Resistor */}
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#1a1a1a]/10 rounded-xl">
                <span className="flex flex-col gap-0.5">
                  <span>{vt.resistor}</span>
                  <span className={`text-[10px] ${hasResistor ? 'text-emerald-600' : 'text-red-500 font-extrabold'}`}>
                    {hasResistor ? vt.resistorOk : vt.resistorMissing}
                  </span>
                </span>
                <input 
                  type="checkbox" 
                  checked={hasResistor}
                  onChange={(e) => setHasResistor(e.target.checked)}
                  className="w-10 h-5 bg-gray-200 checked:bg-emerald-500 rounded-full cursor-pointer appearance-none relative border-2 border-[#1a1a1a] before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:border before:border-[#1a1a1a] before:top-0 before:left-0 checked:before:translate-x-5 transition-all"
                />
              </div>
            </div>
          )}

          {activeSetup === 'ultrasonic' && (
            <div className="space-y-4 font-mono text-xs font-bold text-slate-700">
              {/* Toggle Swap Trig Echo */}
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#1a1a1a]/10 rounded-xl">
                <span className="flex flex-col gap-0.5">
                  <span>{vt.swapPins}</span>
                  <span className={`text-[10px] ${!trigEchoSwapped ? 'text-emerald-600' : 'text-red-500 font-extrabold'}`}>
                    {!trigEchoSwapped ? vt.correctPins : vt.swappedPins}
                  </span>
                </span>
                <input 
                  type="checkbox" 
                  checked={trigEchoSwapped}
                  onChange={(e) => setTrigEchoSwapped(e.target.checked)}
                  className="w-10 h-5 bg-gray-200 checked:bg-red-500 rounded-full cursor-pointer appearance-none relative border-2 border-[#1a1a1a] before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:border before:border-[#1a1a1a] before:top-0 before:left-0 checked:before:translate-x-5 transition-all"
                />
              </div>

              {/* Loose Wire connection trigger */}
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#1a1a1a]/10 rounded-xl">
                <span className="flex flex-col gap-0.5">
                  <span>{vt.looseWire}</span>
                  <span className={`text-[10px] ${ultrasonicWireConnected ? 'text-emerald-600' : 'text-red-500'}`}>
                    {ultrasonicWireConnected ? vt.connected : vt.disconnected}
                  </span>
                </span>
                <input 
                  type="checkbox" 
                  checked={ultrasonicWireConnected}
                  onChange={(e) => setUltrasonicWireConnected(e.target.checked)}
                  className="w-10 h-5 bg-gray-200 checked:bg-emerald-500 rounded-full cursor-pointer appearance-none relative border-2 border-[#1a1a1a] before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:border before:border-[#1a1a1a] before:top-0 before:left-0 checked:before:translate-x-5 transition-all"
                />
              </div>
            </div>
          )}

          {activeSetup === 'servo' && (
            <div className="space-y-4 font-mono text-xs font-bold text-slate-700">
              {/* Voltage settings */}
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#1a1a1a]/10 rounded-xl">
                <span className="flex flex-col gap-0.5">
                  <span>{vt.voltage}</span>
                  <span className={`text-[10px] ${voltagePin === '5V' ? 'text-emerald-600' : 'text-amber-500 font-extrabold'}`}>
                    {voltagePin === '5V' ? vt.voltage5V : vt.voltage3V}
                  </span>
                </span>
                <button 
                  onClick={() => setVoltagePin(prev => prev === '5V' ? '3.3V' : '5V')}
                  className="px-3 py-1 bg-white border-2 border-[#1a1a1a] rounded-lg shadow-[1px_1px_0px_#1a1a1a] hover:bg-slate-50 hover:active:scale-95 transition-all"
                >
                  🔋 Toggle {voltagePin === '5V' ? '3.3V' : '5V'}
                </button>
              </div>

              {/* Wire connections */}
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#1a1a1a]/10 rounded-xl">
                <span className="flex flex-col gap-0.5">
                  <span>{vt.looseWire}</span>
                  <span className={`text-[10px] ${servoWireConnected ? 'text-emerald-600' : 'text-red-500'}`}>
                    {servoWireConnected ? vt.connected : vt.disconnected}
                  </span>
                </span>
                <input 
                  type="checkbox" 
                  checked={servoWireConnected}
                  onChange={(e) => setServoWireConnected(e.target.checked)}
                  className="w-10 h-5 bg-gray-200 checked:bg-emerald-500 rounded-full cursor-pointer appearance-none relative border-2 border-[#1a1a1a] before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:border before:border-[#1a1a1a] before:top-0 before:left-0 checked:before:translate-x-5 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Explain & Dialogue Card */}
        <div className="bg-[#FFFDF9] border-2 border-[#1a1a1a] rounded-2xl p-5 shadow-[3px_3px_0px_#1a1a1a] space-y-3.5">
          <h3 className="font-gaegu text-2xl font-black text-[#1a1a1a] flex items-center gap-1.5 border-b border-[#1a1a1a]/5 pb-1">
            <Info className="w-5 h-5 text-amber-600" /> {vt.circuitExplanation}
          </h3>
          
          <div className="text-xs text-slate-700 font-semibold leading-relaxed space-y-2">
            {activeSetup === 'led' && (
              <p>
                {language === 'hi' 
                  ? "एक डिजिटल पिन (13) से करंट विद्युत आवेश को सकारात्मक तार से होकर एलईडी के पॉजिटिव (एनोड) पिन तक पहुंचाता है। 220 ओम का प्रतिरोधक करंट की गति को सीमित करता है जिससे एलईडी जलने से बचती है।"
                  : "A digital signal (Pin 13) routes positive voltage through the brown resistor to the long leg (Anode) of the LED. Ground completes the negative circuit loop back to the Arduino. A 220 ohm resistor acts like a water tap, slowing down the electrical flow so the delicate LED diode is protected from high current burnout."
                }
              </p>
            )}

            {activeSetup === 'ultrasonic' && (
              <p>
                {language === 'hi' 
                  ? "सेंसर 'Trig' पिन पर 10 माइक्रोसेकंड का पल्स भेजता है जो हवा में ध्वनि तरंगें छोड़ता है। जब तरंगें किसी वस्तु (🧱) से टकराकर वापस लौटती हैं, तो 'Echo' पिन एक पल्स रिसीव करती है। दूरी की गणना पल्स के जाने और आने के समय से की जाती है।"
                  : "The sensor fires an ultrasonic sound wave pulse from the Transmitter (T). The sound hits the target obstacle wall (🧱) and bounces back to the Receiver (R). The Arduino measures how many microseconds the sound wave took to make the round trip, and calculates distance based on the speed of sound: Distance = (Time * 0.0343) / 2."
                }
              </p>
            )}

            {activeSetup === 'servo' && (
              <p>
                {language === 'hi' 
                  ? "सर्वो मोटर एक विशेष सिग्नल पिन (D9) का उपयोग करके 'पल्स विड्थ मॉड्यूलेशन' (PWM) की मदद से कोण को निर्देशित करती है। 3.3V करंट से मोटर कमजोर रहती है, जबकि 5V उच्च शक्ति सुनिश्चित करता है।"
                  : "A standard Hobby Servo uses PWM (Pulse Width Modulation) signal bursts every 20 milliseconds to command a specific rotary shaft angle from 0 to 180 degrees. If the physical power source is degraded down to 3.3V, the inner driver chips cannot generate enough rotational torque, leading to jittery sweeps and sluggish motor response."
                }
              </p>
            )}
          </div>

          <button
            onClick={handleQueryAI}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5e43ff] text-white border-2 border-[#1a1a1a] text-xs font-mono font-black rounded-xl hover:-translate-y-0.5 shadow-[2px_2px_0px_#1a1a1a] transition-all active:translate-y-0"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" /> {vt.askAiButton}
          </button>
        </div>

        {/* Code View Card */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-4 shadow-[3px_3px_0px_#1a1a1a] space-y-2">
          <span className="font-mono text-[9px] font-extrabold text-[#1a1a1a]/40 uppercase tracking-widest block">{vt.codeBlocks}</span>
          
          <pre className="p-3 bg-slate-900 text-[#cbd5e1] font-mono text-[10px] rounded-xl overflow-x-auto border border-slate-700 leading-normal max-h-36 overflow-y-auto font-medium">
            {activeSetup === 'led' && (
`void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`
            )}
            {activeSetup === 'ultrasonic' && (
`const int trigPin = 12;
const int echoPin = 11;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH);
  int distance = duration * 0.034 / 2;
  Serial.print("Distance: ");
  Serial.println(distance);
  delay(100);
}`
            )}
            {activeSetup === 'servo' && (
`#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  // Rotate shaft to sweep angle
  myServo.write(${servoAngle});
  delay(15);
}`
            )}
          </pre>
          
          <div className="flex gap-2 items-center p-2 bg-indigo-50/50 border border-indigo-200/50 rounded-xl">
            <span className="text-sm">🧩</span>
            <div className="text-[9px] font-bold text-indigo-900">
              <span className="block uppercase font-mono tracking-wide">{vt.blockCode}:</span>
              {activeSetup === 'led' && (language === 'hi' ? "दोहराएं लगातार [पिन 13 HIGH सेट करें -> 1 सेकंड प्रतीक्षा करें -> पिन 13 LOW सेट करें -> 1 सेकंड प्रतीक्षा करें]" : "Repeat Forever [Set Digital Pin 13 to HIGH -> Wait 1 second -> Set Digital Pin 13 to LOW -> Wait 1 second]")}
              {activeSetup === 'ultrasonic' && (language === 'hi' ? "दूरी का मान = [HC-SR04 सेंसर: Trig 12, Echo 11] -> मान को सीरियल मॉनीटर पर दिखाएं" : "Variable Distance = read HC-SR04 ultrasonic sensor [Trig: 12, Echo: 11] -> Show Distance value in Serial Monitor")}
              {activeSetup === 'servo' && (language === 'hi' ? "सर्वो मोटर [पिन 9] को सेट करें इस कोण पर: " + servoAngle + " डिग्री" : "Set servo [Pin 9] angle to: " + servoAngle + " degrees")}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
