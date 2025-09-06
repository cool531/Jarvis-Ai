import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Power, Settings, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import VoiceWaveform from "./VoiceWaveform";
import CommandHistory from "./CommandHistory";
import StatusDisplay from "./StatusDisplay";
import "@/types/speech";

interface Command {
  id: string;
  text: string;
  response: string;
  timestamp: Date;
}

const JarvisInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [systemStatus, setSystemStatus] = useState({
    cpu: 23,
    memory: 45,
    network: "Connected",
    time: new Date().toLocaleTimeString(),
  });
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition
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
        
        // Process final results
        if (event.results[event.results.length - 1].isFinal) {
          processCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setCurrentTranscript("");
      };
    }
  }, []);

  // Update system status
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        time: new Date().toLocaleTimeString(),
        cpu: Math.random() * 30 + 15,
        memory: Math.random() * 20 + 40,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const processCommand = (text: string) => {
    const command = text.toLowerCase().trim();
    let response = "";

    // Application opening commands
    if (command.includes("open youtube") || command.includes("launch youtube")) {
      window.open("https://youtube.com", "_blank");
      response = "Opening YouTube for you.";
    } else if (command.includes("open spotify") || command.includes("launch spotify")) {
      window.open("https://open.spotify.com", "_blank");
      response = "Opening Spotify Web Player.";
    } else if (command.includes("open steam") || command.includes("launch steam")) {
      window.open("https://store.steampowered.com", "_blank");
      response = "Opening Steam Store. If you have Steam installed, you can use steam:// protocol.";
    } else if (command.includes("open discord") || command.includes("launch discord")) {
      window.open("https://discord.com/app", "_blank");
      response = "Opening Discord Web App.";
    } else if (command.includes("open netflix") || command.includes("launch netflix")) {
      window.open("https://netflix.com", "_blank");
      response = "Opening Netflix.";
    } else if (command.includes("open gmail") || command.includes("open email")) {
      window.open("https://gmail.com", "_blank");
      response = "Opening Gmail.";
    } else if (command.includes("open github") || command.includes("launch github")) {
      window.open("https://github.com", "_blank");
      response = "Opening GitHub.";
    } else if (command.includes("open google") || (command.includes("open") && command.includes("search"))) {
      window.open("https://google.com", "_blank");
      response = "Opening Google Search.";
    }
    // System information commands  
    else if (command.includes("time") || command.includes("what time")) {
      response = `The current time is ${new Date().toLocaleTimeString()}`;
    } else if (command.includes("date") || command.includes("what date")) {
      response = `Today is ${new Date().toLocaleDateString()}`;
    } else if (command.includes("status") || command.includes("system")) {
      response = `System status: CPU at ${systemStatus.cpu.toFixed(1)}%, Memory at ${systemStatus.memory.toFixed(1)}%, Network ${systemStatus.network}`;
    } 
    // Conversational commands
    else if (command.includes("hello") || command.includes("hi")) {
      response = "Hello! I am Jarvis, your AI assistant. I can open apps like YouTube, Spotify, Steam, Discord, and more. Just say 'open' followed by the app name.";
    } else if (command.includes("what can you do") || command.includes("help")) {
      response = "I can open applications like YouTube, Spotify, Steam, Discord, Netflix, Gmail, and GitHub. I can also tell you the time, date, and system status. Just ask me!";
    } else if (command.includes("thank you") || command.includes("thanks")) {
      response = "You're welcome! Always here to help.";
    }
    // Web search
    else if (command.includes("search")) {
      const searchQuery = command.replace(/.*search\s*(for)?\s*/, "").trim();
      if (searchQuery) {
        window.open(`https://google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
        response = `Searching Google for "${searchQuery}".`;
      } else {
        response = "What would you like me to search for?";
      }
    } 
    // Fallback
    else {
      response = "I can open YouTube, Spotify, Steam, Discord, Netflix, Gmail, or GitHub. I can also tell you the time, date, system status, or search the web. What would you like me to do?";
    }

    // Add command to history
    const newCommand: Command = {
      id: Date.now().toString(),
      text: text,
      response,
      timestamp: new Date(),
    };

    setCommands(prev => [newCommand, ...prev.slice(0, 9)]); // Keep last 10 commands

    // Speak the response
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }

    toast({
      title: "Command Processed",
      description: response,
    });
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
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
    setIsActive(!isActive);
    if (isListening) {
      recognitionRef.current?.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jarvis-dark via-background to-jarvis-dark jarvis-grid">
      {/* Header */}
      <header className="border-b border-jarvis-glow/20 bg-jarvis-panel/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-jarvis-glow jarvis-pulse"></div>
            <h1 className="text-2xl font-bold text-primary jarvis-flicker">JARVIS</h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusDisplay status={systemStatus} />
            <Button
              variant="ghost" 
              size="icon"
              className="jarvis-glow hover:bg-primary/10"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant={isActive ? "default" : "secondary"}
              size="icon"
              onClick={togglePower}
              className="jarvis-glow"
            >
              <Power className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Interface */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Voice Control Panel */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 bg-jarvis-panel/50 border-jarvis-glow/30 jarvis-glow backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-primary">Voice Interface</h2>
                  <p className="text-muted-foreground">
                    {isActive 
                      ? isListening 
                        ? "Listening..." 
                        : "Ready for commands"
                      : "System offline"
                    }
                  </p>
                </div>

                {/* Waveform Visualization */}
                <VoiceWaveform isActive={isListening} />

                {/* Current Transcript */}
                {currentTranscript && (
                  <div className="p-4 bg-jarvis-dark/50 rounded-lg border border-jarvis-glow/20">
                    <p className="text-jarvis-glow font-mono">{currentTranscript}</p>
                  </div>
                )}

                {/* Voice Control Button */}
                <Button
                  onClick={toggleListening}
                  disabled={!isActive}
                  size="lg"
                  className={`w-32 h-32 rounded-full jarvis-glow transition-all duration-300 ${
                    isListening 
                      ? "bg-destructive hover:bg-destructive/80 jarvis-pulse" 
                      : "bg-primary hover:bg-primary/80"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-12 h-12" />
                  ) : (
                    <Mic className="w-12 h-12" />
                  )}
                </Button>

                <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Speech Recognition: {isActive ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Command History */}
          <div className="space-y-8">
            <CommandHistory commands={commands} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default JarvisInterface;