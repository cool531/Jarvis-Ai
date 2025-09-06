import { useEffect, useState } from "react";

interface VoiceWaveformProps {
  isActive: boolean;
}

const VoiceWaveform = ({ isActive }: VoiceWaveformProps) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate random waveform data for visualization
    const generateBars = () => {
      const newBars = Array.from({ length: 12 }, () => 
        isActive ? Math.random() * 40 + 10 : 4
      );
      setBars(newBars);
    };

    generateBars();
    
    if (isActive) {
      const interval = setInterval(generateBars, 150);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-3 bg-gradient-to-t from-primary to-jarvis-glow rounded-full transition-all duration-150 ${
            isActive ? 'waveform-bar' : ''
          }`}
          style={{
            height: `${height}px`,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWaveform;