import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Cpu,
  Database,
  Layout,
  RefreshCw,
  Sparkles,
  Terminal,
} from "lucide-react";
import LiveCharts from "../components/dashboard/LiveCharts";
import PredictionPanel from "../components/dashboard/PredictionPanel";
import AnomalyList from "../components/dashboard/AnomalyList";
import LogPanel from "../components/dashboard/LogPanel";
import { Metric, ThresholdRecommendation, Thresholds } from "../types";
import axios from "axios";

const DEFAULT_THRESHOLDS: Thresholds = {
  cpu: 80,
  memory: 90,
  requests: 400,
  errors: 3,
};

const Dashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [thresholdRecommendation, setThresholdRecommendation] =
    useState<ThresholdRecommendation | null>(null);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [learningThresholds, setLearningThresholds] = useState(false);
  const [thresholdMessage, setThresholdMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetchProject();
    fetchMetrics();
    fetchPrediction();
    fetchAnomalies();
    fetchLogs();
    fetchThresholdRecommendation();

    // Set up polling
    const metricsInterval = setInterval(fetchMetrics, 5000);
    const predictionInterval = setInterval(fetchPrediction, 30000); // AI update every 30s
    const anomaliesInterval = setInterval(fetchAnomalies, 10000); // Anomalies update every 10s
    const logsInterval = setInterval(fetchLogs, 5000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(predictionInterval);
      clearInterval(anomaliesInterval);
      clearInterval(logsInterval);
    };
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/projects/${projectId}`);
      setProject(response.data);
      setThresholds({
        ...DEFAULT_THRESHOLDS,
        ...(response.data.thresholds || {}),
      });
    } catch (err: any) {
      console.error(
        "Error fetching project:",
        err.response?.data || err.message || err,
      );
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/metrics/${projectId}`);
      setMetrics(response.data.metrics || []);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching metrics:", err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      setPredLoading(true);
      const response = await axios.get(
        `${apiUrl}/api/predictions/${projectId}`,
      );
      setPrediction(response.data);
      setPredLoading(false);
    } catch (err: any) {
      console.error("Error fetching prediction:", err.message);
      setPredLoading(false);
    }
  };

  const fetchAnomalies = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/anomalies/${projectId}`);
      setAnomalies(response.data.anomalies || []);
    } catch (err: any) {
      console.error("Error fetching anomalies:", err.message);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/logs/${projectId}`);
      setLogs(response.data.logs || []);
    } catch (err: any) {
      console.error("Error fetching logs:", err.message);
    }
  };

  const fetchThresholdRecommendation = async () => {
    try {
      setLearningThresholds(true);
      const response = await axios.get(
        `${apiUrl}/api/projects/${projectId}/thresholds/recommendation`,
      );
      setThresholdRecommendation(response.data);
    } catch (err: any) {
      console.error("Error learning thresholds:", err.message);
    } finally {
      setLearningThresholds(false);
    }
  };

  const updateThreshold = (key: keyof Thresholds, value: string) => {
    setThresholds((current) => ({
      ...current,
      [key]: Number(value),
    }));
  };

  const saveThresholds = async () => {
    try {
      setSavingThresholds(true);
      setThresholdMessage("");
      const response = await axios.patch(
        `${apiUrl}/api/projects/${projectId}/thresholds`,
        { thresholds },
      );
      setProject(response.data);
      setThresholds({
        ...DEFAULT_THRESHOLDS,
        ...(response.data.thresholds || {}),
      });
      setThresholdMessage("Thresholds saved for this project.");
      fetchPrediction();
      fetchThresholdRecommendation();
    } catch (err: any) {
      setThresholdMessage(
        err.response?.data?.error || err.message || "Failed to save thresholds",
      );
    } finally {
      setSavingThresholds(false);
    }
  };

  const applyRecommendedThresholds = () => {
    if (!thresholdRecommendation) return;
    setThresholds(thresholdRecommendation.recommended);
    setThresholdMessage(
      "Recommended thresholds applied. Save them to make them active.",
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/projects"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Layout className="w-5 h-5" />
              </Link>
              <div className="h-4 w-px bg-slate-700"></div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {project?.name || "Loading project..."}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                LIVE UPDATING
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 text-blue-500/20">
              <Cpu className="w-12 h-12" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">
              CPU Usage
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {metrics[0]?.cpu?.toFixed(1) || "0"}%
              </span>
              <span
                className={`text-xs ${metrics[0]?.cpu > (metrics[1]?.cpu || 0) ? "text-rose-400" : "text-emerald-400"}`}
              >
                {metrics[0]?.cpu > (metrics[1]?.cpu || 0) ? "↑" : "↓"}
              </span>
            </div>
          </div>

          <div className="glass-panel p-5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 text-purple-500/20">
              <Database className="w-12 h-12" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">
              Memory
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {metrics[0]?.memory?.toFixed(1) || "0"}%
              </span>
            </div>
          </div>

          <div className="glass-panel p-5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 text-emerald-500/20">
              <Activity className="w-12 h-12" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">
              Requests / min
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {metrics[0]?.requests || "0"}
              </span>
            </div>
          </div>

          <div className="glass-panel p-5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 text-rose-500/20">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">
              Errors (5m)
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {metrics
                  .slice(0, 5)
                  .reduce((acc, curr: any) => acc + curr.errors, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <LiveCharts data={metrics} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass-panel flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                AI Predictions
              </h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-tighter shadow-sm border border-blue-500/20">
                GEMINI
              </span>
            </div>
            <div className="p-6 flex-grow">
              <PredictionPanel prediction={prediction} loading={predLoading} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel">
              <div className="flex flex-wrap items-start justify-between gap-4 p-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white">
                    Project Thresholds
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Set limits for this server so risk and anomaly detection match its real workload.
                  </p>
                </div>
                <button
                  onClick={fetchThresholdRecommendation}
                  disabled={learningThresholds}
                  className="btn-secondary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  {learningThresholds ? "Learning..." : "Learn from Metrics"}
                </button>
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    CPU %
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={thresholds.cpu}
                    onChange={(event) => updateThreshold("cpu", event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-white outline-none focus:border-blue-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Memory %
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={thresholds.memory}
                    onChange={(event) => updateThreshold("memory", event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-white outline-none focus:border-blue-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Requests
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={thresholds.requests}
                    onChange={(event) => updateThreshold("requests", event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-white outline-none focus:border-blue-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Errors
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={thresholds.errors}
                    onChange={(event) => updateThreshold("errors", event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-white outline-none focus:border-blue-400"
                  />
                </label>
              </div>
              {thresholdRecommendation && (
                <div className="border-t border-slate-800 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Recommended from recent behavior
                      </h4>
                      <p className="text-sm text-slate-400">
                        {thresholdRecommendation.sampleCount} samples analyzed · {thresholdRecommendation.confidence} confidence
                      </p>
                    </div>
                    <button
                      onClick={applyRecommendedThresholds}
                      disabled={thresholdRecommendation.sampleCount < 10}
                      className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Apply Recommended
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                        CPU
                      </p>
                      <p className="text-xl font-bold text-white">
                        {thresholdRecommendation.recommended.cpu}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                        Memory
                      </p>
                      <p className="text-xl font-bold text-white">
                        {thresholdRecommendation.recommended.memory}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                        Requests
                      </p>
                      <p className="text-xl font-bold text-white">
                        {thresholdRecommendation.recommended.requests}
                      </p>
                    </div>
                    <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                        Errors
                      </p>
                      <p className="text-xl font-bold text-white">
                        {thresholdRecommendation.recommended.errors}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    {thresholdRecommendation.message}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 p-4">
                <button
                  onClick={saveThresholds}
                  disabled={savingThresholds}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingThresholds ? "Saving..." : "Save Thresholds"}
                </button>
                {thresholdMessage && (
                  <p className="text-sm text-slate-400">{thresholdMessage}</p>
                )}
              </div>
            </div>

            <div className="glass-panel">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Recent System Logs
                </h3>
                <Link to="#" className="text-xs text-blue-400 hover:underline">
                  View All
                </Link>
              </div>
              <div className="flex-grow">
                <LogPanel logs={logs} />
              </div>
            </div>

            <div className="glass-panel overflow-hidden">
              <div className="p-4 bg-rose-500/5 border-b border-rose-500/10">
                <h3 className="font-bold text-rose-400 flex items-center gap-2 text-sm uppercase tracking-widest">
                  <AlertTriangle className="w-4 h-4" />
                  Detected Anomalies
                </h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <AnomalyList anomalies={anomalies} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
