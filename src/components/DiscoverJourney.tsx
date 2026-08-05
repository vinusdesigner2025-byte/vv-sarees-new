import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";

import journeyImage from "../assets/journey-screen.jpeg";

import "./DiscoverJourney.css";

export default function DiscoverJourney() {
  return (
    <section
      className="discover-journey"
      aria-labelledby="discover-journey-title"
    >
      <div className="discover-journey-inner">
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

          <span
            className="discover-journey-overlay"
            aria-hidden="true"
          />

          <div className="journey-mobile-caption">
            <span>From Our Travels</span>

            <h3>
              Discover Our
              <br />
              Journey
            </h3>
          </div>
        </Link>

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

          <Link
            to="/journey"
            className="discover-journey-button"
          >
            <span>Watch Our Journey</span>
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}