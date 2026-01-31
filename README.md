# BRC Log Service

> **Brain Rot Chronicles (BRC)** : Service centralisé de gestion des logs.

Ce microservice assure la réception, le traitement et le stockage des logs de l'écosystème BRC. Il est conçu pour être performant, typé et facile à déployer via Docker.

![](./docs/images/communication-diagram.png)
*Diagramme de communication entre les services BRC et le BRC Log Service.*

## Installation et démarrage rapide

### 1. Prérequis

* **Node.js** v20+ (recommandé v22)
* **Docker & Docker Compose**
* Un fichier `.env` configuré (voir section [Configuration](#configuration))

### 2. Installation

```bash
# Installation des dépendances
npm install

# Build du projet (TypeScript -> JavaScript)
npm run build
```

### 3. Lancer l'application

| Mode              | Commande        | Description                                     |
|-------------------|-----------------|-------------------------------------------------|
| **Développement** | `npm run dev`   | Relancement automatique (hot-reload) via `tsx`. |
| **Production**    | `npm run start` | Exécute le code compilé dans `/dist`.           |

## Commandes de qualité et de tests

Nous utilisons une suite d'outils rigoureux pour maintenir la "Aura" du code :

* **Linting** : `npm run lint` (vérifie) ou `npm run lint:fix` (corrige).
* **Tests unitaires** : `npm run test` (Jest avec rapport de couverture).
* **Nettoyage** : `npm run clean` (supprime le dossier `/dist`).

## Conteneurisation

Le service est prêt à être déployé avec ses dépendances (MongoDB & RabbitMQ).

### Lancer l'infrastructure seule

Utile pour développer en local tout en ayant les bases de données prêtes :

```bash
docker compose up -d
```

### Lancer l'écosystème complet (App + DBs)

```bash
docker compose --profile app up -d
```

## Configuration

Crée un fichier `.env` à la racine. Voici les variables utilisées :

```ini
# MongoDB
MONGO_ROOT_USER=sigma_admin
MONGO_ROOT_PASS=brairot_password_2026
# URI interne pour Docker ou localhost
MONGO_URI=mongodb://sigma_admin:brairot_password_2026@localhost:27017/brc_logs?authSource=admin

# RabbitMQ
RABBIT_USER=brc_runner
RABBIT_PASS=rabbit_pass_secure
RABBIT_URL=amqp://brc_runner:rabbit_pass_secure@localhost:5672

# App
PORT=4010
NODE_ENV=development # changer par 'production' en prod
```
