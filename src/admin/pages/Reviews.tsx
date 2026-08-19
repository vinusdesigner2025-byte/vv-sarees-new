import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiMessageSquare,
  FiRefreshCw,
  FiSearch,
  FiStar,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

import "../css/Reviews.css";

type ReviewRow = {
  id: string;
  user_id: string | null;
  order_id: string | null;
  product_id: string | null;
  customer_name: string;
  rating: number;
  review: string | null;
  created_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
};

type OrderItemRow = {
  order_id: string;
  product_id: string | null;
  product_name: string | null;
  image_url: string | null;
};

type AdminReview = ReviewRow & {
  orderNumber: string;
  productName: string;
  imageUrl: string;
};

export default function Reviews() {
  const [
    reviews,
    setReviews,
  ] = useState<AdminReview[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    ratingFilter,
    setRatingFilter,
  ] = useState("all");

  /* =========================
     LOAD REVIEWS
  ========================= */

  const loadReviews = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: reviewData,
        error: reviewError,
      } = await supabase
        .from("product_reviews")
        .select(`
          id,
          user_id,
          order_id,
          product_id,
          customer_name,
          rating,
          review,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (reviewError) {
        throw reviewError;
      }

      const rawReviews =
        (reviewData ?? []) as ReviewRow[];

      if (rawReviews.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const orderIds = Array.from(
        new Set(
          rawReviews
            .map(
              (review) =>
                review.order_id
            )
            .filter(
              (
                orderId
              ): orderId is string =>
                Boolean(orderId)
            )
        )
      );

      /* =========================
         LOAD ORDERS
      ========================= */

      let orders: OrderRow[] = [];

      if (orderIds.length > 0) {
        const {
          data: orderData,
          error: orderError,
        } = await supabase
          .from("orders")
          .select(`
            id,
            order_number
          `)
          .in("id", orderIds);

        if (orderError) {
          console.error(
            "Reviews orders load error:",
            orderError
          );
        } else {
          orders =
            (orderData ??
              []) as OrderRow[];
        }
      }

      /* =========================
         LOAD ORDER ITEMS
      ========================= */

      let orderItems:
        OrderItemRow[] = [];

      if (orderIds.length > 0) {
        const {
          data: itemData,
          error: itemError,
        } = await supabase
          .from("order_items")
          .select(`
            order_id,
            product_id,
            product_name,
            image_url
          `)
          .in("order_id", orderIds);

        if (itemError) {
          console.error(
            "Reviews order items load error:",
            itemError
          );
        } else {
          orderItems =
            (itemData ??
              []) as OrderItemRow[];
        }
      }

      /* =========================
         FORMAT REVIEWS
      ========================= */

      const formatted:
        AdminReview[] =
        rawReviews.map(
          (review) => {
            const order =
              orders.find(
                (item) =>
                  item.id ===
                  review.order_id
              );

            const orderItem =
              orderItems.find(
                (item) =>
                  item.order_id ===
                    review.order_id &&
                  String(
                    item.product_id ??
                      ""
                  ) ===
                    String(
                      review.product_id ??
                        ""
                    )
              );

            return {
              ...review,

              orderNumber:
                order?.order_number ??
                "—",

              productName:
                orderItem
                  ?.product_name ??
                "VV Sarees Product",

              imageUrl:
                orderItem
                  ?.image_url ??
                "",
            };
          }
        );

      setReviews(
        formatted
      );
    } catch (error) {
      console.error(
        "Admin reviews error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Reviews load aagala."
      );

      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  /* =========================
     FILTER REVIEWS
  ========================= */

  const filteredReviews =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return reviews.filter(
        (review) => {
          const matchesSearch =
            !search ||
            review.customer_name
              .toLowerCase()
              .includes(search) ||
            review.productName
              .toLowerCase()
              .includes(search) ||
            review.orderNumber
              .toLowerCase()
              .includes(search) ||
            (
              review.review ?? ""
            )
              .toLowerCase()
              .includes(search);

          const matchesRating =
            ratingFilter ===
              "all" ||
            review.rating ===
              Number(
                ratingFilter
              );

          return (
            matchesSearch &&
            matchesRating
          );
        }
      );
    }, [
      reviews,
      searchTerm,
      ratingFilter,
    ]);

  /* =========================
     STATS
  ========================= */

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (
            total,
            review
          ) =>
            total +
            Number(
              review.rating
            ),
          0
        ) / reviews.length
      : 0;

  const fiveStarReviews =
    reviews.filter(
      (review) =>
        review.rating === 5
    ).length;

  return (
    <div className="admin-reviews-page">

      {/* HEADER */}

      <div className="admin-reviews-header">

        <div>
          <span className="admin-reviews-eyebrow">
            CUSTOMER FEEDBACK
          </span>

          <h1>
            Reviews
          </h1>

          <p>
            View ratings and
            feedback submitted
            by verified VV Sarees
            customers.
          </p>
        </div>

        <button
          type="button"
          className="admin-reviews-refresh"
          onClick={() =>
            void loadReviews()
          }
          disabled={loading}
        >
          <FiRefreshCw />

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* STATS */}

      <div className="admin-reviews-stats">

        <div className="admin-review-stat-card">
          <span>
            Total Reviews
          </span>

          <strong>
            {reviews.length}
          </strong>
        </div>

        <div className="admin-review-stat-card">
          <span>
            Average Rating
          </span>

          <strong>
            {averageRating.toFixed(
              1
            )}
          </strong>
        </div>

        <div className="admin-review-stat-card">
          <span>
            5 Star Reviews
          </span>

          <strong>
            {fiveStarReviews}
          </strong>
        </div>

      </div>

      {/* FILTER */}

      <div className="admin-reviews-toolbar">

        <div className="admin-reviews-search">
          <FiSearch />

          <input
            type="search"
            value={
              searchTerm
            }
            onChange={(
              event
            ) =>
              setSearchTerm(
                event.target
                  .value
              )
            }
            placeholder="Search customer, product or order..."
          />
        </div>

        <select
          value={
            ratingFilter
          }
          onChange={(
            event
          ) =>
            setRatingFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Ratings
          </option>

          <option value="5">
            5 Stars
          </option>

          <option value="4">
            4 Stars
          </option>

          <option value="3">
            3 Stars
          </option>

          <option value="2">
            2 Stars
          </option>

          <option value="1">
            1 Star
          </option>
        </select>

      </div>

      {/* ERROR */}

      {errorMessage && (
        <div className="admin-reviews-error">
          {errorMessage}
        </div>
      )}

      {/* CONTENT */}

      {loading ? (
        <div className="admin-reviews-empty">
          <FiMessageSquare />

          <h2>
            Loading Reviews...
          </h2>

          <p>
            Customer reviews
            Supabase-la irundhu
            load aaguthu.
          </p>
        </div>
      ) : filteredReviews.length ===
        0 ? (
        <div className="admin-reviews-empty">
          <FiMessageSquare />

          <h2>
            No Reviews Found
          </h2>

          <p>
            Customer reviews
            vandha inga
            automatically
            display aagum.
          </p>
        </div>
      ) : (
        <div className="admin-reviews-grid">

          {filteredReviews.map(
            (review) => (
              <article
                className="admin-review-card"
                key={review.id}
              >

                {/* PRODUCT */}

                <div className="admin-review-product">

                  <div className="admin-review-image">
                    {review.imageUrl ? (
                      <img
                        src={
                          review.imageUrl
                        }
                        alt={
                          review.productName
                        }
                      />
                    ) : (
                      <span>
                        VV
                      </span>
                    )}
                  </div>

                  <div>
                    <span>
                      {
                        review.orderNumber
                      }
                    </span>

                    <h2>
                      {
                        review.productName
                      }
                    </h2>
                  </div>

                </div>

                {/* CUSTOMER */}

                <div className="admin-review-customer">
                  <strong>
                    {
                      review.customer_name
                    }
                  </strong>

                  <span>
                    Verified Purchase
                  </span>
                </div>

                {/* STARS */}

                <div className="admin-review-stars">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <FiStar
                        key={star}
                        className={
                          star <=
                          review.rating
                            ? "admin-review-star-active"
                            : ""
                        }
                      />
                    )
                  )}

                  <strong>
                    {
                      review.rating
                    }
                    .0
                  </strong>
                </div>

                {/* REVIEW */}

                <p className="admin-review-text">
                  {review.review ||
                    "Customer submitted a rating without a written review."}
                </p>

                {/* DATE */}

                <div className="admin-review-footer">
                  <span>
                    {new Date(
                      review.created_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month:
                          "short",
                        year:
                          "numeric",
                      }
                    )}
                  </span>
                </div>

              </article>
            )
          )}

        </div>
      )}

    </div>
  );
}