import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import portrait from "../../assets/my-image.jpg";
import hubxpertTeamTrip from "../../assets/Hubxpert/IMG_1777.JPG";
import hubxpertTeam from "../../assets/Hubxpert/83a3a3c3-06e4-412e-aa0b-91a1e5c4be31.JPG";
import hubxpertCelebration from "../../assets/Hubxpert/IMG_2559.jpg";
import hubxpert3336 from "../../assets/Hubxpert/DSC_3336_Original.jpg";
import hubxpertPxl from "../../assets/Hubxpert/PXL_20260101_151401226.JPEG";
import hubxpert3215 from "../../assets/Hubxpert/DSC_3215_Original.jpg";
import hubxpertEd from "../../assets/Hubxpert/ed135734-9b78-4ab1-bde3-38fb05b5f0cb.jpg";
import hubxpertJune from "../../assets/Hubxpert/2026-06-29_Original.PNG";
import hubxpert3508 from "../../assets/Hubxpert/DSC_3508_Original.jpg";
import hubxpert1511 from "../../assets/Hubxpert/hubxpert-1511.jpg";
import taskImportExport from "../../assets/Task/MYXJ_20250101202554305_save.JPEG";
import taskCourier from "../../assets/Task/MYXJ_20250101165257737_save.JPEG";
import taskWorkspace from "../../assets/Task/MYXJ_20250101202107381_save.JPEG";
import taskTeamOne from "../../assets/Task/IMG_20240603_112947.jpg";
import taskTeamTwo from "../../assets/Task/IMG_20240603_112925.jpg";
import "./Experience.css";

gsap.registerPlugin(ScrollTrigger);

// Career timeline. A sticky intro column on the left, an accordion of roles on
// the right, and a hairline rail whose lime fill tracks scroll progress — the
// node of every role you've scrolled past lights up as you go.
//
// Edit the entries below with your real history. Order is newest first.
const ROLES = [
  {
    id: "01",
    period: "May 2025 — Present",
    role: "Junior ReactJs Developer",
    org: "HubXpert",
    place: "Bashundhara Apollo Road, Dhaka",
    summary:
      "Designing and shipping production interfaces for small teams and founders — from the first Figma frame to the deployed, measured build.",
    points: [
      "Collaborated on the development of the HubXpert corporate website while independently architecting a scalable library of HubSpot themes and custom modules using HubL.",
      "Introduced innovative 3D experiences and interactive web elements within HubSpot, elevating the platform’s visual impact and creating more engaging, modern digital experiences.",
      "Work directly with founders — scope, estimate, ship, iterate.",
    ],
    gallery: [
      [
        { src: hubxpertCelebration, alt: "Hubxpert team celebration" },
        { src: hubxpert3336, alt: "Hubxpert team event" },
        { src: hubxpertPxl, alt: "Hubxpert team gathering" },
        { src: hubxpert3215, alt: "Hubxpert team moment" },
        { src: hubxpertEd, alt: "Hubxpert team event" },
      ],
      [
        { src: hubxpertEd, alt: "Hubxpert team event" },
        { src: hubxpertTeamTrip, alt: "Hubxpert team trip" },
        { src: hubxpertJune, alt: "Hubxpert team moment" },
        { src: hubxpertTeam, alt: "Hubxpert team" },
        { src: hubxpert3508, alt: "Hubxpert team moment" },
      ],
      [
        { src: hubxpertTeam, alt: "Hubxpert team" },
        { src: hubxpertCelebration, alt: "Hubxpert team celebration" },
        { src: hubxpertPxl, alt: "Hubxpert team gathering" },
        { src: hubxpert3508, alt: "Hubxpert team moment" },
        { src: hubxpert1511, alt: "Hubxpert team" },
      ],
    ],
    stack: ["React", "Next.js", "TypeScript", "GSAP"],
  },
  {
    id: "02",
    period: "June 2024 — April 2025",
    role: "Frontend Developer",
    org: "Task Technology",
    place: "Banani, Dhaka",
    summary:
      "Turning static design files into pixel-true, responsive interfaces with a strong sense of movement and rhythm.",
    points: [
      "Import Export Management System: Developed a system to track and manage inventory for import and export operations, ensuring seamless logistics and accurate reporting.",
      "NEC Group Courier Service: Designed and implemented a platform to monitor product deliveries, track warehouse inventory, and manage availability.",
    ],
    gallery: [
      [
        { src: taskImportExport, alt: "Task Technology import-export system" },
        { src: taskWorkspace, alt: "Task Technology workspace" },
        { src: taskTeamOne, alt: "Task Technology team" },
      ],
      [
        { src: taskCourier, alt: "Task Technology courier service" },
        { src: taskTeamTwo, alt: "Task Technology team" },
      ],
    ],
    stack: [
      "Next.js",
      "React.js",
      "GSAP",
      "Framer Motion",
      "Redux",
      "Typescript",
    ],
  },
];

// Rows on the hanging ID card — the old stat strip, given a home.
const ID_ROWS = [
  ["Role", "Frontend Developer"],
  ["Since", "2021"],
  ["Shipped", "20+ interfaces"],
  ["Based", "Bangladesh"],
];

export default function Experience() {
  const [open, setOpen] = useState(0);
  const [hoverPreview, setHoverPreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(0);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const fillRef = useRef(null);
  const idRef = useRef(null);
  const previousPointerRef = useRef(null);
  const pointerTravelRef = useRef(0);

  const showPreview = (roleId, images, pointIndex, x, y) => {
    setPreviewImage(0);
    setHoverPreview({ roleId, images, pointIndex });
    setPreviewPosition({ x, y });
    previousPointerRef.current = { x, y };
    pointerTravelRef.current = 0;
  };

  const movePreview = (event, images) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: event.clientX, y: event.clientY };
    const previous = previousPointerRef.current;
    if (previous) {
      pointerTravelRef.current += Math.hypot(
        point.x - previous.x,
        point.y - previous.y,
      );
      if (pointerTravelRef.current > 50) {
        setPreviewImage((index) => (index + 1) % images.length);
        pointerTravelRef.current = 0;
      }
    }
    previousPointerRef.current = point;
    setPreviewPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Rows arrive on entry.
      gsap.from(".xp-item", {
        y: 44,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: listRef.current, start: "top 80%" },
      });

      // Heading + lead lift in just before the list.
      gsap.from(".xp-lift", {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
      });

      // The card drops in on its ribbon. Two things keep this from looking
      // jumpy: it is triggered off the card's own offset inside the section
      // (so the fall happens on screen, not below the fold), and the CSS bob
      // is held back until it lands — otherwise an 18px oscillation rides on
      // top of the fall and reads as wobble.
      const cardOffset = () => {
        let el = idRef.current;
        let y = 0;
        while (el && el !== rootRef.current) {
          y += el.offsetTop;
          el = el.offsetParent;
        }
        return y;
      };

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        idRef.current?.classList.add("is-landed");
      } else {
        gsap.from(idRef.current, {
          y: -120,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
          onComplete: () => idRef.current?.classList.add("is-landed"),
          scrollTrigger: {
            trigger: rootRef.current,
            // Fire when the card is ~90px above the fold.
            start: () =>
              "top " +
              Math.max(40, window.innerHeight - cardOffset() - 90) +
              "px",
            invalidateOnRefresh: true,
          },
        });
      }

      // ---- Night → white cross-fade -------------------------------------
      // Fires the moment the section starts appearing, so it is already white
      // by the time you have properly entered it. It still begins on night —
      // matching the Work slider above — but only for the first sliver of the
      // entrance, which keeps the join between the two sections seamless
      // instead of cutting straight from dark to white.
      const FADE_FROM = { bg: [27, 28, 30], fg: [232, 230, 220] }; // night / cream
      const FADE_TO = { bg: [244, 244, 239], fg: [17, 20, 13] }; //  paper / ink
      const mix = (a, b, t) =>
        `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
      const smoothstep = (e0, e1, x) => {
        const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
        return t * t * (3 - 2 * t);
      };

      const paint = (p) => {
        const el = rootRef.current;
        if (!el) return;
        // Background eases across the whole range; the text crosses in a
        // narrow band in the middle. Both are travelling in opposite
        // directions, so a shared curve would park them on the same mid-grey
        // and the copy would disappear. Crossing the text quickly keeps it
        // light on a dark background, then dark on a light one.
        el.style.setProperty(
          "--xp-bg",
          mix(FADE_FROM.bg, FADE_TO.bg, smoothstep(0, 1, p)),
        );
        el.style.setProperty(
          "--xp-fg",
          mix(FADE_FROM.fg, FADE_TO.fg, smoothstep(0.44, 0.56, p)),
        );
        // Hand the navbar over halfway through, where the background stops
        // reading as dark.
        if (p > 0.45) el.removeAttribute("data-nav");
        else el.setAttribute("data-nav", "dark");
      };

      ScrollTrigger.create({
        trigger: rootRef.current,
        // As soon as the top edge shows at the bottom of the screen.
        start: "top 94%",
        // Short on purpose — the invert should snap past you, not linger.
        // Running during the entrance means there is a whole viewport of
        // scroll available, so this no longer has to fit the section's
        // leftover height the way a "top top" start did.
        end: () => "+=" + window.innerHeight * 0.22,
        // Low smoothing: at this range a longer catch-up would soften the
        // snap back into a slow fade.
        scrub: 0.15,
        invalidateOnRefresh: true,
        onUpdate: (self) => paint(self.progress),
        onRefresh: (self) => paint(self.progress),
      });

      // Lime fill follows scroll down the rail.
      ScrollTrigger.create({
        trigger: listRef.current,
        start: "top 62%",
        end: "bottom 80%",
        scrub: true,
        onUpdate: (self) => {
          if (fillRef.current) {
            fillRef.current.style.transform = `scaleY(${self.progress})`;
          }
        },
      });

      // Each node latches on once the rail reaches it.
      gsap.utils.toArray(".xp-item").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 62%",
          onEnter: () => el.classList.add("is-passed"),
          onLeaveBack: () => el.classList.remove("is-passed"),
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" className="xp" data-nav="dark" ref={rootRef}>
      <div className="xp-inner">
        {/* ---- Sticky intro column ---- */}
        <aside className="xp-aside">
          <span className="xp-kicker xp-lift">
            <span className="xp-kicker-dot" /> Experience
          </span>

          <h2 className="xp-title xp-lift">
            The road
            <span className="xp-title-outline">so far</span>
          </h2>

          <p className="xp-lead xp-lift">
            Four years of turning curiosity into interfaces — every role below
            taught me something the last one could not.
          </p>

          {/* Lanyard ID card. The ribbon runs off the top of the screen, so
              the card reads as hanging from somewhere above the viewport. */}
          <div className="xp-id" ref={idRef}>
            <div className="xp-id-lanyard" aria-hidden="true">
              <span className="xp-id-ribbon" />
              <span className="xp-id-clip" />
            </div>

            <div className="xp-id-card">
              <span className="xp-id-hole" aria-hidden="true" />
              <span className="xp-id-side" aria-hidden="true">
                ID CARD
              </span>

              <div className="xp-id-head">
                <strong>JANNATUL FERDEOUS</strong>
                <span>Frontend Developer</span>
              </div>

              <div className="xp-id-photo">
                <img src={portrait} alt="Jannatul Ferdeous" draggable="false" />
              </div>

              <dl className="xp-id-rows">
                {ID_ROWS.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="xp-id-foot">
                <span className="xp-id-sign">Jannatul</span>
                <span className="xp-id-foot-label">Signature</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ---- Timeline ---- */}
        <div className="xp-list" ref={listRef}>
          <div className="xp-rail" aria-hidden="true">
            <span className="xp-rail-fill" ref={fillRef} />
          </div>

          {ROLES.map((r, i) => {
            const isOpen = open === i;
            return (
              <article
                key={r.id}
                className={`xp-item${isOpen ? " is-open" : ""}`}
              >
                <h3 className="xp-head-wrap">
                  <button
                    type="button"
                    className="xp-head"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`xp-panel-${r.id}`}
                  >
                    <span className="xp-node" aria-hidden="true" />
                    <span className="xp-head-main">
                      <span className="xp-period">{r.period}</span>
                      <span className="xp-role">{r.role}</span>
                      <span className="xp-org">
                        {r.org} <i aria-hidden="true">·</i> {r.place}
                      </span>
                    </span>
                    <span className="xp-index" aria-hidden="true">
                      {r.id}
                    </span>
                    <span className="xp-toggle" aria-hidden="true">
                      <i />
                      <i />
                    </span>
                  </button>
                </h3>

                <div
                  className="xp-panel"
                  id={`xp-panel-${r.id}`}
                  role="region"
                  aria-hidden={!isOpen}
                >
                  <div className="xp-panel-in">
                    <div className="xp-panel-content">
                      <div className="xp-panel-copy">
                        <p className="xp-summary">{r.summary}</p>
                        <ul className="xp-points">
                          {r.points.map((p, pointIndex) => {
                            const pointGallery = r.gallery?.[pointIndex];
                            const previewIsVisible =
                              hoverPreview?.roleId === r.id &&
                              hoverPreview.pointIndex === pointIndex;
                            return (
                              <li
                                key={p}
                                tabIndex={pointGallery ? 0 : undefined}
                                onMouseEnter={(event) => {
                                  if (!pointGallery) return;
                                  const rect = event.currentTarget.getBoundingClientRect();
                                  showPreview(
                                    r.id,
                                    pointGallery,
                                    pointIndex,
                                    event.clientX - rect.left,
                                    event.clientY - rect.top,
                                  );
                                }}
                                onMouseMove={(event) =>
                                  pointGallery && movePreview(event, pointGallery)
                                }
                                onMouseLeave={() => {
                                  setHoverPreview(null);
                                  previousPointerRef.current = null;
                                }}
                                onFocus={(event) => {
                                  if (!pointGallery) return;
                                  const rect = event.currentTarget.getBoundingClientRect();
                                  showPreview(
                                    r.id,
                                    pointGallery,
                                    pointIndex,
                                    rect.width * 0.6,
                                    rect.height / 2,
                                  );
                                }}
                                onBlur={() => setHoverPreview(null)}
                              >
                                {p}
                                {previewIsVisible && (
                                  <span
                                    className="xp-hover-preview"
                                    style={{
                                      left: previewPosition.x,
                                      top: previewPosition.y,
                                    }}
                                  >
                                    <img
                                      key={hoverPreview.images[previewImage].src}
                                      src={hoverPreview.images[previewImage].src}
                                      alt={hoverPreview.images[previewImage].alt}
                                    />
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        <div className="xp-stack">
                          {r.stack.map((t) => (
                            <span key={t} className="xp-chip">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

    </section>
  );
}
