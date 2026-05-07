# Analyse et exploration des prix de l'immobilier en France

Application web de visualisation et d'analyse des transactions immobilieres en France a partir des donnees DVF, realisee dans le cadre de l'UE Genie Logiciel du Master 1 MIAGE.

Le projet permet d'explorer les prix moyens, les volumes de mutations et des indicateurs demographiques par zone geographique, avec une interface cartographique, des graphiques, des filtres et un classement des territoires.

## Sommaire

- [Objectifs](#objectifs)
- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Base de donnees](#base-de-donnees)
- [API principale](#api-principale)
- [Tests](#tests)
- [Equipe](#equipe)

## Objectifs

Le projet repond au besoin d'explorer des donnees immobilieres reelles issues de la base publique Demandes de Valeurs Foncieres (DVF), publiee sur data.gouv.fr.

L'application vise a :

- visualiser les transactions immobilieres par territoire ;
- filtrer les donnees par annee, type de transaction et zone geographique ;
- afficher des indicateurs locaux lors de la selection d'une zone ;
- comparer les prix moyens et volumes entre communes ou departements ;
- faciliter la comprehension des tendances du marche immobilier francais.

## Fonctionnalites

### Carte interactive

- Affichage des prix moyens et volumes par departement.
- Selection d'un departement puis consultation des communes.
- Panneau d'information avec statistiques locales.
- Filtres par periode et type de mutation.

### Graphiques et statistiques

- Evolution des prix moyens dans le temps.
- Statistiques globales et locales.
- Donnees de population et repartition par categories.
- Graphiques personnalises selon les filtres.

### Classement

- Classement des communes ou departements.
- Tri par prix moyen, population ou nombre de mutations.
- Affichage des 10 meilleurs resultats selon la metrique choisie.

### Transactions

- Liste des transactions filtrees.
- Filtrage par departement, commune, type de mutation et periode.
- Ajout de donnees foncieres pour les utilisateurs connectes.

### Authentification

- Inscription et connexion.
- Profil utilisateur.
- Modification du profil et du mot de passe.
- Protection des routes d'ajout de transaction par jeton JWT.

## Stack technique

### Frontend

- React
- Vite
- React Router
- Axios
- Leaflet et React Leaflet
- Recharts

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- Node Test Runner et Supertest

## Structure du projet

```text
Projet_GL_M1/
├── Backend/
│   ├── index.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── scripts/
│   ├── src/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── tests/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── vite.config.js
├── package.json
└── README.md
```

## Installation

### Prerequis

- Node.js
- npm
- PostgreSQL

### Installer les dependances

Depuis la racine du projet :

```bash
npm install
npm run install-all
```

La commande `install-all` installe les dependances du backend et du frontend.

## Configuration

Creer un fichier `.env` dans le dossier `Backend/` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nom_de_la_base"
JWT_SECRET="votre_secret_jwt"
PORT=5001
```

Le frontend utilise par defaut l'API suivante :

```text
http://localhost:5001/api
```

Pour modifier cette URL, creer un fichier `.env` dans `frontend/` :

```env
VITE_API_URL=http://localhost:5001/api
```

## Lancement

### Backend et frontend ensemble

Depuis la racine :

```bash
npm run dev
```

Cette commande lance :

- le backend Express sur `http://localhost:5001` ;
- le frontend Vite sur l'URL affichee dans le terminal.

### Backend uniquement

```bash
cd Backend
npm start
```

### Frontend uniquement

```bash
cd frontend
npm run dev
```

## Base de donnees

Le backend utilise Prisma avec PostgreSQL. Le schema contient notamment :

- `transaction` : transactions immobilieres agregees ;
- `localisation` : communes, codes postaux et departements ;
- `population` : donnees demographiques par annee et code postal ;
- `departement` : referentiel des departements ;
- `utilisateur` : comptes utilisateurs.

### Generer le client Prisma

```bash
cd Backend
npx prisma generate
```

### Appliquer le schema

Selon l'environnement, utiliser une migration Prisma ou pousser le schema :

```bash
cd Backend
npx prisma db push
```

### Remplir le referentiel des departements

```bash
cd Backend
node scripts/seed-departements.js
```

## Donnees DVF

Les donnees exploitees proviennent du jeu Demandes de Valeurs Foncieres. Le cahier des charges prevoit un traitement des donnees des annees 2020 a 2024 :

- nettoyage des colonnes inutiles ;
- conversion des valeurs numeriques ;
- calcul du prix moyen au metre carre ;
- aggregation par commune, departement, type de mutation et annee ;
- fusion des donnees annuelles dans un jeu exploitable par l'application.

Cette preparation permet de reduire le volume des donnees, d'accelerer les requetes et d'obtenir des statistiques lisibles pour la carte, les graphes et les comparaisons.

## API principale

Toutes les routes backend sont prefixees par `/api`.

### Authentification

| Methode | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Creation d'un compte |
| `POST` | `/auth/login` | Connexion |
| `GET` | `/auth/me` | Profil de l'utilisateur connecte |
| `PUT` | `/auth/me` | Modification du profil |
| `PUT` | `/auth/me/password` | Changement du mot de passe |
| `DELETE` | `/auth/me` | Suppression du compte |

### Territoires

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/territoires/departements` | Liste des departements |
| `GET` | `/territoires/departements/:code/communes` | Communes d'un departement |
| `GET` | `/territoires/departements/:code/commune-mapping` | Correspondance commune/code postal |

### Mutations immobilieres

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/mutations` | Transactions filtrees |
| `GET` | `/mutations/stats/:code` | Statistiques d'une zone |
| `GET` | `/mutations/prix-evolution/:code` | Evolution du prix moyen |
| `GET` | `/mutations/stats-by-dept` | Statistiques par departement |
| `GET` | `/mutations/stats-by-commune/:deptCode` | Statistiques par commune |
| `POST` | `/mutations` | Ajout d'une transaction, authentification requise |

### Population

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/population/evolution/:code` | Evolution de la population |
| `GET` | `/population/ages/:code` | Repartition par categories |
| `GET` | `/population/stats-by-dept` | Population par departement |
| `GET` | `/population/stats-by-commune/:deptCode` | Population par commune |

### Graphiques et classement

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/graphs/all` | Statistiques globales pour les graphiques |
| `GET` | `/graphs/custom` | Statistiques personnalisees |
| `GET` | `/classement` | Classement des territoires |

Exemple de classement :

```text
GET /api/classement?scale=departements&metrique=prix
```

## Tests

Les tests backend se lancent depuis le dossier `Backend/` :

```bash
cd Backend
npm test
```

Les tests couvrent notamment :

- l'authentification ;
- les transactions ;
- les statistiques fonctionnelles ;
- les services de graphiques.

## Qualite et evaluation

Le projet est prepare pour une evaluation portant sur :

- l'organisation du depot ;
- la documentation ;
- la qualite du code ;
- les tests ;
- la demonstration fonctionnelle ;
- la visite guidee du depot Git.

## Equipe

- ABOTSI Kwassi Nyuieva Junior
- ARAAR Mohamed Taha Amine
- ACHARKAOUI Sanae
- MOHAMED LEMINE Abdellahi
- SI AMEUR Abdelhakim

## Licence et source des donnees

Les donnees DVF sont des donnees publiques ouvertes disponibles via data.gouv.fr.

La licence du projet reste a definir avant publication definitive.
