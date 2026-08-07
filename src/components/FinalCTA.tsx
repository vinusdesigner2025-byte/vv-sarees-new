import { useMemo } from "react";
import { FaWhatsapp } from "react-icons/fa";

import { useWebsiteMedia } from "../context/WebsiteMediaContext";

import "./FinalCTA.css";

type WebsiteMediaRow = {
  id: number;
  section: string | null;
  slot_key: string | null;
  settings: Record<string, unknown> | null;
};

export default function FinalCTA() {
  const { media } = useWebsiteMedia();

  const whatsappNumber = useMemo(() => {
    const settingsRow = (media as WebsiteMediaRow[]).find(
      (item) =>
        item.section === "site-settings" &&
        item.slot_key === "contact-social"
    );

    const number = settingsRow?.settings?.whatsappNumber;

    if (typeof number !== "string") {
      return "";
    }

    // wa.me-ku +, spaces, hyphen ellam remove pannuvom
    return number.replace(/\D/g, "");
  }, [media]);

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "#";

  return (
    <section className="final-cta-section">
      <div className="final-cta-inner">
        <span className="final-cta-eyebrow">
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
          href={whatsappLink}
          target={whatsappNumber ? "_blank" : undefined}
          rel={whatsappNumber ? "noreferrer" : undefined}
          className="final-whatsapp-button"
          onClick={(event) => {
            if (!whatsappNumber) {
              event.preventDefault();
            }
          }}
        >
          <FaWhatsapp />
          Connect on WhatsApp
        </a>
      </div>
    </section>
  );
}