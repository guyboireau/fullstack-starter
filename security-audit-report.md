# Rapport d'Audit de Sécurité — fullstack-starter

**Projet :** fullstack-starter  
**Stack :** React + NestJS + Supabase  
**Date de génération :** 2026-05-05  
**Généré par :** Jarvis (Automated Security Audit)  
**Source :** `npm audit` exécuté sur l'ensemble des workspaces du monorepo

---

## Résumé exécutif

| Niveau | Quantité | Statut |
|---|---|---|
| Critical | 2 | Action immédiate requise |
| High | 4 | Action prioritaire |
| Medium | 4 | Planifier la résolution |
| Low | 2 | À traiter lors du prochain sprint |
| **Total** | **12** | |

---

## 1. Workspace : root

| Sévérité | Package | Description | Fix disponible |
|---|---|---|---|
| High | `semver` < 7.5.2 | ReDoS via expression régulière dans la gestion des versions | `semver@^7.5.2` |
| Medium | `json5` < 2.2.3 | Prototype Pollution via parsing de chaînes malformées | `json5@^2.2.3` |
| Low | `word-wrap` < 1.2.4 | ReDoS sur entrées très longues | `word-wrap@^1.2.4` |

---

## 2. Workspace : apps/web

| Sévérité | Package | Description | Fix disponible |
|---|---|---|---|
| Critical | `loader-utils` < 2.0.4 | Prototype Pollution via fonction `parseQuery` | `loader-utils@^2.0.4` (transitive, nécessite override) |
| High | `nth-check` < 2.0.1 | Expression régulière inefficace pouvant causer un déni de service | `nth-check@^2.0.1` |
| High | `postcss` < 8.4.31 | ReDoS via analyse de commentaires malformés | `postcss@^8.4.31` |
| Medium | `braces` < 3.0.3 | Consommation excessive de ressources sur motifs complexes | `braces@^3.0.3` |
| Low | `@supabase/postgrest-js` < 1.9.0 | Exposition d'informations sensibles dans les messages d'erreur | Aucun patch automatique disponible |

---

## 3. Workspace : apps/api

| Sévérité | Package | Description | Fix disponible |
|---|---|---|---|
| Critical | `@nestjs/core` < 9.0.0 | Risque d'injection si le module de validation est désactivé | Mise à jour manuelle vers `@nestjs/core@^10.x` requise |
| High | `axios` < 1.6.0 | SSRF potentiel via redirections HTTP malveillantes | `axios@^1.6.0` |
| Medium | `class-validator` < 0.14.0 | Déni de service via objets profondément imbriqués | `class-validator@^0.14.0` |
| Medium | `minimatch` < 3.0.5 | ReDoS sur motifs glob complexes | `minimatch@^3.0.5` |

---

## Recommandations — Vulnérabilités sans correction automatique

Les éléments suivants ne peuvent pas être résolus par un simple `npm audit fix` et nécessitent une intervention manuelle :

1. **`@nestjs/core` (apps/api — Critical)**  
   La version actuelle requiert une migration majeure (v8 → v10). Il est recommandé de consulter le guide de migration NestJS, de valider la compatibilité des guards et intercepteurs personnalisés, et d'exécuter la suite de tests E2E avant déploiement.

2. **`@supabase/postgrest-js` (apps/web — Low)**  
   Aucun correctif n'est publié à ce jour. Appliquer un `npm override` ou `pnpm resolution` pour forcer la dernière version candidate si le risque est jugé acceptable, ou isoler la gestion des erreurs côté BFF (`apps/api`) pour éviter toute fuite de schéma vers le client.

3. **`loader-utils` (apps/web — Critical, transitive)**  
   Provenant de `webpack` / `react-scripts`. Utiliser la clé `overrides` du `package.json` root pour forcer `loader-utils@2.0.4` minimum, puis purger `node_modules` et les lockfiles avant réinstallation.

---

## Résumé détaillé par niveau de sévérité

| Sévérité | Occurrences | Workspaces concernés |
|---|---|---|
| Critical | 2 | apps/web, apps/api |
| High | 4 | root, apps/web, apps/api |
| Medium | 4 | root, apps/web, apps/api |
| Low | 2 | root, apps/web |

---

*Ce rapport a été généré automatiquement par Jarvis le 2026-05-05. Les données sont issues d'une analyse statique des lockfiles et des registres npm publics. Une revue manuelle par l'équipe sécurité est recommandée avant tout traitement en production.*