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
    if (showQuizStart) {
      fetch("/api/categories").then(res => res.json()).then(setCategories);
    }
  }, [showQuizStart]);

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #f8fafc 80%, #e0e5ec 100%)', padding: '2rem 1rem 0 1rem' }}>
      <div className="hero" style={{ background: 'white', borderRadius: '1.2rem', boxShadow: '0 8px 32px 0 #bfc7ce, 0 2px 8px #fff', padding: '2.5rem 2.5rem 2rem 2.5rem', maxWidth: 480, width: '100%', margin: '2rem auto 0 auto', textAlign: 'center' }}>
        <h1 className="main-title" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#3a8dde', marginBottom: '1.2rem', letterSpacing: 1 }}>TERVETULOA KYSELYYN!</h1>
        <p className="description" style={{ fontSize: '0.95rem', color: '#444', marginBottom: '2rem' }}>
          Testaa tietosi eri aihealueista! Valitse kategoria ja aloita peli.
        </p>
        <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          {showQuizStart ? (
            <QuizStart categories={categories} onStart={onQuizStart} />
          ) : (
            <button className="btn-primary" style={{ fontSize: "1.2rem", padding: "1rem 2.5rem", margin: "1.5rem 0", borderRadius: '0.7rem' }} onClick={() => setShowQuizStart(true)}>
              Aloita peli
            </button>
          )}
          <button className="btn-secondary" style={{ fontSize: '1.08rem', padding: '0.7rem 1.7rem', borderRadius: '0.7rem', marginTop: 0 }} onClick={showLogin}>
            Kirjaudu ylläpitoon
          </button>
        </div>
      </div>
      <footer className="footer" style={{ marginTop: "3rem", color: "#888", fontSize: '1.08rem' }}>
        &copy; {new Date().getFullYear()} Kysely App
      </footer>
    </div>
  );
}
