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

  const goToLogin = (
    redirectTo?: string
  ) => {
    closeMenu();

    navigate(
      "/login",
      {
        state: redirectTo
          ? {
              redirectTo,
            }
          : undefined,
      }
    );
  };

  const handleMenuClick = () => {
    if (isAuthLoading) {
      return;
    }

    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    setIsMenuOpen(true);
  };

  const handleWishlistClick = () => {
    if (isAuthLoading) {
      return;
    }

    if (!isLoggedIn) {
      goToLogin(
        "/retail/wishlist"
      );

      return;
    }

    navigate(
      "/retail/wishlist"
    );
  };

  const handleCartClick = () => {
    if (isAuthLoading) {
      return;
    }

    if (!isLoggedIn) {
      goToLogin(
        "/retail/cart"
      );

      return;
    }

    navigate(
      "/retail/cart"
    );
  };

  const handleWholesaleClick = () => {
    if (isAuthLoading) {
      return;
    }

    closeMenu();

    if (!isLoggedIn) {
      navigate(
        "/login",
        {
          state: {
            redirectTo:
              "/wholesale-login",
          },
        }
      );

      return;
    }

    navigate(
      "/wholesale-login"
    );
  };

  const handleDrawerWishlistClick =
    () => {
      closeMenu();
      navigate(
        "/retail/wishlist"
      );
    };

  const handleDrawerCartClick =
    () => {
      closeMenu();
      navigate(
        "/retail/cart"
      );
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

      <header className="home-header">
        <div className="home-header-inner">

          {/* HAMBURGER */}

          <button
            type="button"
            className="home-menu-button"
            onClick={
              handleMenuClick
            }
            aria-label="Open menu"
            disabled={
              isAuthLoading
            }
          >
            <HiOutlineMenuAlt3 />
          </button>

          {/* LOGO */}

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

            <button
              type="button"
              className="home-header-action"
              aria-label="Retail wishlist"
              onClick={
                handleWishlistClick
              }
              disabled={
                isAuthLoading
              }
            >
              <FiHeart />

              <span>
                {wishlistCount}
              </span>
            </button>

            {/* CART */}

            <button
              type="button"
              className="home-header-action"
              aria-label="Retail cart"
              onClick={
                handleCartClick
              }
              disabled={
                isAuthLoading
              }
            >
              <FiShoppingCart />

              <span>
                {cartCount}
              </span>
            </button>

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
            className="shipping-group"
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
        aria-hidden={
          !isMenuOpen
        }
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

          {/* WHOLESALE */}

          <button
            type="button"
            onClick={
              handleWholesaleClick
            }
            style={{
              width:
                "100%",

              border:
                "none",

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
            }}
          >
            Wholesale Collection
          </button>

          {/* WISHLIST */}

          <button
            type="button"
            onClick={
              handleDrawerWishlistClick
            }
            style={{
              width:
                "100%",

              border:
                "none",

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
            }}
          >
            Wishlist ({wishlistCount})
          </button>

          {/* CART */}

          <button
            type="button"
            onClick={
              handleDrawerCartClick
            }
            style={{
              width:
                "100%",

              border:
                "none",

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
            }}
          >
            Cart ({cartCount})
          </button>

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
              ACCOUNT
          ========================= */}

          {!isAuthLoading &&
            isLoggedIn && (
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
                    width:
                      "100%",

                    border:
                      "none",

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