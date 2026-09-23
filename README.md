# DELOS Badge — Générateur de badge photo

Application web statique, premium et responsive pour la **Conférence DELOS — Média, Cinéma & IA**, du **21 au 26 septembre 2026**.

## Fonctionnalités

- Template DELOS inspiré du visuel fourni.
- Conservation du bandeau supérieur : Conférence DELOS / Média, Cinéma & IA / 21–26 septembre 2026.
- Conservation du footer : Pass 1000 FCFA / Pass 5000 FCFA / Centre CEV.
- Import JPG / PNG / WEBP.
- Recadrage automatique de la photo dans un cadre portrait.
- Déplacement tactile / souris.
- Zoom fluide.
- Export PNG HD 1080 × 1080.
- Partage natif via Web Share API sur les appareils compatibles.
- Aucune photo envoyée vers un serveur : tout est généré côté navigateur.

## Lancer le projet

### Option 1 — double clic
Ouvre `index.html` dans un navigateur moderne.

### Option 2 — serveur local recommandé
Depuis le dossier du projet :

```bash
python3 -m http.server 8080
```

Puis ouvre : `http://localhost:8080`

## Personnaliser

- `assets/template.png` : template graphique.
- `assets/event-qr.png` : QR de l'événement.
- `app.js` : dimensions du cadre photo, texte de partage, rendu « J'y serai ! ».
- `styles.css` : interface utilisateur.

## Important

Le QR fourni encode actuellement :

`CONFERENCE DELOS | MEDIA, CINEMA & IA | 21-26 SEPTEMBRE 2026`

Pour un QR qui ouvre une URL réelle (site officiel, billetterie, WhatsApp, etc.), remplace `assets/event-qr.png` par un QR encodant cette URL.
