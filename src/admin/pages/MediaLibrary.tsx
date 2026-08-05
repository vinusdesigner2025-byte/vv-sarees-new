import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import {
  FiChevronDown,
  FiChevronUp,
  FiImage,
  FiMonitor,
  FiPlus,
  FiSave,
  FiSmartphone,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

import {
  deleteWebsiteImage,
  uploadWebsiteImage,
} from "../../lib/storage";

import { useWebsiteMedia } from "../../context/WebsiteMediaContext";

import "../css/MediaLibrary.css";

type HeroSlide = {
  localId: string;
  databaseId: number | null;
  desktopImage: string;
  mobileImage: string;
  desktopPath: string;
  mobilePath: string;
  desktopName: string;
  mobileName: string;
  isActive: boolean;
};

type SingleImageKey =
  | "wholesaleImage"
  | "retailImage"
  | "journeyImage"
  | "indiaMapImage"
  | "finalCtaImage"
  | "logoImage"
  | "faviconImage";

type WebsiteImageState = {
  url: string;
  path: string;
  databaseId: number | null;
};

type StateImage = {
  localId: string;
  databaseId: number | null;
  name: string;
  slug: string;
  url: string;
  path: string;
};

type WebsiteMediaState = {
  heroSlides: HeroSlide[];
  heroAutoplay: boolean;
  heroInterval: number;
  wholesaleImage: WebsiteImageState;
  retailImage: WebsiteImageState;
  journeyImage: WebsiteImageState;
  indiaMapImage: WebsiteImageState;
  finalCtaImage: WebsiteImageState;
  logoImage: WebsiteImageState;
  faviconImage: WebsiteImageState;
  stateImages: StateImage[];
};

type ImageSlot = {
  key: SingleImageKey;
  section: string;
  slotKey: string;
  title: string;
  description: string;
};

type WebsiteMediaRow = {
  id: number;
  section: string | null;
  slot_key: string | null;
  title: string | null;
  image_url: string | null;
  desktop_url: string | null;
  mobile_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  settings: Record<string, unknown> | null;
};

const emptyImage: WebsiteImageState = {
  url: "",
  path: "",
  databaseId: null,
};

const defaultStateDefinitions = [
  ["Tamil Nadu", "tamil-nadu"],
  ["Kerala", "kerala"],
  ["Karnataka", "karnataka"],
  ["Andhra Pradesh", "andhra-pradesh"],
  ["West Bengal", "west-bengal"],
  ["Rajasthan", "rajasthan"],
] as const;

const createDefaultStateImages = (): StateImage[] =>
  defaultStateDefinitions.map(([name, slug]) => ({
    localId: crypto.randomUUID(),
    databaseId: null,
    name,
    slug,
    url: "",
    path: "",
  }));

const createDefaultMedia = (): WebsiteMediaState => ({
  heroSlides: [],
  heroAutoplay: true,
  heroInterval: 5000,
  wholesaleImage: { ...emptyImage },
  retailImage: { ...emptyImage },
  journeyImage: { ...emptyImage },
  indiaMapImage: { ...emptyImage },
  finalCtaImage: { ...emptyImage },
  logoImage: { ...emptyImage },
  faviconImage: { ...emptyImage },
  stateImages: createDefaultStateImages(),
});

const homepageSlots: ImageSlot[] = [
  {
    key: "wholesaleImage",
    section: "homepage",
    slotKey: "wholesale-card",
    title: "Wholesale Card Image",
    description:
      "Image displayed inside the wholesale shopping section.",
  },
  {
    key: "retailImage",
    section: "homepage",
    slotKey: "retail-card",
    title: "Retail Card Image",
    description:
      "Image displayed inside the retail shopping section.",
  },
  {
    key: "journeyImage",
    section: "homepage",
    slotKey: "journey-image",
    title: "Journey Section Image",
    description:
      "Main image displayed in the sourcing journey section.",
  },
  {
    key: "indiaMapImage",
    section: "homepage",
    slotKey: "india-map",
    title: "India Journey Map",
    description:
      "India map displayed in the sourcing journey section.",
  },
  {
    key: "finalCtaImage",
    section: "homepage",
    slotKey: "final-cta",
    title: "Final CTA Background",
    description:
      "Background image displayed at the bottom of the homepage.",
  },
];

const brandSlots: ImageSlot[] = [
  {
    key: "logoImage",
    section: "brand",
    slotKey: "website-logo",
    title: "Website Logo",
    description:
      "Main logo displayed in the website header and footer.",
  },
  {
    key: "faviconImage",
    section: "brand",
    slotKey: "favicon",
    title: "Browser Favicon",
    description:
      "Small icon displayed in the browser tab.",
  },
];

const allImageSlots = [
  ...homepageSlots,
  ...brandSlots,
];

function getSettingString(
  settings: Record<string, unknown> | null,
  key: string
): string {
  const value = settings?.[key];
  return typeof value === "string" ? value : "";
}

function getSettingNumber(
  settings: Record<string, unknown> | null,
  key: string,
  fallback: number
): number {
  const value = settings?.[key];
  return typeof value === "number" ? value : fallback;
}

function getSettingBoolean(
  settings: Record<string, unknown> | null,
  key: string,
  fallback: boolean
): boolean {
  const value = settings?.[key];
  return typeof value === "boolean" ? value : fallback;
}

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function MediaLibrary() {
  const { refreshMedia } = useWebsiteMedia();

  const [media, setMedia] =
    useState<WebsiteMediaState>(() => createDefaultMedia());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] =
    useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [showAddState, setShowAddState] = useState(false);
  const [newStateName, setNewStateName] = useState("");

  const loadMedia = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("website_media")
        .select("*")
        .order("display_order", {
          ascending: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      const rows = (data ?? []) as WebsiteMediaRow[];
      const nextMedia = createDefaultMedia();

      const heroRows = rows.filter(
        (row) =>
          row.section === "hero" &&
          row.slot_key === "hero-slide"
      );

      nextMedia.heroSlides = heroRows.map((row) => ({
        localId: String(row.id),
        databaseId: row.id,
        desktopImage: row.desktop_url ?? "",
        mobileImage: row.mobile_url ?? "",
        desktopPath: getSettingString(
          row.settings,
          "desktopPath"
        ),
        mobilePath: getSettingString(
          row.settings,
          "mobilePath"
        ),
        desktopName: getSettingString(
          row.settings,
          "desktopName"
        ),
        mobileName: getSettingString(
          row.settings,
          "mobileName"
        ),
        isActive: row.is_active ?? true,
      }));

      const heroSettingsRow = rows.find(
        (row) =>
          row.section === "hero" &&
          row.slot_key === "hero-settings"
      );

      if (heroSettingsRow) {
        nextMedia.heroAutoplay = getSettingBoolean(
          heroSettingsRow.settings,
          "autoplay",
          true
        );
        nextMedia.heroInterval = getSettingNumber(
          heroSettingsRow.settings,
          "interval",
          5000
        );
      }

      allImageSlots.forEach((slot) => {
        const row = rows.find(
          (item) =>
            item.section === slot.section &&
            item.slot_key === slot.slotKey
        );

        if (!row) return;

        nextMedia[slot.key] = {
          url: row.image_url ?? "",
          path: getSettingString(
            row.settings,
            "storagePath"
          ),
          databaseId: row.id,
        };
      });

      const stateRows = rows.filter(
        (row) =>
          row.section === "states" &&
          Boolean(row.slot_key)
      );

      const savedStates: StateImage[] = stateRows.map(
        (row) => ({
          localId: String(row.id),
          databaseId: row.id,
          name:
            row.title?.trim() ||
            row.slot_key ||
            "Unnamed State",
          slug: row.slot_key || "",
          url: row.image_url ?? "",
          path: getSettingString(
            row.settings,
            "storagePath"
          ),
        })
      );

      const savedSlugs = new Set(
        savedStates.map((state) => state.slug)
      );

      const missingDefaults = createDefaultStateImages().filter(
        (state) => !savedSlugs.has(state.slug)
      );

      nextMedia.stateImages = [
        ...savedStates,
        ...missingDefaults,
      ];

      setMedia(nextMedia);
    } catch (error) {
      console.error(
        "Unable to load website media:",
        error
      );
      alert(
        error instanceof Error
          ? error.message
          : "Unable to load website media."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia();
  }, []);

  const validateImage = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      alert("Please choose a valid image file.");
      return false;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Image size must be below 8 MB.");
      return false;
    }

    return true;
  };

  const handleSingleImage = async (
    event: ChangeEvent<HTMLInputElement>,
    slot: ImageSlot
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !validateImage(file)) return;

    try {
      setUploadingKey(slot.key);
      const uploaded = await uploadWebsiteImage({
        file,
        folder: `${slot.section}/${slot.slotKey}`,
      });
      const oldImage = media[slot.key];

      setMedia((current) => ({
        ...current,
        [slot.key]: {
          ...current[slot.key],
          url: uploaded.publicUrl,
          path: uploaded.path,
        },
      }));

      if (
        oldImage.path &&
        oldImage.path !== uploaded.path
      ) {
        try {
          await deleteWebsiteImage(oldImage.path);
        } catch (error) {
          console.error("Old image delete failed:", error);
        }
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Image upload failed."
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const removeSingleImage = async (
    key: SingleImageKey
  ) => {
    const currentImage = media[key];

    if (!window.confirm("Remove this image from the website?")) {
      return;
    }

    try {
      if (currentImage.path) {
        await deleteWebsiteImage(currentImage.path);
      }

      if (currentImage.databaseId) {
        const { error } = await supabase
          .from("website_media")
          .delete()
          .eq("id", currentImage.databaseId);

        if (error) throw new Error(error.message);
      }

      setMedia((current) => ({
        ...current,
        [key]: { ...emptyImage },
      }));
      await refreshMedia();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to remove image."
      );
    }
  };

  const addState = () => {
    const name = newStateName.trim();
    const slug = createSlug(name);

    if (!name || !slug) {
      alert("Please enter a valid state name.");
      return;
    }

    const alreadyExists = media.stateImages.some(
      (state) => state.slug === slug
    );

    if (alreadyExists) {
      alert("This state is already added.");
      return;
    }

    setMedia((current) => ({
      ...current,
      stateImages: [
        ...current.stateImages,
        {
          localId: crypto.randomUUID(),
          databaseId: null,
          name,
          slug,
          url: "",
          path: "",
        },
      ],
    }));

    setNewStateName("");
    setShowAddState(false);
  };

  const updateState = (
    localId: string,
    changes: Partial<StateImage>
  ) => {
    setMedia((current) => ({
      ...current,
      stateImages: current.stateImages.map((state) =>
        state.localId === localId
          ? { ...state, ...changes }
          : state
      ),
    }));
  };

  const handleStateImage = async (
    event: ChangeEvent<HTMLInputElement>,
    state: StateImage
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !validateImage(file)) return;

    const key = `state-${state.localId}`;

    try {
      setUploadingKey(key);
      const uploaded = await uploadWebsiteImage({
        file,
        folder: `states/${state.slug}`,
      });

      const oldPath = state.path;
      updateState(state.localId, {
        url: uploaded.publicUrl,
        path: uploaded.path,
      });

      if (oldPath && oldPath !== uploaded.path) {
        try {
          await deleteWebsiteImage(oldPath);
        } catch (error) {
          console.error("Old state image delete failed:", error);
        }
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "State image upload failed."
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const deleteState = async (state: StateImage) => {
    if (
      !window.confirm(
        `Delete ${state.name} from State Images?`
      )
    ) {
      return;
    }

    try {
      if (state.path) {
        await deleteWebsiteImage(state.path);
      }

      if (state.databaseId) {
        const { error } = await supabase
          .from("website_media")
          .delete()
          .eq("id", state.databaseId);

        if (error) throw new Error(error.message);
      }

      setMedia((current) => ({
        ...current,
        stateImages: current.stateImages.filter(
          (item) => item.localId !== state.localId
        ),
      }));

      await refreshMedia();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete state."
      );
    }
  };

  const addHeroSlide = () => {
    setMedia((current) => ({
      ...current,
      heroSlides: [
        ...current.heroSlides,
        {
          localId: crypto.randomUUID(),
          databaseId: null,
          desktopImage: "",
          mobileImage: "",
          desktopPath: "",
          mobilePath: "",
          desktopName: "",
          mobileName: "",
          isActive: true,
        },
      ],
    }));
  };

  const updateHeroSlide = (
    localId: string,
    changes: Partial<HeroSlide>
  ) => {
    setMedia((current) => ({
      ...current,
      heroSlides: current.heroSlides.map((slide) =>
        slide.localId === localId
          ? { ...slide, ...changes }
          : slide
      ),
    }));
  };

  const handleHeroImage = async (
    event: ChangeEvent<HTMLInputElement>,
    slide: HeroSlide,
    imageType: "desktop" | "mobile"
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !validateImage(file)) return;

    const uploadKey = `${slide.localId}-${imageType}`;

    try {
      setUploadingKey(uploadKey);
      const uploaded = await uploadWebsiteImage({
        file,
        folder: `hero/${slide.localId}/${imageType}`,
      });
      const oldPath =
        imageType === "desktop"
          ? slide.desktopPath
          : slide.mobilePath;

      if (imageType === "desktop") {
        updateHeroSlide(slide.localId, {
          desktopImage: uploaded.publicUrl,
          desktopPath: uploaded.path,
          desktopName: file.name,
        });
      } else {
        updateHeroSlide(slide.localId, {
          mobileImage: uploaded.publicUrl,
          mobilePath: uploaded.path,
          mobileName: file.name,
        });
      }

      if (oldPath && oldPath !== uploaded.path) {
        try {
          await deleteWebsiteImage(oldPath);
        } catch (error) {
          console.error("Old hero image delete failed:", error);
        }
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Hero image upload failed."
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const removeHeroSlide = async (slide: HeroSlide) => {
    if (!window.confirm("Delete this hero slide?")) return;

    try {
      for (const path of [
        slide.desktopPath,
        slide.mobilePath,
      ].filter(Boolean)) {
        try {
          await deleteWebsiteImage(path);
        } catch (error) {
          console.error("Hero file delete failed:", error);
        }
      }

      if (slide.databaseId) {
        const { error } = await supabase
          .from("website_media")
          .delete()
          .eq("id", slide.databaseId);

        if (error) throw new Error(error.message);
      }

      setMedia((current) => ({
        ...current,
        heroSlides: current.heroSlides.filter(
          (item) => item.localId !== slide.localId
        ),
      }));
      await refreshMedia();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete hero slide."
      );
    }
  };

  const moveHeroSlide = (
    index: number,
    direction: "up" | "down"
  ) => {
    const destinationIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      destinationIndex < 0 ||
      destinationIndex >= media.heroSlides.length
    ) {
      return;
    }

    setMedia((current) => {
      const slides = [...current.heroSlides];
      const [selectedSlide] = slides.splice(index, 1);
      slides.splice(destinationIndex, 0, selectedSlide);
      return { ...current, heroSlides: slides };
    });
  };

  const saveHeroSettings = async () => {
    const { data: existing, error } = await supabase
      .from("website_media")
      .select("id")
      .eq("section", "hero")
      .eq("slot_key", "hero-settings")
      .maybeSingle();

    if (error) throw new Error(error.message);

    const payload = {
      section: "hero",
      slot_key: "hero-settings",
      title: "Hero Slider Settings",
      display_order: 0,
      is_active: true,
      settings: {
        autoplay: media.heroAutoplay,
        interval: media.heroInterval,
      },
      updated_at: new Date().toISOString(),
    };

    const query = existing?.id
      ? supabase
          .from("website_media")
          .update(payload)
          .eq("id", existing.id)
      : supabase.from("website_media").insert(payload);

    const { error: saveError } = await query;
    if (saveError) throw new Error(saveError.message);
  };

  const saveHeroSlides = async () => {
    for (let index = 0; index < media.heroSlides.length; index += 1) {
      const slide = media.heroSlides[index];

      if (!slide.desktopImage && !slide.mobileImage) {
        throw new Error(
          `Slide ${index + 1} must contain a desktop or mobile image.`
        );
      }

      const payload = {
        section: "hero",
        slot_key: "hero-slide",
        title: `Hero Slide ${index + 1}`,
        desktop_url: slide.desktopImage || null,
        mobile_url: slide.mobileImage || null,
        display_order: index + 1,
        is_active: slide.isActive,
        settings: {
          desktopPath: slide.desktopPath,
          mobilePath: slide.mobilePath,
          desktopName: slide.desktopName,
          mobileName: slide.mobileName,
        },
        updated_at: new Date().toISOString(),
      };

      if (slide.databaseId) {
        const { error } = await supabase
          .from("website_media")
          .update(payload)
          .eq("id", slide.databaseId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from("website_media")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        updateHeroSlide(slide.localId, {
          databaseId: data.id,
        });
      }
    }
  };

  const saveSingleSlots = async () => {
    for (const slot of allImageSlots) {
      const image = media[slot.key];
      if (!image.url) continue;

      const payload = {
        section: slot.section,
        slot_key: slot.slotKey,
        title: slot.title,
        image_url: image.url,
        display_order: 0,
        is_active: true,
        settings: { storagePath: image.path },
        updated_at: new Date().toISOString(),
      };

      if (image.databaseId) {
        const { error } = await supabase
          .from("website_media")
          .update(payload)
          .eq("id", image.databaseId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from("website_media")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        setMedia((current) => ({
          ...current,
          [slot.key]: {
            ...current[slot.key],
            databaseId: data.id,
          },
        }));
      }
    }
  };

  const saveStateImages = async () => {
    for (let index = 0; index < media.stateImages.length; index += 1) {
      const state = media.stateImages[index];
      const payload = {
        section: "states",
        slot_key: state.slug,
        title: state.name,
        image_url: state.url || null,
        display_order: index + 1,
        is_active: true,
        settings: { storagePath: state.path },
        updated_at: new Date().toISOString(),
      };

      if (state.databaseId) {
        const { error } = await supabase
          .from("website_media")
          .update(payload)
          .eq("id", state.databaseId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from("website_media")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        updateState(state.localId, {
          databaseId: data.id,
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedMessage("");
      await saveHeroSettings();
      await saveHeroSlides();
      await saveSingleSlots();
      await saveStateImages();
      await loadMedia();
      await refreshMedia();
      setSavedMessage("Website images saved successfully.");
      window.setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Website media save failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save website media."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderImageSlot = (slot: ImageSlot) => {
    const image = media[slot.key];
    const isUploading = uploadingKey === slot.key;

    return (
      <article className="website-image-slot" key={slot.key}>
        <div className="website-slot-preview">
          {image.url ? (
            <img src={image.url} alt={slot.title} />
          ) : (
            <FiImage />
          )}
        </div>

        <div className="website-slot-content">
          <h3>{slot.title}</h3>
          <p>{slot.description}</p>

          <div className="website-slot-actions">
            <label>
              <FiUploadCloud />
              {isUploading
                ? "Uploading..."
                : image.url
                  ? "Replace Image"
                  : "Upload Image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={isUploading}
                onChange={(event) =>
                  void handleSingleImage(event, slot)
                }
              />
            </label>

            {image.url && (
              <button
                type="button"
                disabled={isUploading}
                onClick={() =>
                  void removeSingleImage(slot.key)
                }
              >
                <FiTrash2 />
                Remove
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <div className="website-manager-page">
        <div className="hero-slides-empty">
          <FiImage />
          <h3>Loading website media...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="website-manager-page">
      <div className="website-manager-breadcrumb">
        <span>Website</span>
        <span>/</span>
        <strong>Media Library</strong>
      </div>

      <header className="website-manager-header">
        <div>
          <h1>Website Media</h1>
          <p>
            Change website images and manage homepage sliders.
          </p>
        </div>

        <button
          type="button"
          className="website-manager-save"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          <FiSave />
          {saving ? "Saving..." : "Save Website Changes"}
        </button>
      </header>

      {savedMessage && (
        <div className="website-save-message">
          {savedMessage}
        </div>
      )}

      <section className="website-manager-section">
        <div className="website-section-header">
          <div>
            <h2>Hero Slider</h2>
            <p>
              Add desktop and mobile images that slide automatically on the homepage.
            </p>
          </div>

          <button type="button" onClick={addHeroSlide}>
            <FiPlus />
            Add Slide
          </button>
        </div>

        <div className="hero-slider-settings">
          <label className="website-switch-field">
            <input
              type="checkbox"
              checked={media.heroAutoplay}
              onChange={(event) =>
                setMedia((current) => ({
                  ...current,
                  heroAutoplay: event.target.checked,
                }))
              }
            />
            <span>Autoplay Hero Slider</span>
          </label>

          <label className="website-interval-field">
            <span>Slide Duration</span>
            <select
              value={media.heroInterval}
              onChange={(event) =>
                setMedia((current) => ({
                  ...current,
                  heroInterval: Number(event.target.value),
                }))
              }
            >
              <option value={3000}>3 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={7000}>7 seconds</option>
              <option value={10000}>10 seconds</option>
            </select>
          </label>
        </div>

        {media.heroSlides.length === 0 ? (
          <div className="hero-slides-empty">
            <FiImage />
            <h3>No hero slides added</h3>
            <p>Add the first desktop and mobile hero images.</p>
            <button type="button" onClick={addHeroSlide}>
              <FiPlus />
              Add First Slide
            </button>
          </div>
        ) : (
          <div className="hero-slides-list">
            {media.heroSlides.map((slide, index) => {
              const desktopUploading =
                uploadingKey === `${slide.localId}-desktop`;
              const mobileUploading =
                uploadingKey === `${slide.localId}-mobile`;

              return (
                <article className="hero-slide-card" key={slide.localId}>
                  <div className="hero-slide-top">
                    <div>
                      <span>Slide {index + 1}</span>
                      <strong>
                        {slide.isActive ? "Active" : "Hidden"}
                      </strong>
                    </div>

                    <div className="hero-slide-order">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveHeroSlide(index, "up")}
                      >
                        <FiChevronUp />
                      </button>
                      <button
                        type="button"
                        disabled={index === media.heroSlides.length - 1}
                        onClick={() => moveHeroSlide(index, "down")}
                      >
                        <FiChevronDown />
                      </button>
                      <button
                        type="button"
                        className="hero-slide-delete"
                        onClick={() => void removeHeroSlide(slide)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className="hero-slide-images">
                    <div className="hero-image-field">
                      <div className="hero-image-label">
                        <FiMonitor />
                        Desktop Image
                      </div>
                      <div className="hero-image-preview">
                        {slide.desktopImage ? (
                          <img
                            src={slide.desktopImage}
                            alt={`Desktop hero slide ${index + 1}`}
                          />
                        ) : (
                          <FiImage />
                        )}
                      </div>
                      <label>
                        <FiUploadCloud />
                        {desktopUploading
                          ? "Uploading..."
                          : slide.desktopImage
                            ? "Replace Desktop Image"
                            : "Upload Desktop Image"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          disabled={desktopUploading}
                          onChange={(event) =>
                            void handleHeroImage(
                              event,
                              slide,
                              "desktop"
                            )
                          }
                        />
                      </label>
                      {slide.desktopName && (
                        <small>{slide.desktopName}</small>
                      )}
                    </div>

                    <div className="hero-image-field">
                      <div className="hero-image-label">
                        <FiSmartphone />
                        Mobile Image
                      </div>
                      <div className="hero-image-preview hero-mobile-preview">
                        {slide.mobileImage ? (
                          <img
                            src={slide.mobileImage}
                            alt={`Mobile hero slide ${index + 1}`}
                          />
                        ) : (
                          <FiImage />
                        )}
                      </div>
                      <label>
                        <FiUploadCloud />
                        {mobileUploading
                          ? "Uploading..."
                          : slide.mobileImage
                            ? "Replace Mobile Image"
                            : "Upload Mobile Image"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          disabled={mobileUploading}
                          onChange={(event) =>
                            void handleHeroImage(event, slide, "mobile")
                          }
                        />
                      </label>
                      {slide.mobileName && (
                        <small>{slide.mobileName}</small>
                      )}
                    </div>
                  </div>

                  <label className="hero-slide-active">
                    <input
                      type="checkbox"
                      checked={slide.isActive}
                      onChange={(event) =>
                        updateHeroSlide(slide.localId, {
                          isActive: event.target.checked,
                        })
                      }
                    />
                    Show this slide on website
                  </label>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="website-manager-section">
        <div className="website-section-header">
          <div>
            <h2>Homepage Images</h2>
            <p>Replace images used in homepage sections.</p>
          </div>
        </div>
        <div className="website-image-grid">
          {homepageSlots.map(renderImageSlot)}
        </div>
      </section>

      <section className="website-manager-section">
        <div className="website-section-header">
          <div>
            <h2>State Images</h2>
            <p>
              Add new states and replace the image used for each state.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddState(true)}
          >
            <FiPlus />
            Add State
          </button>
        </div>

        {showAddState && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "22px",
              padding: "16px",
              border: "1px solid #dfcbbb",
              borderRadius: "14px",
              background: "#fbf4ed",
            }}
          >
            <input
              type="text"
              value={newStateName}
              placeholder="Enter state name, e.g. Maharashtra"
              onChange={(event) => setNewStateName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addState();
              }}
              style={{
                flex: 1,
                minHeight: "44px",
                padding: "0 14px",
                border: "1px solid #d7bda7",
                borderRadius: "11px",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={addState}
              style={{
                minHeight: "44px",
                padding: "0 18px",
                border: "none",
                borderRadius: "11px",
                background: "#6f3d1b",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddState(false);
                setNewStateName("");
              }}
              style={{
                minHeight: "44px",
                padding: "0 18px",
                border: "1px solid #dfcbbb",
                borderRadius: "11px",
                background: "white",
                color: "#6f3d1b",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="website-image-grid">
          {media.stateImages.map((state) => {
            const isUploading =
              uploadingKey === `state-${state.localId}`;

            return (
              <article
                className="website-image-slot"
                key={state.localId}
              >
                <div className="website-slot-preview">
                  {state.url ? (
                    <img src={state.url} alt={state.name} />
                  ) : (
                    <FiImage />
                  )}
                </div>

                <div className="website-slot-content">
                  <h3>{state.name}</h3>
                  <p>Image displayed for {state.name}.</p>

                  <div className="website-slot-actions">
                    <label>
                      <FiUploadCloud />
                      {isUploading
                        ? "Uploading..."
                        : state.url
                          ? "Replace Image"
                          : "Upload Image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        disabled={isUploading}
                        onChange={(event) =>
                          void handleStateImage(event, state)
                        }
                      />
                    </label>

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => void deleteState(state)}
                    >
                      <FiTrash2 />
                      Delete State
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="website-manager-section">
        <div className="website-section-header">
          <div>
            <h2>Brand Images</h2>
            <p>Manage the website logo and browser favicon.</p>
          </div>
        </div>
        <div className="website-image-grid">
          {brandSlots.map(renderImageSlot)}
        </div>
      </section>

      <div className="website-manager-bottom">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          <FiSave />
          {saving ? "Saving..." : "Save Website Changes"}
        </button>
      </div>
    </div>
  );
}