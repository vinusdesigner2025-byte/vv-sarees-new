import "./ImageSection.css";

import leftImageOne from "../assets/Hero 1st OL lf.png";
import rightImageOne from "../assets/Hero 1st Rt OL.png";
import leftImageTwo from "../assets/hero 2nd OL LF.png";
import rightImageTwo from "../assets/Hero 2nd Rt OL.png";

export default function ImageSection() {
  return (
    <section className="image-section">

      <img
        src={leftImageOne}
        className="left-image"
      />

      <img
        src={rightImageOne}
        className="right-image"
      />
      <div className="image-pair pair-two">
  <img
    src={leftImageTwo}
    alt="Second weaver left"
    className="second-left-image"
  />

  <img
    src={rightImageTwo}
    alt="Second weaver right"
    className="second-right-image"
  />
</div>

    </section>
  );
}