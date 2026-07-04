import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./Loader.css";

// Dark intro (ordernchaos-style): sentences appear one by one at scattered
// positions. Finale in two beats: everything fades in place except
// "who we truly are", then that fragment travels to the centre — and the
// black section shutters up.
const LINES = [
  "There are things that are unknown",
  "Things that are only known through the rigorous process of experimentation",
  "Pushing the boundaries of our existence to reveal our weaknesses",
];
const LAST_HEAD =
  "Going against all we know to be true, as that is the only way we can discover ";
const LAST_KEEP = "who we truly are";

export default function Loader({ onComplete }) {
  const rootRef = useRef(null);
  const tlRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete });
      tlRef.current = tl;

      // Sentences rise in one after another, slow and smooth.
      gsap.utils.toArray(".loader-line").forEach((line, i) => {
        tl.fromTo(
          line,
          { y: 44, opacity: 0 },
          { y: 0, opacity: 1, duration: 2.2, ease: "power2.out" },
          0.6 + i * 2.3,
        );
      });
      tl.fromTo(
        ".loader-skip",
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "none" },
        1.4,
      );

      // Beat 1 — everything fades in place; only "who we truly are" stays.
      tl.to({}, { duration: 1 });
      tl.addLabel("finale");
      tl.to(".loader-line--fade, .loader-last-head", {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
      });
      tl.to({}, { duration: 0.5 });

      // Beat 2 — the surviving fragment travels from its spot to the centre.
      tl.to(".loader-last-keep", {
        x: (i, el) => {
          const r = el.getBoundingClientRect();
          return window.innerWidth / 2 - (r.left + r.width / 2);
        },
        y: (i, el) => {
          const r = el.getBoundingClientRect();
          return window.innerHeight / 2 - (r.top + r.height / 2);
        },
        scale: 1.2,
        duration: 1.3,
        ease: "power3.inOut",
      });
      tl.to({}, { duration: 1 });

      // Shutter exit: the black panel snaps up while its bottom edge bows
      // into a curve mid-rise, then flattens out as it leaves the screen.
      tl.addLabel("exit");
      tl.to(".loader-skip", { opacity: 0, duration: 0.3, ease: "none" });
      tl.to(
        rootRef.current,
        { yPercent: -100, duration: 1.25, ease: "power4.inOut" },
        "<",
      );
      tl.to(
        ".loader-curve",
        { scaleY: 1, duration: 0.55, ease: "power2.out" },
        "<+0.15",
      );
      tl.to(
        ".loader-curve",
        { scaleY: 0, duration: 0.5, ease: "power2.in" },
        ">",
      );
    }, rootRef);

    return () => ctx.revert();
  }, [onComplete]);

  // Tap anywhere to jump straight to the slide-up exit.
  const skip = () => {
    const tl = tlRef.current;
    if (tl && tl.labels.exit != null && tl.time() < tl.labels.exit)
      tl.seek("exit");
  };

  return (
    <div className="loader" ref={rootRef} onClick={skip}>
      {LINES.map((text, i) => (
        <p key={i} className="loader-line loader-line--fade">
          {text}
        </p>
      ))}

      {/* Last sentence: only the tail survives the fade, then travels
          to the centre of the screen. */}
      <p className="loader-line loader-line--last">
        <span className="loader-last-head">{LAST_HEAD}</span>
        <span className="loader-last-keep">{LAST_KEEP}</span>
      </p>

      <span className="loader-skip">Tap to skip</span>

      {/* Curved lip below the panel — visible only during the shutter exit */}
      <div className="loader-curve" aria-hidden="true" />
    </div>
  );
}
