import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";

import ProductFilter, {
  defaultFilters,
  type ProductFilterValues,
} from "../components/ProductFilter";

import LoginPopup from "../components/LoginPopup";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

import { supabase } from "../lib/supabase";

import "./ProductPages.css";

/* =====================================================
   TYPES
   ===================================================== */

type ProductImageRow = {
  image_url: string;
  display_order: number;
};

type ProductVariantRow = {
  id: string;
  colour_name: string;
  stock: number;

  product_images:
    | ProductImageRow[]
    | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  state: string | null;
  description: string | null;
  wholesale_price: number;
  wholesale_minimum: number;

  product_variants:
    | ProductVariantRow[]
    | null;
};

type WholesaleVariant = {
  id: string;
  colorName: string;
  price: number;
  stock: number;
  images: string[];
};

type WholesaleProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  state: string;
  description: string;

  rating: number;
  reviewCount: number;

  wholesaleMinimum: number;

  variants: WholesaleVariant[];

  /*
    PRE-CALCULATED VALUES

    Filter / sorting time-la same calculations
    thirumba thirumba panna thevai illa.
  */
  lowestPrice: number;
  totalStock: number;
  highestStock: number;

  searchableText: string;
  categoryValue: string;
  stateValue: string;
};

type ReviewRow = {
  product_id: string | number;
  rating: number;
};

/* =====================================================
   HELPERS
   ===================================================== */

const createNumericProductId = (
  productId: string
) => {
  return productId
    .split("")
    .reduce(
      (total, character) =>
        (
          total * 31 +
          character.charCodeAt(0)
        ) >>> 0,
      0
    );
};

const normalizeFilterValue = (
  value: string
) => {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
};

const splitIntoChunks = <T,>(
  values: T[],
  size: number
): T[][] => {
  const chunks: T[][] = [];

  for (
    let index = 0;
    index < values.length;
    index += size
  ) {
    chunks.push(
      values.slice(
        index,
        index + size
      )
    );
  }

  return chunks;
};

/* =====================================================
   WHOLESALE PAGE
   ===================================================== */

export default function WholesalePage() {
  const { isLoggedIn } =
    useAuth();

  const {
    addToWishlist,
    addToCart,
    isInWishlist,
  } = useShop();

  const [searchParams] =
    useSearchParams();

  const [products, setProducts] =
    useState<WholesaleProduct[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [filters, setFilters] =
    useState<ProductFilterValues>({
      ...defaultFilters,
    });

  const [
    isLoginPopupOpen,
    setIsLoginPopupOpen,
  ] = useState(false);

  const [
    pendingAction,
    setPendingAction,
  ] = useState<
    (() => void) | null
  >(null);

  /*
    Prevent old Supabase responses from
    replacing newer data.
  */
  const requestIdRef =
    useRef(0);

  const searchTerm =
    searchParams
      .get("search")
      ?.trim()
      .toLowerCase() ?? "";

  /* =====================================================
     LOAD REVIEWS SEPARATELY
     ===================================================== */

  const loadReviewStats = async (
    loadedProducts: WholesaleProduct[],
    requestId: number
  ) => {
    if (
      loadedProducts.length === 0
    ) {
      return;
    }

    /*
      Only request reviews belonging to
      products currently in Wholesale page.
    */
    const productIds =
      loadedProducts.map(
        (product) =>
          createNumericProductId(
            product.id
          )
      );

    /*
      Avoid one very long Supabase URL
      if product count increases later.
    */
    const chunks =
      splitIntoChunks(
        productIds,
        60
      );

    try {
      const results =
        await Promise.all(
          chunks.map(
            (chunk) =>
              supabase
                .from(
                  "product_reviews"
                )
                .select(
                  "product_id, rating"
                )
                .in(
                  "product_id",
                  chunk
                )
          )
        );

      /*
        User already refreshed / left page.
      */
      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      const reviews: ReviewRow[] =
        [];

      results.forEach(
        (result) => {
          if (result.error) {
            console.error(
              "Wholesale reviews load error:",
              result.error
            );

            return;
          }

          if (result.data) {
            reviews.push(
              ...(
                result.data as ReviewRow[]
              )
            );
          }
        }
      );

      /*
        Build rating data ONCE.

        Old version did reviews.filter()
        separately for every product.
      */
      const reviewMap =
        new Map<
          string,
          {
            totalRating: number;
            count: number;
          }
        >();

      reviews.forEach(
        (review) => {
          const key =
            String(
              review.product_id
            );

          const current =
            reviewMap.get(key) ?? {
              totalRating: 0,
              count: 0,
            };

          current.totalRating +=
            Number(
              review.rating ?? 0
            );

          current.count += 1;

          reviewMap.set(
            key,
            current
          );
        }
      );

      /*
        Update ratings AFTER products
        are already visible.
      */
      setProducts(
        (currentProducts) =>
          currentProducts.map(
            (product) => {
              const numericId =
                String(
                  createNumericProductId(
                    product.id
                  )
                );

              const stats =
                reviewMap.get(
                  numericId
                );

              if (
                !stats ||
                stats.count === 0
              ) {
                return {
                  ...product,
                  rating: 0,
                  reviewCount: 0,
                };
              }

              return {
                ...product,

                rating:
                  stats.totalRating /
                  stats.count,

                reviewCount:
                  stats.count,
              };
            }
          )
      );
    } catch (error) {
      console.error(
        "Wholesale review stats error:",
        error
      );
    }
  };

  /* =====================================================
     LOAD PRODUCTS
     ===================================================== */

  const loadProducts =
    async () => {
      const requestId =
        ++requestIdRef.current;

      setIsLoading(true);
      setLoadError("");

      try {
        /*
          Fetch only the information required
          for Wholesale collection cards.

          Removed:
          - status from select
          - colour_code
          - sku
          - image id
        */
        const {
          data,
          error,
        } = await supabase
          .from("products")
          .select(`
            id,
            slug,
            name,
            category,
            state,
            description,
            wholesale_price,
            wholesale_minimum,

            product_variants (
              id,
              colour_name,
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
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        /*
          Ignore stale result.
        */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        if (error) {
          console.error(
            "Wholesale products load error:",
            error
          );

          setLoadError(
            `Products load aagala: ${error.message}`
          );

          setProducts([]);
          setIsLoading(false);

          return;
        }

        /* =================================================
           FORMAT PRODUCTS
           ================================================= */

        const formattedProducts:
          WholesaleProduct[] =
          (
            (data ?? []) as ProductRow[]
          ).map(
            (product) => {
              const variants:
                WholesaleVariant[] =
                (
                  product
                    .product_variants ??
                  []
                ).map(
                  (variant) => {
                    const sortedImages =
                      [
                        ...(
                          variant.product_images ??
                          []
                        ),
                      ].sort(
                        (
                          firstImage,
                          secondImage
                        ) =>
                          Number(
                            firstImage.display_order ??
                              0
                          ) -
                          Number(
                            secondImage.display_order ??
                              0
                          )
                      );

                    /*
                      Wholesale collection card only
                      needs the FIRST image.

                      Remaining images are loaded only
                      inside Product Detail page.
                    */
                    const firstImage =
                      sortedImages[0]
                        ?.image_url ??
                      "";

                    return {
                      id:
                        variant.id,

                      colorName:
                        variant.colour_name,

                      price: Number(
                        product.wholesale_price ??
                          0
                      ),

                      stock: Number(
                        variant.stock ??
                          0
                      ),

                      images:
                        firstImage
                          ? [
                              firstImage,
                            ]
                          : [],
                    };
                  }
                );

              const prices =
                variants.map(
                  (variant) =>
                    variant.price
                );

              const lowestPrice =
                prices.length > 0
                  ? Math.min(
                      ...prices
                    )
                  : Number(
                      product.wholesale_price ??
                        0
                    );

              const totalStock =
                variants.reduce(
                  (
                    total,
                    variant
                  ) =>
                    total +
                    variant.stock,
                  0
                );

              const stocks =
                variants.map(
                  (variant) =>
                    variant.stock
                );

              const highestStock =
                stocks.length > 0
                  ? Math.max(
                      ...stocks
                    )
                  : 0;

              const category =
                product.category ??
                "";

              const state =
                product.state ??
                "";

              const description =
                product.description ??
                "";

              /*
                Search text is generated only ONCE.
              */
              const searchableText =
                [
                  product.name,
                  category,
                  state,
                  description,

                  ...variants.map(
                    (variant) =>
                      variant.colorName
                  ),
                ]
                  .join(" ")
                  .toLowerCase();

              const categoryValue =
                normalizeFilterValue(
                  category
                );

              const stateValue =
                normalizeFilterValue(
                  state
                );

              return {
                id:
                  product.id,

                slug:
                  product.slug,

                name:
                  product.name,

                category,

                state,

                description,

                rating: 0,

                reviewCount: 0,

                wholesaleMinimum:
                  Number(
                    product.wholesale_minimum ??
                      1
                  ),

                variants,

                lowestPrice,

                totalStock,

                highestStock,

                searchableText,

                categoryValue,

                stateValue,
              };
            }
          );

        /*
          IMPORTANT:

          Products become visible immediately.

          We DO NOT wait for reviews anymore.
        */
        setProducts(
          formattedProducts
        );

        setIsLoading(false);

        /*
          Ratings load quietly afterwards.
        */
        window.setTimeout(
          () => {
            void loadReviewStats(
              formattedProducts,
              requestId
            );
          },
          150
        );
      } catch (error) {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        console.error(
          "Wholesale products unexpected error:",
          error
        );

        setLoadError(
          "Products load pannumbodhu unexpected error vandhudhu."
        );

        setProducts([]);
        setIsLoading(false);
      }
    };

  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  useEffect(() => {
    void loadProducts();

    return () => {
      /*
        Invalidate pending async work when
        page is left.
      */
      requestIdRef.current += 1;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =====================================================
     LOGIN PROTECTION
     ===================================================== */

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

      setPendingAction(null);

      setIsLoginPopupOpen(
        false
      );
    };

  const closeLoginPopup =
    () => {
      setIsLoginPopupOpen(
        false
      );

      setPendingAction(null);
    };

  /* =====================================================
     FILTER + SORT
     ===================================================== */

  const filteredProducts =
    useMemo(() => {
      const matchingProducts =
        products.filter(
          (product) => {
            if (
              product.variants
                .length === 0
            ) {
              return false;
            }

            const matchesSearch =
              !searchTerm ||
              product.searchableText.includes(
                searchTerm
              );

            const matchesCategory =
              filters.category ===
                "all" ||
              product.categoryValue ===
                filters.category;

            const matchesState =
              filters.state ===
                "all" ||
              product.stateValue ===
                filters.state;

            const matchesMinimumPrice =
              product.lowestPrice >=
              filters.minPrice;

            const matchesMaximumPrice =
              product.lowestPrice <=
              filters.maxPrice;

            const matchesRating =
              product.rating >=
              filters.minimumRating;

            const matchesStock =
              !filters.inStockOnly ||
              product.highestStock >
                0;

            return (
              matchesSearch &&
              matchesCategory &&
              matchesState &&
              matchesMinimumPrice &&
              matchesMaximumPrice &&
              matchesRating &&
              matchesStock
            );
          }
        );

      /*
        Uses pre-calculated prices.
      */
      return [
        ...matchingProducts,
      ].sort(
        (
          firstProduct,
          secondProduct
        ) => {
          if (
            filters.sortBy ===
            "price-low"
          ) {
            return (
              firstProduct.lowestPrice -
              secondProduct.lowestPrice
            );
          }

          if (
            filters.sortBy ===
            "price-high"
          ) {
            return (
              secondProduct.lowestPrice -
              firstProduct.lowestPrice
            );
          }

          if (
            filters.sortBy ===
            "rating-high"
          ) {
            return (
              secondProduct.rating -
              firstProduct.rating
            );
          }

          return 0;
        }
      );
    }, [
      products,
      filters,
      searchTerm,
    ]);

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="product-page">
      <ProductHeader mode="wholesale" />

      <main className="collection-page">
        {/* =========================
            HEADING
            ========================= */}

        <section className="collection-heading">
          <span className="collection-label">
            ⌂ Wholesale Collection
          </span>

          <h1>
            Premium wholesale sarees for
            boutiques
          </h1>

          <p>
            Choose any sarees you like.
            Minimum wholesale checkout is
            5 sarees. Mix &amp; Match
            allowed.
          </p>
        </section>

        {/* =========================
            TOOLBAR
            ========================= */}

        <div className="collection-toolbar">
          <div>
            <span className="breadcrumb">
              Home / Wholesale
            </span>

            {searchTerm && (
              <small className="collection-search-text">
                Search results for:
                “{searchTerm}”
              </small>
            )}
          </div>

          <ProductFilter
            mode="wholesale"
            value={filters}
            onChange={setFilters}
          />
        </div>

        {/* =========================
            LOADING
            ========================= */}

        {isLoading ? (
          <section className="collection-empty-results">
            <h2>
              Loading Sarees...
            </h2>

            <p>
              Wholesale products load
              aaguthu...
            </p>
          </section>
        ) : loadError ? (
          /* =========================
             ERROR
             ========================= */

          <section className="collection-empty-results">
            <h2>
              Products Load Aagala
            </h2>

            <p>
              {loadError}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadProducts()
              }
            >
              Try Again
            </button>
          </section>
        ) : filteredProducts.length ===
          0 ? (
          /* =========================
             EMPTY
             ========================= */

          <section className="collection-empty-results">
            <h2>
              No Sarees Found
            </h2>

            <p>
              Try changing the category,
              state, price, rating or stock
              filters.
            </p>

            <button
              type="button"
              onClick={() =>
                setFilters({
                  ...defaultFilters,
                })
              }
            >
              Clear Filters
            </button>
          </section>
        ) : (
          /* =========================
             PRODUCT GRID
             ========================= */

          <section className="shop-products-grid">
            {filteredProducts.map(
              (
                product,
                productIndex
              ) => {
                const selectedVariant =
                  product
                    .variants[0];

                const numericProductId =
                  createNumericProductId(
                    product.id
                  );

                const wishlistActive =
                  isInWishlist(
                    numericProductId,
                    "wholesale"
                  );

                const shopProduct = {
                  id:
                    numericProductId,

                  slug:
                    product.slug,

                  name:
                    product.name,

                  price:
                    product.lowestPrice,

                  rating:
                    product.rating,

                  stock:
                    product.totalStock,

                  colour:
                    selectedVariant
                      .colorName,

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
                    {/* =================
                        IMAGE
                        ================= */}

                    <div className="shop-product-image">
                      <Link
                        to={`/wholesale/product/${product.slug}`}
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
                            alt={
                              product.name
                            }
                            className="shop-product-card-image"

                            /*
                              First row loads immediately.

                              Products lower on page only load
                              as customer scrolls down.
                            */
                            loading={
                              productIndex <
                              4
                                ? "eager"
                                : "lazy"
                            }

                            decoding="async"
                          />
                        ) : (
                          <div className="image-placeholder">
                            Product Image
                          </div>
                        )}
                      </Link>

                      {/* =================
                          WISHLIST
                          ================= */}

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
                                "wholesale"
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

                    {/* =================
                        INFO
                        ================= */}

                    <div className="shop-product-info">
                      <Link
                        to={`/wholesale/product/${product.slug}`}
                        className="shop-product-name-link"
                      >
                        <h2>
                          {
                            product.name
                          }
                        </h2>
                      </Link>

                      <span className="shop-product-colour">
                        {
                          product
                            .variants
                            .length
                        }{" "}
                        colour
                        {product
                          .variants
                          .length ===
                        1
                          ? ""
                          : "s"}{" "}
                        available
                      </span>

                      {/* =================
                          RATING
                          ================= */}

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
                                  : ""
                              }
                            >
                              ★
                            </span>
                          )
                        )}

                        {product.reviewCount >
                          0 && (
                          <span className="product-rating-count">
                            {product.rating.toFixed(
                              1
                            )}{" "}
                            (
                            {
                              product.reviewCount
                            }
                            )
                          </span>
                        )}
                      </div>

                      {/* =================
                          PRICE + CART
                          ================= */}

                      <div className="product-bottom-row">
                        <strong>
                          ₹
                          {
                            product.lowestPrice
                          }
                        </strong>

                        <button
                          type="button"
                          className="add-cart-button"
                          disabled={
                            selectedVariant.stock <=
                            0
                          }
                          onClick={() =>
                            runProtectedAction(
                              () =>
                                addToCart(
                                  shopProduct,
                                  "wholesale"
                                )
                            )
                          }
                        >
                          {selectedVariant.stock >
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