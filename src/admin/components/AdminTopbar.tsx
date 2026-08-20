import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiBell,
  FiLogOut,
  FiMenu,
  FiRefreshCw,
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  useNavigate,
} from "react-router-dom";

import {
  adminSupabase,
} from "../../lib/adminSupabase";

import "../css/AdminTopbar.css";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

type NotificationType =
  | "order"
  | "wholesale";

type AdminNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  path: string;
};

type WholesaleApplication = {
  id: string;
  full_name: string;
  company_name: string;
  created_at: string;
};

type WholesaleResponse = {
  success?: boolean;
  applications?: WholesaleApplication[];
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  created_at: string;
};

const SEEN_IDS_KEY =
  "vv-admin-seen-notification-ids";

const getSeenIds = (): string[] => {
  try {
    const stored =
      localStorage.getItem(
        SEEN_IDS_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
};

const saveSeenIds = (
  ids: string[]
) => {
  localStorage.setItem(
    SEEN_IDS_KEY,
    JSON.stringify(ids)
  );
};

const formatNotificationTime = (
  value: string
) => {
  const date = new Date(value);

  const difference =
    Date.now() - date.getTime();

  const minutes =
    Math.floor(
      difference / 60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(date);
};

export default function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  const navigate =
    useNavigate();

  const notificationRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    notifications,
    setNotifications,
  ] =
    useState<AdminNotification[]>(
      []
    );

  const [
    isNotificationOpen,
    setIsNotificationOpen,
  ] =
    useState(false);

  const [
    isNotificationsLoading,
    setIsNotificationsLoading,
  ] =
    useState(false);

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout =
    async () => {
      try {
        await adminSupabase.auth
          .signOut();

        navigate(
          "/admin/login",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Admin logout error:",
          error
        );
      }
    };

  /* =========================================
     WHOLESALE REQUESTS
  ========================================= */

  const loadWholesaleRequests =
    async () => {
      const {
        data: {
          session,
        },
      } =
        await adminSupabase.auth
          .getSession();

      if (
        !session?.access_token
      ) {
        return [];
      }

      const {
        data,
        error,
      } =
        await adminSupabase.functions
          .invoke(
            "wholesale-admin",
            {
              body: {
                action: "list",
              },

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );

      if (error) {
        console.error(
          "Wholesale notification load error:",
          error
        );

        return [];
      }

      const result =
        data as WholesaleResponse;

      return (
        result.applications ??
        []
      );
    };

  /* =========================================
     ORDERS
  ========================================= */

  const loadOrders =
    async () => {
      const {
        data,
        error,
      } =
        await adminSupabase
          .from("orders")
          .select(`
            id,
            order_number,
            customer_name,
            created_at
          `)
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          )
          .limit(30);

      if (error) {
        console.error(
          "Order notification load error:",
          error
        );

        return [];
      }

      return (
        data as OrderRow[]
      ) ?? [];
    };

  /* =========================================
     LOAD UNREAD NOTIFICATIONS
  ========================================= */

  const loadNotifications =
    async () => {
      setIsNotificationsLoading(
        true
      );

      try {
        const [
          orders,
          wholesaleRequests,
        ] =
          await Promise.all([
            loadOrders(),
            loadWholesaleRequests(),
          ]);

        const orderNotifications:
          AdminNotification[] =
          orders.map(
            (order) => ({
              id:
                `order-${order.id}`,

              type:
                "order",

              title:
                "New Order",

              description:
                `${order.order_number} • ${order.customer_name}`,

              createdAt:
                order.created_at,

              path:
                "/admin/orders",
            })
          );

        const wholesaleNotifications:
          AdminNotification[] =
          wholesaleRequests.map(
            (request) => ({
              id:
                `wholesale-${request.id}`,

              type:
                "wholesale",

              title:
                "New Wholesale Request",

              description:
                `${request.company_name} • ${request.full_name}`,

              createdAt:
                request.created_at,

              path:
                "/admin/wholesale-applications",
            })
          );

        const combined = [
          ...orderNotifications,
          ...wholesaleNotifications,
        ].sort(
          (first, second) =>
            new Date(
              second.createdAt
            ).getTime() -
            new Date(
              first.createdAt
            ).getTime()
        );

        const seenIds =
          getSeenIds();

        const unreadOnly =
          combined.filter(
            (notification) =>
              !seenIds.includes(
                notification.id
              )
          );

        setNotifications(
          unreadOnly
        );
      } catch (error) {
        console.error(
          "Admin notifications error:",
          error
        );
      } finally {
        setIsNotificationsLoading(
          false
        );
      }
    };

  /* =========================================
     INITIAL LOAD + REFRESH
  ========================================= */

  useEffect(() => {
    void loadNotifications();

    const interval =
      window.setInterval(
        () => {
          void loadNotifications();
        },
        30000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  /* =========================================
     CLICK OUTSIDE
  ========================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setIsNotificationOpen(
          false
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =========================================
     OPEN BELL
     IMPORTANT:
     Bell open pannina read aagaadhu
  ========================================= */

  const handleNotificationClick =
    () => {
      setIsNotificationOpen(
        (current) =>
          !current
      );
    };

  /* =========================================
     VIEW ONE NOTIFICATION
  ========================================= */

  const handleOpenNotification =
    (
      notification:
        AdminNotification
    ) => {
      const seenIds =
        getSeenIds();

      if (
        !seenIds.includes(
          notification.id
        )
      ) {
        saveSeenIds([
          ...seenIds,
          notification.id,
        ]);
      }

      /*
        Click panna notification
        immediately dropdown-la
        disappear aagum.
      */

      setNotifications(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              notification.id
          )
      );

      setIsNotificationOpen(
        false
      );

      navigate(
        notification.path
      );
    };

  /* =========================================
     UNREAD COUNT
  ========================================= */

  const unreadCount =
    notifications.length;

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-topbar-menu"
          onClick={
            onMenuClick
          }
          aria-label="Open sidebar"
        >
          <FiMenu />
        </button>

        <div className="admin-topbar-title">
          <span>
            VV SAREES
          </span>

          <h2>
            Administration
          </h2>
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
        <div
          className="admin-notification-wrapper"
          ref={
            notificationRef
          }
        >
          <button
            type="button"
            className="admin-notification-button"
            aria-label="Notifications"
            onClick={
              handleNotificationClick
            }
          >
            <FiBell />

            <span>
              {unreadCount}
            </span>
          </button>

          {isNotificationOpen && (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-dropdown-header">
                <div>
                  <strong>
                    Notifications
                  </strong>

                  <span>
                    {unreadCount} unread
                  </span>
                </div>

                <div className="admin-notification-header-actions">
                  <button
                    type="button"
                    onClick={() =>
                      void loadNotifications()
                    }
                    aria-label="Refresh notifications"
                    title="Refresh"
                  >
                    <FiRefreshCw />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setIsNotificationOpen(
                        false
                      )
                    }
                    aria-label="Close notifications"
                  >
                    <FiX />
                  </button>
                </div>
              </div>

              <div className="admin-notification-list">
                {isNotificationsLoading &&
                notifications.length ===
                  0 ? (
                  <div className="admin-notification-empty">
                    Loading
                    notifications...
                  </div>
                ) : notifications.length ===
                  0 ? (
                  <div className="admin-notification-empty">
                    You're all caught up.
                  </div>
                ) : (
                  notifications.map(
                    (
                      notification
                    ) => (
                      <button
                        key={
                          notification.id
                        }
                        type="button"
                        className="admin-notification-item"
                        onClick={() =>
                          handleOpenNotification(
                            notification
                          )
                        }
                      >
                        <span
                          className={[
                            "admin-notification-item-icon",

                            notification.type ===
                            "order"
                              ? "admin-notification-order"
                              : "admin-notification-wholesale",
                          ].join(
                            " "
                          )}
                        >
                          {notification.type ===
                          "order" ? (
                            <FiShoppingCart />
                          ) : (
                            <FiUsers />
                          )}
                        </span>

                        <span className="admin-notification-content">
                          <strong>
                            {
                              notification.title
                            }
                          </strong>

                          <span>
                            {
                              notification.description
                            }
                          </span>

                          <small>
                            {formatNotificationTime(
                              notification.createdAt
                            )}
                          </small>
                        </span>
                      </button>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>

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
          onClick={
            handleLogout
          }
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