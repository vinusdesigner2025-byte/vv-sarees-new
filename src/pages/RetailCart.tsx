import { useMemo } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import {
  useShop,
  type ProductId,
} from "../context/ShopContext";

import "./RetailCart.css";

export default function RetailCart() {
  const navigate =
    useNavigate();

  const {
    retailCart,
    removeFromCart,
    updateCartQuantity,
  } = useShop();

  const totalQuantity =
    useMemo(
      () =>
        retailCart.reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,
          0
        ),
      [retailCart]
    );

  const subtotal =
    useMemo(
      () =>
        retailCart.reduce(
          (
            total,
            item
          ) =>
            total +
            item.price *
              item.quantity,
          0
        ),
      [retailCart]
    );

  const hasOutOfStockItem =
    retailCart.some(
      (item) =>
        item.stock <= 0
    );

  const canCheckout =
    retailCart.length > 0 &&
    totalQuantity >= 1 &&
    !hasOutOfStockItem;

  const updateQuantity = (
    itemId: ProductId,
    change: number
  ) => {
    const selectedItem =
      retailCart.find(
        (item) =>
          item.id === itemId
      );

    if (!selectedItem) {
      return;
    }

    const nextQuantity =
      selectedItem.quantity +
      change;

    updateCartQuantity(
      itemId,
      nextQuantity,
      "retail"
    );
  };

  const isEmpty =
    retailCart.length === 0;

  return (
    <div>
      <ProductHeader mode="retail" />

      <main className="retail-cart-container">
        <div className="retail-cart-heading">
          <span>
            VV SAREES
          </span>

          <h1>
            Retail Cart
          </h1>

          <p>
            Review your selected sarees and proceed to
            checkout whenever you&apos;re ready.
          </p>
        </div>

        {isEmpty ? (
          <section className="retail-cart-empty">
            <div className="retail-cart-empty-icon">
              <FiShoppingBag />
            </div>

            <h2>
              Your Retail Cart is Empty
            </h2>

            <p>
              Explore our retail collection and add your
              favourite sarees to continue.
            </p>

            <Link
              to="/retail"
              className="retail-cart-primary-button"
            >
              Continue Shopping
            </Link>
          </section>
        ) : (
          <div className="retail-cart-layout">
            <section className="retail-cart-items">
              {retailCart.map(
                (item) => {
                  const lineTotal =
                    item.price *
                    item.quantity;

                  return (
                    <article
                      className="retail-cart-item"
                      key={item.id}
                    >
                      <Link
                        to={`/retail/product/${item.slug}`}
                        className="retail-cart-image-wrap"
                        aria-label={`View ${item.name}`}
                      >
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                            className="retail-cart-image"
                          />
                        ) : (
                          <div className="retail-cart-image-placeholder">
                            Product Image
                          </div>
                        )}
                      </Link>

                      <div className="retail-cart-item-info">
                        <div className="retail-cart-item-top">
                          <div>
                            <Link
                              to={`/retail/product/${item.slug}`}
                              className="retail-cart-name-link"
                            >
                              <h2>
                                {
                                  item.name
                                }
                              </h2>
                            </Link>

                            {item.colour && (
                              <span>
                                {
                                  item.colour
                                }
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="retail-cart-remove"
                            onClick={() =>
                              removeFromCart(
                                item.id,
                                "retail"
                              )
                            }
                            aria-label={`Remove ${item.name}`}
                          >
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="retail-cart-stock-row">
                          <span
                            className={
                              item.stock >
                              0
                                ? "retail-cart-stock in-stock"
                                : "retail-cart-stock out-of-stock"
                            }
                          >
                            {item.stock >
                            0
                              ? "In Stock"
                              : "Out of Stock"}
                          </span>

                          {item.stock >
                            0 && (
                            <small>
                              Available:{" "}
                              {
                                item.stock
                              }
                            </small>
                          )}
                        </div>

                        <div className="retail-cart-item-bottom">
                          <div>
                            <span className="retail-cart-unit-price">
                              ₹
                              {
                                item.price
                              }{" "}
                              each
                            </span>

                            <strong>
                              ₹
                              {
                                lineTotal
                              }
                            </strong>
                          </div>

                          <div className="retail-quantity-control">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  -1
                                )
                              }
                              disabled={
                                item.quantity <=
                                1
                              }
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              <FiMinus />
                            </button>

                            <span>
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  1
                                )
                              }
                              disabled={
                                item.quantity >=
                                item.stock
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
                }
              )}
            </section>

            <aside className="retail-cart-summary">
              <h2>
                Order Summary
              </h2>

              <div className="retail-summary-row">
                <span>
                  Products
                </span>

                <strong>
                  {
                    retailCart.length
                  }
                </strong>
              </div>

              <div className="retail-summary-row">
                <span>
                  Total Quantity
                </span>

                <strong>
                  {
                    totalQuantity
                  }
                </strong>
              </div>

              <div className="retail-summary-row">
                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {
                    subtotal
                  }
                </strong>
              </div>

              <div className="retail-summary-row">
                <span>
                  Shipping
                </span>

                <strong>
                  Calculated at checkout
                </strong>
              </div>

              <div className="retail-summary-divider" />

              <div className="retail-summary-total">
                <span>
                  Estimated Total
                </span>

                <strong>
                  ₹
                  {
                    subtotal
                  }
                </strong>
              </div>

              {!canCheckout && (
                <div className="retail-checkout-warning">
                  {hasOutOfStockItem
                    ? "Remove out-of-stock items before checkout."
                    : "Add at least one product to enable checkout."}
                </div>
              )}

              <button
                type="button"
                className="retail-checkout-button"
                disabled={
                  !canCheckout
                }
                onClick={() =>
                  navigate(
                    "/retail/checkout"
                  )
                }
              >
                {canCheckout
                  ? "Proceed to Checkout"
                  : "Cart is Empty"}
              </button>

              <Link
                to="/retail"
                className="retail-continue-link"
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