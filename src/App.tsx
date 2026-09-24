import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

/* =========================================
   HOME PAGE - FIRST SCREEN
   =========================================

   Header + Hero mattum first screen-la
   immediately venum.

   So ivanga eager import.
========================================= */

import Header from "./components/Header";
import Hero from "./components/Hero";

import ReviewPopup from "./components/ReviewPopup";
import SeoManager from "./components/SeoManager";

/* =========================================
   HOME PAGE - LAZY SECTIONS

   Initial bundle-la ellame load aaga vendam.
========================================= */

const WholesaleRetail = lazy(
  () =>
    import(
      "./components/WholesaleRetail"
    )
);

const StateMarquee = lazy(
  () =>
    import(
      "./components/StateMarquee"
    )
);

const DiscoverJourney = lazy(
  () =>
    import(
      "./components/DiscoverJourney"
    )
);

const HouseSlider = lazy(
  () =>
    import(
      "./components/HouseSlider"
    )
);

const FinalCTA = lazy(
  () =>
    import(
      "./components/FinalCTA"
    )
);

const Footer = lazy(
  () =>
    import(
      "./components/Footer"
    )
);

/* =========================================
   LAZY LOADED PUBLIC PAGES
========================================= */

const WholesalePage = lazy(
  () =>
    import(
      "./pages/WholesalePage"
    )
);

const RetailPage = lazy(
  () =>
    import(
      "./pages/RetailPage"
    )
);

const ProductDetailPage = lazy(
  () =>
    import(
      "./pages/ProductDetailPage"
    )
);

const WholesaleWishlist = lazy(
  () =>
    import(
      "./pages/WholesaleWishlist"
    )
);

const RetailWishlist = lazy(
  () =>
    import(
      "./pages/RetailWishlist"
    )
);

const WholesaleCart = lazy(
  () =>
    import(
      "./pages/WholesaleCart"
    )
);

const RetailCart = lazy(
  () =>
    import(
      "./pages/RetailCart"
    )
);

const CheckoutPage = lazy(
  () =>
    import(
      "./pages/CheckoutPage"
    )
);

const OrderSuccessPage = lazy(
  () =>
    import(
      "./pages/OrderSuccessPage"
    )
);

const TrackOrderPage = lazy(
  () =>
    import(
      "./pages/TrackOrderPage"
    )
);

/* =========================================
   CUSTOMER AUTH
========================================= */

const LoginPage = lazy(
  () =>
    import(
      "./pages/LoginPage"
    )
);

const RegisterPage = lazy(
  () =>
    import(
      "./pages/RegisterPage"
    )
);

const ForgotPasswordPage = lazy(
  () =>
    import(
      "./pages/ForgotPasswordPage"
    )
);

const ResetPasswordPage = lazy(
  () =>
    import(
      "./pages/ResetPasswordPage"
    )
);

const MyAccountPage = lazy(
  () =>
    import(
      "./pages/MyAccountPage"
    )
);

/* =========================================
   WHOLESALE AUTH
========================================= */

const WholesaleLoginPage = lazy(
  () =>
    import(
      "./pages/WholesaleLoginPage"
    )
);

const WholesaleRegisterPage = lazy(
  () =>
    import(
      "./pages/WholesaleRegisterPage"
    )
);

const WholesalePendingPage = lazy(
  () =>
    import(
      "./pages/WholesalePendingPage"
    )
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
  () =>
    import(
      "./pages/StateProductsPage"
    )
);

const Policies = lazy(
  () =>
    import(
      "./pages/Policies"
    )
);

const About = lazy(
  () =>
    import(
      "./pages/About"
    )
);

const Contact = lazy(
  () =>
    import(
      "./pages/Contact"
    )
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
  () =>
    import(
      "./admin/layout/AdminLayout"
    )
);

const AdminLogin = lazy(
  () =>
    import(
      "./admin/pages/AdminLogin"
    )
);

const Dashboard = lazy(
  () =>
    import(
      "./admin/pages/Dashboard"
    )
);

const Products = lazy(
  () =>
    import(
      "./admin/pages/Products"
    )
);

const NewProduct = lazy(
  () =>
    import(
      "./admin/pages/NewProduct"
    )
);

const EditProduct = lazy(
  () =>
    import(
      "./admin/pages/EditProduct"
    )
);

const Categories = lazy(
  () =>
    import(
      "./admin/pages/Categories"
    )
);

const Collections = lazy(
  () =>
    import(
      "./admin/pages/Collections"
    )
);

const Orders = lazy(
  () =>
    import(
      "./admin/pages/Orders"
    )
);

const Customers = lazy(
  () =>
    import(
      "./admin/pages/Customers"
    )
);

const MediaLibrary = lazy(
  () =>
    import(
      "./admin/pages/MediaLibrary"
    )
);

const Settings = lazy(
  () =>
    import(
      "./admin/pages/Settings"
    )
);

const Reviews = lazy(
  () =>
    import(
      "./admin/pages/Reviews"
    )
);

const WholesaleApplications = lazy(
  () =>
    import(
      "./admin/pages/WholesaleApplications"
    )
);

/* =========================================
   DEFER BELOW-FOLD HOME SECTIONS

   Customer section pakkathula scroll pannumbodhu
   mattum component mount aagum.
========================================= */

type DeferredSectionProps = {
  children: ReactNode;
  minHeight?: number;
};

function DeferredSection({
  children,
  minHeight = 200,
}: DeferredSectionProps) {
  const sectionRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    shouldRender,
    setShouldRender,
  ] = useState(false);

  useEffect(() => {
    const element =
      sectionRef.current;

    if (!element) {
      return;
    }

    /*
      IntersectionObserver support illadha
      old browser-na direct render panniduvom.
    */
    if (
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      setShouldRender(true);

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            !entry?.isIntersecting
          ) {
            return;
          }

          setShouldRender(true);

          /*
            Once loaded, again observe panna
            thevai illa.
          */
          observer.disconnect();
        },
        {
          /*
            User section-ku varradhukku munnaadiye
            500px distance-la preload start.
          */
          rootMargin:
            "500px 0px",
        }
      );

    observer.observe(
      element
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      style={
        shouldRender
          ? undefined
          : {
              minHeight,
            }
      }
    >
      {shouldRender
        ? children
        : null}
    </div>
  );
}

/* =========================================
   HOME SECTION PLACEHOLDER

   Section load aagumbodhu page layout jump
   aagaama approximate space reserve pannum.
========================================= */

function HomeSectionLoader({
  minHeight = 180,
}: {
  minHeight?: number;
}) {
  return (
    <div
      style={{
        minHeight,
      }}
      aria-hidden="true"
    />
  );
}

/* =========================================
   HOME PAGE
========================================= */

function HomePage() {
  return (
    <>
      {/* =================================
          FIRST SCREEN - IMMEDIATE
          ================================= */}

      <Header />

      <Hero />

      {/* =================================
          WHOLESALE / RETAIL

          Hero-ku directly keela irukku.
          Separate chunk, but immediate load.
          ================================= */}

      <Suspense
        fallback={
          <HomeSectionLoader
            minHeight={430}
          />
        }
      >
        <WholesaleRetail />
      </Suspense>

      {/* =================================
          STATE MARQUEE

          Customer scroll close varumbodhu dhaan
          mount aagum.
          ================================= */}

      <DeferredSection
        minHeight={110}
      >
        <Suspense
          fallback={
            <HomeSectionLoader
              minHeight={110}
            />
          }
        >
          <StateMarquee />
        </Suspense>
      </DeferredSection>

      {/* =================================
          JOURNEY SECTION
          ================================= */}

      <DeferredSection
        minHeight={650}
      >
        <Suspense
          fallback={
            <HomeSectionLoader
              minHeight={650}
            />
          }
        >
          <DiscoverJourney />
        </Suspense>
      </DeferredSection>

      {/* =================================
          HOUSE SLIDER
          ================================= */}

      <DeferredSection
        minHeight={520}
      >
        <Suspense
          fallback={
            <HomeSectionLoader
              minHeight={520}
            />
          }
        >
          <HouseSlider />
        </Suspense>
      </DeferredSection>

      {/* =================================
          FINAL CTA
          ================================= */}

      <DeferredSection
        minHeight={350}
      >
        <Suspense
          fallback={
            <HomeSectionLoader
              minHeight={350}
            />
          }
        >
          <FinalCTA />
        </Suspense>
      </DeferredSection>

      {/* =================================
          FOOTER
          ================================= */}

      <DeferredSection
        minHeight={320}
      >
        <Suspense
          fallback={
            <HomeSectionLoader
              minHeight={320}
            />
          }
        >
          <Footer />
        </Suspense>
      </DeferredSection>
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
        justifyContent:
          "center",
        padding:
          "40px 20px",
        color:
          "#6e3d19",
        fontFamily:
          '"Cormorant Garamond", Georgia, serif',
        fontSize:
          "18px",
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

        borderRadius:
          "18px",

        background:
          "#ffffff",

        boxShadow:
          "0 10px 28px rgba(73, 35, 11, 0.055)",
      }}
    >
      <p
        style={{
          margin:
            "0 0 8px",

          color:
            "#9b7b62",

          fontSize:
            "10px",

          fontWeight:
            700,

          letterSpacing:
            "1px",

          textTransform:
            "uppercase",
        }}
      >
        VV Sarees Admin
      </p>

      <h1
        style={{
          margin: 0,

          color:
            "#4b250e",

          fontFamily:
            '"Cormorant Garamond", Georgia, serif',

          fontSize:
            "34px",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin:
            "10px 0 0",

          color:
            "#8b7565",

          fontSize:
            "12px",
        }}
      >
        This admin module will be
        created next.
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
      {/* =================================
          SEO
          ================================= */}

      <SeoManager />

      {/* =================================
          REVIEW POPUP
          ================================= */}

      <ReviewPopup />

      {/* =================================
          ROUTES
          ================================= */}

      <Suspense
        fallback={
          <RouteLoader />
        }
      >
        <Routes>
          {/* =====================================
              HOME
              ===================================== */}

          <Route
            path="/"
            element={
              <HomePage />
            }
          />

          {/* =====================================
              WHOLESALE AUTHENTICATION
              ===================================== */}

          <Route
            path="/wholesale-login"
            element={
              <WholesaleLoginPage />
            }
          />

          <Route
            path="/wholesale-register"
            element={
              <WholesaleRegisterPage />
            }
          />

          <Route
            path="/wholesale-pending"
            element={
              <WholesalePendingPage />
            }
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
              element={
                <WholesalePage />
              }
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
              element={
                <WholesaleWishlist />
              }
            />

            <Route
              path="/wholesale/cart"
              element={
                <WholesaleCart />
              }
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
            element={
              <RetailPage />
            }
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
            element={
              <RetailWishlist />
            }
          />

          <Route
            path="/retail/cart"
            element={
              <RetailCart />
            }
          />

          <Route
            path="/retail/checkout"
            element={
              <CheckoutPage
                mode="retail"
              />
            }
          />

          {/* =====================================
              ORDER
              ===================================== */}

          <Route
            path="/order-success"
            element={
              <OrderSuccessPage />
            }
          />

          <Route
            path="/track-order"
            element={
              <TrackOrderPage />
            }
          />

          {/* =====================================
              CUSTOMER AUTHENTICATION
              ===================================== */}

          <Route
            path="/login"
            element={
              <LoginPage />
            }
          />

          <Route
            path="/register"
            element={
              <RegisterPage />
            }
          />

          <Route
            path="/forgot-password"
            element={
              <ForgotPasswordPage />
            }
          />

          <Route
            path="/reset-password"
            element={
              <ResetPasswordPage />
            }
          />

          <Route
            path="/my-account"
            element={
              <MyAccountPage />
            }
          />

          {/* =====================================
              STATE PRODUCTS
              ===================================== */}

          <Route
            path="/state/:state"
            element={
              <StateProductsPage />
            }
          />

          {/* =====================================
              INFORMATION PAGES
              ===================================== */}

          <Route
            path="/policies"
            element={
              <Policies />
            }
          />

          <Route
            path="/about"
            element={
              <About />
            }
          />

          <Route
            path="/contact"
            element={
              <Contact />
            }
          />

          {/* =====================================
              ADMIN LOGIN
              ===================================== */}

          <Route
            path="/admin/login"
            element={
              <AdminLogin />
            }
          />

          {/* =====================================
              PROTECTED ADMIN
              ===================================== */}

          <Route
            element={
              <ProtectedAdminRoute />
            }
          >
            <Route
              path="/admin"
              element={
                <AdminLayout />
              }
            >
              {/* =============================
                  DEFAULT ADMIN ROUTE
                  ============================= */}

              <Route
                index
                element={
                  <Navigate
                    to="dashboard"
                    replace
                  />
                }
              />

              {/* =============================
                  DASHBOARD
                  ============================= */}

              <Route
                path="dashboard"
                element={
                  <Dashboard />
                }
              />

              {/* =============================
                  PRODUCTS
                  ============================= */}

              <Route
                path="products"
                element={
                  <Products />
                }
              />

              <Route
                path="products/new"
                element={
                  <NewProduct />
                }
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
                element={
                  <EditProduct />
                }
              />

              {/* =============================
                  CATEGORIES
                  ============================= */}

              <Route
                path="categories"
                element={
                  <Categories />
                }
              />

              {/* =============================
                  COLLECTIONS
                  ============================= */}

              <Route
                path="collections"
                element={
                  <Collections />
                }
              />

              {/* =============================
                  ORDERS
                  ============================= */}

              <Route
                path="orders"
                element={
                  <Orders />
                }
              />

              {/* =============================
                  CUSTOMERS
                  ============================= */}

              <Route
                path="customers"
                element={
                  <Customers />
                }
              />

              {/* =============================
                  WHOLESALE APPLICATIONS
                  ============================= */}

              <Route
                path="wholesale-applications"
                element={
                  <WholesaleApplications />
                }
              />

              {/* =============================
                  HOME CONTENT
                  ============================= */}

              <Route
                path="website/home"
                element={
                  <AdminComingSoon
                    title="Home Content"
                  />
                }
              />

              {/* =============================
                  MEDIA LIBRARY
                  ============================= */}

              <Route
                path="media"
                element={
                  <MediaLibrary />
                }
              />

              {/* =============================
                  COUPONS
                  ============================= */}

              <Route
                path="coupons"
                element={
                  <AdminComingSoon
                    title="Coupons"
                  />
                }
              />

              {/* =============================
                  REVIEWS
                  ============================= */}

              <Route
                path="reviews"
                element={
                  <Reviews />
                }
              />

              {/* =============================
                  SETTINGS
                  ============================= */}

              <Route
                path="settings"
                element={
                  <Settings />
                }
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