# DVF Explorer - Projet GL M1

Bienvenue dans le projet **DVF Explorer**, une application web fullstack conçue pour l'exploration, l'analyse et la visualisation interactive des données DVF (Demande de Valeur Foncière).

Ce projet fait partie du module Génie Logiciel (M1).

##  Fonctionnalités principales

- **Visualisation cartographique** : Carte interactive intégrant des filtres géographiques (départements, communes) et temporels pour observer les mutations immobilières.
- **Tableau de bord statistique** : Graphiques interactifs (évolutions des prix, volumes des ventes, répartition par type de bien) construits avec Recharts.
- **Gestion des transactions** : Interface de saisie pour ajouter, modifier ou supprimer des mutations immobilières.
- **Authentification sécurisée** : Système complet d'inscription, de connexion et de profil utilisateur sécurisé par jetons JWT.
- **Exportation de rapports** : Téléchargement des graphiques et des données DVF sous formats PDF et CSV.

##  Architecture technique

L'application repose sur une architecture moderne découplée :

- **Frontend** :
  - **Framework** : React (avec Vite)
  - **Cartographie** : Leaflet & React-Leaflet
  - **Visualisation** : Recharts
  - **Stylisation** : CSS moderne & Design Premium
- **Backend** :
  - **Serveur** : Node.js avec Express
  - **Base de données / ORM** : Prisma avec PostgreSQL (hébergé sur Supabase)
  - **Sécurité** : JWT (JSON Web Tokens) & Bcryptjs pour le hachage des mots de passe
  - **Tests** : Suite de tests intégrés avec le test runner natif de Node.js et `supertest`

##  Installation et configuration

### 1. Prérequis

Assurez-vous d'avoir installé :
- **Node.js** (v18 ou supérieur recommandé)
- **npm** (inclus avec Node.js)

### 2. Installation des dépendances

Le projet inclut un script automatisé à la racine pour installer simultanément toutes les dépendances du frontend et du backend :

```bash
npm run install-all
```

### 3. Variables d'environnement

Configurez le fichier `.env` dans le dossier `Backend` (un exemple de configuration s'y trouve déjà connecté à la base de données Supabase) :


# demandez à un membre du projet
```env
DATABASE_URL=
PORT=5001
JWT_SECRET=
```

##  Lancement du projet

Toutes les commandes principales se lancent directement depuis la **racine du projet** :

### Lancer l'application (Frontend + Backend)

Pour lancer simultanément le serveur backend Express (sur le port 5001) et le serveur de développement frontend Vite en parallèle :

```bash
npm run dev
```

### Lancer la suite de tests

Pour lancer les tests unitaires et fonctionnels du backend et du frontend de manière concurrente :

```bash
npm test
```

##  Structure des Tests

La commande `npm test` lance en parallèle :
- **Backend** : Lancement de la suite de tests via le test runner natif de Node.js (`node --test tests/*.test.js`), vérifiant l'authentification, les services graphiques, les mutations et l'API Dashboard.
- **Frontend** : Lancement d'un script de test placeholder (prêt à accueillir vos outils de test comme Vitest ou Jest).