import { IncomingWebhook } from '@slack/webhook';
import { supabase } from '../lib/supabase';
import { config } from '../config';

const webhook = config.slackWebhookUrl ? new IncomingWebhook(config.slackWebhookUrl) : null;

export const anomalyService = {
  /**
   * Checks for anomalies in recently ingested metrics
   */
  async checkMetrics(projectId: string, metric: any) {
    const threshold = {
      cpu: 80,
      memory: 90
    };

    let anomalyFound = false;
    let description = '';
    let type = '';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (metric.cpu > threshold.cpu) {
      anomalyFound = true;
      type = 'CPU_SPIKE';
      severity = metric.cpu > 95 ? 'critical' : 'high';
      description = `Critical CPU spike detected: ${metric.cpu.toFixed(1)}% (Threshold: ${threshold.cpu}%)`;
    } else if (metric.memory > threshold.memory) {
      anomalyFound = true;
      type = 'MEMORY_SPIKE';
      severity = metric.memory > 95 ? 'critical' : 'high';
      description = `High memory usage detected: ${metric.memory.toFixed(1)}% (Threshold: ${threshold.memory}%)`;
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
  }
};
