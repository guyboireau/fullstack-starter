// ═════════════════════════════════════════════════════════════════════════════
//  SITE CONFIG — fichier unique à modifier par client
//  Structure :
//    siteConfig.business  → infos de l'entreprise
//    siteConfig.branding  → couleurs, polices, logo
//    siteConfig.seo       → titre, description, mots-clés
//    siteConfig.design    → variantes de mise en page A/B/C par section
//    siteConfig.pages     → titres/descriptions des pages (multipage)
//    siteConfig.features  → activer/désactiver des modules
//    siteConfig.content   → contenus sections (hero, services, etc.)
// ═════════════════════════════════════════════════════════════════════════════

export const siteConfig = {
  // Navigation (landing 1 page)
  nav: [
    { label: 'Services',  href: '#services' },
    { label: 'À propos',  href: '#apropos' },
    { label: 'Tarifs',    href: '#tarifs' },
    { label: 'FAQ',       href: '#faq' },
    { label: 'Contact',   href: '#contact' },
  ],

  // ── 1. INFORMATIONS BUSINESS ───────────────────────────────────────────────
  business: {
    name:     '[NOM DE L\'ENTREPRISE]',
    tagline:  '[VOTRE SLOGAN ICI]',
    industry: 'services',          // utilisé pour schema.org + choix de contenu IA
    phone:    '+33 6 00 00 00 00',
    email:    'contact@votre-domaine.fr',
    address: {
      street:     '[RUE ET NUMÉRO]',
      city:       '[VILLE]',
      postalCode: '[CODE POSTAL]',
      country:    'FR',
    },
    openingHours: {
      monday:    '09:00-18:00',
      tuesday:   '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday:  '09:00-18:00',
      friday:    '09:00-18:00',
      saturday:  null,
      sunday:    null,
    },
    socialLinks: {
      linkedin:  '',
      instagram: '',
      facebook:  '',
      twitter:   '',
    },
    siret:        '000 000 000 00000',
    availability: 'Disponible',
  },

  // ── 2. BRANDING ────────────────────────────────────────────────────────────
  branding: {
    primaryColor:    '#3b82f6',   // Bleu standard
    primaryDark:     '#2563eb',
    primarySoft:     '#eff6ff',
    secondaryColor:  '#1a1916',
    accentColor:     '#f59e0b',
    fontHeading:     'Geist',
    fontBody:        'Geist',
    fontMono:        'Geist Mono',
    logoPath:        '/assets/logo.svg',
    faviconPath:     '/favicon.svg',
  },

  // ── 3. SEO ─────────────────────────────────────────────────────────────────
  seo: {
    titleTemplate:      '%s | [NOM DE L\'ENTREPRISE]',
    defaultTitle:       '[NOM DE L\'ENTREPRISE] — [ACTIVITÉ PRINCIPALE]',
    defaultDescription: 'Description courte de vos services et de votre valeur ajoutée pour vos clients.',
    keywords: [
      'mot-clé 1',
      'mot-clé 2',
      'mot-clé 3',
    ],
    googleBusinessUrl:   '',
    googleAnalyticsId:   '',
    googleSearchConsole: '',
    bingWebmasterKey:    '',
    plausibleDomain:     '',
    sentryDsn:           '',
    locale:              'fr_FR',
    siteUrl:             'https://votre-site.fr',
    ogImage:             '/assets/og-image.jpg',
  },

  // ── 4. DESIGN VARIANTS ─────────────────────────────────────────────────────
  design: {
    isSketchy: false,
    variants: {
      header:       'A',
      hero:         'A',
      services:     'A',
      about:        'A',
      testimonials: 'A',
      pricing:      'A',
      faq:          'A',
      cta:          'A',
      footer:       'A',
    },
  },

  // ── 5. PAGES (multipage) ──────────────────────────────────────────────────
  pages: {
    home: {
      slug:        '/',
      title:       'Accueil',
      description: 'Bienvenue sur notre site.',
    },
    services: {
      slug:        '/services',
      title:       'Nos services',
      description: 'Découvrez nos prestations.',
    },
    about: {
      slug:        '/a-propos',
      title:       'À propos',
      description: 'En savoir plus sur notre entreprise.',
    },
    blog: {
      slug:        '/blog',
      title:       'Blog',
      description: 'Actualités et conseils.',
    },
    realisations: {
      slug:        '/realisations',
      title:       'Réalisations',
      description: 'Nos projets récents.',
    },
    contact: {
      slug:        '/contact',
      title:       'Contact',
      description: 'Contactez-nous pour toute demande.',
    },
  },

  // ── 6. FEATURES ────────────────────────────────────────────────────────────
  features: {
    blog:          false,
    booking:       false,
    multilingual:  false,
    pricing:       true,
    testimonials:  true,
    newsletter:    false,
    cookieBanner:  true,
    analytics:     false,
    plausible:     false,
    sentry:        false,
  },

  // ── 7. CONTENT ─────────────────────────────────────────────────────────────
  content: {

    hero: {
      eyebrow:  '[SOUSTITRE / ACTIVITÉ]',
      h1:       '[TITRE PRINCIPAL CAPTIVANT]',
      subtitle: '[Description détaillée de ce que vous faites et pourquoi vous êtes le meilleur choix pour vos clients.]',
      image:    '/assets/images/placeholder-hero.png',
      cta1:     { label: '[BOUTON PRINCIPAL]', href: '#contact' },
      cta2:     { label: '[BOUTON SECONDAIRE]', href: '#services' },
      trust:    ['[Argument 1]', '[Argument 2]', '[Argument 3]'],
      badge:    { label: '[LABEL]', value: '[VALEUR]', sub: '[DÉTAIL]' },
      infoCard: { status: 'Disponible', hours: 'Lun–Ven · 9h–18h', location: '[VOTRE ADRESSE]' },
    },

    services: {
      eyebrow:  '— Nos prestations',
      title:    '[TITRE DE LA SECTION SERVICES]',
      subtitle: '[Introduction à vos services et votre savoir-faire.]',
      items: [
        {
          icon:  'star',
          title: '[Service 1]',
          text:  '[Description courte du service 1 expliquant les bénéfices.]',
          link:  'En savoir plus →',
          tag:   '[Tag/Info]',
          features: ['[Caractéristique 1]', '[Caractéristique 2]', '[Caractéristique 3]'],
        },
        {
          icon:  'check',
          title: '[Service 2]',
          text:  '[Description courte du service 2 expliquant les bénéfices.]',
          link:  'En savoir plus →',
          tag:   '[Tag/Info]',
          features: ['[Caractéristique 1]', '[Caractéristique 2]', '[Caractéristique 3]'],
        },
        {
          icon:  'shield',
          title: '[Service 3]',
          text:  '[Description courte du service 3 expliquant les bénéfices.]',
          link:  'En savoir plus →',
          tag:   '[Tag/Info]',
          features: ['[Caractéristique 1]', '[Caractéristique 2]', '[Caractéristique 3]'],
        },
      ],
    },

    about: {
      eyebrow: '— À propos',
      title:   '[QUI SOMMES-NOUS ?]',
      text: [
        '[Paragraphe 1 : Présentez votre histoire et votre mission.]',
        '[Paragraphe 2 : Expliquez votre approche et vos valeurs.]',
      ],
      stats: [
        { value: '[XX]',   label: '[Label 1]' },
        { value: '[XX]+',  label: '[Label 2]' },
        { value: '[X.X]',  label: '[Label 3]' },
      ],
      cta:    { label: '[EN SAVOIR PLUS]', href: '#contact' },
      image:  '/assets/images/placeholder-about.png',
      author: { name: '[NOM]', role: '[RÔLE]', image: '/assets/images/placeholder-portrait.png' },
    },

    testimonials: {
      eyebrow:   '— Témoignages',
      title:     '[TITRE TÉMOIGNAGES]',
      ratingStr: '[X.X] / 5 · [XX] avis clients',
      items: [
        {
          quote:   '[Citation du client 1 : Expliquez comment vous avez aidé ce client.]',
          name:    '[NOM CLIENT 1]',
          role:    '[RÔLE / ENTREPRISE]',
          initial: 'C',
        },
        {
          quote:   '[Citation du client 2 : Expliquez comment vous avez aidé ce client.]',
          name:    '[NOM CLIENT 2]',
          role:    '[RÔLE / ENTREPRISE]',
          initial: 'C',
        },
        {
          quote:   '[Citation du client 3 : Expliquez comment vous avez aidé ce client.]',
          name:    '[NOM CLIENT 3]',
          role:    '[RÔLE / ENTREPRISE]',
          initial: 'C',
        },
      ],
    },

    pricing: {
      eyebrow:  '— Tarifs',
      title:    '[TITRE TARIFS]',
      subtitle: '[Introduction à vos tarifs et vos différentes offres.]',
      plans: [
        {
          name:      '[OFFRE 1]',
          price:     '[PRIX]',
          unit:      '/ [UNITÉ]',
          desc:      '[Description courte de l\'offre 1.]',
          features:   ['[Service inclus 1]', '[Service inclus 2]', '[Service inclus 3]'],
          cta:        'Choisir',
          highlight:  false,
          stripeLink: '',
        },
        {
          name:       '[OFFRE 2]',
          price:      '[PRIX]',
          unit:       '/ [UNITÉ]',
          desc:       '[Description courte de l\'offre 2.]',
          features:   ['[Service inclus 1]', '[Service inclus 2]', '[Service inclus 3]'],
          cta:        'Choisir',
          highlight:  true,
          stripeLink: '',
        },
        {
          name:       '[OFFRE 3]',
          price:      '[PRIX]',
          unit:       '/ [UNITÉ]',
          desc:       '[Description courte de l\'offre 3.]',
          features:   ['[Service inclus 1]', '[Service inclus 2]', '[Service inclus 3]'],
          cta:        'Choisir',
          highlight:  false,
          stripeLink: '',
        },
      ],
    },

    faq: {
      eyebrow: '— Questions fréquentes',
      title:   '[TITRE FAQ]',
      items: [
        { q: '[Question 1 ?]', a: '[Réponse détaillée à la question 1.]' },
        { q: '[Question 2 ?]', a: '[Réponse détaillée à la question 2.]' },
        { q: '[Question 3 ?]', a: '[Réponse détaillée à la question 3.]' },
        { q: '[Question 4 ?]', a: '[Réponse détaillée à la question 4.]' },
        { q: '[Question 5 ?]', a: '[Réponse détaillée à la question 5.]' },
      ],
    },

    cta: {
      eyebrow:  '[APPEL À L\'ACTION]',
      title:    '[PRÊT À DÉMARRER ?]',
      subtitle: '[Dernière phrase d\'incitation pour contacter l\'entreprise.]',
      cta1:     { label: '[CONTACT]', href: '#contact' },
      cta2:     { label: '[DÉCOUVRIR]',  href: '#services' },
    },

    contact: {
      eyebrow:        '— Contact',
      title:          '[TITRE CONTACT]',
      subtitle:       '[Décrivez ce que le client doit faire pour vous contacter.]',
      successMessage: 'Message bien reçu — nous vous répondons rapidement.',
    },

    footer: {
      description: '[Description courte de l\'entreprise pour le bas de page.]',
      links: [
        { label: 'Services',  href: '#services' },
        { label: 'À propos',  href: '#apropos' },
        { label: 'Tarifs',    href: '#tarifs' },
        { label: 'FAQ',       href: '#faq' },
        { label: 'Contact',   href: '#contact' },
      ],
      legal: [
        { label: 'Mentions légales', href: '/mentions-legales' },
        { label: 'CGV',              href: '/cgv' },
        { label: 'RGPD',             href: '/rgpd' },
      ],
      madeBy: 'Site réalisé avec [VOTRE NOM]',
    },
    portfolio: {
      items: [
        { title: '[PROJET 1]', category: '[CATÉGORIE]' },
        { title: '[PROJET 2]', category: '[CATÉGORIE]' },
        { title: '[PROJET 3]', category: '[CATÉGORIE]' },
      ]
    },

  }, // fin content

} as const;

// ─── Re-exports nommés (compat avec les composants existants) ──────────────
export type Variant = 'A' | 'B' | 'C';

export const { business, branding, seo, design, features, pages, nav } = siteConfig;
export const variants  = siteConfig.design.variants;
export const hero         = siteConfig.content.hero;
export const services     = siteConfig.content.services;
export const about        = siteConfig.content.about;
export const testimonials = siteConfig.content.testimonials;
export const pricing      = siteConfig.content.pricing;
export const faq          = siteConfig.content.faq;
export const cta          = siteConfig.content.cta;
export const contact      = siteConfig.content.contact;
export const footer       = siteConfig.content.footer;
export const portfolio    = siteConfig.content.portfolio;

// ─── Palettes de départ (copier-coller les valeurs dans branding) ──────────
// Artisan   → primary #b8763d  primaryDark #9a6128  primarySoft #f6e7d4
// BtoB      → primary #1e3a5f  primaryDark #152b47  primarySoft #dbeafe
// Restaurant→ primary #c1440e  primaryDark #a03809  primarySoft #fde8de
// Santé     → primary #4a7c59  primaryDark #3a6347  primarySoft #dcf0e4
// ABPM      → primary #0ea5e9  primaryDark #0284c7  primarySoft #e0f2fe (Outfit)
