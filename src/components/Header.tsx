import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { HiOutlineMenuAlt3 } from "react-icons/hi";
import {
  FiHeart,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";

import logo from "../assets/VV logo.png";

import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Later authentication connect pannumbodhu dynamic-aa maathalaam.
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
      <header className="home-header">
        <div className="home-header-inner">
          <button
            type="button"
            className="home-menu-button"
            onClick={() => setIsMenuOpen(true)}
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

            <h1>VV Sarees</h1>
          </Link>

          <div className="home-header-actions">
            <Link
              to="/retail/wishlist"
              className="home-header-action"
              aria-label="Retail wishlist"
            >
              <FiHeart />
              <span>0</span>
            </Link>

            <Link
              to="/retail/cart"
              className="home-header-action"
              aria-label="Retail cart"
            >
              <FiShoppingCart />
              <span>0</span>
            </Link>
          </div>
        </div>
      </header>

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

      <div
        className={`home-menu-overlay ${
          isMenuOpen ? "home-menu-overlay-open" : ""
        }`}
        onClick={closeMenu}
      />

      <aside
        className={`home-menu-drawer ${
          isMenuOpen ? "home-menu-drawer-open" : ""
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="home-menu-drawer-top">
          <div>
            <span>VV SAREES</span>
            <h2>Explore</h2>
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

        <nav className="home-menu-links">
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/retail" onClick={closeMenu}>
            Retail Collection
          </Link>

          <Link to="/wholesale" onClick={closeMenu}>
            Wholesale Collection
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

        <div className="home-menu-footer">
          <p>
            Premium sarees sourced directly from skilled
            weavers across India.
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