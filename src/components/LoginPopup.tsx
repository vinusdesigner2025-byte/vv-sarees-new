import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiX,
} from "react-icons/fi";

import { FcGoogle } from "react-icons/fc";

import { useAuth } from "../context/AuthContext";

import "./LoginPopup.css";

type LoginPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
};

export default function LoginPopup({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginPopupProps) {
  const {
    login,
    loginWithGoogle,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isGoogleLoading,
    setIsGoogleLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    document.body.style.overflow =
      isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  /* =========================
     GOOGLE LOGIN
  ========================= */

  const handleGoogleLogin =
    async () => {
      if (
        isGoogleLoading ||
        isSubmitting
      ) {
        return;
      }

      setError("");
      setIsGoogleLoading(true);

      const result =
        await loginWithGoogle();

      if (!result.success) {
        setError(
          result.error ||
            "Google login failed."
        );

        setIsGoogleLoading(false);
      }

      /*
        Success aana browser
        Google OAuth page-ku
        redirect aagum.

        So inga popup close /
        success callback manually
        call panna thevai illa.
      */
    };

  /* =========================
     EMAIL LOGIN
  ========================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      isSubmitting ||
      isGoogleLoading
    ) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    const result =
      await login(
        email,
        password
      );

    if (!result.success) {
      setError(
        result.error ||
          "Invalid email or password."
      );

      setIsSubmitting(false);

      return;
    }

    setIsSubmitting(false);

    onLoginSuccess?.();

    onClose();
  };

  return (
    <div
      className="login-popup-overlay"
      onClick={onClose}
    >
      <section
        className="login-popup-card"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="login-popup-close"
          onClick={onClose}
          aria-label="Close login popup"
        >
          <FiX />
        </button>

        <div className="login-popup-heading">
          <span>
            VV SAREES
          </span>

          <h2>
            Login Required
          </h2>

          <p>
            Login to add sarees to your
            wishlist or cart.
          </p>
        </div>

        {/* GOOGLE */}

        <button
          type="button"
          className="login-popup-google"
          onClick={() =>
            void handleGoogleLogin()
          }
          disabled={
            isGoogleLoading ||
            isSubmitting
          }
        >
          <FcGoogle />

          {isGoogleLoading
            ? "Connecting to Google..."
            : "Continue with Google"}
        </button>

        <div className="login-popup-divider">
          <span>
            or continue with email
          </span>
        </div>

        {/* EMAIL LOGIN */}

        <form
          className="login-popup-form"
          onSubmit={
            handleSubmit
          }
        >
          <label>
            <span>
              Email Address
            </span>

            <div className="login-popup-input">
              <FiMail />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Enter your email"
                autoComplete="email"
                disabled={
                  isSubmitting ||
                  isGoogleLoading
                }
                required
              />
            </div>
          </label>

          <label>
            <span>
              Password
            </span>

            <div className="login-popup-input">
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
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={
                  isSubmitting ||
                  isGoogleLoading
                }
                required
              />

              <button
                type="button"
                className="login-popup-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={
                  isSubmitting ||
                  isGoogleLoading
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

          {/* ERROR */}

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
                lineHeight:
                  1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-popup-submit"
            disabled={
              isSubmitting ||
              isGoogleLoading
            }
          >
            {isSubmitting
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="login-popup-register">
          Don&apos;t have an account?{" "}

          <a href="/register">
            Create Account
          </a>
        </p>
      </section>
    </div>
  );
}