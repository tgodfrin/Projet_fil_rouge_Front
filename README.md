# LOC MNS — Front-end Angular

Application web de gestion du parc informatique et matériel de Metz Numeric School (MNS).
Développée dans le cadre de la formation Concepteur Développeur d'Applications (CDA) 2025-2026.

---

## 📋 Description du projet

LOC MNS permet de gérer l'ensemble du parc informatique et matériel mis à disposition
des étudiants, stagiaires et intervenants de MNS.

### Fonctionnalités principales
- Authentification JWT et gestion des rôles (Gestionnaire, Collaborateur, Intervenant, Stagiaire)
- Gestion des équipements (CRUD, états, catégories)
- Gestion des catégories de matériel et des droits d'emprunt par rôle
- Gestion des emprunts (demande, validation, refus, retour, emprunts groupés)
- Signalement d'événements (panne, retour anticipé, prolongation)
- Système d'alertes et notifications
- Planning des réservations
- Export des données (CSV, XML)
- Gestion documentaire (notices, fiches techniques)
- Page « Mentions & données personnelles » (RGPD)

---

## 🛠️ Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Angular | 21 (standalone components + signals) | Framework front-end |
| TypeScript | 5.9 | Langage |
| RxJS | 7.8 | Programmation réactive (HTTP, observables) |
| Node.js | 20+ LTS | Environnement d'exécution |
| npm | 11 | Gestionnaire de paquets |

> Pas de librairie de composants UI tierce : l'interface est construite en HTML/SCSS sur mesure.

---

## ⚙️ Prérequis

- Node.js v20+ LTS
- npm
- Angular CLI : `npm install -g @angular/cli`

---

## 🚀 Installation et lancement
```bash
# Cloner le dépôt
git clone https://github.com/tgodfrin/Projet_fil_rouge_Front.git

# Aller dans le dossier
cd Projet_fil_rouge_Front/loc-mns-front

# Installer les dépendances
npm install

# Lancer le serveur de développement
ng serve
```

Accéder à l'application : **http://localhost:4200**

---

## 🌿 Stratégie Git
```
main                        → version stable et validée
  └── develop               → branche de travail principal
        ├── feature/login
        ├── feature/equipment
        └── feature/loan
```

---

## 🔗 Liens utiles

- Back-end Spring Boot : [lien vers le dépôt back]
- Maquettes Figma : [lien vers Figma]
- Tableau Trello : [lien vers Trello]

---

## 👤 Auteur

GODFRIN Thomas — Formation CDA — Metz Numeric School 2025-2026
