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

type VerifyResponse = {
  success?: boolean;

  error?: string;

  customer?: {
    applicationId?: string;
    companyName?: string;
  };
};

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
        try {
          const sessionToken =
            sessionStorage.getItem(
              "vv_wholesale_session"
            );

          if (!sessionToken) {
            if (mounted) {
              setAccessState(
                "denied"
              );
            }

            return;
          }

          const {
            data,
            error,
          } =
            await supabase.functions
              .invoke(
                "wholesale-verify-session",
                {
                  body: {
                    sessionToken,
                  },
                }
              );

          if (error) {
            console.error(
              "Wholesale session verify error:",
              error
            );

            sessionStorage.removeItem(
              "vv_wholesale_session"
            );

            sessionStorage.removeItem(
              "vv_wholesale_company"
            );

            if (mounted) {
              setAccessState(
                "denied"
              );
            }

            return;
          }

          const result =
            data as VerifyResponse;

          if (!result?.success) {
            sessionStorage.removeItem(
              "vv_wholesale_session"
            );

            sessionStorage.removeItem(
              "vv_wholesale_company"
            );

            if (mounted) {
              setAccessState(
                "denied"
              );
            }

            return;
          }

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
            "vv_wholesale_session"
          );

          sessionStorage.removeItem(
            "vv_wholesale_company"
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