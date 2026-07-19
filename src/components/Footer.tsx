export function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <h2>
          Building something
          <br />
          interactive? Talk to me.
        </h2>
        {/* TODO: replace with your real email and links */}
        <a className="footer-mail" href="mailto:hello@example.com">
          hello@example.com ↗
        </a>
        <div className="footer-base">
          <span>Govinda, {new Date().getFullYear()}</span>
          <div className="socials">
            <a href="#" target="_blank" rel="noreferrer">
              X
            </a>
            <a href="#" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="#" target="_blank" rel="noreferrer">
              Dribbble
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
