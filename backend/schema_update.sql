-- Safe schema update - only creates missing tables
-- This won't error if tables already exist

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Metrics table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS metrics (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  cpu FLOAT CHECK (cpu >= 0 AND cpu <= 100),
  memory FLOAT CHECK (memory >= 0 AND memory <= 100),
  requests INTEGER CHECK (requests >= 0),
  errors INTEGER CHECK (errors >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
  message TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anomalies table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS anomalies (
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

-- Log patterns table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS log_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  pattern_signature TEXT NOT NULL,
  example_message TEXT NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level TEXT NOT NULL
);

-- Alert deliveries table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS alert_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anomaly_id UUID REFERENCES anomalies(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('slack', 'email', 'in-app')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_metrics_project_time ON metrics(project_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_project_time ON logs(project_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(project_id, level);
CREATE INDEX IF NOT EXISTS idx_anomalies_project ON anomalies(project_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_project ON log_patterns(project_id, occurrence_count DESC);
CREATE INDEX IF NOT EXISTS idx_deliveries_anomaly ON alert_deliveries(anomaly_id);

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_deliveries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
-- This ensures we have the correct policies

-- Metrics policies
DROP POLICY IF EXISTS "Users can view own metrics" ON metrics;
CREATE POLICY "Users can view own metrics"
  ON metrics FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can insert metrics" ON metrics;
CREATE POLICY "Anyone can insert metrics"
  ON metrics FOR INSERT
  WITH CHECK (true);

-- Logs policies
DROP POLICY IF EXISTS "Users can view own logs" ON logs;
CREATE POLICY "Users can view own logs"
  ON logs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can insert logs" ON logs;
CREATE POLICY "Anyone can insert logs"
  ON logs FOR INSERT
  WITH CHECK (true);

-- Anomalies policies
DROP POLICY IF EXISTS "Users can view own anomalies" ON anomalies;
CREATE POLICY "Users can view own anomalies"
  ON anomalies FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert anomalies" ON anomalies;
CREATE POLICY "System can insert anomalies"
  ON anomalies FOR INSERT
  WITH CHECK (true);

-- Log patterns policies
DROP POLICY IF EXISTS "Users can view own patterns" ON log_patterns;
CREATE POLICY "Users can view own patterns"
  ON log_patterns FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can manage patterns" ON log_patterns;
CREATE POLICY "System can manage patterns"
  ON log_patterns FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alert deliveries policies
DROP POLICY IF EXISTS "Users can view own alert deliveries" ON alert_deliveries;
CREATE POLICY "Users can view own alert deliveries"
  ON alert_deliveries FOR SELECT
  USING (
    anomaly_id IN (
      SELECT id FROM anomalies WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "System can manage deliveries" ON alert_deliveries;
CREATE POLICY "System can manage deliveries"
  ON alert_deliveries FOR ALL
  USING (true)
  WITH CHECK (true);
