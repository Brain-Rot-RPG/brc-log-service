# Documentation CI/CD : BRC Log Service

## 1. Vision générale

L'objectif de cette infrastructure est d'assurer une **qualité de code constante** et une **livraison automatisée** sans intervention humaine. Chaque modification du code source déclenche une série de vérifications rigoureuses avant de produire un artéfact (image Docker) prêt pour la production.

## 2. Git Flow

Le projet utilise une stratégie de branches structurée pour isoler le développement de la production :

| Branche   | Rôle                                                   | Politique de Merging                               |
|-----------|--------------------------------------------------------|----------------------------------------------------|
| `main`    | **Production**. Code stable et tagué.                  | Uniquement via Pull Request (PR) depuis `develop`. |
| `develop` | **Intégration**. Fusion des nouvelles fonctionnalités. | PR requise. Tests et Lint doivent être au vert.    |
| `feat/*`  | **Développement**. Nouvelles fonctionnalités.          | Travail local, puis push vers `develop`.           |

## 3. Pipeline

Le fichier de workflow `.github/workflows/pipeline.yml` orchestre l'ensemble du cycle de vie.

### Phase 1 : Continuous Integration (CI) - `test-and-build`

Cette étape s'exécute sur **chaque commit** et chaque **Pull Request**. C'est le "Quality Gate".

1. **Environment Setup** : Initialisation de Node.js 22 (Alpine) et mise en cache des dépendances `npm`.
2. **Linting (ESLint 9)** : Vérification de la conformité syntaxique et du respect des règles de style (4 espaces, pas de `any`, pas de `console.log`).
3. **Automated Testing (Jest)** : Exécution des tests unitaires et d'intégration. Le pipeline échoue si un test tombe ou si la couverture est insuffisante.
4. **Compilation (Build)** : Vérification que le TypeScript se compile sans erreur vers le dossier `dist/` au format ESM (NodeNext).

### Phase 2 : Continuous Delivery (CD) - `deploy-artefact`

Cette étape s'exécute uniquement après un **Push** sur `develop` ou `main`.

1. **Docker Buildx Setup** : Initialisation du builder avancé de Docker pour supporter le cache déporté (`type=gha`) et optimiser les temps de build de 70%.
2. **Registry Authentication** : Connexion sécurisée au **GitHub Container Registry (GHCR)** via le `GITHUB_TOKEN`.
3. **Smart Tagging** : Génération automatique des tags d'image :
   * `latest` : Pour la branche `main`.
   * `develop` : Pour la branche `develop`.
   * `sha-xxxxxx` : Identifiant unique du commit pour permettre un "Rollback" précis.
4. **Push** : Envoi de l'image finale sur `ghcr.io/brain-rot-rpg/brc-log-service`.

## 4. Sécurité

L'infrastructure CI/CD intègre des mécanismes de sécurité avancés :

* **Secrets Management** : Aucune donnée sensible (mots de passe, tokens) n'est stockée dans le code. Tout est injecté via GitHub Secrets et les fichiers `.env` non-versionnés.
* **Protection de Branches** : Configuration des *Branch Protection Rules* interdisant le merge si le pipeline n'est pas passé.
* **Production Parity** : L'environnement de test en CI est identique à l'environnement de production grâce à Docker.

## 5. Monitoring des Artefacts

Chaque version stable est consultable dans l'onglet **Packages** du dépôt GitHub. Les développeurs peuvent tirer l'image localement pour débogage :

```bash
docker pull ghcr.io/brain-rot-rpg/brc-log-service:develop
```
