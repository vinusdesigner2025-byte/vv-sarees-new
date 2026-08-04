import { FaWhatsapp } from "react-icons/fa";
import "./FinalCTA.css";

export default function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="final-cta-content">
        <span className="final-cta-tag">
          VV SAREES
        </span>

        <h2>
          Ready to Find Your Perfect Saree?
        </h2>

        <p>
          Whether you're shopping for your boutique
          or your personal collection, discover
          premium sarees sourced directly from
          skilled weavers across India.
        </p>

        <a
          href="https://wa.me/91XXXXXXXXXX"
          target="_blank"
          rel="noreferrer"
          className="final-whatsapp-button"
        >
          <FaWhatsapp />
          Connect on WhatsApp
        </a>
      </div>
    </section>
  );
}