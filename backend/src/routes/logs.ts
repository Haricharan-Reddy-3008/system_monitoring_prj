import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

/**
 * @route   POST /api/logs
 * @desc    Ingest system logs
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { project_id, level, message, timestamp } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    const { error } = await supabase
      .from('logs')
      .insert([{
        project_id,
        level,
        message,
        timestamp: timestamp || new Date().toISOString()
      }]);

    if (error) throw error;
    return res.status(201).json({ status: 'Log ingested' });

  } catch (error: any) {
    console.error('Log Ingestion Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * @route   GET /api/logs/:projectId
 * @desc    Get recent logs for a project
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    return res.json({ logs: data || [] });

  } catch (error: any) {
    console.error('Get Logs Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
