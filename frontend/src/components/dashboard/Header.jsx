import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Header = ({ theme, onToggleTheme, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();              // clear token + user
    navigate("/login");    // redirect
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">ChatZ</div>
      </div>

      <div className="header-tabs">
        <button
          type="button"
          className={`mode-tab ${activeTab === "chats" ? "active" : ""}`}
          onClick={() => onTabChange("chats")}
        >
          AI Chats
        </button>
        <button
          type="button"
          className={`mode-tab ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => onTabChange("notes")}
        >
          Notes
        </button>
      </div>

      <div className="nav-buttons">
        <button className="nav-btn outlined" type="button">
          Settings
        </button>

        <button
          className="nav-btn theme outlined"
          type="button"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? "🌙 Theme" : "☀️ Theme"}
        </button>

        <button
          className="nav-btn outlined"
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
