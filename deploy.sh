#!/bin/bash

echo "🚀 Déploiement FLINCO Webhooks"
echo "================================"
echo ""

# Vérifier si on est dans le bon répertoire
if [ ! -f "firebase.json" ]; then
    echo "❌ Erreur: firebase.json introuvable"
    echo "Exécutez ce script depuis le dossier flinco-app"
    exit 1
fi

echo "📦 Project ID: flinco-v2"
echo ""

# Étape 1: Vérifier si connecté à Firebase
echo "1️⃣ Vérification de la connexion Firebase..."
if ! firebase projects:list > /dev/null 2>&1; then
    echo "❌ Non connecté à Firebase"
    echo ""
    echo "Veuillez vous connecter avec:"
    echo "  firebase login"
    echo ""
    exit 1
fi
echo "✅ Connecté à Firebase"
echo ""

# Étape 2: Configurer la clé secrète
echo "2️⃣ Configuration de la clé secrète webhook..."
echo "Entrez votre clé secrète (ou appuyez sur Entrée pour utiliser la clé par défaut):"
read -r SECRET_KEY

if [ -z "$SECRET_KEY" ]; then
    SECRET_KEY="FLINCO-SECRET-KEY-2024"
    echo "Utilisation de la clé par défaut: $SECRET_KEY"
fi

firebase functions:config:set webhook.secret="$SECRET_KEY"
echo "✅ Clé secrète configurée"
echo ""

# Étape 3: Déployer les fonctions
echo "3️⃣ Déploiement des Cloud Functions..."
echo "Cela peut prendre quelques minutes..."
echo ""

firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo ""
    echo "================================"
    echo "✅ Déploiement réussi !"
    echo "================================"
    echo ""
    echo "📌 URLs des webhooks:"
    echo ""
    echo "SITE → APP (création rapport):"
    echo "  https://us-central1-flinco-v2.cloudfunctions.net/createReportFromSite"
    echo ""
    echo "APP → SITE (envoi rapport):"
    echo "  https://us-central1-flinco-v2.cloudfunctions.net/sendReportToSite"
    echo ""
    echo "Test:"
    echo "  https://us-central1-flinco-v2.cloudfunctions.net/testWebhook"
    echo ""
    echo "================================"
    echo "🔑 Clé secrète: $SECRET_KEY"
    echo "================================"
    echo ""
    echo "📚 Prochaines étapes:"
    echo "1. Tester avec: ./functions/test-webhook.sh flinco-v2"
    echo "2. Configurer cleanbyflinco.com pour recevoir les rapports"
    echo "3. Documentation complète: functions/README.md"
    echo ""
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
