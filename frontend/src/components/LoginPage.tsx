import React, { useState } from "react";

interface Props {
  onLogin: (user: { username: string; role: string }) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (res.ok) {
      const user = await res.json();
      onLogin(user);
    } else {
      const data = await res.json();
      setError(data.message || "Kirjautuminen epäonnistui");
    }
  };

  return (
    <div className="login-page">
      <h2>Ylläpitoon kirjautuminen</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Käyttäjätunnus</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Salasana</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button className="btn-primary" type="submit">Kirjaudu</button>
      </form>
    </div>
  );
}
