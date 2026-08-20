import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

import "./WholesaleAuth.css";

type LocationState = {
  message?: string;
};

type VerifyResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  sessionToken?: string;

  customer?: {
    applicationId?: string;
    companyName?: string;
    fullName?: string;
  };
};

export default function WholesaleLoginPage() {
  const navigate = useNavigate();

  const location =
    useLocation();

  const locationState =
    location.state as
      | LocationState
      | null;

  const [
    accessCode,
    setAccessCode,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState(
    locationState?.message ?? ""
  );

  useEffect(() => {
    /*
      If wholesale session already exists,
      ProtectedWholesaleRoute will verify it.

      Don't expose access code here.
    */
    const existingToken =
      sessionStorage.getItem(
        "vv_wholesale_session"
      );

    if (existingToken) {
      navigate(
        "/wholesale",
        {
          replace: true,
        }
      );
    }
  }, [navigate]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedCode =
      accessCode
        .trim()
        .toUpperCase();

    if (!normalizedCode) {
      setErrorMessage(
        "Please enter your wholesale access code."
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data,
        error,
      } =
        await supabase.functions
          .invoke(
            "wholesale-verify-access",
            {
              body: {
                accessCode:
                  normalizedCode,
              },
            }
          );

      if (error) {
        console.error(
          "Wholesale access verification error:",
          error
        );

        throw new Error(
          "Unable to verify your wholesale access code."
        );
      }

      const result =
        data as VerifyResponse;

      if (
        !result?.success ||
        !result.sessionToken
      ) {
        setErrorMessage(
          result?.error ||
            "Invalid wholesale access code."
        );

        return;
      }

      /*
        Store only signed session token.

        Access code itself is NOT stored.
      */

      sessionStorage.setItem(
        "vv_wholesale_session",
        result.sessionToken
      );

      if (
        result.customer
          ?.companyName
      ) {
        sessionStorage.setItem(
          "vv_wholesale_company",
          result.customer
            .companyName
        );
      }

      navigate(
        "/wholesale",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Wholesale login error:",
        error
      );

      if (
        error instanceof Error
      ) {
        setErrorMessage(
          error.message
        );
      } else {
        setErrorMessage(
          "Unable to verify wholesale access."
        );
      }
    } finally {
      setIsSubmitting(false);
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
            Enter the access code provided
            after your wholesale request
            has been approved.
          </p>
        </div>

        {successMessage && (
          <div className="wholesale-auth-success">
            {successMessage}
          </div>
        )}

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
              Wholesale Access Code
            </label>

            <input
              id="wholesale-access-code"
              type="text"
              value={accessCode}
              placeholder="Example: VV-WH-K7P2MX"
              autoComplete="off"
              disabled={
                isSubmitting
              }
              onChange={(event) =>
                setAccessCode(
                  event.target.value
                    .toUpperCase()
                )
              }
            />
          </div>

          <button
            type="submit"
            className="wholesale-auth-submit"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? "Verifying Access..."
              : "Enter Wholesale Store"}
          </button>
        </form>

        <div className="wholesale-auth-info">
          <strong>
            Don't have an access code?
          </strong>

          <p>
            Submit a wholesale access
            request. VV Sarees will review
            your business details before
            approval.
          </p>
        </div>

        <p className="wholesale-auth-footer-text">
          <Link to="/wholesale-register">
            Request Wholesale Access
          </Link>
        </p>

        <p className="wholesale-auth-footer-text">
          <Link to="/">
            Back to VV Sarees
          </Link>
        </p>
      </section>
    </main>
  );
}