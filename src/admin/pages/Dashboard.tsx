import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FiBox,
  FiDollarSign,
  FiImage,
  FiPackage,
  FiPlus,
  FiShoppingBag,
  FiTag,
  FiUsers,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

import "../css/Dashboard.css";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type DashboardOrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  grand_total: number;
  order_status: OrderStatus;
  payment_status: string;
  created_at: string;
};

type ProductVariantRow = {
  id: string;
  colour_name: string;
  stock: number;
  products:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

type RecentOrder = {
  id: string;
  customer: string;
  amount: string;
  status: string;
  statusClass: string;
};

type LowStockProduct = {
  name: string;
  detail: string;
  stock: string;
};

type SalesDay = {
  label: string;
  amount: number;
};

const formatCurrency = (
  amount: number
) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
};

const getStatusLabel = (
  status: OrderStatus
) => {
  if (
    status === "pending" ||
    status === "confirmed"
  ) {
    return "Pending";
  }

  if (status === "processing") {
    return "Packed";
  }

  if (status === "shipped") {
    return "Shipped";
  }

  if (status === "delivered") {
    return "Delivered";
  }

  return "Cancelled";
};

const getStatusClass = (
  status: OrderStatus
) => {
  if (status === "shipped") {
    return "shipped";
  }

  if (status === "delivered") {
    return "delivered";
  }

  return "";
};

const getStartOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

const getStartOfLast30Days = () => {
  const date = new Date();

  date.setDate(date.getDate() - 29);
  date.setHours(0, 0, 0, 0);

  return date;
};

const getDateKey = (
  value: string | Date
) => {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [
    totalProducts,
    setTotalProducts,
  ] = useState(0);

  const [orders, setOrders] =
    useState<DashboardOrderRow[]>([]);

  const [
    lowStockProducts,
    setLowStockProducts,
  ] = useState<LowStockProduct[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setLoadError("");

    const [
      productsResult,
      ordersResult,
      lowStockResult,
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_name,
          phone,
          email,
          grand_total,
          order_status,
          payment_status,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("product_variants")
        .select(`
          id,
          colour_name,
          stock,
          products (
            id,
            name
          )
        `)
        .lte("stock", 5)
        .gt("stock", 0)
        .order("stock", {
          ascending: true,
        })
        .limit(5),
    ]);

    const firstError =
      productsResult.error ??
      ordersResult.error ??
      lowStockResult.error;

    if (firstError) {
      console.error(
        "Dashboard load error:",
        firstError
      );

      setLoadError(
        `Dashboard load aagala: ${firstError.message}`
      );

      setIsLoading(false);
      return;
    }

    setTotalProducts(
      productsResult.count ?? 0
    );

    setOrders(
      (ordersResult.data ??
        []) as DashboardOrderRow[]
    );

    const formattedLowStock =
      (
        (lowStockResult.data ??
          []) as ProductVariantRow[]
      ).map((variant) => {
        const productRelation =
          Array.isArray(
            variant.products
          )
            ? variant.products[0]
            : variant.products;

        const productName =
          productRelation?.name ??
          "Unnamed Product";

        return {
          name: `${productName}${
            variant.colour_name
              ? ` - ${variant.colour_name}`
              : ""
          }`,
          detail:
            "Variant stock is low",
          stock: `${variant.stock} left`,
        };
      });

    setLowStockProducts(
      formattedLowStock
    );

    setIsLoading(false);
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.order_status !==
          "cancelled"
      ),
    [orders]
  );

  const uniqueCustomers = useMemo(() => {
    const customerKeys =
      activeOrders.map((order) => {
        const email =
          order.email
            ?.trim()
            .toLowerCase();

        if (email) {
          return `email:${email}`;
        }

        return `phone:${order.phone.trim()}`;
      });

    return new Set(customerKeys).size;
  }, [activeOrders]);

  const totalRevenue = useMemo(
    () =>
      activeOrders.reduce(
        (total, order) =>
          total +
          Number(
            order.grand_total ?? 0
          ),
        0
      ),
    [activeOrders]
  );

  const todayRevenue = useMemo(() => {
    const today =
      getStartOfToday();

    return activeOrders.reduce(
      (total, order) => {
        const orderDate =
          new Date(order.created_at);

        if (orderDate >= today) {
          return (
            total +
            Number(
              order.grand_total ?? 0
            )
          );
        }

        return total;
      },
      0
    );
  }, [activeOrders]);

  const orderStatus = useMemo(() => {
    const counts = {
      Pending: 0,
      Packed: 0,
      Shipped: 0,
      Delivered: 0,
    };

    activeOrders.forEach((order) => {
      const label =
        getStatusLabel(
          order.order_status
        );

      if (label in counts) {
        counts[
          label as keyof typeof counts
        ] += 1;
      }
    });

    const maximumCount = Math.max(
      counts.Pending,
      counts.Packed,
      counts.Shipped,
      counts.Delivered,
      1
    );

    return [
      {
        label: "Pending",
        count: counts.Pending,
        width: `${
          (counts.Pending /
            maximumCount) *
          100
        }%`,
      },
      {
        label: "Packed",
        count: counts.Packed,
        width: `${
          (counts.Packed /
            maximumCount) *
          100
        }%`,
      },
      {
        label: "Shipped",
        count: counts.Shipped,
        width: `${
          (counts.Shipped /
            maximumCount) *
          100
        }%`,
      },
      {
        label: "Delivered",
        count: counts.Delivered,
        width: `${
          (counts.Delivered /
            maximumCount) *
          100
        }%`,
      },
    ];
  }, [activeOrders]);

  const recentOrders =
    useMemo<RecentOrder[]>(
      () =>
        orders
          .slice(0, 5)
          .map((order) => ({
            id:
              order.order_number,
            customer:
              order.customer_name,
            amount:
              formatCurrency(
                Number(
                  order.grand_total ??
                    0
                )
              ),
            status:
              getStatusLabel(
                order.order_status
              ),
            statusClass:
              getStatusClass(
                order.order_status
              ),
          })),
      [orders]
    );

  const salesData =
    useMemo<SalesDay[]>(() => {
      const startDate =
        getStartOfLast30Days();

      const dayMap =
        new Map<string, number>();

      for (
        let index = 0;
        index < 30;
        index += 1
      ) {
        const date =
          new Date(startDate);

        date.setDate(
          startDate.getDate() +
            index
        );

        dayMap.set(
          getDateKey(date),
          0
        );
      }

      activeOrders.forEach(
        (order) => {
          const orderDate =
            new Date(
              order.created_at
            );

          if (
            orderDate < startDate
          ) {
            return;
          }

          const key =
            getDateKey(orderDate);

          dayMap.set(
            key,
            (dayMap.get(key) ??
              0) +
              Number(
                order.grand_total ??
                  0
              )
          );
        }
      );

      return Array.from(
        dayMap.entries()
      ).map(([key, amount]) => ({
        label:
          new Intl.DateTimeFormat(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
            }
          ).format(
            new Date(
              `${key}T00:00:00`
            )
          ),
        amount,
      }));
    }, [activeOrders]);

  const maximumSalesAmount =
    useMemo(
      () =>
        Math.max(
          ...salesData.map(
            (item) => item.amount
          ),
          1
        ),
      [salesData]
    );

  const stats = [
    {
      label: "Total Products",
      value: String(
        totalProducts
      ),
      icon: FiShoppingBag,
    },
    {
      label: "Total Orders",
      value: String(
        activeOrders.length
      ),
      icon: FiPackage,
    },
    {
      label: "Customers",
      value: String(
        uniqueCustomers
      ),
      icon: FiUsers,
    },
    {
      label: "Revenue",
      value:
        formatCurrency(
          totalRevenue
        ),
      icon: FiDollarSign,
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <h1>
            {getGreeting()},
            Vinodhini 👋
          </h1>

          <p>
            Welcome back to VV Sarees
            CMS. Here is today&apos;s
            business overview.
          </p>
        </div>

        <div className="dashboard-today-sales">
          <span>
            Today&apos;s Revenue
          </span>

          <strong>
            {formatCurrency(
              todayRevenue
            )}
          </strong>
        </div>
      </section>

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

      <section className="dashboard-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className="dashboard-stat-card"
              key={stat.label}
            >
              <div className="dashboard-stat-icon">
                <Icon />
              </div>

              <div>
                <span>
                  {stat.label}
                </span>

                <strong>
                  {isLoading
                    ? "..."
                    : stat.value}
                </strong>
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>
                Sales Overview
              </h2>

              <p>
                Revenue performance
                for the last 30 days.
              </p>
            </div>

            <button type="button">
              Last 30 Days
            </button>
          </div>

          {isLoading ? (
            <div className="dashboard-chart-placeholder">
              Loading sales data...
            </div>
          ) : (
            <div
              className="dashboard-chart-placeholder"
              style={{
                display: "flex",
                alignItems:
                  "flex-end",
                gap: "6px",
                padding:
                  "28px 18px 12px",
                overflowX: "auto",
              }}
            >
              {salesData.map(
                (item) => (
                  <div
                    key={item.label}
                    title={`${item.label}: ${formatCurrency(
                      item.amount
                    )}`}
                    style={{
                      minWidth: "14px",
                      flex: "1 0 14px",
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      justifyContent:
                        "flex-end",
                      alignItems:
                        "center",
                      height: "190px",
                    }}
                  >
                    <span
                      style={{
                        width: "100%",
                        minHeight:
                          item.amount > 0
                            ? "6px"
                            : "2px",
                        height: `${
                          (item.amount /
                            maximumSalesAmount) *
                          150
                        }px`,
                        borderRadius:
                          "6px 6px 2px 2px",
                        background:
                          "linear-gradient(180deg, #c58a43 0%, #71350f 100%)",
                      }}
                    />

                    <small
                      style={{
                        marginTop:
                          "8px",
                        fontSize:
                          "8px",
                        whiteSpace:
                          "nowrap",
                        transform:
                          "rotate(-45deg)",
                        transformOrigin:
                          "center",
                      }}
                    >
                      {item.label}
                    </small>
                  </div>
                )
              )}
            </div>
          )}
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>
                Order Status
              </h2>

              <p>
                Current order
                processing overview.
              </p>
            </div>
          </div>

          <div className="dashboard-order-status-list">
            {orderStatus.map(
              (item) => (
                <div key={item.label}>
                  <div className="dashboard-order-status-item">
                    <div className="dashboard-order-status-info">
                      <span className="dashboard-status-dot" />

                      <span>
                        {item.label}
                      </span>
                    </div>

                    <strong>
                      {isLoading
                        ? "..."
                        : item.count}
                    </strong>
                  </div>

                  <div className="dashboard-progress">
                    <span
                      style={{
                        width:
                          isLoading
                            ? "0%"
                            : item.width,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>
                Recent Orders
              </h2>

              <p>
                Latest customer
                purchases.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
            >
              View All
            </button>
          </div>

          <div className="dashboard-table-wrapper">
            <table className="dashboard-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4}>
                      Loading orders...
                    </td>
                  </tr>
                ) : recentOrders.length ===
                  0 ? (
                  <tr>
                    <td colSpan={4}>
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(
                    (order) => (
                      <tr key={order.id}>
                        <td>
                          {order.id}
                        </td>

                        <td>
                          {
                            order.customer
                          }
                        </td>

                        <td>
                          {
                            order.amount
                          }
                        </td>

                        <td>
                          <span
                            className={`dashboard-order-badge ${order.statusClass}`}
                          >
                            {
                              order.status
                            }
                          </span>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </article>

        <div className="dashboard-side-stack">
          <article className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2>
                  Low Stock
                </h2>

                <p>
                  Products that need
                  attention.
                </p>
              </div>
            </div>

            <div className="dashboard-low-stock-list">
              {isLoading ? (
                <div className="dashboard-low-stock-item">
                  <div>
                    <strong>
                      Loading stock...
                    </strong>
                  </div>
                </div>
              ) : lowStockProducts.length ===
                0 ? (
                <div className="dashboard-low-stock-item">
                  <div>
                    <strong>
                      Stock looks good
                    </strong>

                    <span>
                      No variants below
                      6 units.
                    </span>
                  </div>
                </div>
              ) : (
                lowStockProducts.map(
                  (product) => (
                    <div
                      className="dashboard-low-stock-item"
                      key={
                        product.name
                      }
                    >
                      <div>
                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          {
                            product.detail
                          }
                        </span>
                      </div>

                      <div className="dashboard-low-stock-count">
                        {
                          product.stock
                        }
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2>
                  Quick Actions
                </h2>

                <p>
                  Frequently used
                  admin actions.
                </p>
              </div>
            </div>

            <div className="dashboard-quick-actions">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/products/new"
                  )
                }
              >
                <FiPlus />
                Add Product
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/categories"
                  )
                }
              >
                <FiTag />
                Add Category
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/media"
                  )
                }
              >
                <FiImage />
                Upload Media
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/orders"
                  )
                }
              >
                <FiBox />
                View Orders
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}