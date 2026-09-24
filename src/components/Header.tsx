import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  HiOutlineMenuAlt3,
} from "react-icons/hi";

import {
  FiHeart,
  FiLogOut,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";

import logo from "../assets/VV logo.png";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useShop,
} from "../context/ShopContext";

import "./Header.css";

const Header = () => {
  const navigate =
    useNavigate();

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

  /* =========================================
     COUNTS

     Memoized so cart quantity calculation
     doesn't unnecessarily repeat.
  ========================================= */

  const wishlistCount =
    useMemo(
      () =>
        retailWishlist.length,
      [retailWishlist]
    );

  const cartCount =
    useMemo(
      () =>
        retailCart.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.quantity ?? 0
            ),
          0
        ),
      [retailCart]
    );

  /* =========================================
     CLOSE MENU
  ========================================= */

  const closeMenu =
    useCallback(() => {
      setIsMenuOpen(false);
    }, []);

  /* =========================================
     LOGIN
  ========================================= */

  const goToLogin =
    useCallback(
      (
        redirectTo?: string
      ) => {
        closeMenu();

        navigate(
          "/login",
          {
            state:
              redirectTo
                ? {
                    redirectTo,
                  }
                : undefined,
          }
        );
      },
      [
        closeMenu,
        navigate,
      ]
    );

  /* =========================================
     MENU BUTTON
  ========================================= */

  const handleMenuClick =
    useCallback(() => {
      if (
        isAuthLoading
      ) {
        return;
      }

      if (
        !isLoggedIn
      ) {
        goToLogin();

        return;
      }

      setIsMenuOpen(true);
    }, [
      goToLogin,
      isAuthLoading,
      isLoggedIn,
    ]);

  /* =========================================
     WISHLIST
  ========================================= */

  const handleWishlistClick =
    useCallback(() => {
      if (
        isAuthLoading
      ) {
        return;
      }

      if (
        !isLoggedIn
      ) {
        goToLogin(
          "/retail/wishlist"
        );

        return;
      }

      navigate(
        "/retail/wishlist"
      );
    }, [
      goToLogin,
      isAuthLoading,
      isLoggedIn,
      navigate,
    ]);

  /* =========================================
     CART
  ========================================= */

  const handleCartClick =
    useCallback(() => {
      if (
        isAuthLoading
      ) {
        return;
      }

      if (
        !isLoggedIn
      ) {
        goToLogin(
          "/retail/cart"
        );

        return;
      }

      navigate(
        "/retail/cart"
      );
    }, [
      goToLogin,
      isAuthLoading,
      isLoggedIn,
      navigate,
    ]);

  /* =========================================
     WHOLESALE
  ========================================= */

  const handleWholesaleClick =
    useCallback(() => {
      if (
        isAuthLoading
      ) {
        return;
      }

      closeMenu();

      if (
        !isLoggedIn
      ) {
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
    }, [
      closeMenu,
      isAuthLoading,
      isLoggedIn,
      navigate,
    ]);

  /* =========================================
     DRAWER WISHLIST
  ========================================= */

  const handleDrawerWishlistClick =
    useCallback(() => {
      closeMenu();

      navigate(
        "/retail/wishlist"
      );
    }, [
      closeMenu,
      navigate,
    ]);

  /* =========================================
     DRAWER CART
  ========================================= */

  const handleDrawerCartClick =
    useCallback(() => {
      closeMenu();

      navigate(
        "/retail/cart"
      );
    }, [
      closeMenu,
      navigate,
    ]);

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout =
    useCallback(
      async () => {
        closeMenu();

        await logout();

        navigate(
          "/",
          {
            replace: true,
          }
        );
      },
      [
        closeMenu,
        logout,
        navigate,
      ]
    );

  /* =========================================
     DRAWER BODY SCROLL + ESCAPE KEY

     Event listener exists only while menu
     is actually open.
  ========================================= */

  useEffect(() => {
    if (
      !isMenuOpen
    ) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        closeMenu();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    isMenuOpen,
    closeMenu,
  ]);

  /* =========================================
     PAGE
  ========================================= */

  return (
    <>
      {/* =====================================
          HEADER
      ===================================== */}

      <header className="home-header">
        <div className="home-header-inner">
          {/* =============================
              HAMBURGER
          ============================= */}

          <button
            type="button"
            className="home-menu-button"
            onClick={
              handleMenuClick
            }
            aria-label="Open menu"
            aria-expanded={
              isMenuOpen
            }
            aria-controls="home-menu-drawer"
            disabled={
              isAuthLoading
            }
          >
            <HiOutlineMenuAlt3 />
          </button>

          {/* =============================
              LOGO
          ============================= */}

          <Link
            to="/"
            className="home-header-brand"
            onClick={
              closeMenu
            }
          >
            <img
              src={logo}
              alt="VV Sarees Logo"
              className="home-header-logo"

              /*
                Header is first-screen content.
              */
              loading="eager"

              /*
                Image decoding doesn't block
                main-thread rendering.
              */
              decoding="async"

              fetchPriority="high"

              draggable={false}
            />

            <h1>
              VV Sarees
            </h1>
          </Link>

          {/* =============================
              HEADER ACTIONS
          ============================= */}

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
                {
                  wishlistCount
                }
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

      {/* =====================================
          SHIPPING BAR
      ===================================== */}

      <div className="shipping-bar">
        <div className="shipping-track">
          <div className="shipping-group">
            <span>
              🚚 FREE SHIPPING WITHIN
              TAMIL NADU, PUDUCHERRY
              &amp; BANGALORE
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN
              TAMIL NADU, PUDUCHERRY
              &amp; BANGALORE
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN
              TAMIL NADU, PUDUCHERRY
              &amp; BANGALORE
            </span>
          </div>

          <div
            className="shipping-group"
            aria-hidden="true"
          >
            <span>
              🚚 FREE SHIPPING WITHIN
              TAMIL NADU, PUDUCHERRY
              &amp; BANGALORE
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN
              TAMIL NADU, PUDUCHERRY
              &amp; BANGALORE
            </span>

            <span>
              🚚 FREE SHIPPING WITHIN
              TAMIL NADU, PUDUCHERRY
              &amp; BANGALORE
            </span>
          </div>
        </div>
      </div>

      {/* =====================================
          OVERLAY
      ===================================== */}

      <div
        className={`home-menu-overlay ${
          isMenuOpen
            ? "home-menu-overlay-open"
            : ""
        }`}
        onClick={
          closeMenu
        }
        aria-hidden="true"
      />

      {/* =====================================
          DRAWER
      ===================================== */}

      <aside
        id="home-menu-drawer"
        className={`home-menu-drawer ${
          isMenuOpen
            ? "home-menu-drawer-open"
            : ""
        }`}
        aria-hidden={
          !isMenuOpen
        }
      >
        {/* =============================
            DRAWER TOP
        ============================= */}

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
            onClick={
              closeMenu
            }
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        {/* =============================
            LINKS
        ============================= */}

        <nav className="home-menu-links">
          <Link
            to="/"
            onClick={
              closeMenu
            }
          >
            Home
          </Link>

          <Link
            to="/retail"
            onClick={
              closeMenu
            }
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
            }}
          >
            Wishlist (
            {wishlistCount})
          </button>

          {/* CART */}

          <button
            type="button"
            onClick={
              handleDrawerCartClick
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
            }}
          >
            Cart ({cartCount})
          </button>

          <Link
            to="/track-order"
            onClick={
              closeMenu
            }
          >
            Track Order
          </Link>

          <Link
            to="/about"
            onClick={
              closeMenu
            }
          >
            About Us
          </Link>

          <Link
            to="/contact"
            onClick={
              closeMenu
            }
          >
            Contact Us
          </Link>

          {/* =============================
              ACCOUNT
          ============================= */}

          {!isAuthLoading &&
            isLoggedIn && (
              <>
                <Link
                  to="/my-account"
                  onClick={
                    closeMenu
                  }
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

        {/* =============================
            DRAWER FOOTER
        ============================= */}

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
            Premium sarees sourced
            directly from skilled
            weavers across India.
          </p>

          <Link
            to="/retail"
            className="home-menu-shop-button"
            onClick={
              closeMenu
            }
          >
            Shop Retail
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Header;