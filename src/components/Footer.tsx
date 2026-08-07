import { useMemo } from "react";
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

import { useWebsiteMedia } from "../context/WebsiteMediaContext";

import logo from "../assets/VV logo.png";
import "./Footer.css";

type WebsiteMediaRow = {
  id: number;
  section: string | null;
  slot_key: string | null;
  settings: Record<string, unknown> | null;
};

type ContactSocialSettings = {
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  email: string;
  location: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
};

function getSettingString(
  settings: Record<string, unknown> | null,
  key: string
) {
  const value = settings?.[key];

  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanPhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

export default function Footer() {
  const { media } = useWebsiteMedia();

  const settings =
    useMemo<ContactSocialSettings>(() => {
      const row = (media as WebsiteMediaRow[]).find(
        (item) =>
          item.section === "site-settings" &&
          item.slot_key === "contact-social"
      );

      return {
        primaryPhone: getSettingString(
          row?.settings ?? null,
          "primaryPhone"
        ),
        secondaryPhone: getSettingString(
          row?.settings ?? null,
          "secondaryPhone"
        ),
        whatsappNumber: getSettingString(
          row?.settings ?? null,
          "whatsappNumber"
        ),
        email:
          getSettingString(
            row?.settings ?? null,
            "email"
          ) || "info@vvsarees.com",
        location:
          getSettingString(
            row?.settings ?? null,
            "location"
          ) || "Chennai, Tamil Nadu",
        instagramUrl: getSettingString(
          row?.settings ?? null,
          "instagramUrl"
        ),
        facebookUrl: getSettingString(
          row?.settings ?? null,
          "facebookUrl"
        ),
        youtubeUrl: getSettingString(
          row?.settings ?? null,
          "youtubeUrl"
        ),
      };
    }, [media]);

  const primaryPhoneLink =
    cleanPhoneNumber(settings.primaryPhone);

  const secondaryPhoneLink =
    cleanPhoneNumber(settings.secondaryPhone);

  const whatsappNumber =
    cleanPhoneNumber(settings.whatsappNumber);

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "";

  const socialLinkProps = (
    url: string
  ) => ({
    href: url || undefined,
    target: url ? "_blank" : undefined,
    rel: url ? "noreferrer" : undefined,
    onClick: (
      event: React.MouseEvent<HTMLAnchorElement>
    ) => {
      if (!url) {
        event.preventDefault();
      }
    },
  });

  return (
    <footer>
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
                <span>
                  Voice of Vanigan Sarees
                </span>
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
              <Link to="/wholesale">
                Wholesale
              </Link>
              <Link to="/retail">
                Retail
              </Link>
              <Link to="/about">
                About Us
              </Link>
              <Link to="/contact">
                Contact Us
              </Link>
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
              {settings.primaryPhone && (
                <a
                  href={`tel:${primaryPhoneLink}`}
                >
                  <FiPhone />
                  <span>
                    {settings.primaryPhone}
                  </span>
                </a>
              )}

              {settings.secondaryPhone && (
                <a
                  href={`tel:${secondaryPhoneLink}`}
                >
                  <FiPhone />
                  <span>
                    {settings.secondaryPhone}
                  </span>
                </a>
              )}

              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                >
                  <FiMail />
                  <span>
                    {settings.email}
                  </span>
                </a>
              )}

              {settings.location && (
                <div>
                  <FiMapPin />
                  <span>
                    {settings.location}
                  </span>
                </div>
              )}
            </div>

            <div className="footer-socials">
              <a
                {...socialLinkProps(
                  settings.instagramUrl
                )}
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                {...socialLinkProps(
                  settings.facebookUrl
                )}
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

              <a
                {...socialLinkProps(
                  settings.youtubeUrl
                )}
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>

              <a
                {...socialLinkProps(
                  whatsappUrl
                )}
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

          <span>
            We Source, You Shine.
          </span>
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
            <span>
              Voice of Vanigan Sarees
            </span>
          </div>
        </div>

        <details className="footer-accordion">
          <summary>
            <span>Information</span>
            <FiChevronDown />
          </summary>

          <nav className="footer-accordion-content">
            <Link to="/">Home</Link>
            <Link to="/wholesale">
              Wholesale
            </Link>
            <Link to="/retail">
              Retail
            </Link>
            <Link to="/about">
              About Us
            </Link>
            <Link to="/contact">
              Contact Us
            </Link>
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
            {settings.primaryPhone && (
              <a
                href={`tel:${primaryPhoneLink}`}
              >
                <FiPhone />
                {settings.primaryPhone}
              </a>
            )}

            {settings.secondaryPhone && (
              <a
                href={`tel:${secondaryPhoneLink}`}
              >
                <FiPhone />
                {settings.secondaryPhone}
              </a>
            )}

            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
              >
                <FiMail />
                {settings.email}
              </a>
            )}

            {settings.location && (
              <div>
                <FiMapPin />
                {settings.location}
              </div>
            )}

            <div className="footer-mobile-socials">
              <a
                {...socialLinkProps(
                  settings.instagramUrl
                )}
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                {...socialLinkProps(
                  settings.facebookUrl
                )}
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

              <a
                {...socialLinkProps(
                  settings.youtubeUrl
                )}
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>

              <a
                {...socialLinkProps(
                  whatsappUrl
                )}
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </details>

        <details className="footer-accordion">
          <summary>
            <span>
              Subscribe Our Newsletter
            </span>
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

          <span>
            We Source, You Shine.
          </span>
        </div>
      </div>
    </footer>
  );
}