import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useWebsiteMedia } from "../context/WebsiteMediaContext";

import "./HouseSlider.css";

import houseLeftFallback from "../assets/house of left.jpg";
import houseCenterFallback from "../assets/house of senter.png";
import houseRightFallback from "../assets/house of right.jpg";

type WebsiteMediaRow = {
  id: number;
  section: string | null;
  slot_key: string | null;
  title: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
};

type HouseImage = {
  id: number | string;
  image: string;
  alt: string;
};

const fallbackImages: HouseImage[] = [
  {
    id: "fallback-left",
    image: houseLeftFallback,
    alt: "VV Sarees showroom collection display",
  },
  {
    id: "fallback-center",
    image: houseCenterFallback,
    alt: "VV Sarees showroom entrance",
  },
  {
    id: "fallback-right",
    image: houseRightFallback,
    alt: "VV Sarees showroom interior",
  },
];

export default function HouseOfVVSarees() {
  const {
    media,
    loading,
  } = useWebsiteMedia();

  const sliderRef =
    useRef<HTMLDivElement>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const [activeIndex, setActiveIndex] =
    useState(1);

  const houseImages =
    useMemo<HouseImage[]>(() => {
      /*
       * Supabase data varra varaikkum
       * heavy fallback images load panna vendaam.
       */
      if (loading) {
        return [];
      }

      const rows = (
        media as WebsiteMediaRow[]
      )
        .filter(
          (row) =>
            row.section ===
              "house-slider" &&
            row.slot_key ===
              "house-slide" &&
            row.is_active !== false &&
            Boolean(row.image_url)
        )
        .sort(
          (first, second) =>
            Number(
              first.display_order ?? 0
            ) -
            Number(
              second.display_order ?? 0
            )
        )
        .map((row, index) => ({
          id: row.id,

          image:
            row.image_url ?? "",

          alt:
            row.title?.trim() ||
            `VV Sarees showroom image ${
              index + 1
            }`,
        }));

      /*
       * Database-la images irundha
       * actual images mattum use pannuvom.
       */
      if (rows.length > 0) {
        return rows;
      }

      /*
       * Supabase load complete aana apramum
       * rows illa na mattum fallback.
       */
      return fallbackImages;
    }, [
      media,
      loading,
    ]);

  /*
   * Image count change aana
   * activeIndex valid range-la irukkanum.
   */
  useEffect(() => {
    if (houseImages.length === 0) {
      return;
    }

    setActiveIndex((current) =>
      Math.min(
        current,
        houseImages.length - 1
      )
    );
  }, [houseImages.length]);

  /*
   * Scroll event romba frequently fire aagum.
   * requestAnimationFrame use panni
   * once-per-frame mattum calculation.
   */
  const handleScroll = () => {
    if (animationFrameRef.current !== null) {
      return;
    }

    animationFrameRef.current =
      window.requestAnimationFrame(() => {
        animationFrameRef.current = null;

        const slider =
          sliderRef.current;

        if (!slider) {
          return;
        }

        const cards =
          slider.querySelectorAll<HTMLElement>(
            ".house-mobile-card"
          );

        if (cards.length === 0) {
          return;
        }

        const sliderCenter =
          slider.scrollLeft +
          slider.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance =
          Number.POSITIVE_INFINITY;

        cards.forEach(
          (card, index) => {
            const cardCenter =
              card.offsetLeft +
              card.offsetWidth / 2;

            const distance =
              Math.abs(
                sliderCenter -
                  cardCenter
              );

            if (
              distance <
              closestDistance
            ) {
              closestDistance =
                distance;

              closestIndex =
                index;
            }
          }
        );

        setActiveIndex(
          (current) =>
            current === closestIndex
              ? current
              : closestIndex
        );
      });
  };

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, []);

  const scrollToSlide = (
    index: number
  ) => {
    const slider =
      sliderRef.current;

    if (!slider) {
      return;
    }

    const cards =
      slider.querySelectorAll<HTMLElement>(
        ".house-mobile-card"
      );

    const targetCard =
      cards[index];

    if (!targetCard) {
      return;
    }

    slider.scrollTo({
      left:
        targetCard.offsetLeft -
        slider.clientWidth / 2 +
        targetCard.offsetWidth / 2,

      behavior: "smooth",
    });

    setActiveIndex(index);
  };

  const desktopLeft =
    houseImages[0];

  const desktopCenter =
    houseImages[1] ??
    houseImages[0];

  const desktopRight =
    houseImages[2] ??
    houseImages[
      houseImages.length - 1
    ];

  return (
    <section
      className="house-section"
      aria-labelledby="house-section-title"
    >
      <div className="house-container">
        <header className="house-heading">
          <span className="house-eyebrow">
            Step Inside Our World
          </span>

          <h2 id="house-section-title">
            House Of VV Sarees
          </h2>

          <span
            className="house-heading-line"
            aria-hidden="true"
          />
        </header>

        {/* =========================
            LOADING PLACEHOLDER
        ========================= */}

        {loading && (
          <div
            style={{
              width: "100%",
              minHeight: "360px",
              borderRadius: "22px",
              background: "#ead7be",
            }}
            aria-hidden="true"
          />
        )}

        {/* =========================
            DESKTOP GALLERY
        ========================= */}

        {!loading &&
          desktopLeft &&
          desktopCenter &&
          desktopRight && (
            <div className="house-desktop-gallery">
              <figure className="house-desktop-card house-desktop-card-small">
                <img
                  src={desktopLeft.image}
                  alt={desktopLeft.alt}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  draggable={false}
                />
              </figure>

              <figure className="house-desktop-card house-desktop-card-main">
                <img
                  src={
                    desktopCenter.image
                  }
                  alt={
                    desktopCenter.alt
                  }
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  draggable={false}
                />

                <figcaption>
                  <span>
                    VV Sarees
                  </span>

                  <strong>
                    A home for timeless
                    Indian weaves
                  </strong>
                </figcaption>
              </figure>

              <figure className="house-desktop-card house-desktop-card-small">
                <img
                  src={desktopRight.image}
                  alt={desktopRight.alt}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  draggable={false}
                />
              </figure>
            </div>
          )}

        {/* =========================
            MOBILE SLIDER
        ========================= */}

        {!loading &&
          houseImages.length > 0 && (
            <>
              <div
                ref={sliderRef}
                className="house-mobile-slider"
                onScroll={handleScroll}
                aria-label="VV Sarees showroom gallery"
              >
                {houseImages.map(
                  (
                    item,
                    index
                  ) => (
                    <figure
                      className={`house-mobile-card ${
                        activeIndex ===
                        index
                          ? "house-mobile-card-active"
                          : ""
                      }`}
                      key={item.id}
                    >
                      <img
                        src={
                          item.image
                        }
                        alt={item.alt}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        draggable={
                          false
                        }
                      />
                    </figure>
                  )
                )}
              </div>

              <div className="house-mobile-progress">
                <span className="house-mobile-counter">
                  {String(
                    activeIndex + 1
                  ).padStart(
                    2,
                    "0"
                  )}

                  <small>/</small>

                  {String(
                    houseImages.length
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                <div
                  className="house-mobile-dots"
                  aria-label="Choose showroom image"
                >
                  {houseImages.map(
                    (
                      item,
                      index
                    ) => (
                      <button
                        type="button"
                        key={
                          item.id
                        }
                        className={
                          activeIndex ===
                          index
                            ? "house-dot house-dot-active"
                            : "house-dot"
                        }
                        aria-label={`View showroom image ${
                          index + 1
                        }`}
                        aria-current={
                          activeIndex ===
                          index
                            ? "true"
                            : undefined
                        }
                        onClick={() =>
                          scrollToSlide(
                            index
                          )
                        }
                      />
                    )
                  )}
                </div>

                <span className="house-swipe-label">
                  Swipe to explore
                </span>
              </div>
            </>
          )}
      </div>
    </section>
  );
}