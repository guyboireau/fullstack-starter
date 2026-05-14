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
    name:     'Cabinet Aubry',
    tagline:  'Avocat·e en droit des affaires',
    industry: 'juridique',          // utilisé pour schema.org + choix de contenu IA
    phone:    '+33 6 12 34 56 78',
    email:    'contact@cabinet-aubry.fr',
    address: {
      street:     '12 rue Mercière',
      city:       'Lyon',
      postalCode: '69002',
      country:    'FR',
    },
    openingHours: {
      monday:    '09:00-18:00',
      tuesday:   '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday:  '09:00-18:00',
      friday:    '09:00-17:00',
      saturday:  null,
      sunday:    null,
    },
    socialLinks: {
      linkedin:  'https://linkedin.com',
      instagram: '',
      facebook:  '',
      twitter:   '',
    },
    siret:        '123 456 789 00012',
    availability: 'Disponible — répond sous 24h',
  },

  // ── 2. BRANDING ────────────────────────────────────────────────────────────
  // Couleurs directes (pas de preset — copiez depuis les palettes ci-dessous)
  branding: {
    primaryColor:    '#b8763d',   // couleur brand principale (boutons, accents)
    primaryDark:     '#9a6128',   // hover/darken du primary
    primarySoft:     '#f6e7d4',   // bg très doux (badges, chips)
    secondaryColor:  '#1a1916',   // ink / texte principal
    accentColor:     '#c44a1e',   // accent sparingly (warning, highlight)
    fontHeading:     'Geist',     // police titres  → Google Fonts name
    fontBody:        'Geist',     // police corps   → Google Fonts name
    fontMono:        'Geist Mono',
    logoPath:        '/assets/logo.svg',  // chemin depuis /public
    faviconPath:     '/favicon.svg',
  },

  // ── 3. SEO ─────────────────────────────────────────────────────────────────
  seo: {
    titleTemplate:      '%s | Cabinet Aubry — Lyon',
    defaultTitle:       'Cabinet Aubry — Avocat en droit des affaires · Lyon',
    defaultDescription: 'Cabinet d\'avocat spécialisé en droit des affaires pour entrepreneurs et TPE depuis 2012. Contrats, création d\'entreprise, contentieux.',
    keywords: [
      'avocat droit des affaires lyon',
      'avocat entreprise lyon',
      'cabinet juridique lyon',
      'création entreprise avocat',
    ],
    googleBusinessUrl:   '',   // URL du profil Google Business
    googleAnalyticsId:   '',   // G-XXXXXXXXXX
    googleSearchConsole: '',   // meta verification tag (content="...")
    bingWebmasterKey:    '',   // Bing Webmaster Tools verification key
    plausibleDomain:     '',   // ex: cabinet-aubry.fr (Plausible Analytics)
    sentryDsn:           '',   // Sentry DSN (https://xxx@sentry.io/yyy)
    locale:              'fr_FR',
    siteUrl:             'https://cabinet-aubry.fr',
    ogImage:             '/assets/og-image.jpg',
  },

  // ── 4. DESIGN VARIANTS ─────────────────────────────────────────────────────
  // 'A' = Safe / Classique  |  'B' = Clean / Vercel  |  'C' = Audacieux
  design: {
    isSketchy: true,      // true = style "main levée" (filtres SVG)
    variants: {
      header:       'B',  // A=nav-centrée | B=inline Vercel | C=identité forte + Menu
      hero:         'B',  // A=centré      | B=asymétrique   | C=full-bleed éditorial
      services:     'A',  // A=grille 3col | B=liste numéros | C=split sticky
      about:        'A',  // A=2-col img   | B=stats édito
      testimonials: 'A',  // A=3 cards     | B=citation pleine page | C=mur compact
      pricing:      'A',  // A=3 plans     | B=tableau comparatif
      faq:          'A',  // A=accordéon   | B=2 colonnes Q&R
      cta:          'A',  // A=fond encré  | B=inline minimal
      footer:       'A',  // A=4 colonnes  | B=logo+minimal  | C=éditoriale
    },
  },

  // ── 5. PAGES (multipage — ignoré en landing 1 page) ───────────────────────
  pages: {
    home: {
      slug:        '/',
      title:       'Accueil',
      description: 'Cabinet d\'avocat en droit des affaires à Lyon.',
    },
    services: {
      slug:        '/services',
      title:       'Nos services',
      description: 'Contrats, création d\'entreprise, contentieux.',
    },
    about: {
      slug:        '/a-propos',
      title:       'À propos',
      description: 'Le Cabinet Aubry : 12 ans d\'expertise au service des entrepreneurs.',
    },
    blog: {
      slug:        '/blog',
      title:       'Blog',
      description: 'Conseils juridiques pour entrepreneurs.',
    },
    realisations: {
      slug:        '/realisations',
      title:       'Réalisations',
      description: 'Découvrez nos derniers projets et chantiers.',
    },
    contact: {
      slug:        '/contact',
      title:       'Contact',
      description: 'Prenez rendez-vous avec le Cabinet Aubry.',
    },
  },

  // ── 6. FEATURES ────────────────────────────────────────────────────────────
  features: {
    blog:          false,   // true = section + page /blog
    booking:       false,   // true = intégration Cal.com / Calendly
    multilingual:  false,   // true = i18n fr/en
    pricing:       true,    // true = section tarifs visible
    testimonials:  true,    // true = section témoignages visible
    newsletter:    false,   // true = champ email dans footer
    cookieBanner:  true,    // true = bandeau RGPD
    analytics:     false,   // true = inject GA (seo.googleAnalyticsId requis)
    plausible:     false,   // true = inject Plausible (seo.plausibleDomain requis)
    sentry:        false,   // true = inject Sentry (seo.sentryDsn requis)
  },

  // ── 7. CONTENT ─────────────────────────────────────────────────────────────
  content: {

    hero: {
      eyebrow:  'Avocat en droit des affaires · Lyon',
      h1:       'Votre partenaire juridique pour développer sereinement',
      subtitle: 'Contrats, contentieux, création d\'entreprise : un accompagnement clair, humain et efficace pour les TPE et PME.',
      image:    '/assets/images/hero.png',
      cta1:     { label: 'Prendre rendez-vous', href: '#contact' },
      cta2:     { label: 'Nos honoraires →',    href: '#tarifs' },
      trust:    ['12 ans d\'expérience', '180+ clients accompagnés', 'Réponse sous 24h'],
      badge:    { label: 'Note Google', value: '4.9 / 5', sub: '47 avis vérifiés' },
      infoCard: { status: 'Disponible', hours: 'Lun–Ven · 9h–18h', location: '12 rue Mercière, Lyon' },
    },

    services: {
      eyebrow:  '— Nos prestations',
      title:    'Un accompagnement sur-mesure à chaque étape',
      subtitle: 'Que vous créiez votre activité ou traversiez un contentieux, nous vous guidons avec précision.',
      items: [
        {
          icon:  'scale',
          title: 'Droit des contrats',
          text:  'Rédaction, relecture et négociation de vos contrats commerciaux, CGV, baux professionnels.',
          link:  'En savoir plus →',
          tag:   '4–6 sem',
          features: ['Audit de contrats', 'Rédaction CGV', 'Négociations B2B'],
        },
        {
          icon:  'building',
          title: 'Création d\'entreprise',
          text:  'Choix de la forme juridique, rédaction des statuts, accompagnement au lancement.',
          link:  'En savoir plus →',
          tag:   '2–3 sem',
          features: ['Statuts sur mesure', 'Pacte d\'associés', 'Formalités greffe'],
        },
        {
          icon:  'shield',
          title: 'Contentieux & litiges',
          text:  'Défense de vos intérêts en cas de conflit commercial, recouvrement de créances, procédures.',
          link:  'En savoir plus →',
          tag:   'Sur devis',
          features: ['Recouvrement', 'Défense tribunal', 'Médiation'],
        },
      ],
    },

    about: {
      eyebrow: '— À propos',
      title:   'Un cabinet à taille humaine, à votre service',
      text: [
        'Fondé il y a 12 ans, le Cabinet Aubry accompagne les entrepreneurs et dirigeants de TPE dans tous leurs besoins juridiques quotidiens.',
        'Notre approche : être un partenaire de confiance, pas un prestataire ponctuel. Nous prenons le temps de comprendre votre activité pour vous donner les bons conseils au bon moment.',
      ],
      stats: [
        { value: '12',   label: 'ans d\'expérience' },
        { value: '180+', label: 'projets livrés' },
        { value: '4.9',  label: 'note moyenne' },
      ],
      cta:    { label: 'Notre méthode →', href: '#contact' },
      image:  '/assets/images/team.png',
      author: { name: 'Sophie Aubry', role: 'Avocate associée', image: '/assets/images/portrait.png' },
    },

    testimonials: {
      eyebrow:   '— Témoignages',
      title:     'Ils nous font confiance',
      ratingStr: '4.9 / 5 · 47 avis Google',
      items: [
        {
          quote:   'Le Cabinet Aubry nous a accompagnés dès la création de notre SAS. Sophie a su expliquer les choses simplement et nous a évité plusieurs erreurs coûteuses.',
          name:    'Marie L.',
          role:    'Restauratrice · Lyon 2e',
          initial: 'M',
        },
        {
          quote:   'Réactif, clair dans ses conseils et disponible en cas d\'urgence. Je recommande à tous les artisans qui ont besoin d\'un soutien juridique fiable.',
          name:    'Paul R.',
          role:    'Plombier · Villeurbanne',
          initial: 'P',
        },
        {
          quote:   'Nous avons géré plusieurs contentieux fournisseurs avec leur aide. Résultats rapides et communication impeccable tout au long de la procédure.',
          name:    'Inès K.',
          role:    'Directrice générale · Cabinet conseil',
          initial: 'I',
        },
      ],
    },

    pricing: {
      eyebrow:  '— Honoraires',
      title:    'Des formules transparentes',
      subtitle: 'Pas de surprise : nos honoraires sont définis en amont selon la nature de la mission.',
      plans: [
        {
          name:      'Consultation',
          price:     '180',
          unit:      '/ heure',
          desc:      'Analyse de votre situation, conseils pratiques, réponses à vos questions urgentes.',
          features:   ['Rendez-vous 1h en cabinet ou visio', 'Compte-rendu écrit inclus', 'Sans engagement'],
          cta:        'Réserver',
          highlight:  false,
          stripeLink: '',   // lien de paiement Stripe (https://buy.stripe.com/...)
        },
        {
          name:       'Mission ponctuelle',
          price:      'Sur devis',
          unit:       '',
          desc:       'Rédaction de contrats, statuts, CGV, ou gestion d\'un dossier contentieux spécifique.',
          features:   ['Devis fixe remis avant démarrage', 'Délai garanti contractuellement', 'Suivi dédié'],
          cta:        'Demander un devis',
          highlight:  true,
          stripeLink: '',
        },
        {
          name:       'Suivi annuel',
          price:      '290',
          unit:       '/ mois',
          desc:       'Accompagnement récurrent pour les entreprises qui veulent un partenaire juridique de fond.',
          features:   ['4h de conseil / mois incluses', 'Réponses sous 24h', 'Revue trimestrielle des risques'],
          cta:        'En savoir plus',
          highlight:  false,
          stripeLink: '',   // lien Stripe Billing (abonnement mensuel)
        },
      ],
    },

    faq: {
      eyebrow: '— Questions fréquentes',
      title:   'Tout ce que vous voulez savoir',
      items: [
        { q: 'Comment se déroule le premier rendez-vous ?',        a: 'Le premier rendez-vous dure 1h. Nous analysons votre situation, répondons à vos questions et vous remettons un compte-rendu écrit. Ce rendez-vous est facturé au tarif horaire standard.' },
        { q: 'Intervenez-vous pour des entreprises hors de Lyon ?', a: 'Oui. Nous intervenons sur toute la France. Les consultations peuvent se faire en visioconférence et les missions à distance sont notre quotidien.' },
        { q: 'Quel est votre délai de réponse habituel ?',          a: 'Nous nous engageons à répondre à toute demande sous 24h ouvrées. En cas d\'urgence, merci de le préciser dans votre message.' },
        { q: 'Proposez-vous des forfaits pour les startups ?',      a: 'Oui, nous avons des formules adaptées aux startups en phase d\'amorçage. Contactez-nous pour en discuter.' },
        { q: 'Comment sont fixés vos honoraires ?',                 a: 'Avant chaque mission, nous vous remettons une convention d\'honoraires détaillant les montants et les modalités. Aucune surprise en cours de route.' },
      ],
    },

    cta: {
      eyebrow:  'Passons à l\'action',
      title:    'Prêt à sécuriser votre activité ?',
      subtitle: 'Prenez rendez-vous en ligne. Premier échange sous 24h.',
      cta1:     { label: 'Prendre rendez-vous', href: '#contact' },
      cta2:     { label: 'Voir les honoraires',  href: '#tarifs' },
    },

    contact: {
      eyebrow:        '— Contact',
      title:          'Parlons de votre projet',
      subtitle:       'Décrivez votre situation en quelques mots. Nous vous répondons sous 24h.',
      successMessage: 'Message bien reçu — nous vous répondons sous 24h.',
    },

    footer: {
      description: 'Cabinet d\'avocat spécialisé en droit des affaires pour entrepreneurs et TPE depuis 2012.',
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
      madeBy: 'Site conçu et réalisé à Lyon',
    },
    portfolio: {
      items: [
        { title: 'Rénovation Loft', category: 'Résidentiel' },
        { title: 'Bureaux Tech', category: 'Tertiaire' },
        { title: 'Restaurant bistronomique', category: 'Commerce' },
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
