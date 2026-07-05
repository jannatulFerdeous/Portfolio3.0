import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectDetail from "./ProjectDetail";
import "./Work.css";

gsap.registerPlugin(ScrollTrigger);

// Dummy media for the project-detail pages. Swap these for your own files
// (drop them in /public and use "/my-video.mp4" so colour extraction works
// same-origin); the per-media `bg` is the fallback background colour.
const SAMPLE_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

function makeProject(seed, title, description) {
  return {
    title,
    description,
    services: [
      "Concept",
      "Web Design",
      "Web Development",
      "Interaction",
      "Animation",
    ],
    links: [
      { label: "Live Site", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Case Study", href: "#" },
    ],
    launchHref: "#",
    bg: "#16150f",
    // details → video (rectangle) → image (full-width) → video → image
    media: [
      { type: "video", src: SAMPLE_VIDEOS[0], bg: "#1a140e" },
      { type: "image", src: `https://picsum.photos/seed/${seed}-a/1800/1080`, bg: "#232323" },
      { type: "video", src: SAMPLE_VIDEOS[1], bg: "#12161a" },
      { type: "image", src: `https://picsum.photos/seed/${seed}-b/1800/1080`, bg: "#20211c" },
    ],
  };
}

// Horizontal experience slider driven by scroll (myweblab.it style): the
// section pins and the track slides sideways 1:1 with scroll — a single,
// smooth linear pass (no snap, no loop) from 01 to the last slide, then it
// releases to the next section. Layout follows the "our approach" reference:
// big outlined index, serif role, hairline list, visual card, next peeking.
//
// Edit the entries below with your real roles.
const EXPERIENCES = [
  {
    id: "01",
    role: "Frontend Developer",
    desc: "Building production interfaces in React and Next.js — from design systems to shipped features, with a focus on performance and accessibility.",
    tags: ["React", "Next.js", "TypeScript", "GSAP"],
    image: "https://picsum.photos/seed/frontend/900/900",
    project: makeProject("frontend", "Frontend Developer", [
      "Building production interfaces in React and Next.js — from design systems to shipped features used every day.",
      "Focused on clean, reusable components, strong performance budgets, and accessible, resilient UI.",
    ]),
  },
  {
    id: "02",
    role: "UI / Motion Developer",
    desc: "Turning Figma files into pixel-true, responsive interfaces with a strong sense of motion — micro-interactions that make products feel alive.",
    tags: ["Figma", "GSAP", "Framer Motion", "CSS"],
    image: "https://picsum.photos/seed/uimotion/900/900",
    project: makeProject("uimotion", "UI / Motion Developer", [
      "Turning Figma files into pixel-true, responsive interfaces with a strong sense of motion and detail.",
      "Micro-interactions and GSAP-driven animation that make products feel alive without getting in the way.",
    ]),
  },
  {
    id: "03",
    role: "Creative Developer",
    desc: "Scroll-driven storytelling and immersive web experiences — experimental interfaces built with WebGL and Three.js that reward exploration.",
    tags: ["Three.js", "WebGL", "GLSL", "Blender"],
    image: "https://picsum.photos/seed/creative/900/900",
    project: makeProject("creative", "Creative Developer", [
      "Scroll-driven storytelling and immersive, playful web experiences built with WebGL and Three.js.",
      "Where design, motion, and code meet — experimental interfaces that reward exploration.",
    ]),
  },
  {
    id: "04",
    role: "Always Learning",
    desc: "A running set of side projects and open-source work — the place I try new tools and ideas, currently exploring 3D on the web.",
    tags: ["Vite", "Open Source", "3D Web", "R3F"],
    image: "https://picsum.photos/seed/learning/900/900",
    project: makeProject("learning", "Always Learning", [
      "A running set of side projects and open-source work — the place I try new tools and ideas.",
      "Currently exploring 3D on the web, modern tooling with Vite, and everything in between.",
    ]),
  },
];

function Visual({ image, onOpen }) {
  return (
    <button className="exp-visual" onClick={onOpen} aria-label="Open project">
      <img
        className="exp-visual-img"
        src={image}
        alt=""
        draggable="false"
      />
      <span className="exp-visual-cue">View project</span>
    </button>
  );
}

export default function Work() {
  const total = EXPERIENCES.length;
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);

  // Click-to-zoom → project detail overlay.
  const [zoom, setZoom] = useState(null); // { index, rect, src } during transition
  const [openIndex, setOpenIndex] = useState(null); // which detail page is open
  const zoomerRef = useRef(null);

  const openProject = (index, imgEl) => {
    const rect = imgEl.getBoundingClientRect();
    setZoom({ index, rect, src: EXPERIENCES[index].image });
  };

  // Animate the clone forward to fullscreen, then mount the detail page.
  useLayoutEffect(() => {
    if (!zoom) return;
    const el = zoomerRef.current;
    const tl = gsap.timeline();
    tl.to(el, {
      left: 0,
      top: 0,
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
      scale: 1.04,
      duration: 0.75,
      ease: "power3.inOut",
    })
      .add(() => setOpenIndex(zoom.index))
      .to(el, { opacity: 0, duration: 0.35, ease: "power2.out" }, "+=0.05")
      .add(() => setZoom(null));
  }, [zoom]);

  // Lock page scroll while a detail page is open.
  useEffect(() => {
    document.body.style.overflow = openIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openIndex]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal distance the track must travel so the last slide ends
      // framed at the right edge of the viewport.
      const getTravel = () =>
        Math.max(0, (trackRef.current?.scrollWidth || 0) - window.innerWidth);

      let lastIdx = -1;
      const st = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: () => "+=" + getTravel(), // 1:1 scroll → horizontal travel
        pin: stageRef.current,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(trackRef.current, { x: -p * getTravel() });
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${p})`;
          }
          const idx = Math.min(total - 1, Math.floor(p * total));
          if (idx !== lastIdx) {
            lastIdx = idx;
            setActive(idx);
          }
        },
      });
      return () => st.kill();
    }, rootRef);
    return () => ctx.revert();
  }, [total]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section id="work" className="exp" data-nav="dark" ref={rootRef}>
      <div className="exp-stage" ref={stageRef}>
        <div className="exp-viewport">
          <div className="exp-track" ref={trackRef}>
            {EXPERIENCES.map((e, i) => (
              <article
                key={e.id}
                className={`exp-slide${i === active ? " is-active" : ""}`}
                aria-hidden={i !== active}
              >
                <div className="exp-info">
                  <span className="exp-kicker">
                    <span className="exp-dot" /> My Work
                  </span>
                  <span className="exp-num" aria-hidden="true">
                    {e.id}
                  </span>
                  <h3 className="exp-role">{e.role}</h3>
                  <p className="exp-desc">{e.desc}</p>
                  <div className="exp-tags">
                    {e.tags.map((t) => (
                      <span key={t} className="exp-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <Visual
                  image={e.image}
                  onOpen={(ev) => openProject(i, ev.currentTarget)}
                />
              </article>
            ))}
          </div>
        </div>

        <div className="exp-foot">
          <div className="exp-counter">
            <b>{pad(active + 1)}</b> / {pad(total)}
          </div>
          <div className="exp-progress">
            <span ref={progressRef} />
          </div>
          <div className="exp-nav">
            <span className="exp-scroll">Scroll</span>
            <span className="exp-scroll-arrow" aria-hidden="true">
              →
            </span>
          </div>
        </div>
      </div>

      {/* Zoom clone that flies the clicked card forward into the detail page */}
      {zoom && (
        <div
          className="exp-zoomer"
          ref={zoomerRef}
          style={{
            left: zoom.rect.left,
            top: zoom.rect.top,
            width: zoom.rect.width,
            height: zoom.rect.height,
            backgroundImage: `url(${zoom.src})`,
          }}
        />
      )}

      {openIndex !== null && (
        <ProjectDetail
          data={EXPERIENCES[openIndex].project}
          hero={EXPERIENCES[openIndex].image}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
