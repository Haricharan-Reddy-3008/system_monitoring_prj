import React, { useState } from 'react';
import { Clock, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

interface Anomaly {
  id: string;
  type: string;
  severity: string;
  description: string;
  detected_at: string;
}

interface AnomalyListProps {
  anomalies: Anomaly[];
}

const AnomalyList: React.FC<AnomalyListProps> = ({ anomalies }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, { text: string; loading: boolean }>>({});

  const fetchExplanation = async (anomalyId: string) => {
    if (explanations[anomalyId]) return; // Already fetched

    setExplanations(prev => ({ ...prev, [anomalyId]: { text: '', loading: true } }));
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      const response = await axios.get(`${apiUrl}/api/explanations/${anomalyId}`);
      setExplanations(prev => ({ 
        ...prev, 
        [anomalyId]: { text: response.data.explanation, loading: false } 
      }));
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setExplanations(prev => ({ 
        ...prev, 
        [anomalyId]: { text: 'Failed to generate explanation.', loading: false } 
      }));
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchExplanation(id);
    }
  };

  if (anomalies.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 italic">
        System is stable. No anomalies detected.
      </div>
    );
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="divide-y divide-slate-800">
      {anomalies.map((anomaly) => (
        <div key={anomaly.id} className="group">
          <div 
            onClick={() => toggleExpand(anomaly.id)}
            className="p-4 hover:bg-slate-800/50 transition-all cursor-pointer flex items-start justify-between gap-4"
          >
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityStyles(anomaly.severity)}`}>
                  {anomaly.severity}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  {anomaly.type.replace('_', ' ')}
                </span>
                {expandedId === anomaly.id ? <ChevronUp className="w-3 h-3 text-slate-600" /> : <ChevronDown className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
              <p className="text-sm text-slate-200">{anomaly.description}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(anomaly.detected_at), { addSuffix: true })}
            </div>
          </div>

          {/* AI Explanation Section */}
          {expandedId === anomaly.id && (
            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-slate-950/80 rounded-lg border border-slate-800 p-4 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AI Root Cause Analysis</span>
                </div>
                
                {explanations[anomaly.id]?.loading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Connecting to Gemini...
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap italic border-l-2 border-blue-500/30 pl-3">
                    {explanations[anomaly.id]?.text}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnomalyList;
