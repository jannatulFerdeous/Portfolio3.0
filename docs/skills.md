# Skills — Jannatul Ferdeous

## Frontend Development
| Skill | Level |
|-------|-------|
| React | Advanced |
| JavaScript (ES6+) | Advanced |
| HTML5 | Advanced |
| CSS3 / Tailwind CSS | Advanced |
| TypeScript | Intermediate |

## Animation & 3D
| Skill | Level |
|-------|-------|
| GSAP (GreenSock Animation Platform) | Intermediate |
| Three.js | Beginner → Intermediate |
| React Three Fiber (@react-three/fiber) | Beginner → Intermediate |
| Framer Motion | Intermediate |
| CSS Animations & Transitions | Advanced |

## Tools & Workflow
| Skill | Level |
|-------|-------|
| Git & GitHub | Advanced |
| Vite | Intermediate |
| Figma | Intermediate |
| REST APIs | Advanced |
| Responsive Design | Advanced |

---

## Learning Goals
- [ ] Advanced GSAP ScrollTrigger techniques (pinning, scrub, parallax)
- [ ] Three.js shaders (GLSL) and custom materials
- [ ] React Three Fiber advanced patterns (physics, post-processing)
- [ ] Next.js (App Router)
- [ ] Node.js / Express backend basics

---

## GSAP Quick Reference

### Core API
```js
// Tween to target values
gsap.to('.element', { x: 100, opacity: 1, duration: 0.8, ease: 'power3.out' })

// Tween FROM values
gsap.fromTo('.element', { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })

// Timeline — sequenced animations
const tl = gsap.timeline({ delay: 0.5 })
tl.fromTo('.title', { opacity: 0 }, { opacity: 1, duration: 0.6 })
  .fromTo('.subtitle', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
```

### ScrollTrigger
```js
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

gsap.fromTo('.card', { y: 60, opacity: 0 }, {
  y: 0, opacity: 1,
  scrollTrigger: {
    trigger: '.card',
    start: 'top 80%',   // when top of element hits 80% of viewport
    end: 'bottom 20%',
    scrub: true,        // tie animation to scroll position
    pin: true,          // pin element during animation
  }
})
```

### Key Eases
- `power1–4.out` — quick start, gentle stop
- `back.out(1.7)` — slight overshoot
- `elastic.out(1, 0.3)` — bouncy
- `expo.out` — very fast start

---

## Three.js Quick Reference

### Scene Setup
```js
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(width, height)
document.body.appendChild(renderer.domElement)
```

### Basic Mesh
```js
const geometry = new THREE.SphereGeometry(1, 32, 32)
const material = new THREE.MeshStandardMaterial({ color: '#6c63ff', roughness: 0.2 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
```

### Lights
```js
scene.add(new THREE.AmbientLight('#ffffff', 0.5))
const dirLight = new THREE.DirectionalLight('#a89cff', 1)
dirLight.position.set(3, 3, 3)
scene.add(dirLight)
```

### Animation Loop
```js
function animate() {
  requestAnimationFrame(animate)
  mesh.rotation.y += 0.005
  renderer.render(scene, camera)
}
animate()
```

### React Three Fiber Equivalent
```jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function Box() {
  const ref = useRef()
  useFrame(() => { ref.current.rotation.y += 0.005 })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6c63ff" />
    </mesh>
  )
}

// Usage
<Canvas><Box /></Canvas>
```
