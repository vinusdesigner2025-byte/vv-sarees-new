import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiEye,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

import "../css/Customers.css";

type CustomerType =
  | "retail"
  | "wholesale";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;

  type: CustomerType;

  businessName: string;
  gstNumber: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;

  totalOrders: number;
  lifetimeSpend: number;
  lastOrderDate: string;
  createdAt: string;
};

type CustomerFilter =
  | "all"
  | CustomerType;

type OrderRow = {
  id: string;
  order_number: string;
  order_type: CustomerType;
  customer_name: string;
  phone: string;
  email: string | null;
  grand_total: number;
  order_status: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  created_at: string;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const getCustomerKey = (order: OrderRow) => {
  const email = order.email?.trim().toLowerCase();

  if (email) {
    return `email:${email}`;
  }

  return `phone:${order.phone.trim()}`;
};

export default function Customers() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState<CustomerFilter>("all");

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<Customer | null>(null);

  const loadCustomers = async () => {
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
        grand_total,
        order_status,
        address_line_1,
        address_line_2,
        city,
        state,
        pincode,
        created_at
      `)
      .neq("order_status", "cancelled")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Customers load error:", error);
      setLoadError(`Customers load aagala: ${error.message}`);
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    const orders = (data ?? []) as OrderRow[];
    const groupedCustomers = new Map<string, Customer>();

    orders.forEach((order) => {
      const key = getCustomerKey(order);
      const existingCustomer = groupedCustomers.get(key);

      if (!existingCustomer) {
        groupedCustomers.set(key, {
          id: key,
          name: order.customer_name || "Unnamed Customer",
          phone: order.phone || "",
          email: order.email || "",
          type:
            order.order_type === "wholesale"
              ? "wholesale"
              : "retail",
          businessName: "",
          gstNumber: "",
          addressLine1: order.address_line_1 || "",
          addressLine2: order.address_line_2 || "",
          city: order.city || "",
          state: order.state || "",
          pincode: order.pincode || "",
          totalOrders: 1,
          lifetimeSpend: Number(order.grand_total ?? 0),
          lastOrderDate: formatDate(order.created_at),
          createdAt: formatDate(order.created_at),
        });

        return;
      }

      existingCustomer.totalOrders += 1;
      existingCustomer.lifetimeSpend += Number(
        order.grand_total ?? 0
      );

      if (order.order_type === "wholesale") {
        existingCustomer.type = "wholesale";
      }
    });

    setCustomers(Array.from(groupedCustomers.values()));
    setIsLoading(false);
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return customers.filter((customer) => {
      const matchesType =
        typeFilter === "all" ||
        customer.type === typeFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        customer.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.phone.includes(
          normalizedSearch
        ) ||
        customer.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.businessName
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [
    customers,
    searchTerm,
    typeFilter,
  ]);

  const retailCount = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.type === "retail"
      ).length,
    [customers]
  );

  const wholesaleCount = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.type === "wholesale"
      ).length,
    [customers]
  );

  const totalOrders = useMemo(
    () =>
      customers.reduce(
        (total, customer) =>
          total + customer.totalOrders,
        0
      ),
    [customers]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
  };

  return (
    <div className="customers-page">
      <div className="customers-breadcrumb">
        <span>Sales</span>
        <span>/</span>
        <strong>Customers</strong>
      </div>

      <header className="customers-header">
        <div>
          <h1>Customers</h1>

          <p>
            View retail and wholesale customer
            activity and order history.
          </p>
        </div>
      </header>

      {loadError && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            border: "1px solid #efc7c2",
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

      <section className="customers-summary-grid">
        <article className="customer-summary-card">
          <div className="customer-summary-icon">
            <FiUsers />
          </div>

          <div>
            <span>Total Customers</span>
            <strong>
              {isLoading ? "..." : customers.length}
            </strong>
          </div>
        </article>

        <article className="customer-summary-card">
          <div className="customer-summary-icon">
            <FiUser />
          </div>

          <div>
            <span>Retail Customers</span>
            <strong>{isLoading ? "..." : retailCount}</strong>
          </div>
        </article>

        <article className="customer-summary-card">
          <div className="customer-summary-icon">
            <FiShoppingBag />
          </div>

          <div>
            <span>Wholesale Customers</span>
            <strong>{isLoading ? "..." : wholesaleCount}</strong>
          </div>
        </article>

        <article className="customer-summary-card">
          <div className="customer-summary-icon">
            <FiShoppingBag />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{isLoading ? "..." : totalOrders}</strong>
          </div>
        </article>
      </section>

      <section className="customers-content-card">
        <div className="customers-toolbar">
          <div className="customers-search">
            <FiSearch />

            <input
              type="search"
              value={searchTerm}
              placeholder="Search name, phone, email or business..."
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target
                  .value as CustomerFilter
              )
            }
            aria-label="Filter customers by type"
          >
            <option value="all">
              All Customers
            </option>

            <option value="retail">
              Retail Customers
            </option>

            <option value="wholesale">
              Wholesale Customers
            </option>
          </select>
        </div>

        {isLoading ? (
          <div className="customers-empty-state">
            <div className="customers-empty-icon">
              <FiUsers />
            </div>

            <h2>Loading customers...</h2>

            <p>
              Supabase-la irundhu customer details load aaguthu.
            </p>
          </div>
        ) : customers.length === 0 ? (
          <div className="customers-empty-state">
            <div className="customers-empty-icon">
              <FiUsers />
            </div>

            <h2>No customers yet</h2>

            <p>
              Customers will appear here
              automatically after they place an
              order or create an account.
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="customers-empty-state">
            <div className="customers-empty-icon">
              <FiSearch />
            </div>

            <h2>No matching customers</h2>

            <p>
              Change the search text or remove the
              selected customer type filter.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Orders</th>
                  <th>Lifetime Spend</th>
                  <th>Last Order</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer) => (
                    <tr key={customer.id}>
                      <td data-label="Customer">
                        <div className="customer-table-profile">
                          <div className="customer-avatar">
                            {customer.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {customer.type ===
                                "wholesale" &&
                              customer.businessName
                                ? customer.businessName
                                : customer.name}
                            </strong>

                            <span>
                              {customer.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Type">
                        <span
                          className={`customer-type-badge customer-type-${customer.type}`}
                        >
                          {customer.type ===
                          "wholesale"
                            ? "Wholesale"
                            : "Retail"}
                        </span>
                      </td>

                      <td data-label="Contact">
                        <div className="customer-contact">
                          <strong>
                            {customer.phone}
                          </strong>

                          <span>
                            {customer.email ||
                              "No email"}
                          </span>
                        </div>
                      </td>

                      <td data-label="Orders">
                        {customer.totalOrders}
                      </td>

                      <td data-label="Lifetime Spend">
                        {formatCurrency(
                          customer.lifetimeSpend
                        )}
                      </td>

                      <td data-label="Last Order">
                        {customer.lastOrderDate ||
                          "No orders"}
                      </td>

                      <td data-label="Action">
                        <button
                          type="button"
                          className="customer-view-button"
                          onClick={() =>
                            setSelectedCustomer(
                              customer
                            )
                          }
                          aria-label={`View ${customer.name}`}
                        >
                          <FiEye />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedCustomer && (
        <div
          className="customer-drawer-overlay"
          onMouseDown={() =>
            setSelectedCustomer(null)
          }
        >
          <aside
            className="customer-details-drawer"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <header className="customer-drawer-header">
              <div>
                <span>Customer Details</span>

                <h2>
                  {selectedCustomer.type ===
                    "wholesale" &&
                  selectedCustomer.businessName
                    ? selectedCustomer.businessName
                    : selectedCustomer.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(null)
                }
                aria-label="Close customer details"
              >
                <FiX />
              </button>
            </header>

            <div className="customer-drawer-scroll">
              <section className="customer-details-section">
                <div className="customer-details-profile">
                  <div className="customer-details-avatar">
                    {selectedCustomer.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3>
                      {selectedCustomer.name}
                    </h3>

                    <span
                      className={`customer-type-badge customer-type-${selectedCustomer.type}`}
                    >
                      {selectedCustomer.type ===
                      "wholesale"
                        ? "Wholesale Customer"
                        : "Retail Customer"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="customer-details-section">
                <h3>Contact Information</h3>

                <div className="customer-detail-grid">
                  <div>
                    <span>Phone</span>
                    <strong>
                      {selectedCustomer.phone}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {selectedCustomer.email ||
                        "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Customer Since</span>
                    <strong>
                      {selectedCustomer.createdAt ||
                        "Not available"}
                    </strong>
                  </div>
                </div>
              </section>

              {selectedCustomer.type ===
                "wholesale" && (
                <section className="customer-details-section">
                  <h3>Business Information</h3>

                  <div className="customer-detail-grid">
                    <div>
                      <span>Business Name</span>
                      <strong>
                        {selectedCustomer.businessName ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>GST Number</span>
                      <strong>
                        {selectedCustomer.gstNumber ||
                          "Not provided"}
                      </strong>
                    </div>
                  </div>
                </section>
              )}

              <section className="customer-details-section">
                <h3>Address</h3>

                <p className="customer-address">
                  {
                    selectedCustomer.addressLine1
                  }

                  {selectedCustomer.addressLine2
                    ? `, ${selectedCustomer.addressLine2}`
                    : ""}

                  <br />

                  {selectedCustomer.city},{" "}
                  {selectedCustomer.state} -{" "}
                  {selectedCustomer.pincode}
                </p>
              </section>

              <section className="customer-details-section">
                <h3>Customer Activity</h3>

                <div className="customer-activity-grid">
                  <article>
                    <span>Total Orders</span>

                    <strong>
                      {
                        selectedCustomer.totalOrders
                      }
                    </strong>
                  </article>

                  <article>
                    <span>Lifetime Spend</span>

                    <strong>
                      {formatCurrency(
                        selectedCustomer.lifetimeSpend
                      )}
                    </strong>
                  </article>

                  <article>
                    <span>Last Order</span>

                    <strong>
                      {selectedCustomer.lastOrderDate ||
                        "No orders"}
                    </strong>
                  </article>
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}