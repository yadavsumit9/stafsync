// Vercel Serverless Function — Health Check
// Path: /api/health

import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('http')) {
    return res.status(200).json({
      status: 'warning',
      database: 'unconfigured',
      provider: 'supabase',
      message: 'Production database environment variables are not configured on Vercel.',
      hint: 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel Project Settings.',
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const start = Date.now();
    const { data, error } = await supabase.from('system_settings').select('key').limit(1);
    const latencyMs = Date.now() - start;

    if (error && !error.message.includes('relation "system_settings" does not exist')) {
      return res.status(500).json({
        status: 'error',
        database: 'disconnected',
        provider: 'supabase',
        latencyMs,
        message: 'Failed to communicate with Supabase database.',
      });
    }

    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      provider: 'supabase',
      latencyMs,
      environment: process.env.NODE_ENV || 'production',
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      provider: 'supabase',
      message: err?.message || 'Internal health check error',
    });
  }
}
