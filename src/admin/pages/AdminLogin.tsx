import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "../css/AdminLogin.css";

type LoginLocationState = {
  from?: string;
};

const ADMIN_EMAIL =
  "admin@vvsarees.com";

const ADMIN_PASSWORD =
  "123456";

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

  useEffect(() => {
    const hasAdminSession =
      localStorage.getItem(
        "vv-admin-session"
      ) === "true";

    if (hasAdminSession) {
      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );
    }
  }, [navigate]);

  const handleLogin = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    const cleanedEmail =
      email.trim().toLowerCase();

    window.setTimeout(() => {
      if (
        cleanedEmail ===
          ADMIN_EMAIL &&
        password ===
          ADMIN_PASSWORD
      ) {
        localStorage.setItem(
          "vv-admin-session",
          "true"
        );

        navigate(redirectPath, {
          replace: true,
        });

        return;
      }

      setError(
        "Invalid email or password."
      );

      setIsLoading(false);
    }, 400);
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

          <button
            type="submit"
            disabled={isLoading}
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