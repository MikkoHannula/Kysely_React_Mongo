import React, { useState, useEffect } from "react";
import AdminHeader from "./components/AdminHeader";
import QuestionsTab from "./components/QuestionsTab";
import CategoriesTab from "./components/CategoriesTab";
import UsersTab from "./components/UsersTab";
import ResultsTab from "./components/ResultsTab";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("questions");
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

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
    // Show landing page with quiz flow
    return <LandingPage showLogin={() => setShowLogin(true)} />;
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
