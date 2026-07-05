import { useEffect, useRef, useState } from "react";
import "./ProjectDetail.css";

// Average colour of an image/video, darkened for use as a background.
// Returns null if the canvas is tainted (cross-origin media without CORS) —
// the caller then falls back to the media's predefined `bg`. Works live for
// same-origin / CORS-enabled media (e.g. your own files in /public).
function readColor(el) {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const ctx = c.getContext("2d");
    ctx.drawImage(el, 0, 0, 16, 16);
    const d = ctx.getImageData(0, 0, 16, 16).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
      n++;
    }
    const k = 0.55; // darken for legible foreground text
    return `rgb(${Math.round((r / n) * k)}, ${Math.round((g / n) * k)}, ${Math.round(
      (b / n) * k
    )})`;
  } catch {
    return null;
  }
}

function Media({ item, onColor }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = () => {
      const col = readColor(el);
      if (col) onColor(col);
    };
    if (item.type === "image") {
      if (el.complete && el.naturalWidth) handle();
      else el.addEventListener("load", handle);
      return () => el.removeEventListener("load", handle);
    }
    el.addEventListener("loadeddata", handle);
    return () => el.removeEventListener("loadeddata", handle);
  }, [item, onColor]);

  if (item.type === "image") {
    return (
      <img ref={ref} className="pd-media-img" src={item.src} alt="" draggable="false" />
    );
  }
  return (
    <video
      ref={ref}
      className="pd-media-video"
      src={item.src}
      autoPlay
      muted
      loop
      playsInline
    />
  );
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function ProjectDetail({ data, hero, onClose }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [colors, setColors] = useState({});
  const [closing, setClosing] = useState(false);

  const panelCount = 1 + data.media.length; // intro + media
  const fallbacks = [data.bg, ...data.media.map((m) => m.bg)];
  const bg = colors[active] || fallbacks[active] || "#141414";

  const setColor = (i, c) =>
    setColors((prev) => (prev[i] === c ? prev : { ...prev, [i]: c }));

  // Smooth transform-based horizontal scroll driven by wheel/trackpad/drag.
  // targetX is nudged by input; a rAF loop eases currentX toward it and moves
  // the track. When input stops the target snaps to the nearest panel.
  const targetX = useRef(0);
  const currentX = useRef(0);
  const activeRef = useRef(0);
  const snapTimer = useRef(null);

  useEffect(() => {
    const maxX = () => window.innerWidth * (panelCount - 1);
    const snap = () => {
      const vw = window.innerWidth;
      targetX.current = clamp(Math.round(targetX.current / vw) * vw, 0, maxX());
    };

    const onWheel = (e) => {
      e.preventDefault();
      const d =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      targetX.current = clamp(targetX.current + d, 0, maxX());
      clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(snap, 130);
    };

    const onResize = () => {
      targetX.current = clamp(activeRef.current * window.innerWidth, 0, maxX());
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    let raf;
    const tick = () => {
      currentX.current += (targetX.current - currentX.current) * 0.12;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-currentX.current}px,0,0)`;
      }
      const idx = Math.round(currentX.current / window.innerWidth);
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      clearTimeout(snapTimer.current);
    };
  }, [panelCount]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 420); // let the exit animation play
  };

  // Pointer drag to scroll.
  const drag = useRef(null);
  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, start: targetX.current };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const maxX = window.innerWidth * (panelCount - 1);
    targetX.current = clamp(drag.current.start - (e.clientX - drag.current.x), 0, maxX);
  };
  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    const vw = window.innerWidth;
    const maxX = vw * (panelCount - 1);
    targetX.current = clamp(Math.round(targetX.current / vw) * vw, 0, maxX);
  };

  return (
    <div
      className={`pd${closing ? " pd--closing" : ""}`}
      style={{ "--pd-bg": bg }}
    >
      <button className="pd-back" onClick={handleClose}>
        <span aria-hidden="true">←</span> Back
      </button>

      <div
        className="pd-track"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {/* Panel 0 — project details + hero (continues from the zoom) */}
        <section className="pd-panel pd-intro">
          <div className="pd-intro-text">
            <h2 className="pd-title">{data.title}</h2>
            {data.description.map((p, i) => (
              <p key={i} className="pd-desc">
                {p}
              </p>
            ))}
            <a className="btn btn--solid pd-launch" href={data.launchHref}>
              <span className="pd-launch-dot" /> Launch Project
            </a>
          </div>

          <div className="pd-intro-meta">
            <div className="pd-meta-group">
              <h4 className="pd-meta-title">Services</h4>
              <ul>
                {data.services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="pd-meta-group">
              <h4 className="pd-meta-title">Links</h4>
              <ul>
                {data.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pd-intro-hero">
            <img src={hero} alt="" className="pd-hero-img" draggable="false" />
            <span className="pd-hero-label">{data.title}</span>
          </div>
        </section>

        {/* Media panels — video (rectangle) / image (full-bleed) */}
        {data.media.map((item, i) => (
          <section
            key={i}
            className={`pd-panel pd-media pd-media--${item.type}`}
          >
            <Media item={item} onColor={(c) => setColor(i + 1, c)} />
          </section>
        ))}
      </div>

      {/* HUD */}
      <div className="pd-hint">
        {active < panelCount - 1 ? "Scroll to continue →" : "You're at the end"}
      </div>
      <div className="pd-dots">
        {Array.from({ length: panelCount }).map((_, i) => (
          <span key={i} className={i === active ? "is-active" : undefined} />
        ))}
      </div>
    </div>
  );
}
