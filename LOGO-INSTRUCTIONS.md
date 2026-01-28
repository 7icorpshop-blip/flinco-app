# 🎨 Comment ajouter votre logo FLINCO dans les PDFs

## 📍 Emplacement du logo

Le logo apparaît sur la **page de couverture** de chaque PDF généré.

---

## 🔧 Méthode 1 : Ajouter le fichier logo.png

### Étape 1 : Préparer votre logo

1. Votre logo doit être au format **PNG** ou **JPG**
2. Taille recommandée : **500x500 pixels** minimum
3. Fond transparent (PNG) de préférence
4. Format carré recommandé

### Étape 2 : Le placer dans le projet

```bash
# Copiez votre logo dans le dossier principal
cp votre-logo.png /home/user/flinco-app/logo.png
```

### Étape 3 : Le logo sera automatiquement chargé

Le code chargera automatiquement `logo.png` s'il existe dans le dossier.

---

## 🔧 Méthode 2 : Logo en base64 (intégré dans le code)

Si vous voulez intégrer le logo directement dans le code :

### Étape 1 : Convertir votre logo en base64

```bash
# Depuis Linux/Mac
base64 logo.png > logo-base64.txt

# Le résultat ressemble à :
# data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

### Étape 2 : Ouvrir flinco-agent.html

Cherchez cette ligne (autour de la ligne 1730) :

```javascript
// Logo FLINCO professionnel intégré (icône maison dans cercle)
```

### Étape 3 : Remplacer le code du logo par :

```javascript
// Logo FLINCO depuis base64
const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; // Votre base64 ici
pdf.addImage(logoBase64, 'PNG', w/2 - 22, 18, 44, 44);
```

---

## 🔗 Méthode 3 : Logo depuis GitHub (URL directe)

Si votre logo est sur GitHub :

### Étape 1 : Obtenir l'URL raw

Exemple :
```
https://raw.githubusercontent.com/7icorpshop-blip/flinco-app/main/logo.png
```

### Étape 2 : Modifier le code

Dans `flinco-agent.html`, ligne ~1730, remplacez par :

```javascript
// Logo depuis GitHub
try {
    const logoUrl = 'https://raw.githubusercontent.com/7icorpshop-blip/flinco-app/main/logo.png';
    const logoImg = await fetch(logoUrl);
    const logoBlob = await logoImg.blob();
    const logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
    });
    pdf.addImage(logoBase64, 'PNG', w/2 - 22, 18, 44, 44);
} catch(e) {
    console.warn('Erreur chargement logo:', e);
    // Logo par défaut (maison) s'affichera
}
```

---

## 📐 Ajuster la taille du logo

Pour changer la taille du logo dans le PDF :

```javascript
pdf.addImage(logoBase64, 'PNG', x, y, largeur, hauteur);

// Exemple :
// Plus petit
pdf.addImage(logoBase64, 'PNG', w/2 - 20, 20, 40, 40);

// Plus grand
pdf.addImage(logoBase64, 'PNG', w/2 - 30, 15, 60, 60);
```

**Position actuelle** :
- `x = w/2 - 22` (centré horizontalement, -22mm depuis le centre)
- `y = 18` (18mm depuis le haut)
- Largeur : `44mm`
- Hauteur : `44mm`

---

## 🎨 Logo actuel (par défaut)

Si aucun logo n'est fourni, le PDF affiche :
- **Icône maison** stylisée
- Dans un **cercle bleu électrique** (#3b82f6)
- Design minimaliste et professionnel

---

## ✅ Vérifier que le logo fonctionne

1. Ajoutez votre logo (méthode 1, 2 ou 3)
2. Générez un rapport de test
3. Cliquez sur "Générer le PDF"
4. Vérifiez que votre logo apparaît sur la page de couverture

---

## 🆘 Dépannage

### Le logo ne s'affiche pas
- Vérifiez le chemin du fichier
- Vérifiez que le format est PNG ou JPG
- Vérifiez les permissions du fichier
- Regardez la console navigateur (F12) pour les erreurs

### Le logo est déformé
- Utilisez un logo au format carré (ex: 500x500px)
- Ajustez les dimensions dans le code

### Le logo est trop petit/grand
- Modifiez les valeurs de largeur/hauteur dans `pdf.addImage()`

---

## 📞 Support

Si vous avez des questions, contactez le support FLINCO.
