# LOC MNS — Front-end Angular

Application web de gestion du parc informatique et matériel de Metz Numeric School (MNS).
Développée dans le cadre de la formation Concepteur Développeur d'Applications (CDA) 2025-2026.

---

## 📋 Description du projet

LOC MNS permet de gérer l'ensemble du parc informatique et matériel mis à disposition
des étudiants, stagiaires et intervenants de MNS.

### Fonctionnalités principales
- Authentification et gestion des rôles (Gestionnaire / Emprunteur / Super Admin)
- Gestion des équipements (CRUD, états, catégories)
- Gestion des emprunts (demande, validation, refus, retour)
- Signalement d'événements (panne, dysfonctionnement, prolongation)
- Système d'alertes et notifications
- Planning des réservations
- Export des données (CSV, XML)
- Gestion documentaire (notices, fiches techniques)

---

## 🛠️ Stack technique

- Angular 
- TypeScript 
- PrimeNG 
- Node.js 
- npm 

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
