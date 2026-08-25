import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

type AccessState =
  | "checking"
  | "allowed"
  | "denied";

type VerifyWholesaleCodeResponse = {
  allowed: boolean;
  application_id: string | null;
};

export default function ProtectedWholesaleRoute() {
  const [
    accessState,
    setAccessState,
  ] =
    useState<AccessState>(
      "checking"
    );

  useEffect(() => {
    let mounted = true;

    const verifySavedAccess =
      async () => {
        const savedCode =
          localStorage.getItem(
            "vv-wholesale-access-code"
          );

        if (!savedCode) {
          if (mounted) {
            setAccessState(
              "denied"
            );
          }

          return;
        }

        try {
          const {
            data,
            error,
          } = await supabase.rpc(
            "verify_wholesale_access_code",
            {
              submitted_code:
                savedCode
                  .trim()
                  .toUpperCase(),
            }
          );

          if (error) {
            throw error;
          }

          const result =
            Array.isArray(data)
              ? (data[0] as
                  | VerifyWholesaleCodeResponse
                  | undefined)
              : (data as
                  | VerifyWholesaleCodeResponse
                  | null);

          if (!mounted) {
            return;
          }

          if (
            result?.allowed &&
            result.application_id
          ) {
            localStorage.setItem(
              "vv-wholesale-application-id",
              result.application_id
            );

            setAccessState(
              "allowed"
            );

            return;
          }

          localStorage.removeItem(
            "vv-wholesale-access-code"
          );

          localStorage.removeItem(
            "vv-wholesale-application-id"
          );

          setAccessState(
            "denied"
          );
        } catch (error) {
          console.error(
            "Wholesale route verification error:",
            error
          );

          if (mounted) {
            setAccessState(
              "denied"
            );
          }
        }
      };

    void verifySavedAccess();

    return () => {
      mounted = false;
    };
  }, []);

  if (
    accessState ===
    "checking"
  ) {
    return (
      <main className="wholesale-auth-page">
        <section className="wholesale-auth-card">
          <div className="wholesale-auth-header">
            <span className="wholesale-auth-eyebrow">
              VV Sarees
            </span>

            <h1>
              Verifying Access
            </h1>

            <p>
              Please wait while we
              verify your wholesale
              access.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (
    accessState ===
    "denied"
  ) {
    return (
      <Navigate
        to="/wholesale-register"
        replace
      />
    );
  }

  return <Outlet />;
}