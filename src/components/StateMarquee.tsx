import {
  useMemo,
} from "react";

import { Link } from "react-router-dom";

import { FiCompass } from "react-icons/fi";

import { useWebsiteMedia } from "../context/WebsiteMediaContext";

import "./StateMarquee.css";

import keralaFallback from "../assets/kerala.png";
import rajasthanFallback from "../assets/Rajasthan.png";
import maharashtraFallback from "../assets/Maharashtra.png";
import andhraFallback from "../assets/Andra.png";
import uttarPradeshFallback from "../assets/Uthraprathesh.png";
import tamilNaduFallback from "../assets/tamilnadu.png";

type WebsiteMediaRow = {
  id: number;
  section: string | null;
  slot_key: string | null;
  title: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
};

type StateItem = {
  name: string;
  image: string;
  href: string;
};

const fallbackStates: StateItem[] = [
  {
    name: "Andhra Pradesh",
    image: andhraFallback,
    href: "/state/andhra-pradesh",
  },
  {
    name: "Uttar Pradesh",
    image: uttarPradeshFallback,
    href: "/state/uttar-pradesh",
  },
  {
    name: "Tamil Nadu",
    image: tamilNaduFallback,
    href: "/state/tamil-nadu",
  },
  {
    name: "Kerala",
    image: keralaFallback,
    href: "/state/kerala",
  },
  {
    name: "Rajasthan",
    image: rajasthanFallback,
    href: "/state/rajasthan",
  },
  {
    name: "Maharashtra",
    image: maharashtraFallback,
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
  const repeatedStates = [
    ...states,
    ...states,
  ];

  return (
    <div className="state-group">
      {repeatedStates.map(
        (state, index) => (
          <StateCard
            key={`${prefix}-${state.href}-${index}`}
            {...state}
          />
        )
      )}
    </div>
  );
}

export default function StateMarquee() {
  const {
    media,
    loading,
  } = useWebsiteMedia();

  const stateItems =
    useMemo<StateItem[]>(() => {
      const rows =
        (media as WebsiteMediaRow[])
          .filter(
            (row) =>
              row.section === "states" &&
              row.is_active !== false &&
              Boolean(row.slot_key) &&
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
          .map((row) => ({
            name:
              row.title?.trim() ||
              row.slot_key ||
              "State",
            image:
              row.image_url ?? "",
            href:
              `/state/${row.slot_key}`,
          }));

      return rows.length > 0
        ? rows
        : fallbackStates;
    }, [media]);

  const middleIndex =
    Math.ceil(
      stateItems.length / 2
    );

  const topStates =
    stateItems.slice(
      0,
      middleIndex
    );

  const bottomStates =
    stateItems.slice(
      middleIndex
    );

  const safeBottomStates =
    bottomStates.length > 0
      ? bottomStates
      : topStates;

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
            states={safeBottomStates}
            prefix="bottom-original"
          />

          <StateGroup
            states={safeBottomStates}
            prefix="bottom-copy"
          />
        </div>
      </div>

      {loading && (
        <span
          style={{
            display: "none",
          }}
        >
          Loading state images
        </span>
      )}
    </section>
  );
}