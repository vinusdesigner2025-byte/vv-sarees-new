import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

import "../css/AdminLayout.css";

export default function AdminLayout() {
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const savedSidebarState = localStorage.getItem(
      "vv-admin-sidebar-collapsed"
    );

    setIsSidebarCollapsed(savedSidebarState === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "vv-admin-sidebar-collapsed",
      String(isSidebarCollapsed)
    );
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.classList.add(
        "admin-mobile-menu-active"
      );
    } else {
      document.body.classList.remove(
        "admin-mobile-menu-active"
      );
    }

    return () => {
      document.body.classList.remove(
        "admin-mobile-menu-active"
      );
    };
  }, [isMobileSidebarOpen]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(
      (currentValue) => !currentValue
    );
  };

  const handleOpenMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div
      className={[
        "admin-layout",
        isSidebarCollapsed
          ? "admin-layout-sidebar-collapsed"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onToggleCollapse={handleToggleSidebar}
        onCloseMobile={handleCloseMobileSidebar}
      />

      <div className="admin-layout-main">
        <AdminTopbar
          onMenuClick={handleOpenMobileSidebar}
        />

        <main className="admin-layout-content">
          <div
            className="admin-page-transition"
            key={location.pathname}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}