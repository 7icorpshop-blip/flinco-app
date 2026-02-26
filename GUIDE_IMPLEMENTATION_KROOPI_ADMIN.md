# Guide Complet : Système de Rapports Kroopi/Admin pour Agences

## 📋 Table des matières
1. [Vue d'ensemble du système](#vue-densemble)
2. [Étape 1 : Webhook Kroopi (Firebase Functions)](#étape-1-webhook-kroopi)
3. [Étape 2 : Interface Admin - Rapports Agences](#étape-2-interface-admin)
4. [Étape 3 : Page de connexion agences](#étape-3-page-connexion)
5. [Étape 4 : Dashboard agences](#étape-4-dashboard)
6. [Étape 5 : Configuration Firebase](#étape-5-configuration)
7. [Étape 6 : Tests et déploiement](#étape-6-tests)

---

## Vue d'ensemble

### Système à 2 flux
1. **Flux Kroopi (automatique)** : Application mobile → Webhook → Firebase → Notification agence
2. **Flux Admin (manuel)** : Admin crée rapport → Firebase → Notification agence

### Collections Firebase
```
agences/
  {agencyId}/
    - name: string
    - email: string
    - createdAt: timestamp

rapports/
  {reportId}/
    - agencyId: string
    - title: string
    - address: string
    - photosCount: number
    - description: string
    - photos: array
    - kroopiId: string (nullable)
    - source: "kroopi" | "admin"
    - status: "available"
    - createdAt: timestamp
    - viewedAt: timestamp (nullable)

messages/
  {messageId}/
    - agencyId: string
    - subject: string
    - content: string
    - read: boolean
    - fromAgency: boolean
    - sender: string
    - type: string
    - reportId: string
    - createdAt: timestamp
```

---

## Étape 1 : Webhook Kroopi

### 1.1 Ouvrir functions/index.js

### 1.2 Ajouter le webhook à la fin du fichier (avant la fermeture)

```javascript
/**
 * WEBHOOK KROOPI : Réception Automatique des Rapports de Ménage
 *
 * Kroopi est une application mobile externe utilisée par les équipes de ménage.
 * Elle envoie automatiquement des rapports après chaque intervention.
 *
 * POST /kroopiWebhook
 * Content-Type: application/json
 *
 * Body: {
 *   "agencyId": "abc123",
 *   "title": "Rapport d'intervention - Appartement Paris 15e",
 *   "address": "123 Rue de la Paix, 75015 Paris",
 *   "photosCount": 15,
 *   "description": "Nettoyage complet...",
 *   "photos": ["url1", "url2", ...],
 *   "kroopiId": "KROOPI-2024-001"
 * }
 *
 * Response: {
 *   "success": true,
 *   "reportId": "xyz789",
 *   "message": "Rapport créé et notification envoyée"
 * }
 */
exports.kroopiWebhook = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            // Vérifier la méthode
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Use POST.' });
            }

            const {
                agencyId,
                title,
                address,
                photosCount,
                description,
                photos,
                kroopiId
            } = req.body;

            // Validation des données obligatoires
            if (!agencyId || !title || !address) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['agencyId', 'title', 'address']
                });
            }

            console.log('📥 Webhook Kroopi reçu:', {
                agencyId,
                title,
                kroopiId,
                photosCount: photos?.length || photosCount || 0
            });

            // Vérifier que l'agence existe
            const agencyDoc = await db.collection('agences').doc(agencyId).get();

            if (!agencyDoc.exists) {
                console.error('❌ Agence introuvable:', agencyId);
                return res.status(404).json({
                    error: 'Agency not found',
                    agencyId: agencyId
                });
            }

            const agencyData = agencyDoc.data();
            const agencyName = agencyData.name || agencyData.agencyName || 'l\'agence';

            // Créer le rapport dans Firestore collection "rapports"
            const reportData = {
                agencyId: agencyId,
                title: title,
                address: address,
                photosCount: photos?.length || photosCount || 0,
                description: description || '',
                photos: photos || [],
                kroopiId: kroopiId || null,
                source: 'kroopi',
                status: 'available',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                viewedAt: null
            };

            const reportRef = await db.collection('rapports').add(reportData);
            const reportId = reportRef.id;

            console.log('✅ Rapport Kroopi créé:', reportId);

            // Créer la notification automatique pour l'agence
            const messageData = {
                agencyId: agencyId,
                subject: 'Nouveau rapport de ménage disponible',
                content: `Bonjour ${agencyName},\n\nVotre rapport de ménage est maintenant disponible avec ${reportData.photosCount} photo(s).\n\nTitre: ${title}\nAdresse: ${address}\n${description ? `\nDescription: ${description}` : ''}\n\nVous pouvez le consulter dans votre espace client.`,
                read: false,
                fromAgency: false,
                sender: 'FLINCO',
                type: 'rapport',
                reportId: reportId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('messages').add(messageData);

            console.log('✅ Notification envoyée à l\'agence:', agencyId);

            // Réponse à Kroopi
            return res.status(200).json({
                success: true,
                message: 'Rapport créé et notification envoyée',
                data: {
                    reportId: reportId,
                    agencyId: agencyId,
                    agencyName: agencyName,
                    kroopiId: kroopiId
                }
            });

        } catch (error) {
            console.error('❌ Erreur webhook Kroopi:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });
});
```

**IMPORTANT** : Assurez-vous que `cors`, `db`, `admin` et `functions` sont bien définis au début du fichier :
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();
const db = admin.firestore();
```

---

## Étape 2 : Interface Admin - Rapports Agences

### 2.1 Ajouter l'onglet dans la navigation

Dans **flinco-admin.html**, trouver la section navigation (exemple ligne ~690) :

```html
<!-- Navigation Tabs -->
<div class="nav-tabs">
    <button class="nav-tab active" onclick="switchTab('rapports')">📋 Rapports</button>
    <button class="nav-tab" onclick="switchTab('etats-lieux')">📊 États des Lieux</button>
    <button class="nav-tab" onclick="switchTab('calendrier')">📅 Calendrier</button>
    <!-- AJOUTER CETTE LIGNE -->
    <button class="nav-tab" onclick="switchTab('rapports-agences')">📸 Rapports Agences</button>
</div>
```

### 2.2 Ajouter la section HTML

Juste après la section calendrier (avant les modals), ajouter :

```html
<!-- Onglet Rapports Agences (Kroopi) -->
<div id="rapportsAgencesTab" class="tab-content">
    <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
                <div class="section-title">📸 Rapports Photos pour Agences</div>
                <p style="color: var(--text-muted); font-size: 14px; margin-top: 8px;">Créez manuellement des rapports de ménage pour les agences immobilières</p>
            </div>
            <button onclick="openCreateRapportAgenceModal()" class="btn" style="background: var(--success); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none;">
                ➕ Créer un rapport
            </button>
        </div>

        <!-- Filtres et recherche -->
        <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
            <input type="text" id="searchRapportAgence" placeholder="🔍 Rechercher par titre, adresse..." style="flex: 1; min-width: 250px; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px;" oninput="filterRapportsAgences()">
            <select id="filterAgency" style="padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px;" onchange="filterRapportsAgences()">
                <option value="">Toutes les agences</option>
            </select>
            <select id="filterSource" style="padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px;" onchange="filterRapportsAgences()">
                <option value="">Toutes sources</option>
                <option value="kroopi">Kroopi</option>
                <option value="admin">Admin</option>
            </select>
        </div>

        <!-- Liste des rapports -->
        <div id="rapportsAgencesList"></div>
    </div>
</div>
```

### 2.3 Ajouter le modal de création

Avant la fermeture du body, ajouter :

```html
<!-- Modal Créer Rapport Agence -->
<div id="createRapportAgenceModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10002; overflow-y: auto; padding: 20px;">
    <div style="background: var(--card); border-radius: 16px; max-width: 600px; width: 100%; margin: 20px auto; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--border);">
            <h2 style="font-size: 20px;">📸 Créer un Rapport de Ménage</h2>
            <button onclick="closeCreateRapportAgenceModal()" style="background: var(--danger); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">✕ Fermer</button>
        </div>

        <form id="createRapportAgenceForm" onsubmit="handleCreateRapportAgence(event)">
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Agence <span style="color: var(--danger);">*</span></label>
                <select id="rapportAgencySelect" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px;">
                    <option value="">Sélectionner une agence...</option>
                </select>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">L'agence qui recevra ce rapport</p>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Titre du rapport <span style="color: var(--danger);">*</span></label>
                <input type="text" id="rapportTitle" required placeholder="Ex: Rapport d'intervention - Appartement Paris 15e" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Adresse <span style="color: var(--danger);">*</span></label>
                <input type="text" id="rapportAddress" required placeholder="Ex: 123 Rue de la Paix, 75015 Paris" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Nombre de photos <span style="color: var(--danger);">*</span></label>
                <input type="number" id="rapportPhotosCount" required min="0" value="0" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px;">
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Nombre de photos prises pendant l'intervention</p>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Description détaillée <span style="color: var(--danger);">*</span></label>
                <textarea id="rapportDescription" required placeholder="Décrivez le travail effectué..." rows="5" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px; resize: vertical;"></textarea>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">URLs des photos (optionnel)</label>
                <textarea id="rapportPhotosUrls" placeholder="Une URL par ligne&#10;https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg" rows="4" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px; resize: vertical;"></textarea>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Une URL par ligne. Laissez vide si vous n'avez pas encore les photos.</p>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" onclick="closeCreateRapportAgenceModal()" style="padding: 12px 24px; border-radius: 8px; background: var(--card-hover); color: var(--text); border: 1px solid var(--border); cursor: pointer; font-weight: 600;">Annuler</button>
                <button type="submit" style="padding: 12px 24px; border-radius: 8px; background: var(--success); color: white; border: none; cursor: pointer; font-weight: 600;">✅ Créer et envoyer le rapport</button>
            </div>
        </form>

        <div id="rapportAgenceSuccess" style="display: none; margin-top: 20px; padding: 16px; background: var(--success); color: white; border-radius: 8px; text-align: center;">
            <h3 style="margin-bottom: 8px;">✅ Rapport créé avec succès !</h3>
            <p style="font-size: 14px;">La notification a été envoyée à l'agence.</p>
        </div>
    </div>
</div>
```

### 2.4 Ajouter les fonctions JavaScript

Dans la section `<script>`, trouver la fonction `switchTab()` et la modifier :

```javascript
function switchTab(tabName) {
    // Gérer les onglets principaux
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('rapportsTab').classList.remove('active');
    document.getElementById('etatsLieuxTab').classList.remove('active');
    document.getElementById('calendrierTab').classList.remove('active');
    // AJOUTER CETTE LIGNE
    document.getElementById('rapportsAgencesTab').classList.remove('active');

    if (tabName === 'rapports') {
        document.getElementById('rapportsTab').classList.add('active');
    } else if (tabName === 'etats-lieux') {
        document.getElementById('etatsLieuxTab').classList.add('active');
        loadEDLList();
    } else if (tabName === 'calendrier') {
        document.getElementById('calendrierTab').classList.add('active');
        initCalendar();
    }
    // AJOUTER CE BLOC
    else if (tabName === 'rapports-agences') {
        document.getElementById('rapportsAgencesTab').classList.add('active');
        loadRapportsAgences();
        loadAgenciesForSelect();
    }
}
```

### 2.5 Ajouter toutes les fonctions de gestion

À la fin du script (avant `</script>`), ajouter :

```javascript
// === GESTION DES RAPPORTS AGENCES (KROOPI) ===

// Ouvrir le modal de création
function openCreateRapportAgenceModal() {
    document.getElementById('createRapportAgenceModal').style.display = 'block';
    document.getElementById('rapportAgenceSuccess').style.display = 'none';
    document.getElementById('createRapportAgenceForm').reset();
    loadAgenciesForSelect();
}

// Fermer le modal de création
function closeCreateRapportAgenceModal() {
    document.getElementById('createRapportAgenceModal').style.display = 'none';
    document.getElementById('createRapportAgenceForm').reset();
}

// Charger les agences pour le select
async function loadAgenciesForSelect() {
    try {
        const snapshot = await db.collection('agences').orderBy('name').get();
        const select = document.getElementById('rapportAgencySelect');
        const filterSelect = document.getElementById('filterAgency');

        select.innerHTML = '<option value="">Sélectionner une agence...</option>';
        filterSelect.innerHTML = '<option value="">Toutes les agences</option>';

        snapshot.docs.forEach(doc => {
            const agency = doc.data();
            const name = agency.name || agency.agencyName || doc.id;

            const option1 = document.createElement('option');
            option1.value = doc.id;
            option1.textContent = name;
            select.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = doc.id;
            option2.textContent = name;
            filterSelect.appendChild(option2);
        });
    } catch (error) {
        console.error('Erreur chargement agences:', error);
    }
}

// Créer un nouveau rapport agence
async function handleCreateRapportAgence(event) {
    event.preventDefault();

    const agencyId = document.getElementById('rapportAgencySelect').value;
    const title = document.getElementById('rapportTitle').value.trim();
    const address = document.getElementById('rapportAddress').value.trim();
    const photosCount = parseInt(document.getElementById('rapportPhotosCount').value) || 0;
    const description = document.getElementById('rapportDescription').value.trim();
    const photosUrlsText = document.getElementById('rapportPhotosUrls').value.trim();

    if (!agencyId || !title || !address || !description) {
        alert('⚠️ Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
        // Parser les URLs des photos
        const photos = photosUrlsText
            .split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0 && url.startsWith('http'));

        // Récupérer les infos de l'agence
        const agencyDoc = await db.collection('agences').doc(agencyId).get();
        if (!agencyDoc.exists) {
            alert('❌ Agence introuvable');
            return;
        }

        const agencyData = agencyDoc.data();
        const agencyName = agencyData.name || agencyData.agencyName || 'l\'agence';

        // Créer le rapport dans Firestore
        const reportData = {
            agencyId: agencyId,
            title: title,
            address: address,
            photosCount: photos.length > 0 ? photos.length : photosCount,
            description: description,
            photos: photos,
            source: 'admin',
            status: 'available',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: 'admin',
            viewedAt: null
        };

        const reportRef = await db.collection('rapports').add(reportData);
        console.log('✅ Rapport créé:', reportRef.id);

        // Créer la notification pour l'agence
        const messageData = {
            agencyId: agencyId,
            subject: 'Nouveau rapport de ménage disponible',
            content: `Bonjour ${agencyName},\n\nVotre rapport est disponible :\n\nTitre: ${title}\nAdresse: ${address}\nPhotos: ${reportData.photosCount} photo(s)\n\nDescription:\n${description}\n\nVous pouvez le consulter dans votre espace client.`,
            read: false,
            fromAgency: false,
            sender: 'FLINCO',
            type: 'rapport',
            reportId: reportRef.id,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('messages').add(messageData);
        console.log('✅ Notification envoyée');

        // Afficher le succès
        document.getElementById('createRapportAgenceForm').style.display = 'none';
        document.getElementById('rapportAgenceSuccess').style.display = 'block';

        // Recharger la liste
        setTimeout(() => {
            closeCreateRapportAgenceModal();
            loadRapportsAgences();
        }, 2000);

    } catch (error) {
        console.error('❌ Erreur création rapport:', error);
        alert('❌ Erreur lors de la création du rapport: ' + error.message);
    }
}

// Charger la liste des rapports agences
let allRapportsAgences = [];
async function loadRapportsAgences() {
    try {
        const snapshot = await db.collection('rapports').orderBy('createdAt', 'desc').get();
        allRapportsAgences = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();

            // Récupérer le nom de l'agence
            let agencyName = 'Agence inconnue';
            try {
                const agencyDoc = await db.collection('agences').doc(data.agencyId).get();
                if (agencyDoc.exists) {
                    const agencyData = agencyDoc.data();
                    agencyName = agencyData.name || agencyData.agencyName || data.agencyId;
                }
            } catch (e) {
                console.warn('Erreur récupération agence:', e);
            }

            return {
                id: doc.id,
                agencyName: agencyName,
                ...data
            };
        }));

        renderRapportsAgences(allRapportsAgences);
    } catch (error) {
        console.error('Erreur chargement rapports:', error);
        document.getElementById('rapportsAgencesList').innerHTML = '<div class="empty-state"><div class="empty-state-icon">❌</div><p>Erreur de chargement</p></div>';
    }
}

// Afficher les rapports
function renderRapportsAgences(rapports) {
    const container = document.getElementById('rapportsAgencesList');

    if (rapports.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📄</div><p>Aucun rapport pour le moment</p><p style="font-size: 14px; color: var(--text-muted); margin-top: 8px;">Créez votre premier rapport avec le bouton ci-dessus</p></div>';
        return;
    }

    container.innerHTML = rapports.map(rapport => {
        const createdAt = rapport.createdAt?.toDate?.() || new Date();
        const dateStr = createdAt.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const sourceIcon = rapport.source === 'kroopi' ? '📱' : '✏️';
        const sourceLabel = rapport.source === 'kroopi' ? 'Kroopi' : 'Admin';
        const statusIcon = rapport.viewedAt ? '✅' : '📬';
        const statusLabel = rapport.viewedAt ? 'Lu' : 'Non lu';

        return `
            <div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div style="flex: 1;">
                        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${rapport.title}</h3>
                        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 4px;">📍 ${rapport.address}</p>
                        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 4px;">🏢 ${rapport.agencyName}</p>
                        <p style="color: var(--text-muted); font-size: 14px;">📅 ${dateStr}</p>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="background: var(--bg); padding: 6px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap;">
                            ${sourceIcon} ${sourceLabel}
                        </span>
                        <span style="background: ${rapport.viewedAt ? 'var(--success)' : 'var(--warning)'}; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap;">
                            ${statusIcon} ${statusLabel}
                        </span>
                    </div>
                </div>

                <div style="background: var(--bg); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-size: 14px; color: var(--text-muted); white-space: pre-wrap;">${rapport.description}</p>
                </div>

                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
                    <span style="background: var(--accent); color: var(--primary); padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;">
                        📸 ${rapport.photosCount || 0} photo(s)
                    </span>
                    ${rapport.kroopiId ? `<span style="background: var(--card-hover); padding: 6px 12px; border-radius: 6px; font-size: 13px; color: var(--text-muted);">ID: ${rapport.kroopiId}</span>` : ''}
                </div>

                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="viewRapportAgenceDetails('${rapport.id}')" style="padding: 8px 16px; border-radius: 6px; background: var(--accent); color: var(--primary); border: none; cursor: pointer; font-weight: 600; font-size: 13px;">
                        👁️ Voir détails
                    </button>
                    <button onclick="deleteRapportAgence('${rapport.id}')" style="padding: 8px 16px; border-radius: 6px; background: var(--danger); color: white; border: none; cursor: pointer; font-weight: 600; font-size: 13px;">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filtrer les rapports
function filterRapportsAgences() {
    const searchTerm = document.getElementById('searchRapportAgence').value.toLowerCase();
    const agencyFilter = document.getElementById('filterAgency').value;
    const sourceFilter = document.getElementById('filterSource').value;

    const filtered = allRapportsAgences.filter(rapport => {
        const matchSearch =
            rapport.title.toLowerCase().includes(searchTerm) ||
            rapport.address.toLowerCase().includes(searchTerm) ||
            rapport.description.toLowerCase().includes(searchTerm) ||
            rapport.agencyName.toLowerCase().includes(searchTerm);

        const matchAgency = !agencyFilter || rapport.agencyId === agencyFilter;
        const matchSource = !sourceFilter || rapport.source === sourceFilter;

        return matchSearch && matchAgency && matchSource;
    });

    renderRapportsAgences(filtered);
}

// Voir les détails d'un rapport
function viewRapportAgenceDetails(rapportId) {
    const rapport = allRapportsAgences.find(r => r.id === rapportId);
    if (!rapport) {
        alert('❌ Rapport introuvable');
        return;
    }

    let photosHtml = '';
    if (rapport.photos && rapport.photos.length > 0) {
        photosHtml = '<h4 style="margin-top: 20px; margin-bottom: 12px;">Photos:</h4>' +
            rapport.photos.map((url, index) =>
                `<div style="margin-bottom: 8px;">
                    <a href="${url}" target="_blank" style="color: var(--accent); text-decoration: none;">
                        📸 Photo ${index + 1}
                    </a>
                </div>`
            ).join('');
    }

    alert(`📸 Détails du Rapport\n\n` +
          `Titre: ${rapport.title}\n` +
          `Agence: ${rapport.agencyName}\n` +
          `Adresse: ${rapport.address}\n` +
          `Photos: ${rapport.photosCount || 0}\n` +
          `Source: ${rapport.source === 'kroopi' ? 'Kroopi' : 'Admin'}\n` +
          `Statut: ${rapport.viewedAt ? 'Lu' : 'Non lu'}\n\n` +
          `Description:\n${rapport.description}\n\n` +
          (rapport.kroopiId ? `ID Kroopi: ${rapport.kroopiId}` : ''));
}

// Supprimer un rapport
async function deleteRapportAgence(rapportId) {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce rapport ?\n\nCette action est irréversible.')) {
        return;
    }

    try {
        await db.collection('rapports').doc(rapportId).delete();
        console.log('✅ Rapport supprimé:', rapportId);
        alert('✅ Rapport supprimé avec succès');
        loadRapportsAgences();
    } catch (error) {
        console.error('❌ Erreur suppression:', error);
        alert('❌ Erreur lors de la suppression: ' + error.message);
    }
}
```

---

**SUITE DANS LE PROCHAIN FICHIER** (Le guide est trop long, je vais créer la suite)
