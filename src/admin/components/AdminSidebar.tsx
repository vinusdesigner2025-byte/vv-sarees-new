import {
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  FiChevronLeft,
  FiChevronRight,
  FiFolder,
  FiGrid,
  FiHome,
  FiLayers,
  FiPackage,
  FiSettings,
  FiShoppingCart,
  FiStar,
  FiUsers,
  FiX,
} from "react-icons/fi";

type AdminSidebarProps = {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

type SidebarMenuItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

type SidebarSection = {
  title: string;
  items: SidebarMenuItem[];
};

const sidebarSections: SidebarSection[] = [
  {
    title: "Catalogue",
    items: [
      {
        label: "Products",
        path: "/admin/products",
        icon: <FiPackage />,
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: <FiGrid />,
      },
      {
        label: "Collections",
        path: "/admin/collections",
        icon: <FiLayers />,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Orders",
        path: "/admin/orders",
        icon: <FiShoppingCart />,
      },
      {
        label: "Customers",
        path: "/admin/customers",
        icon: <FiUsers />,
      },
    ],
  },
  {
    title: "Website",
    items: [
      {
        label: "Media Library",
        path: "/admin/media",
        icon: <FiFolder />,
      },
      {
        label: "Reviews",
        path: "/admin/reviews",
        icon: <FiStar />,
      },
    ],
  },
];

export default function AdminSidebar({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const location = useLocation();

  const isRouteActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
    }

    return location.pathname.startsWith(path);
  };

  const handleNavigation = () => {
    onCloseMobile();
  };

  return (
    <>
      <aside
        className={[
          "admin-sidebar",
          isCollapsed
            ? "admin-sidebar-collapsed"
            : "",
          isMobileOpen
            ? "admin-sidebar-mobile-open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="admin-sidebar-header">
          <NavLink
            to="/admin/dashboard"
            className="admin-sidebar-brand"
            onClick={handleNavigation}
          >
            <div className="admin-sidebar-logo">
              <span>VV</span>
            </div>

            {!isCollapsed && (
              <div className="admin-sidebar-brand-text">
                <strong>VV Sarees</strong>
                <span>Admin Panel</span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            className="admin-sidebar-mobile-close"
            onClick={onCloseMobile}
            aria-label="Close admin menu"
          >
            <FiX />
          </button>
        </div>

        <div className="admin-sidebar-scroll">
          <nav className="admin-sidebar-navigation">
            <div className="admin-sidebar-dashboard-section">
              <NavLink
                to="/admin/dashboard"
                onClick={handleNavigation}
                className={() =>
                  [
                    "admin-sidebar-link",
                    isRouteActive(
                      "/admin/dashboard"
                    )
                      ? "admin-sidebar-link-active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                title={
                  isCollapsed
                    ? "Dashboard"
                    : undefined
                }
              >
                <span className="admin-sidebar-link-icon">
                  <FiHome />
                </span>

                {!isCollapsed && (
                  <span className="admin-sidebar-link-label">
                    Dashboard
                  </span>
                )}
              </NavLink>
            </div>

            {sidebarSections.map((section) => (
              <div
                className="admin-sidebar-section"
                key={section.title}
              >
                {!isCollapsed && (
                  <div className="admin-sidebar-section-heading">
                    <span>{section.title}</span>
                    <div />
                  </div>
                )}

                {isCollapsed && (
                  <div
                    className="admin-sidebar-section-divider"
                    aria-hidden="true"
                  />
                )}

                <div className="admin-sidebar-section-links">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleNavigation}
                      className={() =>
                        [
                          "admin-sidebar-link",
                          isRouteActive(item.path)
                            ? "admin-sidebar-link-active"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")
                      }
                      title={
                        isCollapsed
                          ? item.label
                          : undefined
                      }
                    >
                      <span className="admin-sidebar-link-icon">
                        {item.icon}
                      </span>

                      {!isCollapsed && (
                        <span className="admin-sidebar-link-label">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <NavLink
            to="/admin/settings"
            onClick={handleNavigation}
            className={() =>
              [
                "admin-sidebar-link",
                isRouteActive(
                  "/admin/settings"
                )
                  ? "admin-sidebar-link-active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
            title={
              isCollapsed
                ? "Settings"
                : undefined
            }
          >
            <span className="admin-sidebar-link-icon">
              <FiSettings />
            </span>

            {!isCollapsed && (
              <span className="admin-sidebar-link-label">
                Settings
              </span>
            )}
          </NavLink>

          <button
            type="button"
            className="admin-sidebar-collapse-button"
            onClick={onToggleCollapse}
            aria-label={
              isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {isCollapsed ? (
              <FiChevronRight />
            ) : (
              <>
                <FiChevronLeft />
                <span>
                  Collapse Sidebar
                </span>
              </>
            )}
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={onCloseMobile}
          aria-label="Close admin navigation"
        />
      )}
    </>
  );
}