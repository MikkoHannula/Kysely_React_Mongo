import React, { useState, useEffect } from "react";
import AdminHeader from "./components/AdminHeader";
import QuestionsTab from "./components/QuestionsTab";
import CategoriesTab from "./components/CategoriesTab";
import UsersTab from "./components/UsersTab";
import ResultsTab from "./components/ResultsTab";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import QuizFlow from "./components/QuizFlow";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("questions");
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  // Quiz state for landing page (move outside render)
  const [quizStartData, setQuizStartData] = useState<null | { name: string; category: string; count: number }>(null);
  const [quizResult, setQuizResult] = useState<null | { score: number; total: number; answers: string[]; questions: any[] }>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTabChange = (tab: string) => setActiveTab(tab);
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setShowLogin(false);
    setActiveTab("questions");
  };
  const handleLogin = (user: { username: string; role: string }) => {
    setUser(user);
    setShowLogin(false);
  };

  if (loading) return <div>Ladataan...</div>;

  if (!user) {
    if (showLogin) {
      return <LoginPage onLogin={handleLogin} />;
    }
    if (quizStartData) {
      return (
        <div className="quiz-container">
          <button className="btn-secondary" style={{ float: 'right' }} onClick={() => setQuizStartData(null)}>Takaisin</button>
          <QuizFlow {...quizStartData} onFinish={setQuizResult} />
        </div>
      );
    }
    if (quizResult) {
      // Save result to backend
      React.useEffect(() => {
        if (!quizResult || !quizStartData) return;
        fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: quizStartData && (quizStartData as any).name,
            category: quizStartData && (quizStartData as any).category,
            score: `${quizResult.score} / ${quizResult.total}`,
            scoreValue: quizResult.score,
            total: quizResult.total,
            date: new Date().toISOString()
          })
        });
      }, [quizResult, quizStartData]);
      // Result view with ranking button
      const [showRanking, setShowRanking] = React.useState(false);
      if (showRanking) {
        const Ranking = require("./components/Ranking").default;
        return <Ranking onBack={() => setShowRanking(false)} />;
      }
      return (
        <div className="quiz-result">
          <h2>Tuloksesi</h2>
          <div>Oikeat vastaukset: {quizResult.score} / {quizResult.total}</div>
          <button className="btn-primary" onClick={() => { setQuizResult(null); setQuizStartData(null); }}>Uusi peli</button>
          <button className="btn-secondary" style={{ marginLeft: 8 }} onClick={() => setShowRanking(true)}>Näytä ranking</button>
        </div>
      );
    }
    return <LandingPage showLogin={() => setShowLogin(true)} onQuizStart={setQuizStartData} />;
  }

  return (
    <main>
      <div className="admin-container">
        <AdminHeader
          teacherName={user.username}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />
        {activeTab === "questions" && <QuestionsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "results" && <ResultsTab />}
      </div>
    </main>
  );
}
