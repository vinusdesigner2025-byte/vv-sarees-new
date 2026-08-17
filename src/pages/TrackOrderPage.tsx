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
  id: string;
  orderId: string;
  customerName: string;
  orderType: OrderType;
  payment: string;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
  status: OrderStatus;
  orderDate: string;
  total: number;
  address: string;
  timeline: TimelineStep[];
};

type OrderRow = {
  id: string;
  order_number: string;
  order_type: OrderType;
  customer_name: string;
  payment_method: string;
  payment_status: string;
  order_status: OrderStatus;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  tracking_status: string | null;
  created_at: string;
  updated_at: string;
  grand_total: number;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
};

const formatDateTime = (
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
  ).format(new Date(value));
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

const formatPayment = (
  method: string,
  status: string
) => {
  if (status === "paid") {
    return `${method.toUpperCase()} - Paid`;
  }

  if (method === "cod") {
    return "Cash on Delivery";
  }

  return `${method.toUpperCase()} - Pending`;
};


type ShiprocketTrackResponse = {
  success?: boolean;
  order_id?: string;
  shiprocket_order_id?: string | number | null;
  shipment_id?: string | number | null;
  status?: string | number | null;
  awb_code?: string | null;
  courier_name?: string | null;
  tracking?: any;
  shiprocket_order?: any;
  error?: string;
};

const mapShiprocketStatus = (
  value: unknown
): OrderStatus => {
  const status = String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

  if (
    status.includes("cancel") ||
    status.includes("rto")
  ) {
    return "cancelled";
  }

  if (
    status.includes("deliver")
  ) {
    return "delivered";
  }

  if (
    status.includes("ship") ||
    status.includes("transit") ||
    status.includes("out for delivery") ||
    status.includes("pickup")
  ) {
    return "shipped";
  }

  if (
    status.includes("pack") ||
    status.includes("process") ||
    status.includes("ready") ||
    status.includes("manifest") ||
    status.includes("awb")
  ) {
    return "processing";
  }

  if (
    status.includes("new") ||
    status.includes("confirm") ||
    status.includes("pending")
  ) {
    return "confirmed";
  }

  return "pending";
};

const getShiprocketTrackingUrl = (
  response: ShiprocketTrackResponse
) => {
  const candidates = [
    response?.tracking?.tracking_url,
    response?.tracking?.track_url,
    response?.tracking?.shipment_track_url,
    response?.tracking?.tracking_data
      ?.track_url,
    response?.tracking?.tracking_data
      ?.shipment_track_url,
    response?.shiprocket_order
      ?.last_mile_awb_track_url,
  ];

  const found = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim()
  );

  return typeof found === "string"
    ? found.trim()
    : "";
};

const getShiprocketEstimatedDelivery = (
  response: ShiprocketTrackResponse,
  status: OrderStatus
) => {
  if (status === "delivered") {
    return "Delivered";
  }

  const candidates = [
    response?.tracking?.etd,
    response?.tracking?.edd,
    response?.tracking?.estimated_delivery,
    response?.tracking?.tracking_data?.etd,
    response?.tracking?.tracking_data?.edd,
    response?.shiprocket_order?.etd_date,
    response?.shiprocket_order?.shipments?.[0]
      ?.etd,
  ];

  const found = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim() &&
      !value.startsWith("0000-00-00")
  );

  if (typeof found === "string") {
    return found;
  }

  return status === "shipped"
    ? "3–5 Business Days"
    : "Will be confirmed soon";
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
  order: OrderRow
): TimelineStep[] => {
  if (
    order.order_status ===
    "cancelled"
  ) {
    return [
      {
        title: "Order Placed",
        date: formatDateTime(
          order.created_at
        ),
        status: "completed",
      },
      {
        title: "Order Cancelled",
        date: formatDateTime(
          order.updated_at
        ),
        status: "current",
      },
    ];
  }

  const currentRank =
    getStatusRank(
      order.order_status
    );

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
    let status: TimelineStatus =
      "pending";

    if (step.rank < currentRank) {
      status = "completed";
    } else if (
      step.rank === currentRank
    ) {
      status = "current";
    }

    let date = "";

    if (step.rank === 0) {
      date = formatDateTime(
        order.created_at
      );
    } else if (
      step.rank <= currentRank
    ) {
      date = formatDateTime(
        order.updated_at
      );
    }

    return {
      title: step.title,
      date:
        date ||
        "Waiting for update",
      status,
    };
  });
};

const getCurrentStatusText = (
  status: OrderStatus
) => {
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

  if (status === "shipped") {
    return "Your order has been shipped and is on the way.";
  }

  if (
    status === "delivered"
  ) {
    return "Your order has been delivered successfully.";
  }

  return "This order has been cancelled.";
};

export default function TrackOrderPage() {
  const [searchParams] =
    useSearchParams();

  const queryOrderNumber =
    searchParams.get("order") ?? "";

  const [orderId, setOrderId] =
    useState(queryOrderNumber);

  const [
    searchedOrder,
    setSearchedOrder,
  ] = useState<TrackedOrder | null>(
    null
  );

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const handleTrackOrder = async (
    suppliedOrderId?: string
  ) => {
    const cleanedOrderId = (
      suppliedOrderId ?? orderId
    )
      .trim()
      .toUpperCase();

    if (!cleanedOrderId) {
      setError(
        "Please enter your order ID."
      );
      setSearchedOrder(null);
      return;
    }

    setIsLoading(true);
    setError("");
    setSearchedOrder(null);

    const { data, error:
      fetchError } =
      await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          order_type,
          customer_name,
          payment_method,
          payment_status,
          order_status,
          courier_name,
          tracking_number,
          tracking_url,
          shiprocket_order_id,
          shiprocket_shipment_id,
          tracking_status,
          created_at,
          updated_at,
          grand_total,
          address_line_1,
          address_line_2,
          city,
          state,
          pincode
        `)
        .eq(
          "order_number",
          cleanedOrderId
        )
        .maybeSingle();

    if (fetchError) {
      console.error(
        "Track order error:",
        fetchError
      );

      setError(
        `Order load aagala: ${fetchError.message}`
      );
      setIsLoading(false);
      return;
    }

    if (!data) {
      setError(
        "Order not found. Please check your order ID."
      );
      setIsLoading(false);
      return;
    }

    let order =
      data as OrderRow;

    /*
     * Ask Shiprocket for the latest status.
     * If Shiprocket is temporarily unavailable,
     * the page still shows the Supabase order.
     */
    let shiprocketTrack:
      | ShiprocketTrackResponse
      | null = null;

    try {
      const {
        data: trackingData,
        error: trackingError,
      } = await supabase.functions.invoke(
        "shiprocket-track-order",
        {
          body: {
            order_id:
              order.order_number,
          },
        }
      );

      if (trackingError) {
        console.error(
          "Shiprocket tracking error:",
          trackingError
        );
      } else if (
        trackingData?.success
      ) {
        shiprocketTrack =
          trackingData as ShiprocketTrackResponse;

        const latestStatus =
          mapShiprocketStatus(
            shiprocketTrack.status
          );

        const latestCourier =
          String(
            shiprocketTrack.courier_name ??
              ""
          ).trim();

        const latestAwb =
          String(
            shiprocketTrack.awb_code ??
              ""
          ).trim();

        const latestTrackingUrl =
          getShiprocketTrackingUrl(
            shiprocketTrack
          );

        const updates = {
          order_status:
            latestStatus,

          tracking_status:
            shiprocketTrack.status != null
              ? String(
                  shiprocketTrack.status
                )
              : order.tracking_status,

          shiprocket_order_id:
            shiprocketTrack
              .shiprocket_order_id != null
              ? String(
                  shiprocketTrack
                    .shiprocket_order_id
                )
              : order.shiprocket_order_id,

          shiprocket_shipment_id:
            shiprocketTrack.shipment_id !=
            null
              ? String(
                  shiprocketTrack
                    .shipment_id
                )
              : order.shiprocket_shipment_id,

          courier_name:
            latestCourier ||
            order.courier_name,

          tracking_number:
            latestAwb ||
            order.tracking_number,

          tracking_url:
            latestTrackingUrl ||
            order.tracking_url,

          updated_at:
            new Date().toISOString(),
        };

        const {
          data: updatedOrder,
          error: updateError,
        } = await supabase
          .from("orders")
          .update(updates)
          .eq("id", order.id)
          .select(`
            id,
            order_number,
            order_type,
            customer_name,
            payment_method,
            payment_status,
            order_status,
            courier_name,
            tracking_number,
            tracking_url,
            shiprocket_order_id,
            shiprocket_shipment_id,
            tracking_status,
            created_at,
            updated_at,
            grand_total,
            address_line_1,
            address_line_2,
            city,
            state,
            pincode
          `)
          .maybeSingle();

        if (updateError) {
          console.error(
            "Tracking details save error:",
            updateError
          );
        } else if (updatedOrder) {
          order =
            updatedOrder as OrderRow;
        } else {
          order = {
            ...order,
            ...updates,
          };
        }
      }
    } catch (trackingError) {
      console.error(
        "Shiprocket tracking request failed:",
        trackingError
      );
    }

    const address = [
      order.address_line_1,
      order.address_line_2,
      order.city,
      order.state,
      order.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    const liveStatus =
      shiprocketTrack?.success
        ? mapShiprocketStatus(
            shiprocketTrack.status
          )
        : order.order_status;

    const liveCourier =
      String(
        shiprocketTrack?.courier_name ??
          ""
      ).trim() ||
      order.courier_name ||
      "Not assigned yet";

    const liveTrackingNumber =
      String(
        shiprocketTrack?.awb_code ??
          ""
      ).trim() ||
      order.tracking_number ||
      "Not available yet";

    const liveTrackingUrl =
      (shiprocketTrack
        ? getShiprocketTrackingUrl(
            shiprocketTrack
          )
        : "") ||
      order.tracking_url ||
      "";

    const estimatedDelivery =
      shiprocketTrack
        ? getShiprocketEstimatedDelivery(
            shiprocketTrack,
            liveStatus
          )
        : liveStatus === "delivered"
          ? "Delivered"
          : liveStatus === "shipped"
            ? "3–5 Business Days"
            : "Will be confirmed soon";

    const orderForTimeline: OrderRow = {
      ...order,
      order_status:
        liveStatus,
    };

    setSearchedOrder({
      id: order.id,
      orderId:
        order.order_number,
      customerName:
        order.customer_name,
      orderType:
        order.order_type,
      payment:
        formatPayment(
          order.payment_method,
          order.payment_status
        ),
      courier:
        liveCourier,
      trackingNumber:
        liveTrackingNumber,
      trackingUrl:
        liveTrackingUrl,
      estimatedDelivery,
      status:
        liveStatus,
      orderDate:
        formatDateTime(
          order.created_at
        ),
      total: Number(
        order.grand_total ?? 0
      ),
      address,
      timeline:
        createTimeline(
          orderForTimeline
        ),
    });

    setOrderId(
      order.order_number
    );

    setIsLoading(false);
  };

  useEffect(() => {
    if (queryOrderNumber) {
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
                  event.key === "Enter"
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
              Latest delivery status
              load aaguthu.
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
                  (step, index) => (
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
                          {step.title}
                        </h3>

                        <span>
                          {step.date}
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
                <span>Order ID</span>

                <strong>
                  {
                    searchedOrder.orderId
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>Customer</span>

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
                <span>Payment</span>

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
                <span>Courier</span>

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
                    href={searchedOrder.trackingUrl}
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
                    {getCurrentStatusText(
                      searchedOrder.status
                    )}
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