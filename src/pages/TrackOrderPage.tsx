import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiSearch,
  FiTruck,
} from "react-icons/fi";

import { FaWhatsapp } from "react-icons/fa";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import { supabase } from "../lib/supabase";

import "./TrackOrderPage.css";

type OrderType =
  | "retail"
  | "wholesale";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type TimelineStatus =
  | "completed"
  | "current"
  | "pending";

type TimelineStep = {
  title: string;
  date: string;
  status: TimelineStatus;
};

type TrackedOrder = {
  orderId: string;
  customerName: string;
  orderType: OrderType;
  payment: string;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
  status: OrderStatus;
  statusMessage: string;
  orderDate: string;
  total: number;
  address: string;
  timeline: TimelineStep[];
};

type TrackCheckoutOrderResponse = {
  success?: boolean;
  order?: {
    orderNumber?: string;
    orderType?: string;
    customerName?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    status?: string;
    statusLabel?: string;
    statusMessage?: string;
    totalQuantity?: number;
    grandTotal?: number;
    courierName?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    orderedAt?: string;
    updatedAt?: string;
    address?: string;
  };
  error?: string;
};

const formatDateTime = (
  value?: string
) => {
  if (!value) {
    return "Waiting for update";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for update";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
};

const formatCurrency = (
  amount: number
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(amount);
};

const normaliseOrderType = (
  value: unknown
): OrderType => {
  return String(value)
    .trim()
    .toLowerCase() === "wholesale"
    ? "wholesale"
    : "retail";
};

const normaliseStatus = (
  value: unknown
): OrderStatus => {
  const status = String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

  if (status === "confirmed") {
    return "confirmed";
  }

  if (
    status === "processing" ||
    status === "packed"
  ) {
    return "processing";
  }

  if (
    status === "shipped" ||
    status === "out_for_delivery"
  ) {
    return "shipped";
  }

  if (status === "delivered") {
    return "delivered";
  }

  if (
    status === "cancelled" ||
    status === "returned"
  ) {
    return "cancelled";
  }

  return "pending";
};

const formatPayment = (
  method: string,
  status: string
) => {
  const cleanMethod =
    method.trim().toLowerCase();

  const cleanStatus =
    status.trim().toLowerCase();

  if (cleanStatus === "paid") {
    if (
      cleanMethod === "upi" ||
      cleanMethod === "prepaid"
    ) {
      return "Prepaid - Paid";
    }

    return `${
      cleanMethod
        ? cleanMethod.toUpperCase()
        : "Payment"
    } - Paid`;
  }

  if (cleanMethod === "cod") {
    return "Cash on Delivery";
  }

  if (cleanMethod === "prepaid") {
    return "Prepaid - Pending";
  }

  return `${
    cleanMethod
      ? cleanMethod.toUpperCase()
      : "Payment"
  } - Pending`;
};

const getStatusRank = (
  status: OrderStatus
) => {
  const ranks: Record<
    OrderStatus,
    number
  > = {
    pending: 0,
    confirmed: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  };

  return ranks[status];
};

const createTimeline = (
  status: OrderStatus,
  orderedAt?: string,
  updatedAt?: string
): TimelineStep[] => {
  if (status === "cancelled") {
    return [
      {
        title: "Order Placed",
        date: formatDateTime(
          orderedAt
        ),
        status: "completed",
      },
      {
        title: "Order Cancelled",
        date: formatDateTime(
          updatedAt
        ),
        status: "current",
      },
    ];
  }

  const currentRank =
    getStatusRank(status);

  const steps = [
    {
      title: "Order Placed",
      rank: 0,
    },
    {
      title: "Packed",
      rank: 1,
    },
    {
      title: "Shipped",
      rank: 2,
    },
    {
      title: "Delivered",
      rank: 3,
    },
  ];

  return steps.map((step) => {
    let stepStatus:
      TimelineStatus =
      "pending";

    if (
      step.rank <
      currentRank
    ) {
      stepStatus =
        "completed";
    } else if (
      step.rank ===
      currentRank
    ) {
      stepStatus =
        "current";
    }

    let date =
      "Waiting for update";

    if (step.rank === 0) {
      date = formatDateTime(
        orderedAt
      );
    } else if (
      step.rank <=
      currentRank
    ) {
      date = formatDateTime(
        updatedAt
      );
    }

    return {
      title: step.title,
      date,
      status: stepStatus,
    };
  });
};

const getCurrentStatusText = (
  status: OrderStatus,
  serverMessage?: string
) => {
  if (
    serverMessage &&
    serverMessage.trim()
  ) {
    return serverMessage.trim();
  }

  if (
    status === "pending" ||
    status === "confirmed"
  ) {
    return "Your order has been received and is waiting for confirmation.";
  }

  if (
    status === "processing"
  ) {
    return "Your sarees are being carefully packed.";
  }

  if (
    status === "shipped"
  ) {
    return "Your order has been shipped and is on the way.";
  }

  if (
    status === "delivered"
  ) {
    return "Your order has been delivered successfully.";
  }

  return "This order has been cancelled.";
};

const getEstimatedDelivery = (
  status: OrderStatus
) => {
  if (
    status === "delivered"
  ) {
    return "Delivered";
  }

  if (
    status === "shipped"
  ) {
    return "3-5 Business Days";
  }

  if (
    status === "cancelled"
  ) {
    return "Not applicable";
  }

  return "Will be confirmed soon";
};

const getFunctionErrorMessage = (
  error: unknown
) => {
  if (
    error instanceof Error &&
    error.message
  ) {
    const message =
      error.message.trim();

    if (
      message.includes(
        "non-2xx"
      ) ||
      message.includes(
        "FunctionsHttpError"
      )
    ) {
      return "We couldn't retrieve your order details. Please check the order number and try again.";
    }

    return message;
  }

  return "We couldn't retrieve your order details. Please try again.";
};

export default function TrackOrderPage() {
  const [searchParams] =
    useSearchParams();

  const queryOrderNumber =
    searchParams.get("order") ??
    "";

  const [orderId, setOrderId] =
    useState(
      queryOrderNumber
    );

  const [
    searchedOrder,
    setSearchedOrder,
  ] =
    useState<TrackedOrder | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const handleTrackOrder =
    async (
      suppliedOrderId?: string
    ) => {
      const cleanedOrderId =
        (
          suppliedOrderId ??
          orderId
        )
          .trim()
          .toUpperCase();

      if (!cleanedOrderId) {
        setError(
          "Please enter your order ID."
        );
        setSearchedOrder(
          null
        );
        return;
      }

      if (
        !/^[A-Z0-9-]{4,60}$/.test(
          cleanedOrderId
        )
      ) {
        setError(
          "Please enter a valid order ID."
        );
        setSearchedOrder(
          null
        );
        return;
      }

      setIsLoading(true);
      setError("");
      setSearchedOrder(
        null
      );

      try {
        const {
          data,
          error:
            functionError,
        } =
          await supabase.functions.invoke(
            "track-checkout-order",
            {
              body: {
                orderNumber:
                  cleanedOrderId,
              },
            }
          );

        if (
          functionError
        ) {
          console.error(
            "Track order function error:",
            functionError
          );

          throw functionError;
        }

        const response =
          data as
            | TrackCheckoutOrderResponse
            | null;

        if (
          !response?.success ||
          !response.order
        ) {
          setError(
            response?.error ||
              "We couldn't find an order with that number. Please check the order ID and try again."
          );
          return;
        }

        const order =
          response.order;

        const status =
          normaliseStatus(
            order.status
          );

        const payment =
          formatPayment(
            String(
              order.paymentMethod ??
                ""
            ),
            String(
              order.paymentStatus ??
                ""
            )
          );

        const courier =
          String(
            order.courierName ??
              ""
          ).trim() ||
          "Not assigned yet";

        const trackingNumber =
          String(
            order.trackingNumber ??
              ""
          ).trim() ||
          "Not available yet";

        const trackingUrl =
          String(
            order.trackingUrl ??
              ""
          ).trim();

        const orderType =
          normaliseOrderType(
            order.orderType
          );

        const timeline =
          createTimeline(
            status,
            order.orderedAt,
            order.updatedAt
          );

        setSearchedOrder({
          orderId:
            String(
              order.orderNumber ??
                cleanedOrderId
            ),
          customerName:
            String(
              order.customerName ??
                ""
            ).trim() ||
            "Customer",
          orderType,
          payment,
          courier,
          trackingNumber,
          trackingUrl,
          estimatedDelivery:
            getEstimatedDelivery(
              status
            ),
          status,
          statusMessage:
            getCurrentStatusText(
              status,
              order.statusMessage
            ),
          orderDate:
            formatDateTime(
              order.orderedAt
            ),
          total: Number(
            order.grandTotal ??
              0
          ),
          address:
            String(
              order.address ??
                ""
            ).trim() ||
            "Delivery address is not available.",
          timeline,
        });

        setOrderId(
          String(
            order.orderNumber ??
              cleanedOrderId
          )
        );
      } catch (
        trackError
      ) {
        console.error(
          "Track order error:",
          trackError
        );

        setError(
          getFunctionErrorMessage(
            trackError
          )
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    if (
      queryOrderNumber
    ) {
      void handleTrackOrder(
        queryOrderNumber
      );
    }
  }, [queryOrderNumber]);

  return (
    <div className="track-page">
      <ProductHeader
        mode={
          searchedOrder?.orderType ===
          "wholesale"
            ? "wholesale"
            : "retail"
        }
      />

      <main className="track-container">
        <div className="track-header">
          <span>VV SAREES</span>

          <h1>
            Track Your Order
          </h1>

          <p>
            Enter your order ID to view
            the latest order status and
            delivery details.
          </p>
        </div>

        <section className="track-search-card">
          <div className="track-search-input">
            <FiSearch />

            <input
              type="text"
              value={orderId}
              disabled={isLoading}
              onChange={(event) =>
                setOrderId(
                  event.target.value
                )
              }
              placeholder="Enter Order ID"
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  void handleTrackOrder();
                }
              }}
            />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              void handleTrackOrder()
            }
          >
            {isLoading
              ? "Tracking..."
              : "Track Order"}
          </button>
        </section>

        {error && (
          <div className="track-error-message">
            {error}
          </div>
        )}

        {!searchedOrder &&
          !error &&
          !isLoading && (
            <section className="track-start-card">
              <FiPackage />

              <h2>
                Enter Your Order ID
              </h2>

              <p>
                Example:{" "}
                <strong>
                  VV202608031234567890
                </strong>
              </p>
            </section>
          )}

        {isLoading && (
          <section className="track-start-card">
            <FiPackage />

            <h2>
              Loading Order...
            </h2>

            <p>
              Fetching the latest
              delivery status...
            </p>
          </section>
        )}

        {searchedOrder && (
          <div className="track-layout">
            <section className="track-timeline-card">
              <h2>
                Order Journey
              </h2>

              <div className="track-timeline">
                {searchedOrder.timeline.map(
                  (
                    step,
                    index
                  ) => (
                    <div
                      key={`${step.title}-${index}`}
                      className={`timeline-item ${step.status}`}
                    >
                      <div className="timeline-icon" />

                      {index !==
                        searchedOrder
                          .timeline
                          .length -
                          1 && (
                        <div className="timeline-line" />
                      )}

                      <div className="timeline-content">
                        <h3>
                          {
                            step.title
                          }
                        </h3>

                        <span>
                          {
                            step.date
                          }
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <aside className="track-summary-card">
              <h2>
                Order Details
              </h2>

              <div className="summary-row">
                <span>
                  Order ID
                </span>

                <strong>
                  {
                    searchedOrder.orderId
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Customer
                </span>

                <strong>
                  {
                    searchedOrder.customerName
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Order Type
                </span>

                <strong>
                  {searchedOrder.orderType ===
                  "wholesale"
                    ? "Wholesale"
                    : "Retail"}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Order Date
                </span>

                <strong>
                  {
                    searchedOrder.orderDate
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Payment
                </span>

                <strong>
                  {
                    searchedOrder.payment
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Order Total
                </span>

                <strong>
                  {formatCurrency(
                    searchedOrder.total
                  )}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Courier
                </span>

                <strong>
                  {
                    searchedOrder.courier
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Tracking Number
                </span>

                <strong>
                  {
                    searchedOrder.trackingNumber
                  }
                </strong>
              </div>

              {searchedOrder.trackingUrl && (
                <div className="summary-row">
                  <span>
                    Track Package
                  </span>

                  <a
                    href={
                      searchedOrder.trackingUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="track-package-link"
                  >
                    Open Courier Tracking
                    <FiTruck />
                  </a>
                </div>
              )}

              <div className="summary-row">
                <span>
                  Estimated Delivery
                </span>

                <strong>
                  {
                    searchedOrder.estimatedDelivery
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Delivery Address
                </span>

                <strong>
                  {
                    searchedOrder.address
                  }
                </strong>
              </div>

              <div className="summary-divider" />

              <div className="current-status">
                <FiClock />

                <div>
                  <strong>
                    Current Status
                  </strong>

                  <span>
                    {
                      searchedOrder.statusMessage
                    }
                  </span>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="track-buttons">
                <a
                  href="https://wa.me/916382325967"
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-btn"
                >
                  <FaWhatsapp />
                  Contact WhatsApp
                </a>

                <Link
                  to={
                    searchedOrder.orderType ===
                    "wholesale"
                      ? "/wholesale"
                      : "/retail"
                  }
                  className="continue-btn"
                >
                  <FiPackage />
                  Continue Shopping
                </Link>
              </div>

              <div className="trust-box">
                <div>
                  <FiCheckCircle />
                  Secure Order
                </div>

                <div>
                  <FiTruck />
                  Safe Delivery
                </div>

                <div>
                  <FiMapPin />
                  Live Status Updates
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}