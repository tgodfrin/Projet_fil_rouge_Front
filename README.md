# LOC MNS — Interface web

Application web de gestion du parc informatique et matériel de Metz Numeric School (MNS). L'interface permet aux gestionnaires d'administrer les équipements, les familles de matériel, les utilisateurs et les emprunts, et aux collaborateurs, intervenants et stagiaires de consulter le catalogue, demander des emprunts et signaler des événements.

Ce dépôt contient la partie front-end du projet fil rouge réalisé dans le cadre du titre Concepteur Développeur d'Applications (CDA), promotion 2025-2026. L'API consommée est développée dans un dépôt distinct (Spring Boot).

## Fonctionnalités

L'interface est organisée autour de deux espaces distincts.

Espace gestionnaire :

- Tableau de bord avec indicateurs, alertes et notifications.
- Gestion des équipements et de leurs caractéristiques, avec calcul de statut.
- Gestion des familles de matériel et des documents associés.
- Suivi des emprunts : validation, refus, enregistrement des retours.
- Planning des emprunts et gestion des utilisateurs.
- Export des données aux formats CSV et XML.

Espace utilisateur :

- Consultation du catalogue filtré selon les droits du profil.
- Demande d'emprunt avec vérification de disponibilité sur une période.
- Suivi de ses emprunts en cours et passés.
- Signalement d'événements (panne, retour anticipé, prolongation).

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Angular | 21 | Framework front-end |
| TypeScript | 5.9 | Langage |
| RxJS | 7.8 | Programmation réactive |
| SCSS | gérée par Angular | Mise en forme, sans bibliothèque de composants externe |
| Angular Signals | gérée par Angular | Gestion d'état réactive |
| Vitest | 4 | Tests unitaires |
| Node.js | 20 | Environnement d'exécution pour la construction |
| nginx | alpine | Service des fichiers statiques et reverse-proxy en production |

L'interface est entièrement réalisée en composants autonomes (standalone) et en SCSS, sans bibliothèque de composants tierce.

## Architecture du projet

L'arborescence sépare le socle technique, les pages et les éléments partagés :

```
src/app
  core
    models         Modèles TypeScript alignés sur l'API
    services       Services HTTP, un par ressource, et service d'authentification
    guards         Contrôle d'accès aux routes
    interceptors   Injection du jeton et gestion des erreurs
    utils          Fonctions utilitaires
  pages
    login          Page de connexion
    gestionnaire   Espace gestionnaire (tableau de bord, équipements, emprunts, planning, utilisateurs)
    utilisateur    Espace utilisateur (accueil, catalogue, demandes, profil)
    mentions       Pages d'information
  shared           Composants réutilisables

src/environments   Configuration par environnement (développement et production)
```

L'authentification repose sur un jeton JWT conservé côté client. Un intercepteur ajoute l'en-tête d'autorisation à chaque requête, et des gardes de route protègent les espaces selon le rôle de l'utilisateur connecté.

## Prérequis

- Node.js 20 et npm.
- Une instance de l'API back-end accessible (voir le dépôt back).

## Configuration

L'adresse de l'API est centralisée dans les fichiers d'environnement. Aucune URL n'est codée en dur dans les services.

| Fichier | Valeur de `apiUrl` | Usage |
|---|---|---|
| `src/environments/environment.ts` | http://localhost:8080/api | Développement |
| `src/environments/environment.prod.ts` | /api | Production |

En production la valeur est relative : les appels visent `/api`, que nginx redirige vers le back-end. Le remplacement du fichier de développement par celui de production est automatique lors de la construction en mode production, par la configuration `fileReplacements` de `angular.json`.

## Lancement en développement

Installer les dépendances :

```bash
npm install
```

Démarrer le serveur de développement :

```bash
npm start
```

L'interface est disponible sur `http://localhost:4200`. Le back-end doit être démarré en parallèle et accessible sur `http://localhost:8080/api`.

## Construction pour la production

```bash
npm run build
```

Les fichiers compilés sont produits dans `dist/loc-mns-front/browser`. La construction en mode production applique automatiquement le fichier d'environnement de production.

## Exécution avec Docker

Le `Dockerfile` décrit une construction en deux étapes : compilation de l'application avec Node, puis service des fichiers statiques par nginx. La configuration `nginx.conf` assure la redirection des routes de l'application vers `index.html` et le relais des appels `/api` vers le back-end.

Construire l'image :

```bash
docker build -t locmns-front .
```

L'image écoute sur le port 80. En production, ce conteneur est orchestré avec le back-end et la base de données par le fichier `docker-compose.prod.yml` situé dans le dépôt back.

## Tests

```bash
npm test
```

Les tests unitaires sont exécutés par Vitest et couvrent notamment les services, les gardes et la logique d'affichage des composants.

## Stratégie de gestion de versions

Le projet suit un modèle à trois niveaux de branches :

- `main` : version stable et validée.
- `develop` : branche d'intégration du travail courant.
- `feature/*` : une branche par fonctionnalité, fusionnée dans `develop` après revue.

Les messages de commit suivent la convention Conventional Commits.

## Auteur

GODFRIN Thomas, formation Concepteur Développeur d'Applications, Metz Numeric School, promotion 2025-2026.
