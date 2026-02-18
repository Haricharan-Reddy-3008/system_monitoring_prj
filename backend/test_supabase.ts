import { supabase } from './src/lib/supabase';

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data: projects, error: pError } = await supabase.from('projects').select('id, name').limit(1);
    if (pError) throw pError;
    console.log('✅ Connection to projects table successful:', projects);

    const { data: metrics, error: mError } = await supabase.from('metrics').select('id').limit(1);
    if (mError) {
      console.warn('⚠️ Warning: Could not access metrics table. It might not exist.');
      console.error(mError);
    } else {
      console.log('✅ Connection to metrics table successful.');
    }
  } catch (error) {
    console.error('❌ Supabase Connection Failed:', error.message);
  }
}

testConnection();
