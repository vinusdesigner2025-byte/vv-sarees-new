import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from "react-icons/fi";

import { FcGoogle } from "react-icons/fc";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";

import "./LoginPage.css";

type LoginLocationState = {
  from?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    loginWithGoogle,
    isLoggedIn,
    isAuthLoading,
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
    rememberMe,
    setRememberMe,
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

  const redirectPath =
    (
      location.state as
        | LoginLocationState
        | null
    )?.from ??
    "/my-account";

  /* =========================
     ALREADY LOGGED IN
  ========================= */

  useEffect(() => {
    if (
      !isAuthLoading &&
      isLoggedIn
    ) {
      navigate(
        redirectPath,
        {
          replace: true,
        }
      );
    }
  }, [
    isAuthLoading,
    isLoggedIn,
    navigate,
    redirectPath,
  ]);

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

        setIsGoogleLoading(
          false
        );
      }

      /*
        Success aana browser
        Google login page-ku
        redirect aagum.
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

    if (
      !email.trim()
    ) {
      setError(
        "Email address enter pannu."
      );

      return;
    }

    if (
      !password
    ) {
      setError(
        "Password enter pannu."
      );

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

      setIsSubmitting(
        false
      );

      return;
    }

    /*
      Supabase session itself
      browser-la persist aagum.
      Remember Me checkbox
      design-ku retain pannirukom.
    */

    if (rememberMe) {
      localStorage.setItem(
        "vv-customer-remember",
        email.trim().toLowerCase()
      );
    } else {
      localStorage.removeItem(
        "vv-customer-remember"
      );
    }

    navigate(
      redirectPath,
      {
        replace: true,
      }
    );
  };

  /* =========================
     REMEMBER EMAIL
  ========================= */

  useEffect(() => {
    const rememberedEmail =
      localStorage.getItem(
        "vv-customer-remember"
      );

    if (
      rememberedEmail
    ) {
      setEmail(
        rememberedEmail
      );

      setRememberMe(
        true
      );
    }
  }, []);

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
              Welcome Back
            </h1>

            <p>
              Login to manage your wishlist,
              cart, orders and account details.
            </p>
          </div>

          {/* =========================
              GOOGLE
          ========================= */}

          <button
            type="button"
            className="google-login-button"
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

          <div className="login-divider">
            <span>
              or continue with email
            </span>
          </div>

          {/* =========================
              EMAIL LOGIN
          ========================= */}

          <form
            className="login-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              <span>
                Email Address
              </span>

              <div className="login-input-wrap">
                <FiMail />

                <input
                  type="email"
                  value={email}
                  onChange={(
                    event
                  ) =>
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

              <div className="login-input-wrap">
                <FiLock />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(
                    event
                  ) =>
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
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (
                        current
                      ) =>
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

            {/* =========================
                ERROR
            ========================= */}

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

            {/* =========================
                OPTIONS
            ========================= */}

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={(
                    event
                  ) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  disabled={
                    isSubmitting ||
                    isGoogleLoading
                  }
                />

                <span>
                  Remember me
                </span>
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            {/* =========================
                SUBMIT
            ========================= */}

            <button
              type="submit"
              className="login-submit-button"
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