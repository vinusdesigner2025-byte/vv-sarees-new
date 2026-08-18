import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { HiOutlineMenuAlt3 } from "react-icons/hi";

import {
  FiHeart,
  FiLogOut,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";

import logo from "../assets/VV logo.png";

import {
  useShop,
  type ShopMode,
} from "../context/ShopContext";

import { useAuth } from "../context/AuthContext";

import "./ProductHeader.css";


type ProductHeaderProps = {
  mode: ShopMode;
};


const ProductHeader = ({
  mode,
}: ProductHeaderProps) => {
  const navigate = useNavigate();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);


  const {
    wholesaleWishlistCount,
    retailWishlistCount,
    wholesaleCartCount,
    retailCartCount,
  } = useShop();


  const {
    user,
    isLoggedIn,
    isAuthLoading,
    logout,
  } = useAuth();


  const isWholesale =
    mode === "wholesale";


  const wishlistCount =
    isWholesale
      ? wholesaleWishlistCount
      : retailWishlistCount;


  const cartCount =
    isWholesale
      ? wholesaleCartCount
      : retailCartCount;


  const wishlistPath =
    isWholesale
      ? "/wholesale/wishlist"
      : "/retail/wishlist";


  const cartPath =
    isWholesale
      ? "/wholesale/cart"
      : "/retail/cart";


  const collectionPath =
    isWholesale
      ? "/wholesale"
      : "/retail";


  const collectionLabel =
    isWholesale
      ? "Wholesale Collection"
      : "Retail Collection";


  const closeMenu = () => {
    setIsMenuOpen(false);
  };


  const handleLogout =
    async () => {
      closeMenu();

      await logout();

      navigate(
        "/",
        {
          replace: true,
        }
      );
    };


  useEffect(() => {
    document.body.style.overflow =
      isMenuOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [isMenuOpen]);


  return (
    <>
      {/* =========================
          HEADER
      ========================= */}

      <header className="product-header">
        <div className="product-header-inner">

          <button
            type="button"
            className="product-menu-button"
            onClick={() =>
              setIsMenuOpen(true)
            }
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
              <h1>
                VV Sarees
              </h1>

              <span>
                {isWholesale
                  ? "Wholesale"
                  : "Retail"}
              </span>
            </div>
          </Link>


          <div className="product-header-actions">

            {/* WISHLIST */}

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


            {/* CART */}

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


{/* =========================
    SHIPPING BAR
========================= */}

<div className="product-shipping-bar">
  <div className="product-shipping-track">

    <div className="product-shipping-group">
      <span>
        🚚 FREE SHIPPING WITHIN TAMIL NADU,
        PUDUCHERRY &amp; BANGALORE
      </span>

      <span>
        🚚 FREE SHIPPING WITHIN TAMIL NADU,
        PUDUCHERRY &amp; BANGALORE
      </span>

      <span>
        🚚 FREE SHIPPING WITHIN TAMIL NADU,
        PUDUCHERRY &amp; BANGALORE
      </span>
    </div>

    <div
      className="product-shipping-group"
      aria-hidden="true"
    >
      <span>
        🚚 FREE SHIPPING WITHIN TAMIL NADU,
        PUDUCHERRY &amp; BANGALORE
      </span>

      <span>
        🚚 FREE SHIPPING WITHIN TAMIL NADU,
        PUDUCHERRY &amp; BANGALORE
      </span>

      <span>
        🚚 FREE SHIPPING WITHIN TAMIL NADU,
        PUDUCHERRY &amp; BANGALORE
      </span>
    </div>

  </div>
</div>

      {/* =========================
          OVERLAY
      ========================= */}

      <div
        className={`product-menu-overlay ${
          isMenuOpen
            ? "product-menu-overlay-open"
            : ""
        }`}
        onClick={closeMenu}
      />


      {/* =========================
          DRAWER
      ========================= */}

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
            <span>
              VV SAREES
            </span>

            <h2>
              Explore
            </h2>
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


        {/* =========================
            MENU LINKS
        ========================= */}

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


          {/* =========================
              LOGIN / ACCOUNT
          ========================= */}

          {!isAuthLoading && (
            <>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/my-account"
                    onClick={closeMenu}
                  >
                    My Account
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      void handleLogout()
                    }
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom:
                        "1px solid rgba(114, 67, 33, 0.14)",
                      background:
                        "transparent",
                      padding:
                        "20px 6px",
                      textAlign:
                        "left",
                      color:
                        "#5a2e17",
                      fontFamily:
                        "inherit",
                      fontSize:
                        "inherit",
                      cursor:
                        "pointer",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "10px",
                    }}
                  >
                    <FiLogOut />

                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              )}
            </>
          )}

        </nav>


        {/* =========================
            FOOTER
        ========================= */}

        <div className="product-menu-footer">

          {isLoggedIn &&
            user?.name && (
              <p
                style={{
                  marginBottom:
                    "10px",
                }}
              >
                Welcome,{" "}

                <strong>
                  {user.name}
                </strong>
              </p>
            )}


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