import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectDetail from "./ProjectDetail";
import dentonCover from "../../assets/Denton Assets/d852784c-8273-478e-a509-9c83d8286514.png";
import dentonDetail from "../../assets/Denton Assets/denton2.png";
import dentonMobile from "../../assets/Denton Assets/denton-mobile.png";
import keyrushCover from "../../assets/KeyRush/keyrush thumbnail.png";
import keyrushDetail from "../../assets/KeyRush/custom-keyboard.png";
import keyrushMobile from "../../assets/KeyRush/KeyRush-Mobile.png";
import keyrushDetail3d from "../../assets/KeyRush/keyrush3d-1.png";
import dashboardCover from "../../assets/Dashboard/971e7bc8-77b9-4da3-bcb6-eeb77e79a090.png";
import dashboardProduct from "../../assets/Dashboard/product.png";
import dashboardBar from "../../assets/Dashboard/Bar.png";
import dashboardRip from "../../assets/Dashboard/RIP.png";
import humlyCover from "../../assets/Humly/2ec873f5-e54b-49f4-8b43-31ef6ab1fdf2.png";
import humlyDetail from "../../assets/Humly/humly.png";
import humlyMobile from "../../assets/Humly/mobile-humly.png";
import "./Work.css";

gsap.registerPlugin(ScrollTrigger);

// Dummy media for the project-detail pages. Swap these for your own files
// (drop them in /public and use "/my-video.mp4"). Media panels alternate shape
// by position — even index renders wide, odd renders tall — so keep landscape
// footage on the even slots.
const SAMPLE_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

function makeProject(seed, title, description, overrides = {}) {
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
    liveHref: "#",
    // intro → video (wide) → image (tall) → video (wide) → image (tall)
    media: [
      { type: "video", src: SAMPLE_VIDEOS[0] },
      { type: "image", src: `https://picsum.photos/seed/${seed}-a/1800/1080` },
      { type: "video", src: SAMPLE_VIDEOS[1] },
      { type: "image", src: `https://picsum.photos/seed/${seed}-b/1200/1800` },
    ],
    ...overrides,
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
    role: "Denton",
    desc: "transforming the digital presence of growing businesses, such as interior design firms, wellness practices, and B2B enterprises, using the powerful HubSpot CMS and custom-engineered Website.",
    tags: ["Hubspot", "Javascript", "GSAP", "Parallax", "Vanilla CSS"],
    image: dentonCover,
    project: makeProject(
      "frontend",
      "Frontend Developer",
      [
        "Building production interfaces in React and Next.js — from design systems to shipped features used every day.",
        "Focused on clean, reusable components, strong performance budgets, and accessible, resilient UI.",
      ],
      {
        liveHref: "https://denton.co.uk/",
        media: [
          { type: "image", src: dentonDetail, alt: "Denton website" },
          { type: "image", src: dentonMobile, alt: "Denton mobile website" },
        ],
      },
    ),
  },
  {
    id: "02",
    role: "KeyRush 3D",
    desc: "Designed and developed an immersive 3D product experience for KeyRush, a premium mechanical keyboard concept. The website combines bold visual storytelling with interactive product exploration, featuring animated 3D elements, smooth scrolling, dynamic sliders, and an engaging product customization experience.",
    tags: ["Threejs", "WebGL", "GSAP", "Tailwind CSS"],
    image: keyrushCover,
    project: makeProject(
      "uimotion",
      "UI / Motion Developer",
      [
        "Turning Figma files into pixel-true, responsive interfaces with a strong sense of motion and detail.",
        "The project demonstrates how 3D, animation, interaction design, and modern web technologies can be brought together to create engaging and memorable digital product experiences.",
      ],
      {
        liveHref: "https://keyrush-3d.netlify.app/",
        githubHref: "https://github.com/jannatulFerdeous/KeyRush-3d-website",
        media: [
          { type: "image", src: keyrushDetail, alt: "KeyRush keyboard customisation" },
          { type: "image", src: keyrushMobile, alt: "KeyRush mobile website" },
          { type: "image", src: keyrushDetail3d, alt: "KeyRush 3D keyboard" },
        ],
      },
    ),
  },
  {
    id: "03",
    role: "E-commerce Dashboard",
    desc: "Scroll-driven storytelling and immersive web experiences — experimental interfaces built with WebGL and Three.js that reward exploration.",
    tags: ["Reactjs", "Tailwind CSS", "Framer Motion"],
    image: dashboardCover,
    project: makeProject(
      "creative",
      "Creative Developer",
      [
        "Designed and developed RIP Portal as a modern, interactive web experience, combining responsive UI, smooth animations, visual storytelling, and engaging interactions to deliver a distinctive digital presence.",
        "Where design, motion, and code meet — experimental interfaces that reward exploration.",
      ],
      {
        liveHref: "https://rip-portal.netlify.app/",
        githubHref: "https://github.com/jannatulFerdeous/E-commerce-Admin-Dashboard",
        media: [
          { type: "image", src: dashboardProduct, alt: "Dashboard product overview" },
          { type: "image", src: dashboardBar, alt: "Dashboard analytics chart" },
          { type: "image", src: dashboardRip, alt: "RIP Portal dashboard" },
        ],
      },
    ),
  },
  {
    id: "04",
    role: "Humly",
    desc: "Designed and developed a polished digital experience for Humly, an integrated workplace platform that brings room and desk booking, visitor management, wayfinding, and workplace analytics into one seamless system.",
    tags: ["HubSpot CMS", "JavaScript", "CSS", "GSAP"],
    image: humlyCover,
    project: makeProject(
      "humly",
      "Humly — Workplace Platform",
      [
        "Designed and developed Humly's digital presence, communicating its connected workplace solutions through a polished, responsive web experience.",
        "The platform unifies room and desk booking, visitor management, wayfinding, and workplace analytics to help organisations build smarter, more efficient offices.",
      ],
      {
        liveHref: "https://www.humly.com/",
        services: ["Web Design", "Web Development", "HubSpot CMS", "Interaction", "Animation"],
        media: [
          { type: "image", src: humlyDetail, alt: "Humly workplace platform" },
          { type: "image", src: humlyMobile, alt: "Humly mobile website" },
        ],
      },
    ),
  },
];

// The detail view scrolls straight from one project into the next, so it needs
// the whole list — same order as the slides. It does not wrap: scrolling past
// the end of the last one closes the overlay and returns here.
const PROJECTS = EXPERIENCES.map((e) => e.project);

function Visual({ image, onOpen }) {
  return (
    <button className="exp-visual" onClick={onOpen} aria-label="Open project">
      <img className="exp-visual-img" src={image} alt="" draggable="false" />
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
            // Quoted: an unquoted url() breaks on any space in the path, and
            // local assets live in folders like "Denton Assets".
            backgroundImage: `url("${zoom.src}")`,
          }}
        />
      )}

      {openIndex !== null && (
        <ProjectDetail
          projects={PROJECTS}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
