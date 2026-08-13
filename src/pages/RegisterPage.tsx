import {
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
  FiMail,
  FiUser,
} from "react-icons/fi";

import { FcGoogle } from "react-icons/fc";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";

import "./LoginPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    signup,
    loginWithGoogle,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isGoogleLoading, setIsGoogleLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const handleGoogleSignup = async () => {
    if (isGoogleLoading || isSubmitting) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsGoogleLoading(true);

    const result = await loginWithGoogle();

    if (!result.success) {
      setError(
        result.error || "Google signup failed."
      );
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting || isGoogleLoading) {
      return;
    }

    const cleanedName = name.trim();
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedName) {
      setError("Full name enter pannu.");
      return;
    }

    if (!cleanedEmail) {
      setError("Email address enter pannu.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimum 6 characters irukanum.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password match aagala.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const result = await signup(
      cleanedName,
      cleanedEmail,
      password
    );

    if (!result.success) {
      setError(
        result.error || "Account create panna mudiyala."
      );
      setIsSubmitting(false);
      return;
    }

    if (result.needsEmailConfirmation) {
      setSuccessMessage(
        "Account created successfully. Please check your email and confirm your account before logging in."
      );
      setIsSubmitting(false);
      return;
    }

    navigate("/my-account", {
      replace: true,
    });
  };

  return (
    <div className="login-page">
      <Header />

      <main className="login-container">
        <section className="login-card">
          <div className="login-heading">
            <span>VV SAREES</span>

            <h1>Create Account</h1>

            <p>
              Create your VV Sarees account to save
              wishlist items, manage orders and track
              your purchases.
            </p>
          </div>

          <button
            type="button"
            className="google-login-button"
            onClick={() =>
              void handleGoogleSignup()
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

          <div className="login-divider">
            <span>or create with email</span>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <label>
              <span>Full Name</span>

              <div className="login-input-wrap">
                <FiUser />

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={
                    isSubmitting ||
                    isGoogleLoading
                  }
                  required
                />
              </div>
            </label>

            <label>
              <span>Email Address</span>

              <div className="login-input-wrap">
                <FiMail />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
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
              <span>Password</span>

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
                    setPassword(event.target.value)
                  }
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  disabled={
                    isSubmitting ||
                    isGoogleLoading
                  }
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
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

            <label>
              <span>Confirm Password</span>

              <div className="login-input-wrap">
                <FiLock />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={
                    isSubmitting ||
                    isGoogleLoading
                  }
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  disabled={
                    isSubmitting ||
                    isGoogleLoading
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

            {error && (
              <div
                style={{
                  marginBottom: "14px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#fff1ef",
                  color: "#a13e35",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {successMessage && (
              <div
                style={{
                  marginBottom: "14px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#eef9f1",
                  color: "#2f7a45",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              className="login-submit-button"
              disabled={
                isSubmitting ||
                isGoogleLoading
              }
            >
              {isSubmitting
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <p className="login-register-text">
            Already have an account?{" "}
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