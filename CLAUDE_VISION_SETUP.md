# 🤖 Configuration Claude Vision pour extraction PDF automatique

Ce guide explique comment configurer l'extraction automatique des éléments d'états des lieux via l'IA Claude Vision.

## 📋 Prérequis

1. ✅ Compte Anthropic avec clé API : [console.anthropic.com](https://console.anthropic.com/)
2. ✅ Firebase CLI installé : `npm install -g firebase-tools`
3. ✅ Accès au projet Firebase `flinco-v2`

---

## 🔑 Étape 1 : Obtenir votre clé API Claude

### 1.1 Créer un compte Anthropic

1. Allez sur **[console.anthropic.com](https://console.anthropic.com/)**
2. Cliquez sur **"Sign Up"**
3. Vérifiez votre email

### 1.2 Ajouter un moyen de paiement

1. **"Settings" → "Billing"**
2. Ajoutez une carte bancaire
3. Anthropic offre **5$ de crédit gratuit** pour tester
4. Définissez une limite mensuelle (ex: 20€/mois)

### 1.3 Créer une clé API

1. Dans la console : **"API Keys"**
2. Cliquez sur **"Create Key"**
3. Nom : `FLINCO-EDL-Parser`
4. Copiez la clé complète (format : `sk-ant-api03-...`)
5. ⚠️ **Sauvegardez-la immédiatement** (elle ne s'affiche qu'une fois)

---

## ⚙️ Étape 2 : Configuration Firebase

### 2.1 Se connecter à Firebase

```bash
firebase login
```

### 2.2 Configurer la clé API (SÉCURISÉE)

```bash
firebase functions:config:set anthropic.apikey="sk-ant-api03-VOTRE_CLE_COMPLETE_ICI"
```

⚠️ **Remplacez** `VOTRE_CLE_COMPLETE_ICI` par votre vraie clé.

### 2.3 Vérifier la configuration

```bash
firebase functions:config:get
```

Vous devriez voir :
```json
{
  "anthropic": {
    "apikey": "sk-ant-api03-..."
  }
}
```

---

## 🚀 Étape 3 : Déploiement

### 3.1 Déployer les Firebase Functions

```bash
cd /home/user/flinco-app
firebase deploy --only functions
```

Attendez environ 2-3 minutes. Vous verrez :

```
✔  functions[extractPDFElements]: Successful create operation.
```

### 3.2 Vérifier le déploiement

L'URL de votre fonction sera :
```
https://us-central1-flinco-v2.cloudfunctions.net/extractPDFElements
```

---

## 📊 Étape 4 : Test

### 4.1 Tester dans l'admin FLINCO

1. Ouvrez **flinco-admin.html**
2. Allez dans l'onglet **📊 États des Lieux**
3. Cliquez sur **"➕ Nouvel État des Lieux (Import PDF)"**
4. Glissez un PDF de devis FLINCO
5. Attendez l'extraction IA (15-30 secondes)
6. ✅ L'EDL s'ouvre avec tous les éléments automatiquement remplis !

### 4.2 Vérifier les logs

```bash
firebase functions:log --only extractPDFElements
```

Vous verrez :
```
📄 Début extraction PDF: devis-12345.pdf
📖 Extraction du texte du PDF...
📝 Texte extrait: 3245 caractères
🤖 Appel à Claude Vision API...
✅ Réponse reçue de Claude
📦 Parsing JSON...
✅ Extraction terminée: 15 éléments
```

---

## 💰 Coûts estimés

**Claude 3.5 Sonnet (Vision) :**
- Input : 3$ par million de tokens (~0.003$ par 1000 tokens)
- Output : 15$ par million de tokens (~0.015$ par 1000 tokens)

**Estimation par PDF :**
- PDF moyen (5 pages) : ~3000 tokens input + 1000 tokens output
- **Coût** : ~0.02$ = **0.02€ par PDF** 💸

**Exemples mensuels :**
- 50 PDFs/mois = **1€**
- 100 PDFs/mois = **2€**
- 500 PDFs/mois = **10€**

Très abordable ! 🎉

---

## 🔍 Dépannage

### Erreur : "API key not configured"

```bash
# Re-configurer la clé
firebase functions:config:set anthropic.apikey="sk-ant-api03-VOTRE_CLE"

# Re-déployer
firebase deploy --only functions
```

### Erreur : "Timeout"

Le PDF est peut-être trop gros. La fonction a un timeout de 9 minutes.

### Erreur : "Failed to parse Claude response"

Claude a peut-être renvoyé du texte au lieu de JSON. Vérifiez les logs :

```bash
firebase functions:log --only extractPDFElements --limit 50
```

---

## 📝 Architecture technique

```
┌─────────────┐
│   Browser   │
│  (Admin)    │
└──────┬──────┘
       │ 1. Upload PDF
       │ 2. Convert to base64
       ▼
┌─────────────────┐
│ Firebase        │
│ Function        │ ⚡ Sécurisée, clé API cachée
│extractPDFElements│
└──────┬──────────┘
       │ 3. Parse PDF text
       │ 4. Call Claude Vision API
       ▼
┌─────────────┐
│  Claude API │
│ (Anthropic) │ 🤖 Intelligence artificielle
└──────┬──────┘
       │ 5. Return structured JSON
       ▼
┌─────────────┐
│  Firestore  │
│   (EDL)     │ 💾 Sauvegarde éléments
└─────────────┘
```

---

## ✅ Checklist finale

- [ ] Compte Anthropic créé
- [ ] Clé API obtenue (sk-ant-api03-...)
- [ ] Clé configurée dans Firebase : `firebase functions:config:set`
- [ ] Functions déployées : `firebase deploy --only functions`
- [ ] Test réussi avec un PDF
- [ ] Logs vérifiés

**Une fois tout coché, l'extraction automatique fonctionne !** 🚀

---

## 📞 Support

En cas de problème :
- Vérifier les logs : `firebase functions:log`
- Vérifier la config : `firebase functions:config:get`
- Tester l'URL directement avec Postman/cURL

**L'IA Claude Vision va transformer votre workflow !** ✨
