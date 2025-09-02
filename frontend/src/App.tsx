// Main App component for Kysely Quiz/Admin application
// Handles routing between quiz flow, admin panel, login, and results
// Uses React hooks for state management and data fetching

// AppInner contains all main logic for routing and state
  // State variables:
  //   activeTab: which admin tab is active
  //   user: logged-in user info
  //   loading: app loading state
  //   fatalError: unrecoverable error message
  //   showLogin: whether login page is shown
  //   quizStartData: quiz start info (name, category, count)
  //   quizResult: quiz results after completion
  //   showRanking: whether ranking view is shown
  //   quizQuestions: loaded quiz questions
  //   quizCategoryObj: loaded quiz category object
  //   quizLoading: loading state for quiz questions
  // Initial user fetch and loading timeout
  // Fetch quiz questions and category object when quizStartData changes
  // Handler functions for tab change, logout, login
  // Main render logic: routes between quiz, results, admin, and landing page
import { useState, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AdminHeader from "./components/AdminHeader";
import QuestionsTab from "./components/QuestionsTab";
import type { Question, Category } from "./components/QuestionsTab";
import CategoriesTab from "./components/CategoriesTab";
import ResultsTab from "./components/ResultsTab";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import QuizFlow from "./components/QuizFlow2";
import Ranking from "./components/Ranking";
import "./App.css";

function AppInner() {
  const [activeTab, setActiveTab] = useState("questions");
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  // Quiz state for landing page (move outside render)
  const [quizStartData, setQuizStartData] = useState<null | { name: string; category: string; count: number }>(null);
  const [quizResult, setQuizResult] = useState<null | { score: number; total: number; answers: string[]; questions: Question[] }>(null);
  // Ranking view toggle must be declared unconditionally to keep hook order stable
  const [showRanking, setShowRanking] = useState(false);
  // Quiz question fetching related hooks MUST be before any early returns
  const [quizQuestions, setQuizQuestions] = useState<Question[] | null>(null);
  const [quizCategoryObj, setQuizCategoryObj] = useState<Category | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFatalError('Sovellus ei latautunut ajoissa. (App did not load in time)');
      setLoading(false);
    }, 5000);
    fetch("/api/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
        setLoading(false);
        clearTimeout(timeout);
      })
      .catch((e) => {
        setFatalError('Virhe ladattaessa käyttäjätietoja: ' + (e?.message || e));
        setLoading(false);
        clearTimeout(timeout);
      });
    return () => clearTimeout(timeout);
  }, []);

  // Fetch quiz questions and category object when quizStartData changes
  useEffect(() => {
    if (quizStartData) {
      setQuizLoading(true);
      setQuizQuestions(null);
      setQuizCategoryObj(null);
      Promise.all([
        fetch(`/api/questions?category=${quizStartData.category}&count=${quizStartData.count}`).then(r => r.json()),
        fetch(`/api/categories/${quizStartData.category}`).then(r => r.json())
      ]).then(([questions, categoryObj]) => {
        setQuizQuestions(questions);
        setQuizCategoryObj(categoryObj);
        setQuizLoading(false);
      }).catch(() => {
        setQuizQuestions([]);
  // Fallback placeholder so UI can still advance instead of infinite loading
  setQuizCategoryObj({ _id: quizStartData.category, name: 'Tuntematon kategoria' });
        setQuizLoading(false);
      });
    } else {
      setQuizQuestions(null);
      setQuizCategoryObj(null);
      setQuizLoading(false);
    }
  }, [quizStartData]);

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

  if (fatalError) return <div style={{ color: 'red', padding: 24 }}>{fatalError}</div>;
  if (loading) return <div>Ladataan...</div>;

  if (!user) {
    // Not logged in branch (public / quiz flow)
    if (showLogin) return <LoginPage onLogin={handleLogin} />;

    // Quiz taking view
    if (quizStartData && !quizResult) {
      if (quizLoading || !quizQuestions || !quizCategoryObj) {
        return <div className="quiz-container">Ladataan kysymyksiä...</div>;
      }
      return (
        <div className="quiz-container">
          <QuizFlow
            questions={quizQuestions}
            category={quizCategoryObj}
            user={{ name: quizStartData.name }}
            onFinish={(score: number, answers: number[]) => setQuizResult({
              score,
              total: quizQuestions.length,
              answers: answers.map((ansIdx, i) =>
                typeof quizQuestions[i]?.options[ansIdx] === 'string' ? quizQuestions[i].options[ansIdx] : String(ansIdx)
              ),
              questions: quizQuestions
            })}
          />
        </div>
      );
    }

    // Result / ranking views
    if (quizResult) {
      if (showRanking) {
        return <Ranking onBack={() => setShowRanking(false)} />;
      }
      return (
        <div className="quiz-result">
          <h2>Tuloksesi</h2>
          <div>Oikeat vastaukset: {quizResult.score} / {quizResult.total}</div>
          <button className="btn-primary" onClick={() => { setQuizResult(null); setQuizStartData(null); }}>Uusi peli</button>
          <button className="btn-secondary" style={{ marginLeft: 8 }} onClick={() => setShowRanking(true)}>Näytä ranking</button>
          <button className="btn-secondary" style={{ marginLeft: 8 }} onClick={() => { setQuizResult(null); setQuizStartData(null); }}>Takaisin</button>
        </div>
      );
    }

    // Landing page (start quiz or login)
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
  <QuestionsTab active={activeTab === "questions"} />
  <CategoriesTab active={activeTab === "categories"} />
  <ResultsTab active={activeTab === "results"} />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
