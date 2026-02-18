-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics table
CREATE TABLE metrics (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  cpu FLOAT CHECK (cpu >= 0 AND cpu <= 100),
  memory FLOAT CHECK (memory >= 0 AND memory <= 100),
  requests INTEGER CHECK (requests >= 0),
  errors INTEGER CHECK (errors >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table
CREATE TABLE logs (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
  message TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anomalies table
CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metric_snapshot JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Log patterns table
CREATE TABLE log_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  pattern_signature TEXT NOT NULL,
  example_message TEXT NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level TEXT NOT NULL
);

-- Alert deliveries table
CREATE TABLE alert_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anomaly_id UUID REFERENCES anomalies(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('slack', 'email', 'in-app')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_metrics_project_time ON metrics(project_id, timestamp DESC);
CREATE INDEX idx_logs_project_time ON logs(project_id, timestamp DESC);
CREATE INDEX idx_logs_level ON logs(project_id, level);
CREATE INDEX idx_anomalies_project ON anomalies(project_id, detected_at DESC);
CREATE INDEX idx_patterns_project ON log_patterns(project_id, occurrence_count DESC);
CREATE INDEX idx_deliveries_anomaly ON alert_deliveries(anomaly_id);

-- Row-level security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for metrics
CREATE POLICY "Users can view own metrics"
  ON metrics FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert metrics"
  ON metrics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for logs
CREATE POLICY "Users can view own logs"
  ON logs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert logs"
  ON logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for anomalies
CREATE POLICY "Users can view own anomalies"
  ON anomalies FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert anomalies"
  ON anomalies FOR INSERT
  WITH CHECK (true);

-- RLS Policies for log patterns
CREATE POLICY "Users can view own patterns"
  ON log_patterns FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage patterns"
  ON log_patterns FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for alert deliveries
CREATE POLICY "Users can view own alert deliveries"
  ON alert_deliveries FOR SELECT
  USING (
    anomaly_id IN (
      SELECT id FROM anomalies WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can manage deliveries"
  ON alert_deliveries FOR ALL
  USING (true)
  WITH CHECK (true);
