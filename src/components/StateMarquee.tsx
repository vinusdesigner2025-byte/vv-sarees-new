import { Link } from "react-router-dom";

import { FiCompass } from "react-icons/fi";

import "./StateMarquee.css";

import kerala from "../assets/kerala.png";
import rajasthan from "../assets/Rajasthan.png";
import maharashtra from "../assets/Maharashtra.png";
import andhra from "../assets/Andra.png";
import uttarPradesh from "../assets/Uthraprathesh.png";
import tamilNadu from "../assets/tamilnadu.png";

type StateItem = {
  name: string;
  image: string;
  href: string;
};

const topStates: StateItem[] = [
  {
    name: "Andhra Pradesh",
    image: andhra,
    href: "/state/andhra-pradesh",
  },
  {
    name: "Uttar Pradesh",
    image: uttarPradesh,
    href: "/state/uttar-pradesh",
  },
  {
    name: "Tamil Nadu",
    image: tamilNadu,
    href: "/state/tamil-nadu",
  },
];

const bottomStates: StateItem[] = [
  {
    name: "Kerala",
    image: kerala,
    href: "/state/kerala",
  },
  {
    name: "Rajasthan",
    image: rajasthan,
    href: "/state/rajasthan",
  },
  {
    name: "Maharashtra",
    image: maharashtra,
    href: "/state/maharashtra",
  },
];

function StateCard({
  name,
  image,
  href,
}: StateItem) {
  return (
    <Link
      to={href}
      className="state-card"
      aria-label={`Explore ${name} sarees`}
    >
      <img
        src={image}
        alt={`${name} saree collection`}
        loading="lazy"
      />

      <span className="state-card-glow" />
    </Link>
  );
}

function StateGroup({
  states,
  prefix,
}: {
  states: StateItem[];
  prefix: string;
}) {
  return (
    <div className="state-group">
      {states.map((state, index) => (
        <StateCard
          key={`${prefix}-${state.name}-${index}`}
          {...state}
        />
      ))}
    </div>
  );
}

export default function StateMarquee() {
  return (
    <section
      className="state-section"
      aria-labelledby="state-section-title"
    >
      <div className="state-heading">
        <div className="state-heading-content">
          <span className="state-heading-tag">
            Every State. Every Weave.
          </span>

          <h2 id="state-section-title">
            India&apos;s Finest
            <br />
            Weaving Destinations
          </h2>
        </div>

        <div
          className="state-heading-accent"
          aria-hidden="true"
        >
          <FiCompass />
          <span />
        </div>
      </div>

      <div className="state-marquee">
        <div className="state-edge state-edge-left" />
        <div className="state-edge state-edge-right" />

        <div className="state-track state-track-left">
          <StateGroup
            states={topStates}
            prefix="top-original"
          />

          <StateGroup
            states={topStates}
            prefix="top-copy"
          />
        </div>
      </div>

      <div className="state-marquee">
        <div className="state-edge state-edge-left" />
        <div className="state-edge state-edge-right" />

        <div className="state-track state-track-right">
          <StateGroup
            states={bottomStates}
            prefix="bottom-original"
          />

          <StateGroup
            states={bottomStates}
            prefix="bottom-copy"
          />
        </div>
      </div>
    </section>
  );
}