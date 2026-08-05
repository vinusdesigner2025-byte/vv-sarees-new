import {
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
  const { media } = useWebsiteMedia();

  const sliderRef =
    useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] =
    useState(1);

  const houseImages =
    useMemo<HouseImage[]>(() => {
      const rows =
        (
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
            image: row.image_url ?? "",
            alt:
              row.title?.trim() ||
              `VV Sarees showroom image ${
                index + 1
              }`,
          }));

      return rows.length > 0
        ? rows
        : fallbackImages;
    }, [media]);

  const desktopLeft =
    houseImages[0] ??
    fallbackImages[0];

  const desktopCenter =
    houseImages[1] ??
    houseImages[0] ??
    fallbackImages[1];

  const desktopRight =
    houseImages[2] ??
    houseImages[
      houseImages.length - 1
    ] ??
    fallbackImages[2];

  const handleScroll = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cards =
      slider.querySelectorAll<HTMLElement>(
        ".house-mobile-card"
      );

    let closestIndex = 0;
    let closestDistance =
      Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const sliderCenter =
        slider.scrollLeft +
        slider.clientWidth / 2;

      const cardCenter =
        card.offsetLeft +
        card.offsetWidth / 2;

      const distance = Math.abs(
        sliderCenter - cardCenter
      );

      if (
        distance <
        closestDistance
      ) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  };

  const scrollToSlide = (
    index: number
  ) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cards =
      slider.querySelectorAll<HTMLElement>(
        ".house-mobile-card"
      );

    const targetCard =
      cards[index];

    if (!targetCard) return;

    slider.scrollTo({
      left:
        targetCard.offsetLeft -
        slider.clientWidth / 2 +
        targetCard.offsetWidth / 2,
      behavior: "smooth",
    });

    setActiveIndex(index);
  };

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

        <div className="house-desktop-gallery">
          <figure className="house-desktop-card house-desktop-card-small">
            <img
              src={desktopLeft.image}
              alt={desktopLeft.alt}
              loading="lazy"
            />
          </figure>

          <figure className="house-desktop-card house-desktop-card-main">
            <img
              src={desktopCenter.image}
              alt={desktopCenter.alt}
              loading="lazy"
            />

            <figcaption>
              <span>VV Sarees</span>

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
            />
          </figure>
        </div>

        <div
          ref={sliderRef}
          className="house-mobile-slider"
          onScroll={handleScroll}
          aria-label="VV Sarees showroom gallery"
        >
          {houseImages.map(
            (item, index) => (
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
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                />
              </figure>
            )
          )}
        </div>

        <div className="house-mobile-progress">
          <span className="house-mobile-counter">
            {String(
              activeIndex + 1
            ).padStart(2, "0")}

            <small>/</small>

            {String(
              houseImages.length
            ).padStart(2, "0")}
          </span>

          <div
            className="house-mobile-dots"
            aria-label="Choose showroom image"
          >
            {houseImages.map(
              (item, index) => (
                <button
                  type="button"
                  key={item.id}
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
                    scrollToSlide(index)
                  }
                />
              )
            )}
          </div>

          <span className="house-swipe-label">
            Swipe to explore
          </span>
        </div>
      </div>
    </section>
  );
}