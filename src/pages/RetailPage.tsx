import {
  useEffect,
  useMemo,
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

type ProductImageRow = {
  id: string;
  image_url: string;
  display_order: number;
};

type ProductVariantRow = {
  id: string;
  colour_name: string;
  colour_code: string;
  sku: string;
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
  status: string;
  product_variants:
    | ProductVariantRow[]
    | null;
};

type RetailVariant = {
  id: string;
  colorName: string;
  colorCode: string;
  price: number;
  stock: number;
  sku: string;
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
};

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

export default function RetailPage() {
  const { isLoggedIn } = useAuth();

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

  const [pendingAction, setPendingAction] =
    useState<(() => void) | null>(null);

  const searchTerm =
    searchParams
      .get("search")
      ?.trim()
      .toLowerCase() ?? "";

  const loadProducts = async () => {
    setIsLoading(true);
    setLoadError("");

    const { data, error } =
      await supabase
        .from("products")
        .select(`
          id,
          slug,
          name,
          category,
          description,
          retail_price,
          status,
          product_variants (
            id,
            colour_name,
            colour_code,
            sku,
            stock,
            product_images (
              id,
              image_url,
              display_order
            )
          )
        `)
        .eq("status", "active")
        .order("created_at", {
          ascending: false,
        });

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

    const {
      data: reviewsData,
      error: reviewsError,
    } = await supabase
      .from("product_reviews")
      .select("product_id, rating");

    if (reviewsError) {
      console.error(
        "Product reviews load error:",
        reviewsError
      );
    }

    const reviews = reviewsData ?? [];

    const getProductReviewStats = (
      productId: string
    ) => {
      const numericProductId =
        createNumericProductId(productId);

      const productReviews = reviews.filter(
        (review) =>
          String(review.product_id) ===
          String(numericProductId)
      );

      if (productReviews.length === 0) {
        return {
          rating: 0,
          reviewCount: 0,
        };
      }

      const totalRating =
        productReviews.reduce(
          (total, review) =>
            total +
            Number(review.rating ?? 0),
          0
        );

      return {
        rating:
          totalRating /
          productReviews.length,
        reviewCount:
          productReviews.length,
      };
    };

    const formattedProducts: RetailProduct[] =
      ((data ?? []) as ProductRow[]).map(
        (product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          category:
            product.category ?? "",
          fabric:
            product.category ?? "",
          state: "",
          description:
            product.description ?? "",
          rating:
            getProductReviewStats(
              product.id
            ).rating,
          reviewCount:
            getProductReviewStats(
              product.id
            ).reviewCount,

          variants:
            product.product_variants?.map(
              (variant) => {
                const sortedImages = [
                  ...(variant.product_images ??
                    []),
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

                return {
                  id: variant.id,
                  colorName:
                    variant.colour_name,
                  colorCode:
                    variant.colour_code,
                  price: Number(
                    product.retail_price ?? 0
                  ),
                  stock: Number(
                    variant.stock ?? 0
                  ),
                  sku: variant.sku,
                  images: sortedImages.map(
                    (image) =>
                      image.image_url
                  ),
                };
              }
            ) ?? [],
        })
      );

    setProducts(formattedProducts);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadProducts();
  }, []);

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
    setIsLoginPopupOpen(false);
    setPendingAction(null);
  };

  const filteredProducts = useMemo(() => {
    const matchingProducts =
      products.filter((product) => {
        const firstVariant =
          product.variants[0];

        if (!firstVariant) {
          return false;
        }

        const lowestPrice = Math.min(
          ...product.variants.map(
            (variant) => variant.price
          )
        );

        const highestStock = Math.max(
          ...product.variants.map(
            (variant) => variant.stock
          )
        );

        const searchableText = [
          product.name,
          product.category,
          product.fabric,
          product.state,
          product.description,
          ...product.variants.map(
            (variant) =>
              variant.colorName
          ),
        ]
          .join(" ")
          .toLowerCase();

        const categoryValue =
          product.fabric
            .toLowerCase()
            .replace(/\s+/g, "-");

        const matchesSearch =
          !searchTerm ||
          searchableText.includes(
            searchTerm
          );

        const matchesCategory =
          filters.category === "all" ||
          categoryValue ===
            filters.category;

        const matchesMinimumPrice =
          lowestPrice >=
          filters.minPrice;

        const matchesMaximumPrice =
          lowestPrice <=
          filters.maxPrice;

        const matchesRating =
          product.rating >=
          filters.minimumRating;

        const matchesStock =
          !filters.inStockOnly ||
          highestStock > 0;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesMinimumPrice &&
          matchesMaximumPrice &&
          matchesRating &&
          matchesStock
        );
      });

    return [...matchingProducts].sort(
      (firstProduct, secondProduct) => {
        const firstPrice = Math.min(
          ...firstProduct.variants.map(
            (variant) => variant.price
          )
        );

        const secondPrice = Math.min(
          ...secondProduct.variants.map(
            (variant) => variant.price
          )
        );

        if (
          filters.sortBy ===
          "price-low"
        ) {
          return firstPrice - secondPrice;
        }

        if (
          filters.sortBy ===
          "price-high"
        ) {
          return secondPrice - firstPrice;
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

  return (
    <div className="product-page">
      <ProductHeader mode="retail" />

      <main className="collection-page">
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

        {isLoading ? (
          <section className="collection-empty-results">
            <h2>
              Loading Sarees...
            </h2>

            <p>
              Supabase-la irundhu
              products load aaguthu.
            </p>
          </section>
        ) : loadError ? (
          <section className="collection-empty-results">
            <h2>
              Products Load Aagala
            </h2>

            <p>{loadError}</p>

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
          <section className="collection-empty-results">
            <h2>
              No Sarees Found
            </h2>

            <p>
              Try changing the category,
              price, rating or stock
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
          <section className="shop-products-grid">
            {filteredProducts.map(
              (product) => {
                const selectedVariant =
                  product.variants[0];

                const lowestPrice =
                  Math.min(
                    ...product.variants.map(
                      (variant) =>
                        variant.price
                    )
                  );

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
                  slug: product.slug,
                  name: product.name,
                  price: lowestPrice,
                  rating:
                    product.rating,
                  stock: totalStock,
                  colour:
                    selectedVariant
                      .colorName,
                  image:
                    selectedVariant
                      .images[0] ?? "",
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

                    <div className="shop-product-info">
                      <Link
                        to={`/retail/product/${product.slug}`}
                        className="shop-product-name-link"
                      >
                        <h2>
                          {product.name}
                        </h2>
                      </Link>

                      <span className="shop-product-colour">
                        {
                          product.variants
                            .length
                        }{" "}
                        colour
                        {product.variants
                          .length === 1
                          ? ""
                          : "s"}{" "}
                        available
                      </span>

                      <div className="product-rating">
                        {Array.from({
                          length: 5,
                        }).map(
                          (_, index) => (
                            <span
                              key={index}
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

                        {product.reviewCount > 0 && (
                          <span className="product-rating-count">
                            {product.rating.toFixed(1)} ({product.reviewCount})
                          </span>
                        )}
                      </div>

                      <div className="product-bottom-row">
                        <strong>
                          ₹{lowestPrice}
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
        isOpen={isLoginPopupOpen}
        onClose={closeLoginPopup}
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    </div>
  );
}