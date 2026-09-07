-- =============================================
-- Seed : site de démonstration
-- =============================================
-- Entreprise fictive. Sert à vérifier que la mise en page tient avec des
-- volumes de texte réalistes — un contenu « lorem » ne le montrerait pas.
-- Idempotent : rejouable sans erreur.

INSERT INTO public.sites (id, slug, domain, name, tagline, theme, phone, email, address, seo, contact_to)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'demo',
  'localhost',
  'Atelier Roussel',
  'Mécanique de précision depuis 1978',
  'default',
  '04 00 00 00 00',
  'contact@atelier-roussel.test',
  '{"street":"12 rue des Forges","postalCode":"63000","city":"Clermont-Ferrand","country":"FR"}'::jsonb,
  '{"defaultDescription":"Atelier Roussel usine vos pièces mécaniques sur mesure : tournage, fraisage, rectification et assemblage, en petites et moyennes séries."}'::jsonb,
  'contact@atelier-roussel.test'
) ON CONFLICT (id) DO NOTHING;

-- ── Sections de page ────────────────────────────────────────────────────────
INSERT INTO public.page_sections (site_id, page, key, position, data) VALUES
('11111111-1111-4111-8111-111111111111','home','hero',0,'{
  "eyebrow":"Usinage sur mesure",
  "h1":"La pièce juste, du premier coup",
  "subtitle":"Nous usinons vos pièces mécaniques en petites et moyennes séries, du prototype unitaire à la série de mille. Contrôle dimensionnel systématique, délais tenus.",
  "image":"/assets/images/placeholder-hero.png",
  "cta1":{"label":"Demander un devis","href":"/contact"},
  "cta2":{"label":"Nos services","href":"/services"},
  "trust":["Contrôle 3D sur chaque série","Devis sous 48 h","Petites séries acceptées"],
  "badge":{"label":"Expérience","value":"45 ans","sub":"au service de l''industrie"},
  "infoCard":{"status":"Atelier ouvert","hours":"Lun–Ven · 7h30–17h","location":"Clermont-Ferrand (63)"}
}'::jsonb),
('11111111-1111-4111-8111-111111111111','home','services',1,'{
  "eyebrow":"— Nos prestations",
  "title":"Quatre métiers, un seul interlocuteur",
  "subtitle":"Du plan à la pièce contrôlée, tout est réalisé dans nos ateliers."
}'::jsonb),
('11111111-1111-4111-8111-111111111111','home','about',2,'{
  "eyebrow":"— À propos",
  "title":"Un atelier familial, trois générations",
  "text":[
    "Fondé en 1978, l''Atelier Roussel usine des pièces mécaniques pour l''agroalimentaire, les travaux publics et la machine spéciale. Trois générations se sont succédé sans que la règle change : une pièce livrée est une pièce contrôlée.",
    "Notre parc combine des machines à commande numérique récentes et des tours conventionnels que nous gardons pour les pièces unitaires et les reprises urgentes. C''est cette double compétence qui nous permet d''accepter des séries que d''autres refusent."
  ],
  "stats":[
    {"value":"45","label":"ans d''expérience"},
    {"value":"600+","label":"clients accompagnés"},
    {"value":"48h","label":"délai de devis"}
  ],
  "cta":{"label":"Nous contacter","href":"/contact"},
  "image":"/assets/images/placeholder-about.png",
  "author":{"name":"Claire Roussel","role":"Directrice","image":"/assets/images/placeholder-portrait.png"}
}'::jsonb),
('11111111-1111-4111-8111-111111111111','home','testimonials',3,'{
  "eyebrow":"— Témoignages",
  "title":"Ce que disent nos clients",
  "ratingStr":"4.8 / 5 · 37 avis clients"
}'::jsonb),
('11111111-1111-4111-8111-111111111111','home','cta',4,'{
  "eyebrow":"Un projet ?",
  "title":"Envoyez-nous votre plan",
  "subtitle":"Un plan, un croquis ou une pièce à copier suffisent. Nous revenons vers vous sous 48 heures avec un devis chiffré.",
  "cta1":{"label":"Nous contacter","href":"/contact"},
  "cta2":{"label":"Voir nos réalisations","href":"/realisation"}
}'::jsonb),
('11111111-1111-4111-8111-111111111111','home','contact',5,'{
  "eyebrow":"— Contact",
  "title":"Parlons de votre pièce",
  "subtitle":"Décrivez votre besoin en quelques lignes. Si vous disposez d''un plan, joignez-le lors de notre échange.",
  "successMessage":"Message bien reçu — nous vous répondons sous 48 heures."
}'::jsonb),
('11111111-1111-4111-8111-111111111111','home','footer',6,'{
  "description":"Atelier Roussel — usinage de précision, mécano-soudure et assemblage en petites et moyennes séries."
}'::jsonb),
('11111111-1111-4111-8111-111111111111','about','intro',0,'{
  "eyebrow":"— Notre histoire",
  "title":"Trois générations dans le même atelier",
  "text":[
    "Ce que Pierre Roussel a démarré en 1978 avec deux tours et une fraiseuse occupe aujourd''hui 1 400 m² et vingt-deux personnes. La progression s''est faite sans à-coups, machine après machine, en réinvestissant.",
    "Nous travaillons pour des donneurs d''ordre qui ont besoin d''une pièce précise dans un délai court, pas d''un catalogue. C''est ce qui explique que nous acceptions encore l''unitaire."
  ]
}'::jsonb)
ON CONFLICT (site_id, page, key) DO NOTHING;

-- ── Services ────────────────────────────────────────────────────────────────
INSERT INTO public.services (site_id, legacy_id, slug, title, excerpt, body, icon, position) VALUES
('11111111-1111-4111-8111-111111111111',1,'tournage-cn','Tournage CN',
 'Pièces de révolution jusqu''à 400 mm de diamètre, en série ou à l''unité.',
 E'Nos tours à commande numérique usinent l''acier, l''inox, l''aluminium et les plastiques techniques.\n\n- Diamètre maximum : 400 mm\n- Longueur entre pointes : 1 200 mm\n- Tolérances courantes : IT7, IT6 sur demande\n- Reprise en Y et axe C\n\nLes pièces unitaires restent réalisées sur nos tours conventionnels, souvent plus rapides à mettre en œuvre pour une seule pièce.','star',0),
('11111111-1111-4111-8111-111111111111',2,'fraisage-5-axes','Fraisage 5 axes',
 'Formes complexes et pièces prismatiques en une seule prise.',
 E'Le fraisage simultané sur cinq axes supprime les reprises et les erreurs de repositionnement qu''elles entraînent.\n\n- Courses : 800 × 600 × 500 mm\n- Matières : acier, inox, aluminium, titane\n- Programmation FAO à partir de vos fichiers STEP ou IGES\n\nNous acceptons également les plans papier, que notre bureau d''études remet au format numérique.','check',1),
('11111111-1111-4111-8111-111111111111',3,'rectification','Rectification',
 'Reprise en finition pour les états de surface exigeants.',
 E'La rectification cylindrique et plane permet d''atteindre les états de surface et les tolérances que l''usinage seul ne donne pas.\n\n- Rectification cylindrique : diamètre 300 mm, longueur 1 000 mm\n- Rectification plane : 600 × 300 mm\n- État de surface courant : Ra 0,4\n\nCette opération intervient le plus souvent après traitement thermique.','shield',2),
('11111111-1111-4111-8111-111111111111',4,'assemblage','Assemblage et sous-ensembles',
 'Livraison de sous-ensembles montés et contrôlés, prêts à intégrer.',
 E'Plutôt que de recevoir des pièces détachées, vous recevez un sous-ensemble monté, contrôlé et documenté.\n\n- Montage mécanique et hydraulique\n- Contrôle dimensionnel avant expédition\n- Rapport de contrôle joint à la livraison\n\nCette prestation réduit vos opérations de réception et vos ruptures de série.','star',3)
ON CONFLICT (site_id, legacy_id) DO NOTHING;

-- ── Réalisations ────────────────────────────────────────────────────────────
INSERT INTO public.achievements (site_id, legacy_id, slug, title, subtitle, body, service_id, realized_at, position)
SELECT '11111111-1111-4111-8111-111111111111', v.legacy_id, v.slug, v.title, v.subtitle, v.body,
       (SELECT id FROM public.services s WHERE s.site_id='11111111-1111-4111-8111-111111111111' AND s.slug=v.service_slug),
       v.realized_at, v.position
FROM (VALUES
  (1,'arbre-cannele-inox','Arbre cannelé inox','Série de 240 pièces pour convoyeur agroalimentaire',
   'Arbre cannelé en inox 316L, usiné en tournage puis rectifié après traitement. La difficulté tenait à la concentricité demandée entre portée de roulement et cannelures, tenue à 0,01 mm sur toute la série.',
   'tournage-cn','2026-03-14'::date,0),
  (5,'carter-pompe-alu','Carter de pompe aluminium','Prototype puis présérie de 30 pièces',
   'Carter usiné en cinq axes dans la masse, à partir d''un fichier STEP fourni par le bureau d''études du client. Le passage du prototype à la présérie n''a demandé aucune reprise de programme.',
   'fraisage-5-axes','2026-05-02'::date,1),
  (7,'sous-ensemble-verin','Sous-ensemble de vérin','Montage et contrôle avant livraison',
   'Fabrication des composants, montage du sous-ensemble et contrôle sous pression. Le client reçoit un ensemble prêt à intégrer, accompagné de son rapport de contrôle.',
   'assemblage','2026-06-20'::date,2),
  (9,'portee-roulement','Reprise de portées de roulement','Rectification après traitement thermique',
   'Reprise en rectification cylindrique de portées de roulement déformées par le traitement. Retour dans les tolérances d''origine sans refabrication.',
   'rectification','2026-07-08'::date,3)
) AS v(legacy_id, slug, title, subtitle, body, service_slug, realized_at, position)
ON CONFLICT (site_id, legacy_id) DO NOTHING;

-- ── Actualités ──────────────────────────────────────────────────────────────
INSERT INTO public.news (site_id, legacy_id, slug, title, excerpt, body, published, published_at) VALUES
('11111111-1111-4111-8111-111111111111',1,'nouveau-centre-5-axes','Un nouveau centre 5 axes dans l''atelier',
 'La machine est en production depuis le mois dernier et double notre capacité en fraisage complexe.',
 E'Le centre d''usinage cinq axes installé en juillet est en production depuis le mois dernier.\n\nIl nous permet d''accepter des pièces prismatiques complexes que nous devions jusqu''ici sous-traiter, et de réduire les délais sur les séries en cours.\n\nLes premiers retours clients portent surtout sur la régularité des états de surface d''une pièce à l''autre.',
 TRUE, '2026-08-12 09:00:00+02'),
('11111111-1111-4111-8111-111111111111',2,'salons-automne','Où nous rencontrer cet automne',
 'Deux salons professionnels, deux occasions de venir parler de vos pièces.',
 E'Nous serons présents sur deux salons cet automne.\n\n**Sepem Industries — Toulouse**\nDu 22 au 24 septembre, stand F54.\n\n**Salon de la sous-traitance — Lyon**\nDu 6 au 8 novembre, numéro de stand à venir.\n\nApportez vos plans : nous chiffrons sur place quand c''est possible.',
 TRUE, '2026-08-28 10:30:00+02')
ON CONFLICT (site_id, legacy_id) DO NOTHING;

-- ── Témoignages ─────────────────────────────────────────────────────────────
INSERT INTO public.testimonials (site_id, author, company, quote, rating, position) VALUES
('11111111-1111-4111-8111-111111111111','Marc Delaunay','Bureau d''études Verdier',
 'Nous leur avons confié une pièce que deux ateliers avaient refusée. Devis en deux jours, pièce conforme au premier essai.',4.9,0),
('11111111-1111-4111-8111-111111111111','Sophie Nguyen','Groupe Tersac',
 'Ce qui nous a décidés, c''est le rapport de contrôle joint à chaque livraison. Nous avons supprimé notre propre contrôle réception.',4.8,1),
('11111111-1111-4111-8111-111111111111','Antoine Berger','Maintenance Industrielle du Centre',
 'Une reprise urgente un vendredi soir, la pièce était prête le mardi. C''est ce genre de service qui fait la différence.',5.0,2)
ON CONFLICT DO NOTHING;
