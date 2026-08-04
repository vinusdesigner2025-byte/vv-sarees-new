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

  const [message, setMessage] =
    useState("");

  const redirectPath =
    (
      location.state as
        | LoginLocationState
        | null
    )?.from ?? "/admin/dashboard";

  useEffect(() => {
    const checkExistingSession =
      async () => {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (session) {
          navigate(
            "/admin/dashboard",
            {
              replace: true,
            }
          );
        }
      };

    void checkExistingSession();
  }, [navigate]);

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanedEmail =
      email.trim().toLowerCase();

    if (
      !cleanedEmail ||
      !password
    ) {
      setError(
        "Please enter email and password."
      );
      return;
    }

    setIsLoading(true);

    const { error:
      loginError } =
      await supabase.auth
        .signInWithPassword({
          email: cleanedEmail,
          password,
        });

    if (loginError) {
      console.error(
        "Admin login error:",
        loginError
      );

      setError(
        "Invalid email or password."
      );

      setIsLoading(false);
      return;
    }

    navigate(redirectPath, {
      replace: true,
    });
  };

  const handleForgotPassword =
    async () => {
      setError("");
      setMessage("");

      const cleanedEmail =
        email.trim().toLowerCase();

      if (!cleanedEmail) {
        setError(
          "First enter your admin email."
        );
        return;
      }

      setIsLoading(true);

      const { error:
        resetError } =
        await supabase.auth
          .resetPasswordForEmail(
            cleanedEmail,
            {
              redirectTo:
                `${window.location.origin}/admin/reset-password`,
            }
          );

      if (resetError) {
        console.error(
          "Password reset error:",
          resetError
        );

        setError(
          `Reset email send aagala: ${resetError.message}`
        );

        setIsLoading(false);
        return;
      }

      setMessage(
        "Password reset link email-ku anupirukom."
      );

      setIsLoading(false);
    };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>VV Sarees</h1>

        <p>Admin CMS Login</p>

        <form onSubmit={handleLogin}>
          <div className="admin-input-group">
            <label htmlFor="admin-email">
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              placeholder="admin@vvsarees.com"
              value={email}
              disabled={isLoading}
              autoComplete="email"
              onChange={(event) =>
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
              value={password}
              disabled={isLoading}
              autoComplete="current-password"
              onChange={(event) =>
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
                marginBottom: "14px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#fff1ef",
                color: "#a13e35",
                fontSize: "12px",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#eef9f1",
                color: "#1f7a3d",
                fontSize: "12px",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? "Signing in..."
              : "Login"}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              void handleForgotPassword()
            }
            style={{
              marginTop: "12px",
              border: "none",
              background:
                "transparent",
              color: "#7a401d",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Forgot Password?
          </button>
        </form>
      </div>
    </div>
  );
}