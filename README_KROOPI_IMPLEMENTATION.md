# 📚 Guide Complet : Implémentation Système Kroopi/Admin

## 🎯 Vue d'ensemble

Ce guide vous permet d'implémenter le **système complet de rapports Kroopi/Admin** sur votre projet flinco-site.

## 📖 Documentation

Le guide est divisé en 2 parties :

### **[PARTIE 1](./GUIDE_IMPLEMENTATION_KROOPI_ADMIN.md)** - Backend et Admin
- ✅ Étape 1 : Webhook Kroopi (Firebase Functions)
- ✅ Étape 2 : Interface Admin - Section Rapports Agences

### **[PARTIE 2](./GUIDE_IMPLEMENTATION_KROOPI_ADMIN_PARTIE2.md)** - Frontend Agences et Config
- ✅ Étape 3 : Page de connexion (espace-client.html)
- ✅ Étape 4 : Dashboard agences (dashboard.html)
- ✅ Étape 5 : Configuration Firebase
- ✅ Étape 6 : Tests et déploiement

## 🚀 Démarrage rapide

### 1. Copier les fichiers de référence

Les fichiers suivants sont déjà implémentés dans flinco-app et peuvent servir de référence :

```bash
# Fichiers de référence dans flinco-app :
- functions/index.js (lignes 621-750) : Webhook Kroopi
- flinco-admin.html : Section Rapports Agences
- espace-client.html : Page de connexion
- dashboard.html : Tableau de bord
```

### 2. Suivre le guide étape par étape

1. Ouvrir [GUIDE_IMPLEMENTATION_KROOPI_ADMIN.md](./GUIDE_IMPLEMENTATION_KROOPI_ADMIN.md)
2. Suivre les étapes 1 et 2 (Backend + Admin)
3. Ouvrir [GUIDE_IMPLEMENTATION_KROOPI_ADMIN_PARTIE2.md](./GUIDE_IMPLEMENTATION_KROOPI_ADMIN_PARTIE2.md)
4. Suivre les étapes 3, 4, 5 et 6 (Frontend + Config)

### 3. Tester

```bash
# Test local
firebase emulators:start

# Tester le webhook
curl -X POST http://localhost:5001/VOTRE_PROJECT_ID/us-central1/kroopiWebhook \
  -H "Content-Type: application/json" \
  -d @test-payload.json

# Déploiement
firebase deploy
```

## 📋 Collections Firebase

Le système utilise 3 collections Firestore :

```
agences/          ← Informations des agences clientes
rapports/         ← Rapports de ménage (Kroopi + Admin)
messages/         ← Notifications pour les agences
```

## 🔗 URLs après déploiement

```
Site principal    : https://cleanbyflinco.com
Admin             : https://cleanbyflinco.com/flinco-admin.html
Espace client     : https://cleanbyflinco.com/espace-client.html
Dashboard         : https://cleanbyflinco.com/dashboard.html
Webhook Kroopi    : https://us-central1-flinco-v2.cloudfunctions.net/kroopiWebhook
```

## 🎬 Flux de fonctionnement

### Flux Kroopi (Automatique)
```
App Kroopi → POST /kroopiWebhook → Firebase Functions →
→ Création rapport dans "rapports" →
→ Création notification dans "messages" →
→ Agence reçoit notification temps réel
```

### Flux Admin (Manuel)
```
Admin flinco-admin.html → Formulaire création →
→ Création rapport dans "rapports" →
→ Création notification dans "messages" →
→ Agence reçoit notification temps réel
```

### Flux Agence (Consultation)
```
Agence se connecte (espace-client.html) →
→ Redirection vers dashboard.html →
→ Affichage statistiques + rapports + messages →
→ Listeners temps réel pour mises à jour instantanées
```

## 📦 Payload webhook Kroopi

```json
{
  "agencyId": "firebase_uid_de_lagence",
  "title": "Rapport d'intervention - Appartement Paris 15e",
  "address": "123 Rue de la Paix, 75015 Paris",
  "photosCount": 15,
  "description": "Nettoyage complet effectué...",
  "photos": [
    "https://storage.example.com/photo1.jpg",
    "https://storage.example.com/photo2.jpg"
  ],
  "kroopiId": "KROOPI-2024-001"
}
```

## ✅ Checklist d'implémentation

### Backend
- [ ] Webhook Kroopi ajouté dans functions/index.js
- [ ] `cors`, `admin`, `db` bien initialisés
- [ ] Fonctions deployées : `firebase deploy --only functions`

### Admin
- [ ] Onglet "📸 Rapports Agences" ajouté dans navigation
- [ ] Section HTML avec filtres et liste
- [ ] Modal de création de rapport
- [ ] Toutes les fonctions JavaScript ajoutées
- [ ] `switchTab()` modifiée pour gérer le nouvel onglet

### Frontend Agences
- [ ] espace-client.html créé avec config Firebase
- [ ] dashboard.html créé avec toutes les sections
- [ ] Authentification Firebase activée
- [ ] Firestore rules configurées

### Configuration
- [ ] Collections Firestore créées
- [ ] Agence de test créée (Authentication + Firestore)
- [ ] Firestore rules déployées
- [ ] Site déployé : `firebase deploy --only hosting`

### Tests
- [ ] Test webhook Kroopi (curl ou Postman)
- [ ] Test création rapport manuel (admin)
- [ ] Test connexion agence
- [ ] Test affichage rapports dans dashboard
- [ ] Test notifications temps réel
- [ ] Kroopi configuré avec URL de production

## 🛠️ Dépannage rapide

### Erreur "Agency not found"
→ Vérifier que l'`agencyId` existe dans collection `agences`

### Pas de notification
→ Vérifier logs Functions et collection `messages`

### Erreur de connexion
→ Vérifier config Firebase et existence utilisateur

### Rapports non affichés
→ Vérifier Firestore rules et `agencyId == uid`

## 📞 Support

Pour toute question sur l'implémentation :
1. Consulter les guides détaillés (Partie 1 et 2)
2. Vérifier les fichiers de référence dans flinco-app
3. Consulter la documentation Firebase

## 🎉 Félicitations !

Une fois toutes les étapes complétées, vous aurez :
- ✅ Un webhook Kroopi fonctionnel
- ✅ Une interface admin pour créer des rapports manuellement
- ✅ Un espace client complet pour les agences
- ✅ Des notifications en temps réel
- ✅ Un système sécurisé avec Firebase Auth et Firestore Rules

---

**Créé le** : 26 février 2024
**Projet** : FLINCO - Système de rapports Kroopi/Admin pour agences immobilières
