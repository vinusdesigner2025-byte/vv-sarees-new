import {
  useLayoutEffect,
  useRef,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import gsap from "gsap";
import {
  ScrollTrigger,
} from "gsap/ScrollTrigger";

import {
  FiArrowRight,
  FiAward,
  FiBox,
  FiHeart,
  FiLayers,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiTruck,
} from "react-icons/fi";

import {
  useAuth,
} from "../context/AuthContext";

import "./WholesaleRetail.css";

gsap.registerPlugin(
  ScrollTrigger
);

export default function WholesaleRetail() {
  const navigate =
    useNavigate();

  const {
    isLoggedIn,
    isAuthLoading,
  } = useAuth();

  const sectionRef =
    useRef<HTMLElement | null>(
      null
    );

  /* =========================================
     GSAP ANIMATION

     Only animate elements that actually exist.
     No missing-target warnings.
  ========================================= */

  useLayoutEffect(() => {
    const section =
      sectionRef.current;

    if (!section) {
      return;
    }

    /* =====================================
       ACCESSIBILITY

       User reduced motion prefer pannina
       animation completely skip pannuvom.
    ===================================== */

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (
      prefersReducedMotion
    ) {
      return;
    }

    const context =
      gsap.context(() => {
        const media =
          gsap.matchMedia();

        /* =====================================
           GET EXISTING ELEMENTS

           querySelector use pannradhu nala
           missing element-na GSAP-ku pass
           aagadhu.
        ===================================== */

        const wholesaleCard =
          section.querySelector<HTMLElement>(
            ".shop-card-left"
          );

        const retailCard =
          section.querySelector<HTMLElement>(
            ".shop-card-right"
          );

        const badges =
          section.querySelectorAll<HTMLElement>(
            ".shop-card-badge"
          );

        const headings =
          section.querySelectorAll<HTMLElement>(
            ".card-heading"
          );

        const descriptions =
          section.querySelectorAll<HTMLElement>(
            ".card-description"
          );

        const featureRows =
          section.querySelectorAll<HTMLElement>(
            ".feature-row"
          );

        const cardFooters =
          section.querySelectorAll<HTMLElement>(
            ".card-footer"
          );

        /* =====================================
           DESKTOP
        ===================================== */

        media.add(
          "(min-width: 701px)",
          () => {
            const timeline =
              gsap.timeline({
                defaults: {
                  overwrite:
                    "auto",
                },

                scrollTrigger: {
                  trigger:
                    section,

                  start:
                    "top 82%",

                  toggleActions:
                    "play none none none",

                  once: true,
                },
              });

            /* =============================
               CARDS
            ============================= */

            if (
              wholesaleCard
            ) {
              timeline.fromTo(
                wholesaleCard,
                {
                  x: -55,
                  y: 16,
                  opacity: 0,
                },
                {
                  x: 0,
                  y: 0,
                  opacity: 1,

                  duration:
                    0.65,

                  ease:
                    "power3.out",
                }
              );
            }

            if (
              retailCard
            ) {
              timeline.fromTo(
                retailCard,
                {
                  x: 55,
                  y: 16,
                  opacity: 0,
                },
                {
                  x: 0,
                  y: 0,
                  opacity: 1,

                  duration:
                    0.65,

                  ease:
                    "power3.out",
                },
                "-=0.5"
              );
            }

            /* =============================
               BADGES
            ============================= */

            if (
              badges.length >
              0
            ) {
              timeline.fromTo(
                badges,
                {
                  y: 10,
                  opacity: 0,
                },
                {
                  y: 0,
                  opacity: 1,

                  duration:
                    0.3,

                  stagger:
                    0.04,

                  ease:
                    "power2.out",
                },
                "-=0.25"
              );
            }

            /* =============================
               HEADINGS
            ============================= */

            if (
              headings.length >
              0
            ) {
              timeline.fromTo(
                headings,
                {
                  y: 14,
                  opacity: 0,
                },
                {
                  y: 0,
                  opacity: 1,

                  duration:
                    0.38,

                  stagger:
                    0.04,

                  ease:
                    "power2.out",
                },
                "-=0.2"
              );
            }

            /* =============================
               DESCRIPTIONS
            ============================= */

            if (
              descriptions.length >
              0
            ) {
              timeline.fromTo(
                descriptions,
                {
                  y: 10,
                  opacity: 0,
                },
                {
                  y: 0,
                  opacity: 1,

                  duration:
                    0.32,

                  stagger:
                    0.04,

                  ease:
                    "power2.out",
                },
                "-=0.2"
              );
            }

            /* =============================
               FEATURES
            ============================= */

            if (
              featureRows.length >
              0
            ) {
              timeline.fromTo(
                featureRows,
                {
                  y: 8,
                  opacity: 0,
                },
                {
                  y: 0,
                  opacity: 1,

                  duration:
                    0.25,

                  stagger:
                    0.025,

                  ease:
                    "power2.out",
                },
                "-=0.15"
              );
            }

            /* =============================
               FOOTERS
            ============================= */

            if (
              cardFooters.length >
              0
            ) {
              timeline.fromTo(
                cardFooters,
                {
                  y: 8,
                  opacity: 0,
                },
                {
                  y: 0,
                  opacity: 1,

                  duration:
                    0.3,

                  stagger:
                    0.04,

                  ease:
                    "power2.out",
                },
                "-=0.1"
              );
            }

            return () => {
              timeline.kill();
            };
          }
        );

        /* =====================================
           MOBILE

           Mobile-la movement romba heavy-a
           vechaa scroll lag feel aagum.

           So lighter animation.
        ===================================== */

        media.add(
          "(max-width: 700px)",
          () => {
            const timeline =
              gsap.timeline({
                defaults: {
                  overwrite:
                    "auto",
                },

                scrollTrigger: {
                  trigger:
                    section,

                  start:
                    "top 90%",

                  toggleActions:
                    "play none none none",

                  once: true,
                },
              });

            /* =============================
               WHOLESALE CARD
            ============================= */

            if (
              wholesaleCard
            ) {
              timeline.fromTo(
                wholesaleCard,
                {
                  y: 24,
                  opacity: 0,
                },
                {
                  y: 0,
                  opacity: 1,

                  duration:
                    0.45,

                  ease:
                    "power2.out",
                }
              );
            }

            /* =============================
               RETAIL CARD
            ============================= */

            if (
              retailCard
            ) {
              timeline.fromTo(
                retailCard,
                {
                  y: 24,
                  opacity: 0,
                },
                {
                  y: 0,
                  opacity: 1,

                  duration:
                    0.45,

                  ease:
                    "power2.out",
                },
                "-=0.28"
              );
            }

            /* =============================
               FEATURES

               Very small fade only.
            ============================= */

            if (
              featureRows.length >
              0
            ) {
              timeline.fromTo(
                featureRows,
                {
                  opacity: 0,
                },
                {
                  opacity: 1,

                  duration:
                    0.18,

                  stagger:
                    0.015,

                  ease:
                    "none",
                },
                "-=0.15"
              );
            }

            return () => {
              timeline.kill();
            };
          }
        );

        return () => {
          media.revert();
        };
      }, section);

    /*
      Explicit ScrollTrigger.refresh()
      remove panniruken.

      Every component mount-la refresh panna
      unnecessary layout calculation nadakkum.
    */

    return () => {
      context.revert();
    };
  }, []);

  /* =========================================
     WHOLESALE BUTTON
  ========================================= */

  const handleWholesaleClick =
    () => {
      if (
        isAuthLoading
      ) {
        return;
      }

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
    };

  /* =========================================
     PAGE
  ========================================= */

  return (
    <section
      ref={
        sectionRef
      }
      className="shop-section"
      id="collections"
      aria-label="Shopping experience"
    >
      <div className="shop-grid">
        {/* =================================
            WHOLESALE CARD
        ================================= */}

        <article className="shop-card shop-card-wholesale shop-card-left">
          <div
            className="shop-card-shine"
            aria-hidden="true"
          />

          <div
            className="shop-card-glow"
            aria-hidden="true"
          />

          {/* =============================
              BADGE
          ============================= */}

          <span className="shop-card-badge">
            Boutique &amp;
            Reseller
          </span>

          {/* =============================
              HEADING
          ============================= */}

          <div className="card-heading">
            <span className="card-main-icon">
              <FiShoppingBag />
            </span>

            <div>
              <span className="card-type-label">
                FOR BUSINESS
              </span>

              <h2>
                Wholesale Sarees
              </h2>

              <span className="heading-line" />
            </div>
          </div>

          {/* =============================
              DESCRIPTION
          ============================= */}

          <p className="card-description">
            Premium sarees for
            boutiques, retailers and
            resellers at dedicated
            wholesale prices.
          </p>

          {/* =============================
              FEATURES
          ============================= */}

          <div className="feature-list">
            <div className="feature-row">
              <span className="feature-icon">
                <FiBox />
              </span>

              <span>
                Bulk Orders
              </span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiTruck />
              </span>

              <span>
                PAN India Supply
              </span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiTag />
              </span>

              <span>
                Wholesale Pricing
              </span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiAward />
              </span>

              <span>
                Premium Collections
              </span>
            </div>
          </div>

          {/* =============================
              FOOTER
          ============================= */}

          <div className="card-footer">
            <div className="order-note">
              <strong>
                Minimum Order{" "}
              </strong>

              <span>
                Any 5 Sarees ·
                Mix &amp; Match
              </span>
            </div>

            <button
              type="button"
              className="card-button"
              onClick={
                handleWholesaleClick
              }
              disabled={
                isAuthLoading
              }
            >
              {isAuthLoading
                ? "Please wait..."
                : "Explore Wholesale"}

              <FiArrowRight />
            </button>
          </div>
        </article>

        {/* =================================
            RETAIL CARD
        ================================= */}

        <article className="shop-card shop-card-retail shop-card-right">
          <div
            className="shop-card-shine"
            aria-hidden="true"
          />

          <div
            className="shop-card-glow"
            aria-hidden="true"
          />

          {/* =============================
              BADGE
          ============================= */}

          <span className="shop-card-badge">
            Personal Shopping
          </span>

          {/* =============================
              HEADING
          ============================= */}

          <div className="card-heading">
            <span className="card-main-icon">
              <FiShoppingBag />
            </span>

            <div>
              <span className="card-type-label">
                FOR YOU
              </span>

              <h2>
                Retail Sarees
              </h2>

              <span className="heading-line" />
            </div>
          </div>

          {/* =============================
              DESCRIPTION
          ============================= */}

          <p className="card-description">
            Elegant sarees for
            weddings, festivals and
            everyday occasions,
            available with no minimum
            order.
          </p>

          {/* =============================
              FEATURES
          ============================= */}

          <div className="feature-list">
            <div className="feature-row">
              <span className="feature-icon">
                <FiStar />
              </span>

              <span>
                Silk Sarees
              </span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiLayers />
              </span>

              <span>
                Cotton Sarees
              </span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiHeart />
              </span>

              <span>
                Designer Sarees
              </span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiAward />
              </span>

              <span>
                Ready to Wear
              </span>
            </div>
          </div>

          {/* =============================
              FOOTER
          ============================= */}

          <div className="card-footer">
            <div className="order-note">
              <strong>
                Retail Orders
              </strong>

              <span>
                No Minimum Order
              </span>
            </div>

            <Link
              to="/retail"
              className="card-button"
            >
              Explore Retail

              <FiArrowRight />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}