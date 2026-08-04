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
import Categories from "./admin/pages/Categories";
import Collections from "./admin/pages/Collections";
import Orders from "./admin/pages/Orders";
import Customers from "./admin/pages/Customers";
import MediaLibrary from "./admin/pages/MediaLibrary";
import Settings from "./admin/pages/Settings";

function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8EFE3]">
      <Header />
      <Hero />
      <WholesaleRetail />
      <StateMarquee />
      <DiscoverJourney />
      <HouseSlider />
      <FinalCTA />
      <Footer />
    </div>
  );
}

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

export default function App() {
  return (
    <Routes>
      {/* PUBLIC WEBSITE */}

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

      <Route
        path="/wholesale/wishlist"
        element={<WholesaleWishlist />}
      />

      <Route
        path="/retail/wishlist"
        element={<RetailWishlist />}
      />

      <Route
        path="/wholesale/cart"
        element={<WholesaleCart />}
      />

      <Route
        path="/retail/cart"
        element={<RetailCart />}
      />

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

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/my-account"
        element={<MyAccountPage />}
      />

      <Route
        path="/state/:state"
        element={<StateProductsPage />}
      />

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

      {/* ADMIN LOGIN — PUBLIC */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* PROTECTED ADMIN PANEL */}

      <Route
        element={<ProtectedAdminRoute />}
      >
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            index
            element={
              <Navigate
                to="dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="products/new"
            element={<NewProduct />}
          />

          <Route
            path="categories"
            element={<Categories />}
          />

          <Route
            path="collections"
            element={<Collections />}
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="customers"
            element={<Customers />}
          />

          <Route
            path="website/home"
            element={
              <AdminComingSoon title="Home Content" />
            }
          />

          <Route
            path="media"
            element={<MediaLibrary />}
          />

          <Route
            path="coupons"
            element={
              <AdminComingSoon title="Coupons" />
            }
          />

          <Route
            path="reviews"
            element={
              <AdminComingSoon title="Reviews" />
            }
          />

          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>
      </Route>

      {/* INVALID URL */}

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
  );
}