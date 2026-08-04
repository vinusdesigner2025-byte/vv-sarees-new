import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import { useShop } from "../context/ShopContext";

import "./WholesaleCart.css";

const MINIMUM_WHOLESALE_QUANTITY = 5;

export default function WholesaleCart() {
  const navigate = useNavigate();

  const {
    wholesaleCart,
    removeFromCart,
    updateCartQuantity,
  } = useShop();

  const totalQuantity = useMemo(
    () =>
      wholesaleCart.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [wholesaleCart]
  );

  const subtotal = useMemo(
    () =>
      wholesaleCart.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [wholesaleCart]
  );

  const remainingQuantity = Math.max(
    MINIMUM_WHOLESALE_QUANTITY - totalQuantity,
    0
  );

  const hasOutOfStockItem = wholesaleCart.some(
    (item) => item.stock <= 0
  );

  /* Minimum total quantity 5 irundha mattum checkout enable */
  const canCheckout =
    wholesaleCart.length > 0 &&
    totalQuantity >= MINIMUM_WHOLESALE_QUANTITY &&
    !hasOutOfStockItem;

  const updateQuantity = (
    itemId: number,
    change: number
  ) => {
    const selectedItem = wholesaleCart.find(
      (item) => item.id === itemId
    );

    if (!selectedItem) return;

    const nextQuantity =
      selectedItem.quantity + change;

    if (nextQuantity < 1) return;
    if (nextQuantity > selectedItem.stock) return;

    updateCartQuantity(
      itemId,
      nextQuantity,
      "wholesale"
    );
  };

  const removeItem = (itemId: number) => {
    removeFromCart(itemId, "wholesale");
  };

  const isEmpty = wholesaleCart.length === 0;

  return (
    <div className="wholesale-cart-page">
      <ProductHeader mode="wholesale" />

      <main className="wholesale-cart-container">
        <div className="wholesale-cart-heading">
          <span>VV SAREES</span>

          <h1>Wholesale Cart</h1>

          <p>
            Mix and match any wholesale sarees. A minimum
            of 5 sarees is required to continue to checkout.
          </p>
        </div>

        {isEmpty ? (
          <section className="wholesale-cart-empty">
            <div className="wholesale-cart-empty-icon">
              <FiShoppingBag />
            </div>

            <h2>Your Wholesale Cart is Empty</h2>

            <p>
              Explore our wholesale collection and add at
              least 5 sarees to continue.
            </p>

            <Link
              to="/wholesale"
              className="wholesale-cart-primary-button"
            >
              Continue Shopping
            </Link>
          </section>
        ) : (
          <div className="wholesale-cart-layout">
            <section className="wholesale-cart-items">
              <div className="wholesale-cart-progress-card">
                <div className="wholesale-progress-top">
                  <div>
                    <strong>
                      {totalQuantity} of{" "}
                      {MINIMUM_WHOLESALE_QUANTITY} sarees
                      added
                    </strong>

                    <span>
                      {remainingQuantity === 0
                        ? "Minimum wholesale quantity reached."
                        : `Add ${remainingQuantity} more ${
                            remainingQuantity === 1
                              ? "saree"
                              : "sarees"
                          } to unlock checkout.`}
                    </span>
                  </div>

                  <span
                    className={
                      canCheckout
                        ? "wholesale-progress-status reached"
                        : "wholesale-progress-status pending"
                    }
                  >
                    {canCheckout ? "Ready" : "Pending"}
                  </span>
                </div>

                <div className="wholesale-progress-track">
                  <span
                    style={{
                      width: `${Math.min(
                        (totalQuantity /
                          MINIMUM_WHOLESALE_QUANTITY) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {wholesaleCart.map((item) => {
                const lineTotal =
                  item.price * item.quantity;

                return (
                  <article
                    className="wholesale-cart-item"
                    key={item.id}
                  >
                    <Link
                      to={`/wholesale/product/${item.slug}`}
                      className="wholesale-cart-image-wrap"
                      aria-label={`View ${item.name}`}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="wholesale-cart-image"
                        />
                      ) : (
                        <div className="wholesale-cart-image-placeholder">
                          Product Image
                        </div>
                      )}
                    </Link>

                    <div className="wholesale-cart-item-info">
                      <div className="wholesale-cart-item-top">
                        <div>
                          <Link
                            to={`/wholesale/product/${item.slug}`}
                            className="wholesale-cart-name-link"
                          >
                            <h2>{item.name}</h2>
                          </Link>

                          {item.colour && (
                            <span>{item.colour}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="wholesale-cart-remove"
                          onClick={() =>
                            removeItem(item.id)
                          }
                          aria-label={`Remove ${item.name}`}
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <div className="wholesale-cart-stock-row">
                        <span
                          className={
                            item.stock > 0
                              ? "wholesale-cart-stock in-stock"
                              : "wholesale-cart-stock out-of-stock"
                          }
                        >
                          {item.stock > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>

                        {item.stock > 0 && (
                          <small>
                            Available: {item.stock}
                          </small>
                        )}
                      </div>

                      <div className="wholesale-cart-item-bottom">
                        <div>
                          <span className="wholesale-cart-unit-price">
                            ₹{item.price} each
                          </span>

                          <strong>₹{lineTotal}</strong>
                        </div>

                        <div className="wholesale-quantity-control">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, -1)
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <FiMinus />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, 1)
                            }
                            disabled={
                              item.quantity >= item.stock
                            }
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="wholesale-cart-summary">
              <h2>Order Summary</h2>

              <div className="wholesale-summary-row">
                <span>Total Sarees</span>
                <strong>{totalQuantity}</strong>
              </div>

              <div className="wholesale-summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="wholesale-summary-row">
                <span>Shipping</span>
                <strong>
                  Calculated at checkout
                </strong>
              </div>

              <div className="wholesale-summary-divider" />

              <div className="wholesale-summary-total">
                <span>Estimated Total</span>
                <strong>₹{subtotal}</strong>
              </div>

              {!canCheckout && (
                <div className="wholesale-checkout-warning">
                  {hasOutOfStockItem
                    ? "Remove out-of-stock items before checkout."
                    : `Add ${remainingQuantity} more ${
                        remainingQuantity === 1
                          ? "saree"
                          : "sarees"
                      } to enable checkout.`}
                </div>
              )}

              <button
                type="button"
                className="wholesale-checkout-button"
                disabled={!canCheckout}
                onClick={() => {
                  if (canCheckout) {
                    navigate("/wholesale/checkout");
                  }
                }}
              >
                {canCheckout
                  ? "Proceed to Checkout"
                  : "Minimum 5 Sarees Required"}
              </button>

              <Link
                to="/wholesale"
                className="wholesale-continue-link"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}