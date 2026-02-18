import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { aiService } from '../services/ai';

const router = Router();

/**
 * @route   GET /api/predictions/:projectId
 * @desc    Get AI-generated forecasts for a project
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    // 1. Fetch recent metrics for context
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('cpu, memory, requests, errors, timestamp')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error || !metrics || metrics.length === 0) {
      return res.status(404).json({ error: 'No metrics data found to analyze' });
    }

    // 2. Call Gemini AI Service
    const prediction = await aiService.getPredictions(metrics);

    return res.json(prediction);

  } catch (error: any) {
    console.error('Predictions Route Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

export default router;
