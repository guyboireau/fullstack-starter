-- =============================================
-- Migration: contenu éditable multi-sites
-- =============================================
-- Un déploiement sert plusieurs sites (un par marque / domaine).
-- Tout ce qui est public est lisible sans authentification, à condition
-- d'être publié ; l'écriture est réservée aux membres du site concerné.

-- ── Sites ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  domain      TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  tagline     TEXT,
  theme       TEXT NOT NULL DEFAULT 'default',
  phone       TEXT,
  email       TEXT,
  address     JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo         JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_to  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Qui administre quel site ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_members (
  site_id UUID NOT NULL REFERENCES public.sites ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role    TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
  PRIMARY KEY (site_id, user_id)
);

-- Encapsule le test d'appartenance. SECURITY DEFINER pour que la politique
-- puisse lire site_members sans être elle-même soumise à une politique
-- (ce qui provoquerait une récursion infinie).
CREATE OR REPLACE FUNCTION public.is_site_member(target_site UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_members
    WHERE site_id = target_site AND user_id = auth.uid()
  );
$$;

-- ── Sections de page (accueil, à propos…) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.page_sections (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id    UUID NOT NULL REFERENCES public.sites ON DELETE CASCADE,
  page       TEXT NOT NULL,
  key        TEXT NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  position   INT  NOT NULL DEFAULT 0,
  published  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_id, page, key)
);

-- ── Services ────────────────────────────────────────────────────────────────
-- legacy_id porte l'identifiant du CMS d'origine : c'est lui qui apparaît dans
-- les URLs historiques (/service/2/Taillage-dEngrenages) et qui permet de les
-- conserver à l'identique lors d'une reprise.
CREATE TABLE IF NOT EXISTS public.services (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id    UUID NOT NULL REFERENCES public.sites ON DELETE CASCADE,
  legacy_id  INT  NOT NULL,
  slug       TEXT NOT NULL,
  title      TEXT NOT NULL,
  excerpt    TEXT,
  body       TEXT,
  icon       TEXT,
  cover_url  TEXT,
  position   INT  NOT NULL DEFAULT 0,
  published  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_id, legacy_id),
  UNIQUE (site_id, slug)
);

-- ── Réalisations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     UUID NOT NULL REFERENCES public.sites ON DELETE CASCADE,
  legacy_id   INT  NOT NULL,
  slug        TEXT NOT NULL,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  body        TEXT,
  service_id  UUID REFERENCES public.services ON DELETE SET NULL,
  realized_at DATE,
  cover_url   TEXT,
  position    INT  NOT NULL DEFAULT 0,
  published   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_id, legacy_id),
  UNIQUE (site_id, slug)
);

-- ── Actualités ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.news (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id      UUID NOT NULL REFERENCES public.sites ON DELETE CASCADE,
  legacy_id    INT  NOT NULL,
  slug         TEXT NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  body         TEXT,
  cover_url    TEXT,
  published_at TIMESTAMPTZ,
  published    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_id, legacy_id),
  UNIQUE (site_id, slug)
);

-- ── Témoignages ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id   UUID NOT NULL REFERENCES public.sites ON DELETE CASCADE,
  author    TEXT NOT NULL,
  company   TEXT,
  quote     TEXT NOT NULL,
  rating    NUMERIC(2,1),
  position  INT  NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── Soumissions de formulaire ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id    UUID NOT NULL REFERENCES public.sites ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT NOT NULL,
  content    TEXT NOT NULL,
  ip_hash    TEXT,
  user_agent TEXT,
  status     TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  purge_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '12 months'
);

-- ── Index ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_services_site      ON public.services(site_id, position);
CREATE INDEX IF NOT EXISTS idx_achievements_site  ON public.achievements(site_id, position);
CREATE INDEX IF NOT EXISTS idx_news_site          ON public.news(site_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_sections_site      ON public.page_sections(site_id, page, position);
CREATE INDEX IF NOT EXISTS idx_submissions_purge  ON public.contact_submissions(purge_at);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.sites               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Sites : lisibles par tous (le front doit résoudre le site avant tout le reste).
CREATE POLICY "Sites are publicly readable"
  ON public.sites FOR SELECT USING (TRUE);
CREATE POLICY "Members can update their site"
  ON public.sites FOR UPDATE USING (public.is_site_member(id));

-- Appartenances : chacun voit les siennes.
CREATE POLICY "Members can read their memberships"
  ON public.site_members FOR SELECT USING (user_id = auth.uid());

-- Contenu publié : lecture publique. Écriture réservée aux membres du site.
CREATE POLICY "Published sections are public"
  ON public.page_sections FOR SELECT USING (published OR public.is_site_member(site_id));
CREATE POLICY "Members manage sections"
  ON public.page_sections FOR ALL
  USING (public.is_site_member(site_id)) WITH CHECK (public.is_site_member(site_id));

CREATE POLICY "Published services are public"
  ON public.services FOR SELECT USING (published OR public.is_site_member(site_id));
CREATE POLICY "Members manage services"
  ON public.services FOR ALL
  USING (public.is_site_member(site_id)) WITH CHECK (public.is_site_member(site_id));

CREATE POLICY "Published achievements are public"
  ON public.achievements FOR SELECT USING (published OR public.is_site_member(site_id));
CREATE POLICY "Members manage achievements"
  ON public.achievements FOR ALL
  USING (public.is_site_member(site_id)) WITH CHECK (public.is_site_member(site_id));

CREATE POLICY "Published news are public"
  ON public.news FOR SELECT USING (published OR public.is_site_member(site_id));
CREATE POLICY "Members manage news"
  ON public.news FOR ALL
  USING (public.is_site_member(site_id)) WITH CHECK (public.is_site_member(site_id));

CREATE POLICY "Published testimonials are public"
  ON public.testimonials FOR SELECT USING (published OR public.is_site_member(site_id));
CREATE POLICY "Members manage testimonials"
  ON public.testimonials FOR ALL
  USING (public.is_site_member(site_id)) WITH CHECK (public.is_site_member(site_id));

-- Soumissions : jamais lisibles publiquement. L'insertion passe par un Route
-- Handler serveur utilisant la clé de service, hors périmètre des politiques.
CREATE POLICY "Members read submissions"
  ON public.contact_submissions FOR SELECT USING (public.is_site_member(site_id));
CREATE POLICY "Members update submissions"
  ON public.contact_submissions FOR UPDATE USING (public.is_site_member(site_id));
