# 🔗 FLINCO Webhooks - Intégration Site ↔ App

## 📋 Vue d'ensemble

Ce système permet une intégration bidirectionnelle entre :
- **FLINCO SITE** (cleanbyflinco.com) - Portail client
- **FLINCO APP** (flinco-app) - Application de gestion des rapports

## 🔄 Flux de données

```
1. CLIENT → SITE → WEBHOOK → APP
   Client crée devis/commande
   → Webhook créé automatiquement rapport
   → Agent reçoit lien pour compléter

2. AGENT → APP → WEBHOOK → SITE
   Agent complète rapport (photos avant/après)
   → PDF généré
   → Webhook envoie rapport au portail client
   → Client voit rapport dans son espace
```

---

## 🚀 Déploiement

### 1. Installation des dépendances

```bash
cd functions
npm install
```

### 2. Configuration Firebase

Dans le répertoire racine de votre projet :

```bash
# Login Firebase
firebase login

# Initialiser le projet (si pas déjà fait)
firebase init functions

# Sélectionner :
# - JavaScript
# - ESLint: No
# - Install dependencies: Yes
```

### 3. Configuration de la clé secrète

Pour sécuriser les webhooks, configurez une clé secrète :

```bash
firebase functions:config:set webhook.secret="VOTRE-CLE-SECRETE-ICI"
```

**Important** : Changez `VOTRE-CLE-SECRETE-ICI` par une clé forte et unique.

### 4. Déploiement des Cloud Functions

```bash
# Déployer toutes les fonctions
firebase deploy --only functions

# Ou déployer une fonction spécifique
firebase deploy --only functions:createReportFromSite
firebase deploy --only functions:sendReportToSite
```

### 5. Récupérer les URLs des fonctions

Après le déploiement, Firebase affichera les URLs :

```
✔  functions[createReportFromSite]: https://us-central1-[PROJECT-ID].cloudfunctions.net/createReportFromSite
✔  functions[sendReportToSite]: https://us-central1-[PROJECT-ID].cloudfunctions.net/sendReportToSite
✔  functions[testWebhook]: https://us-central1-[PROJECT-ID].cloudfunctions.net/testWebhook
```

---

## 🔧 Configuration

### Configuration dans flinco-agent.html

Modifier la ligne 1512 avec votre URL de Cloud Function :

```javascript
const webhookUrl = 'https://us-central1-[VOTRE-PROJECT-ID].cloudfunctions.net/sendReportToSite';
```

Remplacer `[VOTRE-PROJECT-ID]` par l'ID de votre projet Firebase.

### Configuration dans le site cleanbyflinco.com

Dans le site, vous devez :

1. **Créer l'endpoint de réception** : `/api/receive-report.php` (ou .js si Node)
2. **Configurer le webhook SITE → APP** pour envoyer vers :
   ```
   https://us-central1-[PROJECT-ID].cloudfunctions.net/createReportFromSite
   ```

---

## 📤 Webhook 1 : SITE → APP (Création de rapport)

### URL
```
POST https://us-central1-[PROJECT-ID].cloudfunctions.net/createReportFromSite
```

### Headers requis
```
Content-Type: application/json
X-Webhook-Secret: VOTRE-CLE-SECRETE
```

### Payload

```json
{
  "devisNumber": "DEV-2024-001",
  "address": "123 Rue Example, 75001 Paris",
  "date": "2024-01-20",
  "clientName": "Jean Dupont",
  "clientEmail": "jean@example.com",
  "agency": "Agence Paris",
  "rooms": ["Cuisine", "Salon", "Chambre"],
  "logoUrl": "https://example.com/logo.png",
  "secretKey": "VOTRE-CLE-SECRETE"
}
```

### Réponse attendue

**Succès (200)** :
```json
{
  "success": true,
  "message": "Rapport créé avec succès",
  "data": {
    "reportId": "abc123xyz",
    "agentUrl": "https://cleanbyflinco.com/flinco-agent.html?id=abc123xyz",
    "devisNumber": "DEV-2024-001"
  }
}
```

**Erreur (400/403/500)** :
```json
{
  "error": "Invalid secret key"
}
```

---

## 📥 Webhook 2 : APP → SITE (Rapport complété)

### URL
```
POST https://us-central1-[PROJECT-ID].cloudfunctions.net/sendReportToSite
```

**Cette fonction est appelée automatiquement** depuis `flinco-agent.html` après génération du PDF.

### Payload

```json
{
  "reportId": "abc123xyz",
  "devisNumber": "DEV-2024-001",
  "secretKey": "VOTRE-CLE-SECRETE"
}
```

### Ce que la fonction fait

1. Récupère le rapport depuis Firestore
2. Récupère toutes les photos
3. Envoie vers le site :

```json
{
  "devisNumber": "DEV-2024-001",
  "reportId": "abc123xyz",
  "pdfUrl": "https://firebasestorage.googleapis.com/.../rapport.pdf",
  "photos": [
    "https://firebasestorage.googleapis.com/.../photo1.jpg",
    "https://firebasestorage.googleapis.com/.../photo2.jpg"
  ],
  "completedAt": "2024-01-20T14:30:00Z",
  "address": "123 Rue Example, Paris",
  "clientName": "Jean Dupont",
  "status": "completed",
  "secretKey": "VOTRE-CLE-SECRETE"
}
```

### Configuration du site destinataire

Dans le fichier `functions/index.js`, ligne 179, modifier :

```javascript
const siteWebhookUrl = 'https://cleanbyflinco.com/api/receive-report.php';
```

---

## 🧪 Test

### Tester la connexion

```bash
curl https://us-central1-[PROJECT-ID].cloudfunctions.net/testWebhook
```

Réponse attendue :
```json
{
  "success": true,
  "message": "FLINCO Webhooks are working!",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Tester la création de rapport

```bash
curl -X POST \
  https://us-central1-[PROJECT-ID].cloudfunctions.net/createReportFromSite \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: VOTRE-CLE-SECRETE" \
  -d '{
    "devisNumber": "TEST-001",
    "address": "Test Address",
    "clientName": "Test Client",
    "rooms": ["Cuisine"],
    "secretKey": "VOTRE-CLE-SECRETE"
  }'
```

---

## 🔒 Sécurité

1. **Clé secrète** : Toujours utiliser une clé forte
2. **HTTPS uniquement** : Les webhooks sont en HTTPS obligatoire
3. **Validation** : Les payloads sont validés côté serveur
4. **CORS** : Configuré pour accepter les requêtes du site

---

## 📊 Monitoring

### Logs Firebase

```bash
# Voir les logs en temps réel
firebase functions:log

# Logs d'une fonction spécifique
firebase functions:log --only createReportFromSite
```

### Logs dans la console

Les logs sont disponibles dans :
- Firebase Console → Functions → Logs
- Google Cloud Console → Logging

---

## 🐛 Dépannage

### Erreur 403 : Invalid secret key
→ Vérifier que la clé secrète est identique dans :
  - Configuration Firebase (`firebase functions:config:get`)
  - Payload du webhook
  - Code de flinco-agent.html

### Erreur 404 : Report not found
→ Le reportId n'existe pas dans Firestore

### Timeout
→ Augmenter le timeout dans axios (ligne 185 du index.js)

### Webhook n'arrive pas au site
→ Vérifier l'URL configurée ligne 179
→ Vérifier que le site accepte les requêtes POST
→ Vérifier les logs Firebase pour voir l'erreur exacte

---

## 📝 Structure des données

### Collection Firestore : `reports`

```javascript
{
  quote: "DEV-2024-001",
  date: "2024-01-20",
  address: "123 Rue Example",
  clientName: "Jean Dupont",
  clientEmail: "jean@example.com",
  agency: "Agence Paris",
  rooms: {
    "Cuisine": { tasks: [] },
    "Salon": { tasks: [] }
  },
  status: "pending" | "completed",
  createdAt: Timestamp,
  createdBy: "webhook" | "manual",
  completedAt: Timestamp | null,
  pdfUrl: "https://..." | null,
  photoMode: "avant-apres",
  requireVideoMainRoom: false
}
```

### Collection Firestore : `photos`

```javascript
{
  "Cuisine": {
    general: {
      avant: "https://...",
      apres: "https://...",
      video: "https://..."
    },
    tasks: {
      "Nettoyage sol": {
        avant: "https://...",
        apres: "https://..."
      }
    }
  }
}
```

---

## 🎯 Checklist de déploiement

- [ ] `npm install` dans le dossier functions
- [ ] `firebase login` effectué
- [ ] Clé secrète configurée (`firebase functions:config:set`)
- [ ] Fonctions déployées (`firebase deploy --only functions`)
- [ ] URL de webhook mise à jour dans flinco-agent.html
- [ ] URL du site destinataire configurée dans index.js
- [ ] Test de connexion réussi (`testWebhook`)
- [ ] Test de création de rapport
- [ ] Endpoint de réception créé côté site

---

## 📞 Support

Pour toute question, vérifier :
1. Les logs Firebase (`firebase functions:log`)
2. La console du navigateur (F12)
3. Les logs du site destinataire
