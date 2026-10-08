# DESIGN.md · [À REMPLIR : nom du site]

> Copier ce fichier en `DESIGN.md` au début de chaque site client, le remplir
> avec le client, puis le respecter partout. `npm run check:ia` refuse la mise
> en ligne tant qu'il reste un champ [À REMPLIR].

## Direction

- En une phrase : [À REMPLIR : par exemple « un atelier d'artisan, chaleureux et
  précis, qui montre son travail plutôt que d'en parler »].
- Références retenues : [À REMPLIR : 2 ou 3 sites, et ce qu'on en garde].
- Variante du template : [À REMPLIR : A à H], mode sketchy : [À REMPLIR : oui / non].

## Couleurs

Dans `siteConfig.branding`. Vérifier chaque contraste (4,5:1 minimum pour le texte).

| Rôle | Hex | Usage |
|------|-----|-------|
| Principale | [À REMPLIR] | Boutons, liens |
| Accent | [À REMPLIR] | Un seul usage précis |
| Neutres | [À REMPLIR] | Fond, texte, lignes |

Aucun dégradé décoratif. Pas de violet, bleu ou rose « par défaut ».

## Typographie

Deux polices au maximum : [À REMPLIR : titres] et [À REMPLIR : texte].
Aucun texte sous 13 px.

## Formes

Un seul rayon d'arrondi : [À REMPLIR : par exemple 8 px]. Pas de pilule par
défaut. Un bouton principal, un bouton secondaire.

## Icônes

Phosphor uniquement (`ph ph-<nom>`), un seul style. Aucun emoji.

## Images

Uniquement de vraies photos du client : lieu, travail, équipe, réalisations.
Aucune photo générée par IA ni de banque d'images avec des personnes qui ne
sont pas l'équipe. Photos à prendre : [À REMPLIR].

## Preuves

- Avis : recopiés mot pour mot, avec note et source datée (avis Google, message).
- Chiffres : seulement s'ils sont vérifiables (chiffre d'affaires, nombre
  d'interventions comptées, ancienneté réelle).
- Certifications et logos de clients : seulement avec justificatif ou accord.
Preuves confirmées pour ce client : [À REMPLIR].

## Mouvement

Apparition douce et retour au survol. Rien d'autre : pas de parallaxe, de
curseur personnalisé, d'éléments qui flottent ou de zoom au survol. Respect de
`prefers-reduced-motion`.

## Ton des textes

- Tutoiement ou vouvoiement : [À REMPLIR].
- « Je » ou « nous » : [À REMPLIR : « je » si la personne travaille seule].
- Phrases courtes, aucun tiret long (—), aucune formule creuse (« transformez
  votre », « clé en main », « sans effort », « passionné »…).
- Le titre principal dit ce que fait le client, pour qui, et où, en 3 secondes.
