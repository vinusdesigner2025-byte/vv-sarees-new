import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import {
  FiCheckCircle,
  FiGlobe,
  FiImage,
  FiMapPin,
  FiSave,
  FiSettings,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";

import "../css/Settings.css";

type SettingsForm = {
  storeName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;

  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address: string;

  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;

  shippingCharge: string;
  freeShippingAbove: string;
  codEnabled: boolean;

  gstNumber: string;
  panNumber: string;

  currency: string;
  timezone: string;
  maintenanceMode: boolean;
};

const defaultSettings: SettingsForm = {
  storeName: "VV Sarees",
  tagline: "Voice of Vanigan Sarees",
  logoUrl: "",
  faviconUrl: "",

  phoneNumber: "",
  whatsappNumber: "",
  email: "",
  address: "",

  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",

  shippingCharge: "0",
  freeShippingAbove: "0",
  codEnabled: true,

  gstNumber: "",
  panNumber: "",

  currency: "INR",
  timezone: "Asia/Kolkata",
  maintenanceMode: false,
};

export default function Settings() {
  const [formData, setFormData] =
    useState<SettingsForm>(defaultSettings);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("website_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle();

      if (error) {
        console.error(
          "Settings load error:",
          error
        );

        setErrorMessage(
          `Settings load aagala: ${error.message}`
        );

        setIsLoading(false);
        return;
      }

      if (data) {
        setFormData({
          storeName:
            data.store_name ?? "VV Sarees",

          tagline:
            data.tagline ??
            "Voice of Vanigan Sarees",

          logoUrl: "",
          faviconUrl: "",

          phoneNumber:
            data.phone_number ?? "",

          whatsappNumber:
            data.whatsapp_number ?? "",

          email: data.email ?? "",
          address: data.address ?? "",

          instagramUrl:
            data.instagram_url ?? "",

          facebookUrl:
            data.facebook_url ?? "",

          youtubeUrl:
            data.youtube_url ?? "",

          shippingCharge: String(
            data.shipping_charge ?? 0
          ),

          freeShippingAbove: String(
            data.free_shipping_above ?? 0
          ),

          codEnabled:
            data.cod_enabled ?? true,

          gstNumber: "",
          panNumber: "",

          currency:
            data.currency ?? "INR",

          timezone:
            data.timezone ??
            "Asia/Kolkata",

          maintenanceMode:
            data.maintenance_mode ?? false,
        });
      }

      setIsLoading(false);
    };

    void loadSettings();
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((currentSettings) => ({
      ...currentSettings,
      [name]: value,
    }));

    setSaveMessage("");
    setErrorMessage("");
  };

  const handleToggleChange = (
    field:
      | "codEnabled"
      | "maintenanceMode"
  ) => {
    setFormData((currentSettings) => ({
      ...currentSettings,
      [field]:
        !currentSettings[field],
    }));

    setSaveMessage("");
    setErrorMessage("");
  };

  const handleSaveSettings = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!formData.storeName.trim()) {
      alert("Store name enter pannu da");
      return;
    }

    if (
      formData.email &&
      !formData.email.includes("@")
    ) {
      alert(
        "Correct email address enter pannu da"
      );
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("website_settings")
      .upsert(
        {
          id: "main",

          store_name:
            formData.storeName.trim(),

          tagline:
            formData.tagline.trim(),

          phone_number:
            formData.phoneNumber.trim(),

          whatsapp_number:
            formData.whatsappNumber.trim(),

          email:
            formData.email.trim(),

          address:
            formData.address.trim(),

          instagram_url:
            formData.instagramUrl.trim(),

          facebook_url:
            formData.facebookUrl.trim(),

          youtube_url:
            formData.youtubeUrl.trim(),

          shipping_charge:
            Number(
              formData.shippingCharge
            ) || 0,

          free_shipping_above:
            Number(
              formData.freeShippingAbove
            ) || 0,

          cod_enabled:
            formData.codEnabled,

          currency:
            formData.currency,

          timezone:
            formData.timezone,

          maintenance_mode:
            formData.maintenanceMode,
        },
        {
          onConflict: "id",
        }
      );

    if (error) {
      console.error(
        "Settings save error:",
        error
      );

      setErrorMessage(
        `Settings save aagala: ${error.message}`
      );

      setIsSaving(false);
      return;
    }

    setIsSaving(false);

    setSaveMessage(
      "Settings successfully saved."
    );

    window.setTimeout(() => {
      setSaveMessage("");
    }, 3500);
  };

  if (isLoading) {
    return (
      <div className="settings-loading">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <div>
          <p className="settings-eyebrow">
            Website Management
          </p>

          <h1>Settings</h1>

          <p className="settings-header-description">
            Manage your store information,
            contact details, shipping and
            website preferences.
          </p>
        </div>

        <button
          type="submit"
          form="settings-form"
          className="settings-main-save-button"
          disabled={isSaving}
        >
          <FiSave />

          <span>
            {isSaving
              ? "Saving..."
              : "Save Settings"}
          </span>
        </button>
      </div>

      {saveMessage && (
        <div className="settings-success-message">
          <FiCheckCircle />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="settings-error-message">
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        id="settings-form"
        className="settings-form"
        onSubmit={handleSaveSettings}
      >
        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon">
              <FiShoppingBag />
            </div>

            <div>
              <h2>Store Information</h2>

              <p>
                Basic information displayed
                across the website.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="storeName">
                Store Name
                <span>*</span>
              </label>

              <input
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                placeholder="VV Sarees"
              />
            </div>

            <div className="settings-field">
              <label htmlFor="tagline">
                Store Tagline
              </label>

              <input
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="Voice of Vanigan Sarees"
              />
            </div>

            <div className="settings-field">
              <label htmlFor="logoUrl">
                Logo Image URL
              </label>

              <input
                id="logoUrl"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>

            <div className="settings-field">
              <label htmlFor="faviconUrl">
                Favicon Image URL
              </label>

              <input
                id="faviconUrl"
                name="faviconUrl"
                value={formData.faviconUrl}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>
          </div>

          {(formData.logoUrl ||
            formData.faviconUrl) && (
            <div className="settings-image-preview-grid">
              {formData.logoUrl && (
                <div className="settings-image-preview">
                  <div className="settings-preview-label">
                    <FiImage />
                    <span>
                      Logo Preview
                    </span>
                  </div>

                  <div className="settings-logo-preview-box">
                    <img
                      src={
                        formData.logoUrl
                      }
                      alt="Store logo preview"
                    />
                  </div>
                </div>
              )}

              {formData.faviconUrl && (
                <div className="settings-image-preview">
                  <div className="settings-preview-label">
                    <FiImage />
                    <span>
                      Favicon Preview
                    </span>
                  </div>

                  <div className="settings-favicon-preview-box">
                    <img
                      src={
                        formData.faviconUrl
                      }
                      alt="Store favicon preview"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon">
              <FiMapPin />
            </div>

            <div>
              <h2>
                Contact Information
              </h2>

              <p>
                Details customers can use
                to contact the business.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="phoneNumber">
                Phone Number
              </label>

              <input
                id="phoneNumber"
                name="phoneNumber"
                value={
                  formData.phoneNumber
                }
                onChange={
                  handleInputChange
                }
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="settings-field">
              <label htmlFor="whatsappNumber">
                WhatsApp Number
              </label>

              <input
                id="whatsappNumber"
                name="whatsappNumber"
                value={
                  formData.whatsappNumber
                }
                onChange={
                  handleInputChange
                }
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="settings-field full-width">
              <label htmlFor="email">
                Business Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={
                  handleInputChange
                }
                placeholder="support@vvsarees.com"
              />
            </div>

            <div className="settings-field full-width">
              <label htmlFor="address">
                Business Address
              </label>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={
                  handleInputChange
                }
                placeholder="Enter complete business address"
                rows={4}
              />
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon">
              <FiGlobe />
            </div>

            <div>
              <h2>Social Media</h2>

              <p>
                Add social media profile
                links displayed in the
                footer.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="instagramUrl">
                Instagram URL
              </label>

              <input
                id="instagramUrl"
                name="instagramUrl"
                value={
                  formData.instagramUrl
                }
                onChange={
                  handleInputChange
                }
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="settings-field">
              <label htmlFor="facebookUrl">
                Facebook URL
              </label>

              <input
                id="facebookUrl"
                name="facebookUrl"
                value={
                  formData.facebookUrl
                }
                onChange={
                  handleInputChange
                }
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="settings-field full-width">
              <label htmlFor="youtubeUrl">
                YouTube URL
              </label>

              <input
                id="youtubeUrl"
                name="youtubeUrl"
                value={
                  formData.youtubeUrl
                }
                onChange={
                  handleInputChange
                }
                placeholder="https://youtube.com/@..."
              />
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon">
              <FiTruck />
            </div>

            <div>
              <h2>
                Shipping Settings
              </h2>

              <p>
                Configure shipping charges
                and payment availability.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="shippingCharge">
                Standard Shipping Charge
              </label>

              <div className="settings-price-input">
                <span>₹</span>

                <input
                  id="shippingCharge"
                  type="number"
                  min="0"
                  name="shippingCharge"
                  value={
                    formData.shippingCharge
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="80"
                />
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="freeShippingAbove">
                Free Shipping Above
              </label>

              <div className="settings-price-input">
                <span>₹</span>

                <input
                  id="freeShippingAbove"
                  type="number"
                  min="0"
                  name="freeShippingAbove"
                  value={
                    formData.freeShippingAbove
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="999"
                />
              </div>
            </div>
          </div>

          <div className="settings-toggle-row">
            <div>
              <strong>
                Cash on Delivery
              </strong>

              <span>
                Allow customers to place
                COD orders.
              </span>
            </div>

            <button
              type="button"
              className={[
                "settings-toggle",
                formData.codEnabled
                  ? "settings-toggle-enabled"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                handleToggleChange(
                  "codEnabled"
                )
              }
              aria-pressed={
                formData.codEnabled
              }
            >
              <span />
            </button>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon">
              <FiSettings />
            </div>

            <div>
              <h2>
                Business & Website
              </h2>

              <p>
                Configure taxation and
                general website preferences.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="gstNumber">
                GST Number
              </label>

              <input
                id="gstNumber"
                name="gstNumber"
                value={
                  formData.gstNumber
                }
                onChange={
                  handleInputChange
                }
                placeholder="Enter GST number"
              />
            </div>

            <div className="settings-field">
              <label htmlFor="panNumber">
                PAN Number
              </label>

              <input
                id="panNumber"
                name="panNumber"
                value={
                  formData.panNumber
                }
                onChange={
                  handleInputChange
                }
                placeholder="Enter PAN number"
              />
            </div>

            <div className="settings-field">
              <label htmlFor="currency">
                Currency
              </label>

              <select
                id="currency"
                name="currency"
                value={
                  formData.currency
                }
                onChange={
                  handleInputChange
                }
              >
                <option value="INR">
                  INR — Indian Rupee
                </option>
              </select>
            </div>

            <div className="settings-field">
              <label htmlFor="timezone">
                Time Zone
              </label>

              <select
                id="timezone"
                name="timezone"
                value={
                  formData.timezone
                }
                onChange={
                  handleInputChange
                }
              >
                <option value="Asia/Kolkata">
                  Asia/Kolkata
                </option>
              </select>
            </div>
          </div>

          <div className="settings-toggle-row settings-maintenance-row">
            <div>
              <strong>
                Maintenance Mode
              </strong>

              <span>
                Temporarily hide the public
                website from customers.
              </span>
            </div>

            <button
              type="button"
              className={[
                "settings-toggle",
                formData.maintenanceMode
                  ? "settings-toggle-enabled"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                handleToggleChange(
                  "maintenanceMode"
                )
              }
              aria-pressed={
                formData.maintenanceMode
              }
            >
              <span />
            </button>
          </div>
        </section>

        <div className="settings-bottom-actions">
          <p>
            Save changes to update your
            website configuration.
          </p>

          <button
            type="submit"
            className="settings-bottom-save-button"
            disabled={isSaving}
          >
            <FiSave />

            <span>
              {isSaving
                ? "Saving..."
                : "Save Settings"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}