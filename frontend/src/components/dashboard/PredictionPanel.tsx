import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface PredictionData {
  predicted_cpu: number;
  predicted_memory: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  reasoning: string;
}

interface PredictionPanelProps {
  prediction: PredictionData | null;
  loading: boolean;
}

const PredictionPanel: React.FC<PredictionPanelProps> = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
        <div className="h-20 bg-slate-800 rounded"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="text-center py-8 text-slate-500 italic">
        Insufficient data for AI prediction.
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'HIGH': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'CRITICAL': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Level Badge */}
      <div className={`p-4 rounded-lg border text-center ${getRiskColor(prediction.risk_level)}`}>
        <p className="text-xs uppercase tracking-widest font-bold mb-1">Forecast Risk</p>
        <h4 className="text-2xl font-black">{prediction.risk_level}</h4>
      </div>

      {/* Prediction stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Predicted CPU</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{(prediction?.predicted_cpu ?? 0).toFixed(1)}%</span>
            {(prediction?.predicted_cpu ?? 0) > 70 ? <TrendingUp className="w-3 h-3 text-rose-400" /> : <TrendingDown className="w-3 h-3 text-emerald-400" />}
          </div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Confidence</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{(prediction?.confidence ?? 0)}%</span>
            <CheckCircle className="w-3 h-3 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
        <h5 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          AI Analysis
        </h5>
        <p className="text-sm text-slate-300 leading-relaxed italic">
          "{prediction.reasoning}"
        </p>
      </div>
    </div>
  );
};

export default PredictionPanel;
