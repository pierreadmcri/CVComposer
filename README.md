# CVComposer

CVComposer est un créateur de CV optimisé ATS qui tourne **entièrement en local** sur votre PC via une application web statique. J’ai choisi cette architecture car c’est **la plus simple à manipuler** : pas de backend, pas de base de données, pas de build obligatoire, et elle peut ensuite être empaquetée dans Tauri si vous voulez une vraie app desktop.

## Fonctionnalités

- 3 templates de CV ATS et impression A4.
- Import de profil LinkedIn via **CSV exporté par LinkedIn** (après décompression du ZIP), ancien **JSON exporté** ou **collage manuel** d’un extrait.
- Modification des sections principales : infos perso, compétences, expériences, formation, projets, certifications.
- Ajout de sections personnalisées.
- Score ATS indicatif avec conseils.
- Export PDF via l’impression navigateur (`window.print`) avec feuille prête pour A4.
- Sauvegarde locale automatique dans `localStorage`.

## Pourquoi ce choix technique

### Option retenue : serveur local léger ou simple ouverture du fichier

- Vous pouvez ouvrir `index.html` directement dans le navigateur.
- Ou démarrer un mini serveur local pour une expérience plus propre.
- Cette base est très simple à maintenir et parfaite pour un usage personnel sur PC.

### Évolution conseillée plus tard

Si vous voulez un vrai exécutable desktop, le plus logique sera d’ajouter **Tauri** autour de cette base web.

## Lancer l’application

### Option 1 — ouverture directe

Ouvrez simplement `index.html` dans votre navigateur.

### Option 2 — mini serveur local

```bash
python3 -m http.server 4173
```

Puis ouvrez `http://localhost:4173`.

## Import LinkedIn recommandé

### Peut-on connecter LinkedIn “directement” ?

Pas proprement dans cette architecture actuelle : CVComposer est une application **100% locale et statique**, sans backend. Une vraie connexion directe à LinkedIn demanderait au minimum :

- une application LinkedIn Developer,
- une authentification OAuth,
- la gestion sécurisée d’un secret côté serveur,
- et des permissions API spécifiques.

Pour garder l’outil simple et local-first, l’application prend désormais en charge une solution plus réaliste :

- **les CSV de l’archive LinkedIn** une fois le ZIP décompressé,
- les anciens **JSON exportés** si vous en avez déjà,
- ou le **collage de texte brut** depuis votre profil.

### Flux conseillé

1. Depuis LinkedIn, demandez votre **archive de données**.
2. Décompressez le ZIP reçu.
3. Importez dans CVComposer les fichiers CSV utiles comme `Profile.csv`, `Positions.csv`, `Education.csv` et `Skills.csv`.
4. Complétez ensuite à la main les éventuels champs manquants.

## Export PDF

Cliquez sur **Télécharger en PDF** : l’application ouvre simplement la boîte d’impression du navigateur. Vous pourrez ensuite choisir **Enregistrer en PDF**.
