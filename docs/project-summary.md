# Portfolio 3.0 — Project Summary

## Overview
A modern, animated personal portfolio website built with React + Vite, featuring GSAP scroll animations and a Three.js interactive 3D sphere in the hero section.

**Developer:** Jannatul Ferdeous  
**Email:** jannatul.ferdeous468@gmail.com  
**Version:** 3.0  
**Started:** June 2026

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite 6 | Build tool & dev server |
| GSAP + ScrollTrigger | Scroll-based animations, entrance effects |
| Three.js | 3D graphics engine |
| @react-three/fiber | React wrapper for Three.js |
| @react-three/drei | Three.js helpers (OrbitControls, MeshDistortMaterial) |

---

## Project Structure
```
Portfolio3.0/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx      # Fixed nav with GSAP entrance + scroll detection
│   │   ├── Navbar.css
│   │   ├── Footer.jsx
│   │   ├── Footer.css
│   │   └── ThreeScene.jsx  # Three.js animated sphere (React Three Fiber)
│   ├── sections/
│   │   ├── Hero.jsx        # Full-screen hero with GSAP text animation + 3D sphere
│   │   ├── Hero.css
│   │   ├── About.jsx       # About section with stats cards
│   │   ├── About.css
│   │   ├── Skills.jsx      # Skill groups with scroll-triggered cards
│   │   ├── Skills.css
│   │   ├── Projects.jsx    # Project cards with GitHub / live links
│   │   ├── Projects.css
│   │   ├── Contact.jsx     # Contact form
│   │   └── Contact.css
│   ├── App.jsx
│   ├── App.css             # Global styles + CSS variables
│   └── main.jsx
├── docs/
│   ├── skills.md           # Skills reference + GSAP/Three.js cheat sheets
│   └── project-summary.md  # This file
└── index.html
```

---

## Sections

### Hero
- Split layout: text (left) + 3D canvas (right)
- GSAP staggered entrance animation on text elements
- Three.js distorted sphere with ambient/directional/point lights
- CTA buttons linking to Projects and Contact sections

### About
- 2-column grid: bio text + stat cards (Years Experience, Projects, Technologies)
- GSAP ScrollTrigger fade-in on scroll

### Skills
- 3 skill cards: Frontend / Animation & 3D / Tools
- Hover lift effect, scroll-triggered stagger animation

### Projects
- 4 project cards with title, description, tech tags, GitHub + live links
- Hover lift + border highlight effect

### Contact
- 2-column layout: contact info + form
- Form with name, email, message fields
- Success state after submission

---

## Design System

### Colors
```css
--bg: #0a0a0f           /* dark background */
--bg-card: #12121a      /* card background */
--accent: #6c63ff       /* purple accent */
--accent-2: #ff6584     /* pink accent */
--text: #e0e0e0         /* body text */
--text-muted: #888      /* secondary text */
--border: #1e1e2e       /* subtle borders */
```

### Typography
- Font: `Segoe UI`, system-ui, sans-serif
- Heading sizes: fluid with `clamp()`
- Section titles: underline via `::after` pseudo-element

---

## Animations

### GSAP Patterns Used
1. **Navbar entrance** — `fromTo` y: -80 → 0, opacity 0 → 1
2. **Hero text stagger** — `timeline` with `.querySelectorAll('.animate')`
3. **Section reveals** — `ScrollTrigger` with `start: 'top 80%'`
4. **Card stagger** — `stagger: 0.12–0.15` for sequential card reveals

### Three.js Scene
- Distorted sphere using `MeshDistortMaterial` from `@react-three/drei`
- `useFrame` for continuous rotation animation
- `OrbitControls` with `autoRotate` for passive movement
- Lighting: ambient + directional (purple) + point (pink)

---

## Next Steps / TODO
- [ ] Add real project screenshots / images
- [ ] Wire up contact form to EmailJS or Formspree
- [ ] Add smooth page transitions between sections
- [ ] Add cursor follower animation
- [ ] Implement dark/light mode toggle
- [ ] Deploy to Netlify / Vercel
- [ ] Add OG meta tags for social sharing
- [ ] Performance optimization (lazy loading Three.js scene)
