-- Fix RLS Policies for Server-Side Operations
-- These policies allow the backend (with service role key) to create projects
-- while still maintaining security for user access

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can create own projects" ON projects;

-- Create new policy that allows service role to create projects
CREATE POLICY "Service can create projects"
  ON projects FOR INSERT
  WITH CHECK (true);

-- Keep the update and delete policies secure
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Metrics policies - allow backend to insert
DROP POLICY IF EXISTS "Anyone can insert metrics" ON metrics;
CREATE POLICY "Anyone can insert metrics"
  ON metrics FOR INSERT
  WITH CHECK (true);

-- Anomalies policies - allow backend to insert
DROP POLICY IF EXISTS "System can insert anomalies" ON anomalies;
CREATE POLICY "System can insert anomalies"
  ON anomalies FOR INSERT
  WITH CHECK (true);

-- Update policies
DROP POLICY IF EXISTS "Users can update own anomalies" ON anomalies;
CREATE POLICY "Users can update own anomalies"
  ON anomalies FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Delete policies
DROP POLICY IF EXISTS "Users can delete own anomalies" ON anomalies;
CREATE POLICY "Users can delete own anomalies"
  ON anomalies FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
