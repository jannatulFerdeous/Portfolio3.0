import { useEffect, useRef } from "react";

// Animated topographic pattern: marching-squares contour lines of a slowly
// flowing scalar field. The field evolves over time so the lines drift and
// re-shape themselves — a living topo map rather than a static texture.
export default function TopoPattern({
  className,
  cell = 22,
  levels = 8,
  color = "17, 20, 13", // ink, as "r, g, b"
  opacity = 0.13,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell) + 2;
      rows = Math.ceil(h / cell) + 2;
      field = new Float32Array(cols * rows);
    };
    resize();
    window.addEventListener("resize", resize);

    // Smooth, organic field. The radial term gives the whorl/contour look;
    // the phases drift with time so the whole map breathes.
    const val = (x, y, t) =>
      Math.sin(x + t * 0.5) +
      Math.sin(y * 1.1 - t * 0.45) +
      Math.sin((x + y) * 0.7 + t * 0.4) +
      Math.sin(Math.hypot(x * 0.8, y * 0.9) - t * 0.5);

    // Interpolate the crossing point on an edge (guard flat edges).
    const cross = (a, b, L) =>
      Math.abs(b - a) < 1e-6 ? 0.5 : (L - a) / (b - a);

    const draw = (time) => {
      const t = time * 0.001;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          field[j * cols + i] = val(i * 0.32, j * 0.32, t);
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${color}, ${opacity})`;
      ctx.beginPath();

      const lo = -3.3;
      const hi = 3.3;
      for (let l = 0; l < levels; l++) {
        const L = lo + (hi - lo) * (l / (levels - 1));
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = field[j * cols + i]; // top-left
            const b = field[j * cols + i + 1]; // top-right
            const c = field[(j + 1) * cols + i + 1]; // bottom-right
            const d = field[(j + 1) * cols + i]; // bottom-left

            let idx = 0;
            if (a > L) idx |= 8;
            if (b > L) idx |= 4;
            if (c > L) idx |= 2;
            if (d > L) idx |= 1;
            if (idx === 0 || idx === 15) continue;

            const x0 = i * cell;
            const y0 = j * cell;
            const top = () => [x0 + cell * cross(a, b, L), y0];
            const right = () => [x0 + cell, y0 + cell * cross(b, c, L)];
            const bottom = () => [x0 + cell * cross(d, c, L), y0 + cell];
            const left = () => [x0, y0 + cell * cross(a, d, L)];

            const seg = (p, q) => {
              ctx.moveTo(p[0], p[1]);
              ctx.lineTo(q[0], q[1]);
            };

            switch (idx) {
              case 1:
              case 14:
                seg(left(), bottom());
                break;
              case 2:
              case 13:
                seg(bottom(), right());
                break;
              case 3:
              case 12:
                seg(left(), right());
                break;
              case 4:
              case 11:
                seg(top(), right());
                break;
              case 6:
              case 9:
                seg(top(), bottom());
                break;
              case 7:
              case 8:
                seg(left(), top());
                break;
              case 5: // saddle
                seg(top(), right());
                seg(bottom(), left());
                break;
              case 10: // saddle
                seg(left(), top());
                seg(right(), bottom());
                break;
              default:
                break;
            }
          }
        }
      }

      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [cell, levels, color, opacity]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
