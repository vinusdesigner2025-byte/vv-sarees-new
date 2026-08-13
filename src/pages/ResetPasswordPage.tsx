import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FiEye,
  FiEyeOff,
  FiLock,
} from "react-icons/fi";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { supabase } from "../lib/supabase";

import "./LoginPage.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isReady, setIsReady] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setIsReady(true);
        setError("");
      }
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setIsReady(true);
          setError("");
        }

        if (
          event === "SIGNED_IN" &&
          session
        ) {
          setIsReady(true);
          setError("");
        }
      }
    );

    const timer = window.setTimeout(
      async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          setIsReady(true);
          setError("");
        } else {
          setError(
            "Reset link session not found. Please request a new reset link."
          );
        }
      },
      1500
    );

    return () => {
      mounted = false;
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (password.length < 6) {
      setError(
        "Password minimum 6 characters irukanum."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Password and confirm password match aagala."
      );
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError(
        "Reset session expired. Please request a new reset link."
      );

      setIsSubmitting(false);
      return;
    }

    const {
      error: updateError,
    } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setError(
        updateError.message
      );

      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(
      "Password updated successfully."
    );

    await supabase.auth.signOut();

    window.setTimeout(() => {
      navigate(
        "/login",
        {
          replace: true,
        }
      );
    }, 1200);
  };

  return (
    <div className="login-page">
      <Header />

      <main className="login-container">
        <section className="login-card">
          <div className="login-heading">
            <span>
              VV SAREES
            </span>

            <h1>
              Reset Password
            </h1>

            <p>
              Create a new password for your
              VV Sarees account.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <label>
              <span>
                New Password
              </span>

              <div className="login-input-wrap">
                <FiLock />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  minLength={6}
                  disabled={
                    !isReady ||
                    isSubmitting
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  disabled={
                    !isReady ||
                    isSubmitting
                  }
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>
              </div>
            </label>

            <label>
              <span>
                Confirm Password
              </span>

              <div className="login-input-wrap">
                <FiLock />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  minLength={6}
                  disabled={
                    !isReady ||
                    isSubmitting
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                  disabled={
                    !isReady ||
                    isSubmitting
                  }
                >
                  {showConfirmPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>
              </div>
            </label>

            {!isReady &&
              !error && (
                <div
                  style={{
                    marginBottom:
                      "14px",
                    padding:
                      "10px 12px",
                    borderRadius:
                      "8px",
                    background:
                      "#fff8ec",
                    color:
                      "#8b5a32",
                    fontSize:
                      "12px",
                  }}
                >
                  Verifying reset link...
                </div>
              )}

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

            {successMessage && (
              <div
                style={{
                  marginBottom:
                    "14px",
                  padding:
                    "10px 12px",
                  borderRadius:
                    "8px",
                  background:
                    "#eef9f1",
                  color:
                    "#2f7a45",
                  fontSize:
                    "12px",
                }}
              >
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              className="login-submit-button"
              disabled={
                !isReady ||
                isSubmitting
              }
            >
              {isSubmitting
                ? "Updating..."
                : "Update Password"}
            </button>
          </form>

          <p className="login-register-text">
            Back to{" "}

            <Link to="/login">
              Login
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}