import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import defaultPortrait from "../../assets/my-image.jpg";
import "./Hero.css";

// The photo face of the hero: just the paper background + bottom-anchored
// portrait. The availability/reveal cards and meta live one level up in
// HeroXray as a persistent overlay, so they never slide away with the face.
export default function Hero({ portrait = defaultPortrait, id, animate = true }) {
  const rootRef = useRef(null);

  useEffect(() => {
    // The face only needs its entrance once (the front face). Copies used
    // for the swap render static.
    if (!animate) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-portrait", { yPercent: 6, opacity: 0, duration: 1.1 });
    }, rootRef);

    return () => ctx.revert();
  }, [animate]);

  return (
    <section className="hero" ref={rootRef} id={id}>
      {/* Large bottom-anchored portrait */}
      <div className="hero-portrait">
        <img src={portrait} alt="Jannatul Ferdeous" draggable="false" />
      </div>
    </section>
  );
}
