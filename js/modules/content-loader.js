import { supabase } from './supabase-client.js';

/**
 * Loads all page_content rows for a given page, keyed by section, with
 * any `*_media_id` field resolved to a matching `*_url` field via the
 * `media` table (so callers never need to know about media IDs).
 *
 * @param {string} page
 * @returns {Promise<Record<string, object>>} e.g. { hero: {...}, hud: {...} }
 */
/**
 * Enabled services, ordered for display. Used by Transmit's service
 * dropdown and (in a later phase) the Lenses page itself.
 */
export async function loadServices() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('services')
    .select('id, title, description, duration, price, display_order')
    .eq('enabled', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[T36] Failed to load services:', error);
    return [];
  }
  return data ?? [];
}

export async function loadPageContent(page) {
  if (!supabase) return {};

  const { data, error } = await supabase.from('page_content').select('section, content').eq('page', page);
  if (error) throw error;

  const bySection = {};
  (data ?? []).forEach(row => {
    bySection[row.section] = row.content || {};
  });

  const mediaIds = new Set();
  Object.values(bySection).forEach(content => {
    Object.entries(content).forEach(([key, value]) => {
      if (key.endsWith('_media_id') && value) mediaIds.add(value);
    });
  });

  let mediaById = {};
  if (mediaIds.size) {
    const { data: mediaRows, error: mediaError } = await supabase
      .from('media')
      .select('id, url')
      .in('id', [...mediaIds]);
    if (!mediaError) {
      mediaById = Object.fromEntries((mediaRows ?? []).map(m => [m.id, m.url]));
    }
  }

  Object.values(bySection).forEach(content => {
    Object.keys(content).forEach(key => {
      if (key.endsWith('_media_id') && content[key]) {
        content[key.replace('_media_id', '_url')] = mediaById[content[key]] || null;
      }
    });
  });

  return bySection;
}
