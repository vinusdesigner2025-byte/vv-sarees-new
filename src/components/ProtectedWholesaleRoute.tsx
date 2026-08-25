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
  | "loading"
  | "approved"
  | "denied";

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

export default function ProtectedWholesaleRoute() {
  const [
    accessState,
    setAccessState,
  ] =
    useState<AccessState>(
      "loading"
    );

  useEffect(() => {
    let mounted = true;

    const verifyAccess =
      async () => {
        /*
         * Remove old permanent-access
         * implementation.
         */

        localStorage.removeItem(
          "vv-wholesale-access-code"
        );

        localStorage.removeItem(
          "vv-wholesale-application-id"
        );

        /*
         * Current browser session-la
         * code irukka nu check pannuvom.
         */

        const savedCode =
          sessionStorage.getItem(
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
          const normalizedCode =
            normalizeAccessCode(
              savedCode
            );

          /*
           * Every protected access-kum
           * Supabase database-la code
           * still approved-ah irukka
           * verify pannuvom.
           */

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

          const result =
            Array.isArray(data)
              ? (data[0] as
                  | VerifyWholesaleCodeResponse
                  | undefined)
              : (data as
                  | VerifyWholesaleCodeResponse
                  | null);

          /*
           * Code revoked / rejected /
           * invalid-na session remove.
           */

          if (
            !result?.allowed ||
            !result.application_id
          ) {
            sessionStorage.removeItem(
              "vv-wholesale-access-code"
            );

            sessionStorage.removeItem(
              "vv-wholesale-application-id"
            );

            if (mounted) {
              setAccessState(
                "denied"
              );
            }

            return;
          }

          /*
           * Valid approved customer.
           */

          sessionStorage.setItem(
            "vv-wholesale-access-code",
            normalizedCode
          );

          sessionStorage.setItem(
            "vv-wholesale-application-id",
            result.application_id
          );

          if (mounted) {
            setAccessState(
              "approved"
            );
          }
        } catch (error) {
          console.error(
            "Wholesale route protection error:",
            error
          );

          sessionStorage.removeItem(
            "vv-wholesale-access-code"
          );

          sessionStorage.removeItem(
            "vv-wholesale-application-id"
          );

          if (mounted) {
            setAccessState(
              "denied"
            );
          }
        }
      };

    void verifyAccess();

    return () => {
      mounted = false;
    };
  }, []);

  if (
    accessState ===
    "loading"
  ) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "grid",

          placeItems:
            "center",

          background:
            "#faf7f2",

          color:
            "#5c3218",

          fontFamily:
            "Arial, sans-serif",
        }}
      >
        Checking wholesale access...
      </div>
    );
  }

  if (
    accessState ===
    "denied"
  ) {
    return (
      <Navigate
        to="/wholesale-login"
        replace
      />
    );
  }

  return <Outlet />;
}