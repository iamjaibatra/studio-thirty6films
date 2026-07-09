import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const config = window.__SUPABASE_CONFIG__;

if (!config || !config.url || !config.anonKey) {
  console.error(
    '[T36] Missing Supabase config. Copy js/config.example.js to js/config.js and fill in your project URL + anon key.'
  );
}

export const supabase = config
  ? createClient(config.url, config.anonKey)
  : null;
