# Production des contenus Regain

Modifier `content.json` pour changer les textes et sélectionner une photo dans `assets/images/`. Puis lancer depuis la racine du projet :

```bash
python3 scripts/marketing.py
```

Le script crée trois images 1080 × 1350 et deux vidéos verticales 1080 × 1920, 12 secondes, dans `marketing/output/`. Il utilise Pillow ; les vidéos nécessitent `ffmpeg` ou le paquet Python `imageio-ffmpeg`. Les vidéos sont **muettes** : ajouter une voix enregistrée et une musique autorisée pour la publicité avant diffusion. Les visuels sont des accroches de marque ; ajouter de vraies captures de l'app pour les annonces qui démontrent ses fonctions. Vérifier le texte et le lien de destination avant publication.

La génération est reproductible : mêmes textes et photos donnent les mêmes fichiers. L'automatisation de publication et des dépenses publicitaires reste à configurer dans les comptes des plateformes après validation des créations.
