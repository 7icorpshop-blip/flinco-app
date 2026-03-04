# 🧹 FLINCO - Application de Gestion de Rapports de Nettoyage

Application web complète pour la gestion professionnelle des rapports de nettoyage, développée avec Firebase et déployée sur Google Cloud.

## 📋 Description

FLINCO est une plateforme moderne qui permet de créer, gérer et partager des rapports de nettoyage professionnels avec photos, annotations et génération automatique de PDF. L'application comprend plusieurs interfaces spécialisées pour différents types d'utilisateurs.

## 🚀 Fonctionnalités

### Interfaces Utilisateur

- **🏠 Page d'accueil** (`index.html`) - Interface principale pour la création de rapports premium
- **👷 Interface Agent** (`flinco-agent.html`) - Outil dédié pour les agents de terrain
- **⚙️ Interface Admin** (`flinco-admin.html`) - Panneau d'administration complet
- **👤 Espace Client** (`espace-client.html`) - Consultation des rapports par les clients
- **📊 Dashboard** (`dashboard.html`) - Tableau de bord analytique

### Fonctionnalités Principales

- ✅ Création de rapports de nettoyage avec photos
- 📸 Upload et gestion d'images
- ✏️ Annotations sur photos (dessin, texte, flèches)
- 📄 Génération automatique de PDF professionnels
- 🔗 Liens courts pour partage facile
- 🔔 Système de webhooks pour intégration externe
- 🔐 Authentification et sécurité Firebase
- 💾 Stockage cloud Firebase Storage
- 🗄️ Base de données Firestore

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript
- **Backend** : Firebase Cloud Functions (Node.js 20)
- **Base de données** : Cloud Firestore
- **Stockage** : Firebase Storage
- **Hosting** : Firebase Hosting
- **Génération PDF** : jsPDF
- **Visualisation PDF** : PDF.js

## 📁 Structure du Projet

```
flinco-app/
├── index.html              # Page principale
├── flinco-agent.html       # Interface agent
├── flinco-admin.html       # Interface admin
├── espace-client.html      # Espace client
├── dashboard.html          # Tableau de bord
├── functions/              # Cloud Functions
│   ├── index.js           # Functions principales
│   ├── package.json       # Dépendances Node.js
│   └── README.md          # Documentation des functions
├── firebase.json          # Configuration Firebase
├── firestore.rules        # Règles de sécurité Firestore
├── storage.rules          # Règles de sécurité Storage
├── deploy.sh              # Script de déploiement
└── DEPLOIEMENT.md         # Guide de déploiement
```

## 🔧 Installation

### Prérequis

- Node.js 20+
- Firebase CLI
- Compte Firebase / Google Cloud
- Projet Firebase configuré (ID: flinco-v2)

### Installation des dépendances

```bash
# Installer Firebase CLI globalement
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Installer les dépendances des Cloud Functions
cd functions
npm install
cd ..
```

## 🚀 Déploiement

### Déploiement rapide

```bash
# Utiliser le script de déploiement automatique
./deploy.sh
```

### Déploiement manuel

```bash
# Déployer tout (hosting + functions + rules)
firebase deploy

# Déployer uniquement les functions
firebase deploy --only functions

# Déployer uniquement l'hosting
firebase deploy --only hosting

# Déployer uniquement les règles
firebase deploy --only firestore:rules,storage:rules
```

Pour plus de détails, consultez [DEPLOIEMENT.md](DEPLOIEMENT.md)

## 🔐 Configuration

### Variables d'environnement

Les Cloud Functions utilisent une clé secrète pour l'authentification :

```bash
firebase functions:config:set webhook.secret="FLINCO-SECRET-KEY-2024"
```

### Configuration Firebase

Le projet est configuré pour utiliser :
- **Project ID** : `flinco-v2`
- **Region** : `us-central1`

## 🌐 Cloud Functions

L'application expose 3 Cloud Functions :

### 1. `createReportFromSite`
Crée un nouveau rapport depuis le site externe
- **URL** : `https://us-central1-flinco-v2.cloudfunctions.net/createReportFromSite`
- **Méthode** : POST
- **Authentification** : Header `X-Webhook-Secret`

### 2. `sendReportToSite`
Envoie un rapport complété vers le site externe
- **URL** : `https://us-central1-flinco-v2.cloudfunctions.net/sendReportToSite`
- **Méthode** : POST
- **Authentification** : Header `X-Webhook-Secret`

### 3. `testWebhook`
Endpoint de test pour vérifier la connexion
- **URL** : `https://us-central1-flinco-v2.cloudfunctions.net/testWebhook`
- **Méthode** : GET
- **Authentification** : Aucune

## 🧪 Tests

```bash
# Tester la connexion aux webhooks
curl https://us-central1-flinco-v2.cloudfunctions.net/testWebhook

# Lancer les tests depuis le dossier functions
cd functions
./test-webhook.sh
```

## 🔗 Intégration avec cleanbyflinco.com

Le système peut recevoir des devis depuis le site principal via webhook. Voir les exemples dans [DEPLOIEMENT.md](DEPLOIEMENT.md) pour l'intégration complète.

## 📚 Documentation

- [DEPLOIEMENT.md](DEPLOIEMENT.md) - Guide de déploiement complet
- [LOGO-INSTRUCTIONS.md](LOGO-INSTRUCTIONS.md) - Instructions pour le logo
- [FIREBASE-SECURITY.md](FIREBASE-SECURITY.md) - Configuration sécurité
- [PDF-PREVIEW.md](PDF-PREVIEW.md) - Génération et prévisualisation PDF
- [functions/README.md](functions/README.md) - Documentation des Cloud Functions

## 🔒 Sécurité

- Authentification Firebase
- Règles de sécurité Firestore et Storage
- Validation des webhooks par clé secrète
- CORS configuré pour les domaines autorisés

## 📝 License

Propriétaire - FLINCO © 2024

## 👥 Support

Pour toute question ou problème :
- Consulter la documentation dans `/docs`
- Vérifier les logs Firebase : `firebase functions:log`
- Contacter l'équipe technique

## 🔄 Mises à jour

Pour mettre à jour l'application :

```bash
# Récupérer les dernières modifications
git pull origin main

# Réinstaller les dépendances si nécessaire
cd functions && npm install && cd ..

# Redéployer
./deploy.sh
```

---

**Version** : 2.0
**Dernière mise à jour** : Mars 2024
**Firebase Project** : flinco-v2
