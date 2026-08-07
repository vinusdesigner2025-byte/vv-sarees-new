import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";

import { useWebsiteMedia } from "../context/WebsiteMediaContext";

import journeyFallback from "../assets/journey-screen.jpeg";

import "./DiscoverJourney.css";

type WebsiteMediaRow = {
  id: number;
  section: string | null;
  slot_key: string | null;
  image_url: string | null;
  is_active: boolean | null;
  settings: Record<string, unknown> | null;
};

export default function DiscoverJourney() {
  const { media } = useWebsiteMedia();

  const journeyImage = useMemo(() => {
    const row = (media as WebsiteMediaRow[]).find(
      (item) =>
        item.section === "journey" &&
        item.slot_key === "journey-image" &&
        item.is_active !== false &&
        Boolean(item.image_url)
    );

    return row?.image_url ?? journeyFallback;
  }, [media]);

  const youtubeUrl = useMemo(() => {
    const settingsRow = (media as WebsiteMediaRow[]).find(
      (item) =>
        item.section === "site-settings" &&
        item.slot_key === "contact-social"
    );

    const value =
      settingsRow?.settings?.youtubeUrl;

    return typeof value === "string"
      ? value.trim()
      : "";
  }, [media]);

  return (
    <section
      className="discover-journey"
      aria-labelledby="discover-journey-title"
    >
      <div className="discover-journey-inner">

        {/* MOBILE HEADING */}

        <div className="journey-mobile-heading">
          <span>From Our Travels</span>

          <h2>Discover Our Journey</h2>
        </div>

        {/* IMAGE */}

        <Link
          to="/journey"
          className="discover-journey-media"
          aria-label="View the VV Sarees journey"
        >
          <img
            src={journeyImage}
            alt="VV Sarees journey across India"
            loading="lazy"
          />
        </Link>

        {/* CONTENT */}

        <div className="discover-journey-content">
          <span className="discover-journey-eyebrow">
            From Our Travels
          </span>

          <h2 id="discover-journey-title">
            Discover Our
            <br />
            Journey
          </h2>

          <p className="journey-desktop-description">
            Every journey begins with a passion for discovering
            something extraordinary. Across India, we meet skilled
            weavers, explore traditional weaving villages, and
            carefully handpick premium sarees that celebrate heritage
            and craftsmanship. Join us behind the scenes and
            experience the stories, dedication, and timeless artistry
            that make every VV Sarees collection truly special.
          </p>

          <p className="journey-mobile-description">
            Travel with us across India as we meet skilled weavers,
            discover timeless traditions and handpick sarees filled
            with heritage and craftsmanship.
          </p>

          {youtubeUrl ? (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="discover-journey-button"
            >
              <span>Watch Our Journey</span>
              <FiArrowUpRight aria-hidden="true" />
            </a>
          ) : (
            <Link
              to="/journey"
              className="discover-journey-button"
            >
              <span>Watch Our Journey</span>
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}