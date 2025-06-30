import React, { useState } from "react";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <div className="landing-page">
      <div className="hero">
        <h1 className="main-title">Tervetuloa Kyselyyn!</h1>
        <p className="description">
          Testaa tietosi eri aihealueista! Valitse kategoria ja opettaja, ja aloita peli.
        </p>
        <div className="actions">
          <button className="btn-primary" style={{ fontSize: "1.2rem", padding: "1rem 2.5rem", margin: "1.5rem 0" }}>
            Aloita peli
          </button>
          <div style={{ marginTop: "1.5rem" }}>
            <button className="btn-secondary" onClick={() => setShowLogin(true)}>
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
