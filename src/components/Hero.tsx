import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { useWebsiteMedia } from "../context/WebsiteMediaContext";

import heroImage from "../assets/vv sarees hero.png";

import "./Hero.css";

type WebsiteMediaRow = {
  id: number;
  section: string | null;
  slot_key: string | null;
  desktop_url: string | null;
  mobile_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  settings: Record<string, unknown> | null;
};

type HeroSlide = {
  id: number | string;
  desktopUrl: string;
  mobileUrl: string;
  displayOrder: number;
};

const getSettingBoolean = (
  settings: Record<string, unknown> | null,
  key: string,
  fallback: boolean
) => {
  const value = settings?.[key];

  return typeof value === "boolean"
    ? value
    : fallback;
};

const getSettingNumber = (
  settings: Record<string, unknown> | null,
  key: string,
  fallback: number
) => {
  const value = settings?.[key];

  return typeof value === "number"
    ? value
    : fallback;
};

export default function Hero() {
  const {
    media,
    loading,
  } = useWebsiteMedia();

  const [
    currentSlideIndex,
    setCurrentSlideIndex,
  ] = useState(0);

  const [
    isPaused,
    setIsPaused,
  ] = useState(false);

  const touchStartX =
    useRef<number | null>(null);

  const touchEndX =
    useRef<number | null>(null);

  const mediaRows =
    media as WebsiteMediaRow[];

  const heroSlides =
    useMemo<HeroSlide[]>(() => {
      const rows = mediaRows
        .filter(
          (row) =>
            row.section === "hero" &&
            row.slot_key ===
              "hero-slide" &&
            row.is_active !== false &&
            Boolean(
              row.desktop_url ||
                row.mobile_url
            )
        )
        .sort(
          (
            firstSlide,
            secondSlide
          ) =>
            Number(
              firstSlide.display_order ??
                0
            ) -
            Number(
              secondSlide.display_order ??
                0
            )
        )
        .map((row) => ({
          id: row.id,
          desktopUrl:
            row.desktop_url ??
            row.mobile_url ??
            "",
          mobileUrl:
            row.mobile_url ??
            row.desktop_url ??
            "",
          displayOrder: Number(
            row.display_order ?? 0
          ),
        }));

      if (rows.length > 0) {
        return rows;
      }

      return [
        {
          id: "fallback",
          desktopUrl: heroImage,
          mobileUrl: heroImage,
          displayOrder: 0,
        },
      ];
    }, [mediaRows]);

  const heroSettingsRow =
    useMemo(
      () =>
        mediaRows.find(
          (row) =>
            row.section === "hero" &&
            row.slot_key ===
              "hero-settings"
        ),
      [mediaRows]
    );

  const autoplay =
    getSettingBoolean(
      heroSettingsRow?.settings ??
        null,
      "autoplay",
      true
    );

  const interval =
    Math.max(
      2000,
      getSettingNumber(
        heroSettingsRow?.settings ??
          null,
        "interval",
        5000
      )
    );

  useEffect(() => {
    if (
      currentSlideIndex >=
      heroSlides.length
    ) {
      setCurrentSlideIndex(0);
    }
  }, [
    heroSlides.length,
    currentSlideIndex,
  ]);

  useEffect(() => {
    if (
      !autoplay ||
      isPaused ||
      heroSlides.length <= 1
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setCurrentSlideIndex(
          (currentIndex) =>
            (currentIndex + 1) %
            heroSlides.length
        );
      }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    autoplay,
    interval,
    isPaused,
    heroSlides.length,
  ]);

  const showPreviousSlide = () => {
    setCurrentSlideIndex(
      (currentIndex) =>
        currentIndex === 0
          ? heroSlides.length - 1
          : currentIndex - 1
    );
  };

  const showNextSlide = () => {
    setCurrentSlideIndex(
      (currentIndex) =>
        (currentIndex + 1) %
        heroSlides.length
    );
  };

  const handleTouchStart = (
    event: React.TouchEvent<HTMLElement>
  ) => {
    touchStartX.current =
      event.touches[0].clientX;

    touchEndX.current = null;
  };

  const handleTouchMove = (
    event: React.TouchEvent<HTMLElement>
  ) => {
    touchEndX.current =
      event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      return;
    }

    const distance =
      touchStartX.current -
      touchEndX.current;

    if (Math.abs(distance) < 50) {
      return;
    }

    if (distance > 0) {
      showNextSlide();
    } else {
      showPreviousSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide =
    heroSlides[
      currentSlideIndex
    ] ?? heroSlides[0];

  return (
    <section
      className="hero-section"
      onMouseEnter={() =>
        setIsPaused(true)
      }
      onMouseLeave={() =>
        setIsPaused(false)
      }
      onFocusCapture={() =>
        setIsPaused(true)
      }
      onBlurCapture={() =>
        setIsPaused(false)
      }
      onTouchStart={
        handleTouchStart
      }
      onTouchMove={
        handleTouchMove
      }
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />

      <div className="hero-card">
        <picture
          className="hero-picture"
          key={currentSlide.id}
        >
          <source
            media="(max-width: 700px)"
            srcSet={
              currentSlide.mobileUrl
            }
          />

          <img
            src={
              currentSlide.desktopUrl
            }
            alt={`VV Sarees hero slide ${
              currentSlideIndex + 1
            }`}
            className="hero-image hero-slider-image"
            fetchPriority={
              currentSlideIndex === 0
                ? "high"
                : "auto"
            }
            draggable={false}
          />
        </picture>

        <div className="hero-edge-shade" />

        {heroSlides.length > 1 && (
          <>
            <button
              type="button"
              className="hero-slider-arrow hero-slider-arrow-left"
              onClick={
                showPreviousSlide
              }
              aria-label="Previous hero banner"
            >
              <FiChevronLeft />
            </button>

            <button
              type="button"
              className="hero-slider-arrow hero-slider-arrow-right"
              onClick={showNextSlide}
              aria-label="Next hero banner"
            >
              <FiChevronRight />
            </button>

            <div
              className="hero-slider-dots"
              aria-label="Hero banner navigation"
            >
              {heroSlides.map(
                (slide, index) => (
                  <button
                    type="button"
                    key={slide.id}
                    className={
                      index ===
                      currentSlideIndex
                        ? "hero-slider-dot hero-slider-dot-active"
                        : "hero-slider-dot"
                    }
                    onClick={() =>
                      setCurrentSlideIndex(
                        index
                      )
                    }
                    aria-label={`Show hero banner ${
                      index + 1
                    }`}
                    aria-current={
                      index ===
                      currentSlideIndex
                    }
                  />
                )
              )}
            </div>
          </>
        )}

        <div className="hero-scroll-indicator">
          <span>
            {loading
              ? "Loading..."
              : "Scroll to Explore"}
          </span>

          <div className="hero-scroll-line">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}