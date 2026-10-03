import { useMemo } from "react";
import { Link } from "react-router-dom";

import {
  FiArrowUpRight,
} from "react-icons/fi";

import {
  FaYoutube,
} from "react-icons/fa";

import {
  GiLotus,
} from "react-icons/gi";

import {
  useWebsiteMedia,
} from "../context/WebsiteMediaContext";

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
  const {
    media,
    loading,
  } = useWebsiteMedia();

  /* =========================
     JOURNEY POSTER
  ========================= */

  const journeyImage = useMemo(() => {
    if (loading) {
      return "";
    }

    const row = (
      media as WebsiteMediaRow[]
    ).find(
      (item) =>
        item.section === "journey" &&
        item.slot_key === "journey-image" &&
        item.is_active !== false &&
        Boolean(item.image_url)
    );

    return (
      row?.image_url ??
      journeyFallback
    );
  }, [
    media,
    loading,
  ]);

  /* =========================
     YOUTUBE URL
  ========================= */

  const youtubeUrl = useMemo(() => {
    const settingsRow = (
      media as WebsiteMediaRow[]
    ).find(
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

  /* =========================
     BUTTON CONTENT
  ========================= */

  const buttonContent = (
    <>
      <span className="discover-journey-youtube-icon">
        <FaYoutube
          aria-hidden="true"
        />
      </span>

      <span className="discover-journey-button-text">
        Watch Our Journey
      </span>

      <FiArrowUpRight
        className="discover-journey-button-arrow"
        aria-hidden="true"
      />
    </>
  );

  return (
    <section
      className="discover-journey"
      aria-labelledby="discover-journey-title"
    >
      <div className="discover-journey-inner">

        {/* =========================
            HEADING
        ========================= */}

        <div className="discover-journey-heading">
          <p className="discover-journey-eyebrow">
            FROM OUR TRAVELS
          </p>

          <div
            className="discover-journey-divider"
            aria-hidden="true"
          >
            <span />

            <GiLotus />

            <span />
          </div>

          <h2
            id="discover-journey-title"
            className="discover-journey-title"
          >
            Discover Our Journey
          </h2>
        </div>

        {/* =========================
            POSTER
        ========================= */}

        <div className="discover-journey-poster-wrap">
          {journeyImage ? (
            <img
              src={journeyImage}
              alt="VV Sarees journey across India"
              className="discover-journey-poster"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              draggable={false}
            />
          ) : (
            <div
              className="discover-journey-poster-placeholder"
              aria-hidden="true"
            />
          )}
        </div>

        {/* =========================
            YOUTUBE BUTTON
        ========================= */}

        {youtubeUrl ? (
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="discover-journey-button"
            aria-label="Watch VV Sarees journey on YouTube"
          >
            {buttonContent}
          </a>
        ) : (
          <Link
            to="/journey"
            className="discover-journey-button"
            aria-label="Watch VV Sarees journey"
          >
            {buttonContent}
          </Link>
        )}
      </div>
    </section>
  );
}