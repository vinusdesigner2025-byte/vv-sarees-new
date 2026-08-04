import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiHelpCircle,
  FiLock,
  FiMail,
  FiMapPin,
  FiPackage,
  FiRefreshCcw,
  FiShield,
  FiTruck,
} from "react-icons/fi";

import { FaWhatsapp } from "react-icons/fa";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import "./Policies.css";

const policyNavigation = [
  {
    id: "shipping",
    label: "Shipping",
    description: "Dispatch, delivery and tracking",
    icon: FiTruck,
  },
  {
    id: "returns",
    label: "Returns",
    description: "Returns, exchanges and refunds",
    icon: FiRefreshCcw,
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "How your information is handled",
    icon: FiLock,
  },
  {
    id: "terms",
    label: "Terms",
    description: "Conditions for using our website",
    icon: FiFileText,
  },
];

export default function Policies() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const sectionId = location.hash.replace("#", "");

    const timeoutId = window.setTimeout(() => {
      const section = document.getElementById(sectionId);

      section?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [location.hash]);

  return (
    <div className="policies-page">
      <ProductHeader mode="retail" />

      <main>
        <section className="policies-hero">
          <div className="policies-hero-glow policies-glow-left" />
          <div className="policies-hero-glow policies-glow-right" />

          <div className="policies-hero-content">
            <span className="policies-eyebrow">
              VV SAREES
            </span>

            <h1>Our Policies</h1>

            <p>
              Everything you need to know about
              shipping, returns, privacy and shopping
              with VV Sarees.
            </p>

            <div className="policies-updated">
              <FiClock />

              <span>
                Last updated: 27 July 2026
              </span>
            </div>
          </div>
        </section>

        <section
          className="policies-navigation-section"
          aria-label="Policy navigation"
        >
          <div className="policies-navigation">
            {policyNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  href={`#${item.id}`}
                  className="policy-navigation-card"
                  key={item.id}
                >
                  <span className="policy-navigation-icon">
                    <Icon />
                  </span>

                  <span className="policy-navigation-content">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>

                  <FiArrowUpRight className="policy-navigation-arrow" />
                </a>
              );
            })}
          </div>
        </section>

        <div className="policies-content-container">
          <section
            className="policy-section"
            id="shipping"
          >
            <div className="policy-section-heading">
              <span className="policy-section-icon">
                <FiTruck />
              </span>

              <div>
                <span className="policy-section-number">
                  01
                </span>

                <h2>Shipping Policy</h2>

                <p>
                  Information about order processing,
                  dispatch, delivery and tracking.
                </p>
              </div>
            </div>

            <div className="policy-content-card">
              <div className="policy-highlight-grid">
                <div className="policy-highlight">
                  <FiPackage />

                  <div>
                    <strong>Order Processing</strong>
                    <span>Usually 1–3 business days</span>
                  </div>
                </div>

                <div className="policy-highlight">
                  <FiTruck />

                  <div>
                    <strong>Estimated Delivery</strong>
                    <span>Usually 3–7 business days</span>
                  </div>
                </div>

                <div className="policy-highlight">
                  <FiMapPin />

                  <div>
                    <strong>Service Area</strong>
                    <span>Available across India</span>
                  </div>
                </div>
              </div>

              <div className="policy-copy">
                <h3>Order Processing</h3>

                <p>
                  Orders are normally processed after
                  successful payment confirmation. Orders
                  placed on Sundays, public holidays or
                  during high-demand sale periods may
                  require additional processing time.
                </p>

                <h3>Shipping Charges</h3>

                <p>
                  Shipping charges, when applicable, will
                  be displayed during checkout before the
                  order is confirmed. Any free-shipping
                  offer will apply only to the locations,
                  order values and promotional periods
                  specified on the website.
                </p>

                <h3>Delivery Estimates</h3>

                <p>
                  Delivery estimates are indicative and may
                  vary depending on the destination,
                  courier availability, weather,
                  operational delays, public holidays or
                  other circumstances outside our
                  reasonable control.
                </p>

                <h3>Order Tracking</h3>

                <p>
                  Once an order has been dispatched,
                  available tracking details will be shared
                  through the contact information provided
                  during checkout. Customers may also use
                  the Track Order page where supported.
                </p>

                <h3>Incorrect Delivery Information</h3>

                <p>
                  Customers are responsible for providing
                  an accurate address and reachable phone
                  number. Additional charges resulting from
                  an incorrect or incomplete address may
                  need to be paid before redelivery.
                </p>

                <div className="policy-notice">
                  <FiAlertCircle />

                  <p>
                    Wholesale orders, large-volume orders
                    and customised dispatch arrangements
                    may have separate timelines confirmed
                    directly by VV Sarees.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            className="policy-section"
            id="returns"
          >
            <div className="policy-section-heading">
              <span className="policy-section-icon">
                <FiRefreshCcw />
              </span>

              <div>
                <span className="policy-section-number">
                  02
                </span>

                <h2>Return &amp; Refund Policy</h2>

                <p>
                  Conditions for reporting damaged,
                  incorrect or eligible return items.
                </p>
              </div>
            </div>

            <div className="policy-content-card">
              <div className="policy-copy">
                <h3>Reporting an Issue</h3>

                <p>
                  Please inspect the parcel immediately
                  after delivery. A damaged product,
                  incorrect product or missing item should
                  be reported to VV Sarees within 48 hours
                  of delivery using WhatsApp or email.
                </p>

                <h3>Required Evidence</h3>

                <p>
                  To help us verify delivery-related
                  issues, customers may be requested to
                  provide the order number, photographs of
                  the product and packaging, shipping
                  label, and a continuous parcel-opening
                  video.
                </p>

                <h3>Return Eligibility</h3>

                <ul>
                  <li>
                    The item must be unused, unworn,
                    unwashed and unaltered.
                  </li>

                  <li>
                    Original tags, packaging, accessories
                    and invoice must be retained.
                  </li>

                  <li>
                    The request must relate to an eligible
                    issue accepted by VV Sarees.
                  </li>

                  <li>
                    The product must be returned using the
                    instructions shared by our support
                    team.
                  </li>
                </ul>

                <h3>Non-Returnable Items</h3>

                <ul>
                  <li>
                    Sarees that have been worn, washed,
                    ironed, altered or damaged after
                    delivery.
                  </li>

                  <li>
                    Blouses or garments that have been
                    stitched, customised or altered.
                  </li>

                  <li>
                    Products purchased during clearance or
                    final-sale offers when clearly marked
                    non-returnable.
                  </li>

                  <li>
                    Minor colour variations caused by
                    lighting, photography or screen
                    settings.
                  </li>

                  <li>
                    Natural variations associated with
                    handloom, hand-dyed or handcrafted
                    products where these are not defects.
                  </li>
                </ul>

                <h3>Refunds</h3>

                <p>
                  Once an approved return is received and
                  inspected, the customer will be informed
                  of the outcome. Approved refunds will
                  generally be initiated to the original
                  payment method. Bank or payment-provider
                  processing time may apply.
                </p>

                <h3>Cancellation</h3>

                <p>
                  A cancellation request may be considered
                  before dispatch. Once an order has been
                  packed or handed to the courier,
                  cancellation may no longer be possible.
                </p>

                <div className="policy-notice policy-notice-success">
                  <FiCheckCircle />

                  <p>
                    Nothing in this policy is intended to
                    limit any non-waivable rights available
                    under applicable consumer law.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            className="policy-section"
            id="privacy"
          >
            <div className="policy-section-heading">
              <span className="policy-section-icon">
                <FiLock />
              </span>

              <div>
                <span className="policy-section-number">
                  03
                </span>

                <h2>Privacy Policy</h2>

                <p>
                  How VV Sarees may collect, use and
                  protect customer information.
                </p>
              </div>
            </div>

            <div className="policy-content-card">
              <div className="policy-highlight-grid">
                <div className="policy-highlight">
                  <FiShield />

                  <div>
                    <strong>Secure Handling</strong>
                    <span>
                      Information used only as needed
                    </span>
                  </div>
                </div>

                <div className="policy-highlight">
                  <FiLock />

                  <div>
                    <strong>Access Control</strong>
                    <span>
                      Limited to authorised services
                    </span>
                  </div>
                </div>

                <div className="policy-highlight">
                  <FiMail />

                  <div>
                    <strong>Your Choices</strong>
                    <span>
                      Contact us regarding your data
                    </span>
                  </div>
                </div>
              </div>

              <div className="policy-copy">
                <h3>Information We May Collect</h3>

                <ul>
                  <li>
                    Name, phone number, email address and
                    delivery address.
                  </li>

                  <li>
                    Account, wishlist, cart and order
                    information.
                  </li>

                  <li>
                    Product preferences, communication
                    history and support requests.
                  </li>

                  <li>
                    Device, browser and website-usage
                    information collected through
                    essential technical tools.
                  </li>

                  <li>
                    Payment status and transaction
                    references supplied by the payment
                    provider.
                  </li>
                </ul>

                <h3>How Information May Be Used</h3>

                <ul>
                  <li>
                    To create and manage customer accounts.
                  </li>

                  <li>
                    To process, deliver and support orders.
                  </li>

                  <li>
                    To communicate order, payment and
                    delivery updates.
                  </li>

                  <li>
                    To prevent misuse, fraud and security
                    incidents.
                  </li>

                  <li>
                    To improve website performance and the
                    customer experience.
                  </li>

                  <li>
                    To send promotional communication when
                    consent or another lawful basis
                    permits it.
                  </li>
                </ul>

                <h3>Payment Information</h3>

                <p>
                  Payments may be processed by a
                  third-party payment provider. VV Sarees
                  does not intend to store complete card,
                  UPI PIN or banking credentials on its
                  own website.
                </p>

                <h3>Sharing of Information</h3>

                <p>
                  Information may be shared with service
                  providers such as payment processors,
                  logistics partners, hosting providers
                  and technical-support providers only
                  where reasonably required to operate the
                  service, comply with law or protect
                  legitimate interests.
                </p>

                <h3>Cookies and Technical Tools</h3>

                <p>
                  The website may use essential cookies or
                  similar tools to maintain sessions,
                  remember cart preferences, improve
                  security and understand website
                  performance.
                </p>

                <h3>Data Retention</h3>

                <p>
                  Information will be retained only for as
                  long as reasonably necessary for the
                  purposes described in this policy,
                  including order support, accounting,
                  security and legal requirements.
                </p>

                <h3>Your Requests</h3>

                <p>
                  Customers may contact VV Sarees to
                  request reasonable access, correction or
                  deletion of personal information,
                  subject to identity verification and
                  applicable legal or record-retention
                  requirements.
                </p>
              </div>
            </div>
          </section>

          <section
            className="policy-section"
            id="terms"
          >
            <div className="policy-section-heading">
              <span className="policy-section-icon">
                <FiFileText />
              </span>

              <div>
                <span className="policy-section-number">
                  04
                </span>

                <h2>Terms &amp; Conditions</h2>

                <p>
                  The terms governing access to and
                  purchases from the VV Sarees website.
                </p>
              </div>
            </div>

            <div className="policy-content-card">
              <div className="policy-copy">
                <h3>Acceptance of Terms</h3>

                <p>
                  By accessing the website, creating an
                  account or placing an order, the user
                  agrees to these terms and the policies
                  displayed on the website.
                </p>

                <h3>Product Information</h3>

                <p>
                  VV Sarees aims to present product
                  descriptions, images, colours, pricing
                  and availability accurately. However,
                  colour appearance may differ depending
                  on lighting, photography and screen
                  settings.
                </p>

                <h3>Pricing and Availability</h3>

                <p>
                  Prices and stock may change without prior
                  notice. An item placed in the cart is not
                  reserved until the order is successfully
                  confirmed.
                </p>

                <h3>Wholesale Orders</h3>

                <p>
                  Wholesale pricing and checkout may be
                  subject to minimum-quantity requirements.
                  The current website rule is a minimum of
                  any five sarees, with mix-and-match
                  options where available.
                </p>

                <h3>Payments</h3>

                <p>
                  Orders are confirmed only after
                  successful payment or acceptance of an
                  available payment method.
                </p>

                <h3>Customer Accounts</h3>

                <p>
                  Customers are responsible for maintaining
                  the confidentiality of their account and
                  for providing accurate, current
                  information.
                </p>

                <h3>Permitted Use</h3>

                <p>
                  The website must not be used for
                  unlawful activity, interference with
                  website security, automated extraction
                  of content, impersonation, fraudulent
                  ordering or infringement of intellectual
                  property.
                </p>

                <h3>Intellectual Property</h3>

                <p>
                  Website design, branding, logos,
                  photography, graphics, product copy and
                  other original content belonging to VV
                  Sarees may not be reproduced or used
                  commercially without prior written
                  permission.
                </p>

                <h3>Third-Party Services</h3>

                <p>
                  The website may rely on third-party
                  services for payments, communication,
                  hosting, analytics and delivery.
                </p>

                <h3>Changes to These Policies</h3>

                <p>
                  Policies may be updated to reflect
                  operational, legal or technical changes.
                  The latest version and updated date will
                  be published on this page.
                </p>

                <h3>Governing Law</h3>

                <p>
                  These terms are governed by the
                  applicable laws of India. Subject to
                  applicable consumer rights and
                  jurisdictional requirements, disputes
                  will be handled through competent courts
                  or authorities in Chennai, Tamil Nadu.
                </p>
              </div>
            </div>
          </section>

          <section className="policies-help-section">
            <div className="policies-help-icon">
              <FiHelpCircle />
            </div>

            <span>NEED MORE HELP?</span>

            <h2>Still Have a Question?</h2>

            <p>
              Contact the VV Sarees team for help with
              orders, delivery, returns or these policies.
            </p>

            <div className="policies-help-actions">
              <a
                href="https://wa.me/919943109876"
                target="_blank"
                rel="noreferrer"
                className="policies-whatsapp-button"
              >
                <FaWhatsapp />
                Chat on WhatsApp
              </a>

              <a
                href="mailto:info@vvsarees.com"
                className="policies-email-button"
              >
                <FiMail />
                Email Us
              </a>
            </div>

            <div className="policies-contact-details">
              <span>
                <FiMail />
                info@vvsarees.com
              </span>

              <span>
                <FiMapPin />
                Chennai, Tamil Nadu, India
              </span>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}