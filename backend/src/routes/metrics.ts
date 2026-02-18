import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { anomalyService } from '../services/anomaly';

const router = Router();

/**
 * @route   POST /api/metrics
 * @desc    Ingest system metrics
 * @access  Public (for script ingestion)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { project_id, cpu, memory, requests, errors, timestamp } = req.body;

    // 1. Validate Project (Basic check)
    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    // Trigger anomaly check asynchronously (don't block the ingestion response)
    anomalyService.checkMetrics(project_id, { cpu, memory, requests, errors });

    // 2. Insert into Supabase
    const { data, error } = await supabase
      .from('metrics')
      .insert([
        { 
          project_id, 
          cpu, 
          memory, 
          requests: requests || 0, 
          errors: errors || 0,
          timestamp: timestamp || new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase Ingestion Error:', error);
      return res.status(500).json({ 
        error: 'Failed to store metrics', 
        details: error.message,
        hint: error.hint
      });
    }

    // 3. Return success
    return res.status(201).json({
      message: 'Metrics ingested successfully',
      data: data[0]
    });

  } catch (error: any) {
    console.error('Metrics Route Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/metrics/:projectId
 * @desc    Get metrics for a specific project (recent 50)
 * @access  Private (should be protected by auth middleware later)
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error('Supabase Fetch Error:', error);
      return res.status(500).json({ error: 'Failed to fetch metrics' });
    }

    return res.json(data);

  } catch (error) {
    console.error('Metrics Fetch Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
