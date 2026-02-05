# 🔐 Règles de Sécurité Firebase Storage - FLINCO

## ✅ Ce qui est maintenant protégé

### 1. **Photos** (`/photos/{reportId}/{roomName}/{fileName}`)
- ✅ Lecture publique (nécessaire pour les liens courts et PDFs)
- ✅ Écriture publique MAIS avec validations :
  - **Taille max** : 10 MB
  - **Formats autorisés** : `.jpg`, `.jpeg`, `.png`, `.webp`
  - **Type MIME** : `image/*` uniquement
  - **Structure** : doit être dans un sous-dossier reportId/roomName

### 2. **Vidéos** (`/videos/{reportId}/{roomName}/{fileName}`)
- ✅ Lecture publique (nécessaire pour les liens courts)
- ✅ Écriture publique MAIS avec validations :
  - **Taille max** : 100 MB
  - **Formats autorisés** : `.mp4`, `.mov`, `.avi`, `.webm`
  - **Type MIME** : `video/*` uniquement
  - **Structure** : doit être dans un sous-dossier reportId/roomName

### 3. **Rapports PDF** (`/reports/{reportId}/{fileName}`)
- ✅ Lecture publique (téléchargement depuis admin)
- ✅ Écriture publique MAIS avec validations :
  - **Taille max** : 50 MB
  - **Format autorisé** : `.pdf` uniquement
  - **Type MIME** : `application/pdf`
  - **Structure** : doit être dans un sous-dossier reportId

### 4. **Logos** (`/logos/{fileName}`)
- ✅ Lecture publique
- ❌ Écriture **authentifiée uniquement** (admin)
  - **Taille max** : 5 MB
  - **Formats** : images uniquement

### 5. **Devis** (`/quotes/{fileName}`)
- ✅ Lecture publique
- ❌ Écriture **authentifiée uniquement** (admin)
  - **Taille max** : 10 MB
  - **Format** : PDF uniquement

---

## 🚀 Déployer les nouvelles règles

### Option 1 : Via Firebase Console (Interface Web)

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne ton projet **flinco-v2**
3. Va dans **Storage** (menu à gauche)
4. Clique sur l'onglet **Rules** (Règles)
5. **Copie-colle** le contenu de `storage.rules`
6. Clique sur **Publish** (Publier)

### Option 2 : Via Firebase CLI (Ligne de commande)

```bash
# Déployer uniquement les règles Storage
firebase deploy --only storage

# Ou déployer tout (hosting + functions + storage)
firebase deploy
```

---

## 🧪 Tester les règles

### Dans Firebase Console :

1. Va dans **Storage > Rules**
2. Clique sur **Règles Playground** (à droite)
3. **Test 1 - Upload photo valide** :
   - Type : `get`
   - Emplacement : `photos/report-123/chambre/photo_1234.jpg`
   - Authentifié : ❌ DÉCOCHÉ
   - Résultat attendu : ✅ **Autorisé**

4. **Test 2 - Upload fichier trop gros** :
   - Type : `create`
   - Emplacement : `photos/report-123/chambre/photo.jpg`
   - Authentifié : ❌ DÉCOCHÉ
   - Simule taille : 20 MB (> 10 MB limite)
   - Résultat attendu : ❌ **Refusé**

5. **Test 3 - Lecture vidéo** :
   - Type : `get`
   - Emplacement : `videos/report-456/salon/video.mp4`
   - Authentifié : ❌ DÉCOCHÉ
   - Résultat attendu : ✅ **Autorisé**

---

## 🛡️ Protections contre les abus

### Ce qui est bloqué :

❌ Fichiers trop volumineux (photos > 10 MB, vidéos > 100 MB)
❌ Mauvais formats de fichiers (exe, zip, scripts, etc.)
❌ Upload dans des chemins non autorisés
❌ Modification des logos/devis sans authentification

### Ce qui est autorisé :

✅ Agents peuvent uploader photos/vidéos pour leurs rapports
✅ Tout le monde peut consulter les liens courts
✅ Admin peut télécharger les PDFs
✅ Pas de limite de temps (pas d'expiration)

---

## ⚠️ Important

### Pourquoi pas d'authentification pour les agents ?

Le système FLINCO fonctionne avec des **liens uniques** :
- L'admin crée un rapport → génère un lien unique
- L'agent reçoit le lien → remplit le rapport
- Pas besoin de compte utilisateur pour l'agent

Les règles protègent avec :
1. **Validation du type de fichier** (pas d'exécutables)
2. **Validation de la taille** (évite saturation du Storage)
3. **Validation de la structure** (chemin doit inclure reportId)

### Coûts Firebase Storage

Avec ces règles, tu paies pour :
- Stockage des fichiers (photos, vidéos, PDFs)
- Bande passante lors du téléchargement

**Optimisations actuelles** :
- Photos compressées automatiquement (économie d'espace)
- Vidéos limitées à 100 MB
- PDFs optimisés avec jsPDF

---

## 📊 Monitoring

Pour surveiller l'usage :

1. **Firebase Console > Storage > Usage**
   - Voir l'espace utilisé
   - Voir la bande passante
   - Détecter les abus

2. **Firebase Console > Storage > Files**
   - Voir tous les fichiers uploadés
   - Supprimer les fichiers suspects
   - Nettoyer les vieux rapports

---

## 🔧 Maintenance

### Nettoyer les vieux fichiers :

Tu peux créer une Cloud Function pour supprimer automatiquement les fichiers de plus de 6 mois :

```javascript
// functions/index.js
exports.cleanupOldFiles = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
    // Logique de suppression...
  });
```

(Dis-moi si tu veux que je crée cette fonction)

---

## ✅ Résumé

| Ressource | Lecture | Écriture | Taille max | Protection |
|-----------|---------|----------|------------|------------|
| Photos    | 🌍 Publique | ✅ Publique | 10 MB | Format + taille |
| Vidéos    | 🌍 Publique | ✅ Publique | 100 MB | Format + taille |
| PDFs      | 🌍 Publique | ✅ Publique | 50 MB | Format + taille |
| Logos     | 🌍 Publique | 🔒 Auth only | 5 MB | Format + taille + auth |
| Devis     | 🌍 Publique | 🔒 Auth only | 10 MB | Format + taille + auth |

**Plus d'expiration de date** : Les règles sont permanentes ! 🎉
