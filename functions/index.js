const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const axios = require('axios');

// Initialiser Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

/**
 * WEBHOOK 1: SITE → APP
 * Reçoit un devis du site cleanbyflinco.com et crée automatiquement un rapport
 *
 * URL: https://us-central1-[PROJECT-ID].cloudfunctions.net/createReportFromSite
 *
 * Payload attendu:
 * {
 *   "devisNumber": "DEV-2024-001",
 *   "address": "123 Rue Example, Paris",
 *   "date": "2024-01-20",
 *   "clientName": "Jean Dupont",
 *   "clientEmail": "jean@example.com",
 *   "agency": "Agence Paris",
 *   "rooms": ["Cuisine", "Salon", "Chambre"],
 *   "secretKey": "votre-cle-secrete"
 * }
 */
exports.createReportFromSite = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            // Vérifier la méthode
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Use POST.' });
            }

            // Vérifier la clé secrète (sécurité)
            const secretKey = req.body.secretKey || req.headers['x-webhook-secret'];
            const validSecretKey = functions.config().webhook?.secret || 'FLINCO-SECRET-KEY-2024';

            if (secretKey !== validSecretKey) {
                console.error('❌ Clé secrète invalide');
                return res.status(403).json({ error: 'Invalid secret key' });
            }

            // Extraire les données
            const {
                devisNumber,
                address,
                date,
                clientName,
                clientEmail,
                agency,
                rooms,
                logoUrl
            } = req.body;

            // Validation des données obligatoires
            if (!devisNumber || !address || !clientName) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['devisNumber', 'address', 'clientName']
                });
            }

            console.log('📥 Webhook reçu du site:', {
                devisNumber,
                address,
                clientName,
                rooms: rooms?.length || 0
            });

            // Préparer la structure des pièces
            const roomsData = {};
            if (rooms && Array.isArray(rooms)) {
                rooms.forEach(roomName => {
                    roomsData[roomName] = { tasks: [] };
                });
            } else {
                // Pièces par défaut si non spécifiées
                roomsData['Pièce Principale'] = { tasks: [] };
            }

            // Créer le rapport dans Firestore
            const reportData = {
                quote: devisNumber,
                date: date || new Date().toISOString().split('T')[0],
                address: address,
                agent: '',
                agency: agency || '',
                clientName: clientName,
                clientEmail: clientEmail || '',
                rooms: roomsData,
                logoUrl: logoUrl || '',
                photoMode: 'avant-apres',
                requireVideoMainRoom: false,
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: 'webhook',
                completedAt: null,
                pdfUrl: null
            };

            const docRef = await db.collection('reports').add(reportData);
            const reportId = docRef.id;

            // Générer le lien agent
            const baseUrl = 'https://cleanbyflinco.com'; // ou votre domaine de l'app
            const agentUrl = `${baseUrl}/flinco-agent.html?id=${reportId}`;

            console.log('✅ Rapport créé:', reportId);

            // Réponse au site
            return res.status(200).json({
                success: true,
                message: 'Rapport créé avec succès',
                data: {
                    reportId: reportId,
                    agentUrl: agentUrl,
                    devisNumber: devisNumber
                }
            });

        } catch (error) {
            console.error('❌ Erreur webhook SITE→APP:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });
});

/**
 * WEBHOOK 2: APP → SITE
 * Envoi du rapport finalisé vers le site cleanbyflinco.com
 *
 * Cette fonction est appelée depuis flinco-agent.html après génération du PDF
 * Elle envoie le rapport complet au portail client
 *
 * URL: https://us-central1-[PROJECT-ID].cloudfunctions.net/sendReportToSite
 *
 * Payload:
 * {
 *   "reportId": "abc123",
 *   "devisNumber": "DEV-2024-001",
 *   "secretKey": "votre-cle-secrete"
 * }
 */
exports.sendReportToSite = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            // Vérifier la méthode
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Use POST.' });
            }

            // Vérifier la clé secrète
            const secretKey = req.body.secretKey || req.headers['x-webhook-secret'];
            const validSecretKey = functions.config().webhook?.secret || 'FLINCO-SECRET-KEY-2024';

            if (secretKey !== validSecretKey) {
                console.error('❌ Clé secrète invalide');
                return res.status(403).json({ error: 'Invalid secret key' });
            }

            const { reportId, devisNumber } = req.body;

            if (!reportId) {
                return res.status(400).json({ error: 'Missing reportId' });
            }

            console.log('📤 Envoi rapport au site:', { reportId, devisNumber });

            // Récupérer le rapport depuis Firestore
            const reportDoc = await db.collection('reports').doc(reportId).get();

            if (!reportDoc.exists) {
                return res.status(404).json({ error: 'Report not found' });
            }

            const reportData = reportDoc.data();

            // Récupérer toutes les photos depuis Firestore
            let photosData = {};
            try {
                const photosDoc = await db.collection('photos').doc(reportId).get();
                if (photosDoc.exists) {
                    photosData = photosDoc.data();
                }
            } catch (error) {
                console.warn('⚠️ Aucune photo trouvée:', error.message);
            }

            // Extraire les URLs des photos
            const photoUrls = [];
            for (const roomName in photosData) {
                const room = photosData[roomName];

                // Photos générales
                if (room.general) {
                    if (room.general.avant) photoUrls.push(room.general.avant);
                    if (room.general.apres) photoUrls.push(room.general.apres);
                    if (room.general.video) photoUrls.push(room.general.video);
                }

                // Photos des tâches
                if (room.tasks) {
                    for (const taskName in room.tasks) {
                        const task = room.tasks[taskName];
                        if (task.avant) photoUrls.push(task.avant);
                        if (task.apres) photoUrls.push(task.apres);
                        if (task.ouvert) photoUrls.push(task.ouvert);
                        if (task.ferme) photoUrls.push(task.ferme);
                        if (task.video) photoUrls.push(task.video);
                    }
                }
            }

            // Préparer le payload pour le site
            const payload = {
                devisNumber: reportData.quote || devisNumber,
                reportId: reportId,
                pdfUrl: reportData.pdfUrl,
                photos: photoUrls,
                completedAt: reportData.completedAt?.toDate?.() || new Date(),
                address: reportData.address,
                clientName: reportData.clientName,
                status: 'completed',
                secretKey: validSecretKey
            };

            console.log('📦 Payload préparé:', {
                devisNumber: payload.devisNumber,
                photosCount: photoUrls.length,
                hasPdf: !!payload.pdfUrl
            });

            // Envoyer au site cleanbyflinco.com
            const siteWebhookUrl = 'https://cleanbyflinco.com/api/receive-report.php'; // À adapter

            try {
                const response = await axios.post(siteWebhookUrl, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Secret': validSecretKey
                    },
                    timeout: 30000 // 30 secondes
                });

                console.log('✅ Rapport envoyé au site:', response.status);

                return res.status(200).json({
                    success: true,
                    message: 'Rapport envoyé au site avec succès',
                    data: {
                        reportId: reportId,
                        devisNumber: payload.devisNumber,
                        photosCount: photoUrls.length,
                        siteResponse: response.data
                    }
                });

            } catch (error) {
                console.error('❌ Erreur envoi au site:', error.message);

                // Même si l'envoi au site échoue, on retourne un succès
                // car le rapport est bien complété côté FLINCO
                return res.status(200).json({
                    success: true,
                    warning: 'Rapport complété mais erreur envoi au site',
                    error: error.message,
                    data: {
                        reportId: reportId,
                        devisNumber: payload.devisNumber
                    }
                });
            }

        } catch (error) {
            console.error('❌ Erreur webhook APP→SITE:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });
});

/**
 * WEBHOOK UTILITAIRE: Test de connexion
 * Permet de vérifier que les Cloud Functions sont bien déployées
 */
exports.testWebhook = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        res.status(200).json({
            success: true,
            message: 'FLINCO Webhooks are working!',
            timestamp: new Date().toISOString(),
            endpoints: {
                createReport: 'POST /createReportFromSite',
                sendReport: 'POST /sendReportToSite',
                shortUrl: 'POST /createShortUrl',
                redirect: 'GET /v/:shortId'
            }
        });
    });
});

/**
 * URL SHORTENER: Créer une URL courte pour masquer Firebase Storage
 *
 * Crée une URL propre du type: https://cleanbyflinco.com/v/abc123
 * au lieu de: https://firebasestorage.googleapis.com/v0/b/flinco-v2...
 *
 * POST /createShortUrl
 * Body: { "url": "https://firebasestorage...", "type": "video" }
 */
exports.createShortUrl = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Use POST.' });
            }

            const { url, type = 'video' } = req.body;

            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            // Générer un ID court unique (6 caractères)
            const shortId = Math.random().toString(36).substring(2, 8);

            // Stocker dans Firestore
            await db.collection('shortUrls').doc(shortId).set({
                originalUrl: url,
                type: type,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                clicks: 0
            });

            // Construire l'URL courte
            const baseUrl = functions.config().app?.url || 'https://cleanbyflinco.com';
            const shortUrl = `${baseUrl}/v/${shortId}`;

            console.log(`✅ URL courte créée: ${shortId} → ${url.substring(0, 50)}...`);

            return res.status(200).json({
                success: true,
                shortUrl: shortUrl,
                shortId: shortId,
                originalUrl: url
            });

        } catch (error) {
            console.error('❌ Erreur création URL courte:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });
});

/**
 * URL REDIRECT: Rediriger une URL courte vers Firebase Storage
 *
 * GET /v/:shortId
 * Redirige vers l'URL Firebase Storage correspondante
 */
exports.redirectShortUrl = functions.https.onRequest(async (req, res) => {
    try {
        const shortId = req.path.split('/').pop();

        if (!shortId) {
            return res.status(400).send('ID manquant');
        }

        // Récupérer l'URL depuis Firestore
        const doc = await db.collection('shortUrls').doc(shortId).get();

        if (!doc.exists) {
            return res.status(404).send('URL introuvable');
        }

        const data = doc.data();

        // Incrémenter le compteur de clics
        await db.collection('shortUrls').doc(shortId).update({
            clicks: admin.firestore.FieldValue.increment(1),
            lastAccessedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Rediriger vers l'URL originale
        console.log(`🔗 Redirection: ${shortId} → ${data.originalUrl.substring(0, 50)}...`);
        return res.redirect(302, data.originalUrl);

    } catch (error) {
        console.error('❌ Erreur redirection:', error);
        return res.status(500).send('Erreur serveur');
    }
});

/**
 * EXTRACTION PDF AVEC CLAUDE VISION
 *
 * Extrait automatiquement les éléments d'un PDF d'état des lieux
 * en utilisant l'API Claude Vision d'Anthropic
 *
 * POST /extractPDFElements
 * Content-Type: application/json
 *
 * Body: {
 *   "pdfBase64": "base64 encoded PDF data",
 *   "fileName": "nom-du-fichier.pdf"
 * }
 *
 * Response: {
 *   "success": true,
 *   "elements": [
 *     {
 *       "piece": "Cuisine",
 *       "element": "Four",
 *       "etat": "usage",
 *       "observations": "Non nettoyé, traces de graisse",
 *       "interventions": [],
 *       "interventionPossible": true,
 *       "page": 1
 *     },
 *     ...
 *   ],
 *   "metadata": {
 *     "address": "123 Rue Example",
 *     "quote": "12345",
 *     "totalElements": 15
 *   }
 * }
 */

const Anthropic = require('@anthropic-ai/sdk');
const pdfParse = require('pdf-parse');

exports.extractPDFElements = functions
    .runWith({
        timeoutSeconds: 540, // 9 minutes max
        memory: '2GB'
    })
    .https.onRequest(async (req, res) => {
        return cors(req, res, async () => {
            try {
                // Vérifier la méthode
                if (req.method !== 'POST') {
                    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
                }

                const { pdfBase64, fileName } = req.body;

                if (!pdfBase64) {
                    return res.status(400).json({ error: 'pdfBase64 is required' });
                }

                console.log(`📄 Début extraction PDF: ${fileName || 'sans nom'}`);

                // Récupérer la clé API depuis les variables d'environnement
                // Priorité : process.env (GitHub Actions) puis functions.config() (fallback)
                const anthropicApiKey = process.env.ANTHROPIC_API_KEY || functions.config().anthropic?.apikey;

                if (!anthropicApiKey) {
                    console.error('❌ Clé API Anthropic non configurée');
                    return res.status(500).json({
                        error: 'API key not configured. Add ANTHROPIC_API_KEY to GitHub Secrets or run: firebase functions:config:set anthropic.apikey="YOUR_KEY"'
                    });
                }

                // Initialiser le client Anthropic
                const anthropic = new Anthropic({
                    apiKey: anthropicApiKey
                });

                // Convertir base64 en buffer
                const pdfBuffer = Buffer.from(pdfBase64, 'base64');

                // Parser le PDF pour extraire le texte brut
                console.log('📖 Extraction du texte du PDF...');
                const pdfData = await pdfParse(pdfBuffer);
                const pdfText = pdfData.text;

                console.log(`📝 Texte extrait: ${pdfText.length} caractères`);

                // Créer le prompt pour Claude
                const prompt = `Tu es un expert en analyse de documents d'états des lieux et de devis de nettoyage FLINCO.

Voici le texte extrait d'un PDF de devis/état des lieux FLINCO :

${pdfText}

MISSION:
Extraire TOUS les éléments de l'état des lieux et les structurer en JSON.

Pour chaque élément trouvé dans le document, tu dois déterminer :
1. La pièce (Cuisine, Salle de bain, Salon, Chambre, Entrée, WC, etc.)
2. L'élément concerné (Four, Robinet, Carrelage, Sol, Mur, Plafond, etc.)
3. L'état de l'élément :
   - "bon" : si propre, bon état, rien à signaler, nickel
   - "usage" : si traces, taches, non nettoyé, sale, entartré, poussiéreux, à nettoyer
   - "mauvais" : si cassé, fissuré, dégradé, HS, vétuste, très sale, moisi
   - "absent" : si manquant, disparu, n'existe pas
4. Les observations : description complète (état + action à faire si mentionnée)
5. Les interventions prévues (liste des actions : nettoyage, détartrage, réparation, etc.)
6. Si une intervention est possible (true/false)

EXTRACTION DE L'ADRESSE - TRÈS IMPORTANT:
- Cherche l'adresse du CHANTIER/SITE/BIEN, PAS l'adresse du client ou de l'agence
- Patterns à chercher :
  * "ADRESSE DU CHANTIER", "ADRESSE", "LOCALISATION", "SITE", "BIEN"
  * Près d'un emoji 📍 ou d'un symbole de localisation
  * Format : numéro + rue + code postal + ville
- Si plusieurs adresses, privilégie celle du chantier/bien
- Retourne l'adresse complète et formatée

EXTRACTION DU NUMÉRO DE DEVIS:
- Patterns : "DEVIS N°", "N° DEVIS", "DEVIS", "REF", "RÉFÉRENCE"
- Format typique : FLI-2024-XXXX ou similaire

EXTRACTION DES TÂCHES/INTERVENTIONS:
- Pour chaque élément, si une action est mentionnée (nettoyage, détartrage, réparation), l'ajouter dans "interventions"
- Format typique : "Élément : État - Action à faire"
- Exemples d'actions : "Nettoyage", "Détartrage", "Réparation", "Remplacement", "Traitement anti-moisissure"

RETOURNE UN JSON VALIDE dans ce format EXACT:
{
  "metadata": {
    "address": "123 Rue Example, 75001 Paris",
    "quote": "FLI-2024-001234",
    "client": "Nom du client si présent",
    "date": "Date du devis si présente"
  },
  "elements": [
    {
      "piece": "Cuisine",
      "element": "Four",
      "etat": "usage",
      "observations": "Non nettoyé, traces de graisse - Nettoyage dégraissage prévu",
      "interventions": ["Nettoyage", "Dégraissage"],
      "interventionPossible": true,
      "page": 1
    }
  ]
}

IMPORTANT:
- Retourne UNIQUEMENT le JSON, sans texte avant ou après, sans balises markdown
- Si aucune adresse de chantier n'est trouvée, mets null
- Extrais TOUS les éléments mentionnés, même s'ils sont en bon état
- Regroupe les interventions par type (nettoyage, détartrage, etc.)`;

                console.log('🤖 Appel à Claude Vision API...');

                // Appeler Claude Vision
                const message = await anthropic.messages.create({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 4096,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                });

                console.log('✅ Réponse reçue de Claude');

                // Extraire le contenu de la réponse
                const responseText = message.content[0].text;

                console.log('📦 Parsing JSON...');

                // Parser le JSON
                let result;
                try {
                    // Nettoyer la réponse au cas où il y aurait des balises markdown
                    const cleanedResponse = responseText
                        .replace(/```json\n?/g, '')
                        .replace(/```\n?/g, '')
                        .trim();

                    result = JSON.parse(cleanedResponse);
                } catch (parseError) {
                    console.error('❌ Erreur parsing JSON:', parseError);
                    console.log('Réponse brute:', responseText);
                    return res.status(500).json({
                        error: 'Failed to parse Claude response',
                        rawResponse: responseText
                    });
                }

                console.log(`✅ Extraction terminée: ${result.elements?.length || 0} éléments`);

                // Retourner le résultat
                return res.status(200).json({
                    success: true,
                    elements: result.elements || [],
                    metadata: result.metadata || {},
                    totalElements: result.elements?.length || 0,
                    usage: {
                        inputTokens: message.usage.input_tokens,
                        outputTokens: message.usage.output_tokens
                    }
                });

            } catch (error) {
                console.error('❌ Erreur extraction PDF:', error);
                return res.status(500).json({
                    error: 'Internal server error',
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });
    });
