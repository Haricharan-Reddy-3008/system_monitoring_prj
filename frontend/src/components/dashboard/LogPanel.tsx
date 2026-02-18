import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface Log {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
}

interface LogPanelProps {
  logs: Log[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 italic">
        No logs recorded for this project yet.
      </div>
    );
  }

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-rose-400';
      case 'WARN': return 'text-amber-400';
      default: return 'text-blue-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <ShieldAlert className="w-3 h-3" />;
      case 'WARN': return <ShieldAlert className="w-3 h-3 text-amber-400" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto font-mono text-[11px] space-y-1 p-4 bg-slate-950/50 rounded-b-xl border-t border-slate-800/50 max-h-[400px]">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 hover:bg-slate-800/20 px-2 py-1 rounded transition-colors group">
            <span className="text-slate-600 shrink-0 whitespace-nowrap">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
            </span>
            <span className={`font-bold shrink-0 w-12 flex items-center gap-1 ${getLevelStyles(log.level)}`}>
              {getLevelIcon(log.level)}
              {log.level}
            </span>
            <span className="text-slate-300 group-hover:text-white break-all">
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;
