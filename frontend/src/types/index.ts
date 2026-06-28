export interface User {
  id: string
  email: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
  thresholds?: Thresholds
}

export interface Thresholds {
  cpu: number
  memory: number
  requests: number
  errors: number
}

export interface ThresholdRecommendation {
  current: Thresholds
  recommended: Thresholds
  sampleCount: number
  confidence: 'low' | 'medium' | 'high'
  message: string
}

export interface Metric {
  id: number
  project_id: string
  timestamp: string
  cpu: number
  memory: number
  requests: number
  errors: number
}

export interface Log {
  id: number
  project_id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
  source?: string
}

export interface Anomaly {
  id: string
  project_id: string
  detected_at: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  metric_snapshot?: any
  resolved: boolean
  resolved_at?: string
}

export interface LogPattern {
  id: string
  project_id: string
  pattern_signature: string
  example_message: string
  occurrence_count: number
  first_seen: string
  last_seen: string
  level: string
}
