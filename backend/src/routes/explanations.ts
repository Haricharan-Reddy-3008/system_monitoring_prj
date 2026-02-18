import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { aiService } from '../services/ai';

const router = Router();

/**
 * @route   GET /api/explanations/:anomalyId
 * @desc    Get AI explanation for a specific anomaly
 */
router.get('/:anomalyId', async (req: Request, res: Response) => {
  try {
    const { anomalyId } = req.params;

    // 1. Fetch the anomaly
    const { data: anomaly, error: anomalyError } = await supabase
      .from('anomalies')
      .select('*')
      .eq('id', anomalyId)
      .single();

    if (anomalyError || !anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    // 2. Fetch logs around that time
    const timeBuffer = new Date(new Date(anomaly.detected_at).getTime() - 60000).toISOString(); // 1 min before
    const { data: logs } = await supabase
      .from('logs')
      .select('*')
      .eq('project_id', anomaly.project_id)
      .gte('timestamp', timeBuffer)
      .lte('timestamp', anomaly.detected_at)
      .order('timestamp', { ascending: false })
      .limit(10);

    // 3. Fetch recent metrics
    const { data: metrics } = await supabase
      .from('metrics')
      .select('*')
      .eq('project_id', anomaly.project_id)
      .lte('timestamp', anomaly.detected_at)
      .order('timestamp', { ascending: false })
      .limit(5);

    // 4. Get AI Explanation
    const explanation = await aiService.getRootCauseAnalysis(anomaly, logs || [], metrics || []);
    
    return res.json(explanation);

  } catch (error: any) {
    console.error('Explanation Route Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
