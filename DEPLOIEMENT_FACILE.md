# 🚀 Déploiement Firebase Functions - Méthode Simple

Votre PC Windows a des problèmes avec npm à cause d'OneDrive. Voici **la méthode la plus simple** pour déployer sans installer quoi que ce soit localement.

---

## ✅ MÉTHODE 1 : Déploiement via Firebase Console (RECOMMANDÉ)

### Étape 1 : Ouvrir la Console Firebase

1. Allez sur **[Firebase Console](https://console.firebase.google.com/)**
2. Connectez-vous avec votre compte Google
3. Sélectionnez le projet **`flinco-v2`**

---

### Étape 2 : Activer Cloud Build API

1. Dans le menu gauche, cliquez sur **"Functions"**
2. Si c'est la première fois, cliquez sur **"Get started"**
3. Firebase va vous demander d'activer certaines APIs Google Cloud :
   - **Cloud Functions API**
   - **Cloud Build API**
   - **Artifact Registry API**
4. Cliquez sur **"Activer"** pour chacune

---

### Étape 3 : Déployer depuis le terminal cloud

1. Dans la console Firebase, cliquez sur l'icône **">"** (terminal) en haut à droite
2. Cela ouvre **Cloud Shell** (un terminal Linux dans le navigateur)
3. Tapez ces commandes **UNE PAR UNE** :

```bash
git clone https://github.com/7icorpshop-blip/flinco-app.git
```

```bash
cd flinco-app
```

```bash
firebase login --no-localhost
```

Suivez les instructions pour vous connecter.

```bash
firebase use flinco-v2
```

```bash
cd functions && npm install && cd ..
```

```bash
firebase deploy --only functions
```

⏳ Attendez 2-3 minutes.

✅ **C'est tout ! Les Functions sont déployées !**

---

## ✅ MÉTHODE 2 : Utiliser GitHub Actions (Automatique)

### Créer un workflow GitHub

1. Sur GitHub, allez dans votre repo **`7icorpshop-blip/flinco-app`**
2. Créez le fichier `.github/workflows/deploy-functions.yml`
3. Collez ce contenu :

```yaml
name: Deploy Firebase Functions

on:
  push:
    branches:
      - main
      - claude/flinco-logo-offline-links-tgi1j

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd functions
          npm install

      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions --project flinco-v2
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

4. **Créez un token Firebase** :

```bash
firebase login:ci
```

Copiez le token généré.

5. Sur GitHub :
   - **Settings** → **Secrets and variables** → **Actions**
   - **New repository secret**
   - Nom : `FIREBASE_TOKEN`
   - Valeur : Le token copié

✅ Maintenant, **à chaque push sur GitHub**, les Functions se déploient automatiquement !

---

## ✅ MÉTHODE 3 : Via un autre PC (sans OneDrive)

Si vous avez accès à un autre PC (ou Mac/Linux) **sans OneDrive** :

```bash
git clone https://github.com/7icorpshop-blip/flinco-app.git
cd flinco-app
firebase login
firebase use flinco-v2
cd functions && npm install && cd ..
firebase deploy --only functions
```

---

## 🎯 Une fois déployé

### Tester l'extraction automatique

1. Ouvrez **`flinco-admin.html`** dans votre navigateur
2. Allez dans l'onglet **📊 États des Lieux**
3. Cliquez sur **"➕ Nouvel État des Lieux (Import PDF)"**
4. Glissez un PDF de devis FLINCO
5. ⏳ Attendez 15-30 secondes
6. ✅ **L'IA Claude Vision extrait automatiquement TOUS les éléments !**
7. 👀 Vérifiez rapidement
8. 📊 Cliquez sur **"Exporter Excel"** → Fichier avec interventions + coûts

---

## 📞 Support

Si vous avez des questions :
- ✅ La clé API Claude est déjà configurée : `anthropic.apikey`
- ✅ Le code est prêt dans `functions/index.js`
- ✅ Le runtime Node.js 20 est configuré
- ✅ Toutes les dépendances sont listées dans `package.json`

**Il suffit juste de déployer avec une des 3 méthodes ci-dessus !** 🚀

---

## 🔥 URL de la Function après déploiement

Une fois déployé, l'URL sera :

```
https://us-central1-flinco-v2.cloudfunctions.net/extractPDFElements
```

Le frontend (`flinco-admin.html`) est déjà configuré pour appeler cette URL automatiquement.

---

**Bonne extraction automatique avec Claude Vision !** 🤖✨
