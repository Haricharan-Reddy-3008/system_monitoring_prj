import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Bell,
  Brain,
  Gauge,
  LineChart,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

const outcomes = [
  {
    icon: Gauge,
    title: "Live service health",
    text: "Track CPU usage, memory pressure, request volume, and errors from one focused dashboard.",
  },
  {
    icon: Brain,
    title: "AI-assisted insight",
    text: "Use predictions and anomaly detection to understand risk before small signals become incidents.",
  },
  {
    icon: Bell,
    title: "Operational awareness",
    text: "Review logs, unusual behavior, and alert-ready signals without manually building monitoring code.",
  },
];

const useCases = [
  "Monitoring APIs, dashboards, internal tools, and backend services",
  "Giving clients or teammates a simple way to observe production behavior",
  "Finding spikes in traffic, memory, CPU, or error counts during deployments",
  "Keeping project-level metrics separate for multiple applications",
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to projects
          </Link>
          <Link to="/how-to-use" className="btn-primary">
            How to use the SDK
          </Link>
        </div>

        <section className="grid gap-10 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
              <ShieldCheck size={18} />
              System monitoring for connected servers
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              Understand how your servers behave before users feel the problem.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              This application helps teams monitor backend services through a
              lightweight SDK. Once the SDK is installed in an Express server,
              it reports real request activity, error counts, system usage, and
              logs into a project dashboard.
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                <Activity size={26} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-500">
                  What it provides
                </p>
                <h2 className="text-xl font-bold text-white">
                  A project-level observability hub
                </h2>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <span className="font-semibold text-white">Metrics:</span> CPU,
                memory, requests, and errors
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <span className="font-semibold text-white">Intelligence:</span>{" "}
                predictions, anomaly detection, and trend awareness
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <span className="font-semibold text-white">Context:</span> logs,
                project history, and live dashboard updates
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 py-8 md:grid-cols-3">
          {outcomes.map(({ icon: Icon, title, text }) => (
            <article key={title} className="glass-panel p-5">
              <Icon className="mb-4 h-8 w-8 text-blue-300" />
              <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
              <p className="text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 py-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <ServerCog className="h-7 w-7 text-cyan-300" />
              <h2 className="text-2xl font-bold text-white">
                Why teams use it
              </h2>
            </div>
            <p className="text-slate-300 leading-7">
              Instead of asking every project owner to build custom monitoring
              endpoints, the SDK captures the operational signals and sends them
              to this platform. Developers get a clean dashboard, and server
              owners get faster clarity when something changes.
            </p>
          </div>

          <div className="glass-panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <LineChart className="h-6 w-6 text-emerald-300" />
              <h2 className="text-xl font-bold text-white">Common use cases</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              {useCases.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
