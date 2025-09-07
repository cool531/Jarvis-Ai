import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Power, Settings, Activity, Zap, Shield, Cpu, HardDrive, Wifi, Clock, Calendar, Search, Eye, Brain, Loader } from "lucide-react";

interface Command {
  id: string;
  text: string;
  response: string;
  timestamp: Date;
  type: 'voice' | 'system' | 'error';
}

const JarvisInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    cpu: 23,
    memory: 45,
    network: "SECURE",
    uptime: "00:00:00",
    power: 98,
    temperature: 42
  });
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(0));
  const animationRef = useRef<number>();

  // Boot sequence
  useEffect(() => {
    const bootMessages = [
      "INITIALIZING JARVIS SYSTEMS...",
      "LOADING NEURAL NETWORKS...",
      "CONNECTING TO STARK INDUSTRIES MAINFRAME...",
      "VOICE RECOGNITION ONLINE",
      "NATURAL LANGUAGE PROCESSING READY",
      "ALL SYSTEMS OPERATIONAL"
    ];

    let messageIndex = 0;
    const bootInterval = setInterval(() => {
      if (messageIndex < bootMessages.length) {
        const newCommand: Command = {
          id: Date.now().toString() + messageIndex,
          text: "",
          response: bootMessages[messageIndex],
          timestamp: new Date(),
          type: 'system'
        };
        setCommands(prev => [newCommand, ...prev]);
        messageIndex++;
      } else {
        clearInterval(bootInterval);
        setIsBooting(false);
        // Welcome message
        setTimeout(() => {
          const welcomeCommand: Command = {
            id: Date.now().toString(),
            text: "",
            response: "Good evening, Mr. Stark. JARVIS at your service. All systems are online and ready for your commands.",
            timestamp: new Date(),
            type: 'system'
          };
          setCommands(prev => [welcomeCommand, ...prev]);
          speak("Good evening, Mr. Stark. JARVIS at your service. All systems are online and ready for your commands.");
        }, 1000);
      }
    }, 800);

    return () => clearInterval(bootInterval);
  }, []);

  // Initialize speech recognition and audio visualization
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          processCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        const errorCommand: Command = {
          id: Date.now().toString(),
          text: "",
          response: `Voice recognition error: ${event.error}. Please try again.`,
          timestamp: new Date(),
          type: 'error'
        };
        setCommands(prev => [errorCommand, ...prev]);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setCurrentTranscript("");
      };
    }

    // Initialize audio context for visualization
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          
          analyserRef.current.fftSize = 256;
          const bufferLength = analyserRef.current.frequencyBinCount;
          dataArrayRef.current = new Uint8Array(bufferLength);
        })
        .catch(err => console.log('Microphone access denied:', err));
    }
  }, []);

  // Update system status with more realistic data
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(uptime / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
      const seconds = (uptime % 60).toString().padStart(2, '0');

      setSystemStatus(prev => ({
        ...prev,
        uptime: `${hours}:${minutes}:${seconds}`,
        cpu: Math.random() * 15 + 20,
        memory: Math.random() * 10 + 40,
        power: Math.max(95, Math.random() * 5 + 95),
        temperature: Math.random() * 5 + 40,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const speak = (text: string, rate: number = 0.9) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to use a more robotic voice if available
      const voices = speechSynthesis.getVoices();
      const roboticVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('alex') || 
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('male')
      );
      if (roboticVoice) utterance.voice = roboticVoice;
      
      speechSynthesis.speak(utterance);
    }
  };

  const processCommand = async (text: string) => {
    setIsProcessing(true);
    const command = text.toLowerCase().trim();
    let response = "";
    let commandType: 'voice' | 'system' | 'error' = 'voice';

    // Advanced AI-like responses
    if (command.includes("hello") || command.includes("hi") || command.includes("jarvis")) {
      const greetings = [
        "Good to see you, Mr. Stark. How may I assist you today?",
        "At your service. What can I help you with?",
        "Hello, Mr. Stark. All systems are running optimally.",
        "Good day. JARVIS reporting for duty."
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // Application controls with more personality
    else if (command.includes("open youtube") || command.includes("launch youtube")) {
      window.open("https://youtube.com", "_blank");
      response = "Opening YouTube. Shall I search for something specific, or are you browsing for entertainment?";
    } 
    else if (command.includes("open spotify") || command.includes("music") || command.includes("play music")) {
      window.open("https://open.spotify.com", "_blank");
      response = "Launching Spotify. I hope you're in the mood for some AC/DC, Mr. Stark.";
    }
    else if (command.includes("open steam") || command.includes("games")) {
      window.open("https://store.steampowered.com", "_blank");
      response = "Accessing Steam. Remember, gaming is a form of strategic thinking exercise.";
    }
    else if (command.includes("open discord")) {
      window.open("https://discord.com/app", "_blank");
      response = "Discord is now active. Your communication channels are secure.";
    }
    else if (command.includes("open netflix")) {
      window.open("https://netflix.com", "_blank");
      response = "Netflix is ready. I recommend documentaries on advanced technology.";
    }
    else if (command.includes("open gmail") || command.includes("email")) {
      window.open("https://gmail.com", "_blank");
      response = "Accessing your email. You have several unread messages that may require attention.";
    }
    else if (command.includes("open github")) {
      window.open("https://github.com", "_blank");
      response = "GitHub repository access granted. Ready to review your latest innovations.";
    }
    // System information with JARVIS personality
    else if (command.includes("system status") || command.includes("diagnostics") || command.includes("status report")) {
      response = `System diagnostics complete. CPU utilization: ${systemStatus.cpu.toFixed(1)}%, Memory usage: ${systemStatus.memory.toFixed(1)}%, Power levels: ${systemStatus.power.toFixed(1)}%, Core temperature: ${systemStatus.temperature.toFixed(1)}°C. All systems operating within normal parameters.`;
    }
    else if (command.includes("time") || command.includes("what time")) {
      const now = new Date();
      response = `The current time is ${now.toLocaleTimeString()}. You've been working for ${systemStatus.uptime}. Perhaps consider a break soon, Mr. Stark.`;
    }
    else if (command.includes("date") || command.includes("what date")) {
      response = `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Your schedule shows several important meetings today.`;
    }
    else if (command.includes("weather")) {
      response = "I'm afraid I don't have access to current weather data from this interface. Would you like me to open a weather service for you?";
    }
    // Advanced commands
    else if (command.includes("scan") || command.includes("analyze")) {
      response = "Initiating comprehensive scan... Analyzing all available data streams... Scan complete. No anomalies detected.";
    }
    else if (command.includes("security") || command.includes("threat")) {
      response = "Security protocols are active. All firewalls are operational. No threats detected in the immediate vicinity.";
    }
    else if (command.includes("shutdown") || command.includes("power down")) {
      response = "Are you sure you want to shut down JARVIS systems? This action will terminate all active processes.";
    }
    else if (command.includes("reboot") || command.includes("restart")) {
      response = "Initiating system restart sequence. All processes will be temporarily offline. Estimated downtime: 30 seconds.";
    }
    // Search functionality
    else if (command.includes("search")) {
      const searchQuery = command.replace(/.*search\s*(for)?\s*/, "").trim();
      if (searchQuery) {
        window.open(`https://google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
        response = `Searching for "${searchQuery}". Results are being compiled from multiple databases.`;
      } else {
        response = "What would you like me to search for? I have access to extensive databases.";
      }
    }
    // Help and capabilities
    else if (command.includes("what can you do") || command.includes("help") || command.includes("capabilities")) {
      response = "I can control applications, provide system diagnostics, manage your digital workspace, perform web searches, and assist with various computational tasks. I'm continuously learning and adapting to better serve your needs, Mr. Stark.";
    }
    else if (command.includes("thank you") || command.includes("thanks")) {
      const thanks = [
        "You're welcome, Mr. Stark. Always a pleasure to assist.",
        "My pleasure. That's what I'm here for.",
        "Anytime, Mr. Stark. Is there anything else you need?",
        "Happy to help. Your satisfaction is my primary directive."
      ];
      response = thanks[Math.floor(Math.random() * thanks.length)];
    }
    // Fallback with personality
    else {
      const fallbacks = [
        "I'm not quite sure I understand that command. Could you please rephrase? I'm still learning your preferences.",
        "That's outside my current capabilities, but I'm always expanding my skill set. Try asking me to open an application or check system status.",
        "I didn't catch that. Perhaps you could speak more clearly, or try a different command?",
        "My apologies, but I'm not programmed for that specific task yet. I can help with system controls, applications, or information queries."
      ];
      response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // Add realistic processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const newCommand: Command = {
      id: Date.now().toString(),
      text: text,
      response,
      timestamp: new Date(),
      type: commandType
    };

    setCommands(prev => [newCommand, ...prev.slice(0, 9)]);
    setIsProcessing(false);
    speak(response);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      const errorCommand: Command = {
        id: Date.now().toString(),
        text: "",
        response: "Speech recognition is not supported in this browser. Please use Chrome or Edge for full functionality.",
        timestamp: new Date(),
        type: 'error'
      };
      setCommands(prev => [errorCommand, ...prev]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const togglePower = () => {
    if (isActive) {
      speak("Powering down JARVIS systems. Goodbye, Mr. Stark.");
      setTimeout(() => setIsActive(false), 2000);
    } else {
      setIsActive(true);
      speak("JARVIS systems online. Welcome back, Mr. Stark.");
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
    }
  };

  // Audio waveform visualization
  const AudioWaveform = ({ isActive }: { isActive: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (!isActive || !analyserRef.current || !dataArrayRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        const buffer: ArrayBuffer = new ArrayBuffer(0); // Replace with a valid ArrayBuffer source if available
        const arr = new Uint8Array(buffer);


        
        ctx.fillStyle = 'rgba(0, 15, 25, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / dataArrayRef.current.length * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < dataArrayRef.current.length / 2; i++) {
          barHeight = (dataArrayRef.current[i] / 255) * canvas.height * 0.8;
          
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, '#00d4ff');
          gradient.addColorStop(0.5, '#0099cc');
          gradient.addColorStop(1, '#006699');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isActive]);

    return (
      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        className="w-full h-24 rounded-lg border border-cyan-500/30"
        style={{ background: 'rgba(0, 15, 25, 0.8)' }}
      />
    );
  };

  if (!isActive) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto">
            <Power className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-2xl text-gray-600">JARVIS Systems Offline</h2>
          <button
            onClick={togglePower}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
          >
            Power On
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(cyan 1px, transparent 1px),
            linear-gradient(90deg, cyan 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.1
        }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-cyan-500/30 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-ping opacity-20"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">JARVIS</h1>
              <p className="text-xs text-cyan-300/70">Just A Rather Very Intelligent System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* System Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300">{systemStatus.cpu.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300">{systemStatus.memory.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-green-300">{systemStatus.power.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300">{systemStatus.uptime}</span>
              </div>
            </div>
            
            <button
              onClick={togglePower}
              className="p-3 rounded-full bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 transition-colors"
            >
              <Power className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Interface */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Voice Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black/40 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-8">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-cyan-400">Voice Interface</h2>
                  <p className="text-cyan-300/70">
                    {isBooting 
                      ? "System Initialization..." 
                      : isListening 
                        ? "Listening for commands..." 
                        : isProcessing
                          ? "Processing..."
                          : "Ready for voice commands"
                    }
                  </p>
                </div>

                {/* Audio Waveform */}
                <div className="space-y-4">
                  <AudioWaveform isActive={isListening} />
                  
                  {/* Processing indicator */}
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-3 p-4">
                      <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
                      <span className="text-cyan-300">Analyzing command...</span>
                    </div>
                  )}
                </div>

                {/* Current Transcript */}
                {currentTranscript && (
                  <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                    <p className="text-cyan-300 font-mono text-lg">&gt; {currentTranscript}</p>
                  </div>
                )}

                {/* Voice Control Button */}
                <div className="relative">
                  <button
                    onClick={toggleListening}
                    disabled={isBooting}
                    className={`
                      w-32 h-32 rounded-full border-4 transition-all duration-300 relative
                      ${isListening 
                        ? "bg-red-600/20 border-red-500 shadow-red-500/50" 
                        : "bg-cyan-600/20 border-cyan-500 shadow-cyan-500/50"
                      }
                      shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {isListening ? (
                      <MicOff className="w-12 h-12 text-red-400 mx-auto" />
                    ) : (
                      <Mic className="w-12 h-12 text-cyan-400 mx-auto" />
                    )}
                  </button>
                  
                  {isListening && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping"></div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-cyan-300/70">
                  <div className="flex items-center gap-2 justify-center">
                    <Activity className="w-4 h-4" />
                    <span>Speech: {isListening ? "Active" : "Standby"}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Brain className="w-4 h-4" />
                    <span>AI: Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Command History & System Info */}
          <div className="space-y-6">
            {/* Command History */}
            <div className="bg-black/40 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Log
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {commands.map((command) => (
                  <div 
                    key={command.id} 
                    className={`p-3 rounded-lg border-l-2 ${
                      command.type === 'system' 
                        ? 'bg-blue-900/20 border-blue-400' 
                        : command.type === 'error'
                          ? 'bg-red-900/20 border-red-400'
                          : 'bg-cyan-900/20 border-cyan-400'
                    }`}
                  >
                    {command.text && (
                      <div className="text-sm text-gray-300 mb-1">
                        &gt; {command.text}
                      </div>
                    )}
                    <div className={`text-sm ${
                      command.type === 'system' ? 'text-blue-300' :
                      command.type === 'error' ? 'text-red-300' : 'text-cyan-300'
                    }`}>
                      {command.response}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {command.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-black/40 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                System Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">CPU Usage</span>
                  <span className="text-cyan-300">{systemStatus.cpu.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${systemStatus.cpu}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Memory</span>
                  <span className="text-cyan-300">{systemStatus.memory.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${systemStatus.memory}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Power Level</span>
                  <span className="text-green-300">{systemStatus.power.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${systemStatus.power}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div className="text-center">
                    <div className="text-cyan-400">Temperature</div>
                    <div className="text-white">{systemStatus.temperature.toFixed(1)}°C</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400">Uptime</div>
                    <div className="text-white">{systemStatus.uptime}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-black/40 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Quick Commands</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "System Status", command: "system status" },
                { label: "Open YouTube", command: "open youtube" },
                { label: "What time is it", command: "what time is it" },
                { label: "Search Google", command: "search" }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => processCommand(item.command)}
                  className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/40 transition-colors text-cyan-300 text-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default JarvisInterface;