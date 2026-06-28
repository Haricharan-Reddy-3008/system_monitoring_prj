import { IncomingWebhook } from '@slack/webhook';
import { supabase } from '../lib/supabase';
import { config } from '../config';

const webhook = config.slackWebhookUrl ? new IncomingWebhook(config.slackWebhookUrl) : null;
const METRIC_FIELDS: MetricField[] = ['cpu', 'memory', 'requests', 'errors'];

// Sensible industry defaults — used when a project has no custom thresholds
export type ProjectThresholds = {
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
};

type MetricField = keyof ProjectThresholds;

export const DEFAULT_THRESHOLDS: ProjectThresholds = {
  cpu: 80,       // 80% CPU usage = danger zone for most servers
  memory: 90,    // 90% RAM usage
  requests: 400, // 400 req/interval = traffic spike
  errors: 3      // 3 errors/interval = application problems
};

export const anomalyService = {
  /**
   * Fetches per-project thresholds from the DB.
   * Each project can define its own cpu/memory/requests/errors limits.
   * Falls back to global defaults if none are configured.
   */
  async getThresholds(projectId: string): Promise<ProjectThresholds> {
    const { data, error } = await supabase
      .from('projects')
      .select('thresholds')
      .eq('id', projectId)
      .single();

    if (error || !data?.thresholds) {
      return DEFAULT_THRESHOLDS;
    }

    // Merge with defaults so partial configs still work
    return {
      ...DEFAULT_THRESHOLDS,
      ...data.thresholds
    };
  },

  /**
   * Learns recommended thresholds from recent project behavior.
   * The result is intentionally conservative: it uses a high percentile and
   * standard deviation so normal traffic does not create noisy alerts.
   */
  async getRecommendedThresholds(projectId: string) {
    const current = await this.getThresholds(projectId);
    const { data, error } = await supabase
      .from('metrics')
      .select('cpu, memory, requests, errors, timestamp')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    const metrics = (data || [])
      .filter((metric) => METRIC_FIELDS.every((field) => Number.isFinite(Number(metric[field]))))
      .reverse();

    if (metrics.length < 10) {
      return {
        current,
        recommended: current,
        sampleCount: metrics.length,
        confidence: 'low',
        message: 'Collect at least 10 metric samples before applying learned thresholds.'
      };
    }

    const recommended: ProjectThresholds = {
      cpu: this.recommendPercentThreshold(metrics, 'cpu', 30, 95),
      memory: this.recommendPercentThreshold(metrics, 'memory', 45, 95),
      requests: this.recommendCountThreshold(metrics, 'requests', 5),
      errors: this.recommendErrorThreshold(metrics)
    };

    return {
      current,
      recommended,
      sampleCount: metrics.length,
      confidence: metrics.length >= 100 ? 'high' : metrics.length >= 40 ? 'medium' : 'low',
      message: 'Recommended thresholds are based on recent project behavior, using trend-resistant statistical limits.'
    };
  },

  /**
   * Checks for anomalies in recently ingested metrics using per-project thresholds
   */
  async checkMetrics(projectId: string, metric: any) {
    // Dynamically load this project's custom threshold config
    const threshold = await this.getThresholds(projectId);

    let anomalyFound = false;
    let description = '';
    let type = '';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check application health first (most critical for users)
    if (metric.errors > threshold.errors) {
      anomalyFound = true;
      type = 'HIGH_ERROR_RATE';
      severity = 'critical';
      description = `Critical application error rate detected: ${metric.errors} errors (Project threshold: ${threshold.errors})`;
    } else if (metric.requests > threshold.requests) {
      anomalyFound = true;
      type = 'TRAFFIC_SPIKE';
      severity = 'high';
      description = `Unusual traffic spike detected: ${metric.requests} requests/sec (Project threshold: ${threshold.requests})`;
    } else if (metric.cpu > threshold.cpu) {
      anomalyFound = true;
      type = 'CPU_SPIKE';
      severity = metric.cpu > 95 ? 'critical' : 'high';
      description = `Critical CPU spike detected: ${metric.cpu.toFixed(1)}% (Project threshold: ${threshold.cpu}%)`;
    } else if (metric.memory > threshold.memory) {
      anomalyFound = true;
      type = 'MEMORY_SPIKE';
      severity = metric.memory > 95 ? 'critical' : 'high';
      description = `High memory usage detected: ${metric.memory.toFixed(1)}% (Project threshold: ${threshold.memory}%)`;
    }

    if (anomalyFound) {
      console.log(`🚨 ANOMALY DETECTED: ${description}`);
      
      // 1. Save to database
      const { data, error } = await supabase
        .from('anomalies')
        .insert([{
          project_id: projectId,
          type,
          severity,
          description,
          metric_snapshot: metric
        }])
        .select();

      if (error) console.error('Error saving anomaly:', error);

      // 2. Send Slack Notification
      if (webhook) {
        try {
          await webhook.send({
            text: `🚨 *Anomaly Detected in System Monitor*`,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Type:* ${type}\n*Severity:* ${severity.toUpperCase()}\n*Description:* ${description}`
                }
              },
              {
                type: "context",
                elements: [{ type: "mrkdwn", text: `Project ID: ${projectId}` }]
              }
            ]
          });
          console.log('✅ Slack notification sent');
        } catch (err) {
          console.error('Error sending Slack notification:', err);
        }
      }
    }
  },

  recommendPercentThreshold(metrics: any[], field: MetricField, min: number, max: number) {
    const values = this.values(metrics, field);
    const avg = this.average(values);
    const std = this.standardDeviation(values);
    const p95 = this.percentile(values, 95);
    const learned = Math.max(avg + std * 3, p95 * 1.1);

    return Math.round(this.clamp(learned, min, max));
  },

  recommendCountThreshold(metrics: any[], field: MetricField, min: number) {
    const values = this.values(metrics, field);
    const avg = this.average(values);
    const std = this.standardDeviation(values);
    const p95 = this.percentile(values, 95);
    const learned = Math.max(avg + std * 3, p95 * 1.25, min);

    return Math.ceil(this.clamp(learned, min, 100000));
  },

  recommendErrorThreshold(metrics: any[]) {
    const values = this.values(metrics, 'errors');
    const avg = this.average(values);
    const std = this.standardDeviation(values);
    const p95 = this.percentile(values, 95);
    const learned = Math.max(avg + std * 3, p95 * 1.5, 1);

    return Math.ceil(this.clamp(learned, 1, 100000));
  },

  values(metrics: any[], field: MetricField) {
    return metrics
      .map((metric) => Number(metric[field]))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
  },

  average(values: number[]) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  },

  standardDeviation(values: number[]) {
    if (values.length < 2) return 0;
    const mean = this.average(values);
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  },

  percentile(values: number[], percentile: number) {
    if (!values.length) return 0;
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.min(values.length - 1, Math.max(0, index))];
  },

  clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }
};

