import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import {
  useWebsiteMedia,
} from "../context/WebsiteMediaContext";

import heroFallback from "../assets/vv-sarees-hero.webp";

import "./Hero.css";

/* =========================================
   TYPES
========================================= */

type WebsiteMediaRow = {
  id: number;
  section: string | null;
  slot_key: string | null;
  desktop_url: string | null;
  mobile_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  settings:
    | Record<string, unknown>
    | null;
};

type HeroSlide = {
  id: number | string;
  desktopUrl: string;
  mobileUrl: string;
  displayOrder: number;
};

/* =========================================
   HELPERS
========================================= */

function getSettingBoolean(
  settings:
    | Record<string, unknown>
    | null,
  key: string,
  fallback: boolean
): boolean {
  const value =
    settings?.[key];

  return typeof value ===
    "boolean"
    ? value
    : fallback;
}

function getSettingNumber(
  settings:
    | Record<string, unknown>
    | null,
  key: string,
  fallback: number
): number {
  const value =
    settings?.[key];

  return typeof value ===
    "number"
    ? value
    : fallback;
}

/* =========================================
   HERO
========================================= */

export default function Hero() {
  const {
    media,
    loading,
  } = useWebsiteMedia();

  const [
    currentSlideIndex,
    setCurrentSlideIndex,
  ] = useState(0);

  const touchStartX =
    useRef<number | null>(
      null
    );

  const touchEndX =
    useRef<number | null>(
      null
    );

  const mediaRows =
    media as WebsiteMediaRow[];

  /* =====================================
     DATABASE HERO SLIDES

     IMPORTANT:
     Loading time-la fallback immediately
     return panna maatom.

     Adhanala first visit-la fallback +
     database hero rendu image download
     aaguradhu avoid aagum.
  ===================================== */

  const databaseHeroSlides =
    useMemo<HeroSlide[]>(
      () =>
        mediaRows
          .filter(
            (row) =>
              row.section ===
                "hero" &&
              row.slot_key ===
                "hero-slide" &&
              row.is_active !==
                false &&
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
          .map(
            (row) => ({
              id: row.id,

              desktopUrl:
                row.desktop_url ??
                row.mobile_url ??
                "",

              mobileUrl:
                row.mobile_url ??
                row.desktop_url ??
                "",

              displayOrder:
                Number(
                  row.display_order ??
                    0
                ),
            })
          ),
      [mediaRows]
    );

  /* =====================================
     FINAL HERO SLIDES

     While server media is loading:
     → [] only

     Server request finish aana apram:
     → database slides if available
     → otherwise fallback
  ===================================== */

  const heroSlides =
    useMemo<HeroSlide[]>(
      () => {
        if (
          databaseHeroSlides.length >
          0
        ) {
          return databaseHeroSlides;
        }

        /*
          Still waiting for media.

          DO NOT load fallback image yet.
        */
        if (loading) {
          return [];
        }

        /*
          Database-la hero slide illa-na
          only then fallback use pannuvom.
        */
        return [
          {
            id:
              "fallback-slide",

            desktopUrl:
              heroFallback,

            mobileUrl:
              heroFallback,

            displayOrder: 0,
          },
        ];
      },
      [
        databaseHeroSlides,
        loading,
      ]
    );

  /* =====================================
     HERO SETTINGS
  ===================================== */

  const heroSettingsRow =
    useMemo(
      () =>
        mediaRows.find(
          (row) =>
            row.section ===
              "hero" &&
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

  const slideInterval =
    Math.max(
      2000,

      getSettingNumber(
        heroSettingsRow?.settings ??
          null,
        "interval",
        5000
      )
    );

  /* =====================================
     RESET INVALID SLIDE INDEX
  ===================================== */

  useEffect(() => {
    if (
      heroSlides.length === 0
    ) {
      setCurrentSlideIndex(
        0
      );

      return;
    }

    if (
      currentSlideIndex >=
      heroSlides.length
    ) {
      setCurrentSlideIndex(
        0
      );
    }
  }, [
    currentSlideIndex,
    heroSlides.length,
  ]);

  /* =====================================
     PREVIOUS
  ===================================== */

  const showPreviousSlide =
    useCallback(() => {
      if (
        heroSlides.length <=
        1
      ) {
        return;
      }

      setCurrentSlideIndex(
        (currentIndex) =>
          currentIndex === 0
            ? heroSlides.length -
              1
            : currentIndex - 1
      );
    }, [
      heroSlides.length,
    ]);

  /* =====================================
     NEXT
  ===================================== */

  const showNextSlide =
    useCallback(() => {
      if (
        heroSlides.length <=
        1
      ) {
        return;
      }

      setCurrentSlideIndex(
        (currentIndex) =>
          (currentIndex + 1) %
          heroSlides.length
      );
    }, [
      heroSlides.length,
    ]);

  /* =====================================
     AUTOPLAY

     Browser tab background-la irundha
     timer run panna vendam.
  ===================================== */

  useEffect(() => {
    if (
      !autoplay ||
      heroSlides.length <= 1
    ) {
      return;
    }

    let timerId:
      number | null = null;

    const startTimer = () => {
      if (
        timerId !== null ||
        document.hidden
      ) {
        return;
      }

      timerId =
        window.setInterval(
          () => {
            showNextSlide();
          },
          slideInterval
        );
    };

    const stopTimer = () => {
      if (
        timerId === null
      ) {
        return;
      }

      window.clearInterval(
        timerId
      );

      timerId = null;
    };

    const handleVisibility =
      () => {
        if (
          document.hidden
        ) {
          stopTimer();
        } else {
          startTimer();
        }
      };

    startTimer();

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      stopTimer();

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    autoplay,
    heroSlides.length,
    showNextSlide,
    slideInterval,
  ]);

  /* =====================================
     TOUCH / SWIPE
  ===================================== */

  const handleTouchStart = (
    event:
      React.TouchEvent<HTMLElement>
  ) => {
    touchStartX.current =
      event.touches[0]
        ?.clientX ?? null;

    touchEndX.current =
      null;
  };

  const handleTouchMove = (
    event:
      React.TouchEvent<HTMLElement>
  ) => {
    touchEndX.current =
      event.touches[0]
        ?.clientX ?? null;
  };

  const handleTouchEnd =
    () => {
      if (
        touchStartX.current ===
          null ||
        touchEndX.current ===
          null
      ) {
        touchStartX.current =
          null;

        touchEndX.current =
          null;

        return;
      }

      const distance =
        touchStartX.current -
        touchEndX.current;

      if (
        Math.abs(
          distance
        ) >= 50
      ) {
        if (
          distance > 0
        ) {
          showNextSlide();
        } else {
          showPreviousSlide();
        }
      }

      touchStartX.current =
        null;

      touchEndX.current =
        null;
    };

  /* =====================================
     WAITING FOR WEBSITE MEDIA

     Lightweight placeholder.

     Main point:
     NO FALLBACK IMAGE DOWNLOAD while
     actual hero URL is still loading.
  ===================================== */

  if (
    loading &&
    heroSlides.length === 0
  ) {
    return (
      <section
        className="hero-section"
        aria-label="VV Sarees promotional banners"
      >
        <div className="hero-glow hero-glow-left" />

        <div className="hero-glow hero-glow-right" />

        <div
          className="hero-card"
          aria-busy="true"
        >
          <div
            style={{
              width: "100%",
              minHeight:
                "clamp(320px, 55vw, 680px)",
            }}
          />
        </div>
      </section>
    );
  }

  /* =====================================
     CURRENT SLIDE
  ===================================== */

  const currentSlide =
    heroSlides[
      currentSlideIndex
    ] ??
    heroSlides[0];

  if (!currentSlide) {
    return null;
  }

  /* =====================================
     HERO UI
  ===================================== */

  return (
    <section
      className="hero-section"
      aria-label="VV Sarees promotional banners"
      onTouchStart={
        handleTouchStart
      }
      onTouchMove={
        handleTouchMove
      }
      onTouchEnd={
        handleTouchEnd
      }
    >
      <div
        className="hero-glow hero-glow-left"
        aria-hidden="true"
      />

      <div
        className="hero-glow hero-glow-right"
        aria-hidden="true"
      />

      <div className="hero-card">
        {/* =========================
            ACTIVE IMAGE ONLY
            ========================= */}

        <picture
          className="hero-picture"
          key={
            currentSlide.id
          }
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
            alt={`VV Sarees banner ${
              currentSlideIndex +
              1
            }`}
            className="hero-image hero-slider-image"

            /*
              Hero is first-screen content.
            */
            loading="eager"

            /*
              Decode without blocking the
              browser main thread.
            */
            decoding="async"

            /*
              First banner is the page's
              most important image.
            */
            fetchPriority={
              currentSlideIndex ===
              0
                ? "high"
                : "auto"
            }

            draggable={
              false
            }
          />
        </picture>

        <div
          className="hero-edge-shade"
          aria-hidden="true"
        />

        {/* =========================
            CONTROLS
            ========================= */}

        {heroSlides.length >
          1 && (
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
              onClick={
                showNextSlide
              }
              aria-label="Next hero banner"
            >
              <FiChevronRight />
            </button>

            {/* =========================
                DOTS
                ========================= */}

            <div
              className="hero-slider-dots"
              aria-label="Hero banner navigation"
            >
              {heroSlides.map(
                (
                  slide,
                  index
                ) => (
                  <button
                    type="button"
                    key={
                      slide.id
                    }
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
                        ? "true"
                        : undefined
                    }
                  />
                )
              )}
            </div>
          </>
        )}

        {/* =========================
            SCROLL INDICATOR
            ========================= */}

        <div className="hero-scroll-indicator">
          <span>
            Scroll to Explore
          </span>

          <div className="hero-scroll-line">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}