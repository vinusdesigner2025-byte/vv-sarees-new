import { Link } from "react-router-dom";

import {
  FiArrowRight,
  FiAward,
  FiCheckCircle,
  FiGlobe,
  FiHeart,
  FiMapPin,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTruck,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import aboutStory from "../assets/house of left.jpg";
import aboutJourney from "../assets/journey-screen.jpeg";

import "./About.css";

const values = [
  {
    icon: FiShield,
    title: "Authentic Sourcing",
    description:
      "We work closely with trusted weaving communities and carefully select sarees that reflect genuine craftsmanship.",
  },
  {
    icon: FiAward,
    title: "Premium Quality",
    description:
      "Every saree is reviewed for fabric, finish, weaving quality and overall presentation before it reaches our collection.",
  },
  {
    icon: FiStar,
    title: "Thoughtful Curation",
    description:
      "Our collections are chosen with care to bring together timeless traditions, elegant designs and wearable beauty.",
  },
  {
    icon: FiHeart,
    title: "Customer First",
    description:
      "From product selection to delivery support, we aim to make every VV Sarees shopping experience simple and reliable.",
  },
];

const reasons = [
  "Sarees sourced from celebrated weaving destinations",
  "Retail and wholesale collections in one place",
  "Premium designs selected for every occasion",
  "PAN India delivery support",
  "Dedicated assistance for boutiques and resellers",
  "Careful quality checks before dispatch",
];

export default function About() {
  return (
    <div className="about-page">
      <ProductHeader mode="retail" />

      <main>
        {/* =========================
            HERO
        ========================= */}

        <section className="about-hero">
          <div className="about-hero-glow about-hero-glow-left" />
          <div className="about-hero-glow about-hero-glow-right" />

          <div className="about-hero-content">
            <span className="about-eyebrow">
              VV SAREES
            </span>

            <h1>
              Every Saree
              <span>Tells a Story</span>
            </h1>

            <p>
              We travel across India to discover timeless
              weaves, trusted craftsmanship and elegant
              sarees that carry the beauty of tradition
              into every wardrobe.
            </p>

            <div className="about-hero-actions">
              <Link
                to="/retail"
                className="about-primary-button"
              >
                Explore Retail
                <FiArrowRight />
              </Link>

              <Link
                to="/wholesale"
                className="about-secondary-button"
              >
                Explore Wholesale
              </Link>
            </div>
          </div>
        </section>

        {/* =========================
            OUR STORY
        ========================= */}

        <section className="about-story-section">
          <div className="about-container about-story-grid">
            <div className="about-story-image-wrap">
              <img
                src={aboutStory}
                alt="VV Sarees sourcing and weaving journey"
                className="about-story-image"
                loading="lazy"
              />

              <div className="about-story-badge">
                <FiShoppingBag />

                <div>
                  <strong>
                    Handpicked Collections
                  </strong>

                  <span>
                    Selected with care across India
                  </span>
                </div>
              </div>
            </div>

            <div className="about-story-content">
              <span className="about-section-tag">
                OUR STORY
              </span>

              <h2>
                A Journey Rooted in
                Craftsmanship
              </h2>

              <p>
                VV Sarees began with a simple belief:
                beautiful sarees deserve to reach people
                without losing the authenticity, culture
                and skill behind them.
              </p>

              <p>
                Instead of treating every saree as just
                another product, we see it as a piece of
                heritage. We explore weaving destinations,
                meet suppliers and skilled artisans, and
                carefully handpick collections that reflect
                quality, elegance and tradition.
              </p>

              <p>
                From everyday cotton sarees to festive
                silks and statement designer pieces, every
                collection is selected to serve both
                individual customers and businesses with
                the same level of care.
              </p>

              <blockquote>
                “We Source, You Shine.”
              </blockquote>
            </div>
          </div>
        </section>

        {/* =========================
            JOURNEY
        ========================= */}

        <section className="about-journey-section">
          <div className="about-container">
            <div className="about-section-heading">
              <span className="about-section-tag">
                ACROSS INDIA
              </span>

              <h2>
                From Celebrated Weaving
                Destinations to You
              </h2>

              <p>
                Our sourcing journey takes us through
                regions known for distinctive textiles,
                traditional techniques and timeless saree
                craftsmanship.
              </p>
            </div>

            <div className="about-journey-grid">
              <div className="about-journey-content">
                <div className="about-journey-point">
                  <span className="about-point-icon">
                    <FiMapPin />
                  </span>

                  <div>
                    <h3>We Travel</h3>

                    <p>
                      We explore markets, weaving centres
                      and trusted sourcing destinations
                      across India.
                    </p>
                  </div>
                </div>

                <div className="about-journey-point">
                  <span className="about-point-icon">
                    <FiCheckCircle />
                  </span>

                  <div>
                    <h3>We Select</h3>

                    <p>
                      Every collection is reviewed for
                      quality, design, fabric and value
                      before it becomes part of VV Sarees.
                    </p>
                  </div>
                </div>

                <div className="about-journey-point">
                  <span className="about-point-icon">
                    <FiTruck />
                  </span>

                  <div>
                    <h3>We Deliver</h3>

                    <p>
                      Curated sarees are made available to
                      retail customers, boutiques and
                      resellers across India.
                    </p>
                  </div>
                </div>
              </div>

              <div className="about-journey-image-wrap">
                <img
                  src={aboutJourney}
                  alt="VV Sarees journey across India"
                  className="about-journey-image"
                  loading="lazy"
                />

                <div className="about-journey-stat">
                  <FiGlobe />

                  <div>
                    <strong>
                      Across India
                    </strong>

                    <span>
                      One journey, countless weaving stories
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            VALUES
        ========================= */}

        <section className="about-values-section">
          <div className="about-container">
            <div className="about-section-heading">
              <span className="about-section-tag">
                WHAT WE BELIEVE
              </span>

              <h2>Our Values</h2>

              <p>
                The principles that guide every collection,
                customer interaction and decision at
                VV Sarees.
              </p>
            </div>

            <div className="about-values-grid">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <article
                    className="about-value-card"
                    key={value.title}
                  >
                    <span className="about-value-icon">
                      <Icon />
                    </span>

                    <h3>{value.title}</h3>

                    <p>
                      {value.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================
            WHY CHOOSE US
        ========================= */}

        <section className="about-why-section">
          <div className="about-container about-why-grid">
            <div className="about-why-content">
              <span className="about-section-tag">
                WHY VV SAREES
              </span>

              <h2>
                More Than a Saree Store
              </h2>

              <p>
                VV Sarees brings together traditional
                sourcing experience, curated collections
                and customer-focused service for both
                personal and business shopping.
              </p>

              <div className="about-reasons-list">
                {reasons.map((reason) => (
                  <div
                    className="about-reason-item"
                    key={reason}
                  >
                    <FiCheckCircle />

                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-promise-card">
              <span className="about-promise-icon">
                <FiHeart />
              </span>

              <span className="about-section-tag">
                OUR PROMISE
              </span>

              <h2>
                Heritage, Quality and
                Elegance in Every Collection
              </h2>

              <p>
                We are committed to bringing thoughtfully
                sourced sarees to customers while
                celebrating the artistry, culture and
                craftsmanship that make Indian textiles
                timeless.
              </p>

              <p>
                Whether you are choosing one saree for a
                special occasion or sourcing collections
                for your boutique, our promise remains the
                same: careful selection, dependable service
                and genuine value.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            FINAL CTA
        ========================= */}

        <section className="about-cta-section">
          <div className="about-cta-content">
            <span className="about-section-tag">
              DISCOVER VV SAREES
            </span>

            <h2>
              Find a Saree That Feels
              Made for You
            </h2>

            <p>
              Explore collections selected for boutiques,
              celebrations, everyday elegance and timeless
              personal style.
            </p>

            <div className="about-cta-actions">
              <Link
                to="/retail"
                className="about-primary-button"
              >
                Shop Retail
                <FiArrowRight />
              </Link>

              <Link
                to="/wholesale"
                className="about-secondary-button"
              >
                Shop Wholesale
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}