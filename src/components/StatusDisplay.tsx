import { Card } from "@/components/ui/card";
import { Cpu, HardDrive, Wifi, Clock } from "lucide-react";

interface SystemStatus {
  cpu: number;
  memory: number;
  network: string;
  time: string;
}

interface StatusDisplayProps {
  status: SystemStatus;
}

const StatusDisplay = ({ status }: StatusDisplayProps) => {
  return (
    <div className="flex items-center gap-4">
      {/* CPU */}
      <div className="flex items-center gap-2 text-sm">
        <Cpu className="w-4 h-4 text-jarvis-glow" />
        <span className="text-jarvis-glow font-mono">
          {status.cpu.toFixed(0)}%
        </span>
      </div>
      
      {/* Memory */}
      <div className="flex items-center gap-2 text-sm">
        <HardDrive className="w-4 h-4 text-jarvis-glow" />
        <span className="text-jarvis-glow font-mono">
          {status.memory.toFixed(0)}%
        </span>
      </div>
      
      {/* Network */}
      <div className="flex items-center gap-2 text-sm">
        <Wifi className="w-4 h-4 text-jarvis-glow" />
        <span className="text-jarvis-glow font-mono">
          {status.network}
        </span>
      </div>
      
      {/* Time */}
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-jarvis-glow" />
        <span className="text-jarvis-glow font-mono">
          {status.time}
        </span>
      </div>
    </div>
  );
};

export default StatusDisplay;