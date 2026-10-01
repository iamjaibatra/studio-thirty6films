/**
 * Database client for the public site.
 *
 * The public site only ever reads tables and inserts contact-form inquiries
 * — no auth, storage, realtime or functions — so it uses PostgREST directly
 * instead of the full supabase-js bundle. Same `.from().select()...` API and
 * the same REST requests, but it skips downloading the ~26 KB auth module on
 * every visit. (The inquiry email goes through a plain fetch in transmit.js.)
 *
 * If the site ever needs auth/storage/realtime, switch back to:
 *   import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
 *   export const supabase = createClient(config.url, config.anonKey);
 */
import { PostgrestClient } from 'https://cdn.jsdelivr.net/npm/@supabase/postgrest-js@2/+esm';

const config = window.__SUPABASE_CONFIG__;

if (!config || !config.url || !config.anonKey) {
  console.error(
    '[T36] Missing Supabase config. Copy js/config.example.js to js/config.js and fill in your project URL + anon key.'
  );
}

export const supabase = config
  ? new PostgrestClient(`${config.url}/rest/v1`, {
      headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` },
    })
  : null;
