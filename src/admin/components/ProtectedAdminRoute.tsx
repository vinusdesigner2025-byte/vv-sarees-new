import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

export default function ProtectedAdminRoute() {
  const location = useLocation();

  const [isLoading, setIsLoading] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdminAccess = async () => {
      try {
        setIsLoading(true);

        // 1. Get current Supabase user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (userError || !user) {
          setIsAdmin(false);
          return;
        }

        // 2. Check whether this user exists
        //    inside public.admin_users
        const {
          data: adminUser,
          error: adminError,
        } = await supabase
          .from("admin_users")
          .select("user_id, email")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (adminError) {
          console.error(
            "Admin access check error:",
            adminError
          );

          setIsAdmin(false);
          return;
        }

        setIsAdmin(Boolean(adminUser));
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

    // If login/logout changes, check again
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkAdminAccess();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        Checking admin access...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}