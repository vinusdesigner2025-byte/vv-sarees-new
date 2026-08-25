import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

import "./WholesaleAuth.css";

type VerifyWholesaleCodeResponse = {
  allowed: boolean;
  application_id: string | null;
};

const normalizeAccessCode = (
  value: string
) =>
  value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

export default function WholesaleLoginPage() {
  const navigate = useNavigate();

  const [accessCode, setAccessCode] =
    useState("");

  const [isChecking, setIsChecking] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isChecking) return;

    const normalizedCode =
      normalizeAccessCode(accessCode);

    if (!normalizedCode) {
      setErrorMessage(
        "Please enter your wholesale access code."
      );
      return;
    }

    setErrorMessage("");
    setIsChecking(true);

    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        "verify_wholesale_access_code",
        {
          submitted_code:
            normalizedCode,
        }
      );

      if (error) {
        throw error;
      }

      const result = Array.isArray(data)
        ? (data[0] as
            | VerifyWholesaleCodeResponse
            | undefined)
        : (data as
            | VerifyWholesaleCodeResponse
            | null);

      if (
        !result?.allowed ||
        !result.application_id
      ) {
        setErrorMessage(
          "Invalid or inactive wholesale access code."
        );
        return;
      }

      localStorage.setItem(
        "vv-wholesale-access-code",
        normalizedCode
      );

      localStorage.setItem(
        "vv-wholesale-application-id",
        result.application_id
      );

      localStorage.removeItem(
        "vv-wholesale-pending-application"
      );

      localStorage.removeItem(
        "vv-wholesale-pending-email"
      );

      navigate(
        "/wholesale",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Wholesale access code verification error:",
        error
      );

      setErrorMessage(
        "Unable to verify your access code. Please try again."
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className="wholesale-auth-page">
      <section className="wholesale-auth-card">
        <div className="wholesale-auth-header">
          <span className="wholesale-auth-eyebrow">
            VV Sarees
          </span>

          <h1>
            Wholesale Access
          </h1>

          <p>
            Already approved? Enter
            your permanent wholesale
            access code to continue.
          </p>
        </div>

        {errorMessage && (
          <div className="wholesale-auth-error">
            {errorMessage}
          </div>
        )}

        <form
          className="wholesale-auth-form"
          onSubmit={handleSubmit}
        >
          <div className="wholesale-auth-field">
            <label htmlFor="wholesale-access-code">
              Access Code
            </label>

            <input
              id="wholesale-access-code"
              type="text"
              value={accessCode}
              placeholder="Example: VVW-8K4P2X"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={isChecking}
              onChange={(event) =>
                setAccessCode(
                  event.target.value
                    .toUpperCase()
                )
              }
              style={{
                textTransform:
                  "uppercase",
                letterSpacing:
                  "1.5px",
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="wholesale-auth-submit"
            disabled={isChecking}
          >
            {isChecking
              ? "Checking Access..."
              : "Continue to Wholesale"}
          </button>
        </form>

        <p className="wholesale-auth-footer-text">
          New wholesale customer?{" "}
          <Link to="/wholesale-register">
            Register your business
          </Link>
        </p>
      </section>
    </main>
  );
}