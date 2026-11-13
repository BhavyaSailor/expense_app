import Logo from '../ui/Logo';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo tone="light" />
        <div className="auth-pitch">
          <h2>See where your money went, then decide where it goes next.</h2>
          <div className="auth-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <ul className="auth-bar-legend">
            <li>Spent</li>
            <li>Saved</li>
            <li>Left</li>
          </ul>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-form">
          <div className="auth-mobile-logo">
            <Logo />
          </div>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          <p className="auth-foot muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}

export default AuthShell;
