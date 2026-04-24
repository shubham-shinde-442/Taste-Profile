import { Link } from "react-router-dom";
import { useTasteProfile } from "../contexts/TasteProfileContext";

export function IntroPage(): JSX.Element {
  const { resetProfile } = useTasteProfile();

  return (
    <section className="page swipe-page intro-page">
      <header className="page-title-block intro-title-block">
        <h1>Design Your Food Plan</h1>
        <p>Build your taste profile with quick swipes so CalorAI can personalize your meals.</p>
      </header>

      <article className="swipe-card intro-swipe-card">
        <div className="swipe-card-overlay" />
        <div className="swipe-card-content intro-card-content">
          <p className="hero-emoji" aria-hidden>
            😋
          </p>
          <h2>Build Your Taste Profile</h2>
          <p>Swipe right on foods you love, left on foods you don't.</p>
          <p className="muted">This helps us recommend meals you'll love eating.</p>
          <Link className="cta-button intro-cta" to="/swipe" onClick={resetProfile}>
            Start Swiping
          </Link>
          <small className="intro-note">Takes about 2 minutes.</small>
        </div>
      </article>
    </section>
  );
}
