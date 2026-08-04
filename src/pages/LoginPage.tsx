import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

import Header from "../components/Header";
import Footer from "../components/Footer";

import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [rememberMe, setRememberMe] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleGoogleLogin = () => {
    alert("Google login will be connected with Supabase.");
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      alert("Login successful.");
    }, 700);
  };

  return (
    <div className="login-page">
      <Header />

      <main className="login-container">
        <section className="login-card">
          <div className="login-heading">
            <span>VV SAREES</span>

            <h1>Welcome Back</h1>

            <p>
              Login to manage your wishlist, cart, orders
              and account details.
            </p>
          </div>

          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
          >
            <FcGoogle />
            Continue with Google
          </button>

          <div className="login-divider">
            <span>or continue with email</span>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
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
                  className="password-toggle"
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

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />

                <span>Remember me</span>
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Logging in..."
                : "Login"}
            </button>
          </form>

          <p className="login-register-text">
            Don&apos;t have an account?{" "}

            <Link to="/register">
              Create Account
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}