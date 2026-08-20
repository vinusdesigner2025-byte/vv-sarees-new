import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheck,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  adminSupabase,
} from "../../lib/adminSupabase";

import "../css/WholesaleApplications.css";

type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

type WholesaleApplication = {
  id: string;

  full_name: string;

  company_name: string;

  business_type:
    string | null;

  gst_registered:
    boolean;

  gstin:
    string | null;

  phone: string;

  whatsapp_number:
    string | null;

  email: string;

  address:
    string | null;

  city:
    string | null;

  state:
    string | null;

  pincode:
    string | null;

  approval_status:
    ApprovalStatus;

  rejection_reason:
    string | null;

  admin_notes:
    string | null;

  access_code:
    string | null;

  approved_at:
    string | null;

  created_at: string;

  updated_at: string;
};

type AdminFunctionResponse = {
  success?: boolean;

  error?: string;

  message?: string;

  applications?:
    WholesaleApplication[];

  application?:
    WholesaleApplication;

  applicationId?: string;
};

const getStatusLabel = (
  status: ApprovalStatus
) => {
  if (
    status === "approved"
  ) {
    return "Approved";
  }

  if (
    status === "rejected"
  ) {
    return "Rejected";
  }

  return "Pending";
};

const formatDate = (
  value: string
) => {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
};

export default function WholesaleApplications() {
  const [
    applications,
    setApplications,
  ] =
    useState<
      WholesaleApplication[]
    >([]);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      "all" |
      ApprovalStatus
    >("all");

  const [
    selectedApplication,
    setSelectedApplication,
  ] =
    useState<
      WholesaleApplication |
      null
    >(null);

  const [
    actionLoadingId,
    setActionLoadingId,
  ] =
    useState<
      string |
      null
    >(null);

  const invokeAdminFunction =
    async (
      body:
        Record<
          string,
          unknown
        >
    ) => {
      const {
        data: {
          session,
        },

        error:
          sessionError,
      } =
        await adminSupabase.auth
          .getSession();

      if (
        sessionError ||
        !session
          ?.access_token
      ) {
        throw new Error(
          "Admin session not available."
        );
      }

      const {
        data,
        error,
      } =
        await adminSupabase.functions
          .invoke(
            "wholesale-admin",
            {
              body,

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );

      if (error) {
        throw error;
      }

      return data as AdminFunctionResponse;
    };

  const fetchApplications =
    async () => {
      setIsLoading(true);

      setErrorMessage("");

      try {
        const result =
          await invokeAdminFunction({
            action:
              "list",
          });

        if (
          !result
            ?.success
        ) {
          throw new Error(
            result
              ?.error ||
              "Unable to load wholesale requests."
          );
        }

        setApplications(
          result
            .applications ??
            []
        );
      } catch (error) {
        console.error(
          "Wholesale applications load error:",
          error
        );

        setErrorMessage(
          error instanceof
          Error
            ? error.message
            : "Unable to load wholesale requests."
        );
      } finally {
        setIsLoading(
          false
        );
      }
    };

  useEffect(() => {
    void fetchApplications();
  }, []);

  const filteredApplications =
    useMemo(() => {
      const normalized =
        searchTerm
          .trim()
          .toLowerCase();

      return applications.filter(
        (
          application
        ) => {
          const matchesStatus =
            statusFilter ===
              "all" ||
            application
              .approval_status ===
              statusFilter;

          const matchesSearch =
            !normalized ||
            application
              .full_name
              .toLowerCase()
              .includes(
                normalized
              ) ||
            application
              .company_name
              .toLowerCase()
              .includes(
                normalized
              ) ||
            application
              .email
              .toLowerCase()
              .includes(
                normalized
              ) ||
            application
              .phone
              .toLowerCase()
              .includes(
                normalized
              );

          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      applications,
      searchTerm,
      statusFilter,
    ]);

  const handleApprove =
    async (
      application:
        WholesaleApplication
    ) => {
      const confirmed =
        window.confirm(
          `Approve wholesale access for ${application.company_name}?`
        );

      if (!confirmed) {
        return;
      }

      setActionLoadingId(
        application.id
      );

      try {
        const result =
          await invokeAdminFunction({
            action:
              "approve",

            applicationId:
              application.id,
          });

        if (
          !result
            ?.success ||
          !result
            .application
        ) {
          throw new Error(
            result
              ?.error ||
              "Unable to approve request."
          );
        }

        const updated =
          result.application;

        setApplications(
          (
            current
          ) =>
            current.map(
              (
                item
              ) =>
                item.id ===
                updated.id
                  ? {
                      ...item,
                      ...updated,
                    }
                  : item
            )
        );

        setSelectedApplication(
          (
            current
          ) =>
            current
              ?.id ===
            updated.id
              ? {
                  ...current,
                  ...updated,
                }
              : current
        );

        window.alert(
          updated
            .access_code
            ? `Approved successfully.\nAccess Code: ${updated.access_code}`
            : "Approved successfully."
        );
      } catch (error) {
        console.error(
          "Wholesale approve error:",
          error
        );

        window.alert(
          error instanceof
          Error
            ? error.message
            : "Unable to approve request."
        );
      } finally {
        setActionLoadingId(
          null
        );
      }
    };

  const handleReject =
    async (
      application:
        WholesaleApplication
    ) => {
      const reason =
        window.prompt(
          "Reason for rejection:",
          application
            .rejection_reason ??
            ""
        );

      if (
        reason ===
        null
      ) {
        return;
      }

      setActionLoadingId(
        application.id
      );

      try {
        const result =
          await invokeAdminFunction({
            action:
              "reject",

            applicationId:
              application.id,

            rejectionReason:
              reason
                .trim() ||
              "Application not approved.",
          });

        if (
          !result
            ?.success ||
          !result
            .application
        ) {
          throw new Error(
            result
              ?.error ||
              "Unable to reject request."
          );
        }

        const updated =
          result.application;

        setApplications(
          (
            current
          ) =>
            current.map(
              (
                item
              ) =>
                item.id ===
                updated.id
                  ? {
                      ...item,
                      ...updated,
                    }
                  : item
            )
        );

        setSelectedApplication(
          (
            current
          ) =>
            current
              ?.id ===
            updated.id
              ? {
                  ...current,
                  ...updated,
                }
              : current
        );

        window.alert(
          "Wholesale request rejected."
        );
      } catch (error) {
        console.error(
          "Wholesale reject error:",
          error
        );

        window.alert(
          error instanceof
          Error
            ? error.message
            : "Unable to reject request."
        );
      } finally {
        setActionLoadingId(
          null
        );
      }
    };

  const handleRemove =
    async (
      application:
        WholesaleApplication
    ) => {
      const confirmed =
        window.confirm(
          `Remove ${application.company_name} from wholesale access?\n\nThey will need to submit the wholesale registration form again.`
        );

      if (!confirmed) {
        return;
      }

      setActionLoadingId(
        application.id
      );

      try {
        const result =
          await invokeAdminFunction({
            action:
              "remove",

            applicationId:
              application.id,
          });

        if (
          !result
            ?.success
        ) {
          throw new Error(
            result
              ?.error ||
              "Unable to remove wholesale user."
          );
        }

        setApplications(
          (
            current
          ) =>
            current.filter(
              (
                item
              ) =>
                item.id !==
                application.id
            )
        );

        setSelectedApplication(
          null
        );

        window.alert(
          "Wholesale user removed successfully."
        );
      } catch (error) {
        console.error(
          "Wholesale remove error:",
          error
        );

        window.alert(
          error instanceof
          Error
            ? error.message
            : "Unable to remove wholesale user."
        );
      } finally {
        setActionLoadingId(
          null
        );
      }
    };

  const pendingCount =
    applications.filter(
      (
        item
      ) =>
        item
          .approval_status ===
        "pending"
    ).length;

  const approvedCount =
    applications.filter(
      (
        item
      ) =>
        item
          .approval_status ===
        "approved"
    ).length;

  const rejectedCount =
    applications.filter(
      (
        item
      ) =>
        item
          .approval_status ===
        "rejected"
    ).length;

  const renderActions = (
    application:
      WholesaleApplication
  ) => {
    const isBusy =
      actionLoadingId ===
      application.id;

    if (
      application
        .approval_status ===
      "pending"
    ) {
      return (
        <div className="wholesale-admin-actions">
          <button
            type="button"
            className="wholesale-approve-btn"
            disabled={
              isBusy
            }
            onClick={() =>
              void handleApprove(
                application
              )
            }
          >
            <FiCheck />

            Approve
          </button>

          <button
            type="button"
            className="wholesale-reject-btn"
            disabled={
              isBusy
            }
            onClick={() =>
              void handleReject(
                application
              )
            }
          >
            <FiX />

            Reject
          </button>
        </div>
      );
    }

    return (
      <div className="wholesale-admin-actions">
        <button
          type="button"
          className="wholesale-remove-btn"
          disabled={
            isBusy
          }
          onClick={() =>
            void handleRemove(
              application
            )
          }
        >
          <FiTrash2 />

          {isBusy
            ? "Removing..."
            : "Remove User"}
        </button>
      </div>
    );
  };

  return (
    <div className="wholesale-admin-page">
      <div className="wholesale-admin-header">
        <div>
          <span className="wholesale-admin-eyebrow">
            Wholesale
          </span>

          <h1>
            Wholesale Requests
          </h1>

          <p>
            Review business requests and
            approve wholesale access.
          </p>
        </div>

        <button
          type="button"
          className="wholesale-admin-refresh"
          onClick={() =>
            void fetchApplications()
          }
          disabled={
            isLoading
          }
        >
          <FiRefreshCw />

          Refresh
        </button>
      </div>

      <div className="wholesale-admin-summary">
        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              "all"
            )
          }
        >
          <span>
            Total
          </span>

          <strong>
            {
              applications.length
            }
          </strong>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              "pending"
            )
          }
        >
          <span>
            Pending
          </span>

          <strong>
            {
              pendingCount
            }
          </strong>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              "approved"
            )
          }
        >
          <span>
            Approved
          </span>

          <strong>
            {
              approvedCount
            }
          </strong>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              "rejected"
            )
          }
        >
          <span>
            Rejected
          </span>

          <strong>
            {
              rejectedCount
            }
          </strong>
        </button>
      </div>

      <div className="wholesale-admin-toolbar">
        <div className="wholesale-admin-search">
          <FiSearch />

          <input
            type="search"
            placeholder="Search company, name, email or phone..."
            value={
              searchTerm
            }
            onChange={(
              event
            ) =>
              setSearchTerm(
                event
                  .target
                  .value
              )
            }
          />
        </div>

        <select
          value={
            statusFilter
          }
          onChange={(
            event
          ) =>
            setStatusFilter(
              event.target
                .value as
                | "all"
                | ApprovalStatus
            )
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="rejected">
            Rejected
          </option>
        </select>
      </div>

      {isLoading ? (
        <div className="wholesale-admin-empty">
          Loading wholesale requests...
        </div>
      ) : errorMessage ? (
        <div className="wholesale-admin-empty">
          <strong>
            Requests load aagala
          </strong>

          <p>
            {errorMessage}
          </p>
        </div>
      ) : filteredApplications.length ===
        0 ? (
        <div className="wholesale-admin-empty">
          No wholesale requests found.
        </div>
      ) : (
        <div className="wholesale-admin-table-wrap">
          <table className="wholesale-admin-table">
            <thead>
              <tr>
                <th>
                  Business
                </th>

                <th>
                  Contact
                </th>

                <th>
                  GST
                </th>

                <th>
                  Requested
                </th>

                <th>
                  Status
                </th>

                <th>
                  Access Code
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map(
                (
                  application
                ) => (
                  <tr
                    key={
                      application.id
                    }
                  >
                    <td>
                      <button
                        type="button"
                        className="wholesale-admin-business"
                        onClick={() =>
                          setSelectedApplication(
                            application
                          )
                        }
                      >
                        <strong>
                          {
                            application.company_name
                          }
                        </strong>

                        <span>
                          {
                            application.full_name
                          }
                        </span>
                      </button>
                    </td>

                    <td>
                      <div className="wholesale-admin-contact">
                        <span>
                          {
                            application.phone
                          }
                        </span>

                        <small>
                          {
                            application.email
                          }
                        </small>
                      </div>
                    </td>

                    <td>
                      {application.gst_registered
                        ? application.gstin ||
                          "Registered"
                        : "Not Registered"}
                    </td>

                    <td>
                      {formatDate(
                        application.created_at
                      )}
                    </td>

                    <td>
                      <span
                        className={`wholesale-status wholesale-status-${application.approval_status}`}
                      >
                        {getStatusLabel(
                          application.approval_status
                        )}
                      </span>
                    </td>

                    <td>
                      {application.access_code ? (
                        <code className="wholesale-access-code">
                          {
                            application.access_code
                          }
                        </code>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      {renderActions(
                        application
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedApplication && (
        <div
          className="wholesale-admin-modal-backdrop"
          onClick={() =>
            setSelectedApplication(
              null
            )
          }
        >
          <div
            className="wholesale-admin-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="wholesale-admin-modal-header">
              <div>
                <span>
                  Wholesale Customer
                </span>

                <h2>
                  {
                    selectedApplication.company_name
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedApplication(
                    null
                  )
                }
                aria-label="Close customer details"
              >
                <FiX />
              </button>
            </div>

            <div className="wholesale-admin-detail-grid">
              <div>
                <span>
                  Full Name
                </span>

                <strong>
                  {
                    selectedApplication.full_name
                  }
                </strong>
              </div>

              <div>
                <span>
                  Company / Shop Name
                </span>

                <strong>
                  {
                    selectedApplication.company_name
                  }
                </strong>
              </div>

              <div>
                <span>
                  Business Type
                </span>

                <strong>
                  {selectedApplication.business_type ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  GST Registered
                </span>

                <strong>
                  {selectedApplication.gst_registered
                    ? "Yes"
                    : "No"}
                </strong>
              </div>

              <div>
                <span>
                  GSTIN
                </span>

                <strong>
                  {selectedApplication.gst_registered
                    ? selectedApplication.gstin ||
                      "—"
                    : "Not Registered"}
                </strong>
              </div>

              <div>
                <span>
                  Phone Number
                </span>

                <strong>
                  {
                    selectedApplication.phone
                  }
                </strong>
              </div>

              <div>
                <span>
                  WhatsApp Number
                </span>

                <strong>
                  {selectedApplication.whatsapp_number ||
                    selectedApplication.phone}
                </strong>
              </div>

              <div>
                <span>
                  Email Address
                </span>

                <strong>
                  {
                    selectedApplication.email
                  }
                </strong>
              </div>

              <div className="wholesale-admin-detail-full">
                <span>
                  Address
                </span>

                <strong>
                  {selectedApplication.address ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  City
                </span>

                <strong>
                  {selectedApplication.city ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  State
                </span>

                <strong>
                  {selectedApplication.state ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Pincode
                </span>

                <strong>
                  {selectedApplication.pincode ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Application Status
                </span>

                <strong>
                  {getStatusLabel(
                    selectedApplication.approval_status
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Access Code
                </span>

                <strong>
                  {selectedApplication.access_code ||
                    "Not generated"}
                </strong>
              </div>

              <div>
                <span>
                  Requested On
                </span>

                <strong>
                  {formatDate(
                    selectedApplication.created_at
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Approved On
                </span>

                <strong>
                  {selectedApplication.approved_at
                    ? formatDate(
                        selectedApplication.approved_at
                      )
                    : "—"}
                </strong>
              </div>

              {selectedApplication.rejection_reason && (
                <div className="wholesale-admin-detail-full">
                  <span>
                    Rejection Reason
                  </span>

                  <strong>
                    {
                      selectedApplication.rejection_reason
                    }
                  </strong>
                </div>
              )}

              {selectedApplication.admin_notes && (
                <div className="wholesale-admin-detail-full">
                  <span>
                    Admin Notes
                  </span>

                  <strong>
                    {
                      selectedApplication.admin_notes
                    }
                  </strong>
                </div>
              )}
            </div>

            <div className="wholesale-admin-modal-actions">
              {selectedApplication.approval_status ===
              "pending" ? (
                <>
                  <button
                    type="button"
                    className="wholesale-approve-btn"
                    disabled={
                      actionLoadingId ===
                      selectedApplication.id
                    }
                    onClick={() =>
                      void handleApprove(
                        selectedApplication
                      )
                    }
                  >
                    <FiCheck />

                    Approve Request
                  </button>

                  <button
                    type="button"
                    className="wholesale-reject-btn"
                    disabled={
                      actionLoadingId ===
                      selectedApplication.id
                    }
                    onClick={() =>
                      void handleReject(
                        selectedApplication
                      )
                    }
                  >
                    <FiX />

                    Reject Request
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="wholesale-remove-btn"
                  disabled={
                    actionLoadingId ===
                    selectedApplication.id
                  }
                  onClick={() =>
                    void handleRemove(
                      selectedApplication
                    )
                  }
                >
                  <FiTrash2 />

                  {actionLoadingId ===
                  selectedApplication.id
                    ? "Removing..."
                    : "Remove User"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}