import defaultPortrait from "../../assets/my-image.jpg";
import TopoPattern from "../../components/TopoPattern/TopoPattern";
import "./Hero.css";

// The photo face of the hero: an animated topographic backdrop + the
// bottom-anchored portrait. The portrait is simply shown (no entrance) — it
// stays on once the loader clears.
export default function Hero({ portrait = defaultPortrait, id }) {
  return (
    <section className="hero" id={id}>
      {/* Animated topographic backdrop */}
      <TopoPattern className="hero-topo" />

      {/* Large bottom-anchored portrait */}
      <div className="hero-portrait">
        <img src={portrait} alt="Jannatul Ferdeous" draggable="false" />
      </div>
    </section>
  );
}
