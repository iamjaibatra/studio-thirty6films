/**
 * Copy this file to js/config.js and fill in your Supabase project's
 * URL and anon (publishable) key — found in Supabase dashboard →
 * Settings → API. The anon key is safe to expose in client-side code by
 * design (Row Level Security enforces what it can actually read/write);
 * it's still kept out of git purely to avoid re-committing project
 * identifiers unnecessarily, same as the CMS repo.
 *
 * On Vercel, js/config.js is generated at build time by scripts/build.js
 * from the SUPABASE_URL / SUPABASE_ANON_KEY environment variables —
 * you don't need to commit or manually create it there.
 */
window.__SUPABASE_CONFIG__ = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-ANON-KEY",
};
