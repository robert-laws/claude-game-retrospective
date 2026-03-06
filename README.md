# 1990s Gaming Retrospective Website

A nostalgic journey through the greatest video games of the 1990s. This static website blends retro pixel art aesthetics with modern web design, featuring a playable side-scrolling game, informational sections on 15 iconic games, a decade timeline, and chiptune audio.

## Features

- **Hero Section** - Animated pixel art scene with neon glow effects and CRT scanline overlay
- **Playable Side-Scrolling Game** - Canvas-based platformer with 3 levels, collectibles, enemies, and chiptune sound effects
- **15 Iconic Game Cards** - Grid layout with pixel art thumbnails, descriptions, fun facts, and platform filtering
- **Interactive Timeline** - Horizontal scrolling carousel covering 1990-1999
- **Chiptune Audio** - Web Audio API synthesized background music and sound effects (opt-in)
- **Responsive Design** - Works on desktop, tablet, and mobile with touch controls for the game
- **Accessibility** - Skip navigation, ARIA labels, keyboard navigation, reduced motion support

## Tech Stack

- Vanilla HTML5, CSS3, JavaScript (no frameworks or build tools)
- Google Fonts (Press Start 2P, DotGothic16)
- Canvas API for all pixel art rendering
- Web Audio API for all audio synthesis

No external assets or dependencies beyond Google Fonts.

## Running Locally

Open `index.html` directly in a browser, or serve with any static file server:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

Then visit `http://localhost:8000`.

## Game Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move Left | Arrow Left / A | Left button |
| Move Right | Arrow Right / D | Right button |
| Jump | Space / Arrow Up / W | Jump button |
| Start/Restart | Enter | Start button |
| Pause | P | - |

## Deploying to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings > Pages
3. Set source to "Deploy from a branch" and select `main` branch, root directory
4. The site will be live at `https://<username>.github.io/<repo-name>/`

## Project Structure

```
├── index.html          # Main page with all sections
├── css/
│   ├── styles.css      # Layout, components, design tokens
│   └── animations.css  # CRT effects, scroll animations, glow
├── js/
│   ├── audio.js        # Chiptune synthesizer
│   ├── game.js         # Side-scrolling platformer engine
│   └── main.js         # Site interactions, hero animation, card art
└── README.md
```
