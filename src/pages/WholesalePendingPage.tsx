import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

import { supabase } from "../lib/supabase";

import "./WholesaleAuth.css";

type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

type StatusResponse = {
  success?: boolean;

  status?: ApprovalStatus;

  rejectionReason?: string | null;

  error?: string;
};

export default function WholesalePendingPage() {
  const navigate =
    useNavigate();

  const [
    status,
    setStatus,
  ] =
    useState<ApprovalStatus>(
      "pending"
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    rejectionReason,
    setRejectionReason,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    let mounted = true;

    const applicationId =
      localStorage.getItem(
        "vv-wholesale-pending-application"
      );

    if (!applicationId) {
      navigate(
        "/wholesale-register",
        {
          replace: true,
        }
      );

      return;
    }

    const checkStatus =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase.functions
              .invoke(
                "wholesale-check-status",
                {
                  body: {
                    applicationId,
                  },
                }
              );

          if (error) {
            console.error(
              "Wholesale status check error:",
              error
            );

            return;
          }

          const result =
            data as StatusResponse;

          if (
            !result?.success ||
            !result.status
          ) {
            return;
          }

          if (!mounted) {
            return;
          }

          setStatus(
            result.status
          );

          if (
            result.status ===
            "approved"
          ) {
            localStorage.removeItem(
              "vv-wholesale-pending-application"
            );

            navigate(
              "/wholesale-login",
              {
                replace: true,

                state: {
                  message:
                    "Your wholesale request has been approved. Enter the access code provided by VV Sarees.",
                },
              }
            );

            return;
          }

          if (
            result.status ===
            "rejected"
          ) {
            setRejectionReason(
              result.rejectionReason ??
                null
            );
          }
        } catch (error) {
          console.error(
            "Wholesale pending page error:",
            error
          );

          if (mounted) {
            setErrorMessage(
              "Unable to check approval status."
            );
          }
        }
      };

    void checkStatus();

    const interval =
      window.setInterval(
        () => {
          void checkStatus();
        },
        5000
      );

    return () => {
      mounted = false;

      window.clearInterval(
        interval
      );
    };
  }, [navigate]);

  return (
    <main className="wholesale-auth-page">
      <section className="wholesale-auth-card">
        <div className="wholesale-auth-header">
          <span className="wholesale-auth-eyebrow">
            VV Sarees
          </span>

          {status ===
          "pending" ? (
            <>
              <div
                style={{
                  fontSize: "42px",
                  marginBottom:
                    "14px",
                  color: "#8a5a35",
                }}
              >
                <FiClock />
              </div>

              <h1>
                Request Pending
              </h1>

              <p>
                Your wholesale
                application has been
                submitted successfully.
                We are waiting for admin
                approval.
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: "42px",
                  marginBottom:
                    "14px",
                  color: "#a5443a",
                }}
              >
                <FiXCircle />
              </div>

              <h1>
                Request Not Approved
              </h1>

              <p>
                Your wholesale request
                was not approved.
              </p>
            </>
          )}
        </div>

        {status ===
          "pending" && (
          <div className="wholesale-auth-info">
            <strong>
              Checking approval
              automatically
            </strong>

            <p>
              This page will
              automatically continue
              once VV Sarees approves
              your wholesale request.
              You don't need to refresh
              the page.
            </p>
          </div>
        )}

        {status ===
          "rejected" && (
          <div className="wholesale-auth-error">
            {rejectionReason ||
              "Please contact VV Sarees for more information."}
          </div>
        )}

        {errorMessage && (
          <div className="wholesale-auth-error">
            {errorMessage}
          </div>
        )}

        {status ===
          "pending" && (
          <div
            style={{
              marginTop: "22px",
              textAlign: "center",
              fontSize: "12px",
              color: "#8b7565",
            }}
          >
            <FiCheckCircle
              style={{
                marginRight: "6px",
              }}
            />
            Application submitted
            successfully
          </div>
        )}

        <p className="wholesale-auth-footer-text">
          <Link to="/">
            Back to VV Sarees
          </Link>
        </p>
      </section>
    </main>
  );
}