import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: process.env.PORT || 8000,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
};

// Validate required configuration
if (!config.supabaseUrl || !config.supabaseKey) {
  console.error('CRITICAL ERROR: SUPABASE_URL and SUPABASE_KEY are required in .env');
}
