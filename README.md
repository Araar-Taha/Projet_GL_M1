# Analyse des prix de l'immobilier en France

Projet realise dans le cadre du Master 1 MIAGE, UE Genie Logiciel.

## Membres du groupe

- ABOTSI Kwassi Nyuieva Junior
- ARAAR Mohamed Taha Amine
- ACHARKAOUI Sanae
- MOHAMED LEMINE Abdellahi
- SI AMEUR Abdelhakim

## Sujet

Le but du projet est de creer une application web pour explorer et analyser les prix de l'immobilier en France.

Les donnees utilisees viennent de la base publique DVF (Demandes de Valeurs Foncieres), disponible sur data.gouv.fr.

## Objectifs

- Visualiser les transactions immobilieres.
- Filtrer les donnees par annee, localisation, type de bien et surface.
- Afficher des statistiques sur les prix immobiliers.
- Voir les prix moyens au metre carre.
- Comparer deux zones geographiques.
- Afficher des graphiques et une carte.

## Fonctionnalites prevues

- Carte des prix moyens au m2.
- Filtres dynamiques.
- Graphiques d'evolution des prix.
- Tableau des transactions filtrees.
- Statistiques lors du clic sur une zone.
- Comparaison entre deux zones geographiques.

## Donnees utilisees

Les donnees principales sont :

- date de transaction ;
- valeur fonciere ;
- surface du bien ;
- type de bien ;
- commune ;
- departement ;
- region.

Ces donnees permettent de calculer le prix moyen au m2.

## Technologies

### Frontend

- React
- Vite

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL

## Structure du projet

```text
Projet_GL_M1/
├── Backend/
├── frontend/
├── package.json
└── README.md
```

## Lancer le projet

Installer les dependances :

```bash
npm install
npm run install-all
```

Lancer le frontend et le backend :

```bash
npm run dev
```

## Base de donnees

Le projet utilise une base PostgreSQL.

Il faut configurer la variable `DATABASE_URL` dans un fichier `.env` dans le dossier `Backend`.

## Tests

Les tests du backend se lancent avec :

```bash
cd Backend
npm test
```

## Source des donnees

Demandes de Valeurs Foncieres (DVF) : donnees publiques disponibles sur data.gouv.fr.
