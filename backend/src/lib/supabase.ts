import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

if (!config.supabaseUrl || !config.supabaseKey) {
  throw new Error('Supabase credentials missing');
}

export const supabase = createClient(config.supabaseUrl, config.supabaseKey);
