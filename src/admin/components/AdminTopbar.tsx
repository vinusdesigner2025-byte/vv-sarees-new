import {
  FiBell,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiUser,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import { adminSupabase } from "../../lib/adminSupabase";

import "../css/AdminTopbar.css";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

export default function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminSupabase.auth.signOut();

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );
    }
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-topbar-menu"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <FiMenu />
        </button>

        <div className="admin-topbar-title">
          <span>VV SAREES</span>
          <h2>Administration</h2>
        </div>
      </div>

      <div className="admin-topbar-search">
        <FiSearch />

        <input
          type="search"
          placeholder="Search products, orders..."
          aria-label="Search admin panel"
        />
      </div>

      <div className="admin-topbar-actions">
        <button
          type="button"
          className="admin-notification-button"
          aria-label="Notifications"
        >
          <FiBell />
          <span>0</span>
        </button>

        <div className="admin-profile">
          <div className="admin-profile-icon">
            <FiUser />
          </div>

          <div className="admin-profile-info">
            <strong>
              Administrator
            </strong>

            <span>
              VV Sarees
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="admin-notification-button"
          title="Logout"
          aria-label="Logout admin"
        >
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}