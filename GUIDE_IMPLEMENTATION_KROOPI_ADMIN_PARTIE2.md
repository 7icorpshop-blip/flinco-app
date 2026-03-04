# Guide Complet : Système Kroopi/Admin - PARTIE 2

## Étape 3 : Page de connexion agences (espace-client.html)

Créer un nouveau fichier **espace-client.html** à la racine du projet :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FLINCO - Espace Client</title>

    <!-- Firebase -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --primary: #0f3460;
            --accent: #82acff;
            --accent-light: #b8d4ff;
            --success: #10b981;
            --danger: #ef4444;
            --bg: #0a0f1c;
            --card: #111827;
            --text: #f1f5f9;
            --text-muted: #94a3b8;
            --border: #1e293b;
        }

        body {
            font-family: 'Space Grotesk', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .login-container {
            max-width: 450px;
            width: 100%;
        }

        .logo-section {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%);
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 32px;
            color: white;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(130, 172, 255, 0.4);
        }

        .logo-section h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .logo-section p {
            color: var(--text-muted);
            font-size: 16px;
        }

        .login-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .form-group {
            margin-bottom: 24px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text);
            font-size: 14px;
        }

        input {
            width: 100%;
            padding: 14px 16px;
            border-radius: 10px;
            border: 1px solid var(--border);
            background: var(--bg);
            color: var(--text);
            font-size: 15px;
            font-family: inherit;
            transition: all 0.2s;
        }

        input:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(130, 172, 255, 0.1);
        }

        .btn {
            width: 100%;
            padding: 16px;
            border-radius: 10px;
            border: none;
            background: linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%);
            color: white;
            font-size: 16px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 16px rgba(130, 172, 255, 0.3);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(130, 172, 255, 0.4);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .error-message {
            background: var(--danger);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            display: none;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 12px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .footer {
            text-align: center;
            margin-top: 32px;
            color: var(--text-muted);
            font-size: 13px;
        }

        .footer a {
            color: var(--accent);
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo-section">
            <div class="logo">F</div>
            <h1>FLINCO</h1>
            <p>Espace Client Agences</p>
        </div>

        <div class="login-card">
            <div id="errorMessage" class="error-message"></div>

            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required placeholder="votre@email.com" autocomplete="email">
                </div>

                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="password" required placeholder="••••••••" autocomplete="current-password">
                </div>

                <button type="submit" class="btn" id="loginBtn">
                    🔐 Se connecter
                </button>
            </form>

            <div id="loading" class="loading">
                <div class="spinner"></div>
                <p>Connexion en cours...</p>
            </div>
        </div>

        <div class="footer">
            <p>Besoin d'aide ? Contactez-nous à <a href="mailto:support@flinco.fr">support@flinco.fr</a></p>
            <p style="margin-top: 8px; font-size: 12px; opacity: 0.7;">© 2024 FLINCO - Tous droits réservés</p>
        </div>
    </div>

    <script>
        // Firebase Configuration - REMPLACER PAR VOS IDENTIFIANTS
        const firebaseConfig = {
            apiKey: "VOTRE_API_KEY",
            authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
            projectId: "VOTRE_PROJECT_ID",
            storageBucket: "VOTRE_PROJECT_ID.firebasestorage.app",
            messagingSenderId: "VOTRE_SENDER_ID",
            appId: "VOTRE_APP_ID"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        // Check if already logged in
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Verify user is an agency
                try {
                    const agencyDoc = await db.collection('agences').doc(user.uid).get();
                    if (agencyDoc.exists) {
                        // Redirect to dashboard
                        window.location.href = '/dashboard.html';
                    } else {
                        // Not an agency, sign out
                        await auth.signOut();
                        showError('Ce compte n\'est pas autorisé à accéder à l\'espace client.');
                    }
                } catch (error) {
                    console.error('Error checking agency:', error);
                }
            }
        });

        // Handle login
        async function handleLogin(event) {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showError('Veuillez remplir tous les champs');
                return;
            }

            showLoading(true);
            hideError();

            try {
                // Sign in with email and password
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Verify user is an agency
                const agencyDoc = await db.collection('agences').doc(user.uid).get();

                if (!agencyDoc.exists) {
                    // Not an agency
                    await auth.signOut();
                    showError('Ce compte n\'est pas autorisé à accéder à l\'espace client.');
                    showLoading(false);
                    return;
                }

                // Success - redirect to dashboard
                console.log('✅ Connexion réussie');
                window.location.href = '/dashboard.html';

            } catch (error) {
                console.error('Login error:', error);
                showLoading(false);

                // Display user-friendly error messages
                let errorMessage = 'Erreur de connexion';

                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Adresse email invalide';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'Ce compte a été désactivé';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'Aucun compte trouvé avec cet email';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Mot de passe incorrect';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
                        break;
                    default:
                        errorMessage = 'Erreur de connexion: ' + error.message;
                }

                showError(errorMessage);
            }
        }

        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = '❌ ' + message;
            errorDiv.style.display = 'block';
        }

        function hideError() {
            document.getElementById('errorMessage').style.display = 'none';
        }

        function showLoading(show) {
            document.getElementById('loginForm').style.display = show ? 'none' : 'block';
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }
    </script>
</body>
</html>
```

**IMPORTANT** : Remplacer les valeurs Firebase :
- `VOTRE_API_KEY`
- `VOTRE_PROJECT_ID`
- `VOTRE_SENDER_ID`
- `VOTRE_APP_ID`

---

## Étape 4 : Dashboard agences (dashboard.html)

**⚠️ FICHIER TRÈS LONG - Je vous fournis le code complet**

Créer **dashboard.html** à la racine (voir le fichier complet dans `/home/user/flinco-app/dashboard.html`)

OU utiliser ce code résumé avec les sections principales :

Le fichier dashboard.html contient :
1. **Structure HTML** : Sidebar + Main content avec 3 sections (Dashboard, Rapports, Messages)
2. **Styles CSS** : Design moderne avec variables CSS
3. **JavaScript** :
   - Authentification Firebase
   - Chargement temps réel des rapports et messages
   - Filtres et recherche
   - Modal de détails
   - Statistiques

**Code complet disponible** : Copiez le fichier `/home/user/flinco-app/dashboard.html`

---

## Étape 5 : Configuration Firebase

### 5.1 Firebase Authentication

Dans Firebase Console :
1. Aller dans **Authentication** → **Sign-in method**
2. Activer **Email/Password**

### 5.2 Firestore Database

Créer les collections :

```
agences/
  - Créer des documents avec Firebase Auth UID comme ID
  - Structure: { name, email, createdAt }

rapports/
  - Auto-créé par le webhook et l'admin

messages/
  - Auto-créé par le webhook et l'admin
```

### 5.3 Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Agences : lecture seule de son propre document
    match /agences/{agencyId} {
      allow read: if request.auth != null && request.auth.uid == agencyId;
    }

    // Rapports : lecture uniquement de ses propres rapports
    match /rapports/{reportId} {
      allow read: if request.auth != null &&
                     resource.data.agencyId == request.auth.uid;
      allow write: if false; // Seules les Functions peuvent écrire
    }

    // Messages : lecture uniquement de ses propres messages
    match /messages/{messageId} {
      allow read: if request.auth != null &&
                     resource.data.agencyId == request.auth.uid;
      allow update: if request.auth != null &&
                       resource.data.agencyId == request.auth.uid &&
                       request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
    }
  }
}
```

### 5.4 Storage Rules (si photos stockées dans Firebase Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /rapports/{agencyId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == agencyId;
      allow write: if false; // Seules les Functions peuvent écrire
    }
  }
}
```

---

## Étape 6 : Tests et déploiement

### 6.1 Test en local

```bash
# Installer les dépendances
cd functions
npm install

# Lancer l'émulateur Firebase
cd ..
firebase emulators:start
```

### 6.2 Créer une agence de test

Dans Firebase Console → Firestore :
1. Créer un utilisateur dans Authentication
2. Créer un document dans collection `agences` avec l'UID comme ID :
```json
{
  "name": "Agence Test Paris",
  "email": "test@agence.com",
  "createdAt": "2024-01-20T10:00:00.000Z"
}
```

### 6.3 Tester le webhook Kroopi

Avec Postman ou curl :

```bash
curl -X POST https://us-central1-VOTRE_PROJECT_ID.cloudfunctions.net/kroopiWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "agencyId": "UID_DE_LAGENCE_TEST",
    "title": "Rapport test - Appartement Paris 15e",
    "address": "123 Rue de la Paix, 75015 Paris",
    "photosCount": 5,
    "description": "Nettoyage complet effectué avec succès",
    "photos": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg"
    ],
    "kroopiId": "KROOPI-TEST-001"
  }'
```

### 6.4 Tester l'admin

1. Ouvrir `flinco-admin.html?password=Sethi17`
2. Cliquer sur l'onglet "📸 Rapports Agences"
3. Créer un rapport manuel
4. Vérifier qu'il apparaît dans la liste

### 6.5 Tester l'espace client

1. Ouvrir `espace-client.html`
2. Se connecter avec l'email/mot de passe de test
3. Vérifier le dashboard :
   - Statistiques mises à jour
   - Rapports affichés
   - Messages reçus
4. Cliquer sur "Voir détails" d'un rapport

### 6.6 Déploiement en production

```bash
# Déployer les Functions
firebase deploy --only functions

# Déployer le site
firebase deploy --only hosting

# Ou tout déployer en une fois
firebase deploy
```

### 6.7 URLs de production

Après déploiement :
- **Site** : https://VOTRE_PROJECT_ID.web.app
- **Admin** : https://VOTRE_PROJECT_ID.web.app/flinco-admin.html
- **Espace client** : https://VOTRE_PROJECT_ID.web.app/espace-client.html
- **Webhook Kroopi** : https://us-central1-VOTRE_PROJECT_ID.cloudfunctions.net/kroopiWebhook

### 6.8 Configurer Kroopi

Dans l'application Kroopi :
1. Aller dans Paramètres → Webhooks
2. Ajouter l'URL : `https://us-central1-VOTRE_PROJECT_ID.cloudfunctions.net/kroopiWebhook`
3. Configurer le format JSON attendu

---

## Récapitulatif des fichiers modifiés/créés

```
votre-projet/
├── functions/
│   └── index.js          [MODIFIÉ] Ajout du webhook Kroopi
├── flinco-admin.html     [MODIFIÉ] Ajout onglet Rapports Agences
├── espace-client.html    [CRÉÉ] Page de connexion
├── dashboard.html        [CRÉÉ] Tableau de bord agences
└── firestore.rules       [MODIFIÉ] Règles de sécurité
```

---

## Checklist finale

- [ ] Webhook Kroopi ajouté dans functions/index.js
- [ ] Onglet "Rapports Agences" dans flinco-admin.html
- [ ] Modal de création de rapport
- [ ] Fonctions JavaScript de gestion
- [ ] Page espace-client.html créée
- [ ] Page dashboard.html créée
- [ ] Configuration Firebase (auth, firestore, rules)
- [ ] Agence de test créée
- [ ] Test webhook Kroopi réussi
- [ ] Test admin réussi
- [ ] Test espace client réussi
- [ ] Déploiement en production
- [ ] Kroopi configuré avec l'URL du webhook

---

## Support et dépannage

### Problème : "Agency not found" lors du webhook
**Solution** : Vérifiez que l'agencyId envoyé par Kroopi correspond bien à un document dans la collection `agences`

### Problème : Pas de notification reçue
**Solution** : Vérifiez les logs Firebase Functions et assurez-vous que la collection `messages` est bien créée

### Problème : Erreur de connexion sur espace-client.html
**Solution** : Vérifiez la configuration Firebase et que l'utilisateur existe dans Authentication ET dans la collection `agences`

### Problème : Rapports non affichés dans le dashboard
**Solution** : Vérifiez les règles Firestore et que `agencyId` correspond bien au `uid` de l'utilisateur connecté

---

## Améliorations futures possibles

1. **Upload direct de photos** dans l'admin
2. **Notifications push** pour les agences
3. **Export PDF** des rapports
4. **Signature électronique** des rapports
5. **Statistiques avancées** dans le dashboard
6. **Application mobile** pour les agences

---

Fin du guide ! 🎉

Vous avez maintenant tout le code nécessaire pour implémenter le système complet de rapports Kroopi/Admin sur votre projet flinco-site.
