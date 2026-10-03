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

import {
  useWebsiteMedia,
} from "../context/WebsiteMediaContext";

import "./HouseSlider.css";

type WebsiteMediaRow = {
  id: number | string;
  section: string | null;
  slot_key: string | null;

  title?: string | null;

  image_url?: string | null;
  desktop_url?: string | null;
  mobile_url?: string | null;

  display_order: number | null;
  is_active: boolean | null;

  settings?: {
    title?: string;
    alt?: string;
  } | null;
};

type HouseImage = {
  id: number | string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
};

export default function HouseOfVVSarees() {
  const {
    media,
    loading,
  } = useWebsiteMedia();

  const sliderRef =
    useRef<HTMLDivElement>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const [
    isMobile,
    setIsMobile,
  ] = useState(false);

  /* =========================================
     CHECK MOBILE / DESKTOP
  ========================================= */

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(max-width: 768px)"
      );

    const updateDevice = () => {
      setIsMobile(
        mediaQuery.matches
      );
    };

    updateDevice();

    mediaQuery.addEventListener(
      "change",
      updateDevice
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateDevice
      );
    };
  }, []);

  /* =========================================
     GET HOUSE IMAGES
  ========================================= */

  const houseImages =
    useMemo<HouseImage[]>(() => {
      if (loading) {
        return [];
      }

      return (
        media as WebsiteMediaRow[]
      )
        .filter(
          (row) =>
            row.section ===
              "house-slider" &&
            row.slot_key ===
              "house-slide" &&
            row.is_active !== false &&
            Boolean(
              row.image_url ||
                row.desktop_url ||
                row.mobile_url
            )
        )
        .sort(
          (
            first,
            second
          ) =>
            Number(
              first.display_order ??
                0
            ) -
            Number(
              second.display_order ??
                0
            )
        )
        .map(
          (
            row,
            index
          ) => {
            /*
             * Desktop:
             * image_url first priority.
             */

            const desktopImage =
              row.image_url ||
              row.desktop_url ||
              row.mobile_url ||
              "";

            /*
             * Mobile:
             * mobile_url irundha first use pannum.
             * Adhu load aagala na கீழே
             * onError-la desktop image fallback aagum.
             */

            const mobileImage =
              row.mobile_url ||
              row.image_url ||
              row.desktop_url ||
              "";

            return {
              id: row.id,

              desktopImage,

              mobileImage,

              alt:
                row.settings?.alt?.trim() ||
                row.settings?.title?.trim() ||
                row.title?.trim() ||
                `House Slide ${
                  index + 1
                }`,
            };
          }
        );
    }, [
      media,
      loading,
    ]);

  /* =========================================
     KEEP ACTIVE INDEX VALID
  ========================================= */

  useEffect(() => {
    if (
      houseImages.length === 0
    ) {
      setActiveIndex(0);

      return;
    }

    setActiveIndex(
      (current) =>
        Math.min(
          current,
          houseImages.length -
            1
        )
    );
  }, [
    houseImages.length,
  ]);

  /* =========================================
     SCROLL EVENT
  ========================================= */

  const handleScroll = () => {
    if (
      animationFrameRef.current !==
      null
    ) {
      return;
    }

    animationFrameRef.current =
      window.requestAnimationFrame(
        () => {
          animationFrameRef.current =
            null;

          const slider =
            sliderRef.current;

          if (!slider) {
            return;
          }

          const cards =
            slider.querySelectorAll<HTMLElement>(
              ".house-slide"
            );

          if (
            cards.length === 0
          ) {
            return;
          }

          const sliderCenter =
            slider.scrollLeft +
            slider.clientWidth /
              2;

          let closestIndex = 0;

          let closestDistance =
            Number.POSITIVE_INFINITY;

          cards.forEach(
            (
              card,
              index
            ) => {
              const cardCenter =
                card.offsetLeft +
                card.offsetWidth /
                  2;

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
              current ===
              closestIndex
                ? current
                : closestIndex
          );
        }
      );
  };

  /* =========================================
     CLEANUP
  ========================================= */

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

  /* =========================================
     SCROLL TO SPECIFIC SLIDE
  ========================================= */

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
        ".house-slide"
      );

    const targetCard =
      cards[index];

    if (!targetCard) {
      return;
    }

    slider.scrollTo({
      left:
        targetCard.offsetLeft -
        slider.clientWidth /
          2 +
        targetCard.offsetWidth /
          2,

      behavior: "smooth",
    });

    setActiveIndex(
      index
    );
  };

  /* =========================================
     PREVIOUS
  ========================================= */

  const goPrevious = () => {
    if (
      houseImages.length === 0
    ) {
      return;
    }

    const newIndex =
      activeIndex === 0
        ? houseImages.length -
          1
        : activeIndex - 1;

    scrollToSlide(
      newIndex
    );
  };

  /* =========================================
     NEXT
  ========================================= */

  const goNext = () => {
    if (
      houseImages.length === 0
    ) {
      return;
    }

    const newIndex =
      activeIndex ===
      houseImages.length - 1
        ? 0
        : activeIndex + 1;

    scrollToSlide(
      newIndex
    );
  };

  return (
    <section
      className="house-section"
      aria-labelledby="house-section-title"
    >
      <div className="house-container">

        {/* =====================================
            HEADING
        ===================================== */}

        <header className="house-heading">
          <span className="house-eyebrow">
            STEP INSIDE OUR WORLD
          </span>

          <h2
            id="house-section-title"
          >
            House Of VV Sarees
          </h2>

          <span
            className="house-heading-line"
            aria-hidden="true"
          />
        </header>

        {/* =====================================
            LOADING
        ===================================== */}

        {loading && (
          <div
            className="house-loading"
            aria-hidden="true"
          />
        )}

        {/* =====================================
            NO IMAGES
        ===================================== */}

        {!loading &&
          houseImages.length ===
            0 && (
            <div className="house-empty">
              Showroom images are
              being updated.
            </div>
          )}

        {/* =====================================
            SLIDER
        ===================================== */}

        {!loading &&
          houseImages.length >
            0 && (
            <>
              <div className="house-slider-shell">

                {/* ============================
                    DESKTOP LEFT ARROW
                ============================ */}

                {houseImages.length >
                  1 && (
                  <button
                    type="button"
                    className="house-slider-arrow house-slider-arrow-left"
                    onClick={
                      goPrevious
                    }
                    aria-label="Previous showroom image"
                  >
                    <FiChevronLeft />
                  </button>
                )}

                {/* ============================
                    IMAGES
                ============================ */}

                <div
                  ref={
                    sliderRef
                  }
                  className="house-slider"
                  onScroll={
                    handleScroll
                  }
                  aria-label="VV Sarees showroom gallery"
                >
                  {houseImages.map(
                    (
                      item,
                      index
                    ) => {
                      const imageSrc =
                        isMobile
                          ? item.mobileImage
                          : item.desktopImage;

                      const fallbackImage =
                        isMobile
                          ? item.desktopImage
                          : item.mobileImage;

                      return (
                        <figure
                          className={`house-slide ${
                            activeIndex ===
                            index
                              ? "house-slide-active"
                              : ""
                          }`}
                          key={
                            item.id
                          }
                        >
                          <img
                            key={`${item.id}-${
                              isMobile
                                ? "mobile"
                                : "desktop"
                            }`}
                            src={
                              imageSrc
                            }
                            alt={
                              item.alt
                            }
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                            draggable={
                              false
                            }
                            onError={(
                              event
                            ) => {
                              const image =
                                event.currentTarget;

                              /*
                               * Broken mobile URL na
                               * automatically desktop image
                               * use pannum.
                               */

                              if (
                                image
                                  .dataset
                                  .fallbackApplied ===
                                "true"
                              ) {
                                return;
                              }

                              if (
                                !fallbackImage
                              ) {
                                return;
                              }

                              image.dataset.fallbackApplied =
                                "true";

                              image.src =
                                fallbackImage;
                            }}
                          />
                        </figure>
                      );
                    }
                  )}
                </div>

                {/* ============================
                    DESKTOP RIGHT ARROW
                ============================ */}

                {houseImages.length >
                  1 && (
                  <button
                    type="button"
                    className="house-slider-arrow house-slider-arrow-right"
                    onClick={
                      goNext
                    }
                    aria-label="Next showroom image"
                  >
                    <FiChevronRight />
                  </button>
                )}
              </div>

              {/* =====================================
                  BOTTOM PROGRESS
              ===================================== */}

              <div className="house-slider-progress">

                {/* COUNTER */}

                <span className="house-slider-counter">
                  {String(
                    activeIndex +
                      1
                  ).padStart(
                    2,
                    "0"
                  )}

                  <small>
                    /
                  </small>

                  {String(
                    houseImages.length
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                {/* DOTS */}

                <div
                  className="house-slider-dots"
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

                {/* LABEL */}

                <span className="house-swipe-label">
                  SWIPE TO EXPLORE
                </span>
              </div>
            </>
          )}
      </div>
    </section>
  );
}