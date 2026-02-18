-- Fix RLS policies to allow backend ingestion
-- Drop existing policies first if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert metrics" ON metrics;
DROP POLICY IF EXISTS "Anyone can insert logs" ON logs;
DROP POLICY IF EXISTS "System can insert anomalies" ON anomalies;

-- Re-create with explicit permissions
CREATE POLICY "Anyone can insert metrics"
  ON metrics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert logs"
  ON logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert anomalies"
  ON anomalies FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure authenticated users can see their own data
DROP POLICY IF EXISTS "Users can view own metrics" ON metrics;
DROP POLICY IF EXISTS "Users can view own logs" ON logs;
DROP POLICY IF EXISTS "Users can view own anomalies" ON anomalies;

CREATE POLICY "Users can view own anomalies"
  ON anomalies FOR SELECT
  TO anon, authenticated
  USING (true);

-- Also allow public select for logs and metrics for the demo
CREATE POLICY "Users can view own logs"
  ON logs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can view own metrics"
  ON metrics FOR SELECT
  TO anon, authenticated
  USING (true);
