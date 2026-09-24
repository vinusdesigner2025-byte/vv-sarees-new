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
  description: string | null;
  retail_price: number;

  product_variants:
    | ProductVariantRow[]
    | null;
};

type RetailVariant = {
  id: string;
  colorName: string;
  price: number;
  stock: number;
  images: string[];
};

type RetailProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  fabric: string;
  state: string;
  description: string;

  rating: number;
  reviewCount: number;

  variants: RetailVariant[];

  /*
    Pre-calculated values.

    This prevents React from repeatedly calculating
    price / stock / search text every render.
  */
  lowestPrice: number;
  totalStock: number;
  searchableText: string;
  categoryValue: string;
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

/*
  Product review IDs are requested in smaller batches.

  This prevents one extremely long Supabase URL if the
  shop later contains hundreds of products.
*/
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
   PAGE
   ===================================================== */

export default function RetailPage() {
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
    useState<RetailProduct[]>([]);

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
    Used to ignore an older Supabase response
    when a newer request has already started.
  */
  const requestIdRef =
    useRef(0);

  const searchTerm =
    searchParams
      .get("search")
      ?.trim()
      .toLowerCase() ?? "";

  /* =====================================================
     LOAD REVIEW RATINGS

     IMPORTANT:
     Products DO NOT wait for reviews anymore.

     Products appear first.
     Ratings update quietly afterwards.
     ===================================================== */

  const loadReviewStats = async (
    loadedProducts: RetailProduct[],
    requestId: number
  ) => {
    if (
      loadedProducts.length === 0
    ) {
      return;
    }

    const productIds =
      loadedProducts.map(
        (product) =>
          String(
            createNumericProductId(
              product.id
            )
          )
      );

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
        Ignore stale result.
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
              "Product reviews load error:",
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
        Map structure:

        productId =>
        {
          totalRating,
          count
        }

        This is much faster than filtering the
        entire reviews array for every product.
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
        Update only rating fields.

        Product images/cards are already visible
        at this point.
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
        "Retail review stats error:",
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
          Only fetch fields actually needed
          on the Retail listing page.

          Removed:
          - status from select
          - colour_code
          - sku
          - image id

          This reduces Supabase response size.
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
            description,
            retail_price,

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
          A newer request started.
          Ignore this old response.
        */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        if (error) {
          console.error(
            "Retail products load error:",
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
          RetailProduct[] =
          (
            (data ?? []) as ProductRow[]
          ).map(
            (product) => {
              const variants:
                RetailVariant[] =
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
                      Retail card only needs the
                      FIRST image for each colour.

                      We do not keep every image in
                      React memory on the listing page.
                    */
                    const firstImage =
                      sortedImages[0]
                        ?.image_url ??
                      "";

                    return {
                      id: variant.id,

                      colorName:
                        variant.colour_name,

                      price: Number(
                        product.retail_price ??
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
                      product.retail_price ??
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

              const fabric =
                product.category ??
                "";

              const state = "";

              /*
                Build search string once.

                Earlier this was rebuilt every time
                user touched a filter.
              */
              const searchableText =
                [
                  product.name,
                  product.category,
                  fabric,
                  state,
                  product.description ??
                    "",
                  ...variants.map(
                    (variant) =>
                      variant.colorName
                  ),
                ]
                  .join(" ")
                  .toLowerCase();

              const categoryValue =
                fabric
                  .toLowerCase()
                  .replace(
                    /\s+/g,
                    "-"
                  );

              return {
                id: product.id,

                slug:
                  product.slug,

                name:
                  product.name,

                category:
                  product.category ??
                  "",

                fabric,

                state,

                description:
                  product.description ??
                  "",

                /*
                  Reviews load separately.
                  So products don't wait.
                */
                rating: 0,

                reviewCount: 0,

                variants,

                lowestPrice,

                totalStock,

                searchableText,

                categoryValue,
              };
            }
          );

        /*
          SHOW PRODUCTS IMMEDIATELY.

          This is the important change.
        */
        setProducts(
          formattedProducts
        );

        setIsLoading(false);

        /*
          Ratings are secondary information.

          Fetch them AFTER cards are already visible.
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
          "Retail products unexpected error:",
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
     FIRST PAGE LOAD
     ===================================================== */

  useEffect(() => {
    void loadProducts();

    return () => {
      /*
        Invalidate pending requests when
        user leaves Retail page.
      */
      requestIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =====================================================
     LOGIN PROTECTED ACTION
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
            /*
              Products without variants cannot
              currently be added to cart.
            */
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
              product.totalStock > 0;

            return (
              matchesSearch &&
              matchesCategory &&
              matchesMinimumPrice &&
              matchesMaximumPrice &&
              matchesRating &&
              matchesStock
            );
          }
        );

      /*
        Sorting is now based on pre-calculated
        values instead of recalculating Math.min()
        for every comparison.
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
      <ProductHeader mode="retail" />

      <main className="collection-page">
        {/* =========================
            PAGE HEADING
            ========================= */}

        <section className="collection-heading">
          <span className="collection-label">
            ⌂ Retail Collection
          </span>

          <h1>
            Beautiful sarees for every
            occasion
          </h1>

          <p>
            Shop premium sarees for
            weddings, festivals and
            everyday elegance. No minimum
            order.
          </p>
        </section>

        {/* =========================
            TOOLBAR
            ========================= */}

        <div className="collection-toolbar">
          <div>
            <span className="breadcrumb">
              Home / Retail
            </span>

            {searchTerm && (
              <small className="collection-search-text">
                Search results for:
                “{searchTerm}”
              </small>
            )}
          </div>

          <ProductFilter
            mode="retail"
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
              Products load
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
             EMPTY RESULTS
             ========================= */

          <section className="collection-empty-results">
            <h2>
              No Sarees Found
            </h2>

            <p>
              Try changing the
              category, price, rating
              or stock filters.
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
                    "retail"
                  );

                const shopProduct = {
                  id: numericProductId,

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
                        PRODUCT IMAGE
                        ================= */}

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
                            alt={
                              product.name
                            }
                            className="shop-product-card-image"

                            /*
                              First few visible products load
                              immediately.

                              All remaining product images wait
                              until user scrolls near them.
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

                    {/* =================
                        PRODUCT INFO
                        ================= */}

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
                                  "retail"
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