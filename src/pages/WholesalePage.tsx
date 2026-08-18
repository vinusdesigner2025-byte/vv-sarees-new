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
  state: string | null;
  description: string | null;
  wholesale_price: number;
  wholesale_minimum: number;
  status: string;
  product_variants:
    | ProductVariantRow[]
    | null;
};

type WholesaleVariant = {
  id: string;
  colorName: string;
  colorCode: string;
  price: number;
  stock: number;
  sku: string;
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
  wholesaleMinimum: number;
  variants: WholesaleVariant[];
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

export default function WholesalePage() {
  const { isLoggedIn } = useAuth();

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
          state,
          description,
          wholesale_price,
          wholesale_minimum,
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

    const formattedProducts: WholesaleProduct[] =
      ((data ?? []) as ProductRow[]).map(
        (product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          category:
            product.category ?? "",
          state:
            product.state ?? "",
          description:
            product.description ?? "",
          rating: 0,
          wholesaleMinimum: Number(
            product.wholesale_minimum ?? 1
          ),

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
                    product.wholesale_price ??
                      0
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
          product.category
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        const stateValue =
          product.state
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        const matchesSearch =
          !searchTerm ||
          searchableText.includes(
            searchTerm
          );

        const matchesCategory =
          filters.category === "all" ||
          categoryValue ===
            filters.category;

        const matchesState =
          filters.state === "all" ||
          stateValue === filters.state;

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
          matchesState &&
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
      <ProductHeader mode="wholesale" />

      <main className="collection-page">
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

        {isLoading ? (
          <section className="collection-empty-results">
            <h2>
              Loading Sarees...
            </h2>

            <p>
              Supabase-la irundhu
              wholesale products load
              aaguthu.
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
                    "wholesale"
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

                    <div className="shop-product-info">
                      <Link
                        to={`/wholesale/product/${product.slug}`}
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
                                product.rating
                                  ? "product-star-active"
                                  : ""
                              }
                            >
                              ★
                            </span>
                          )
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
        isOpen={isLoginPopupOpen}
        onClose={closeLoginPopup}
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    </div>
  );
}