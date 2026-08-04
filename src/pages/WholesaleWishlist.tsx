import { Link } from "react-router-dom";

import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import { useShop } from "../context/ShopContext";

import "./WholesaleWishlist.css";

export default function WholesaleWishlist() {
  const {
    wholesaleWishlist,
    addToCart,
    removeFromWishlist,
  } = useShop();

  const isEmpty = wholesaleWishlist.length === 0;

  const handleMoveToCart = (productId: number) => {
    const selectedProduct = wholesaleWishlist.find(
      (item) => item.id === productId
    );

    if (!selectedProduct || selectedProduct.stock <= 0) {
      return;
    }

    addToCart(selectedProduct, "wholesale");
    removeFromWishlist(productId, "wholesale");
  };

  const handleMoveAllToCart = () => {
    wholesaleWishlist.forEach((product) => {
      if (product.stock > 0) {
        addToCart(product, "wholesale");
        removeFromWishlist(
          product.id,
          "wholesale"
        );
      }
    });
  };

  return (
    <div className="wishlist-page">
      <ProductHeader mode="wholesale" />

      <main className="wishlist-container">
        <div className="wishlist-heading">
          <span>VV SAREES</span>

          <h1>Wholesale Wishlist</h1>

          <p>
            Save your favourite wholesale sarees and move
            them to your cart whenever you&apos;re ready.
          </p>
        </div>

        {isEmpty ? (
          <section className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <FiHeart />
            </div>

            <h2>Your Wishlist is Empty</h2>

            <p>
              Explore our wholesale collection and save the
              sarees you love.
            </p>

            <Link
              to="/wholesale"
              className="wishlist-primary-button"
            >
              Continue Shopping
            </Link>
          </section>
        ) : (
          <>
            <div className="wishlist-summary">
              <div>
                <strong>
                  {wholesaleWishlist.length}{" "}
                  {wholesaleWishlist.length === 1
                    ? "Item"
                    : "Items"}
                </strong>

                <span>
                  Minimum wholesale checkout: Any 5 sarees
                </span>
              </div>

              <button
                type="button"
                className="wishlist-move-all"
                onClick={handleMoveAllToCart}
              >
                <FiShoppingCart />
                Move All to Cart
              </button>
            </div>

            <section className="wishlist-grid">
              {wholesaleWishlist.map((item) => {
                const isInStock = item.stock > 0;

                return (
                  <article
                    className="wishlist-card"
                    key={item.id}
                  >
                    <Link
                      to={`/wholesale/product/${item.slug}`}
                      className="wishlist-image-wrap"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="wishlist-product-image"
                        />
                      ) : (
                        <div className="wishlist-image-placeholder">
                          Product Image
                        </div>
                      )}
                    </Link>

                    <div className="wishlist-info">
                      <div className="wishlist-top-row">
                        <div>
                          <h2>{item.name}</h2>

                          {item.colour && (
                            <span>{item.colour}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="wishlist-remove-button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() =>
                            removeFromWishlist(
                              item.id,
                              "wholesale"
                            )
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <div className="wishlist-stars">
                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <span
                              key={star}
                              className={
                                star <= item.rating
                                  ? "wishlist-star-active"
                                  : ""
                              }
                            >
                              ★
                            </span>
                          )
                        )}
                      </div>

                      <strong className="wishlist-price">
                        ₹{item.price}
                      </strong>

                      <div className="wishlist-stock-row">
                        <span
                          className={
                            isInStock
                              ? "wishlist-stock in-stock"
                              : "wishlist-stock out-of-stock"
                          }
                        >
                          {isInStock
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>

                        {isInStock && (
                          <small>
                            Available: {item.stock}
                          </small>
                        )}
                      </div>

                      <button
                        type="button"
                        className="wishlist-cart-button"
                        disabled={!isInStock}
                        onClick={() =>
                          handleMoveToCart(item.id)
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
              })}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}