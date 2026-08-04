import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import {
  FiCheck,
  FiMapPin,
  FiPackage,
  FiTruck,
} from "react-icons/fi";

import { FaWhatsapp } from "react-icons/fa";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import { supabase } from "../lib/supabase";

import "./OrderSuccessPage.css";

type OrderMode =
  | "retail"
  | "wholesale";

type OrderRow = {
  id: string;
  order_number: string;
  order_type: OrderMode;
  customer_name: string;
  phone: string;
  email: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  grand_total: number;
  total_quantity: number;
  created_at: string;
};

type NavigationState = {
  orderId?: string;
  orderNumber?: string;
  mode?: OrderMode;
  customerName?: string;
  totalQuantity?: number;
  grandTotal?: number;
  paymentMethod?: string;
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

const formatOrderDate = (
  value: string
) => {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(value));
};

const formatPaymentMethod = (
  value: string
) => {
  if (value.toLowerCase() === "upi") {
    return "UPI";
  }

  if (value.toLowerCase() === "cod") {
    return "Cash on Delivery";
  }

  return value.toUpperCase();
};

export default function OrderSuccessPage() {
  const location = useLocation();

  const [searchParams] =
    useSearchParams();

  const navigationState =
    (location.state ??
      {}) as NavigationState;

  const orderNumber =
    searchParams.get("order") ??
    navigationState.orderNumber ??
    "";

  const queryMode =
    searchParams.get("mode");

  const mode: OrderMode =
    queryMode === "wholesale" ||
    navigationState.mode === "wholesale"
      ? "wholesale"
      : "retail";

  const [order, setOrder] =
    useState<OrderRow | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderNumber) {
        setLoadError(
          "Order number kidaikala."
        );

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      const { data, error } =
        await supabase
          .from("orders")
          .select(`
            id,
            order_number,
            order_type,
            customer_name,
            phone,
            email,
            address_line_1,
            address_line_2,
            city,
            state,
            pincode,
            payment_method,
            payment_status,
            order_status,
            grand_total,
            total_quantity,
            created_at
          `)
          .eq(
            "order_number",
            orderNumber
          )
          .maybeSingle();

      if (error) {
        console.error(
          "Order success load error:",
          error
        );

        setLoadError(
          `Order details load aagala: ${error.message}`
        );

        setOrder(null);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setLoadError(
          "Order details kidaikala."
        );

        setOrder(null);
        setIsLoading(false);
        return;
      }

      setOrder(data as OrderRow);
      setIsLoading(false);
    };

    void loadOrder();
  }, [orderNumber]);

  const displayMode =
    order?.order_type ?? mode;

  const trackOrderLink = useMemo(
    () =>
      `/track-order?order=${encodeURIComponent(
        order?.order_number ??
          orderNumber
      )}`,
    [
      order?.order_number,
      orderNumber,
    ]
  );

  if (isLoading) {
    return (
      <div className="order-success-page">
        <ProductHeader
          mode={displayMode}
        />

        <main className="order-success-container">
          <section className="order-success-card">
            <div className="success-icon-wrap">
              <FiCheck />
            </div>

            <span className="success-tag">
              ORDER SAVED
            </span>

            <h1>
              Loading Order...
            </h1>

            <p className="success-message">
              Supabase-la irundhu order
              details load aaguthu.
            </p>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="order-success-page">
        <ProductHeader mode={mode} />

        <main className="order-success-container">
          <section className="order-success-card">
            <div className="success-icon-wrap">
              <FiCheck />
            </div>

            <span className="success-tag">
              ORDER STATUS
            </span>

            <h1>
              Order Details Not Found
            </h1>

            <p className="success-message">
              {loadError}
            </p>

            <div className="success-actions">
              <Link
                to={`/${mode}`}
                className="success-primary-button"
              >
                <FiPackage />
                Continue Shopping
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <ProductHeader
        mode={order.order_type}
      />

      <main className="order-success-container">
        <section className="order-success-card">
          <div className="success-icon-wrap">
            <FiCheck />
          </div>

          <span className="success-tag">
            ORDER CONFIRMED
          </span>

          <h1>
            Order Placed Successfully!
          </h1>

          <p className="success-message">
            Thank you for shopping with
            VV Sarees. Your order has
            been saved successfully.
          </p>

          <div className="success-details-grid">
            <div className="success-detail-box">
              <span>Order ID</span>

              <strong>
                {order.order_number}
              </strong>
            </div>

            <div className="success-detail-box">
              <span>
                Payment Method
              </span>

              <strong>
                {formatPaymentMethod(
                  order.payment_method
                )}
              </strong>
            </div>

            <div className="success-detail-box">
              <span>Order Date</span>

              <strong>
                {formatOrderDate(
                  order.created_at
                )}
              </strong>
            </div>

            <div className="success-detail-box">
              <span>
                Estimated Delivery
              </span>

              <strong>
                3–5 Business Days
              </strong>
            </div>
          </div>

          <div className="success-divider" />

          <div className="success-address-section">
            <div className="success-section-title">
              <FiMapPin />

              <h2>
                Delivery Address
              </h2>
            </div>

            <p>
              {order.customer_name}
              <br />

              {order.phone}
              <br />

              {order.address_line_1}

              {order.address_line_2
                ? `, ${order.address_line_2}`
                : ""}
              <br />

              {order.city}
              <br />

              {order.state} -{" "}
              {order.pincode}
            </p>
          </div>

          <div className="success-divider" />

          <div className="success-order-total">
            <span>Order Total</span>

            <strong>
              {formatCurrency(
                Number(
                  order.grand_total
                )
              )}
            </strong>
          </div>

          <div className="success-actions">
            <Link
              to={trackOrderLink}
              className="success-primary-button"
            >
              <FiTruck />
              Track Order
            </Link>

            <Link
              to={`/${order.order_type}`}
              className="success-secondary-button"
            >
              <FiPackage />
              Continue Shopping
            </Link>
          </div>

          <a
            href="https://wa.me/916382325967"
            target="_blank"
            rel="noreferrer"
            className="success-whatsapp-link"
          >
            <FaWhatsapp />

            Need help? Contact us on
            WhatsApp
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}