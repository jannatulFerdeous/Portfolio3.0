import "./Contact.css";

export default function Contact() {
  return (
    <section id="contact" className="ct" data-nav="dark">
      <div className="ct-inner">
        <div className="ct-stage">
          <div className="ct-stage-grid" aria-hidden="true" />
          <div className="ct-stamp ct-stamp--top" aria-hidden="true">
            <span>OPEN</span>
            <span>TO IDEAS</span>
          </div>

          <div className="ct-copy">
            <p className="ct-kicker">Start a new conversation</p>
            <h2 className="ct-title">
              Let&apos;s
              <span>talk.</span>
            </h2>
            <p className="ct-intro">
              Whether it&apos;s a product to shape, a hard problem to untangle,
              or a research idea worth exploring—I&apos;m always interested in
              thoughtful work.
            </p>
          </div>

          <form className="ct-form" onSubmit={(event) => event.preventDefault()}>
            <div className="ct-form-heading">
              <span>01</span>
              <p>Drop me a line</p>
            </div>

            <label>
              <span>Your name</span>
              <input type="text" name="name" placeholder="How should I call you?" required />
            </label>
            <label>
              <span>Email address</span>
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
            <label>
              <span>Tell me about it</span>
              <textarea name="message" rows="4" placeholder="A little about your project..." required />
            </label>

            <button className="ct-submit" type="submit">
              <span>Send enquiry</span>
              <strong>↗</strong>
            </button>
          </form>

          <span className="ct-scribble" aria-hidden="true">
            your move
          </span>
        </div>

        <footer className="ct-footer">
          <span>© 2026 · Built with care</span>
          <a href="#hero">Return to the beginning ↑</a>
        </footer>
      </div>
    </section>
  );
}
