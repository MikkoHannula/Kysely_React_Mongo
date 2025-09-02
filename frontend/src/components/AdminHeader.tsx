// AdminHeader component displays the admin navigation bar with category tabs and logout button.
// Props:
//   teacherName: string - Name of the logged-in teacher/admin
//   activeTab: string - Currently selected admin tab
//   onTabChange: (tab: string) => void - Callback to change active tab
//   onLogout: () => void - Callback to log out

// Tabs for admin navigation: Questions, Categories, Results
// Main component rendering the admin header and navigation tabs

// AdminHeader component for admin panel navigation
interface AdminHeaderProps {
  teacherName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const tabs = [
  { key: "questions", label: "Kysymykset" },
  { key: "categories", label: "Kategoriat" },
  { key: "results", label: "Tulokset" }
];

export default function AdminHeader({ teacherName, activeTab, onTabChange, onLogout }: AdminHeaderProps) {
  return (
    <div className="admin-header">
      <h1>Hallintapaneeli</h1>
      <div className="admin-controls">
        <span className="teacher-name">{teacherName}</span>
        <div className="admin-nav">
          <div className="admin-category-tabs">
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
        </div>
        <button id="logoutBtn" className="btn-secondary" onClick={onLogout} type="button">
          Kirjaudu ulos
        </button>
      </div>
    </div>
  );
}
