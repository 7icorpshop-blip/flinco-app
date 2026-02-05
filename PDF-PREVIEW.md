# 📄 Aperçu du nouveau design PDF FLINCO

## 🎨 Couleurs utilisées

- **Bleu marine FLINCO** : `#1e293b` (RGB: 30, 41, 59) - Fond des sections
- **Bleu électrique FLINCO** : `#3b82f6` (RGB: 59, 130, 246) - Icônes et accents
- **Blanc** : `#ffffff` - Fond principal et texte sur fond bleu
- **Gris foncé** : `#282828` - Texte principal

---

## 📄 PAGE 1 - COUVERTURE (Style Flat Checker minimaliste)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│              ┌──────────────┐                   │
│              │              │                   │
│              │   🏠 LOGO    │  ← Carré bleu     │
│              │    FLINCO    │     marine        │
│              │              │                   │
│              └──────────────┘                   │
│                                                 │
│          Rapport_N012345_02022025               │
│                                                 │
│    ─────────────────────────────────────        │
│                                                 │
│   Etat des lieux entrant en date du             │
│          05/02/2026 14:30                       │
│                                                 │
│                FLINCO                           │
│                                                 │
│            12, rue Saint Saëns                  │
│           75015 Paris, France                   │
│                                                 │
│        Propriétaire : Beguy Knodt               │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Caractéristiques** :
- Logo carré centré (50x50mm) avec fond bleu marine
- Icône maison blanche stylisée dans le carré
- Tout le texte est centré
- Design épuré, fond blanc pur
- Pas de bannière colorée

---

## 📑 PAGE 2+ - PIÈCES (Style Expert EDL avec couleurs FLINCO)

```
┌──────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────┐ │
│ │  RAPPORT DE NETTOYAGE ET REMISE EN ÉTAT  │ │ ← En-tête avec bordure
│ │                                          │ │
│ │ Date: 05/02/2026    Tech: FLINCO         │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│  [Photo Avant]           [Photo Après]       │ ← Vignettes 65x48mm
│     65x48mm                 65x48mm          │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ ⓘ Informations sur la pièce - Chambre   │ │ ← BLEU MARINE FLINCO
│ └──────────────────────────────────────────┘ │   (au lieu de magenta)
│ ┌──────────────────────────────────────────┐ │
│ │ Type de pièce : Chambre                  │ │
│ │ Adresse : 12, rue Saint Saëns            │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│  🎬 Voir la vidéo de la pièce               │ ← Lien cliquable bleu
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ ⓘ Détails des tâches                    │ │ ← BLEU MARINE FLINCO
│ └──────────────────────────────────────────┘ │   (au lieu de magenta)
│                                              │
│ • Nettoyage du sol                           │
│                                              │
│   Avant            Après                     │
│  [Photo]          [Photo]                    │
│   75x50mm          75x50mm                   │
│                                              │
│  🎬 Voir la vidéo                            │
│                                              │
└──────────────────────────────────────────────┘
```

**Caractéristiques** :
- En-tête encadré avec titre du rapport (personnalisable)
- Date à gauche, Technicien à droite
- Deux grandes vignettes en haut (photos avant/après de la vue générale)
- **Sections avec fond BLEU MARINE** au lieu de magenta
- **Icônes dans cercles BLEU ÉLECTRIQUE** au lieu de blanc/magenta
- Cadre avec bordure pour les informations de la pièce
- Photos avant/après pour chaque tâche (format plus petit)
- Liens vidéo en bleu électrique cliquables

---

## 🎯 Options de titre disponibles

Dans l'admin, vous pouvez choisir parmi 4 types de rapports :

1. **🧹 Rapport de nettoyage et remise en état** (par défaut)
   - Affiche : `RAPPORT DE NETTOYAGE ET REMISE EN ÉTAT`

2. **📦 Rapport de débarras**
   - Affiche : `RAPPORT DE DÉBARRAS`

3. **🔧 Rapport de remise en état**
   - Affiche : `RAPPORT DE REMISE EN ÉTAT`

4. **✨ Rapport de nettoyage**
   - Affiche : `RAPPORT DE NETTOYAGE`

---

## 🔄 Changements par rapport à la version précédente

### ❌ AVANT (Version précédente)
- Fond magenta rose pour les sections (couleur Expert EDL)
- Logo dans un cercle bleu électrique
- Grande bannière bleue en page 1
- Titre : "RAPPORT DE NETTOYAGE" fixe

### ✅ APRÈS (Nouvelle version)
- **Fond BLEU MARINE FLINCO** pour les sections (#1e293b)
- **Icônes dans cercles BLEU ÉLECTRIQUE** (#3b82f6)
- Logo dans un carré bleu marine
- Page 1 minimaliste sans bannière
- **Titre personnalisable** selon le type de rapport choisi

---

## 📱 Comment tester

1. Va sur **flinco-admin.html**
2. Crée un nouveau rapport
3. **Sélectionne le type de rapport** dans le menu déroulant (nouveau champ !)
4. Complète le rapport dans l'agent
5. Génère le PDF
6. Vérifie que :
   - ✅ Le titre correspond au type choisi
   - ✅ Les sections ont un fond bleu marine (pas rose)
   - ✅ Les icônes sont dans des cercles bleus électriques
   - ✅ La page 1 est minimaliste comme Flat Checker

---

## 🎨 Palette de couleurs FLINCO

```css
/* Couleurs principales */
--bleu-marine: #1e293b;     /* Fond des sections */
--bleu-electrique: #3b82f6; /* Icônes, accents, liens */
--blanc: #ffffff;           /* Fond principal */
--gris-texte: #282828;      /* Texte principal */
--gris-clair: #646464;      /* Bordures */
```

---

## ✨ Points forts du nouveau design

1. **Cohérence visuelle** avec l'identité FLINCO
2. **Professionnalisme** : couleurs sobres et élégantes
3. **Flexibilité** : 4 types de rapports au choix
4. **Clarté** : sections bien délimitées visuellement
5. **Modernité** : design épuré page 1, structuré pages suivantes
