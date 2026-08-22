import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiMapPin,
  FiPackage,
  FiShield,
  FiTruck,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";

import "./CheckoutPage.css";

type CheckoutPageProps = {
  mode: "wholesale" | "retail";
};

type PaymentMethod =
  | "razorpay"
  | "cod";

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    vv_order_id: string;
    vv_order_number: string;
    order_type: string;
  };
  handler: (
    response: RazorpaySuccessResponse
  ) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    callback: (
      response: RazorpayFailureResponse
    ) => void
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

type RazorpayOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
  app_order_id: string;
  order_number: string;
};

type RazorpayVerifyResponse = {
  verified: boolean;
  app_order_id?: string;
  order_number?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  error?: string;
};

type CheckoutCreateResponse = {
  success: boolean;
  order?: {
    id: string;
    orderNumber: string;
    orderType: "wholesale" | "retail";
    customerName: string;
    totalQuantity: number;
    subtotal: number;
    shippingCharge: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    paymentStatus: string;
    orderStatus: string;
  };
  error?: string;
};

const PAYMENT_METHODS = {
  razorpay: true,
  cod: false,
};

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript = () => {
  return new Promise<boolean>(
    (resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript =
        document.querySelector<HTMLScriptElement>(
          `script[src="${RAZORPAY_SCRIPT_URL}"]`
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true),
          { once: true }
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false),
          { once: true }
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        RAZORPAY_SCRIPT_URL;

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(
        script
      );
    }
  );
};

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(error.message);
  }

  return "Something went wrong. Please try again.";
};

export default function CheckoutPage({
  mode,
}: CheckoutPageProps) {
  const navigate = useNavigate();

  const isWholesale =
    mode === "wholesale";

  const {
    retailCart,
    wholesaleCart,
  } = useShop();

  const cartItems = isWholesale
    ? wholesaleCart
    : retailCart;

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>("razorpay");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [formData, setFormData] =
    useState({
      fullName: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "Tamil Nadu",
      pincode: "",
      deliveryNote: "",
    });

  const totalQuantity = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const shippingCharge = 0;

  const grandTotal =
    subtotal + shippingCharge;

  const minimumQuantity =
    isWholesale ? 5 : 1;

  const minimumReached =
    totalQuantity >= minimumQuantity;

  const hasOutOfStockItem =
    cartItems.some(
      (item) =>
        item.stock <= 0 ||
        item.quantity > item.stock
    );

  const canPlaceOrder =
    cartItems.length > 0 &&
    minimumReached &&
    !hasOutOfStockItem &&
    !isSubmitting;

  const updateField = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert("Please enter your full name.");
      return false;
    }

    if (
      !/^[0-9]{10}$/.test(
        formData.phone.trim()
      )
    ) {
      alert(
        "Please enter a valid 10-digit mobile number."
      );
      return false;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email address.");
      return false;
    }

    if (!formData.addressLine1.trim()) {
      alert("Please enter your delivery address.");
      return false;
    }

    if (!formData.city.trim()) {
      alert("Please enter your city.");
      return false;
    }

    if (
      !/^[0-9]{6}$/.test(
        formData.pincode.trim()
      )
    ) {
      alert(
        "Please enter a valid 6-digit pincode."
      );
      return false;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return false;
    }

    if (!minimumReached) {
      alert(
        isWholesale
          ? "Wholesale orders require a minimum of 5 sarees."
          : "Please add at least one product to your cart."
      );
      return false;
    }

    if (hasOutOfStockItem) {
      alert(
        "Please remove unavailable items or adjust their quantities before checkout."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !validateForm() ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    let createdOrderId:
      | string
      | null = null;

    let createdOrderNumber = "";
    let createdGrandTotal = 0;
    let createdTotalQuantity = 0;
    let gatewaySuccessReceived =
      false;

    try {
      if (
        paymentMethod ===
        "razorpay"
      ) {
        const razorpayKeyId =
          import.meta.env
            .VITE_RAZORPAY_KEY_ID;

        if (!razorpayKeyId) {
          throw new Error(
            "Payment configuration is unavailable. Please try again later."
          );
        }

        const scriptLoaded =
          await loadRazorpayScript();

        if (!scriptLoaded) {
          throw new Error(
            "We could not load the secure payment window. Please check your internet connection and try again."
          );
        }
      }

      /*
       * IMPORTANT:
       * Orders are now created by the secure Edge Function.
       * The browser no longer inserts directly into orders/order_items.
       * Product prices are re-read from the database on the server.
       */
      const {
        data: checkoutData,
        error: checkoutError,
      } = await supabase.functions.invoke(
        "create-checkout-order",
        {
          body: {
            orderType: mode,
            customerName:
              formData.fullName.trim(),
            phone:
              formData.phone.trim(),
            email:
              formData.email.trim(),
            addressLine1:
              formData.addressLine1.trim(),
            addressLine2:
              formData.addressLine2.trim(),
            city:
              formData.city.trim(),
            state:
              formData.state,
            pincode:
              formData.pincode.trim(),
            deliveryNote:
              formData.deliveryNote.trim(),
            paymentMethod,
            items: cartItems.map(
  (item) => ({
    productId:
      String(item.id),

    slug:
      item.slug,

    quantity:
      Number(item.quantity),

    colour:
      item.colour ?? "",

    imageUrl:
      item.image ?? "",
  })
),
          },
        }
      );

      if (checkoutError) {
        throw checkoutError;
      }

      const checkout =
        checkoutData as
          | CheckoutCreateResponse
          | null;

      if (
        !checkout?.success ||
        !checkout.order?.id ||
        !checkout.order.orderNumber
      ) {
        throw new Error(
          checkout?.error ??
            "We could not create your order. Please try again."
        );
      }

      const secureOrder = checkout.order;

      const createdOrder = {
        id: secureOrder.id,
        order_number:
          secureOrder.orderNumber,
      };

      createdOrderId =
        createdOrder.id;
      createdOrderNumber =
        createdOrder.order_number;
      createdGrandTotal = Number(
        secureOrder.grandTotal ?? 0
      );
      createdTotalQuantity = Number(
        secureOrder.totalQuantity ?? 0
      );

      if (
        paymentMethod ===
        "razorpay"
      ) {
        const {
          data:
            razorpayOrderData,
          error:
            razorpayOrderError,
        } =
          await supabase.functions.invoke(
            "razorpay-create-order",
            {
              body: {
                orderId:
                  createdOrder.id,
              },
            }
          );

        if (razorpayOrderError) {
          throw razorpayOrderError;
        }

        const razorpayOrder =
          razorpayOrderData as
            | RazorpayOrderResponse
            | null;

        if (
          !razorpayOrder?.order_id ||
          !razorpayOrder.amount ||
          !razorpayOrder.currency
        ) {
          throw new Error(
            "We could not initialize your payment. Please try again."
          );
        }

        const razorpayKeyId =
          import.meta.env
            .VITE_RAZORPAY_KEY_ID;

        const RazorpayConstructor =
          window.Razorpay;

        if (
          !razorpayKeyId ||
          !RazorpayConstructor
        ) {
          throw new Error(
            "The secure payment window is not ready. Please refresh the page and try again."
          );
        }

        await new Promise<void>(
          (resolve, reject) => {
            let paymentFlowSettled =
              false;

            const finishWithError = (
              error: Error
            ) => {
              if (
                paymentFlowSettled
              ) {
                return;
              }

              paymentFlowSettled =
                true;

              reject(error);
            };

            const finishSuccessfully =
              () => {
                if (
                  paymentFlowSettled
                ) {
                  return;
                }

                paymentFlowSettled =
                  true;

                resolve();
              };

            const razorpay =
              new RazorpayConstructor(
                {
                  key:
                    razorpayKeyId,

                  amount:
                    Number(
                      razorpayOrder.amount
                    ),

                  currency:
                    razorpayOrder.currency,

                  name:
                    "VV Sarees",

                  description:
                    `${
                      isWholesale
                        ? "Wholesale"
                        : "Retail"
                    } Order ${createdOrder.order_number}`,

                  order_id:
                    razorpayOrder.order_id,

                  prefill: {
                    name:
                      formData.fullName.trim(),

                    email:
                      formData.email.trim(),

                    contact:
                      formData.phone.trim(),
                  },

                  notes: {
                    vv_order_id:
                      createdOrder.id,

                    vv_order_number:
                      createdOrder.order_number,

                    order_type:
                      mode,
                  },

                  handler:
                    async (
                      response
                    ) => {
                      gatewaySuccessReceived =
                        true;

                      try {
                        const {
                          data:
                            verifyData,
                          error:
                            verifyError,
                        } =
                          await supabase.functions.invoke(
                            "razorpay-verify-payment",
                            {
                              body: {
                                app_order_id:
                                  createdOrder.id,

                                razorpay_order_id:
                                  response.razorpay_order_id,

                                razorpay_payment_id:
                                  response.razorpay_payment_id,

                                razorpay_signature:
                                  response.razorpay_signature,
                              },
                            }
                          );

                        if (
                          verifyError
                        ) {
                          throw verifyError;
                        }

                        const verification =
                          verifyData as
                            | RazorpayVerifyResponse
                            | null;

                        if (
                          !verification?.verified
                        ) {
                          throw new Error(
                            verification?.error ??
                              "Payment verification failed."
                          );
                        }

                        const shiprocketPayload = {
                          app_order_id:
                            createdOrder.id,

                          order_id:
                            createdOrder.order_number,

                          order_date: new Date()
                            .toISOString()
                            .slice(0, 19)
                            .replace("T", " "),

                          pickup_location:
                            "work",

                          billing_customer_name:
                            formData.fullName.trim(),

                          billing_last_name:
                            "",

                          billing_address:
                            formData.addressLine1.trim(),

                          billing_address_2:
                            formData.addressLine2.trim(),

                          billing_city:
                            formData.city.trim(),

                          billing_pincode:
                            formData.pincode.trim(),

                          billing_state:
                            formData.state,

                          billing_country:
                            "India",

                          billing_email:
                            formData.email.trim(),

                          billing_phone:
                            formData.phone.trim(),

                          shipping_is_billing:
                            true,

                          order_items:
                            cartItems.map(
                              (item) => ({
                                name:
                                  item.name,

                                sku:
                                  item.slug ||
                                  String(
                                    item.id
                                  ),

                                units:
                                  Number(
                                    item.quantity
                                  ),

                                selling_price:
                                  Number(
                                    item.price
                                  ),
                              })
                            ),

                          payment_method:
                            "Prepaid",

                          sub_total:
                            Number(
                              secureOrder.subtotal
                            ),

                          length: 30,
                          breadth: 25,
                          height: 5,
                          weight: 0.5,
                        };

                        const {
                          data:
                            shiprocketData,
                          error:
                            shiprocketError,
                        } =
                          await supabase.functions.invoke(
                            "shiprocket-create-order",
                            {
                              body:
                                shiprocketPayload,
                            }
                          );

                        if (
                          shiprocketError
                        ) {
                          console.error(
                            "Shiprocket order creation failed:",
                            shiprocketError
                          );
                        } else {
                          console.log(
                            "Shiprocket order created:",
                            shiprocketData
                          );
                        }

                        finishSuccessfully();
                      } catch (
                        error
                      ) {
                        finishWithError(
                          new Error(
                            `Your payment response was received, but verification could not be completed: ${getErrorMessage(
                              error
                            )}`
                          )
                        );
                      }
                    },

                  modal: {
                    ondismiss:
                      () => {
                        finishWithError(
                          new Error(
                            `Payment cancelled. Order ${createdOrder.order_number} has been saved and is awaiting payment.`
                          )
                        );
                      },
                  },
                }
              );

            razorpay.on(
              "payment.failed",
              (
                response
              ) => {
                const description =
                  response.error
                    ?.description;

                finishWithError(
                  new Error(
                    description ||
                      `Payment was unsuccessful. Order ${createdOrder.order_number} has been saved and is awaiting payment.`
                  )
                );
              }
            );

            razorpay.open();
          }
        );
      }

      navigate(
        `/order-success?order=${encodeURIComponent(
          createdOrder.order_number
        )}&mode=${mode}`,
        {
          state: {
            orderId:
              createdOrder.id,

            orderNumber:
              createdOrder.order_number,

            mode,
            customerName:
              formData.fullName.trim(),

            totalQuantity:
              createdTotalQuantity,
            grandTotal:
              createdGrandTotal,
            paymentMethod,
          },
        }
      );
    } catch (error) {
      console.error(
        "Checkout order/payment error:",
        error
      );

      /*
       * Do not delete orders from the browser.
       * Public UPDATE/DELETE is intentionally blocked by RLS.
       * A payment-success response is kept for reconciliation.
       */
      if (
        gatewaySuccessReceived &&
        createdOrderId &&
        createdOrderNumber
      ) {
        setSubmitError(
          `Your payment response was received, but verification could not be completed. Please do not make another payment. Order reference: ${createdOrderNumber}. ${getErrorMessage(
            error
          )}`
        );

        navigate(
          `/order-success?order=${encodeURIComponent(
            createdOrderNumber
          )}&mode=${mode}`,
          {
            state: {
              orderId:
                createdOrderId,

              orderNumber:
                createdOrderNumber,

              mode,
              customerName:
                formData.fullName.trim(),

              totalQuantity:
                createdTotalQuantity,
              grandTotal:
                createdGrandTotal,
              paymentMethod,
            },
          }
        );

        return;
      }

      setSubmitError(
        createdOrderNumber
          ? `Order ${createdOrderNumber} was created, but payment was not completed. ${getErrorMessage(
              error
            )}`
          : `We could not complete your order. ${getErrorMessage(
              error
            )}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <ProductHeader mode={mode} />

      <main className="checkout-container">
        <div className="checkout-heading">
          <span>VV SAREES</span>

          <h1>
            {isWholesale
              ? "Wholesale Checkout"
              : "Retail Checkout"}
          </h1>

          <p>
            Complete your delivery
            details and place your order
            securely.
          </p>
        </div>

        {!minimumReached && (
          <div className="checkout-minimum-warning">
            <FiPackage />

            <span>
              {isWholesale
                ? `Wholesale checkout requires at least 5 sarees. You currently have ${totalQuantity}.`
                : "Add at least one product before checkout."}
            </span>
          </div>
        )}

        {hasOutOfStockItem && (
          <div className="checkout-minimum-warning">
            <FiPackage />

            <span>
              One or more cart items are
              unavailable or exceed
              available stock. Go back to
              cart and update them.
            </span>
          </div>
        )}

        {submitError && (
          <div className="checkout-minimum-warning">
            <FiPackage />
            <span>{submitError}</span>
          </div>
        )}

        <form
          className="checkout-layout"
          onSubmit={handleSubmit}
        >
          <div className="checkout-left">
            <section className="checkout-card">
              <div className="checkout-card-heading">
                <span className="checkout-step-icon">
                  <FiMapPin />
                </span>

                <div>
                  <span>Step 1</span>

                  <h2>
                    Customer &amp;
                    Delivery Details
                  </h2>
                </div>
              </div>

              <div className="checkout-form-grid">
                <label>
                  <span>Full Name</span>

                  <input
                    type="text"
                    value={
                      formData.fullName
                    }
                    onChange={(event) =>
                      updateField(
                        "fullName",
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Phone Number
                  </span>

                  <input
                    type="tel"
                    value={
                      formData.phone
                    }
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 10)
                      )
                    }
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    maxLength={10}
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Email Address
                  </span>

                  <input
                    type="email"
                    value={
                      formData.email
                    }
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="Enter your email"
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Address Line 1
                  </span>

                  <input
                    type="text"
                    value={
                      formData.addressLine1
                    }
                    onChange={(event) =>
                      updateField(
                        "addressLine1",
                        event.target.value
                      )
                    }
                    placeholder="Door no, street name"
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Address Line 2
                  </span>

                  <input
                    type="text"
                    value={
                      formData.addressLine2
                    }
                    onChange={(event) =>
                      updateField(
                        "addressLine2",
                        event.target.value
                      )
                    }
                    placeholder="Area, landmark (optional)"
                    disabled={
                      isSubmitting
                    }
                  />
                </label>

                <label>
                  <span>City</span>

                  <input
                    type="text"
                    value={
                      formData.city
                    }
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                    placeholder="Enter city"
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label>
                  <span>State</span>

                  <select
                    value={
                      formData.state
                    }
                    onChange={(event) =>
                      updateField(
                        "state",
                        event.target.value
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                  >
                    <option>
                      Tamil Nadu
                    </option>

                    <option>
                      Puducherry
                    </option>

                    <option>
                      Kerala
                    </option>

                    <option>
                      Karnataka
                    </option>

                    <option>
                      Andhra Pradesh
                    </option>

                    <option>
                      Maharashtra
                    </option>

                    <option>
                      Rajasthan
                    </option>

                    <option>
                      Uttar Pradesh
                    </option>
                  </select>
                </label>

                <label>
                  <span>Pincode</span>

                  <input
                    type="text"
                    value={
                      formData.pincode
                    }
                    onChange={(event) =>
                      updateField(
                        "pincode",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 6)
                      )
                    }
                    placeholder="6-digit pincode"
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    maxLength={6}
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Delivery Instructions
                  </span>

                  <textarea
                    value={
                      formData.deliveryNote
                    }
                    onChange={(event) =>
                      updateField(
                        "deliveryNote",
                        event.target.value
                      )
                    }
                    placeholder="Landmark or delivery note (optional)"
                    rows={4}
                    disabled={
                      isSubmitting
                    }
                  />
                </label>
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-card-heading">
                <span className="checkout-step-icon">
                  <FiTruck />
                </span>

                <div>
                  <span>Step 2</span>
                  <h2>
                    Delivery Method
                  </h2>
                </div>
              </div>

              <label className="checkout-option-card checkout-option-active">
                <input
                  type="radio"
                  name="delivery"
                  value="standard"
                  defaultChecked
                  disabled={
                    isSubmitting
                  }
                />

                <div>
                  <strong>
                    Standard Delivery
                  </strong>

                  <span>
                    Delivery timeline
                    will be confirmed
                    after order
                    verification.
                  </span>
                </div>

                <span className="checkout-option-price">
                  Free
                </span>
              </label>
            </section>

            <section className="checkout-card">
              <div className="checkout-card-heading">
                <span className="checkout-step-icon">
                  <FiCreditCard />
                </span>

                <div>
                  <span>Step 3</span>
                  <h2>
                    Payment Method
                  </h2>
                </div>
              </div>

              <div className="checkout-payment-options">
                {PAYMENT_METHODS.razorpay && (
                  <label
                    className={`checkout-option-card ${
                      paymentMethod ===
                      "razorpay"
                        ? "checkout-option-active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={
                        paymentMethod ===
                        "razorpay"
                      }
                      onChange={() =>
                        setPaymentMethod(
                          "razorpay"
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                    />

                    <div>
                      <strong>
                        Online Payment
                      </strong>

                      <span>
                        Pay securely using
                        Razorpay. UPI,
                        cards and other
                        available payment
                        methods will open
                        in the checkout.
                      </span>
                    </div>

                    <FiCheckCircle />
                  </label>
                )}

                {PAYMENT_METHODS.cod && (
                  <label
                    className={`checkout-option-card ${
                      paymentMethod ===
                      "cod"
                        ? "checkout-option-active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={
                        paymentMethod ===
                        "cod"
                      }
                      onChange={() =>
                        setPaymentMethod(
                          "cod"
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                    />

                    <div>
                      <strong>
                        Cash on Delivery
                      </strong>

                      <span>
                        Pay when your
                        order is delivered.
                      </span>
                    </div>

                    <FiCheckCircle />
                  </label>
                )}
              </div>

              <div className="checkout-security-note">
                <FiLock />

                <span>
                  Your payment is processed
                  securely through Razorpay.
                </span>
              </div>
            </section>
          </div>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div
                  className="checkout-summary-item"
                  key={item.id}
                >
                  <div className="checkout-summary-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      "Product Image"
                    )}
                  </div>

                  <div>
                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      {item.colour}
                    </span>

                    <small>
                      Qty:{" "}
                      {item.quantity}
                    </small>
                  </div>

                  <strong>
                    ₹
                    {item.price *
                      item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>
                Total Sarees
              </span>

              <strong>
                {totalQuantity}
              </strong>
            </div>

            <div className="checkout-summary-row">
              <span>Subtotal</span>

              <strong>
                ₹{subtotal}
              </strong>
            </div>

            <div className="checkout-summary-row">
              <span>Shipping</span>

              <strong>
                {shippingCharge === 0
                  ? "Free"
                  : `₹${shippingCharge}`}
              </strong>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">
              <span>Grand Total</span>

              <strong>
                ₹{grandTotal}
              </strong>
            </div>

            <button
              type="submit"
              className="checkout-place-order"
              disabled={
                !canPlaceOrder
              }
            >
              {isSubmitting
                ? paymentMethod ===
                  "razorpay"
                  ? "Processing Payment..."
                  : "Placing Order..."
                : paymentMethod ===
                  "razorpay"
                  ? "Pay Securely"
                  : "Place Order"}
            </button>

            <Link
              to={`/${mode}/cart`}
              className="checkout-back-cart"
            >
              Back to Cart
            </Link>

            <div className="checkout-trust-list">
              <div>
                <FiShield />
                <span>
                  100% Secure Checkout
                </span>
              </div>

              <div>
                <FiTruck />
                <span>
                  Safe Delivery
                </span>
              </div>

              <div>
                <FiCheckCircle />
                <span>
                  Verified Order Details
                </span>
              </div>
            </div>
          </aside>
        </form>
      </main>

      <Footer />
    </div>
  );
}