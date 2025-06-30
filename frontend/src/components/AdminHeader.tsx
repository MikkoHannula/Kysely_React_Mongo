import React from "react";

interface AdminHeaderProps {
  teacherName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const tabs = [
  { key: "questions", label: "Kysymykset" },
  { key: "categories", label: "Kategoriat" },
  { key: "users", label: "Käyttäjät" },
  { key: "results", label: "Tulokset" },
];

export default function AdminHeader({ teacherName, activeTab, onTabChange, onLogout }: AdminHeaderProps) {
  return (
    <div className="admin-header">
      <h1>Hallintapaneeli</h1>
      <div className="admin-controls">
        <span className="teacher-name">{teacherName}</span>
        <div className="admin-nav">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={"tab-button" + (activeTab === tab.key ? " active" : "")}
              onClick={() => onTabChange(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button id="logoutBtn" className="btn-secondary" onClick={onLogout} type="button">
          Kirjaudu ulos
        </button>
      </div>
    </div>
  );
}
