import { useRef, useState } from "react";

import "./HouseSlider.css";

import houseLeft from "../assets/house of left.jpg";
import houseCenter from "../assets/house of senter.png";
import houseRight from "../assets/house of right.jpg";

type HouseImage = {
  image: string;
  alt: string;
};

const houseImages: HouseImage[] = [
  {
    image: houseLeft,
    alt: "VV Sarees showroom collection display",
  },
  {
    image: houseCenter,
    alt: "VV Sarees showroom entrance",
  },
  {
    image: houseRight,
    alt: "VV Sarees showroom interior",
  },
];

export default function HouseOfVVSarees() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);

  const handleScroll = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cards =
      slider.querySelectorAll<HTMLElement>(".house-mobile-card");

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const sliderCenter =
        slider.scrollLeft + slider.clientWidth / 2;

      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2;

      const distance = Math.abs(sliderCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  };

  const scrollToSlide = (index: number) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cards =
      slider.querySelectorAll<HTMLElement>(".house-mobile-card");

    const targetCard = cards[index];

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

        {/* DESKTOP GALLERY */}

        <div className="house-desktop-gallery">
          <figure className="house-desktop-card house-desktop-card-small">
            <img
              src={houseLeft}
              alt="VV Sarees showroom collection display"
              loading="lazy"
            />
          </figure>

          <figure className="house-desktop-card house-desktop-card-main">
            <img
              src={houseCenter}
              alt="VV Sarees showroom entrance"
              loading="lazy"
            />

            <figcaption>
              <span>VV Sarees</span>
              <strong>
                A home for timeless Indian weaves
              </strong>
            </figcaption>
          </figure>

          <figure className="house-desktop-card house-desktop-card-small">
            <img
              src={houseRight}
              alt="VV Sarees showroom interior"
              loading="lazy"
            />
          </figure>
        </div>

        {/* MOBILE SWIPE GALLERY */}

        <div
          ref={sliderRef}
          className="house-mobile-slider"
          onScroll={handleScroll}
          aria-label="VV Sarees showroom gallery"
        >
          {houseImages.map((item, index) => (
            <figure
              className={`house-mobile-card ${
                activeIndex === index
                  ? "house-mobile-card-active"
                  : ""
              }`}
              key={item.alt}
            >
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
              />
            </figure>
          ))}
        </div>

        <div className="house-mobile-progress">
          <span className="house-mobile-counter">
            {String(activeIndex + 1).padStart(2, "0")}
            <small>/</small>
            {String(houseImages.length).padStart(2, "0")}
          </span>

          <div
            className="house-mobile-dots"
            aria-label="Choose showroom image"
          >
            {houseImages.map((item, index) => (
              <button
                type="button"
                key={item.alt}
                className={
                  activeIndex === index
                    ? "house-dot house-dot-active"
                    : "house-dot"
                }
                aria-label={`View showroom image ${index + 1}`}
                aria-current={
                  activeIndex === index
                    ? "true"
                    : undefined
                }
                onClick={() => scrollToSlide(index)}
              />
            ))}
          </div>

          <span className="house-swipe-label">
            Swipe to explore
          </span>
        </div>
      </div>
    </section>
  );
}