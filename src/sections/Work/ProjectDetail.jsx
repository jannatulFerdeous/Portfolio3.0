import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./ProjectDetail.css";

/* ============================================================
   PROJECT DETAILS — the horizontal project view.

   One project reads as a track of full-width panels: an intro (title,
   description, services, links) followed by media panels that alternate
   between a wide rectangle and a tall column. Scroll/drag moves the track
   sideways; the two intro columns split apart and fade as you leave them.

   Past the last panel an extra viewport-width of "virtual" scroll drags the
   NEXT project's view in from the right. Once it is ~20% in the move commits
   and glides the rest of the way; at full coverage the incoming view simply
   becomes the live one — nothing re-renders, so there is no seam.
   ============================================================ */

/* Below this width the view is a plain vertical column and the slider must
   keep its hands off it: the track is laid out by CSS and the wheel handler
   preventDefault()s, which on a touch device would eat the one gesture it has.
   MUST match the media query in ProjectDetail.css. */
const STACK_AT = 900;
const COMMIT_AT = 0.2; // how far the next project must come in before it auto-snaps

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const stacked = () => window.matchMedia(`(max-width: ${STACK_AT}px)`).matches;

/* ---- One project's view ---------------------------------------------------
   `inert` renders the same markup without wiring any of the scroll machinery —
   that is what the incoming next project is until it commits, and it means the
   preview and the live view are pixel-identical at the moment they swap. */
function PDView({
  project,
  inert = false,
  endLabel,
  onOverscroll,
  onArrive,
  onBack,
  nodeRef,
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const introRef = useRef(null);
  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const [active, setActive] = useState(0);

  const panelCount = 1 + project.media.length;

  // Kept in refs so a new callback identity never tears down and restarts the
  // running animation loop.
  const overscrollRef = useRef(onOverscroll);
  const arriveRef = useRef(onArrive);
  overscrollRef.current = onOverscroll;
  arriveRef.current = onArrive;

  useEffect(() => {
    if (inert) return;
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    const panels = Array.from(track.children);

    let targetX = 0;
    let currentX = 0;
    let raf = null;
    let dead = false;
    let committed = false;
    let activeIdx = 0;

    const viewW = () => root.clientWidth || window.innerWidth;
    // The track stops at its real end; past that is one extra viewport of
    // "virtual" range, reported to the parent as 0…1. What that drives is the
    // parent's call — pulling in the next project, or fading out to the page.
    const baseMaxX = () => Math.max(0, track.scrollWidth - viewW());
    const extraX = () => viewW();
    const maxX = () => baseMaxX() + extraX();
    const expandE = () => clamp((currentX - baseMaxX()) / extraX(), 0, 1);

    // offsetLeft ignores the transform, so these stay true while the track moves
    const panelCenter = (i) =>
      panels[i] ? panels[i].offsetLeft + panels[i].offsetWidth / 2 : 0;
    const nearestIndex = () => {
      const center = currentX + viewW() / 2;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < panels.length; i++) {
        const d = Math.abs(panelCenter(i) - center);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };

    // As scrolling starts the two intro columns split apart and fade out over
    // the first ~60% of the intro's width.
    const applyIntro = () => {
      const intro = introRef.current;
      if (!intro) return;
      const range = (intro.offsetWidth || viewW()) * 0.6;
      const dp = clamp(range ? currentX / range : 0, 0, 1);
      const o = 1 - dp;
      if (col1Ref.current) {
        col1Ref.current.style.opacity = o;
        col1Ref.current.style.transform = `translate3d(${-90 * dp}px,0,0)`;
      }
      if (col2Ref.current) {
        col2Ref.current.style.opacity = o;
        col2Ref.current.style.transform = `translate3d(${90 * dp}px,0,0)`;
      }
    };

    const clearInline = () => {
      track.style.transform = "";
      for (const c of [col1Ref.current, col2Ref.current]) {
        if (!c) continue;
        c.style.opacity = "";
        c.style.transform = "";
      }
    };

    const draw = () => {
      // Column mode is laid out entirely by CSS. Hand the track back to it and
      // clear anything the slider left inline — a rotate from landscape can
      // otherwise strand the track mid-slide or the columns mid-fade.
      if (stacked()) {
        clearInline();
        return;
      }
      track.style.transform = `translate3d(${-Math.min(currentX, baseMaxX())}px,0,0)`;
      overscrollRef.current?.(expandE());
      applyIntro();
    };

    const tick = () => {
      if (dead) {
        raf = null;
        return;
      }
      currentX += (targetX - currentX) * 0.12;
      if (Math.abs(targetX - currentX) < 0.5) currentX = targetX;
      // Past the threshold the end move is committed: hold the target at full
      // coverage so it plays out the rest of the way on its own.
      if (!committed && expandE() >= COMMIT_AT) {
        committed = true;
        targetX = maxX();
      }
      draw();
      const i = nearestIndex();
      if (i !== activeIdx) {
        activeIdx = i;
        setActive(i);
      }
      if (expandE() >= 0.999) {
        raf = null;
        arriveRef.current?.();
        return;
      }
      raf = currentX !== targetX ? requestAnimationFrame(tick) : null;
    };
    const run = () => {
      if (!raf && !dead) raf = requestAnimationFrame(tick);
    };

    // Once committed the target is pinned to full coverage, so a stray
    // back-scroll can't reverse the auto-pull mid-glide.
    const nudge = (dx) => {
      targetX = committed ? maxX() : clamp(targetX + dx, 0, maxX());
      run();
    };

    const onWheel = (e) => {
      if (stacked()) return; // column mode: let it scroll natively
      e.preventDefault();
      nudge(Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX);
    };

    let touchX = null;
    const onTouchStart = (e) => {
      touchX = e.touches[0].clientX;
    };
    const onTouchMove = (e) => {
      if (touchX == null || stacked()) return; // in column mode a drag belongs to the page
      const dx = touchX - e.touches[0].clientX;
      touchX = e.touches[0].clientX;
      nudge(dx);
    };
    const onTouchEnd = () => {
      touchX = null;
    };

    // Pointer drag, for a mouse without a scroll wheel.
    let dragX = null;
    const onPointerDown = (e) => {
      if (e.pointerType === "touch" || stacked()) return;
      dragX = e.clientX;
    };
    const onPointerMove = (e) => {
      if (dragX == null) return;
      const dx = dragX - e.clientX;
      dragX = e.clientX;
      nudge(dx);
    };
    const onPointerUp = () => {
      dragX = null;
    };

    const onResize = () => {
      // Crossed into column mode (rotate / resize): drop the slider's state so
      // it can't leave the track parked off-screen or the next project
      // half-dragged in. draw() clears whatever it set inline.
      if (stacked()) {
        targetX = currentX = 0;
        committed = false;
        overscrollRef.current?.(0);
        draw();
        return;
      }
      targetX = currentX = clamp(
        panelCenter(activeIdx) - viewW() / 2,
        0,
        maxX(),
      );
      draw();
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: true });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
    root.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", onResize);

    draw();

    return () => {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, [inert, project]);

  // useCallback so a re-render doesn't detach and re-attach the ref (which
  // would blank out the parent's handle on the incoming node mid-slide).
  const setRoot = useCallback(
    (el) => {
      rootRef.current = el;
      if (nodeRef) nodeRef.current = el;
    },
    [nodeRef]
  );

  return (
    <div
      className={`pd${inert ? " pd--incoming" : ""}`}
      ref={setRoot}
      style={inert ? { transform: "translate3d(100%,0,0)" } : undefined}
    >
      <button className="pd__back" onClick={onBack} tabIndex={inert ? -1 : 0}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 5l-7 7 7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>

      {/* Horizontal track of full-width panels (intro + media), moved by transform */}
      <div className="pd__track" ref={trackRef}>
        {/* Panel 0 — project details (continues from the card's zoom) */}
        <section className="pd__panel pd__panel--intro" ref={introRef}>
          <div className="pd__col pd__col--1" ref={col1Ref}>
            <h2 className="pd__title">{project.title}</h2>
            <div className="pd__desc">
              {project.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="pd__actions">
              {project.githubHref && (
                <a
                  className="pd__launch"
                  href={project.githubHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              )}
              {project.liveHref && (
                <a
                  className="pd__launch"
                  href={project.liveHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live Link
                </a>
              )}
            </div>
          </div>

          <div className="pd__col pd__col--2" ref={col2Ref}>
            <div className="pd__list">
              <div className="pd__list-title">Services</div>
              <ul className="pd__list-body">
                {project.services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Media panels — alternating shapes: wide rectangle, then tall
            (100vh × 40vw), repeating. */}
        {project.media.map((m, i) => (
          <section
            key={i}
            className={`pd__panel pd__panel--media ${
              i % 2 === 0 ? "pd__panel--wide" : "pd__panel--tall"
            }`}
          >
            {m.type === "video" ? (
              <video
                src={m.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img src={m.src} alt={m.alt || ""} draggable="false" />
            )}
          </section>
        ))}
      </div>

      {/* HUD: scroll hint (bottom-right) + panel dots (bottom-centre).
          On the last panel the hint says what one more scroll will do, rather
          than going quiet — the end move is otherwise undiscoverable. */}
      <span
        className={`pd__scrollhint${
          active >= panelCount - 1 && !endLabel ? " is-hidden" : ""
        }`}
      >
        {active >= panelCount - 1 ? endLabel : "Scroll to continue →"}
      </span>
      <div className="pd__dots" aria-hidden="true">
        {Array.from({ length: panelCount }).map((_, i) => (
          <span key={i} className={i === active ? "is-active" : undefined} />
        ))}
      </div>
    </div>
  );
}

/* ---- The stage: holds the live view and decides what the overscroll past the
   last panel means.

     • not the last project → the next one slides in from the right;
     • the last project     → the whole stage fades back to the page, so the
       list runs to an end instead of looping forever.
   -------------------------------------------------------------------------- */
export default function ProjectDetail({
  projects,
  index,
  onIndexChange,
  onClose,
}) {
  const [closing, setClosing] = useState(false);
  const [preview, setPreview] = useState(false); // next project's view mounted?
  const stageRef = useRef(null);
  const previewRef = useRef(null);
  const mountedRef = useRef(false);
  const expandRef = useRef(0);

  const project = projects[index];
  const isLast = index >= projects.length - 1;
  const nextIndex = index + 1;

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 420); // let the exit animation play
  }, [onClose]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  // Driven every frame from the live view's rAF loop, so styles are set
  // straight on the nodes — only mount/unmount goes through React.
  const handleOverscroll = useCallback(
    (e) => {
      expandRef.current = e;

      // Last project: nothing left to pull in, so the same gesture scrubs the
      // exit — the stage fades and shrinks back to reveal the page behind it.
      if (isLast) {
        const stage = stageRef.current;
        if (stage) {
          stage.style.opacity = 1 - e;
          stage.style.transform = `scale(${1 - e * 0.06})`;
        }
        return;
      }

      const shouldMount = e > 0;
      if (shouldMount !== mountedRef.current) {
        mountedRef.current = shouldMount;
        setPreview(shouldMount); // scrolled back to 0 → tuck it away again
      }
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${(1 - e) * 100}%,0,0)`;
      }
    },
    [isLast]
  );

  // Mount lands a frame after the transform that triggered it — catch up here
  // so the incoming view never flashes at its default position.
  useLayoutEffect(() => {
    if (preview && previewRef.current) {
      previewRef.current.style.transform = `translate3d(${
        (1 - expandRef.current) * 100
      }%,0,0)`;
    }
  }, [preview]);

  // Reached full coverage. On the last project the stage is already faded out,
  // so unmount straight away rather than replaying the close animation over an
  // invisible overlay. Otherwise the next project's view IS the stage now:
  // promote it — the live view remounts at scroll 0, exactly what the preview
  // was already showing, so the swap is invisible.
  const handleArrive = useCallback(() => {
    if (isLast) {
      onClose();
      return;
    }
    mountedRef.current = false;
    expandRef.current = 0;
    setPreview(false);
    onIndexChange(nextIndex);
  }, [isLast, nextIndex, onIndexChange, onClose]);

  // A promoted view starts at scroll 0, but the stage may still carry the
  // fade/scale from a previous project's abandoned exit scrub.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.opacity = "";
    stage.style.transform = "";
  }, [index]);

  return (
    <div
      className={`pd-stage${closing ? " pd-stage--closing" : ""}`}
      ref={stageRef}
    >
      <PDView
        key={index}
        project={project}
        endLabel={isLast ? "Keep scrolling to go back ←" : "Next project →"}
        onOverscroll={handleOverscroll}
        onArrive={handleArrive}
        onBack={handleClose}
      />
      {preview && !isLast && (
        <PDView
          key={`next-${nextIndex}`}
          project={projects[nextIndex]}
          inert
          nodeRef={previewRef}
          onBack={handleClose}
        />
      )}
    </div>
  );
}
