import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Hero from "../Hero/Hero";
import photo from "../../assets/my-image.jpg";
import bgImage from "../../assets/backgroud-image.jpg";
import "./HeroXray.css";

// Two stacked hero "faces": the photo (hero 1) and the background image
// (hero 2). Whichever face is on top carries an INVERTED liquid-metaball
// mask — it's visible everywhere except where the lens punches holes, and
// through those holes you see the face beneath. So the x-ray peek works in
// BOTH directions: from hero 1 you peek hero 2, and once swapped, from
// hero 2 you peek hero 1.
//
// Clicking the reveal card slides the whole current face up and off, which
// reveals the other face beneath; then the two swap roles.
const N = 14;
const HEAD_R = 92;
const TAIL_R = 20;

// Ambient auto-sweep: while the cursor is away, the x-ray hole occasionally
// glides across the hero from left to right on its own.
const SWEEP_FIRST_DELAY = 2;
const SWEEP_DELAY = 2;
const SWEEP_FAST_CHANCE = 0.65;
const SWEEP_FAST_DURATION = [0.3, 0.5];
const SWEEP_SLOW_DURATION = [1.2, 1.8];
const SWEEP_SCALE = 1.7;

export default function HeroXray() {
  const stackRef = useRef(null);

  // Which hero is on top / in front. false → photo (hero 1), true → image
  // (hero 2). The top face is masked; the bottom face is the one revealed.
  const [revealed, setRevealed] = useState(false);
  const animatingRef = useRef(false);
  const photoRef = useRef(null);
  const imageRef = useRef(null);

  // Slide the current top face up and off, reveal the one beneath, then flip
  // roles. The slid face is reset to place on the next frame — once it's the
  // (hidden) bottom face — so there's no flash of the old hero.
  const toggleReveal = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const topEl = revealed ? imageRef.current : photoRef.current;
    if (!topEl) {
      setRevealed((v) => !v);
      animatingRef.current = false;
      return;
    }
    gsap.to(topEl, {
      yPercent: -100,
      duration: 0.75,
      ease: "power3.inOut",
      onComplete: () => {
        setRevealed((v) => !v);
        requestAnimationFrame(() => {
          gsap.set(topEl, { yPercent: 0 });
          animatingRef.current = false;
        });
      },
    });
  };

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const stack = stackRef.current;

    const ctx = gsap.context(() => {
      const circles = gsap.utils.toArray(".lens-c");
      const target = { x: -9999, y: -9999 };
      const env = { v: 0 };

      const pts = circles.map((el, i) => ({
        el,
        x: -9999,
        y: -9999,
        rBase: HEAD_R + (TAIL_R - HEAD_R) * (i / (N - 1)),
        sx: gsap.utils.random(0.8, 1.6),
        px: gsap.utils.random(0, 6.28),
      }));

      const HEAD = 0.4;
      const SEG = 0.45;

      let over = false;
      let prevTx = target.x;
      let prevTy = target.y;
      let speed = 0;

      const sweep = {
        active: false,
        t: 0,
        nextIn: SWEEP_FIRST_DELAY,
        baseY: 0,
        dur: SWEEP_SLOW_DURATION[1],
        dir: 1,
      };
      const startSweep = () => {
        const h = stack.clientHeight;
        const fast = Math.random() < SWEEP_FAST_CHANCE;
        const [dMin, dMax] = fast ? SWEEP_FAST_DURATION : SWEEP_SLOW_DURATION;
        sweep.active = true;
        sweep.t = 0;
        sweep.dir = 1;
        sweep.dur = gsap.utils.random(dMin, dMax);
        sweep.baseY = h * gsap.utils.random(0.35, 0.65);
        target.x = -HEAD_R;
        target.y = sweep.baseY;
        prevTx = target.x;
        prevTy = target.y;
        snap(target.x, target.y);
      };

      let lastT = gsap.ticker.time;
      let revealScale = 1;

      const tick = () => {
        const t = gsap.ticker.time;
        const dt = Math.min(t - lastT, 0.05);
        lastT = t;

        // Only peek while the hero is full-screen at the top of the page —
        // once it starts shrinking into the Message card, close the holes.
        const scrolled = window.scrollY > 60;
        if (scrolled) {
          over = false;
          sweep.active = false;
        }

        if (over) {
          sweep.active = false;
        } else if (sweep.active) {
          sweep.t += dt / sweep.dur;
          if (sweep.t >= 1) {
            if (sweep.dir === 1) {
              sweep.dir = -1;
              sweep.t = 0;
            } else {
              sweep.active = false;
              sweep.nextIn = SWEEP_DELAY;
            }
          } else {
            const p = sweep.t;
            const eased = p * p * (3 - 2 * p);
            const w = stack.clientWidth;
            const span = w + HEAD_R * 2;
            target.x =
              sweep.dir === 1 ? -HEAD_R + eased * span : w + HEAD_R - eased * span;
            target.y = sweep.baseY;
          }
        } else if (!scrolled) {
          sweep.nextIn -= dt;
          if (sweep.nextIn <= 0) startSweep();
        }

        const vx = target.x - prevTx;
        const vy = target.y - prevTy;
        prevTx = target.x;
        prevTy = target.y;
        speed += (Math.hypot(vx, vy) - speed) * 0.3;

        const wantEnv = over || sweep.active ? Math.min(speed / 6, 1) : 0;
        env.v += (wantEnv - env.v) * (wantEnv > env.v ? 0.3 : 0.06);
        const e = env.v;

        const wantScale = sweep.active ? SWEEP_SCALE : 1;
        revealScale += (wantScale - revealScale) * 0.12;

        pts[0].x += (target.x - pts[0].x) * HEAD;
        pts[0].y += (target.y - pts[0].y) * HEAD;
        for (let i = 1; i < pts.length; i++) {
          pts[i].x += (pts[i - 1].x - pts[i].x) * SEG;
          pts[i].y += (pts[i - 1].y - pts[i].y) * SEG;
        }
        for (let i = 0; i < pts.length; i++) {
          const s = pts[i];
          const r = s.rBase * e * revealScale * (1 + 0.12 * Math.sin(t * 2 + s.px));
          const scatter = e * 34 * (i / (N - 1));
          const ox = Math.cos(t * s.sx * 2.1 + s.px) * scatter;
          const oy = Math.sin(t * s.sx * 1.7 + s.px * 2.3) * scatter;
          s.el.setAttribute("cx", (s.x + ox).toFixed(1));
          s.el.setAttribute("cy", (s.y + oy).toFixed(1));
          s.el.setAttribute("r", Math.max(0, r).toFixed(1));
        }
      };
      gsap.ticker.add(tick);

      const snap = (x, y) => pts.forEach((s) => ((s.x = x), (s.y = y)));

      const onEnter = (ev) => {
        const r = stack.getBoundingClientRect();
        target.x = ev.clientX - r.left;
        target.y = ev.clientY - r.top;
        prevTx = target.x;
        prevTy = target.y;
        snap(target.x, target.y);
        over = true;
      };
      const onMove = (ev) => {
        const r = stack.getBoundingClientRect();
        target.x = ev.clientX - r.left;
        target.y = ev.clientY - r.top;
        over = true;
      };
      const onLeave = () => {
        over = false;
      };

      stack.addEventListener("mousemove", onMove);
      stack.addEventListener("mouseenter", onEnter);
      stack.addEventListener("mouseleave", onLeave);

      return () => {
        gsap.ticker.remove(tick);
        stack.removeEventListener("mousemove", onMove);
        stack.removeEventListener("mouseenter", onEnter);
        stack.removeEventListener("mouseleave", onLeave);
      };
    }, stackRef);

    return () => ctx.revert();
  }, []);

  const photoTop = !revealed;

  return (
    <div className="hero-stack" ref={stackRef}>
      {/* Photo face (hero 1) */}
      <div
        className={`hero-face hero-face--photo ${
          photoTop ? "is-top" : "is-bottom"
        }`}
        ref={photoRef}
      >
        <Hero id="hero" />
      </div>

      {/* Image face (hero 2) */}
      <div
        className={`hero-face hero-face--image ${
          photoTop ? "is-bottom" : "is-top"
        }`}
        ref={imageRef}
        aria-hidden="true"
      >
        <div
          className="hero-xray-bg"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      </div>

      {/* Persistent overlay: reveal card on top, availability card below */}
      <div className="hero-cards">
        <button
          type="button"
          className={`hero-reveal${revealed ? " is-active" : ""}`}
          onClick={toggleReveal}
          aria-pressed={revealed}
        >
          <span className="hero-reveal-icon" aria-hidden="true">
            ⇅
          </span>
          <span className="hero-reveal-text">
            <strong>{revealed ? "Back to me" : "The other side"}</strong>
            <span>{revealed ? "Return to portrait" : "Reveal · slide up"}</span>
          </span>
        </button>

        <aside className="hero-status">
          <span className="hero-status-dot" />
          <span className="hero-status-text">
            <strong>Available for work</strong>
            <span>Frontend Developer · 2025</span>
          </span>
        </aside>
      </div>

      {/* Bottom-right meta */}
      <div className="hero-meta">
        <span>PORTFOLIO ’25</span>
        <span>SCROLL ↓</span>
      </div>

      {/* Inverted metaball lens mask: white everywhere, holes at the goo. */}
      <svg className="lens-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="liquidGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap in="goo" in2="noise" scale="30" />
          </filter>
          <mask
            id="liquidLens"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="10000"
            height="10000"
          >
            {/* Visible everywhere… */}
            <rect x="0" y="0" width="10000" height="10000" fill="#ffffff" />
            {/* …except where the black goo punches holes to the face below. */}
            <g filter="url(#liquidGoo)">
              {Array.from({ length: N }).map((_, i) => (
                <circle
                  key={i}
                  className="lens-c"
                  cx="0"
                  cy="0"
                  r="0"
                  fill="#000000"
                />
              ))}
            </g>
          </mask>
        </defs>
      </svg>
    </div>
  );
}
