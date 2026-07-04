import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroXray from "../HeroXray/HeroXray";
import logo from "../../assets/logo.png";
import "./Message.css";

gsap.registerPlugin(ScrollTrigger);

// landonorris-style transition: the hero section IS the centre card. The
// stage stays pinned while you scroll; the full-screen hero shrinks live
// with the scroll and settles as a card in the middle of the dark section,
// with marquees behind it and the signature on top.
const LINE_SERIF = "Frontend Developer · Software Engineer · Creative Coder · ";
const LINE_BOLD = "EXPLORE NEW THINGS — BUILD FOR THE WEB — KEEP LEARNING — ";

export default function Message() {
  const rootRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            // Flip the navbar to lime once the dark bg shows behind it.
            if (self.progress > 0.15)
              bgRef.current.setAttribute("data-nav", "dark");
            else bgRef.current.removeAttribute("data-nav");
            // The card is inert: cursor effects only work at full screen.
            const hero = rootRef.current.querySelector(".msg-hero");
            hero.style.pointerEvents = self.progress > 0.04 ? "none" : "";
          },
        },
      });

      // The whole hero shrinks from full screen into the centre card.
      tl.fromTo(
        ".msg-hero",
        { scale: 1, borderRadius: 0 },
        { scale: 0.42, borderRadius: 40, duration: 1, ease: "none" },
        0,
      );

      // The "Available for Work" card and the scroll text belong to the
      // full-screen hero only — they vanish the instant scrolling starts,
      // along with the x-ray and splash layers.
      tl.to(
        ".msg-hero .hero-card, .msg-hero .hero-meta, .msg-hero .hero-xray, .msg-hero .splash-cursor",
        { opacity: 0, duration: 0.05, ease: "none" },
        0,
      );

      // As the card settles it turns black and white.
      tl.fromTo(
        ".msg-hero",
        { filter: "grayscale(0)" },
        { filter: "grayscale(1)", duration: 0.35, ease: "none" },
        0.55,
      );
      tl.fromTo(
        ".msg-signature",
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 0.3, ease: "none" },
        0.6,
      );
      tl.fromTo(
        ".msg-caption",
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "none" },
        0.65,
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Two identical halves make the CSS translateX(-50%) loop seamless.
  const track = (text) => (
    <div className="msg-track">
      <span>{text.repeat(3)}</span>
      <span>{text.repeat(3)}</span>
    </div>
  );

  return (
    <div className="msg-scroll" ref={rootRef}>
      <div className="msg-stage">
        {/* Dark backdrop revealed as the hero shrinks */}
        <div className="msg-bg" ref={bgRef}>
          <div className="msg-marquees" aria-hidden="true">
            <div className="msg-marquee msg-marquee--serif">
              {track(LINE_SERIF)}
            </div>
            <div className="msg-marquee msg-marquee--bold msg-marquee--reverse">
              {track(LINE_BOLD)}
            </div>
          </div>
        </div>

        {/* The hero itself — full screen at the top, card at the end */}
        <div className="msg-hero">
          <HeroXray />
        </div>

        {/* Signature over the shrunken hero card */}
        <span className="msg-signature">Jannatul</span>
      </div>
    </div>
  );
}
