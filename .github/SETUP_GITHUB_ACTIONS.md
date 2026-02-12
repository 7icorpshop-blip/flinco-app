# 🚀 Configuration GitHub Actions - Déploiement Automatique

Ce guide vous montre comment configurer le déploiement automatique des Firebase Functions via GitHub Actions.

---

## 📋 Étape 1 : Obtenir le token Firebase

### Sur votre PC Windows (dans le terminal) :

```bash
firebase login:ci
```

1. Une fenêtre de navigateur s'ouvrira
2. Connectez-vous avec votre compte Google
3. Autorisez Firebase CLI
4. **Copiez le token** qui s'affiche dans le terminal

Le token ressemble à ça :
```
1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT** : Ne partagez JAMAIS ce token publiquement !

---

## 📋 Étape 2 : Ajouter le token dans GitHub Secrets

1. Allez sur **[GitHub](https://github.com/7icorpshop-blip/flinco-app)**

2. Cliquez sur **"Settings"** (en haut)

3. Dans le menu gauche, cliquez sur **"Secrets and variables"** → **"Actions"**

4. Cliquez sur **"New repository secret"**

5. Remplissez :
   - **Name** : `FIREBASE_TOKEN`
   - **Secret** : Collez le token que vous avez copié

6. Cliquez sur **"Add secret"**

---

## 📋 Étape 3 : Tester le déploiement automatique

### Méthode 1 : Push un changement

1. Faites n'importe quel petit changement dans le code
2. Commitez et pushez :

```bash
git add .
git commit -m "Test GitHub Actions deploy"
git push
```

3. Allez dans l'onglet **"Actions"** sur GitHub
4. Vous verrez le workflow **"Deploy Firebase Functions"** en cours d'exécution ⚙️
5. Attendez 2-3 minutes
6. ✅ **C'est déployé automatiquement !**

### Méthode 2 : Déclenchement manuel

1. Sur GitHub, allez dans **"Actions"**
2. Cliquez sur **"Deploy Firebase Functions"** dans la liste
3. Cliquez sur **"Run workflow"** → **"Run workflow"**
4. ✅ Le déploiement démarre immédiatement !

---

## 🎯 Ce qui se passe automatiquement

À chaque push sur les branches :
- `main`
- `claude/flinco-logo-offline-links-tgi1j`

Le workflow va :
1. ✅ Cloner le code depuis GitHub
2. ✅ Installer Node.js 20
3. ✅ Installer les dépendances (`npm ci` dans `functions/`)
4. ✅ Déployer les Firebase Functions sur le projet `flinco-v2`

**Durée totale** : ~2-3 minutes

---

## 📊 Vérifier que ça fonctionne

### Dans l'onglet GitHub Actions :

✅ **Succès** : Badge vert, toutes les étapes cochées
❌ **Échec** : Badge rouge, vérifiez les logs

### Tester l'extraction PDF :

1. Ouvrez **`flinco-admin.html`** dans votre navigateur
2. Allez dans **📊 États des Lieux**
3. **"➕ Nouvel État des Lieux (Import PDF)"**
4. Glissez un PDF de devis FLINCO
5. ⏳ 15-30 secondes
6. ✅ **L'IA Claude Vision extrait automatiquement !**

---

## 🆘 Dépannage

### Erreur : "Error: HTTP Error: 401, Request had invalid authentication credentials"

→ Le token Firebase est invalide ou expiré. Régénérez-le :

```bash
firebase login:ci
```

Et remettez-le dans GitHub Secrets.

### Erreur : "secrets.FIREBASE_TOKEN is required"

→ Vous n'avez pas ajouté le secret dans GitHub. Retournez à l'étape 2.

### Erreur lors de npm install

→ Pas de problème ! GitHub Actions utilise Linux, donc aucun souci avec npm (contrairement à votre PC Windows avec OneDrive).

---

## ✨ Avantages

✅ **Zéro installation locale** : Tout se passe dans le cloud GitHub
✅ **Déploiement automatique** : Chaque push = déploiement
✅ **Pas de souci npm** : Environnement Linux propre
✅ **Logs détaillés** : Voir exactement ce qui se passe
✅ **Rollback facile** : Revenez à un commit précédent et re-pushez

---

**C'est configuré ! Il ne reste plus qu'à ajouter le token Firebase dans GitHub Secrets.** 🎉
