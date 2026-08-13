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

import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const {
    user,
    isLoggedIn,
    isAuthLoading,
    logout,
  } = useAuth();

  const {
    retailWishlist,
    retailCart,
  } = useShop();

  const wishlistCount =
    retailWishlist.length;

  const cartCount =
    retailCart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout =
    async () => {
      closeMenu();

      await logout();

      navigate("/", {
        replace: true,
      });
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

      <header className="home-header">
        <div className="home-header-inner">

          <button
            type="button"
            className="home-menu-button"
            onClick={() =>
              setIsMenuOpen(true)
            }
            aria-label="Open menu"
          >
            <HiOutlineMenuAlt3 />
          </button>

          <Link
            to="/"
            className="home-header-brand"
            onClick={closeMenu}
          >
            <img
              src={logo}
              alt="VV Sarees Logo"
              className="home-header-logo"
            />

            <h1>
              VV Sarees
            </h1>
          </Link>

          <div className="home-header-actions">

            {/* WISHLIST */}

            <Link
              to="/retail/wishlist"
              className="home-header-action"
              aria-label="Retail wishlist"
            >
              <FiHeart />

              <span>
                {wishlistCount}
              </span>
            </Link>

            {/* CART */}

            <Link
              to="/retail/cart"
              className="home-header-action"
              aria-label="Retail cart"
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

      <div className="shipping-bar">
        <div className="shipping-track">

          <div className="shipping-group">
            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU &amp; PUDUCHERRY
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU &amp; PUDUCHERRY
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU &amp; PUDUCHERRY
            </span>
          </div>

          <div
            className="shipping-group"
            aria-hidden="true"
          >
            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU &amp; PUDUCHERRY
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU &amp; PUDUCHERRY
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN TAMIL NADU &amp; PUDUCHERRY
            </span>
          </div>

        </div>
      </div>


      {/* =========================
          OVERLAY
      ========================= */}

      <div
        className={`home-menu-overlay ${
          isMenuOpen
            ? "home-menu-overlay-open"
            : ""
        }`}
        onClick={closeMenu}
      />


      {/* =========================
          MOBILE DRAWER
      ========================= */}

      <aside
        className={`home-menu-drawer ${
          isMenuOpen
            ? "home-menu-drawer-open"
            : ""
        }`}
        aria-hidden={!isMenuOpen}
      >

        <div className="home-menu-drawer-top">

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
            className="home-menu-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <FiX />
          </button>

        </div>


        {/* =========================
            MENU LINKS
        ========================= */}

        <nav className="home-menu-links">

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/retail"
            onClick={closeMenu}
          >
            Retail Collection
          </Link>

          <Link
            to="/wholesale"
            onClick={closeMenu}
          >
            Wholesale Collection
          </Link>

          <Link
            to="/retail/wishlist"
            onClick={closeMenu}
          >
            Wishlist ({wishlistCount})
          </Link>

          <Link
            to="/retail/cart"
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

        <div className="home-menu-footer">

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
            Premium sarees sourced directly
            from skilled weavers across India.
          </p>

          <Link
            to="/retail"
            className="home-menu-shop-button"
            onClick={closeMenu}
          >
            Shop Retail
          </Link>

        </div>

      </aside>
    </>
  );
};

export default Header;