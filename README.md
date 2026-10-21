<div align="center">

# 🌌 ORBITAL — Space Explorer

### Explore the Solar System, Milky Way & Black Holes in one interactive browser experience.

**A cinematic, interactive astronomy explorer built with HTML, CSS and JavaScript.**

[![HTML5](https://img.shields.io/badge/HTML5-Web%20App-E34F26?logo=html5&logoColor=white)](index.html)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive-1572B6?logo=css&logoColor=white)](style.css)
[![JavaScript](https://img.shields.io/badge/JavaScript-Interactive-F7DF1E?logo=javascript&logoColor=black)](script.js)
[![No dependencies](https://img.shields.io/badge/Dependencies-None-29a87b)](#-tech-stack)

**[▶ Live ORBITAL demo — Solar System, Milky Way & Black Hole](https://viveksahu1974.github.io/portfolio/orbital/)** · Hosted on the [Vivek Sahu portfolio](https://viveksahu1974.github.io/portfolio/#projects) via GitHub Pages. This link runs the actual HTML/CSS/JavaScript space explorer without installing anything.

**[🚀 Launch on GitHub Pages (after activation)](https://viveksahu1974.github.io/ORBITAL-Space-Explorer/)** · **[💻 View source](https://github.com/viveksahu1974/ORBITAL-Space-Explorer)**

</div>

---

## ✨ About the project

**ORBITAL** is an interactive space visualizer designed to make astronomy fun and accessible. A three-card welcome screen lets visitors choose between a Solar System simulation, an artistic Milky Way map, and a cinematic Black Hole experience. Select a celestial object to explore its scientific facts in an easy-to-read information panel.

The scenes use an animated HTML5 Canvas with a 3D-style projected camera, glowing objects, star fields and smooth interaction. **The app is educational and visually stylized**: distances, sizes, orbital timing, colors, and black-hole effects are not a scale-accurate scientific simulation.

## 🌠 Three interfaces

| Experience | What you'll explore |
|---|---|
| ☀️ **Solar System** | Sun + all eight planets, moving orbits, Earth's Moon, Saturn's rings, and an asteroid belt |
| 🌌 **Milky Way** | Spiral galaxy, its center, the Orion Spur, the Solar Neighborhood, and Sagittarius A* |
| 🕳️ **Black Hole** | A black hole, event horizon, glowing accretion disk, and relativistic jets |

### ☀️ Solar System

- All **8 planets**: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune.
- Select the **Sun** to view its diameter, mass, age, temperature, and other facts.
- Click planets to open information about their type, size, distance from the Sun, moons, rotation, year length, temperature and interesting facts.
- Orbital animation, rotating planetary surface effects, Earth's Moon, Saturn's rings and an asteroid belt.

### 🌌 Milky Way

- Glowing galactic core and moving spiral-star particles.
- Clickable information about **the Milky Way**, **Sagittarius A\***, **Orion Spur**, and **the Solar Neighborhood**.
- A rotating, parallax-enhanced 3D-style perspective.

### 🕳️ Black Hole

- An artistic black-hole scene with an event horizon, hot accretion disk and particle jets.
- Learn how black holes bend spacetime, how disks become luminous, and what relativistic jets are.
- Clickable panels explain each part of the visualization.

## 🎮 Controls

| Action | Desktop | Mobile / touch |
|---|---|---|
| **Rotate camera** | Left-click + drag | Drag with one finger |
| **Pan camera** | Shift + drag (or right-click drag) | — |
| **Zoom** | Mouse wheel, `+`, `-` | Pinch with two fingers |
| **View details** | Click a Sun/planet/object or use the object buttons | Tap an object or object button |
| **Play / pause** | On-screen button or `Space` | On-screen button |
| **Change speed** | TIME SPEED slider | TIME SPEED slider |
| **Toggle labels / guides** | Labels / Guides switches | Labels / Guides switches |
| **Reset camera** | Reset button or `R` | Reset button |
| **Switch interfaces** | Scenes button or top menu | Scenes button or top menu |
| **Fullscreen** | Fullscreen icon | Fullscreen icon (browser support permitting) |

## 🗂️ Project structure

```text
ORBITAL-Space-Explorer/
├── index.html       # Main interface, layouts and controls
├── style.css        # Responsive dark-space theme and animations
├── script.js        # Scene rendering, camera motion, interactions and facts
└── README.md        # Project overview and setup instructions
```

## 🚀 Getting started

**No installation, training, API keys, or external libraries required.**

1. Download the repository with **Code → Download ZIP**, or clone it:

   ```bash
   git clone https://github.com/viveksahu1974/ORBITAL-Space-Explorer.git
   ```
2. Open the `ORBITAL-Space-Explorer` folder.
3. Double-click **`index.html`** to launch it in Chrome, Edge, Firefox, or Safari.
4. Choose **Solar System**, **Milky Way**, or **Black Hole** on the opening screen.

For a local development server, you can use:

```bash
python -m http.server 5500
```

Then open **http://localhost:5500**.

## 🌍 Publish as a live website with GitHub Pages

To make the project available through a shareable website:

1. Open the repository's **Settings** tab.
2. Under **Code and automation**, select **Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select branch **`main`** and folder **`/(root)`**, then click **Save**.
5. After GitHub finishes deploying, visit **https://viveksahu1974.github.io/ORBITAL-Space-Explorer/**.

> The link is the **expected GitHub Pages address** after deployment is enabled; the repository being public does not itself mean Pages is active.

## 🛠️ Tech stack

- **HTML5** — application and accessibility markup
- **CSS3** — responsive layout, glass-style panels, animations and glow
- **Vanilla JavaScript** — planet data, camera interaction and scene controls
- **HTML5 Canvas 2D** — custom perspective projection and 3D-style rendering; **not Three.js / WebGL**
- No build pipeline or runtime dependencies

## 📱 Responsive design

Designed for desktops, laptops and mobile browsers with a responsive interface, touch gestures and a compact info panel on smaller screens. Rendering performance can vary by device.

## 📚 Scientific and visual notes

- Planetary information is approximate and may change as new discoveries are confirmed (particularly moon counts).
- Orbital distances and planet sizes are **intentionally compressed/exaggerated**, so all objects remain visible.
- Milky Way shapes and the black-hole accretion effects are **illustrative**, not astronomical measurements or general-relativistic calculations.

## 👨‍💻 Developer

**Vivek Sahu**  
GitHub: [@viveksahu1974](https://github.com/viveksahu1974)

---

<div align="center">

*Explore beyond the horizon. ☀️ 🪐 🌌*

</div>