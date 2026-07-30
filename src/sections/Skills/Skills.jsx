import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Mark from "./SkillMarks";
import "./Skills.css";

gsap.registerPlugin(ScrollTrigger);

// Skills as a 3D carousel: the tools sit on a cylinder that turns by itself,
// and can be dragged or stepped through. Whichever card is facing you is the
// "active" one, and the readout underneath names it — so the ring is not just
// decoration, it drives the copy.
const TOOLS = [
  { id: "react", name: "React", cat: "Component UI" },
  { id: "next", name: "Next.js", cat: "App framework" },
  { id: "typescript", name: "TypeScript", cat: "Type safety" },
  { id: "gsap", name: "GSAP", cat: "Motion" },
  { id: "three", name: "Three.js", cat: "3D / WebGL" },
  { id: "figma", name: "Figma", cat: "Design & handoff" },
  { id: "webflow", name: "Webflow", cat: "Visual CMS" },
  { id: "hubspot", name: "HubSpot", cat: "CMS & CRM" },
  { id: "tailwind", name: "Tailwind", cat: "Styling" },
  { id: "framer", name: "Framer Motion", cat: "Interaction" },
  { id: "node", name: "Node", cat: "Tooling & APIs" },
];

const STEP = 360 / TOOLS.length;
// Degrees per *second*, not per frame — a per-frame constant would spin twice
// as fast on a 120Hz display as on a 60Hz one.
const AUTO_DPS = 10;
const MAX_DPS = 900; // ceiling on a thrown drag
const norm = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;

export default function Skills() {
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const cardsRef = useRef([]);
  const [active, setActive] = useState(0);

  // Rotation state lives in a ref — it is written every frame and must not
  // trigger React renders. Only the active index is state.
  const spin = useRef({
    angle: 0,
    vel: AUTO_DPS,
    dragging: false,
    paused: false,
  });

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let lastActive = -1;
    const tick = (time, deltaTime) => {
      // Clamped so a backgrounded tab does not resume with one huge jump.
      const dt = Math.min(deltaTime, 50) / 1000;
      const s = spin.current;
      if (!s.dragging) {
        // Ease back to the idle drift after a throw. The exponential form
        // makes the settle take the same wall-clock time at any frame rate.
        const target = s.paused || reduced ? 0 : AUTO_DPS;
        s.vel += (target - s.vel) * (1 - Math.exp(-3.5 * dt));
      }
      s.angle += s.vel * dt;

      if (ringRef.current) {
        ringRef.current.style.transform = `rotateX(-7deg) rotateY(${s.angle}deg)`;
      }

      // Facing value per card: 1 when it is pointed at the viewer, 0 when it
      // has turned away. Drives depth cueing in CSS.
      let best = 0;
      let bestAbs = Infinity;
      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        const world = norm(s.angle + i * STEP);
        const f = (Math.cos((world * Math.PI) / 180) + 1) / 2;
        el.style.setProperty("--f", f.toFixed(3));
        const a = Math.abs(world);
        if (a < bestAbs) {
          bestAbs = a;
          best = i;
        }
      });

      if (best !== lastActive) {
        lastActive = best;
        setActive(best);
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Drag to spin.
  useEffect(() => {
    const stage = rootRef.current?.querySelector(".sk-stage");
    if (!stage) return;
    let lastX = 0;
    let lastT = 0;
    let id = null;

    const down = (e) => {
      id = e.pointerId;
      lastX = e.clientX;
      lastT = performance.now();
      spin.current.dragging = true;
      stage.setPointerCapture(id);
      stage.classList.add("is-dragging");
    };
    const move = (e) => {
      if (!spin.current.dragging || e.pointerId !== id) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dtms = Math.max(8, now - lastT);
      lastX = e.clientX;
      lastT = now;

      const dDeg = dx * 0.25;
      spin.current.angle += dDeg;
      // Momentum carried out of the drag, in deg/sec so it matches the units
      // the ticker integrates.
      spin.current.vel = Math.max(
        -MAX_DPS,
        Math.min(MAX_DPS, (dDeg / dtms) * 1000),
      );
    };
    const up = (e) => {
      if (!spin.current.dragging) return;
      spin.current.dragging = false;
      if (id !== null && stage.hasPointerCapture?.(id))
        stage.releasePointerCapture(id);
      id = null;
      stage.classList.remove("is-dragging");
    };

    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
    };
  }, []);

  // Heading reveal.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".sk-lift", {
        y: 34,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: rootRef.current, start: "top 72%" },
      });
      gsap.from(".sk-stage", {
        opacity: 0,
        scale: 0.9,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 62%" },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Step one card at a time.
  const step = (dir) => {
    spin.current.angle -= dir * STEP;
    spin.current.vel = 0;
  };

  const pause = (v) => () => {
    spin.current.paused = v;
  };

  const current = TOOLS[active];

  return (
    <section id="skills" className="sk" data-nav="dark" ref={rootRef}>
      <div className="sk-inner">
        <header className="sk-head">
          <span className="sk-kicker sk-lift">
            <span className="sk-kicker-dot" /> Skills
          </span>
          <h2 className="sk-title sk-lift">
            What I <span className="sk-title-outline">build with</span>
          </h2>
          <p className="sk-intro sk-lift">
            Drag the ring, or let it turn. Everything here is something I reach
            for on a real project.
          </p>
        </header>

        <div
          className="sk-stage"
          onMouseEnter={pause(true)}
          onMouseLeave={pause(false)}
        >
          <div className="sk-ring" ref={ringRef}>
            {TOOLS.map((t, i) => (
              <article
                key={t.id}
                ref={(el) => (cardsRef.current[i] = el)}
                className={`sk-card${i === active ? " is-active" : ""}`}
                style={{
                  transform: `rotateY(${i * STEP}deg) translateZ(var(--sk-r))`,
                }}
              >
                {/* Two faces. The far half of the cylinder has its back to
                    you, so without a second, already-flipped face it either
                    vanishes (backface culled) or shows mirrored text. */}
                {["front", "back"].map((side) => (
                  <span key={side} className={`sk-card-face is-${side}`}>
                    <span className="sk-card-panel">
                      <span className="sk-card-mark">
                        <Mark id={t.id} />
                      </span>
                      <span className="sk-card-name">{t.name}</span>
                    </span>
                  </span>
                ))}
              </article>
            ))}
          </div>

          {/* Grounding shadow under the cylinder. */}
          <div className="sk-floor" aria-hidden="true" />
        </div>

        {/* Readout — the ring's live caption. */}
        <div className="sk-readout">
          <button
            type="button"
            className="sk-nav"
            onClick={() => step(-1)}
            aria-label="Previous tool"
          >
            ←
          </button>

          <div className="sk-readout-text" aria-live="polite">
            <strong key={current.name}>{current.name}</strong>
            <span>{current.cat}</span>
          </div>

          <button
            type="button"
            className="sk-nav"
            onClick={() => step(1)}
            aria-label="Next tool"
          >
            →
          </button>
        </div>

        {/* Plain-text fallback + real content for search and screen readers. */}
        <ul className="sk-legend">
          {TOOLS.map((t, i) => (
            <li key={t.id} className={i === active ? "is-active" : undefined}>
              {t.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
