import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { HiOutlineMenuAlt3 } from "react-icons/hi";
import {
  FiHeart,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";

import logo from "../assets/VV logo.png";

import {
  useShop,
  type ShopMode,
} from "../context/ShopContext";

import "./ProductHeader.css";

type ProductHeaderProps = {
  mode: ShopMode;
};

const ProductHeader = ({
  mode,
}: ProductHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const {
    wholesaleWishlistCount,
    retailWishlistCount,
    wholesaleCartCount,
    retailCartCount,
  } = useShop();

  const isWholesale = mode === "wholesale";

  const wishlistCount = isWholesale
    ? wholesaleWishlistCount
    : retailWishlistCount;

  const cartCount = isWholesale
    ? wholesaleCartCount
    : retailCartCount;

  const wishlistPath = isWholesale
    ? "/wholesale/wishlist"
    : "/retail/wishlist";

  const cartPath = isWholesale
    ? "/wholesale/cart"
    : "/retail/cart";

  const collectionPath = isWholesale
    ? "/wholesale"
    : "/retail";

  const collectionLabel = isWholesale
    ? "Wholesale Collection"
    : "Retail Collection";

  const isLoggedIn = false;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = isMenuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="product-header">
        <div className="product-header-inner">
          <button
            type="button"
            className="product-menu-button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineMenuAlt3 />
          </button>

          <Link
            to={collectionPath}
            className="product-header-brand"
            onClick={closeMenu}
          >
            <img
              src={logo}
              alt="VV Sarees Logo"
              className="product-header-logo"
            />

            <div className="product-header-brand-text">
              <h1>VV Sarees</h1>

              <span>
                {isWholesale
                  ? "Wholesale"
                  : "Retail"}
              </span>
            </div>
          </Link>

          <div className="product-header-actions">
            <Link
              to={wishlistPath}
              className="product-header-action"
              aria-label={`${mode} wishlist`}
            >
              <FiHeart />

              <span>
                {wishlistCount}
              </span>
            </Link>

            <Link
              to={cartPath}
              className="product-header-action"
              aria-label={`${mode} cart`}
            >
              <FiShoppingCart />

              <span>
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="product-shipping-bar">
        <div className="product-shipping-track">
          <div className="product-shipping-group">
            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU
              &amp; PUDUCHERRY
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU
              &amp; PUDUCHERRY
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU
              &amp; PUDUCHERRY
            </span>
          </div>

          <div
            className="product-shipping-group"
            aria-hidden="true"
          >
            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU
              &amp; PUDUCHERRY
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU
              &amp; PUDUCHERRY
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU
              &amp; PUDUCHERRY
            </span>
          </div>
        </div>
      </div>

      <div
        className={`product-menu-overlay ${
          isMenuOpen
            ? "product-menu-overlay-open"
            : ""
        }`}
        onClick={closeMenu}
      />

      <aside
        className={`product-menu-drawer ${
          isMenuOpen
            ? "product-menu-drawer-open"
            : ""
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="product-menu-drawer-top">
          <div>
            <span>VV SAREES</span>

            <h2>Explore</h2>
          </div>

          <button
            type="button"
            className="product-menu-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <nav className="product-menu-links">
          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to={collectionPath}
            onClick={closeMenu}
          >
            {collectionLabel}
          </Link>

          <Link
            to={
              isWholesale
                ? "/retail"
                : "/wholesale"
            }
            onClick={closeMenu}
          >
            {isWholesale
              ? "Retail Collection"
              : "Wholesale Collection"}
          </Link>

          <Link
            to={wishlistPath}
            onClick={closeMenu}
          >
            Wishlist ({wishlistCount})
          </Link>

          <Link
            to={cartPath}
            onClick={closeMenu}
          >
            Cart ({cartCount})
          </Link>

          <Link
            to="/track-order"
            onClick={closeMenu}
          >
            Track Order
          </Link>

          <Link
            to="/about"
            onClick={closeMenu}
          >
            About Us
          </Link>

          <Link
            to="/contact"
            onClick={closeMenu}
          >
            Contact Us
          </Link>

          {isLoggedIn ? (
            <Link
              to="/my-account"
              onClick={closeMenu}
            >
              My Account
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
            >
              Login
            </Link>
          )}
        </nav>

        <div className="product-menu-footer">
          <p>
            Premium sarees sourced directly from
            skilled weavers across India.
          </p>

          <Link
            to={collectionPath}
            className="product-menu-shop-button"
            onClick={closeMenu}
          >
            Shop{" "}
            {isWholesale
              ? "Wholesale"
              : "Retail"}
          </Link>
        </div>
      </aside>
    </>
  );
};

export default ProductHeader;