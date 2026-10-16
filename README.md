# Duotone Atelier

Studio **duotone** gratuit dans le navigateur pour graphistes. Charge une image, choisis les couleurs d’ombre et de lumière, ajuste force / luminosité / contraste, prévisualise en direct et exporte en PNG. **Tout reste local** — aucun envoi, aucune clé API.

**Démo :** [https://salimadour31-boop.github.io/duotone-atelier/](https://salimadour31-boop.github.io/duotone-atelier/)

## Fonctionnalités

- Chargement d’image (fichier ou glisser-déposer)
- Duotone en direct : luminance → dégradé ombre / lumière
- Force duotone (0–100 %), luminosité et contraste
- 8 préréglages nommés (Midnight Blue, Sunset Print, Forest Ink, Magenta Spotlight, Sepia Press, Arctic Neon, Ochre Poster, Mono Soft)
- Échanger / aléatoire / copier HEX
- Export PNG (même taille que la source, plafonnée à 4096 px)
- Interface FR / EN / Taqbaylit (Tamazight, écriture latine)
- Raccourci : `Échap` efface l’image

## Utilisation

1. Ouvre la [démo](https://salimadour31-boop.github.io/duotone-atelier/) ou ouvre `index.html` en local.
2. Glisse une image ou clique sur la zone de dépôt.
3. Choisis un préréglage ou tes propres couleurs.
4. Ajuste les curseurs, puis **Exporter PNG**.

En local sans serveur :

```bash
python3 -m http.server 8080
# puis http://localhost:8080
```

## Langues

| Code | Langue |
|------|--------|
| `fr` | Français (défaut) |
| `en` | English |
| `kab` | Taqbaylit (Tamazight, Latin) |

## Technique

- HTML / CSS / JS vanille (pas de framework, pas de npm)
- Traitement 100 % `canvas` dans le navigateur
- Compatible desktop (~1280) et mobile (~375)

## Licence

[MIT](LICENSE) © 2026 Amirouche Amwanes
