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
                sendReport: 'POST /sendReportToSite'
            }
        });
    });
});
