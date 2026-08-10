import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

import { supabase } from "../lib/supabase";

import "./ProductPages.css";

/* =========================
   TYPES
========================= */

type ProductImageRow = {
  image_url: string;
  display_order: number | null;
};

type ProductVariantRow = {
  id: string;
  colour_name: string | null;
  colour_code: string | null;
  sku: string | null;
  stock: number | null;

  product_images:
    | ProductImageRow[]
    | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  state: string | null;
  retail_price: number | null;
  status: string | null;

  product_variants:
    | ProductVariantRow[]
    | null;
};

type DisplayVariant = {
  id: string;
  colorName: string;
  colorCode: string;
  sku: string;
  stock: number;
  images: string[];
};

type DisplayProduct = {
  id: string;
  slug: string;
  name: string;
  state: string;
  retailPrice: number;
  rating: number;
  variants: DisplayVariant[];
};

/* =========================
   STATE HELPERS
========================= */

const formatStateName = (
  stateSlug: string
) =>
  decodeURIComponent(stateSlug)
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");

const createStateSlug = (
  stateName: string
) =>
  stateName
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-");

/* =========================
   COMPONENT
========================= */

export default function StateProductsPage() {
  const { state = "" } = useParams<{
    state: string;
  }>();

  const { isLoggedIn } =
    useAuth();

  const {
    addToWishlist,
    addToCart,
    isInWishlist,
  } = useShop();

  /* =========================
     STATES
  ========================= */

  const [
    products,
    setProducts,
  ] = useState<DisplayProduct[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    isLoginPopupOpen,
    setIsLoginPopupOpen,
  ] = useState(false);

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<(() => void) | null>(
      null
    );

  const stateName =
    formatStateName(state);

  /* =========================
     LOAD PRODUCTS
     FROM SUPABASE
  ========================= */

  useEffect(() => {
    const loadStateProducts =
      async () => {
        try {
          setIsLoading(true);
          setLoadError("");

          const {
            data,
            error,
          } =
            await supabase
              .from("products")
              .select(`
                id,
                slug,
                name,
                state,
                retail_price,
                status,
                product_variants (
                  id,
                  colour_name,
                  colour_code,
                  sku,
                  stock,
                  product_images (
                    image_url,
                    display_order
                  )
                )
              `)
              .eq(
                "status",
                "active"
              );

          if (error) {
            console.error(
              "State products load error:",
              error
            );

            setLoadError(
              error.message
            );

            setProducts([]);

            return;
          }

          const rows =
            (data ??
              []) as ProductRow[];

          /* =========================
             TEMP DEBUG
          ========================= */

          console.log(
            "SUPABASE STATE PRODUCTS:",
            rows
          );

          console.log(
            "CURRENT STATE URL:",
            state
          );

          console.log(
            "CURRENT STATE NAME:",
            stateName
          );

          /* =========================
             FORMAT SUPABASE DATA
          ========================= */

          const formatted =
            rows.map<DisplayProduct>(
              (product) => {
                const variants =
                  (
                    product.product_variants ??
                    []
                  ).map(
                    (variant) => {
                      const sortedImages =
                        [
                          ...(variant.product_images ??
                            []),
                        ].sort(
                          (
                            first,
                            second
                          ) =>
                            Number(
                              first.display_order ??
                                0
                            ) -
                            Number(
                              second.display_order ??
                                0
                            )
                        );

                      return {
                        id:
                          variant.id,

                        colorName:
                          variant.colour_name ??
                          "",

                        colorCode:
                          variant.colour_code ??
                          "",

                        sku:
                          variant.sku ??
                          "",

                        stock:
                          Number(
                            variant.stock ??
                              0
                          ),

                        images:
                          sortedImages.map(
                            (image) =>
                              image.image_url
                          ),
                      };
                    }
                  );

                return {
                  id:
                    product.id,

                  slug:
                    product.slug,

                  name:
                    product.name,

                  state:
                    product.state ??
                    "",

                  retailPrice:
                    Number(
                      product.retail_price ??
                        0
                    ),

                  rating: 0,

                  variants,
                };
              }
            );

          console.log(
            "FORMATTED PRODUCTS:",
            formatted
          );

          setProducts(
            formatted
          );
        } catch (error) {
          console.error(
            "Unexpected state product error:",
            error
          );

          setLoadError(
            "Products load panna mudiyala."
          );

          setProducts([]);
        } finally {
          setIsLoading(
            false
          );
        }
      };

    void loadStateProducts();
  }, [state, stateName]);

  /* =========================
     FILTER CURRENT STATE
  ========================= */

  const filteredProducts =
    useMemo(() => {
      const filtered =
        products.filter(
          (product) =>
            createStateSlug(
              product.state
            ) === state
        );

      console.log(
        "FILTERED STATE PRODUCTS:",
        filtered
      );

      return filtered;
    }, [
      products,
      state,
    ]);

  /* =========================
     LOGIN PROTECTION
  ========================= */

  const runProtectedAction = (
    action: () => void
  ) => {
    if (isLoggedIn) {
      action();

      return;
    }

    setPendingAction(
      () => action
    );

    setIsLoginPopupOpen(
      true
    );
  };

  const handleLoginSuccess =
    () => {
      pendingAction?.();

      setPendingAction(
        null
      );

      setIsLoginPopupOpen(
        false
      );
    };

  const closeLoginPopup =
    () => {
      setPendingAction(
        null
      );

      setIsLoginPopupOpen(
        false
      );
    };

  /* =========================
     UI
  ========================= */

  return (
    <div>
      <ProductHeader mode="retail" />

      <main className="collection-page">

        {/* =========================
            PAGE HEADING
        ========================= */}

        <section className="collection-heading">
          <span className="collection-label">
            ⌂ {stateName} Collection
          </span>

          <h1>
            {stateName} Sarees
          </h1>

          <p>
            Explore our retail sarees
            sourced from{" "}
            {stateName}. No minimum
            order.
          </p>
        </section>

        {/* =========================
            BREADCRUMB
        ========================= */}

        <div className="collection-toolbar">
          <span className="breadcrumb">

            <Link to="/">
              Home
            </Link>

            {" / "}

            <Link to="/retail">
              Retail
            </Link>

            {" / "}

            {stateName}

          </span>
        </div>

        {/* =========================
            LOADING
        ========================= */}

        {isLoading ? (
          <section className="collection-empty-results">

            <h2>
              Loading Collection...
            </h2>

            <p>
              {stateName} sarees
              load aaguthu.
            </p>

          </section>
        ) : loadError ? (

          /* =========================
             ERROR
          ========================= */

          <section className="collection-empty-results">

            <h2>
              Collection load aagala
            </h2>

            <p>
              {loadError}
            </p>

          </section>

        ) : filteredProducts.length ===
          0 ? (

          /* =========================
             NO PRODUCTS
          ========================= */

          <section className="collection-empty-results">

            <h2>
              Collection Coming Soon
            </h2>

            <p>
              Retail sarees from{" "}
              {stateName} will be
              added soon.
            </p>

            <Link
              to="/retail"
              className="card-button"
            >
              Explore Retail Collection
            </Link>

          </section>

        ) : (

          /* =========================
             REAL SUPABASE PRODUCTS
          ========================= */

          <section className="shop-products-grid">

            {filteredProducts.map(
              (product) => {

                const availableVariants =
                  product.variants.filter(
                    (variant) =>
                      variant.stock >
                      0
                  );

                const selectedVariant =
                  availableVariants[0] ??
                  product.variants[0];

                if (
                  !selectedVariant
                ) {
                  return null;
                }

                const totalStock =
                  product.variants.reduce(
                    (
                      total,
                      variant
                    ) =>
                      total +
                      variant.stock,
                    0
                  );

                const wishlistActive =
                  isInWishlist(
                    product.id,
                    "retail"
                  );

                const shopProduct = {
                  id:
                    product.id,

                  slug:
                    product.slug,

                  name:
                    product.name,

                  price:
                    product.retailPrice,

                  rating:
                    product.rating,

                  stock:
                    selectedVariant.stock,

                  colour:
                    selectedVariant.colorName,

                  image:
                    selectedVariant
                      .images[0] ??
                    "",
                };

                return (
                  <article
                    className="shop-product-card"
                    key={
                      product.id
                    }
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="shop-product-image">

                      <Link
                        to={`/retail/product/${product.slug}`}
                        className="shop-product-image-link"
                        aria-label={`View ${product.name}`}
                      >

                        {selectedVariant
                          .images[0] ? (

                          <img
                            src={
                              selectedVariant
                                .images[0]
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

                      {/* WISHLIST */}

                      <button
                        type="button"
                        className={`wishlist-button ${
                          wishlistActive
                            ? "wishlist-button-active"
                            : ""
                        }`}
                        onClick={() =>
                          runProtectedAction(
                            () =>
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

                    {/* PRODUCT INFO */}

                    <div className="shop-product-info">

                      <Link
                        to={`/retail/product/${product.slug}`}
                        className="shop-product-name-link"
                      >
                        <h2>
                          {
                            product.name
                          }
                        </h2>
                      </Link>

                      {/* COLOURS */}

                      <span className="shop-product-colour">

                        {
                          product
                            .variants
                            .length
                        }{" "}

                        {product
                          .variants
                          .length ===
                        1
                          ? "colour"
                          : "colours"}{" "}

                        available

                      </span>

                      {/* RATING */}

                      <div className="product-rating">

                        {Array.from({
                          length: 5,
                        }).map(
                          (
                            _,
                            index
                          ) => (
                            <span
                              key={
                                index
                              }
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
                          )
                        )}

                      </div>

                      {/* PRICE + CART */}

                      <div className="product-bottom-row">

                        <strong>
                          ₹
                          {
                            product.retailPrice
                          }
                        </strong>

                        <button
                          type="button"
                          className="add-cart-button"
                          disabled={
                            totalStock <=
                            0
                          }
                          onClick={() =>
                            runProtectedAction(
                              () =>
                                addToCart(
                                  shopProduct,
                                  "retail"
                                )
                            )
                          }
                        >

                          {totalStock >
                          0
                            ? "Add"
                            : "Out of Stock"}

                          <FiShoppingCart />

                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

      </main>

      <Footer />

      <LoginPopup
        isOpen={
          isLoginPopupOpen
        }
        onClose={
          closeLoginPopup
        }
        onLoginSuccess={
          handleLoginSuccess
        }
      />

    </div>
  );
}