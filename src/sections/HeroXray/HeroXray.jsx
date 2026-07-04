import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Hero from "../Hero/Hero";
import SplashCursor from "./SplashCursor";
import dragon from "../../assets/dragon.png";
import "./HeroXray.css";

// A chain of metaballs reveals the dragon: the head follows the cursor, every
// other ball follows the one before it, so the reveal flows and pools like a
// fluid. The SplashCursor adds the flowing liquid splash on top of it.
const N = 14;
const HEAD_R = 92;
const TAIL_R = 20;

// Ambient auto-sweep: while the cursor is away, the x-ray reveal occasionally
// glides across the hero from left to right on its own.
const SWEEP_FIRST_DELAY = 2;
const SWEEP_DELAY = 2;
// Each sweep picks its own pace: often a quick dash across the hero, the
// rest of the time a slow drift (landonorris.com-style variety).
const SWEEP_FAST_CHANCE = 0.65;
const SWEEP_FAST_DURATION = [0.3, 0.5];
const SWEEP_SLOW_DURATION = [1.2, 1.8];
// Auto sweeps reveal through a larger lens than the cursor does.
const SWEEP_SCALE = 1.7;

export default function HeroXray() {
  const stackRef = useRef(null);

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

      // The reveal is driven by cursor movement: it appears while moving and
      // melts away when the cursor holds still (no static circle on hover).
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
        dir: 1, // 1 = left→right, -1 = the return pass right→left
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

        // The cursor always wins: entering the hero cancels a running sweep.
        if (over) {
          sweep.active = false;
        } else if (sweep.active) {
          sweep.t += dt / sweep.dur;
          if (sweep.t >= 1) {
            if (sweep.dir === 1) {
              // Bounce off the right edge and come back the other way.
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
        } else {
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
          // Balls scatter more toward the tail, so the goo stretches and
          // splits into droplets like the liquid splash.
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

  return (
    <div className="hero-stack" ref={stackRef}>
      {/* Front face — Jannatul */}
      <Hero id="hero" />

      {/* Back face — dragon, revealed through the metaball lens */}
      <div className="hero-xray" aria-hidden="true">
        <Hero portrait={dragon} variant="dragon" animate={false} />
      </div>

      {/* Metaball lens mask */}
      <svg className="lens-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="liquidGoo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="15"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            {/* Ripple the goo edge through a noise field so the reveal has
                the same wobbly, splashy contour as the liquid cursor. */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap in="goo" in2="noise" scale="30" />
          </filter>
          <mask id="liquidLens" maskContentUnits="userSpaceOnUse">
            <g filter="url(#liquidGoo)">
              {Array.from({ length: N }).map((_, i) => (
                <circle
                  key={i}
                  className="lens-c"
                  cx="0"
                  cy="0"
                  r="0"
                  fill="#ffffff"
                />
              ))}
            </g>
          </mask>
        </defs>
      </svg>

      {/* Flowing liquid splash cursor */}
      <SplashCursor />
    </div>
  );
}
