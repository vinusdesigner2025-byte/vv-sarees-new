import {
  useLayoutEffect,
  useRef,
} from "react";

import { Link } from "react-router-dom";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

import "./WholesaleRetail.css";

gsap.registerPlugin(ScrollTrigger);

export default function WholesaleRetail() {
  const sectionRef =
    useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      /* =========================
         DESKTOP
      ========================= */

      media.add(
        "(min-width: 701px)",
        () => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              toggleActions:
                "play none none none",
            },
          });

          timeline
            .fromTo(
              ".shop-tag",
              {
                y: 16,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.45,
                ease: "power2.out",
              }
            )
            .fromTo(
              ".shop-heading h2",
              {
                y: 24,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power3.out",
              },
              "-=0.2"
            )
            .fromTo(
              ".shop-heading p",
              {
                y: 18,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
              },
              "-=0.3"
            )
            .fromTo(
              ".shop-card-left",
              {
                x: -90,
                y: 18,
                opacity: 0,
              },
              {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.85,
                ease: "power3.out",
              },
              "-=0.05"
            )
            .fromTo(
              ".shop-card-right",
              {
                x: 90,
                y: 18,
                opacity: 0,
              },
              {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.85,
                ease: "power3.out",
              },
              "-=0.65"
            )
            .fromTo(
              ".feature-row",
              {
                y: 12,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.38,
                stagger: 0.06,
                ease: "power2.out",
              },
              "-=0.35"
            );
        }
      );

      /* =========================
         MOBILE
      ========================= */

      media.add(
        "(max-width: 700px)",
        () => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              toggleActions:
                "play none none none",
            },
          });

          timeline
            .fromTo(
              ".shop-tag",
              {
                y: 12,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
              }
            )
            .fromTo(
              ".shop-heading h2",
              {
                y: 18,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.48,
                ease: "power3.out",
              },
              "-=0.18"
            )
            .fromTo(
              ".shop-heading p",
              {
                y: 14,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.42,
                ease: "power2.out",
              },
              "-=0.27"
            )
            .fromTo(
              ".shop-card-left",
              {
                xPercent: -110,
                y: 12,
                scale: 0.94,
                opacity: 0,
              },
              {
                xPercent: 0,
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.95,
                ease: "expo.out",
              },
              "-=0.05"
            )
            .fromTo(
              ".shop-card-right",
              {
                xPercent: 110,
                y: 12,
                scale: 0.94,
                opacity: 0,
              },
              {
                xPercent: 0,
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.95,
                ease: "expo.out",
              },
              "-=0.82"
            )
            .fromTo(
              ".feature-row",
              {
                y: 8,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.28,
                stagger: 0.025,
                ease: "power2.out",
              },
              "-=0.38"
            );
        }
      );

      return () => media.revert();
    }, section);

    ScrollTrigger.refresh();

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="shop-section"
      id="collections"
      aria-labelledby="shopping-experience-title"
    >

      <div className="shop-grid">
        {/* Wholesale */}

        <article className="shop-card shop-card-wholesale shop-card-left">
          <div
            className="shop-card-shine"
            aria-hidden="true"
          />

          <div
            className="shop-card-glow"
            aria-hidden="true"
          />

          <span className="shop-card-badge">
            Boutique &amp; Reseller
          </span>

          <div className="card-heading">
            <span className="card-main-icon">
              <FiShoppingBag />
            </span>

            <div>
              <span className="card-type-label">
                FOR BUSINESS
              </span>

              <h2>Wholesale Sarees</h2>

              <span className="heading-line" />
            </div>
          </div>

          <p className="card-description">
            Premium sarees for boutiques,
            retailers and resellers at dedicated
            wholesale prices.
          </p>

          <div className="feature-list">
            <div className="feature-row">
              <span className="feature-icon">
                <FiBox />
              </span>

              <span>Bulk Orders</span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiTruck />
              </span>

              <span>PAN India Supply</span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiTag />
              </span>

              <span>Wholesale Pricing</span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiAward />
              </span>

              <span>Premium Collections</span>
            </div>
          </div>

          <div className="card-footer">
            <div className="order-note">
              <strong>Minimum Order </strong>

              <span>
                Any 5 Sarees · Mix &amp; Match
              </span>
            </div>

            <Link
              to="/wholesale-register"
              className="card-button"
            >
              Explore Wholesale
              <FiArrowRight />
            </Link>
          </div>
        </article>

        {/* Retail */}

        <article className="shop-card shop-card-retail shop-card-right">
          <div
            className="shop-card-shine"
            aria-hidden="true"
          />

          <div
            className="shop-card-glow"
            aria-hidden="true"
          />

          <span className="shop-card-badge">
            Personal Shopping
          </span>

          <div className="card-heading">
            <span className="card-main-icon">
              <FiShoppingBag />
            </span>

            <div>
              <span className="card-type-label">
                FOR YOU
              </span>

              <h2>Retail Sarees</h2>

              <span className="heading-line" />
            </div>
          </div>

          <p className="card-description">
            Elegant sarees for weddings,
            festivals and everyday occasions,
            available with no minimum order.
          </p>

          <div className="feature-list">
            <div className="feature-row">
              <span className="feature-icon">
                <FiStar />
              </span>

              <span>Silk Sarees</span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiLayers />
              </span>

              <span>Cotton Sarees</span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiHeart />
              </span>

              <span>Designer Sarees</span>
            </div>

            <div className="feature-row">
              <span className="feature-icon">
                <FiAward />
              </span>

              <span>Ready to Wear</span>
            </div>
          </div>

          <div className="card-footer">
            <div className="order-note">
              <strong>Retail Orders</strong>

              <span>No Minimum Order</span>
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