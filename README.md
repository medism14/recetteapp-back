## Prérequis

- Node.js (version recommandée)
- NPM
- PostgreSQL

## Installation des dépendances:

### Assurez-vous d'abord d'installer les dépendances nécessaires

```bash
npm install
```

## Informations à mettre dans le .ENV

### Avant de lancer le serveur ou quoi que ce soit, il faut pré-remplir certaines informations que je vais mettre en bas en créant un .env

```bash
DATABASE_URL=""
NODE_ENV="DEVELOPMENT"
JWT_SECRET="recetteapp"
PORT=3001
```

## Schématisation de la base de données

### Il faut construire le schéma de la base de données en exécutant la commande ci-dessous, le schéma se trouve dans prisma/schema.prisma

```bash
npx prisma migrate dev 
```

## Serveur de développement

### Pour lancer le serveur en localhost `http://localhost:3000`:

```bash
# npm
npm run start
ou
npm run start:dev // hot-loading lors du changement de code
```

## Build de l'application

### Pour construire l'application, exécutez la commande ci-dessous:

```bash
npm run build
```

## Documentation swagger

### La documentation swagger sera accessible sur ce lien après le lancement du serveur:

```bash
localhost:3001/api
```

## Lancement des tests

### Pour lancer les tests unitaires pour chaque contrôleur et service, exécutez la commande ci-dessous:

```bash
npm run test
```

## Informations à connaître à propos de l'application

- Assurez-vous de bien lier votre backend à votre frontend et d'appliquer le port dans le frontend
- Vous disposez en général de 4 modules, chacun ayant un contrôleur et un service.
- Vous disposez aussi d'un garde d'authentification qui surveille les requêtes entrantes et sortantes et valide la validité des jetons, etc...