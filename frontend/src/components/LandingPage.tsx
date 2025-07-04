import { useState, useEffect } from "react";
import QuizStart from "./QuizStart";

interface LandingPageProps {
  showLogin: () => void;
  onQuizStart: (data: { name: string; category: string; count: number }) => void;
}

export default function LandingPage({ showLogin, onQuizStart }: LandingPageProps) {
  const [showQuizStart, setShowQuizStart] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    if (showQuizStart && categories.length === 0) {
      fetch("/api/categories").then(res => res.json()).then(setCategories);
    }
  }, [showQuizStart, categories.length]);

  return (
    <div className="landing-page">
      <div className="hero">
        <h1 className="main-title">Tervetuloa Kyselyyn!</h1>
        <p className="description">
          Testaa tietosi eri aihealueista! Valitse kategoria ja opettaja, ja aloita peli.
        </p>
        <div className="actions">
          {showQuizStart ? (
            <QuizStart categories={categories} onStart={onQuizStart} />
          ) : (
            <button className="btn-primary" style={{ fontSize: "1.2rem", padding: "1rem 2.5rem", margin: "1.5rem 0" }} onClick={() => setShowQuizStart(true)}>
              Aloita peli
            </button>
          )}
          <div style={{ marginTop: "1.5rem" }}>
            <button className="btn-secondary" onClick={showLogin}>
              Kirjaudu ylläpitoon
            </button>
          </div>
        </div>
      </div>
      <footer className="footer" style={{ marginTop: "3rem", color: "#888" }}>
        &copy; {new Date().getFullYear()} Kysely App
      </footer>
    </div>
  );
}
