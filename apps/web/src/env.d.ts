/// <reference types="astro/client" />

import type { User } from '@supabase/supabase-js';
import type { Site } from './schemas/content';

declare global {
  namespace App {
    interface Locals {
      /** Utilisateur authentifié, renseigné par le middleware sur les routes protégées. */
      user: User | null;
      /** Token CSRF de la requête, posé par le middleware. Vide hors formulaires. */
      csrfToken: string;
      /** Site servi, résolu par domaine. `null` si le domaine est inconnu. */
      site: Site | null;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
