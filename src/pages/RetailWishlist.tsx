import { Link } from "react-router-dom";

import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import {
  useShop,
  type ProductId,
} from "../context/ShopContext";

import "./RetailWishlist.css";

export default function RetailWishlist() {
  const {
    retailWishlist,
    addToCart,
    removeFromWishlist,
  } = useShop();

  const isEmpty =
    retailWishlist.length === 0;

  const handleMoveToCart = (
    productId: ProductId
  ) => {
    const selectedProduct =
      retailWishlist.find(
        (item) =>
          item.id === productId
      );

    if (!selectedProduct) {
      return;
    }

    addToCart(
      selectedProduct,
      "retail"
    );

    removeFromWishlist(
      productId,
      "retail"
    );
  };

  const handleMoveAllToCart =
    () => {
      retailWishlist.forEach(
        (product) => {
          addToCart(
            product,
            "retail"
          );
        }
      );

      retailWishlist.forEach(
        (product) => {
          removeFromWishlist(
            product.id,
            "retail"
          );
        }
      );
    };

  return (
    <div>
      <ProductHeader mode="retail" />

      <main className="retail-wishlist-container">
        <div className="retail-wishlist-heading">
          <span>
            VV SAREES
          </span>

          <h1>
            Retail Wishlist
          </h1>

          <p>
            Save your favourite sarees and move them to your
            cart whenever you&apos;re ready.
          </p>
        </div>

        {isEmpty ? (
          <section className="retail-wishlist-empty">
            <div className="retail-wishlist-empty-icon">
              <FiHeart />
            </div>

            <h2>
              Your Wishlist is Empty
            </h2>

            <p>
              Explore our retail collection and save the
              sarees you love.
            </p>

            <Link
              to="/retail"
              className="retail-wishlist-primary-button"
            >
              Continue Shopping
            </Link>
          </section>
        ) : (
          <>
            <div className="retail-wishlist-summary">
              <div>
                <strong>
                  {
                    retailWishlist.length
                  }{" "}
                  {retailWishlist.length ===
                  1
                    ? "Item"
                    : "Items"}
                </strong>

                <span>
                  Retail orders have no minimum quantity.
                </span>
              </div>

              <button
                type="button"
                className="retail-wishlist-move-all"
                onClick={
                  handleMoveAllToCart
                }
              >
                <FiShoppingCart />
                Move All to Cart
              </button>
            </div>

            <section className="retail-wishlist-grid">
              {retailWishlist.map(
                (item) => {
                  const isInStock =
                    item.stock > 0;

                  return (
                    <article
                      className="retail-wishlist-card"
                      key={item.id}
                    >
                      <Link
                        to={`/retail/product/${item.slug}`}
                        className="retail-wishlist-image-wrap"
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
                            className="retail-wishlist-image"
                          />
                        ) : (
                          <div className="retail-wishlist-image-placeholder">
                            Product Image
                          </div>
                        )}
                      </Link>

                      <div className="retail-wishlist-info">
                        <div className="retail-wishlist-top-row">
                          <div>
                            <Link
                              to={`/retail/product/${item.slug}`}
                              className="retail-wishlist-name-link"
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
                            className="retail-wishlist-remove-button"
                            onClick={() =>
                              removeFromWishlist(
                                item.id,
                                "retail"
                              )
                            }
                            aria-label={`Remove ${item.name}`}
                          >
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="retail-wishlist-stars">
                          {[
                            1,
                            2,
                            3,
                            4,
                            5,
                          ].map(
                            (star) => (
                              <span
                                key={
                                  star
                                }
                                className={
                                  star <=
                                  item.rating
                                    ? "retail-wishlist-star-active"
                                    : ""
                                }
                              >
                                ★
                              </span>
                            )
                          )}
                        </div>

                        <strong className="retail-wishlist-price">
                          ₹
                          {
                            item.price
                          }
                        </strong>

                        <div className="retail-wishlist-stock-row">
                          <span
                            className={
                              isInStock
                                ? "retail-wishlist-stock retail-in-stock"
                                : "retail-wishlist-stock retail-out-of-stock"
                            }
                          >
                            {isInStock
                              ? "In Stock"
                              : "Out of Stock"}
                          </span>

                          {isInStock && (
                            <small>
                              Available:{" "}
                              {
                                item.stock
                              }
                            </small>
                          )}
                        </div>

                        <button
                          type="button"
                          className="retail-wishlist-cart-button"
                          onClick={() =>
                            handleMoveToCart(
                              item.id
                            )
                          }
                          disabled={
                            !isInStock
                          }
                        >
                          <FiShoppingCart />

                          {isInStock
                            ? "Move to Cart"
                            : "Out of Stock"}
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}