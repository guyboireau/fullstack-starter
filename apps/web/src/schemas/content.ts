import { z } from 'zod';

/** Coordonnées postales, telles que stockées dans `sites.address`. */
export const addressSchema = z.object({
  street:     z.string().default(''),
  postalCode: z.string().default(''),
  city:       z.string().default(''),
  country:    z.string().default('FR'),
});

export const siteSchema = z.object({
  id:         z.uuid(),
  slug:       z.string(),
  domain:     z.string(),
  name:       z.string(),
  tagline:    z.string().nullable(),
  theme:      z.string(),
  phone:      z.string().nullable(),
  email:      z.string().nullable(),
  address:    addressSchema.catch({ street: '', postalCode: '', city: '', country: 'FR' }),
  seo:        z.object({ defaultDescription: z.string().default('') }).catch({ defaultDescription: '' }),
  contact_to: z.string().nullable(),
});
export type Site = z.infer<typeof siteSchema>;

/**
 * Une section de page. `data` reste volontairement libre : chaque type de
 * section a sa propre forme, et c'est le composant qui la consomme qui en
 * connaît le détail. Contraindre ici obligerait à modifier le schéma à chaque
 * ajout de section.
 */
export const pageSectionSchema = z.object({
  id:       z.uuid(),
  page:     z.string(),
  key:      z.string(),
  data:     z.record(z.string(), z.unknown()),
  position: z.number(),
});
export type PageSection = z.infer<typeof pageSectionSchema>;

export const serviceSchema = z.object({
  id:        z.uuid(),
  legacy_id: z.number(),
  slug:      z.string(),
  title:     z.string(),
  excerpt:   z.string().nullable(),
  body:      z.string().nullable(),
  icon:      z.string().nullable(),
  cover_url: z.string().nullable(),
  position:  z.number(),
  published: z.boolean(),
});
export type Service = z.infer<typeof serviceSchema>;

export const achievementSchema = z.object({
  id:          z.uuid(),
  legacy_id:   z.number(),
  slug:        z.string(),
  title:       z.string(),
  subtitle:    z.string().nullable(),
  body:        z.string().nullable(),
  service_id:  z.uuid().nullable(),
  realized_at: z.string().nullable(),
  cover_url:   z.string().nullable(),
  position:    z.number(),
  published:   z.boolean(),
});
export type Achievement = z.infer<typeof achievementSchema>;

export const newsSchema = z.object({
  id:           z.uuid(),
  legacy_id:    z.number(),
  slug:         z.string(),
  title:        z.string(),
  excerpt:      z.string().nullable(),
  body:         z.string().nullable(),
  cover_url:    z.string().nullable(),
  published_at: z.string().nullable(),
  published:    z.boolean(),
});
export type News = z.infer<typeof newsSchema>;

export const testimonialSchema = z.object({
  id:       z.uuid(),
  author:   z.string(),
  company:  z.string().nullable(),
  quote:    z.string(),
  rating:   z.coerce.number().nullable(),
  position: z.number(),
});
export type Testimonial = z.infer<typeof testimonialSchema>;

// ─── Formulaires d'administration ───────────────────────────────────────────

export const serviceFormSchema = z.object({
  legacy_id: z.coerce.number().int().min(0, 'Identifiant historique requis'),
  slug:      z.string().min(1, 'Slug requis').max(120),
  title:     z.string().min(1, 'Titre requis').max(200),
  excerpt:   z.string().max(500).optional(),
  body:      z.string().max(20000).optional(),
  icon:      z.string().max(40).optional(),
  position:  z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(false),
});
export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export const achievementFormSchema = z.object({
  legacy_id:   z.coerce.number().int().min(0, 'Identifiant historique requis'),
  slug:        z.string().min(1, 'Slug requis').max(120),
  title:       z.string().min(1, 'Titre requis').max(200),
  subtitle:    z.string().max(300).optional(),
  body:        z.string().max(20000).optional(),
  service_id:  z.union([z.uuid(), z.literal('')]).optional(),
  realized_at: z.union([z.iso.date(), z.literal('')]).optional(),
  position:    z.coerce.number().int().default(0),
  published:   z.coerce.boolean().default(false),
});
export type AchievementFormValues = z.infer<typeof achievementFormSchema>;

export const newsFormSchema = z.object({
  legacy_id:    z.coerce.number().int().min(0, 'Identifiant historique requis'),
  slug:         z.string().min(1, 'Slug requis').max(120),
  title:        z.string().min(1, 'Titre requis').max(200),
  excerpt:      z.string().max(500).optional(),
  body:         z.string().max(20000).optional(),
  published_at: z.union([z.iso.date(), z.literal('')]).optional(),
  published:    z.coerce.boolean().default(false),
});
export type NewsFormValues = z.infer<typeof newsFormSchema>;
