import {
  lazy,
  Suspense,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

/* =========================================
   HOME PAGE COMPONENTS
   Initial home load-ku ivanga mattum eager.
========================================= */

import Header from "./components/Header";
import Hero from "./components/Hero";
import WholesaleRetail from "./components/WholesaleRetail";
import StateMarquee from "./components/StateMarquee";
import DiscoverJourney from "./components/DiscoverJourney";
import HouseSlider from "./components/HouseSlider";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

import ReviewPopup from "./components/ReviewPopup";
import SeoManager from "./components/SeoManager";

/* =========================================
   LAZY LOADED PUBLIC PAGES
========================================= */

const WholesalePage = lazy(
  () => import("./pages/WholesalePage")
);

const RetailPage = lazy(
  () => import("./pages/RetailPage")
);

const ProductDetailPage = lazy(
  () => import("./pages/ProductDetailPage")
);

const WholesaleWishlist = lazy(
  () => import("./pages/WholesaleWishlist")
);

const RetailWishlist = lazy(
  () => import("./pages/RetailWishlist")
);

const WholesaleCart = lazy(
  () => import("./pages/WholesaleCart")
);

const RetailCart = lazy(
  () => import("./pages/RetailCart")
);

const CheckoutPage = lazy(
  () => import("./pages/CheckoutPage")
);

const OrderSuccessPage = lazy(
  () => import("./pages/OrderSuccessPage")
);

const TrackOrderPage = lazy(
  () => import("./pages/TrackOrderPage")
);

/* =========================================
   CUSTOMER AUTH
========================================= */

const LoginPage = lazy(
  () => import("./pages/LoginPage")
);

const RegisterPage = lazy(
  () => import("./pages/RegisterPage")
);

const ForgotPasswordPage = lazy(
  () => import("./pages/ForgotPasswordPage")
);

const ResetPasswordPage = lazy(
  () => import("./pages/ResetPasswordPage")
);

const MyAccountPage = lazy(
  () => import("./pages/MyAccountPage")
);

/* =========================================
   WHOLESALE AUTH
========================================= */

const WholesaleLoginPage = lazy(
  () => import("./pages/WholesaleLoginPage")
);

const WholesaleRegisterPage = lazy(
  () => import("./pages/WholesaleRegisterPage")
);

const WholesalePendingPage = lazy(
  () => import("./pages/WholesalePendingPage")
);

const ProtectedWholesaleRoute = lazy(
  () =>
    import(
      "./components/ProtectedWholesaleRoute"
    )
);

/* =========================================
   INFORMATION / STATE PAGES
========================================= */

const StateProductsPage = lazy(
  () => import("./pages/StateProductsPage")
);

const Policies = lazy(
  () => import("./pages/Policies")
);

const About = lazy(
  () => import("./pages/About")
);

const Contact = lazy(
  () => import("./pages/Contact")
);

/* =========================================
   ADMIN
========================================= */

const ProtectedAdminRoute = lazy(
  () =>
    import(
      "./admin/components/ProtectedAdminRoute"
    )
);

const AdminLayout = lazy(
  () => import("./admin/layout/AdminLayout")
);

const AdminLogin = lazy(
  () => import("./admin/pages/AdminLogin")
);

const Dashboard = lazy(
  () => import("./admin/pages/Dashboard")
);

const Products = lazy(
  () => import("./admin/pages/Products")
);

const NewProduct = lazy(
  () => import("./admin/pages/NewProduct")
);

const EditProduct = lazy(
  () => import("./admin/pages/EditProduct")
);

const Categories = lazy(
  () => import("./admin/pages/Categories")
);

const Collections = lazy(
  () => import("./admin/pages/Collections")
);

const Orders = lazy(
  () => import("./admin/pages/Orders")
);

const Customers = lazy(
  () => import("./admin/pages/Customers")
);

const MediaLibrary = lazy(
  () => import("./admin/pages/MediaLibrary")
);

const Settings = lazy(
  () => import("./admin/pages/Settings")
);

const Reviews = lazy(
  () => import("./admin/pages/Reviews")
);

const WholesaleApplications = lazy(
  () =>
    import(
      "./admin/pages/WholesaleApplications"
    )
);

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
   ROUTE LOADER
========================================= */

function RouteLoader() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        color: "#6e3d19",
        fontFamily:
          '"Cormorant Garamond", Georgia, serif',
        fontSize: "18px",
      }}
    >
      Loading...
    </div>
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
      <SeoManager />

      <ReviewPopup />

      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* =====================================
              HOME
          ===================================== */}

          <Route
            path="/"
            element={<HomePage />}
          />

          {/* =====================================
              WHOLESALE AUTHENTICATION
          ===================================== */}

          <Route
            path="/wholesale-login"
            element={<WholesaleLoginPage />}
          />

          <Route
            path="/wholesale-register"
            element={<WholesaleRegisterPage />}
          />

          <Route
            path="/wholesale-pending"
            element={<WholesalePendingPage />}
          />

          {/* =====================================
              PROTECTED WHOLESALE AREA
          ===================================== */}

          <Route
            element={
              <ProtectedWholesaleRoute />
            }
          >
            <Route
              path="/wholesale"
              element={<WholesalePage />}
            />

            <Route
              path="/wholesale/product/:slug"
              element={
                <ProductDetailPage
                  mode="wholesale"
                />
              }
            />

            <Route
              path="/wholesale/wishlist"
              element={<WholesaleWishlist />}
            />

            <Route
              path="/wholesale/cart"
              element={<WholesaleCart />}
            />

            <Route
              path="/wholesale/checkout"
              element={
                <CheckoutPage
                  mode="wholesale"
                />
              }
            />
          </Route>

          {/* =====================================
              RETAIL
          ===================================== */}

          <Route
            path="/retail"
            element={<RetailPage />}
          />

          <Route
            path="/retail/product/:slug"
            element={
              <ProductDetailPage
                mode="retail"
              />
            }
          />

          <Route
            path="/retail/wishlist"
            element={<RetailWishlist />}
          />

          <Route
            path="/retail/cart"
            element={<RetailCart />}
          />

          <Route
            path="/retail/checkout"
            element={
              <CheckoutPage mode="retail" />
            }
          />

          {/* =====================================
              ORDER
          ===================================== */}

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
              PROTECTED ADMIN
          ===================================== */}

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
                path="wholesale-applications"
                element={
                  <WholesaleApplications />
                }
              />

              <Route
                path="website/home"
                element={
                  <AdminComingSoon
                    title="Home Content"
                  />
                }
              />

              <Route
                path="media"
                element={<MediaLibrary />}
              />

              <Route
                path="coupons"
                element={
                  <AdminComingSoon
                    title="Coupons"
                  />
                }
              />

              <Route
                path="reviews"
                element={<Reviews />}
              />

              <Route
                path="settings"
                element={<Settings />}
              />
            </Route>
          </Route>

          {/* =====================================
              UNKNOWN URL
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
      </Suspense>
    </>
  );
}