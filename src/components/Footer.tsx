import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

import {
  FiChevronDown,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import logo from "../assets/VV logo.png";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* =========================
          DESKTOP FOOTER
      ========================= */}

      <div className="footer-desktop">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <img
                src={logo}
                alt="VV Sarees"
                className="footer-logo"
              />

              <div>
                <h2>VV Sarees</h2>
                <span>Voice of Vanigan Sarees</span>
              </div>
            </div>

            <p className="footer-tagline">
              We Source, You Shine.
            </p>

            <p className="footer-description">
              Handpicked premium sarees sourced
              directly from skilled weavers across
              India.
            </p>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>

            <nav className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/wholesale">Wholesale</Link>
              <Link to="/retail">Retail</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>
            </nav>
          </div>

          <div className="footer-column">
            <h3>Customer Care</h3>

            <nav className="footer-links">
              <Link to="/track-order">
                Track Order
              </Link>

              <Link to="/policies#shipping">
                Shipping Policy
              </Link>

              <Link to="/policies#returns">
                Return Policy
              </Link>

              <Link to="/policies#privacy">
                Privacy Policy
              </Link>

              <Link to="/policies#terms">
                Terms &amp; Conditions
              </Link>
            </nav>
          </div>

          <div className="footer-column footer-contact-column">
            <h3>Contact</h3>

            <div className="footer-contact-list">
              <a href="tel:+91XXXXXXXXXX">
                <FiPhone />
                <span>+91 XXXXX XXXXX</span>
              </a>

              <a href="mailto:info@vvsarees.com">
                <FiMail />
                <span>info@vvsarees.com</span>
              </a>

              <div>
                <FiMapPin />
                <span>Chennai, Tamil Nadu</span>
              </div>
            </div>

            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>

              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="#" aria-label="YouTube">
                <FaYoutube />
              </a>

              <a
                href="https://wa.me/91XXXXXXXXXX"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2026 VV Sarees. All rights reserved.
          </p>

          <span>We Source, You Shine.</span>
        </div>
      </div>

      {/* =========================
          MOBILE ACCORDION FOOTER
      ========================= */}

      <div className="footer-mobile">
        <div className="footer-mobile-brand">
          <img
            src={logo}
            alt="VV Sarees"
            className="footer-mobile-logo"
          />

          <div>
            <h2>VV Sarees</h2>
            <span>Voice of Vanigan Sarees</span>
          </div>
        </div>

        <details className="footer-accordion">
          <summary>
            <span>Information</span>
            <FiChevronDown />
          </summary>

          <nav className="footer-accordion-content">
            <Link to="/">Home</Link>
            <Link to="/wholesale">Wholesale</Link>
            <Link to="/retail">Retail</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>
        </details>

        <details className="footer-accordion">
          <summary>
            <span>Support</span>
            <FiChevronDown />
          </summary>

          <nav className="footer-accordion-content">
            <Link to="/track-order">
              Track Order
            </Link>

            <Link to="/policies#shipping">
              Shipping Policy
            </Link>

            <Link to="/policies#returns">
              Return Policy
            </Link>

            <Link to="/policies#privacy">
              Privacy Policy
            </Link>

            <Link to="/policies#terms">
              Terms &amp; Conditions
            </Link>
          </nav>
        </details>

        <details className="footer-accordion">
          <summary>
            <span>Get in Touch</span>
            <FiChevronDown />
          </summary>

          <div className="footer-mobile-contact">
            <a href="tel:+91XXXXXXXXXX">
              <FiPhone />
              +91 XXXXX XXXXX
            </a>

            <a href="mailto:info@vvsarees.com">
              <FiMail />
              info@vvsarees.com
            </a>

            <div>
              <FiMapPin />
              Chennai, Tamil Nadu
            </div>

            <div className="footer-mobile-socials">
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>

              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="#" aria-label="YouTube">
                <FaYoutube />
              </a>

              <a
                href="https://wa.me/91XXXXXXXXXX"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </details>

        <details className="footer-accordion">
          <summary>
            <span>Subscribe Our Newsletter</span>
            <FiChevronDown />
          </summary>

          <form
            className="footer-newsletter"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              required
            />

            <button type="submit">
              Subscribe
            </button>
          </form>
        </details>

        <div className="footer-mobile-art">
          <div className="footer-mobile-decoration" />

          <p>
            © 2026 VV Sarees. All rights reserved.
          </p>

          <span>We Source, You Shine.</span>
        </div>
      </div>
    </footer>
  );
}