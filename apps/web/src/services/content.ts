import type { SupabaseClient } from '@supabase/supabase-js';
import {
  siteSchema, pageSectionSchema, serviceSchema, achievementSchema,
  newsSchema, testimonialSchema,
  type Site, type PageSection, type Service, type Achievement,
  type News, type Testimonial,
} from '@/schemas/content';

/**
 * Toutes les lectures passent par le client Supabase de la requête : les
 * politiques RLS s'appliquent donc telles quelles. Un visiteur anonyme ne voit
 * que le contenu publié, un membre du site voit aussi ses brouillons — sans
 * qu'aucun filtre n'ait à être écrit ici.
 */

/** Résout le site servi, par nom de domaine puis par slug de repli. */
export async function getSite(
  supabase: SupabaseClient,
  hostname: string,
  fallbackSlug = 'demo',
): Promise<Site | null> {
  const byDomain = await supabase.from('sites').select('*').eq('domain', hostname).maybeSingle();
  const row = byDomain.data
    ?? (await supabase.from('sites').select('*').eq('slug', fallbackSlug).maybeSingle()).data;
  return row ? siteSchema.parse(row) : null;
}

/** Sections d'une page, indexées par clé — la forme qu'attendent les composants. */
export async function getPageSections(
  supabase: SupabaseClient,
  siteId: string,
  page: string,
): Promise<Record<string, Record<string, unknown>>> {
  const { data } = await supabase
    .from('page_sections')
    .select('id, page, key, data, position')
    .eq('site_id', siteId).eq('page', page)
    .order('position');

  return Object.fromEntries(
    (data ?? []).map(r => pageSectionSchema.parse(r)).map((s: PageSection) => [s.key, s.data]),
  );
}

export async function listServices(supabase: SupabaseClient, siteId: string): Promise<Service[]> {
  const { data } = await supabase
    .from('services').select('*').eq('site_id', siteId).order('position');
  return (data ?? []).map(r => serviceSchema.parse(r));
}

export async function listAchievements(supabase: SupabaseClient, siteId: string): Promise<Achievement[]> {
  const { data } = await supabase
    .from('achievements').select('*').eq('site_id', siteId).order('position');
  return (data ?? []).map(r => achievementSchema.parse(r));
}

export async function listNews(supabase: SupabaseClient, siteId: string): Promise<News[]> {
  const { data } = await supabase
    .from('news').select('*').eq('site_id', siteId)
    .order('published_at', { ascending: false, nullsFirst: false });
  return (data ?? []).map(r => newsSchema.parse(r));
}

export async function listTestimonials(supabase: SupabaseClient, siteId: string): Promise<Testimonial[]> {
  const { data } = await supabase
    .from('testimonials').select('*').eq('site_id', siteId).order('position');
  return (data ?? []).map(r => testimonialSchema.parse(r));
}

/**
 * Fiches individuelles, retrouvées par `legacy_id`.
 *
 * C'est l'identifiant du CMS d'origine qui figure dans les URLs historiques
 * (`/service/2/Taillage-dEngrenages`). Router dessus, et non sur le slug, est
 * ce qui permet de reprendre un site sans écrire la moindre redirection.
 * Le slug reste dans l'URL pour la lisibilité, mais ne sert pas à résoudre.
 */
export async function getServiceByLegacyId(supabase: SupabaseClient, siteId: string, legacyId: number) {
  const { data } = await supabase.from('services').select('*')
    .eq('site_id', siteId).eq('legacy_id', legacyId).maybeSingle();
  return data ? serviceSchema.parse(data) : null;
}

export async function getAchievementByLegacyId(supabase: SupabaseClient, siteId: string, legacyId: number) {
  const { data } = await supabase.from('achievements').select('*')
    .eq('site_id', siteId).eq('legacy_id', legacyId).maybeSingle();
  return data ? achievementSchema.parse(data) : null;
}

export async function getNewsByLegacyId(supabase: SupabaseClient, siteId: string, legacyId: number) {
  const { data } = await supabase.from('news').select('*')
    .eq('site_id', siteId).eq('legacy_id', legacyId).maybeSingle();
  return data ? newsSchema.parse(data) : null;
}

/** Slug d'URL : accentué ou espacé en entrée, sûr en sortie. */
export function slugify(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
