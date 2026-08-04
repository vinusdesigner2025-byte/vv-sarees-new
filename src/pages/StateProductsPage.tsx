import { useMemo, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import LoginPopup from "../components/LoginPopup";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

import { retailProducts } from "../data/retailProducts";

import "./ProductPages.css";

const formatStateName = (stateSlug: string) =>
  stateSlug
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");

const createStateSlug = (stateName: string) =>
  stateName
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-");

export default function StateProductsPage() {
  const { state = "" } = useParams<{
    state: string;
  }>();

  const { isLoggedIn } = useAuth();

  const {
    addToWishlist,
    addToCart,
    isInWishlist,
  } = useShop();

  const [isLoginPopupOpen, setIsLoginPopupOpen] =
    useState(false);

  const [pendingAction, setPendingAction] =
    useState<(() => void) | null>(null);

  const stateName = formatStateName(state);

  const filteredProducts = useMemo(
    () =>
      retailProducts.filter(
        (product) =>
          createStateSlug(product.state) === state
      ),
    [state]
  );

  const runProtectedAction = (
    action: () => void
  ) => {
    if (isLoggedIn) {
      action();
      return;
    }

    setPendingAction(() => action);
    setIsLoginPopupOpen(true);
  };

  const handleLoginSuccess = () => {
    pendingAction?.();

    setPendingAction(null);
    setIsLoginPopupOpen(false);
  };

  const closeLoginPopup = () => {
    setPendingAction(null);
    setIsLoginPopupOpen(false);
  };

  return (
    <div className="product-page">
      <ProductHeader mode="retail" />

      <main className="collection-page">
        <section className="collection-heading">
          <span className="collection-label">
            ⌂ {stateName} Collection
          </span>

          <h1>{stateName} Sarees</h1>

          <p>
            Explore our retail sarees sourced from{" "}
            {stateName}. No minimum order.
          </p>
        </section>

        <div className="collection-toolbar">
          <span className="breadcrumb">
            <Link to="/">Home</Link>
            {" / "}
            <Link to="/retail">Retail</Link>
            {" / "}
            {stateName}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <section className="collection-empty-results">
            <h2>Collection Coming Soon</h2>

            <p>
              Retail sarees from {stateName} will
              be added soon.
            </p>

            <Link
              to="/retail"
              className="card-button"
            >
              Explore Retail Collection
            </Link>
          </section>
        ) : (
          <section className="shop-products-grid">
            {filteredProducts.map((product) => {
              const availableVariants =
                product.variants.filter(
                  (variant) => variant.stock > 0
                );

              const selectedVariant =
                availableVariants[0] ??
                product.variants[0];

              if (!selectedVariant) {
                return null;
              }

              const lowestPrice = Math.min(
                ...product.variants.map(
                  (variant) => variant.price
                )
              );

              const totalStock =
                product.variants.reduce(
                  (total, variant) =>
                    total + variant.stock,
                  0
                );

              const wishlistActive =
                isInWishlist(
                  product.id,
                  "retail"
                );

              const shopProduct = {
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: selectedVariant.price,
                rating: product.rating,
                stock: selectedVariant.stock,
                colour:
                  selectedVariant.colorName,
                image:
                  selectedVariant.images[0],
              };

              return (
                <article
                  className="shop-product-card"
                  key={product.id}
                >
                  <div className="shop-product-image">
                    <Link
                      to={`/retail/product/${product.slug}`}
                      className="shop-product-image-link"
                      aria-label={`View ${product.name}`}
                    >
                      {selectedVariant.images[0] ? (
                        <img
                          src={
                            selectedVariant.images[0]
                          }
                          alt={`${product.name} - ${selectedVariant.colorName}`}
                          className="shop-product-card-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="image-placeholder">
                          Product Image
                        </div>
                      )}
                    </Link>

                    <button
                      type="button"
                      className={`wishlist-button ${
                        wishlistActive
                          ? "wishlist-button-active"
                          : ""
                      }`}
                      onClick={() =>
                        runProtectedAction(() =>
                          addToWishlist(
                            shopProduct,
                            "retail"
                          )
                        )
                      }
                      aria-label={
                        wishlistActive
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                    >
                      <FiHeart />
                    </button>
                  </div>

                  <div className="shop-product-info">
                    <Link
                      to={`/retail/product/${product.slug}`}
                      className="shop-product-name-link"
                    >
                      <h2>{product.name}</h2>
                    </Link>

                    <span className="shop-product-colour">
                      {product.variants.length}{" "}
                      {product.variants.length === 1
                        ? "colour"
                        : "colours"}{" "}
                      available
                    </span>

                    <div className="product-rating">
                      {Array.from({
                        length: 5,
                      }).map((_, index) => (
                        <span
                          key={index}
                          className={
                            index <
                            Math.round(
                              product.rating
                            )
                              ? "product-star-active"
                              : "product-star-inactive"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <div className="product-bottom-row">
                      <strong>
                        ₹{lowestPrice}
                      </strong>

                      <button
                        type="button"
                        className="add-cart-button"
                        disabled={totalStock <= 0}
                        onClick={() =>
                          runProtectedAction(() =>
                            addToCart(
                              shopProduct,
                              "retail"
                            )
                          )
                        }
                      >
                        {totalStock > 0
                          ? "Add"
                          : "Out of Stock"}

                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <Footer />

      <LoginPopup
        isOpen={isLoginPopupOpen}
        onClose={closeLoginPopup}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}