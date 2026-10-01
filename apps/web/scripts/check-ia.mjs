#!/usr/bin/env node
/**
 * check:ia — « Ce site ne doit pas avoir l'air fait par une IA. »
 *
 * À lancer avant toute mise en ligne d'un site tiré du template :
 *   npm run check:ia
 *
 * Bloque (code de sortie 1) :
 *   - un champ entre crochets oublié ([NOM DE L'ENTREPRISE], [X.X]…) ;
 *   - une image de remplacement encore utilisée (placeholder-*.png) ;
 *   - un emoji dans les textes ;
 *   - un tiret long (—) ou demi-cadratin (–) utilisé comme ponctuation ;
 *   - une formule creuse de la liste noire ;
 *   - des avis activés sans note ni source réelles ;
 *   - un DESIGN.md absent ou encore à remplir.
 * Avertit (sans bloquer) :
 *   - un chiffre à justifier (« 10+ », « 98 % », « 15 ans ») : est-il prouvé ?
 *
 * Aucune dépendance : Node seul. Lit src/config/site.ts comme du texte.
 */
import { readFileSync, existsSync } from 'node:fs';

const CONFIG = 'src/config/site.ts';
const DESIGN = 'DESIGN.md';

const MOTS_CREUX = [
  'transformez votre', 'transformer votre', 'boostez', 'booster votre', 'libérez',
  'votre potentiel', 'tout-en-un', 'clé en main', 'sans effort', 'en toute sérénité',
  'solution innovante', 'à la pointe', 'révolutionn', 'propulsez', "n'attendez plus",
  "n’attendez plus", 'expérience inoubliable', 'passionné', 'sur-mesure', 'de a à z',
  'qualité irréprochable', 'savoir-faire unique', 'excellence', 'leader',
];

const erreurs = [];
const avertissements = [];
const ligneDe = (texte, index) => texte.slice(0, index).split('\n').length;

if (!existsSync(CONFIG)) {
  console.error(`✗ ${CONFIG} introuvable : lancer depuis la racine du site.`);
  process.exit(1);
}

// On ne regarde que les chaînes de caractères, pas les commentaires.
const source = readFileSync(CONFIG, 'utf8');
const sansCommentaires = source
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:'"`])\/\/[^\n]*/g, (m, avant) => avant + ' '.repeat(m.length - avant.length));
const chaines = [...sansCommentaires.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)]
  .map((m) => ({ texte: m[2], ligne: ligneDe(sansCommentaires, m.index) }));

for (const { texte, ligne } of chaines) {
  const t = texte.toLowerCase();
  if (/\[[^\]]{2,}\]/.test(texte)) erreurs.push(`ligne ${ligne} : champ à remplir oublié « ${texte.slice(0, 70)} »`);
  if (/placeholder-[a-z]+\.(png|jpg|webp)/.test(texte)) erreurs.push(`ligne ${ligne} : image de remplacement « ${texte} » : photo réelle à fournir`);
  if (/\p{Extended_Pictographic}/u.test(texte)) erreurs.push(`ligne ${ligne} : emoji dans « ${texte.slice(0, 60)} » : utiliser une icône Phosphor`);
  if (/\s[—–]\s|^[—–]\s/.test(texte)) erreurs.push(`ligne ${ligne} : tiret long comme ponctuation dans « ${texte.slice(0, 60)} »`);
  for (const mot of MOTS_CREUX) if (t.includes(mot)) erreurs.push(`ligne ${ligne} : formule creuse « ${mot} » dans « ${texte.slice(0, 60)} »`);
  if (/\d+\s?\+|\d+\s?%|\b\d{2,}\s?(clients|projets|chantiers|interventions|ans)\b/i.test(texte)) {
    avertissements.push(`ligne ${ligne} : chiffre « ${texte.slice(0, 60)} » : est-il vérifiable ? Sinon, le retirer.`);
  }
}

// Avis : activés => chaque avis a une note (1 à 5) et une source réelles.
const avisActives = /testimonials:\s*true/.test(sansCommentaires);
if (avisActives) {
  const bloc = sansCommentaires.slice(sansCommentaires.indexOf('testimonials: {'));
  const notes = [...bloc.matchAll(/note:\s*([^,\n]+)/g)].map((m) => m[1].trim());
  if (notes.length === 0 || notes.some((n) => !/^[1-5](\.\d)?$/.test(n))) {
    erreurs.push('avis activés (features.testimonials) sans note réelle pour chaque avis');
  }
}

// DESIGN.md : présent et rempli.
if (!existsSync(DESIGN)) {
  erreurs.push(`${DESIGN} absent : copier DESIGN.modele.md et le remplir avec le client`);
} else if (/\[À REMPLIR[^\]]*\]/.test(readFileSync(DESIGN, 'utf8'))) {
  erreurs.push(`${DESIGN} contient encore des champs [À REMPLIR]`);
}

for (const a of avertissements) console.log(`  ⚠ ${a}`);
for (const e of erreurs) console.log(`  ✗ ${e}`);
if (erreurs.length) {
  console.log(`\n${erreurs.length} point(s) bloquant(s), ${avertissements.length} à vérifier. Site pas prêt à être mis en ligne.`);
  process.exit(1);
}
console.log(`✓ Aucun point bloquant${avertissements.length ? `, ${avertissements.length} chiffre(s) à vérifier` : ''}.`);
