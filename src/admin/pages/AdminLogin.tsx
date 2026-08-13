import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";

import "../css/AdminLogin.css";

type LoginLocationState = {
  from?: string;
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const redirectPath =
    (
      location.state as
        | LoginLocationState
        | null
    )?.from ?? "/admin/dashboard";

  /* =========================
     CHECK EXISTING SESSION
  ========================= */

  useEffect(() => {
    let mounted = true;

    const checkAdminSession =
      async () => {
        try {
          const {
            data: {
              user,
            },
          } =
            await supabase.auth
              .getUser();

          if (
            !mounted ||
            !user
          ) {
            return;
          }

          const {
            data: adminUser,
            error: adminError,
          } =
            await supabase
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

          if (
            adminError ||
            !adminUser
          ) {
            /*
              Logged-in customer
              admin login page-ku
              vandha logout panniduvom.
            */

            await supabase.auth
              .signOut();

            return;
          }

          navigate(
            "/admin/dashboard",
            {
              replace: true,
            }
          );
        } catch (sessionError) {
          console.error(
            "Admin session check error:",
            sessionError
          );
        }
      };

    void checkAdminSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /* =========================
     ADMIN LOGIN
  ========================= */

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);

    const cleanedEmail =
      email
        .trim()
        .toLowerCase();

    try {
      /* =========================
         SUPABASE EMAIL LOGIN
      ========================= */

      const {
        data,
        error:
          loginError,
      } =
        await supabase.auth
          .signInWithPassword({
            email:
              cleanedEmail,

            password,
          });

      if (loginError) {
        throw loginError;
      }

      if (!data.user) {
        throw new Error(
          "Login user not found."
        );
      }

      /* =========================
         CHECK ADMIN_USERS TABLE
      ========================= */

      const {
        data: adminUser,
        error:
          adminError,
      } =
        await supabase
          .from("admin_users")
          .select(
            "user_id, email"
          )
          .eq(
            "user_id",
            data.user.id
          )
          .maybeSingle();

      if (
        adminError ||
        !adminUser
      ) {
        /*
          Normal customer account
          admin panel-ku access
          panna vida koodadhu.
        */

        await supabase.auth
          .signOut();

        setError(
          "This account does not have admin access."
        );

        setIsLoading(
          false
        );

        return;
      }

      /* =========================
         ADMIN LOGIN SUCCESS
      ========================= */

      navigate(
        redirectPath,
        {
          replace: true,
        }
      );
    } catch (loginError) {
      console.error(
        "Admin login error:",
        loginError
      );

      setError(
        "Invalid admin email or password."
      );

      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>
          VV Sarees
        </h1>

        <p>
          Admin CMS Login
        </p>

        <form
          onSubmit={
            handleLogin
          }
        >
          <div className="admin-input-group">
            <label htmlFor="admin-email">
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              placeholder="Enter admin email"
              value={
                email
              }
              disabled={
                isLoading
              }
              autoComplete="email"
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
              }
              required
            />
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password">
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              placeholder="Enter password"
              value={
                password
              }
              disabled={
                isLoading
              }
              autoComplete="current-password"
              onChange={(
                event
              ) =>
                setPassword(
                  event.target.value
                )
              }
              required
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom:
                  "14px",

                padding:
                  "10px 12px",

                borderRadius:
                  "8px",

                background:
                  "#fff1ef",

                color:
                  "#a13e35",

                fontSize:
                  "12px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isLoading
            }
          >
            {isLoading
              ? "Signing in..."
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}