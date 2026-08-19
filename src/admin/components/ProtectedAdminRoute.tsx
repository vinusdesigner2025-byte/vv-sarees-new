import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { adminSupabase } from "../../lib/adminSupabase";

export default function ProtectedAdminRoute() {
  const location = useLocation();

  const [isLoading, setIsLoading] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdminAccess =
      async () => {
        try {
          if (mounted) {
            setIsLoading(true);
          }

          /* =========================
             GET ADMIN USER
          ========================= */

          const {
            data: {
              user,
            },
            error: userError,
          } =
            await adminSupabase.auth
              .getUser();

          if (!mounted) {
            return;
          }

          if (
            userError ||
            !user
          ) {
            setIsAdmin(false);
            return;
          }

          /* =========================
             VERIFY ADMIN_USERS TABLE
          ========================= */

          const {
            data: adminUser,
            error: adminError,
          } =
            await adminSupabase
              .from("admin_users")
              .select(
                "user_id, email"
              )
              .eq(
                "user_id",
                user.id
              )
              .maybeSingle();

          if (!mounted) {
            return;
          }

          if (adminError) {
            console.error(
              "Admin access check error:",
              adminError
            );

            setIsAdmin(false);
            return;
          }

          if (!adminUser) {
            /*
              Admin session irukku
              aana admin_users table-la
              user illa.

              ADMIN session mattum
              logout.
            */

            await adminSupabase.auth
              .signOut();

            if (mounted) {
              setIsAdmin(false);
            }

            return;
          }

          if (mounted) {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error(
            "Protected admin route error:",
            error
          );

          if (mounted) {
            setIsAdmin(false);
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    void checkAdminAccess();

    /* =========================
       ADMIN AUTH CHANGES ONLY
    ========================= */

    const {
      data: {
        subscription,
      },
    } =
      adminSupabase.auth
        .onAuthStateChange(() => {
          void checkAdminAccess();
        });

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);

  /* =========================
     LOADING
  ========================= */

  if (isLoading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          fontFamily:
            "sans-serif",
        }}
      >
        Checking admin access...
      </div>
    );
  }

  /* =========================
     NOT ADMIN
  ========================= */

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}