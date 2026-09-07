import type { SupabaseClient } from '@supabase/supabase-js';
import {
  serviceSchema, achievementSchema, newsSchema,
  type Service, type Achievement, type News,
} from '@/schemas/content';

/**
 * Écritures du back-office, adressées directement à Supabase.
 *
 * Les politiques RLS font seules le contrôle d'accès : elles n'autorisent
 * l'écriture qu'aux membres du site visé. Interposer une API applicative
 * n'ajouterait ici aucune garantie, seulement un service de plus à déployer et
 * à maintenir.
 */

export type ContentTable = 'services' | 'achievements' | 'news';

export interface MemberSite {
  role: string;
  sites: { id: string; name: string; slug: string };
}

/**
 * Sites que l'utilisateur courant peut administrer.
 *
 * PostgREST renvoie la relation imbriquée tantôt comme objet, tantôt comme
 * tableau selon la façon dont la jointure est inférée : on normalise les deux
 * formes plutôt que de forcer un type.
 */
export async function listMemberSites(supabase: SupabaseClient): Promise<MemberSite[]> {
  const { data, error } = await supabase
    .from('site_members')
    .select('role, sites!inner(id, name, slug)')
    .order('site_id');
  if (error) throw new Error(error.message);

  return (data ?? []).flatMap(row => {
    const nested = (row as { sites: unknown }).sites;
    const site = Array.isArray(nested) ? nested[0] : nested;
    return site ? [{ role: String((row as { role: unknown }).role), sites: site as MemberSite['sites'] }] : [];
  });
}

/** Listes d'administration : brouillons compris, contrairement au front. */
export async function listAllServices(supabase: SupabaseClient, siteId: string): Promise<Service[]> {
  const { data, error } = await supabase.from('services').select('*')
    .eq('site_id', siteId).order('position');
  if (error) throw new Error(error.message);
  return (data ?? []).map(r => serviceSchema.parse(r));
}

export async function listAllAchievements(supabase: SupabaseClient, siteId: string): Promise<Achievement[]> {
  const { data, error } = await supabase.from('achievements').select('*')
    .eq('site_id', siteId).order('position');
  if (error) throw new Error(error.message);
  return (data ?? []).map(r => achievementSchema.parse(r));
}

export async function listAllNews(supabase: SupabaseClient, siteId: string): Promise<News[]> {
  const { data, error } = await supabase.from('news').select('*')
    .eq('site_id', siteId).order('published_at', { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(r => newsSchema.parse(r));
}

/** Champs optionnels : une chaîne vide vaut « non renseigné », donc NULL. */
function nullifyBlanks(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v === '' || v === undefined ? null : v]),
  );
}

export async function createRow(
  supabase: SupabaseClient, table: ContentTable, siteId: string, values: Record<string, unknown>,
) {
  const { error } = await supabase.from(table).insert({ ...nullifyBlanks(values), site_id: siteId });
  if (error) throw new Error(error.message);
}

export async function updateRow(
  supabase: SupabaseClient, table: ContentTable, id: string, values: Record<string, unknown>,
) {
  const { error } = await supabase.from(table)
    .update({ ...nullifyBlanks(values), updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteRow(supabase: SupabaseClient, table: ContentTable, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
