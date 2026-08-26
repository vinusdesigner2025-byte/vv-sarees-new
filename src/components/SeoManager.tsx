import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type SeoData = {
  title: string;
  description: string;
  canonical: string;
};

const SEO_CONFIG: Record<string, SeoData> = {
  "/": {
    title:
      "VV Sarees | Wholesale & Retail Sarees Online",
    description:
      "Shop handpicked sarees sourced directly from weavers across India at VV Sarees. Explore premium retail and wholesale saree collections.",
    canonical:
      "https://vvsarees.com/",
  },

  "/retail": {
    title:
      "Retail Sarees Online | VV Sarees",
    description:
      "Shop premium retail sarees online at VV Sarees. Discover silk, cotton, designer and occasion sarees sourced from across India.",
    canonical:
      "https://vvsarees.com/retail",
  },

  "/about": {
    title:
      "About VV Sarees | Sarees Sourced Across India",
    description:
      "Learn about VV Sarees and our journey of sourcing handpicked sarees directly from skilled weavers and trusted suppliers across India.",
    canonical:
      "https://vvsarees.com/about",
  },

  "/contact": {
    title:
      "Contact VV Sarees | Retail & Wholesale Enquiries",
    description:
      "Contact VV Sarees for retail and wholesale saree enquiries, order assistance and business-related support.",
    canonical:
      "https://vvsarees.com/contact",
  },
};

const updateMetaTag = (
  selector: string,
  attribute: string,
  value: string
) => {
  const element =
    document.querySelector<HTMLMetaElement>(
      selector
    );

  if (element) {
    element.setAttribute(
      attribute,
      value
    );
  }
};

export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const seo =
      SEO_CONFIG[
        location.pathname
      ] ?? SEO_CONFIG["/"];

    document.title =
      seo.title;

    updateMetaTag(
      'meta[name="description"]',
      "content",
      seo.description
    );

    updateMetaTag(
      'meta[property="og:title"]',
      "content",
      seo.title
    );

    updateMetaTag(
      'meta[property="og:description"]',
      "content",
      seo.description
    );

    updateMetaTag(
      'meta[property="og:url"]',
      "content",
      seo.canonical
    );

    const canonical =
      document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]'
      );

    if (canonical) {
      canonical.href =
        seo.canonical;
    }
  }, [location.pathname]);

  return null;
}