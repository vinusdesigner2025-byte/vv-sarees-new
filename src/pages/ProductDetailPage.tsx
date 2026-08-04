import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { FaStar } from "react-icons/fa";

import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import LoginPopup from "../components/LoginPopup";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

import { supabase } from "../lib/supabase";

import "./ProductDetailPage.css";

type ProductDetailPageProps = {
  mode: "wholesale" | "retail";
};

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
  wholesale_price: number;
  wholesale_minimum: number;
  status: string;
  product_variants:
    | ProductVariantRow[]
    | null;
};

type ProductVariant = {
  id: string;
  colorName: string;
  colorCode: string;
  sku: string;
  stock: number;
  price: number;
  images: string[];
};

type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  category: string;
  fabric: string;
  state: string;
  description: string;
  rating: number;
  wholesaleMinimum: number;
  variants: ProductVariant[];
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

export default function ProductDetailPage({
  mode,
}: ProductDetailPageProps) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();

  const {
    addToWishlist,
    addToCart,
    isInWishlist,
  } = useShop();

  const [product, setProduct] =
    useState<ProductDetail | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [
    selectedVariantIndex,
    setSelectedVariantIndex,
  ] = useState(0);

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState(0);

  const [
    isLoginPopupOpen,
    setIsLoginPopupOpen,
  ] = useState(false);

  const [pendingAction, setPendingAction] =
    useState<(() => void) | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) {
        setProduct(null);
        setIsLoading(false);
        return;
      }

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
          .eq("slug", slug)
          .eq("status", "active")
          .maybeSingle();

      if (error) {
        console.error(
          "Product detail load error:",
          error
        );

        setLoadError(
          `Product load aagala: ${error.message}`
        );

        setProduct(null);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setProduct(null);
        setIsLoading(false);
        return;
      }

      const row = data as ProductRow;

      const variants =
        row.product_variants?.map(
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
              sku: variant.sku,
              stock: Number(
                variant.stock ?? 0
              ),
              price:
                mode === "wholesale"
                  ? Number(
                      row.wholesale_price ??
                        0
                    )
                  : Number(
                      row.retail_price ??
                        0
                    ),
              images: sortedImages.map(
                (image) =>
                  image.image_url
              ),
            };
          }
        ) ?? [];

      setProduct({
        id: row.id,
        slug: row.slug,
        name: row.name,
        category: row.category ?? "",
        fabric: row.category ?? "",
        state: "",
        description:
          row.description ?? "",
        rating: 0,
        wholesaleMinimum: Number(
          row.wholesale_minimum ?? 1
        ),
        variants,
      });

      setSelectedVariantIndex(0);
      setSelectedImageIndex(0);
      setIsLoading(false);
    };

    void loadProduct();
  }, [slug, mode]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;

    return (
      product.variants[
        selectedVariantIndex
      ] ?? product.variants[0] ?? null
    );
  }, [
    product,
    selectedVariantIndex,
  ]);

  const selectedImage =
    selectedVariant?.images[
      selectedImageIndex
    ] ??
    selectedVariant?.images[0] ??
    "";

  if (isLoading) {
    return (
      <div className="detail-page">
        <ProductHeader mode={mode} />

        <div className="product-not-found">
          <h1>Loading product...</h1>
          <p>
            Supabase-la irundhu product
            load aaguthu.
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="detail-page">
        <ProductHeader mode={mode} />

        <div className="product-not-found">
          <h1>
            Product load aagala
          </h1>

          <p>{loadError}</p>

          <Link to={`/${mode}`}>
            Back to {mode} collection
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="detail-page">
        <ProductHeader mode={mode} />

        <div className="product-not-found">
          <h1>Product not found</h1>

          <Link to={`/${mode}`}>
            Back to {mode} collection
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  const isInStock =
    selectedVariant.stock > 0;

  const numericProductId =
    createNumericProductId(
      product.id
    );

  const wishlistActive =
    isInWishlist(
      numericProductId,
      mode
    );

  const selectedShopProduct = {
    id: numericProductId,
    slug: product.slug,
    name: product.name,
    price: selectedVariant.price,
    rating: product.rating,
    stock: selectedVariant.stock,
    colour:
      selectedVariant.colorName,
    image:
      selectedVariant.images[0] ?? "",
  };

  const showPreviousImage = () => {
    if (
      selectedVariant.images.length === 0
    ) {
      return;
    }

    setSelectedImageIndex((current) =>
      current === 0
        ? selectedVariant.images.length -
          1
        : current - 1
    );
  };

  const showNextImage = () => {
    if (
      selectedVariant.images.length === 0
    ) {
      return;
    }

    setSelectedImageIndex((current) =>
      current ===
      selectedVariant.images.length - 1
        ? 0
        : current + 1
    );
  };

  const selectVariant = (
    index: number
  ) => {
    setSelectedVariantIndex(index);
    setSelectedImageIndex(0);
  };

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

  const handleWishlist = () => {
    runProtectedAction(() => {
      addToWishlist(
        selectedShopProduct,
        mode
      );
    });
  };

  const handleAddToCart = () => {
    if (!isInStock) return;

    runProtectedAction(() => {
      addToCart(
        selectedShopProduct,
        mode
      );
    });
  };

  const handleBuyNow = () => {
    if (!isInStock) return;

    runProtectedAction(() => {
      addToCart(
        selectedShopProduct,
        mode
      );

      navigate(
        mode === "wholesale"
          ? "/wholesale/cart"
          : "/retail/cart"
      );
    });
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

  return (
    <div className="detail-page">
      <ProductHeader mode={mode} />

      <main className="detail-container">
        <Link
          to={`/${mode}`}
          className="detail-back-link"
        >
          ← Back to {mode} collection
        </Link>

        <section className="detail-main">
          <div className="detail-gallery">
            <div className="detail-main-image-wrap">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={`${product.name} - ${selectedVariant.colorName}`}
                  className="detail-main-image"
                />
              ) : (
                <div className="image-placeholder">
                  Product Image
                </div>
              )}

              {selectedVariant.images.length >
                1 && (
                <>
                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-left"
                    onClick={
                      showPreviousImage
                    }
                    aria-label="Previous product image"
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-right"
                    onClick={
                      showNextImage
                    }
                    aria-label="Next product image"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}
            </div>

            {selectedVariant.images.length >
              0 && (
              <div className="detail-thumbnails">
                {selectedVariant.images.map(
                  (image, index) => (
                    <button
                      type="button"
                      key={`${selectedVariant.id}-${index}`}
                      className={`detail-thumbnail ${
                        selectedImageIndex ===
                        index
                          ? "detail-thumbnail-active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedImageIndex(
                          index
                        )
                      }
                    >
                      <img
                        src={image}
                        alt={`${product.name} thumbnail ${
                          index + 1
                        }`}
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="detail-info">
            <span className="detail-category">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <div className="detail-rating-row">
              <div className="detail-stars">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <FaStar
                      key={star}
                      className={
                        star <=
                        product.rating
                          ? "detail-star detail-star-active"
                          : "detail-star"
                      }
                    />
                  )
                )}
              </div>

              <span>0 Reviews</span>
            </div>

            <div className="detail-price">
              ₹{selectedVariant.price}
            </div>

            <div className="detail-stock-row">
              <span
                className={`detail-stock-badge ${
                  isInStock
                    ? "detail-in-stock"
                    : "detail-out-of-stock"
                }`}
              >
                {isInStock
                  ? "In Stock"
                  : "Out of Stock"}
              </span>

              {isInStock && (
                <span className="detail-available">
                  Available Quantity:{" "}
                  {selectedVariant.stock}
                </span>
              )}
            </div>

            <div className="detail-divider" />

            <div className="detail-colour-section">
              <div className="detail-label-row">
                <span>Colour</span>

                <strong>
                  {
                    selectedVariant.colorName
                  }
                </strong>
              </div>

              <div className="detail-colour-options">
                {product.variants.map(
                  (variant, index) => (
                    <button
                      type="button"
                      key={variant.id}
                      className={`detail-colour-option ${
                        selectedVariantIndex ===
                        index
                          ? "detail-colour-option-active"
                          : ""
                      }`}
                      onClick={() =>
                        selectVariant(index)
                      }
                      aria-label={`Select ${variant.colorName}`}
                    >
                      <span
                        className="detail-colour-swatch"
                        style={{
                          backgroundColor:
                            variant.colorCode,
                        }}
                      />

                      <span>
                        {variant.colorName}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="detail-specifications">
              <div>
                <span>Fabric</span>

                <strong>
                  {product.fabric ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>State</span>

                <strong>
                  {product.state ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>SKU</span>

                <strong>
                  {selectedVariant.sku}
                </strong>
              </div>

              <div>
                <span>Order Type</span>

                <strong>
                  {mode === "wholesale"
                    ? "Wholesale"
                    : "Retail"}
                </strong>
              </div>
            </div>

            {mode === "wholesale" && (
              <div className="detail-wholesale-note">
                Minimum wholesale
                checkout: Any{" "}
                {
                  product.wholesaleMinimum
                }{" "}
                sarees. Mix &amp; Match
                allowed.
              </div>
            )}

            <div className="detail-actions">
              <button
                type="button"
                className={`detail-wishlist-button ${
                  wishlistActive
                    ? "detail-wishlist-active"
                    : ""
                }`}
                onClick={handleWishlist}
              >
                <FiHeart />

                {wishlistActive
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
              </button>

              <button
                type="button"
                className="detail-cart-button"
                disabled={!isInStock}
                onClick={
                  handleAddToCart
                }
              >
                <FiShoppingCart />

                {isInStock
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                type="button"
                className="detail-buy-button"
                disabled={!isInStock}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>
        </section>

        <section className="detail-description-section">
          <h2>
            Product Description
          </h2>

          <p>
            {product.description ||
              "No product description added."}
          </p>
        </section>

        <section className="detail-reviews-section">
          <div className="detail-section-heading">
            <h2>
              Customer Reviews
            </h2>

            <span>0 Reviews</span>
          </div>

          <div className="detail-empty-reviews">
            <div className="detail-stars">
              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <FaStar
                    key={star}
                    className="detail-star"
                  />
                )
              )}
            </div>

            <p>No Reviews Yet</p>
          </div>
        </section>
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