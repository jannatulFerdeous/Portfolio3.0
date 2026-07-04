import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import defaultPortrait from "../../assets/my-image.jpg";
import "./Hero.css";

export default function Hero({
  portrait = defaultPortrait,
  id,
  animate = true,
  variant,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    // The back/dragon face renders static (animate=false): no entrance, no
    // looping pattern tweens — it only needs to sit behind the front face.
    if (!animate) return;

    const ctx = gsap.context(() => {
      // Entrance
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-portrait", { yPercent: 6, opacity: 0, duration: 1.1 })
        .from(".hero-card", { x: -36, opacity: 0, duration: 0.7 }, 0.55)
        .from(".hero-meta", { opacity: 0, duration: 0.7 }, 0.6);
    }, rootRef);

    return () => ctx.revert();
  }, [animate]);

  return (
    <section
      className={`hero${variant ? ` hero--${variant}` : ""}`}
      ref={rootRef}
      id={id}
    >
      {/* Large bottom-anchored portrait */}
      <div className="hero-portrait">
        <img src={portrait} alt="Jannatul Ferdeous" />
      </div>

      {/* Bottom-left info card */}
      <aside className="hero-card">
        <span className="card-top">CURRENTLY</span>
        <div className="card-mid">
          <span className="status-dot" />
          AVAILABLE
          <br />
          FOR WORK
        </div>
        <span className="card-bottom">FRONTEND DEVELOPER · 2025</span>
      </aside>

      {/* Bottom-right meta */}
      <div className="hero-meta">
        <span>PORTFOLIO ’25</span>
        <span>SCROLL ↓</span>
      </div>
    </section>
  );
}
