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
  isActive: boolean;
};

type StateImage = {
  localId: string;
  databaseId: number | null;
  name: string;
  slug: string;
  url: string;
  path: string;
};

type SingleImage = {
  databaseId: number | null;
  url: string;
  path: string;
};

type HouseSlide = {
  localId: string;
  databaseId: number | null;
  url: string;
  path: string;
  isActive: boolean;
};

type MediaState = {
  heroSlides: HeroSlide[];
  heroAutoplay: boolean;
  heroInterval: number;
  stateImages: StateImage[];
  journeyImage: SingleImage;
  houseSlides: HouseSlide[];
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

const emptyImage: SingleImage = {
  databaseId: null,
  url: "",
  path: "",
};

const defaultStates = [
  ["Tamil Nadu", "tamil-nadu"],
  ["Kerala", "kerala"],
  ["Karnataka", "karnataka"],
  ["Andhra Pradesh", "andhra-pradesh"],
  ["West Bengal", "west-bengal"],
  ["Rajasthan", "rajasthan"],
] as const;

const createDefaultStateImages = (): StateImage[] =>
  defaultStates.map(([name, slug]) => ({
    localId: crypto.randomUUID(),
    databaseId: null,
    name,
    slug,
    url: "",
    path: "",
  }));

const createInitialMedia = (): MediaState => ({
  heroSlides: [],
  heroAutoplay: true,
  heroInterval: 5000,
  stateImages: createDefaultStateImages(),
  journeyImage: { ...emptyImage },
  houseSlides: [],
});

function getSettingString(
  settings: Record<string, unknown> | null,
  key: string
) {
  const value = settings?.[key];
  return typeof value === "string" ? value : "";
}

function getSettingBoolean(
  settings: Record<string, unknown> | null,
  key: string,
  fallback: boolean
) {
  const value = settings?.[key];
  return typeof value === "boolean" ? value : fallback;
}

function getSettingNumber(
  settings: Record<string, unknown> | null,
  key: string,
  fallback: number
) {
  const value = settings?.[key];
  return typeof value === "number" ? value : fallback;
}

function createSlug(value: string) {
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
    useState<MediaState>(() => createInitialMedia());

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
        .order("display_order", { ascending: true });

      if (error) throw new Error(error.message);

      const rows = (data ?? []) as WebsiteMediaRow[];
      const next = createInitialMedia();

      next.heroSlides = rows
        .filter(
          (row) =>
            row.section === "hero" &&
            row.slot_key === "hero-slide"
        )
        .map((row) => ({
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
          isActive: row.is_active ?? true,
        }));

      const heroSettings = rows.find(
        (row) =>
          row.section === "hero" &&
          row.slot_key === "hero-settings"
      );

      if (heroSettings) {
        next.heroAutoplay = getSettingBoolean(
          heroSettings.settings,
          "autoplay",
          true
        );

        next.heroInterval = getSettingNumber(
          heroSettings.settings,
          "interval",
          5000
        );
      }

      const savedStates = rows
        .filter(
          (row) =>
            row.section === "states" &&
            Boolean(row.slot_key)
        )
        .map<StateImage>((row) => ({
          localId: String(row.id),
          databaseId: row.id,
          name:
            row.title?.trim() ||
            row.slot_key ||
            "Unnamed State",
          slug: row.slot_key ?? "",
          url: row.image_url ?? "",
          path: getSettingString(
            row.settings,
            "storagePath"
          ),
        }));

      const savedSlugs = new Set(
        savedStates.map((state) => state.slug)
      );

      next.stateImages = [
        ...savedStates,
        ...createDefaultStateImages().filter(
          (state) => !savedSlugs.has(state.slug)
        ),
      ];

      const journeyRow = rows.find(
        (row) =>
          row.section === "journey" &&
          row.slot_key === "journey-image"
      );

      if (journeyRow) {
        next.journeyImage = {
          databaseId: journeyRow.id,
          url: journeyRow.image_url ?? "",
          path: getSettingString(
            journeyRow.settings,
            "storagePath"
          ),
        };
      }

      next.houseSlides = rows
        .filter(
          (row) =>
            row.section === "house-slider" &&
            row.slot_key === "house-slide"
        )
        .map((row) => ({
          localId: String(row.id),
          databaseId: row.id,
          url: row.image_url ?? "",
          path: getSettingString(
            row.settings,
            "storagePath"
          ),
          isActive: row.is_active ?? true,
        }));

      setMedia(next);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to load media."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia();
  }, []);

  const validateImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please choose a valid image.");
      return false;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Image size must be below 8 MB.");
      return false;
    }

    return true;
  };

  const uploadImage = async (
    file: File,
    folder: string
  ) => {
    return uploadWebsiteImage({
      file,
      folder,
    });
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
    type: "desktop" | "mobile"
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !validateImage(file)) return;

    const key = `${slide.localId}-${type}`;

    try {
      setUploadingKey(key);

      const uploaded = await uploadImage(
        file,
        `hero/${slide.localId}/${type}`
      );

      const oldPath =
        type === "desktop"
          ? slide.desktopPath
          : slide.mobilePath;

      updateHeroSlide(slide.localId, {
        ...(type === "desktop"
          ? {
              desktopImage: uploaded.publicUrl,
              desktopPath: uploaded.path,
            }
          : {
              mobileImage: uploaded.publicUrl,
              mobilePath: uploaded.path,
            }),
      });

      if (oldPath && oldPath !== uploaded.path) {
        await deleteWebsiteImage(oldPath).catch(console.error);
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Hero upload failed."
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const moveHeroSlide = (
    index: number,
    direction: "up" | "down"
  ) => {
    const target =
      direction === "up" ? index - 1 : index + 1;

    if (
      target < 0 ||
      target >= media.heroSlides.length
    ) {
      return;
    }

    setMedia((current) => {
      const slides = [...current.heroSlides];
      const [selected] = slides.splice(index, 1);
      slides.splice(target, 0, selected);

      return {
        ...current,
        heroSlides: slides,
      };
    });
  };

  const removeHeroSlide = async (slide: HeroSlide) => {
    if (!window.confirm("Delete this hero slide?")) return;

    try {
      for (const path of [
        slide.desktopPath,
        slide.mobilePath,
      ].filter(Boolean)) {
        await deleteWebsiteImage(path).catch(console.error);
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
          : "Unable to delete slide."
      );
    }
  };

  const addState = () => {
    const name = newStateName.trim();
    const slug = createSlug(name);

    if (!name || !slug) {
      alert("Enter a valid state name.");
      return;
    }

    if (
      media.stateImages.some(
        (state) => state.slug === slug
      )
    ) {
      alert("This state already exists.");
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

      const uploaded = await uploadImage(
        file,
        `states/${state.slug}`
      );

      const oldPath = state.path;

      updateState(state.localId, {
        url: uploaded.publicUrl,
        path: uploaded.path,
      });

      if (oldPath && oldPath !== uploaded.path) {
        await deleteWebsiteImage(oldPath).catch(console.error);
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
    if (!window.confirm(`Delete ${state.name}?`)) return;

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

  const handleJourneyImage = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !validateImage(file)) return;

    try {
      setUploadingKey("journey-image");

      const uploaded = await uploadImage(
        file,
        "journey/main"
      );

      const oldPath = media.journeyImage.path;

      setMedia((current) => ({
        ...current,
        journeyImage: {
          ...current.journeyImage,
          url: uploaded.publicUrl,
          path: uploaded.path,
        },
      }));

      if (oldPath && oldPath !== uploaded.path) {
        await deleteWebsiteImage(oldPath).catch(console.error);
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Journey image upload failed."
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const addHouseSlide = () => {
    setMedia((current) => ({
      ...current,
      houseSlides: [
        ...current.houseSlides,
        {
          localId: crypto.randomUUID(),
          databaseId: null,
          url: "",
          path: "",
          isActive: true,
        },
      ],
    }));
  };

  const updateHouseSlide = (
    localId: string,
    changes: Partial<HouseSlide>
  ) => {
    setMedia((current) => ({
      ...current,
      houseSlides: current.houseSlides.map((slide) =>
        slide.localId === localId
          ? { ...slide, ...changes }
          : slide
      ),
    }));
  };

  const handleHouseImage = async (
    event: ChangeEvent<HTMLInputElement>,
    slide: HouseSlide
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !validateImage(file)) return;

    const key = `house-${slide.localId}`;

    try {
      setUploadingKey(key);

      const uploaded = await uploadImage(
        file,
        `house-slider/${slide.localId}`
      );

      const oldPath = slide.path;

      updateHouseSlide(slide.localId, {
        url: uploaded.publicUrl,
        path: uploaded.path,
      });

      if (oldPath && oldPath !== uploaded.path) {
        await deleteWebsiteImage(oldPath).catch(console.error);
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "House image upload failed."
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const moveHouseSlide = (
    index: number,
    direction: "up" | "down"
  ) => {
    const target =
      direction === "up" ? index - 1 : index + 1;

    if (
      target < 0 ||
      target >= media.houseSlides.length
    ) {
      return;
    }

    setMedia((current) => {
      const slides = [...current.houseSlides];
      const [selected] = slides.splice(index, 1);
      slides.splice(target, 0, selected);

      return {
        ...current,
        houseSlides: slides,
      };
    });
  };

  const removeHouseSlide = async (
    slide: HouseSlide
  ) => {
    if (!window.confirm("Delete this house image?")) {
      return;
    }

    try {
      if (slide.path) {
        await deleteWebsiteImage(slide.path);
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
        houseSlides: current.houseSlides.filter(
          (item) => item.localId !== slide.localId
        ),
      }));

      await refreshMedia();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete house image."
      );
    }
  };

  const saveHero = async () => {
    const { data: settingsRow, error } = await supabase
      .from("website_media")
      .select("id")
      .eq("section", "hero")
      .eq("slot_key", "hero-settings")
      .maybeSingle();

    if (error) throw new Error(error.message);

    const settingsPayload = {
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

    const settingsQuery = settingsRow?.id
      ? supabase
          .from("website_media")
          .update(settingsPayload)
          .eq("id", settingsRow.id)
      : supabase
          .from("website_media")
          .insert(settingsPayload);

    const { error: settingsError } =
      await settingsQuery;

    if (settingsError) {
      throw new Error(settingsError.message);
    }

    for (
      let index = 0;
      index < media.heroSlides.length;
      index += 1
    ) {
      const slide = media.heroSlides[index];

      if (
        !slide.desktopImage &&
        !slide.mobileImage
      ) {
        throw new Error(
          `Hero slide ${index + 1} needs an image.`
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
        },
        updated_at: new Date().toISOString(),
      };

      if (slide.databaseId) {
        const { error: updateError } = await supabase
          .from("website_media")
          .update(payload)
          .eq("id", slide.databaseId);

        if (updateError) {
          throw new Error(updateError.message);
        }
      } else {
        const { data, error: insertError } =
          await supabase
            .from("website_media")
            .insert(payload)
            .select("id")
            .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        updateHeroSlide(slide.localId, {
          databaseId: data.id,
        });
      }
    }
  };

  const saveStates = async () => {
    for (
      let index = 0;
      index < media.stateImages.length;
      index += 1
    ) {
      const state = media.stateImages[index];

      if (!state.url && !state.databaseId) continue;

      const payload = {
        section: "states",
        slot_key: state.slug,
        title: state.name,
        image_url: state.url || null,
        display_order: index + 1,
        is_active: true,
        settings: {
          storagePath: state.path,
        },
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

  const saveJourney = async () => {
    if (!media.journeyImage.url) return;

    const payload = {
      section: "journey",
      slot_key: "journey-image",
      title: "Discover Journey Image",
      image_url: media.journeyImage.url,
      display_order: 1,
      is_active: true,
      settings: {
        storagePath: media.journeyImage.path,
      },
      updated_at: new Date().toISOString(),
    };

    if (media.journeyImage.databaseId) {
      const { error } = await supabase
        .from("website_media")
        .update(payload)
        .eq(
          "id",
          media.journeyImage.databaseId
        );

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
        journeyImage: {
          ...current.journeyImage,
          databaseId: data.id,
        },
      }));
    }
  };

  const saveHouse = async () => {
    for (
      let index = 0;
      index < media.houseSlides.length;
      index += 1
    ) {
      const slide = media.houseSlides[index];

      if (!slide.url) {
        throw new Error(
          `House image ${index + 1} is empty.`
        );
      }

      const payload = {
        section: "house-slider",
        slot_key: "house-slide",
        title: `House Slide ${index + 1}`,
        image_url: slide.url,
        display_order: index + 1,
        is_active: slide.isActive,
        settings: {
          storagePath: slide.path,
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

        updateHouseSlide(slide.localId, {
          databaseId: data.id,
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedMessage("");

      await saveHero();
      await saveStates();
      await saveJourney();
      await saveHouse();

      await loadMedia();
      await refreshMedia();

      setSavedMessage(
        "Website images saved successfully."
      );

      window.setTimeout(
        () => setSavedMessage(""),
        3000
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save media."
      );
    } finally {
      setSaving(false);
    }
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
            Hero, states, journey and house slider images.
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
            <p>Images used in Hero.tsx.</p>
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
                  heroInterval: Number(
                    event.target.value
                  ),
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
            <h3>No hero slides</h3>

            <button type="button" onClick={addHeroSlide}>
              <FiPlus />
              Add First Slide
            </button>
          </div>
        ) : (
          <div className="hero-slides-list">
            {media.heroSlides.map((slide, index) => (
              <article
                className="hero-slide-card"
                key={slide.localId}
              >
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
                      onClick={() =>
                        moveHeroSlide(index, "up")
                      }
                    >
                      <FiChevronUp />
                    </button>

                    <button
                      type="button"
                      disabled={
                        index === media.heroSlides.length - 1
                      }
                      onClick={() =>
                        moveHeroSlide(index, "down")
                      }
                    >
                      <FiChevronDown />
                    </button>

                    <button
                      type="button"
                      className="hero-slide-delete"
                      onClick={() =>
                        void removeHeroSlide(slide)
                      }
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="hero-slide-images">
                  {(["desktop", "mobile"] as const).map(
                    (type) => {
                      const image =
                        type === "desktop"
                          ? slide.desktopImage
                          : slide.mobileImage;

                      const isUploading =
                        uploadingKey ===
                        `${slide.localId}-${type}`;

                      return (
                        <div
                          className="hero-image-field"
                          key={type}
                        >
                          <div className="hero-image-label">
                            {type === "desktop" ? (
                              <FiMonitor />
                            ) : (
                              <FiSmartphone />
                            )}

                            {type === "desktop"
                              ? "Desktop Image"
                              : "Mobile Image"}
                          </div>

                          <div className="hero-image-preview">
                            {image ? (
                              <img
                                src={image}
                                alt={`${type} hero`}
                              />
                            ) : (
                              <FiImage />
                            )}
                          </div>

                          <label>
                            <FiUploadCloud />
                            {isUploading
                              ? "Uploading..."
                              : image
                                ? "Replace Image"
                                : "Upload Image"}

                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              disabled={isUploading}
                              onChange={(event) =>
                                void handleHeroImage(
                                  event,
                                  slide,
                                  type
                                )
                              }
                            />
                          </label>
                        </div>
                      );
                    }
                  )}
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
            ))}
          </div>
        )}
      </section>

      <section className="website-manager-section">
        <div className="website-section-header">
          <div>
            <h2>State Marquee Images</h2>
            <p>Images used in StateMarquee.tsx.</p>
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
          <div className="hero-slider-settings">
            <input
              type="text"
              value={newStateName}
              placeholder="Enter state name"
              onChange={(event) =>
                setNewStateName(event.target.value)
              }
            />

            <button type="button" onClick={addState}>
              Add
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddState(false);
                setNewStateName("");
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
                  <p>StateMarquee.tsx image.</p>

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
                          void handleStateImage(
                            event,
                            state
                          )
                        }
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        void deleteState(state)
                      }
                    >
                      <FiTrash2 />
                      Delete
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
            <h2>Discover Journey Image</h2>
            <p>Image used in DiscoverJourney.tsx.</p>
          </div>
        </div>

        <div className="website-image-grid">
          <article className="website-image-slot">
            <div className="website-slot-preview">
              {media.journeyImage.url ? (
                <img
                  src={media.journeyImage.url}
                  alt="Discover Journey"
                />
              ) : (
                <FiImage />
              )}
            </div>

            <div className="website-slot-content">
              <h3>Discover Journey</h3>
              <p>Main journey section image.</p>

              <div className="website-slot-actions">
                <label>
                  <FiUploadCloud />
                  {uploadingKey === "journey-image"
                    ? "Uploading..."
                    : media.journeyImage.url
                      ? "Replace Image"
                      : "Upload Image"}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) =>
                      void handleJourneyImage(event)
                    }
                  />
                </label>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="website-manager-section">
        <div className="website-section-header">
          <div>
            <h2>House Slider Images</h2>
            <p>Images used in HouseSlider.tsx.</p>
          </div>

          <button type="button" onClick={addHouseSlide}>
            <FiPlus />
            Add Image
          </button>
        </div>

        {media.houseSlides.length === 0 ? (
          <div className="hero-slides-empty">
            <FiImage />
            <h3>No house images</h3>

            <button type="button" onClick={addHouseSlide}>
              <FiPlus />
              Add First Image
            </button>
          </div>
        ) : (
          <div className="website-image-grid">
            {media.houseSlides.map((slide, index) => {
              const isUploading =
                uploadingKey ===
                `house-${slide.localId}`;

              return (
                <article
                  className="website-image-slot"
                  key={slide.localId}
                >
                  <div className="website-slot-preview">
                    {slide.url ? (
                      <img
                        src={slide.url}
                        alt={`House ${index + 1}`}
                      />
                    ) : (
                      <FiImage />
                    )}
                  </div>

                  <div className="website-slot-content">
                    <h3>House Image {index + 1}</h3>

                    <div className="hero-slide-order">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() =>
                          moveHouseSlide(index, "up")
                        }
                      >
                        <FiChevronUp />
                      </button>

                      <button
                        type="button"
                        disabled={
                          index ===
                          media.houseSlides.length - 1
                        }
                        onClick={() =>
                          moveHouseSlide(index, "down")
                        }
                      >
                        <FiChevronDown />
                      </button>
                    </div>

                    <div className="website-slot-actions">
                      <label>
                        <FiUploadCloud />
                        {isUploading
                          ? "Uploading..."
                          : slide.url
                            ? "Replace Image"
                            : "Upload Image"}

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          disabled={isUploading}
                          onChange={(event) =>
                            void handleHouseImage(
                              event,
                              slide
                            )
                          }
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          void removeHouseSlide(slide)
                        }
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>

                    <label className="hero-slide-active">
                      <input
                        type="checkbox"
                        checked={slide.isActive}
                        onChange={(event) =>
                          updateHouseSlide(slide.localId, {
                            isActive:
                              event.target.checked,
                          })
                        }
                      />
                      Show on website
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        )}
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