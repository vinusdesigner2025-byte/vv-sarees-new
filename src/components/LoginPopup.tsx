import { useEffect, useState } from "react";
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
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    loginWithGoogle();

    onLoginSuccess?.();
    onClose();
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSubmitting(true);

    setTimeout(() => {
      login(email);

      setIsSubmitting(false);

      onLoginSuccess?.();
      onClose();
    }, 700);
  };

  return (
    <div
      className="login-popup-overlay"
      onClick={onClose}
    >
      <section
        className="login-popup-card"
        onClick={(event) => event.stopPropagation()}
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
          <span>VV SAREES</span>

          <h2>Login Required</h2>

          <p>
            Login to add sarees to your wishlist or cart.
          </p>
        </div>

        <button
          type="button"
          className="login-popup-google"
          onClick={handleGoogleLogin}
        >
          <FcGoogle />
          Continue with Google
        </button>

        <div className="login-popup-divider">
          <span>or continue with email</span>
        </div>

        <form
          className="login-popup-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>Email Address</span>

            <div className="login-popup-input">
              <FiMail />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>

            <div className="login-popup-input">
              <FiLock />

              <input
                type={
                  showPassword ? "text" : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                className="login-popup-password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
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

          <button
            type="submit"
            className="login-popup-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="login-popup-register">
          Don&apos;t have an account?{" "}
          <a href="/register">Create Account</a>
        </p>
      </section>
    </div>
  );
}