# 📂 Dossier d'Architecture Technique : brc-log-service

## 1. Présentation du Service

Le **brc-log-service** agit comme la **colonne vertébrale d'audit** de l'architecture distribuée *Brain Rot Chronicles*. Son mandat est strict : garantir l'ingestion haute performance, la persistance durable et la restitution structurée des événements (e.g., transactions, erreurs, changements d'état de jeu).

Ce service implémente un pattern **Fire-and-Forget** pour les producteurs (services métier) tout en assurant une **consistance à terme** pour les consommateurs (admins/monitorings).

---

## 2. Principes d'Architecture (Clean Architecture)

Pour éviter de créer un énième plat de spaghettis (une spécialité que je déteste), ce service respecte rigoureusement la **Clean Architecture** (ou Architecture Hexagonale). Le code est organisé en cercles concentriques pour isoler la logique métier des détails d'infrastructure.

### Structure en Couches

1.  **Domain (Cœur)** : Contient les entités (`LogEntity`) et les interfaces de port (`ILogRepository`). Aucune dépendance externe.
2.  **Application (Use Cases)** : Orchestration de la logique (ex: `CreateLogUseCase`, `GetLogsQuery`).
3.  **Infrastructure (Adapters)** : Implémentations concrètes.
    *   *Primary Adapters (Entrées)* : Consumer RabbitMQ, Contrôleurs REST.
    *   *Secondary Adapters (Sorties)* : Repository MongoDB.

---

## 3. Stack Technique & Décisions

| Composant | Technologie | Justification Technique |
| --- | --- | --- |
| **Langage** | **TypeScript** (Node.js) | Typage statique indispensable pour maintenir un contrat d'interface propre. JavaScript pur est interdit. |
| **Persistance** | **MongoDB** | Schéma flexible adapté aux documents JSON hétérogènes des logs + TTL natif pour la rotation. |
| **Broker** | **RabbitMQ** | Découplage temporel. Utilisation d'exchanges `Topic` pour le routing et de `DLQ` (Dead Letter Queue) pour la résilience. |
| **Validation** | **Zod** / **Joi** | Validation stricte des DTOs à l'entrée des adaptateurs. Garbage In, Error Out (ou DLQ). |
| **API** | **Express** + **OpenAPI** | Exposition REST standardisée pour la consultation. |

---

## 4. Architecture Fonctionnelle & Flux de Données

Le service applique strictement le principe **CQS (Command Query Separation)** : le chemin d'écriture (Command) est totalement distinct du chemin de lecture (Query).

### A. Pipeline d'Ingestion (Command / Asynchrone)

Ce flux critique doit garantir une fiabilité totale (Zero Data Loss) tout en gérant la contre-pression (Backpressure).

1.  **Emission (Source)** : Les microservices publient des événements sérialisés en JSON sur l'exchange `logs.topic`.
    *   *Routing Key* : Format `service.level` (ex: `auth.error`, `battle.info`).
2.  **Queueing (RabbitMQ)** :
    *   Le message atterrit dans `brc_logs_queue`, une queue durable liée à l'exchange.
    *   *Configuration QoS* : Le consumer utilise un `prefetch_count` (ex: 50) pour ne pas être inondé.
3.  **Consommation (Infrastructure Adapter)** :
    *   Le `RabbitMqConsumer` écoute la queue. Pour chaque message, il instancie un scope de transaction (Unit of Work implicite).
    *   *Désérialisation* : Le Buffer binaire est converti en objet.
4.  **Validation & Assainissement (Anti-Corruption Layer)** :
    *   Validation stricte via **Zod** (schéma `LogIngestDto`).
    *   **Strip PII** : Un middleware récursif parcourt le payload pour obfusquer les clés sensibles (`password`, `jwt`, `creditCard`).
    *   *Erreur* : Si validation échoue -> **Dead Letter Exchange (DLX)** immédiat.
5.  **Exécution (Application - UseCase)** :
    *   Le `CreateLogUseCase` reçoit le DTO propre.
    *   Il enrichit le log (ajout timestamp serveur si absent).
6.  **Persistance (Infrastructure - Repository)** :
    *   Le `MongoLogRepository` transforme l'entité en `LogDocument`.
    *   Opération d'écriture : `db.logs.insertOne()`.
7.  **Acquittement (RabbitMQ ACK)** :
    *   Si succès MongoDB : envoi d'un `ACK` manuel au broker. Le message est retiré de la queue.
    *   Si échec transitoire (ex: timeout DB) : envoi d'un `NACK` (avec requeue) ou retry avec backoff exponentiel.
    *   Si échec définitif : `NACK` (sans requeue) -> DLQ.

### B. Pipeline de Consultation (Query / Synchrone)

1.  **Client** : Requête HTTP GET `/logs` (authentifiée).
2.  **Controller (Adapter)** : Reçoit la requête, valide les query params (pagination, filtres).
3.  **Use Case** : Appel à `GetLogsUseCase`.
4.  **Optimisation** : Le repository construit une requête optimisée (index-covered queries) pour MongoDB.
5.  **Restitution** : Retourne une liste de DTOs standardisés (pas d'entités de DB brutes).

---

## 5. Modèle de Données (Schema & Indexing)

Le schéma MongoDB doit supporter une forte volumétrie en écriture.

```typescript
// Interface du Document (Infrastructure)
interface LogDocument {
  _id: ObjectId;
  timestamp: Date;       // Indexé (TTL possible)
  traceId: string;       // Indexé (Hash) - Crucial pour le tracing distribué
  level: LogLevel;       // Enum: INFO, WARN, ERROR, FATAL
  serviceSource: string; // Indexé
  action: string;        // ex: "HERO_DEATH", "ITEM_DROP"
  userId?: string;       // Indexé (Sparse). UUID v4
  payload: Record<string, any>; // Données contextuelles (schema-less)
  metadata: {
    processId: string;
    hostname: string;
  }
}
```

> **Note de l'architecte :** Les index ne sont pas une option. `timestamp` (desc) et `traceId` sont obligatoires dès le jour 1.

---

## 6. Qualité de Code & Standards

Pour éviter que ce projet ne devienne une dette technique ambulante :

*   **Logique "Anti-Corruption"** : Le service de log ne doit jamais faire confiance aveuglément au format envoyé par les autres services. Il valide et assainit tout.
*   **Dependency Injection (DI)** : Les classes ne doivent pas instancier leurs dépendances (Database, Broker). Tout est injecté (via constructeur) pour faciliter les tests unitaires via des Mocks.
*   **Immuabilité** : Les logs sont en lecture seule (`ReadOnly`). Aucune API de mise à jour n'existe.
*   **Gestion des erreurs** : Tout crash du consumer doit être `catch` proprement pour NACK le message vers RabbitMQ (avec stratégie de retry exponentiel).

---

## 7. Sécurité

*   **Authentification Service-to-Service** : Le consumer RabbitMQ utilise des credentials dédiés.
*   **RBAC** : L'API de lecture vérifie strictement le claim `role: 'admin'` (ou `isSigma: true` pour coller au lore douteux du projet).
*   **PII Stripping** : Le service log doit re-vérifier l'absence de champs comme `password`, `token` ou `credit_card` dans le `payload` avant insertion, agissant comme filet de sécurité final.
