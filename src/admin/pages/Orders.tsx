import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  FiBox,
  FiCheckCircle,
  FiEye,
  FiPackage,
  FiSearch,
  FiTruck,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

import "../css/Orders.css";

type OrderStage =
  | "new"
  | "packed"
  | "shipped"
  | "delivered";

type OrderType =
  | "retail"
  | "wholesale";

type PaymentStatus =
  | "paid"
  | "pending"
  | "cod";

type OrderProduct = {
  id: string;
  name: string;
  sku: string;
  colour: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  orderNumber: string;

  type: OrderType;
  stage: OrderStage;
  paymentStatus: PaymentStatus;

  customerName: string;
  businessName: string;
  phone: string;
  email: string;
  gstNumber: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;

  orderDate: string;
  packedDate: string;
  shippedDate: string;
  deliveredDate: string;

  carrierName: string;
  trackingNumber: string;
  trackingUrl: string;

  products: OrderProduct[];

  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
};

type OrderFilter =
  | "all"
  | OrderType;

type OrderItemRow = {
  id: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  colour: string | null;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

type OrderRow = {
  id: string;
  order_number: string;
  order_type: OrderType;
  customer_name: string;
  phone: string;
  email: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  payment_method: "upi" | "cod";
  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";
  order_status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  subtotal: number;
  shipping_charge: number;
  grand_total: number;
  total_quantity: number;
  tracking_number: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItemRow[] | null;
};

const stageTabs: {
  value: OrderStage;
  label: string;
}[] = [
  {
    value: "new",
    label: "New Orders",
  },
  {
    value: "packed",
    label: "Packed",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);


const formatDateTime = (
  value: string
) => {
  if (!value) return "";

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

const mapOrderStage = (
  status: OrderRow["order_status"]
): OrderStage => {
  if (status === "processing") return "packed";
  if (status === "shipped") return "shipped";
  if (status === "delivered") return "delivered";
  return "new";
};

const mapPaymentStatus = (
  paymentStatus: OrderRow["payment_status"],
  paymentMethod: OrderRow["payment_method"]
): PaymentStatus => {
  if (paymentStatus === "paid") return "paid";
  if (paymentMethod === "cod") return "cod";
  return "pending";
};

const getStageLabel = (
  stage: OrderStage
) => {
  if (stage === "new") {
    return "New Order";
  }

  if (stage === "packed") {
    return "Packed";
  }

  if (stage === "shipped") {
    return "Shipped";
  }

  return "Delivered";
};

const getPaymentLabel = (
  payment: PaymentStatus
) => {
  if (payment === "paid") {
    return "Paid";
  }

  if (payment === "cod") {
    return "Cash on Delivery";
  }

  return "Payment Pending";
};

export default function Orders() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [deletingOrderId, setDeletingOrderId] =
    useState<string | null>(null);

  const [activeStage, setActiveStage] =
    useState<OrderStage>("new");

  const [orderTypeFilter, setOrderTypeFilter] =
    useState<OrderFilter>("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [isDispatchModalOpen, setIsDispatchModalOpen] =
    useState(false);

  const [carrierName, setCarrierName] =
    useState("");

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [trackingUrl, setTrackingUrl] =
    useState("");


  const loadOrders = async () => {
    setIsLoading(true);
    setLoadError("");

    const { data, error } = await supabase
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
        subtotal,
        shipping_charge,
        grand_total,
        total_quantity,
        tracking_number,
        courier_name,
        tracking_url,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_slug,
          product_name,
          colour,
          image_url,
          unit_price,
          quantity,
          line_total
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Admin orders load error:",
        error
      );

      setLoadError(
        `Orders load aagala: ${error.message}`
      );

      setOrders([]);
      setIsLoading(false);
      return;
    }

    const formattedOrders: Order[] =
      ((data ?? []) as OrderRow[]).map(
        (order) => {
          const stage = mapOrderStage(
            order.order_status
          );

          return {
            id: order.id,
            orderNumber:
              order.order_number,
            type: order.order_type,
            stage,
            paymentStatus:
              mapPaymentStatus(
                order.payment_status,
                order.payment_method
              ),
            customerName:
              order.customer_name,
            businessName:
              order.order_type ===
              "wholesale"
                ? order.customer_name
                : "",
            phone: order.phone,
            email: order.email,
            gstNumber: "",
            addressLine1:
              order.address_line_1,
            addressLine2:
              order.address_line_2 ?? "",
            city: order.city,
            state: order.state,
            pincode: order.pincode,
            orderDate:
              formatDateTime(
                order.created_at
              ),
            packedDate:
              stage === "packed"
                ? formatDateTime(
                    order.updated_at
                  )
                : "",
            shippedDate:
              stage === "shipped" ||
              stage === "delivered"
                ? formatDateTime(
                    order.updated_at
                  )
                : "",
            deliveredDate:
              stage === "delivered"
                ? formatDateTime(
                    order.updated_at
                  )
                : "",
            carrierName:
              order.courier_name ?? "",
            trackingNumber:
              order.tracking_number ?? "",
            trackingUrl:
              order.tracking_url ?? "",
            products:
              order.order_items?.map(
                (item) => ({
                  id: item.id,
                  name:
                    item.product_name,
                  sku: "",
                  colour:
                    item.colour ?? "",
                  imageUrl:
                    item.image_url ?? "",
                  quantity: Number(
                    item.quantity ?? 0
                  ),
                  unitPrice: Number(
                    item.unit_price ?? 0
                  ),
                })
              ) ?? [],
            subtotal: Number(
              order.subtotal ?? 0
            ),
            deliveryCharge: Number(
              order.shipping_charge ?? 0
            ),
            discount: 0,
            total: Number(
              order.grand_total ?? 0
            ),
          };
        }
      );

    setOrders(formattedOrders);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const stageCounts = useMemo(() => {
    return {
      new: orders.filter(
        (order) => order.stage === "new"
      ).length,

      packed: orders.filter(
        (order) => order.stage === "packed"
      ).length,

      shipped: orders.filter(
        (order) => order.stage === "shipped"
      ).length,

      delivered: orders.filter(
        (order) => order.stage === "delivered"
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesStage =
        order.stage === activeStage;

      const matchesType =
        orderTypeFilter === "all" ||
        order.type === orderTypeFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        order.orderNumber
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.customerName
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.businessName
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.phone.includes(normalizedSearch);

      return (
        matchesStage &&
        matchesType &&
        matchesSearch
      );
    });
  }, [
    orders,
    activeStage,
    orderTypeFilter,
    searchTerm,
  ]);

  const updateOrderStage = async (
    orderId: string,
    nextStage: OrderStage
  ) => {
    const statusMap: Record<
      OrderStage,
      OrderRow["order_status"]
    > = {
      new: "pending",
      packed: "processing",
      shipped: "shipped",
      delivered: "delivered",
    };

    setIsUpdating(true);

    const { error } = await supabase
      .from("orders")
      .update({
        order_status:
          statusMap[nextStage],
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      alert(
        `Order update aagala: ${error.message}`
      );
      setIsUpdating(false);
      return false;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              stage: nextStage,
            }
          : order
      )
    );

    setSelectedOrder(
      (currentOrder) =>
        currentOrder?.id === orderId
          ? {
              ...currentOrder,
              stage: nextStage,
            }
          : currentOrder
    );

    setIsUpdating(false);
    return true;
  };

  const handlePackOrder = async () => {
    if (
      !selectedOrder ||
      isUpdating
    ) {
      return;
    }

    const shouldPack = window.confirm(
      `Mark order ${selectedOrder.orderNumber} as packed?`
    );

    if (!shouldPack) return;

    const updated =
      await updateOrderStage(
        selectedOrder.id,
        "packed"
      );

    if (!updated) return;

    setSelectedOrder(null);
    setActiveStage("packed");
  };

  const openDispatchModal = () => {
    if (!selectedOrder) return;

    setCarrierName(
      selectedOrder.carrierName
    );

    setTrackingNumber(
      selectedOrder.trackingNumber
    );

    setTrackingUrl(
      selectedOrder.trackingUrl
    );

    setIsDispatchModalOpen(true);
  };

  const handleDispatch = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !selectedOrder ||
      isUpdating
    ) {
      return;
    }

    if (!carrierName.trim()) {
      alert("Carrier name is required.");
      return;
    }

    if (!trackingNumber.trim()) {
      alert(
        "Tracking number is required."
      );
      return;
    }

    if (!trackingUrl.trim()) {
      alert(
        "Tracking URL is required."
      );
      return;
    }

    try {
      const parsedUrl = new URL(
        trackingUrl.trim()
      );

      if (
        parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:"
      ) {
        throw new Error(
          "Invalid protocol"
        );
      }
    } catch {
      alert(
        "Valid tracking URL enter pannu. Example: https://..."
      );
      return;
    }

    setIsUpdating(true);

    const { error } = await supabase
      .from("orders")
      .update({
        order_status: "shipped",
        courier_name:
          carrierName.trim(),
        tracking_number:
          trackingNumber.trim(),
        tracking_url:
          trackingUrl.trim(),
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        selectedOrder.id
      );

    if (error) {
      alert(
        `Dispatch update aagala: ${error.message}`
      );
      setIsUpdating(false);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              stage: "shipped",
              carrierName:
                carrierName.trim(),
              trackingNumber:
                trackingNumber.trim(),
              trackingUrl:
                trackingUrl.trim(),
            }
          : order
      )
    );

    setSelectedOrder(null);
    setIsDispatchModalOpen(false);
    setCarrierName("");
    setTrackingNumber("");
    setTrackingUrl("");
    setActiveStage("shipped");
    setIsUpdating(false);
  };

  const handleDelivered = async () => {
    if (
      !selectedOrder ||
      isUpdating
    ) {
      return;
    }

    const shouldDeliver = window.confirm(
      `Mark order ${selectedOrder.orderNumber} as delivered?`
    );

    if (!shouldDeliver) return;

    const updated =
      await updateOrderStage(
        selectedOrder.id,
        "delivered"
      );

    if (!updated) return;

    setSelectedOrder(null);
    setActiveStage("delivered");
  };

  const handleDeleteOrder = async (
    order: Order
  ) => {
    if (deletingOrderId) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete order ${order.orderNumber}?\n\nThis will permanently remove the order and its items. This action cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingOrderId(order.id);

    try {
      /*
        Delete child order items first.
        This avoids foreign-key issues if cascade
        delete is not enabled in Supabase.
      */

      const {
        error: itemsDeleteError,
      } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", order.id);

      if (itemsDeleteError) {
        throw new Error(
          `Order items delete aagala: ${itemsDeleteError.message}`
        );
      }

      const {
        error: orderDeleteError,
      } = await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (orderDeleteError) {
        throw new Error(
          `Order delete aagala: ${orderDeleteError.message}`
        );
      }

      setOrders((currentOrders) =>
        currentOrders.filter(
          (currentOrder) =>
            currentOrder.id !== order.id
        )
      );

      setSelectedOrder(
        (currentOrder) =>
          currentOrder?.id === order.id
            ? null
            : currentOrder
      );

      window.alert(
        `Order ${order.orderNumber} deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Admin delete order error:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Order delete aagala. Please try again."
      );
    } finally {
      setDeletingOrderId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setOrderTypeFilter("all");
  };

  return (
    <div className="orders-page">
      <div className="orders-breadcrumb">
        <span>Sales</span>
        <span>/</span>
        <strong>Orders</strong>
      </div>

      <header className="orders-header">
        <div>
          <h1>Orders</h1>

          <p>
            Process retail and wholesale orders
            from confirmation to delivery.
          </p>
        </div>
      </header>

      {loadError && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            border:
              "1px solid #efc7c2",
            borderRadius: "10px",
            background: "#fff3f1",
            color: "#a13e35",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {loadError}
        </div>
      )}

      <section className="order-stage-tabs">
        {stageTabs.map((tab) => {
          const Icon =
            tab.value === "new"
              ? FiPackage
              : tab.value === "packed"
                ? FiBox
                : tab.value === "shipped"
                  ? FiTruck
                  : FiCheckCircle;

          return (
            <button
              type="button"
              key={tab.value}
              className={`order-stage-tab ${
                activeStage === tab.value
                  ? "order-stage-tab-active"
                  : ""
              }`}
              onClick={() =>
                setActiveStage(tab.value)
              }
            >
              <span className="order-stage-tab-icon">
                <Icon />
              </span>

              <span className="order-stage-tab-text">
                <strong>{tab.label}</strong>

                <small>
                  {stageCounts[tab.value]} orders
                </small>
              </span>

              <span className="order-stage-count">
                {stageCounts[tab.value]}
              </span>
            </button>
          );
        })}
      </section>

      <section className="orders-content-card">
        <div className="orders-toolbar">
          <div className="orders-search">
            <FiSearch />

            <input
              type="search"
              value={searchTerm}
              placeholder="Search order number, customer or phone..."
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>

          <select
            value={orderTypeFilter}
            onChange={(event) =>
              setOrderTypeFilter(
                event.target
                  .value as OrderFilter
              )
            }
            aria-label="Filter orders by type"
          >
            <option value="all">
              All Order Types
            </option>

            <option value="retail">
              Retail Orders
            </option>

            <option value="wholesale">
              Wholesale Orders
            </option>
          </select>
        </div>

        {isLoading ? (
          <div className="orders-empty-state">
            <div className="orders-empty-icon">
              <FiPackage />
            </div>

            <h2>Loading orders...</h2>

            <p>
              Supabase-la irundhu orders load aaguthu.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="orders-empty-icon">
              <FiPackage />
            </div>

            <h2>No orders received yet</h2>

            <p>
              New retail and wholesale customer
              orders will appear here automatically.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="orders-empty-icon">
              <FiSearch />
            </div>

            <h2>
              No matching {getStageLabel(
                activeStage
              ).toLowerCase()} orders
            </h2>

            <p>
              Change the search term or remove the
              selected order type filter.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const totalQuantity =
                order.products.reduce(
                  (total, product) =>
                    total +
                    product.quantity,
                  0
                );

              const previewProducts =
                order.products.slice(0, 3);

              return (
                <article
                  className="order-card"
                  key={order.id}
                >
                  <div className="order-card-header">
                    <div>
                      <div className="order-card-number">
                        <strong>
                          {order.orderNumber}
                        </strong>

                        <span
                          className={`order-type-badge order-type-${order.type}`}
                        >
                          {order.type ===
                          "wholesale"
                            ? "Wholesale Order"
                            : "Retail Order"}
                        </span>
                      </div>

                      <p>
                        Ordered on{" "}
                        {order.orderDate}
                      </p>
                    </div>

                    <div className="order-card-badges">
                      <span
                        className={`order-payment-badge order-payment-${order.paymentStatus}`}
                      >
                        {getPaymentLabel(
                          order.paymentStatus
                        )}
                      </span>

                      <span
                        className={`order-status-badge order-status-${order.stage}`}
                      >
                        {getStageLabel(
                          order.stage
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-main">
                    <div className="order-product-preview">
                      {previewProducts.map(
                        (product) => (
                          <div
                            className="order-preview-item"
                            key={product.id}
                          >
                            <div className="order-preview-image">
                              {product.imageUrl ? (
                                <img
                                  src={
                                    product.imageUrl
                                  }
                                  alt={
                                    product.name
                                  }
                                />
                              ) : (
                                <FiPackage />
                              )}
                            </div>

                            <div>
                              <strong>
                                {product.name}
                              </strong>

                              <span>
                                {product.colour} ·
                                Qty{" "}
                                {
                                  product.quantity
                                }
                              </span>
                            </div>
                          </div>
                        )
                      )}

                      {order.products.length >
                        3 && (
                        <span className="order-more-products">
                          +
                          {order.products.length -
                            3}{" "}
                          more products
                        </span>
                      )}
                    </div>

                    <div className="order-customer-summary">
                      <span>
                        {order.type ===
                        "wholesale"
                          ? "Business"
                          : "Customer"}
                      </span>

                      <strong>
                        {order.type ===
                          "wholesale"
                          ? order.businessName
                          : order.customerName}
                      </strong>

                      <small>
                        {order.phone}
                      </small>
                    </div>

                    <div className="order-quantity-summary">
                      <span>Total Pieces</span>
                      <strong>
                        {totalQuantity}
                      </strong>
                    </div>

                    <div className="order-total-summary">
                      <span>Order Total</span>
                      <strong>
                        {formatCurrency(
                          order.total
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <button
                      type="button"
                      className="order-view-button"
                      onClick={() =>
                        setSelectedOrder(order)
                      }
                    >
                      <FiEye />
                      View Order
                    </button>

                    <button
                      type="button"
                      className="order-delete-button"
                      onClick={() =>
                        void handleDeleteOrder(
                          order
                        )
                      }
                      disabled={
                        deletingOrderId ===
                        order.id
                      }
                    >
                      <FiTrash2 />

                      {deletingOrderId ===
                      order.id
                        ? "Deleting..."
                        : "Delete Order"}
                    </button>

                    {order.stage === "new" && (
                      <button
                        type="button"
                        className="order-primary-action"
                        onClick={() => {
                          setSelectedOrder(
                            order
                          );
                        }}
                      >
                        Review & Pack
                      </button>
                    )}

                    {order.stage ===
                      "packed" && (
                      <button
                        type="button"
                        className="order-primary-action"
                        onClick={() => {
                          setSelectedOrder(
                            order
                          );
                        }}
                      >
                        Add Carrier
                      </button>
                    )}

                    {order.stage ===
                      "shipped" && (
                      <button
                        type="button"
                        className="order-primary-action"
                        onClick={() => {
                          setSelectedOrder(
                            order
                          );
                        }}
                      >
                        Update Delivery
                      </button>
                    )}

                    {order.stage ===
                      "delivered" && (
                      <span className="order-completed-label">
                        <FiCheckCircle />
                        Order Completed
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedOrder && (
        <div
          className="order-drawer-overlay"
          onMouseDown={() =>
            setSelectedOrder(null)
          }
        >
          <aside
            className="order-details-drawer"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <header className="order-drawer-header">
              <div>
                <span>Order Details</span>

                <h2>
                  {selectedOrder.orderNumber}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                aria-label="Close order details"
              >
                <FiX />
              </button>
            </header>

            <div className="order-drawer-scroll">
              <section className="order-details-section">
                <div className="order-detail-heading">
                  <h3>Order Information</h3>

                  <div>
                    <span
                      className={`order-type-badge order-type-${selectedOrder.type}`}
                    >
                      {selectedOrder.type ===
                      "wholesale"
                        ? "Wholesale Order"
                        : "Retail Order"}
                    </span>

                    <span
                      className={`order-status-badge order-status-${selectedOrder.stage}`}
                    >
                      {getStageLabel(
                        selectedOrder.stage
                      )}
                    </span>
                  </div>
                </div>

                <div className="order-detail-grid">
                  <div>
                    <span>Order Date</span>
                    <strong>
                      {selectedOrder.orderDate}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>
                    <strong>
                      {getPaymentLabel(
                        selectedOrder.paymentStatus
                      )}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="order-details-section">
                <h3>
                  {selectedOrder.type ===
                  "wholesale"
                    ? "Business Details"
                    : "Customer Details"}
                </h3>

                <div className="order-detail-grid">
                  <div>
                    <span>
                      Customer Name
                    </span>

                    <strong>
                      {
                        selectedOrder.customerName
                      }
                    </strong>
                  </div>

                  {selectedOrder.type ===
                    "wholesale" && (
                    <>
                      <div>
                        <span>
                          Business Name
                        </span>

                        <strong>
                          {
                            selectedOrder.businessName
                          }
                        </strong>
                      </div>

                      <div>
                        <span>GST Number</span>

                        <strong>
                          {selectedOrder.gstNumber ||
                            "Not provided"}
                        </strong>
                      </div>
                    </>
                  )}

                  <div>
                    <span>Phone</span>
                    <strong>
                      {selectedOrder.phone}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {selectedOrder.email ||
                        "Not provided"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="order-details-section">
                <h3>Shipping Address</h3>

                <p className="order-address">
                  {
                    selectedOrder.addressLine1
                  }

                  {selectedOrder.addressLine2
                    ? `, ${selectedOrder.addressLine2}`
                    : ""}

                  <br />

                  {selectedOrder.city},{" "}
                  {selectedOrder.state} -{" "}
                  {selectedOrder.pincode}
                </p>
              </section>

              <section className="order-details-section">
                <h3>Ordered Products</h3>

                <div className="order-items-list">
                  {selectedOrder.products.map(
                    (product) => (
                      <article
                        className="order-item"
                        key={product.id}
                      >
                        <div className="order-item-image">
                          {product.imageUrl ? (
                            <img
                              src={
                                product.imageUrl
                              }
                              alt={
                                product.name
                              }
                            />
                          ) : (
                            <FiPackage />
                          )}
                        </div>

                        <div className="order-item-content">
                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            Colour:{" "}
                            {product.colour}
                          </span>

                          <span>
                            SKU: {product.sku}
                          </span>

                          <div className="order-item-price-row">
                            <span>
                              Qty:{" "}
                              {
                                product.quantity
                              }
                            </span>

                            <strong>
                              {formatCurrency(
                                product.unitPrice *
                                  product.quantity
                              )}
                            </strong>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>

              {selectedOrder.stage ===
                "shipped" ||
              selectedOrder.stage ===
                "delivered" ? (
                <section className="order-details-section">
                  <h3>
                    Shipping Information
                  </h3>

                  <div className="order-detail-grid">
                    <div>
                      <span>Carrier</span>

                      <strong>
                        {
                          selectedOrder.carrierName
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Tracking Number
                      </span>

                      <strong>
                        {
                          selectedOrder.trackingNumber
                        }
                      </strong>
                    </div>

                    {selectedOrder.trackingUrl && (
                      <div>
                        <span>
                          Tracking Link
                        </span>

                        <a
                          href={
                            selectedOrder.trackingUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          Track Package
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              <section className="order-details-section">
                <h3>Payment Summary</h3>

                <div className="order-payment-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      {formatCurrency(
                        selectedOrder.subtotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Delivery Charge
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedOrder.deliveryCharge
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Discount</span>

                    <strong>
                      -
                      {formatCurrency(
                        selectedOrder.discount
                      )}
                    </strong>
                  </div>

                  <div className="order-payment-total">
                    <span>Total</span>

                    <strong>
                      {formatCurrency(
                        selectedOrder.total
                      )}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            <footer className="order-drawer-footer">
              <button
                type="button"
                className="order-drawer-delete"
                onClick={() =>
                  void handleDeleteOrder(
                    selectedOrder
                  )
                }
                disabled={
                  deletingOrderId ===
                  selectedOrder.id
                }
              >
                <FiTrash2 />

                {deletingOrderId ===
                selectedOrder.id
                  ? "Deleting Order..."
                  : "Delete Order"}
              </button>

              {selectedOrder.stage === "new" && (
                <button
                  type="button"
                  className="order-drawer-primary"
                  onClick={() =>
                    void handlePackOrder()
                  }
                  disabled={isUpdating}
                >
                  <FiBox />
                  Mark as Packed
                </button>
              )}

              {selectedOrder.stage ===
                "packed" && (
                <button
                  type="button"
                  className="order-drawer-primary"
                  onClick={
                    openDispatchModal
                  }
                  disabled={isUpdating}
                >
                  <FiTruck />
                  Add Carrier & Dispatch
                </button>
              )}

              {selectedOrder.stage ===
                "shipped" && (
                <button
                  type="button"
                  className="order-drawer-primary"
                  onClick={() =>
                    void handleDelivered()
                  }
                  disabled={isUpdating}
                >
                  <FiCheckCircle />
                  Mark as Delivered
                </button>
              )}

              {selectedOrder.stage ===
                "delivered" && (
                <div className="order-delivered-message">
                  <FiCheckCircle />

                  <span>
                    This order has been
                    delivered successfully.
                  </span>
                </div>
              )}
            </footer>
          </aside>
        </div>
      )}

      {isDispatchModalOpen &&
        selectedOrder && (
          <div
            className="dispatch-modal-overlay"
            onMouseDown={() =>
              setIsDispatchModalOpen(false)
            }
          >
            <div
              className="dispatch-modal"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="dispatch-modal-header">
                <div>
                  <span>
                    Dispatch Order
                  </span>

                  <h2>
                    {
                      selectedOrder.orderNumber
                    }
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsDispatchModalOpen(
                      false
                    )
                  }
                >
                  <FiX />
                </button>
              </div>

              <form
                onSubmit={handleDispatch}
              >
                <div className="dispatch-form-field">
                  <label htmlFor="carrier-name">
                    Carrier Name
                  </label>

                  <select
                    id="carrier-name"
                    value={carrierName}
                    onChange={(event) =>
                      setCarrierName(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select carrier
                    </option>

                    <option value="Delhivery">
                      Delhivery
                    </option>

                    <option value="DTDC">
                      DTDC
                    </option>

                    <option value="Blue Dart">
                      Blue Dart
                    </option>

                    <option value="Professional Couriers">
                      Professional Couriers
                    </option>

                    <option value="India Post">
                      India Post
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="dispatch-form-field">
                  <label htmlFor="tracking-number">
                    Tracking Number
                  </label>

                  <input
                    id="tracking-number"
                    type="text"
                    value={trackingNumber}
                    placeholder="Enter tracking number"
                    onChange={(event) =>
                      setTrackingNumber(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="dispatch-form-field">
                  <label htmlFor="tracking-url">
                    Tracking URL
                  </label>

                  <input
                    id="tracking-url"
                    type="url"
                    value={trackingUrl}
                    placeholder="https://..."
                    onChange={(event) =>
                      setTrackingUrl(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="dispatch-modal-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setIsDispatchModalOpen(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button type="submit">
                    <FiTruck />
                    Dispatch Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}