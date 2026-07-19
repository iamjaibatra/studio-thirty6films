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
 * Enabled services, ordered. Used by Transmit's dropdown AND the Lenses
 * page — fetched once, shared, rather than querying twice.
 */
export async function loadServices() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('services')
    .select(
      'id, title, description, specs, duration, price, display_order, ' +
        'icon:icon_media_id ( url ), image:image_media_id ( url ), video:video_media_id ( url )'
    )
    .eq('enabled', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[T36] Failed to load services:', error);
    return [];
  }

  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    specs: row.specs || {},
    duration: row.duration,
    price: row.price,
    iconUrl: row.icon?.url || null,
    imageUrl: row.image?.url || null,
    videoUrl: row.video?.url || null,
  }));
}

/**
 * Archive contact-sheet cards, ordered. Resolves media_id to a real
 * image URL where set (falls back to the decorative gradient stills on
 * the website side when absent).
 */
export async function loadArchiveItems() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('archive_items')
    .select('id, title, category, metadata, display_order, media:media_id ( url, alt_text )')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[T36] Failed to load archive items:', error);
    return [];
  }

  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    category: row.category,
    metadata: row.metadata || {},
    imageUrl: row.media?.url || null,
    altText: row.media?.alt_text || '',
  }));
}

/**
 * Edit page timeline stages, ordered. media_id (renamed from
 * video_media_id — now holds either an image or a video) and project_id
 * both have real FKs (verified via pg_constraint), so the embedded joins
 * here are safe.
 */
export async function loadTimelineStages() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('timeline_stages')
    .select(
      'id, label, description, stage_order, media:media_id ( url, type ), project:project_id ( title, client )'
    )
    .order('stage_order', { ascending: true });

  if (error) {
    console.error('[T36] Failed to load timeline stages:', error);
    return [];
  }

  return (data ?? []).map(row => ({
    id: row.id,
    label: row.label,
    description: row.description,
    mediaUrl: row.media?.url || null,
    mediaType: row.media?.type || null, // 'image' | 'video' | null
    projectTitle: row.project?.title || null,
    projectClient: row.project?.client || null,
  }));
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
