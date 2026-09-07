/**
 * Élargit les types littéraux issus d'un objet `as const`.
 *
 * `siteConfig` est figé en `as const`, donc `hero.h1` a pour type la chaîne
 * littérale de son propre contenu de repli. Sans cet élargissement, toute
 * valeur venue de la base serait refusée par le compilateur pour cause de
 * littéral différent.
 */
export type Widen<T> =
  T extends string  ? string  :
  T extends number  ? number  :
  T extends boolean ? boolean :
  T extends readonly (infer U)[] ? Widen<U>[] :
  T extends object ? { -readonly [K in keyof T]: Widen<T[K]> } :
  T;

/**
 * Superpose le contenu administré à la configuration statique.
 *
 * La configuration reste le repli : une section absente de la base n'entraîne
 * pas de page vide, et un nouveau site s'affiche correctement avant même
 * d'avoir été rempli.
 */
export function withFallback<T extends object>(
  fallback: T,
  override?: Record<string, unknown> | null,
): Widen<T> {
  return { ...fallback, ...(override ?? {}) } as Widen<T>;
}

import type { Site } from '@/schemas/content';

/**
 * Projette la ligne `sites` dans la forme `business` attendue par les
 * composants existants, pour ne rien changer à leur gabarit.
 */
export function siteToBusiness(site: Site | null): Record<string, unknown> {
  if (!site) return {};
  return {
    name:    site.name,
    tagline: site.tagline ?? '',
    phone:   site.phone ?? '',
    email:   site.email ?? '',
    address: site.address,
  };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Rend le corps d'une fiche : paragraphes, listes à puces et gras.
 *
 * Volontairement minimal — le contenu vient du back-office et transite par
 * `set:html`, donc tout est échappé avant la moindre mise en forme. Un éditeur
 * riche viendra remplacer ceci, avec l'assainissement qui va avec.
 */
export function renderBody(body: string | null): string {
  if (!body) return '';
  const bold = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  return body.split(/\n{2,}/).map(block => {
    const lines = block.split('\n').filter(Boolean);
    if (lines.every(l => l.trimStart().startsWith('- '))) {
      const items = lines.map(l => `<li>${bold(escapeHtml(l.trim().slice(2)))}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${bold(escapeHtml(block)).replace(/\n/g, '<br />')}</p>`;
  }).join('');
}
