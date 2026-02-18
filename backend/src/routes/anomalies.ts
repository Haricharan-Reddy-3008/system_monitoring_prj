import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

/**
 * @route   GET /api/anomalies/:projectId
 * @desc    Get detected anomalies for a project
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from('anomalies')
      .select('*')
      .eq('project_id', projectId)
      .order('detected_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return res.json(data || []);

  } catch (error: any) {
    console.error('Anomalies Route Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
