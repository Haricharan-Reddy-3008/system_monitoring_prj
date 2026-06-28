import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Code2,
  KeyRound,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

const setupCode = `const express = require("express");
const monitor = require("system-monitoring-sdk");

const app = express();

app.use(express.json());

// Capture request volume, response status, latency, and error counts.
app.use(monitor.expressMiddleware);

app.get("/api/orders", async (req, res) => {
  res.json({
    status: "ok",
    service: "orders-api",
    checkedAt: new Date().toISOString(),
  });
});

// Start the background reporter after middleware is registered.
monitor.start({
  projectId: "YOUR_PROJECT_ID_FROM_DASHBOARD",
  apiUrl: "https://your-monitoring-backend.com/api/metrics",
  serviceName: "orders-api-production",
  environment: "production",
});

app.listen(3000, () => {
  console.log("Orders API running on port 3000");
});`;

const steps = [
  {
    icon: KeyRound,
    title: "Create or open a project",
    text: "Each monitored server needs a project ID so metrics are stored under the correct dashboard.",
  },
  {
    icon: Code2,
    title: "Install and import the SDK",
    text: "Add the SDK to the Express server and import it in the main entry file, such as server.js or app.js.",
  },
  {
    icon: ClipboardList,
    title: "Attach the middleware",
    text: "Place the middleware before your routes so real HTTP traffic, status codes, and errors are measured.",
  },
  {
    icon: PlayCircle,
    title: "Start reporting",
    text: "Initialize the agent with the project ID and backend metrics endpoint, then run the server normally.",
  },
];

export default function HowToUse() {
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
          <Link to="/about" className="btn-secondary">
            About this app
          </Link>
        </div>

        <section className="py-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-200">
            <ShieldCheck size={18} />
            🛡️ How to use the SDK
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Connect an Express server in a few lines.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            After the SDK is installed, your friend or teammate does not need to
            write custom monitoring logic. They import the package, attach the
            Express middleware, and initialize the reporting agent with the
            project ID from this platform.
          </p>
        </section>

        <section className="grid gap-5 py-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }) => (
            <article key={title} className="glass-panel p-5">
              <Icon className="mb-4 h-7 w-7 text-cyan-300" />
              <h2 className="mb-2 text-base font-bold text-white">{title}</h2>
              <p className="text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 py-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">
              Recommended setup flow
            </h2>
            <div className="space-y-4 text-slate-300">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                <p>
                  Create a project in the monitoring platform and copy its
                  project ID.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                <p>
                  Install the SDK in the Express backend that should be
                  monitored.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                <p>
                  Add the middleware before application routes so request and
                  error data is captured automatically.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                <p>
                  Start the reporting loop with the live API URL for your
                  deployed monitoring backend.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Express server example
              </p>
            </div>
            <pre className="overflow-x-auto p-5 text-sm leading-6 text-slate-200">
              <code>{setupCode}</code>
            </pre>
          </div>
        </section>

        <section className="glass-panel mb-8 p-6">
          <h2 className="mb-3 text-xl font-bold text-white">
            What happens after setup?
          </h2>
          <p className="max-w-4xl leading-7 text-slate-300">
            The server continues running normally. In the background, the SDK
            sends operational metrics to this application, where the dashboard
            displays live usage, request activity, errors, logs, predictions,
            and anomalies for the selected project.
          </p>
        </section>
      </main>
    </div>
  );
}
