import {
  FiClock,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSend,
} from "react-icons/fi";

import { FaWhatsapp } from "react-icons/fa";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import "./Contact.css";

const contactItems = [
  {
    icon: FiPhone,
    title: "Call Us",
    value: "+91 99431 09876",
    href: "tel:+919943109876",
  },
  {
    icon: FaWhatsapp,
    title: "WhatsApp",
    value: "+91 99431 09876",
    href: "https://wa.me/919943109876",
  },
  {
    icon: FiMail,
    title: "Email Us",
    value: "info@vvsarees.com",
    href: "mailto:info@vvsarees.com",
  },
  {
    icon: FiMapPin,
    title: "Our Location",
    value: "Madurai, Tamil Nadu, India",
    href: "#contact-location",
  },
];

export default function Contact() {
  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
  };

  return (
    <div className="contact-page">
      <ProductHeader mode="retail" />

      <main>
        {/* =========================
            HERO
        ========================= */}

        <section className="contact-hero">
          <div className="contact-hero-glow contact-glow-left" />
          <div className="contact-hero-glow contact-glow-right" />

          <div className="contact-hero-content">
            <span className="contact-eyebrow">
              VV SAREES
            </span>

            <h1>Get in Touch</h1>

            <p>
              Have a question about our retail collections,
              wholesale orders, delivery or your purchase?
              Our team is here to help.
            </p>
          </div>
        </section>

        {/* =========================
            CONTACT CARDS
        ========================= */}

        <section className="contact-cards-section">
          <div className="contact-container contact-cards-grid">
            {contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  href={item.href}
                  className="contact-card"
                  key={item.title}
                  target={
                    item.title === "WhatsApp"
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    item.title === "WhatsApp"
                      ? "noreferrer"
                      : undefined
                  }
                >
                  <span className="contact-card-icon">
                    <Icon />
                  </span>

                  <div>
                    <span>{item.title}</span>
                    <strong>{item.value}</strong>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* =========================
            FORM + INFO
        ========================= */}

        <section className="contact-main-section">
          <div className="contact-container contact-main-grid">
            <div className="contact-form-wrap">
              <span className="contact-section-tag">
                SEND US A MESSAGE
              </span>

              <h2>
                We&apos;d Love to Hear from You
              </h2>

              <p className="contact-form-intro">
                Share your enquiry with us and our team
                will get back to you as soon as possible.
              </p>

              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >
                <div className="contact-form-row">
                  <label>
                    <span>Full Name</span>

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      required
                    />
                  </label>

                  <label>
                    <span>Phone Number</span>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      required
                    />
                  </label>
                </div>

                <div className="contact-form-row">
                  <label>
                    <span>Email Address</span>

                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                    />
                  </label>

                  <label>
                    <span>Enquiry Type</span>

                    <select
                      name="enquiryType"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Select enquiry type
                      </option>

                      <option value="retail">
                        Retail Order
                      </option>

                      <option value="wholesale">
                        Wholesale Order
                      </option>

                      <option value="delivery">
                        Delivery Support
                      </option>

                      <option value="returns">
                        Return or Refund
                      </option>

                      <option value="general">
                        General Enquiry
                      </option>
                    </select>
                  </label>
                </div>

                <label className="contact-message-label">
                  <span>Your Message</span>

                  <textarea
                    name="message"
                    rows={6}
                    placeholder="Tell us how we can help"
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="contact-submit-button"
                >
                  Send Message
                  <FiSend />
                </button>
              </form>
            </div>

            <aside className="contact-info-panel">
              <span className="contact-section-tag">
                CUSTOMER SUPPORT
              </span>

              <h2>We&apos;re Here to Help</h2>

              <p>
                Reach us for product guidance, wholesale
                support, order updates, delivery queries
                or assistance after your purchase.
              </p>

              <div className="contact-support-list">
                <div className="contact-support-item">
                  <span>
                    <FiMessageCircle />
                  </span>

                  <div>
                    <strong>Quick Assistance</strong>

                    <p>
                      WhatsApp is the fastest way to reach
                      our support team.
                    </p>
                  </div>
                </div>

                <div className="contact-support-item">
                  <span>
                    <FiClock />
                  </span>

                  <div>
                    <strong>Support Hours</strong>

                    <p>
                      Monday to Saturday, 10:00 AM to
                      7:00 PM.
                    </p>
                  </div>
                </div>

                <div className="contact-support-item">
                  <span>
                    <FiMail />
                  </span>

                  <div>
                    <strong>Email Support</strong>

                    <p>
                      Email us for detailed enquiries,
                      invoices or business requests.
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/919943109876"
                target="_blank"
                rel="noreferrer"
                className="contact-whatsapp-button"
              >
                <FaWhatsapp />
                Chat on WhatsApp
              </a>
            </aside>
          </div>
        </section>

        {/* =========================
            LOCATION
        ========================= */}

        <section
          className="contact-location-section"
          id="contact-location"
        >
          <div className="contact-container">
            <div className="contact-location-card">
              <div className="contact-location-content">
                <span className="contact-section-tag">
                  OUR LOCATION
                </span>

                <h2>Visit VV Sarees</h2>

                <p>
                  Madurai, Tamil Nadu, India
                </p>

                <p>
                  For showroom visits or business meetings,
                  please contact us in advance so our team
                  can assist you better.
                </p>

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-location-button"
                >
                  <FiMapPin />
                  Open in Maps
                </a>
              </div>

              <div className="contact-map-placeholder">
                <FiMapPin />

                <span>VV Sarees</span>

                <small>
                  Madurai, Tamil Nadu
                </small>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}