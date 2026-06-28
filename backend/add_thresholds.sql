-- Add per-project threshold configuration to the projects table
-- Run this in your Supabase SQL Editor

-- Add thresholds column (JSONB so each project can store custom values)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS thresholds JSONB DEFAULT '{
    "cpu": 80,
    "memory": 90,
    "requests": 400,
    "errors": 3
  }'::jsonb;

-- Also allow projects to update their own thresholds
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);
