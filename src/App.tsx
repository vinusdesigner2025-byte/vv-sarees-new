import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Header from "./components/Header";
import Hero from "./components/Hero";
import WholesaleRetail from "./components/WholesaleRetail";
import StateMarquee from "./components/StateMarquee";
import DiscoverJourney from "./components/DiscoverJourney";
import HouseSlider from "./components/HouseSlider";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

import ReviewPopup from "./components/ReviewPopup";

import WholesalePage from "./pages/WholesalePage";
import RetailPage from "./pages/RetailPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WholesaleWishlist from "./pages/WholesaleWishlist";
import RetailWishlist from "./pages/RetailWishlist";
import WholesaleCart from "./pages/WholesaleCart";
import RetailCart from "./pages/RetailCart";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import TrackOrderPage from "./pages/TrackOrderPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MyAccountPage from "./pages/MyAccountPage";

import StateProductsPage from "./pages/StateProductsPage";
import Policies from "./pages/Policies";
import About from "./pages/About";
import Contact from "./pages/Contact";

import ProtectedAdminRoute from "./admin/components/ProtectedAdminRoute";
import AdminLayout from "./admin/layout/AdminLayout";

import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import NewProduct from "./admin/pages/NewProduct";
import EditProduct from "./admin/pages/EditProduct";
import Categories from "./admin/pages/Categories";
import Collections from "./admin/pages/Collections";
import Orders from "./admin/pages/Orders";
import Customers from "./admin/pages/Customers";
import MediaLibrary from "./admin/pages/MediaLibrary";
import Settings from "./admin/pages/Settings";
import Reviews from "./admin/pages/Reviews";

/* =========================================
   HOME PAGE
========================================= */

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <WholesaleRetail />
      <StateMarquee />
      <DiscoverJourney />
      <HouseSlider />
      <FinalCTA />
      <Footer />
    </>
  );
}

/* =========================================
   ADMIN COMING SOON
========================================= */

type AdminComingSoonProps = {
  title: string;
};

function AdminComingSoon({
  title,
}: AdminComingSoonProps) {
  return (
    <div
      style={{
        padding: "32px",
        border:
          "1px solid rgba(110, 61, 25, 0.1)",
        borderRadius: "18px",
        background: "#ffffff",
        boxShadow:
          "0 10px 28px rgba(73, 35, 11, 0.055)",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#9b7b62",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        VV Sarees Admin
      </p>

      <h1
        style={{
          margin: 0,
          color: "#4b250e",
          fontFamily:
            '"Cormorant Garamond", Georgia, serif',
          fontSize: "34px",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin: "10px 0 0",
          color: "#8b7565",
          fontSize: "12px",
        }}
      >
        This admin module will be created next.
      </p>
    </div>
  );
}

/* =========================================
   APP
========================================= */

export default function App() {
  return (
    <>
      {/* =====================================
          GLOBAL CUSTOMER REVIEW POPUP
      ===================================== */}

      <ReviewPopup />

      {/* =====================================
          ROUTES
      ===================================== */}

      <Routes>
        {/* =====================================
            PUBLIC WEBSITE
        ===================================== */}

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/wholesale"
          element={<WholesalePage />}
        />

        <Route
          path="/retail"
          element={<RetailPage />}
        />

        {/* =====================================
            PRODUCT DETAILS
        ===================================== */}

        <Route
          path="/wholesale/product/:slug"
          element={
            <ProductDetailPage mode="wholesale" />
          }
        />

        <Route
          path="/retail/product/:slug"
          element={
            <ProductDetailPage mode="retail" />
          }
        />

        {/* =====================================
            WISHLIST
        ===================================== */}

        <Route
          path="/wholesale/wishlist"
          element={<WholesaleWishlist />}
        />

        <Route
          path="/retail/wishlist"
          element={<RetailWishlist />}
        />

        {/* =====================================
            CART
        ===================================== */}

        <Route
          path="/wholesale/cart"
          element={<WholesaleCart />}
        />

        <Route
          path="/retail/cart"
          element={<RetailCart />}
        />

        {/* =====================================
            CHECKOUT
        ===================================== */}

        <Route
          path="/wholesale/checkout"
          element={
            <CheckoutPage mode="wholesale" />
          }
        />

        <Route
          path="/retail/checkout"
          element={
            <CheckoutPage mode="retail" />
          }
        />

        <Route
          path="/order-success"
          element={<OrderSuccessPage />}
        />

        <Route
          path="/track-order"
          element={<TrackOrderPage />}
        />

        {/* =====================================
            CUSTOMER AUTHENTICATION
        ===================================== */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        <Route
          path="/my-account"
          element={<MyAccountPage />}
        />

        {/* =====================================
            STATE PRODUCTS
        ===================================== */}

        <Route
          path="/state/:state"
          element={<StateProductsPage />}
        />

        {/* =====================================
            INFORMATION PAGES
        ===================================== */}

        <Route
          path="/policies"
          element={<Policies />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* =====================================
            ADMIN LOGIN
        ===================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* =====================================
            PROTECTED ADMIN PANEL
        ===================================== */}

        <Route
          element={<ProtectedAdminRoute />}
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            {/* Default Admin Route */}

            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

            {/* Dashboard */}

            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            {/* Products */}

            <Route
              path="products"
              element={<Products />}
            />

            <Route
              path="products/new"
              element={<NewProduct />}
            />

            <Route
              path="products/:id"
              element={
                <AdminComingSoon
                  title="Product Details"
                />
              }
            />

            <Route
              path="products/:id/edit"
              element={<EditProduct />}
            />

            {/* Categories */}

            <Route
              path="categories"
              element={<Categories />}
            />

            {/* Collections */}

            <Route
              path="collections"
              element={<Collections />}
            />

            {/* Orders */}

            <Route
              path="orders"
              element={<Orders />}
            />

            {/* Customers */}

            <Route
              path="customers"
              element={<Customers />}
            />

            {/* Website Content */}

            <Route
              path="website/home"
              element={
                <AdminComingSoon
                  title="Home Content"
                />
              }
            />

            {/* Media Library */}

            <Route
              path="media"
              element={<MediaLibrary />}
            />

            {/* Coupons */}

            <Route
              path="coupons"
              element={
                <AdminComingSoon
                  title="Coupons"
                />
              }
            />

            {/* Reviews */}

            <Route
              path="reviews"
              element={<Reviews />}
            />

            {/* Settings */}

            <Route
              path="settings"
              element={<Settings />}
            />
          </Route>
        </Route>

        {/* =====================================
            INVALID / UNKNOWN URL
        ===================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}