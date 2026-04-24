import { ThemeToggle } from "./ThemeToggle";

interface AppFrameProps {
  children: React.ReactNode;
}

export function AppFrame({ children }: AppFrameProps): JSX.Element {
  return (
    <div className="app-bg">
      <main className="phone-shell">
        <div className="background-orbs" aria-hidden>
          <div className="background-orb background-orb-blue" />
          <div className="background-orb background-orb-green" />
        </div>

        <header className="top-bar">
          <div className="status-row" aria-label="Status bar">
            <span className="status-time">9:41</span>
            <div className="status-icons">
              <span className="status-dot" />
              <span className="status-dot" />
              <span className="status-pill" />
            </div>
          </div>
          <div className="theme-row">
            <ThemeToggle />
          </div>
        </header>

        <section className="page-container">{children}</section>
      </main>
    </div>
  );
}
