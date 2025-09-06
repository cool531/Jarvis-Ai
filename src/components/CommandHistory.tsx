import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Bot } from "lucide-react";

interface Command {
  id: string;
  text: string;
  response: string;
  timestamp: Date;
}

interface CommandHistoryProps {
  commands: Command[];
}

const CommandHistory = ({ commands }: CommandHistoryProps) => {
  return (
    <Card className="p-6 bg-jarvis-panel/50 border-jarvis-glow/30 backdrop-blur-sm h-[600px]">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Command History
        </h3>
        
        <ScrollArea className="h-[520px]">
          <div className="space-y-4">
            {commands.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-jarvis-glow/50" />
                <p>No commands yet.</p>
                <p className="text-sm">Start by saying "Hello Jarvis"</p>
              </div>
            ) : (
              commands.map((command) => (
                <div key={command.id} className="space-y-2">
                  {/* User Command */}
                  <div className="flex justify-end">
                    <div className="max-w-xs bg-primary/20 border border-primary/30 rounded-lg p-3">
                      <p className="text-sm text-primary">{command.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {command.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Jarvis Response */}
                  <div className="flex justify-start">
                    <div className="max-w-xs bg-jarvis-dark/50 border border-jarvis-glow/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Bot className="w-4 h-4 text-jarvis-glow mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-jarvis-glow">{command.response}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};

export default CommandHistory;