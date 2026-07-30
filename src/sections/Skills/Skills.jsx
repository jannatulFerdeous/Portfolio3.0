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

// Measured rather than hard-coded: the stage height is a clamp() that changes
// with the viewport, and the laid-down circle has to land on its floor.
const stageHalf = (root) => {
  const el = root?.querySelector(".sk-stage");
  return el ? el.offsetHeight / 2 : 150;
};

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

  // Heading reveal, in three beats:
  //   1. a flat 2D circle draws itself, facing the viewer;
  //   2. it tips over on X until it is lying flat in depth — the footprint
  //      the cylinder will stand on;
  //   3. the cards rise off that footprint and the carousel takes over,
  //      while the drawn circle settles back as its track.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Held back until the circle has laid down. Set outside the timeline so
      // there is never a frame of the ring sitting there first.
      gsap.set(".sk-stage", { autoAlpha: 0 });
      // A long perspective on purpose: at 1000px this wide a circle keystones
      // hard once it tips, and lands as a lopsided swoosh instead of an
      // ellipse. This is close to an orthographic squash.
      gsap.set(".sk-orbit", {
        autoAlpha: 0,
        transformPerspective: 2600,
        transformOrigin: "50% 50%",
      });

      const reveal = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 68%",
          once: true,
        },
      });

      reveal
        .from(".sk-lift", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
        })
        // ---- 1. Draw. Flat to the viewer, at the size of a ball.
        .set(".sk-orbit", { autoAlpha: 1, rotateX: 0, y: 0, scale: 0.26 })
        .fromTo(
          ".sk-orbit-line",
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" },
          "-=0.2",
        )
        // The body fills in behind the completed outline, so it stops reading
        // as an outline and starts reading as a solid ball.
        .fromTo(
          ".sk-orbit-body",
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
          "-=0.25",
        )
        // ---- 2. Tip over on X and open out to full width. The ball loses
        // its volume as it goes, because flat-on there is nothing to shade.
        .to(
          ".sk-orbit",
          {
            rotateX: -74,
            scale: 1,
            y: () => stageHalf(rootRef.current) * 0.78,
            duration: 1.05,
            ease: "power3.inOut",
          },
          "lay",
        )
        // Thinned in step with the scale-up, so the line keeps one weight.
        .to(
          ".sk-orbit-line",
          { strokeWidth: 0.6, duration: 1.05, ease: "power3.inOut" },
          "lay",
        )
        .to(
          ".sk-orbit-body",
          { opacity: 0, duration: 0.7, ease: "power2.in" },
          "lay+=0.15",
        )
        // ---- 3. The carousel stands up out of the footprint.
        .set(".sk-stage", { autoAlpha: 1 }, "rise")
        .from(
          ".sk-stage",
          {
            scale: 0.42,
            transformOrigin: "50% 62%",
            duration: 0.95,
            ease: "back.out(1.2)",
          },
          "rise",
        )
        .from(
          ".sk-card-panel",
          {
            y: 46,
            scale: 0.8,
            opacity: 0,
            duration: 0.7,
            ease: "back.out(1.5)",
            stagger: 0.035,
            clearProps: "transform,opacity",
          },
          "rise",
        )
        // Handed off: once the cards are up, the line has nothing left to
        // say, so it goes. autoAlpha rather than opacity so it is taken out
        // of paint entirely and cannot sit over the ring at 0.
        .to(
          ".sk-orbit",
          { autoAlpha: 0, duration: 0.55, ease: "power2.out" },
          "rise+=0.25",
        )
        .from(
          ".sk-readout, .sk-legend",
          {
            y: 18,
            opacity: 0,
            duration: 0.65,
            ease: "power3.out",
            stagger: 0.1,
          },
          "-=0.25",
        );
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

        {/* The drawn circle lives beside the stage, not in it: the stage is
            held hidden until the circle has laid down, and a child would be
            hidden along with it. */}
        <div className="sk-theatre">
          <div className="sk-orbit" aria-hidden="true">
            <span className="sk-orbit-body" />
            <svg className="sk-orbit-svg" viewBox="0 0 200 200">
              {/* pathLength normalises the circumference to 1, so the dash
                  pair below draws the stroke without measuring anything. */}
              <circle
                className="sk-orbit-line"
                cx="100"
                cy="100"
                r="99"
                pathLength="1"
              />
            </svg>
          </div>

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
