import {
  useState,
  type FormEvent,
} from "react";

import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { supabase } from "../lib/supabase";

import "./LoginPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanedEmail =
      email.trim().toLowerCase();

    if (!cleanedEmail) {
      setError(
        "Email address enter pannu."
      );
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        cleanedEmail,
        {
          redirectTo:
            `${window.location.origin}/reset-password`,
        }
      );

    if (resetError) {
      setError(
        resetError.message
      );

      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(
      "Password reset link sent. Please check your email."
    );

    setIsSubmitting(false);
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
              Forgot Password
            </h1>

            <p>
              Enter your registered email address.
              We&apos;ll send you a password reset link.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
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
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  required
                />
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
                }}
              >
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              className="login-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          <p className="login-register-text">
            Remembered your password?{" "}

            <Link to="/login">
              Back to Login
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}