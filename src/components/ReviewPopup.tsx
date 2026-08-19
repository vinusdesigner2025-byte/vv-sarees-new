import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheck,
  FiStar,
  FiX,
} from "react-icons/fi";

import { supabase } from "../lib/supabase";

import "./ReviewPopup.css";

type DeliveredOrder = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  email: string | null;
  order_status: string | null;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string | null;
  image_url: string | null;
};

type ProductReview = {
  id: string;
  order_id: string | null;
  product_id: string | null;
  user_id: string | null;
};

type PendingReviewItem = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
};

const LATER_STORAGE_KEY =
  "vv-review-popup-later";

export default function ReviewPopup() {
  const [loading, setLoading] =
    useState(true);

  const [
    pendingItems,
    setPendingItems,
  ] = useState<PendingReviewItem[]>([]);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [rating, setRating] =
    useState(0);

  const [
    hoverRating,
    setHoverRating,
  ] = useState(0);

  const [review, setReview] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const currentItem =
    pendingItems[currentIndex] ?? null;

  const shouldHideOnCurrentPage =
    useMemo(() => {
      const pathname =
        window.location.pathname;

      return (
        pathname.startsWith("/admin") ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname ===
          "/forgot-password" ||
        pathname ===
          "/reset-password"
      );
    }, []);

  useEffect(() => {
    if (shouldHideOnCurrentPage) {
      setLoading(false);
      return;
    }

    const dismissedThisSession =
      sessionStorage.getItem(
        LATER_STORAGE_KEY
      );

    if (
      dismissedThisSession === "true"
    ) {
      setLoading(false);
      return;
    }

    void loadPendingReviews();
  }, [shouldHideOnCurrentPage]);

  const loadPendingReviews =
    async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        /* =========================
           GET LOGGED-IN USER
        ========================= */

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          console.error(
            "Review popup user error:",
            userError
          );

          setPendingItems([]);
          return;
        }

        const user =
          userData.user;

        if (!user || !user.email) {
          setPendingItems([]);
          return;
        }

        /* =========================
           GET DELIVERED ORDERS
        ========================= */

        const {
          data: ordersData,
          error: ordersError,
        } = await supabase
          .from("orders")
          .select(
            `
              id,
              order_number,
              customer_name,
              email,
              order_status
            `
          )
          .eq(
            "email",
            user.email
          )
          .ilike(
            "order_status",
            "delivered"
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (ordersError) {
          console.error(
            "Review popup orders error:",
            ordersError
          );

          setPendingItems([]);
          return;
        }

        const deliveredOrders =
          (ordersData ??
            []) as DeliveredOrder[];

        if (
          deliveredOrders.length === 0
        ) {
          setPendingItems([]);
          return;
        }

        const orderIds =
          deliveredOrders.map(
            (order) => order.id
          );

        /* =========================
           GET ORDER ITEMS
        ========================= */

        const {
          data: itemsData,
          error: itemsError,
        } = await supabase
          .from("order_items")
          .select(
            `
              id,
              order_id,
              product_id,
              product_name,
              image_url
            `
          )
          .in(
            "order_id",
            orderIds
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

        if (itemsError) {
          console.error(
            "Review popup items error:",
            itemsError
          );

          setPendingItems([]);
          return;
        }

        const orderItems =
          (itemsData ??
            []) as OrderItem[];

        if (
          orderItems.length === 0
        ) {
          setPendingItems([]);
          return;
        }

        /* =========================
           GET ALL REVIEWS BY USER
        ========================= */

        const {
          data: reviewsData,
          error: reviewsError,
        } = await supabase
          .from("product_reviews")
          .select(
            `
              id,
              order_id,
              product_id,
              user_id
            `
          )
          .eq(
            "user_id",
            user.id
          );

        if (reviewsError) {
          console.error(
            "Review popup reviews error:",
            reviewsError
          );

          setPendingItems([]);
          return;
        }

        const existingReviews =
          (reviewsData ??
            []) as ProductReview[];

        /* =========================
           BUILD UNIQUE PENDING ITEMS
        ========================= */

        const seenProductIds =
          new Set<string>();

        const pending:
          PendingReviewItem[] = [];

        orderItems.forEach(
          (item) => {
            if (!item.product_id) {
              return;
            }

            const productId =
              String(
                item.product_id
              );

            /* already reviewed by this user */
            const alreadyReviewed =
              existingReviews.some(
                (reviewRow) =>
                  String(
                    reviewRow.product_id
                  ) === productId
              );

            if (alreadyReviewed) {
              return;
            }

            /* same product may exist in multiple delivered orders */
            if (
              seenProductIds.has(
                productId
              )
            ) {
              return;
            }

            seenProductIds.add(
              productId
            );

            const order =
              deliveredOrders.find(
                (orderRow) =>
                  orderRow.id ===
                  item.order_id
              );

            pending.push({
              orderId:
                item.order_id,

              orderNumber:
                order?.order_number ??
                "VV Sarees Order",

              customerName:
                order?.customer_name ??
                user.user_metadata
                  ?.full_name ??
                user.user_metadata
                  ?.name ??
                "Customer",

              productId,

              productName:
                item.product_name ??
                "VV Sarees Product",

              imageUrl:
                item.image_url,
            });
          }
        );

        setPendingItems(
          pending
        );

        setCurrentIndex(0);
      } catch (error) {
        console.error(
          "Review popup unexpected error:",
          error
        );

        setPendingItems([]);
      } finally {
        setLoading(false);
      }
    };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setReview("");
    setErrorMessage("");
    setSubmitted(false);
  };

  const moveToNextProduct = () => {
    const nextIndex =
      currentIndex + 1;

    if (
      nextIndex <
      pendingItems.length
    ) {
      setCurrentIndex(
        nextIndex
      );

      resetForm();
      return;
    }

    setPendingItems([]);
    setCurrentIndex(0);
  };

  const handleSubmit =
    async () => {
      if (!currentItem) {
        return;
      }

      if (rating < 1) {
        setErrorMessage(
          "Please select a star rating."
        );
        return;
      }

      try {
        setSubmitting(true);
        setErrorMessage("");

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (
          userError ||
          !userData.user
        ) {
          setErrorMessage(
            "Please login again to submit your review."
          );

          return;
        }

        const user =
          userData.user;

        /* =========================
           SAFETY CHECK
           Same user + same product
        ========================= */

        const {
          data: existingReview,
          error:
            existingReviewError,
        } = await supabase
          .from("product_reviews")
          .select("id")
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "product_id",
            currentItem.productId
          )
          .maybeSingle();

        if (
          existingReviewError
        ) {
          console.error(
            "Existing review check error:",
            existingReviewError
          );

          setErrorMessage(
            "Unable to check existing review."
          );

          return;
        }

        if (existingReview) {
          setErrorMessage(
            "You have already reviewed this product."
          );

          window.setTimeout(
            () => {
              moveToNextProduct();
            },
            900
          );

          return;
        }

        /* =========================
           INSERT REVIEW
        ========================= */

        const {
          error: insertError,
        } = await supabase
          .from(
            "product_reviews"
          )
          .insert({
            user_id:
              user.id,

            order_id:
              currentItem.orderId,

            product_id:
              currentItem.productId,

            customer_name:
              currentItem.customerName,

            rating,

            review:
              review.trim() ||
              null,
          });

        if (insertError) {
          console.error(
            "Review insert error:",
            insertError
          );

          setErrorMessage(
            insertError.message
          );

          return;
        }

        setSubmitted(true);

        window.setTimeout(
          () => {
            moveToNextProduct();
          },
          1200
        );
      } catch (error) {
        console.error(
          "Submit review error:",
          error
        );

        setErrorMessage(
          "Unable to submit your review. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleMaybeLater =
    () => {
      sessionStorage.setItem(
        LATER_STORAGE_KEY,
        "true"
      );

      setPendingItems([]);
    };

  if (
    loading ||
    !currentItem ||
    shouldHideOnCurrentPage
  ) {
    return null;
  }

  const totalProducts =
    pendingItems.length;

  const productNumber =
    currentIndex + 1;

  return (
    <div
      className="review-popup-overlay"
      role="presentation"
    >
      <div
        className="review-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-popup-title"
      >
        <button
          type="button"
          className="review-popup-close"
          onClick={
            handleMaybeLater
          }
          aria-label="Close review popup"
        >
          <FiX />
        </button>

        {submitted ? (
          <div className="review-popup-success">
            <span className="review-success-icon">
              <FiCheck />
            </span>

            <span className="review-popup-tag">
              THANK YOU
            </span>

            <h2>
              Review Submitted
            </h2>

            <p>
              Thank you for sharing
              your experience with
              VV Sarees.
            </p>
          </div>
        ) : (
          <>
            <div className="review-popup-heading">
              <span className="review-popup-tag">
                VV SAREES
              </span>

              <h2
                id="review-popup-title"
              >
                How Was Your Purchase?
              </h2>

              <p>
                Your order has been
                delivered. We&apos;d
                love to hear what you
                think.
              </p>
            </div>

            <div className="review-product-card">
              <div className="review-product-image">
                {currentItem.imageUrl ? (
                  <img
                    src={
                      currentItem.imageUrl
                    }
                    alt={
                      currentItem.productName
                    }
                  />
                ) : (
                  <div className="review-image-placeholder">
                    VV
                  </div>
                )}
              </div>

              <div className="review-product-details">
                <span>
                  {
                    currentItem.orderNumber
                  }
                </span>

                <h3>
                  {
                    currentItem.productName
                  }
                </h3>

                {totalProducts >
                  1 && (
                  <small>
                    Product{" "}
                    {productNumber} of{" "}
                    {totalProducts}
                  </small>
                )}
              </div>
            </div>

            <div className="review-rating-section">
              <span>
                Rate this product
              </span>

              <div
                className="review-stars"
                aria-label="Product rating"
              >
                {[
                  1,
                  2,
                  3,
                  4,
                  5,
                ].map(
                  (star) => {
                    const active =
                      star <=
                      (hoverRating ||
                        rating);

                    return (
                      <button
                        key={
                          star
                        }
                        type="button"
                        className={`review-star-button ${
                          active
                            ? "review-star-active"
                            : ""
                        }`}
                        onMouseEnter={() =>
                          setHoverRating(
                            star
                          )
                        }
                        onMouseLeave={() =>
                          setHoverRating(
                            0
                          )
                        }
                        onClick={() => {
                          setRating(
                            star
                          );

                          setErrorMessage(
                            ""
                          );
                        }}
                        aria-label={`${star} star rating`}
                      >
                        <FiStar />
                      </button>
                    );
                  }
                )}
              </div>

              {rating > 0 && (
                <small className="review-rating-label">
                  {rating === 1 &&
                    "Poor"}
                  {rating === 2 &&
                    "Fair"}
                  {rating === 3 &&
                    "Good"}
                  {rating === 4 &&
                    "Very Good"}
                  {rating === 5 &&
                    "Excellent"}
                </small>
              )}
            </div>

            <label className="review-textarea-wrap">
              <span>
                Write a review
                <small>
                  {" "}
                  (optional)
                </small>
              </span>

              <textarea
                value={review}
                onChange={(
                  event
                ) =>
                  setReview(
                    event.target
                      .value
                  )
                }
                rows={4}
                maxLength={600}
                placeholder="Tell us what you liked about your saree..."
              />

              <small className="review-character-count">
                {review.length}/600
              </small>
            </label>

            {errorMessage && (
              <div className="review-popup-error">
                {errorMessage}
              </div>
            )}

            <div className="review-popup-actions">
              <button
                type="button"
                className="review-later-button"
                onClick={
                  handleMaybeLater
                }
                disabled={
                  submitting
                }
              >
                Maybe Later
              </button>

              <button
                type="button"
                className="review-submit-button"
                onClick={
                  handleSubmit
                }
                disabled={
                  submitting
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Review"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}