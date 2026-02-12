# 📋 Template Devis FLINCO - Optimisé pour Claude Vision AI

Ce template est optimisé pour que l'IA Claude Vision puisse extraire automatiquement :
- ✅ L'adresse du chantier
- ✅ Le numéro de devis
- ✅ Toutes les tâches et interventions
- ✅ L'état de chaque élément

---

## 🎯 MODÈLE RECOMMANDÉ

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    DEVIS NETTOYAGE FIN DE CHANTIER
                              FLINCO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 ADRESSE DU CHANTIER : 123 Rue de la République, 75001 Paris
📄 DEVIS N° : FLI-2024-001234
📅 DATE : 12/02/2024

CLIENT
───────────────────────────────────────────────────────────────
Agence Immobilière XYZ
Contact : M. Dupont
Tél : 01 23 45 67 89
Email : contact@agence.fr

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    DÉTAIL DES INTERVENTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏠 CUISINE
──────────────────────────────────────────────────────────────
  ▫️ Four : Non nettoyé, traces de graisse → Nettoyage dégraissage
  ▫️ Hotte : Filtres encrassés → Remplacement filtres
  ▫️ Carrelage sol : Taches, joints sales → Nettoyage + détartrage joints
  ▫️ Plan de travail : Traces → Nettoyage désinfection
  ▫️ Évier : Entartré → Détartrage complet
  ▫️ Robinetterie : Calcaire → Détartrage
  ▫️ Vitres fenêtres : Traces → Nettoyage vitres

🚿 SALLE DE BAIN
──────────────────────────────────────────────────────────────
  ▫️ Baignoire : Joints moisis → Traitement anti-moisissure
  ▫️ Robinetterie : Entartrée → Détartrage complet
  ▫️ Miroir : Traces → Nettoyage
  ▫️ Carrelage mural : Joints sales → Détartrage joints
  ▫️ Sol : Taches → Nettoyage
  ▫️ WC : Entartré → Détartrage + désinfection

🛏️ CHAMBRE 1
──────────────────────────────────────────────────────────────
  ▫️ Sol parquet : Poussiéreux → Aspiration + lavage
  ▫️ Murs : Bon état → RAS
  ▫️ Plafond : Toiles d'araignée → Dépoussiérage
  ▫️ Radiateur : Poussiéreux → Nettoyage

🛋️ SALON
──────────────────────────────────────────────────────────────
  ▫️ Baies vitrées : Traces → Nettoyage complet
  ▫️ Sol carrelage : Traces → Nettoyage
  ▫️ Radiateurs : Poussière → Dépoussiérage
  ▫️ Plinthes : Sales → Nettoyage

🚪 ENTRÉE
──────────────────────────────────────────────────────────────
  ▫️ Porte : Traces de doigts → Nettoyage
  ▫️ Sol : Taches → Nettoyage
  ▫️ Interrupteurs : Sales → Désinfection

🚽 WC SÉPARÉS
──────────────────────────────────────────────────────────────
  ▫️ Cuvette : Entartrée → Détartrage + désinfection
  ▫️ Robinet lavabo : Calcaire → Détartrage
  ▫️ Miroir : Traces → Nettoyage
  ▫️ Sol : Sale → Nettoyage désinfection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    RÉCAPITULATIF INTERVENTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nettoyage standard .......................... 15 éléments
Détartrage .................................. 8 éléments
Traitement anti-moisissure .................. 2 éléments
Désinfection ................................ 4 éléments

TOTAL HT : 450.00 €
TVA 20% : 90.00 €
TOTAL TTC : 540.00 €

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✅ RÈGLES D'OR POUR L'EXTRACTION AUTOMATIQUE

### 1. **ADRESSE DU CHANTIER**

**✅ BIEN :**
```
📍 ADRESSE DU CHANTIER : 123 Rue de la République, 75001 Paris
```

**✅ BIEN aussi :**
```
LOCALISATION : 45 Avenue Victor Hugo, 92100 Boulogne-Billancourt
```

**❌ À ÉVITER :**
```
Intervention chez M. Dupont, Paris 15ème
```
*(trop vague, code postal manquant)*

### 2. **FORMAT DES TÂCHES**

**✅ BIEN :**
```
▫️ Four : Non nettoyé, traces de graisse → Nettoyage dégraissage
```

**Format :** `Élément : État actuel → Action à réaliser`

**✅ BIEN aussi :**
```
- Robinet : Entartré - Détartrage complet
```

**❌ À ÉVITER :**
```
Four sale + Nettoyage
```
*(pas assez structuré)*

### 3. **GROUPEMENT PAR PIÈCE**

**✅ BIEN :**
```
🏠 CUISINE
──────────
  ▫️ Four : ...
  ▫️ Hotte : ...
  ▫️ Évier : ...

🚿 SALLE DE BAIN
──────────
  ▫️ Baignoire : ...
  ▫️ Miroir : ...
```

**❌ À ÉVITER :**
```
Four cuisine, Miroir sdb, Évier cuisine, Baignoire sdb...
```
*(pas groupé par pièce)*

---

## 🎨 SYMBOLES RECOMMANDÉS

Utilisez ces symboles pour une meilleure reconnaissance :

- **Adresse :** 📍 🏠 🗺️
- **Devis :** 📄 📝 🔢
- **Pièces :**
  - Cuisine : 🏠 🍳
  - Salle de bain : 🚿 🛁
  - WC : 🚽
  - Chambre : 🛏️
  - Salon : 🛋️
  - Entrée : 🚪
- **État :**
  - ✅ Bon état
  - ⚠️ À nettoyer
  - ❌ Mauvais état
- **Actions :** → ➜ ▶️

---

## 📊 EXEMPLE COMPLET (Format simplifié)

```
DEVIS FLINCO #FLI-2024-0542
📍 CHANTIER : 78 Rue Montmartre, 75002 Paris
📅 12/02/2024

━━━ CUISINE ━━━
Four → Sale, graisse → Dégraissage
Hotte → Filtres sales → Nettoyage filtres
Sol → Taches → Nettoyage
Évier → Calcaire → Détartrage

━━━ SALLE DE BAIN ━━━
Baignoire → Joints moisis → Anti-moisissure
Miroir → Traces → Nettoyage
Robinet → Entartré → Détartrage
WC → Sale → Désinfection

━━━ SALON ━━━
Vitres → Traces → Nettoyage
Sol → Poussière → Aspiration
```

---

## 🚀 CONSEILS POUR L'IA

1. **Une ligne = un élément** : Facilite l'extraction
2. **Format cohérent** : Toujours `Élément : État → Action`
3. **Titres de pièces clairs** : En majuscules ou avec des symboles
4. **Adresse complète** : Avec code postal obligatoire
5. **Numéro de devis visible** : En haut du document

---

## 📞 QUESTIONS ?

Si l'extraction automatique ne fonctionne pas bien :
1. Vérifiez que l'adresse contient le code postal
2. Vérifiez que chaque élément est sur une ligne séparée
3. Vérifiez que les pièces sont bien groupées avec des titres
4. Assurez-vous d'utiliser le format `Élément : État → Action`

**L'IA Claude Vision comprendra automatiquement ce format !** 🤖✨
