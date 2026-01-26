#!/bin/bash

# Script de test des webhooks FLINCO
# Usage: ./test-webhook.sh [PROJECT_ID]

PROJECT_ID=${1:-"flinco-v2"}
BASE_URL="https://us-central1-${PROJECT_ID}.cloudfunctions.net"
SECRET_KEY="FLINCO-SECRET-KEY-2024"

echo "🧪 Test des webhooks FLINCO"
echo "================================"
echo ""

# Test 1: Vérification de connexion
echo "1️⃣ Test de connexion..."
curl -s "${BASE_URL}/testWebhook" | jq '.'
echo ""
echo ""

# Test 2: Création de rapport
echo "2️⃣ Test création de rapport..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: ${SECRET_KEY}" \
  -d '{
    "devisNumber": "TEST-001",
    "address": "123 Rue Test, 75001 Paris",
    "date": "2024-01-20",
    "clientName": "Client Test",
    "clientEmail": "test@example.com",
    "agency": "Agence Test",
    "rooms": ["Cuisine", "Salon"],
    "secretKey": "'"${SECRET_KEY}"'"
  }' \
  "${BASE_URL}/createReportFromSite" | jq '.'

echo ""
echo "✅ Tests terminés"
