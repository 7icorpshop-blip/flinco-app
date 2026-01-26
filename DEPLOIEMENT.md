# 🚀 Guide de déploiement FLINCO Webhooks

## ✅ Préparation (DÉJÀ FAIT)

- ✅ Firebase CLI installé
- ✅ Dépendances installées
- ✅ Configuration créée (Project ID: flinco-v2)
- ✅ URL mise à jour dans flinco-agent.html

## 🔥 Déploiement en 2 COMMANDES

### 1. Se connecter à Firebase

```bash
firebase login
```

→ Une page web va s'ouvrir pour vous connecter avec votre compte Google
→ Choisissez le compte associé à flinco-v2

### 2. Déployer

```bash
cd /home/user/flinco-app
./deploy.sh
```

C'est tout ! Le script va :
- Vérifier la connexion
- Configurer la clé secrète
- Déployer les 3 Cloud Functions
- Afficher les URLs

---

## 🧪 Test (après déploiement)

```bash
# Test rapide de connexion
curl https://us-central1-flinco-v2.cloudfunctions.net/testWebhook

# Test complet
cd /home/user/flinco-app/functions
./test-webhook.sh
```

---

## 📋 Ce qui sera déployé

3 Cloud Functions :

1. **createReportFromSite**
   - Reçoit devis du site → Crée rapport
   - URL: `https://us-central1-flinco-v2.cloudfunctions.net/createReportFromSite`

2. **sendReportToSite**
   - Envoie rapport complété → Site client
   - URL: `https://us-central1-flinco-v2.cloudfunctions.net/sendReportToSite`

3. **testWebhook**
   - Test de connexion
   - URL: `https://us-central1-flinco-v2.cloudfunctions.net/testWebhook`

---

## 🔧 Configuration sur cleanbyflinco.com

Après le déploiement, vous devez créer sur votre site :

**Fichier** : `/api/receive-report.php`

```php
<?php
header('Content-Type: application/json');

// Vérifier la clé secrète
$headers = getallheaders();
$secretKey = $headers['X-Webhook-Secret'] ?? '';

if ($secretKey !== 'FLINCO-SECRET-KEY-2024') {
    http_response_code(403);
    exit(json_encode(['error' => 'Invalid secret']));
}

// Récupérer les données
$data = json_decode(file_get_contents('php://input'), true);

$devisNumber = $data['devisNumber'];
$pdfUrl = $data['pdfUrl'];
$photos = $data['photos'];

// TODO: Sauvegarder dans votre BDD
// TODO: Notifier le client

echo json_encode(['success' => true]);
?>
```

---

## 🔗 Envoyer un devis vers FLINCO APP

Depuis cleanbyflinco.com, quand un client valide un devis :

```javascript
fetch('https://us-central1-flinco-v2.cloudfunctions.net/createReportFromSite', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': 'FLINCO-SECRET-KEY-2024'
    },
    body: JSON.stringify({
        devisNumber: 'DEV-2024-001',
        address: '123 Rue Example, Paris',
        date: '2024-01-20',
        clientName: 'Jean Dupont',
        clientEmail: 'jean@example.com',
        rooms: ['Cuisine', 'Salon', 'Chambre'],
        secretKey: 'FLINCO-SECRET-KEY-2024'
    })
})
.then(res => res.json())
.then(data => {
    console.log('Rapport créé:', data.reportId);
    // data.agentUrl = lien pour l'agent
});
```

---

## ❓ Problèmes courants

### "Error: Not authenticated"
→ Refaire `firebase login`

### "Permission denied"
→ Vérifier que vous avez les droits sur le projet flinco-v2

### "Functions deployment failed"
→ Vérifier les logs : `firebase functions:log`

---

## 📚 Documentation complète

Voir `functions/README.md` pour :
- Format détaillé des payloads
- Debugging
- Monitoring
- Sécurité

---

## ✅ Checklist finale

Après déploiement :

- [ ] `firebase login` réussi
- [ ] `./deploy.sh` terminé sans erreur
- [ ] Test de connexion OK (`curl .../testWebhook`)
- [ ] `/api/receive-report.php` créé sur le site
- [ ] Test bout en bout avec un vrai devis
- [ ] Notification client configurée
