import { supabase } from './supabase-client.js';

const FALLBACK_STILL_COUNT = 8; // .s1–.s8 gradient classes exist in css/modes.css

function slugify(text) {
  return (text || 'uncategorized')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'uncategorized';
}

/**
 * Fetches published projects (featured first, then newest) and maps the
 * real `projects` table columns (title, slug, client, category, year,
 * description, duration, featured, published, thumbnail, video) into the
 * shape playback.js / keyboard.js already render.
 *
 * Note: the original mock data included per-project lens/fps/codec
 * numbers. Those aren't real fields in the CMS, so rather than fabricate
 * plausible-looking camera specs for real client work, the "spec" line
 * shown per clip is built from real fields only (category · year).
 *
 * @returns {Promise<{ projects: object[], error: Error|null }>}
 */
export async function loadProjects() {
  if (!supabase) {
    return { projects: [], error: new Error('Supabase is not configured.') };
  }

  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, title, slug, client, category, year, description, duration, featured, thumbnail, video, hover_video, credits, created_at'
    )
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return { projects: [], error };
  }

  const projects = (data ?? []).map((row, i) => {
    const hasThumbnail = Boolean(row.thumbnail);
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      client: row.client || '',
      category: row.category || 'Uncategorized',
      categorySlug: slugify(row.category),
      // Real background image when we have one; otherwise fall back to
      // the site's existing decorative gradient stills, cycling through
      // the 8 that already exist in CSS.
      still: hasThumbnail ? '' : `s${(i % FALLBACK_STILL_COUNT) + 1}`,
      thumbnail: row.thumbnail || null,
      video: row.video || null,
      // Short hover-preview loop, falling back to the full video if a
      // project doesn't have a separate one set.
      hoverVideo: row.hover_video || row.video || null,
      poster: row.thumbnail || null,
      duration: row.duration || '—',
      year: row.year ?? '',
      featured: Boolean(row.featured),
      credits: Array.isArray(row.credits) ? row.credits : [],
      spec: [row.category, row.year].filter(Boolean).join(' · ') || '—',
    };
  });

  return { projects, error: null };
}

/**
 * Gallery images for a single project, fetched lazily (only when the
 * fullscreen player actually opens) rather than joined into every card
 * in the grid.
 */
export async function loadProjectGallery(projectId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('project_gallery')
    .select('sort_order, media:media_id ( url, name, alt_text )')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[T36] Failed to load project gallery:', error);
    return [];
  }
  return (data ?? []).map(row => row.media).filter(Boolean);
}
