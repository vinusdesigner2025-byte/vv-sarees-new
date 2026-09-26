import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  FiCheckCircle,
  FiGlobe,
  FiMapPin,
  FiSave,
  FiSearch,
  FiTruck,
} from "react-icons/fi";

import {
  adminSupabase as supabase,
} from "../../lib/adminSupabase";

import "../css/ShippingDetails.css";

/* =========================================
   TYPES
========================================= */

type ShippingSection =
  | "tamilNadu"
  | "india"
  | "international";

type ShippingRateMap =
  Record<
    string,
    number | null
  >;

type ShippingRates = {
  tamilNadu:
    ShippingRateMap;

  india:
    ShippingRateMap;

  international:
    ShippingRateMap;
};

/* =========================================
   TAMIL NADU - 38 DISTRICTS
========================================= */

const TAMIL_NADU_DISTRICTS = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanniyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
] as const;

/* =========================================
   INDIA - OTHER STATES + UTs

   Tamil Nadu is handled district-wise above.
========================================= */

const INDIA_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

/* =========================================
   INTERNATIONAL COUNTRIES
   India is excluded.
========================================= */

const INTERNATIONAL_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
] as const;

/* =========================================
   EMPTY RATE HELPERS
========================================= */

const buildEmptyRateMap = (
  names:
    readonly string[]
): ShippingRateMap => {
  return Object.fromEntries(
    names.map(
      (
        name
      ) => [
        name,
        null,
      ]
    )
  );
};

const EMPTY_RATES:
  ShippingRates = {
    tamilNadu:
      buildEmptyRateMap(
        TAMIL_NADU_DISTRICTS
      ),

    india:
      buildEmptyRateMap(
        INDIA_STATES_AND_UTS
      ),

    international:
      buildEmptyRateMap(
        INTERNATIONAL_COUNTRIES
      ),
  };

/* =========================================
   MERGE SAVED DATA
========================================= */

const mergeRateMap = (
  base:
    ShippingRateMap,

  saved:
    unknown
): ShippingRateMap => {
  const next = {
    ...base,
  };

  if (
    typeof saved !==
      "object" ||
    saved ===
      null ||
    Array.isArray(
      saved
    )
  ) {
    return next;
  }

  const savedMap =
    saved as Record<
      string,
      unknown
    >;

  Object.keys(
    next
  ).forEach(
    (
      name
    ) => {
      const value =
        savedMap[
          name
        ];

      if (
        value ===
          null ||
        value ===
          undefined ||
        value ===
          ""
      ) {
        next[
          name
        ] =
          null;

        return;
      }

      const amount =
        Number(
          value
        );

      next[
        name
      ] =
        Number.isFinite(
          amount
        ) &&
        amount >=
          0
          ? amount
          : null;
    }
  );

  return next;
};

const mergeShippingRates = (
  saved:
    unknown
): ShippingRates => {
  if (
    typeof saved !==
      "object" ||
    saved ===
      null ||
    Array.isArray(
      saved
    )
  ) {
    return {
      tamilNadu: {
        ...EMPTY_RATES
          .tamilNadu,
      },

      india: {
        ...EMPTY_RATES
          .india,
      },

      international: {
        ...EMPTY_RATES
          .international,
      },
    };
  }

  const savedRates =
    saved as Record<
      string,
      unknown
    >;

  return {
    tamilNadu:
      mergeRateMap(
        EMPTY_RATES
          .tamilNadu,

        savedRates
          .tamilNadu
      ),

    india:
      mergeRateMap(
        EMPTY_RATES
          .india,

        savedRates
          .india
      ),

    international:
      mergeRateMap(
        EMPTY_RATES
          .international,

        savedRates
          .international
      ),
  };
};

/* =========================================
   ERROR HELPER
========================================= */

const getErrorMessage = (
  error:
    unknown
) => {
  if (
    typeof error ===
      "object" &&
    error !==
      null &&
    "message" in
      error
  ) {
    return String(
      error.message
    );
  }

  return "Unknown error";
};

/* =========================================
   SHIPPING CARD
========================================= */

type ShippingCardProps = {
  title:
    string;

  subtitle:
    string;

  section:
    ShippingSection;

  names:
    readonly string[];

  label:
    string;

  icon:
    ReactNode;

  rates:
    ShippingRates;

  searchValue:
    string;

  onSearchChange:
    (
      value:
        string
    ) => void;

  onRateChange:
    (
      section:
        ShippingSection,

      name:
        string,

      value:
        string
    ) => void;

  onSave:
    (
      section:
        ShippingSection
    ) => Promise<void>;

  savingSection:
    ShippingSection | null;

  successSection:
    ShippingSection | null;
};

function ShippingCard({
  title,
  subtitle,
  section,
  names,
  label,
  icon,
  rates,
  searchValue,
  onSearchChange,
  onRateChange,
  onSave,
  savingSection,
  successSection,
}: ShippingCardProps) {
  const filteredNames =
    useMemo(
      () => {
        const query =
          searchValue
            .trim()
            .toLowerCase();

        if (
          !query
        ) {
          return names;
        }

        return names.filter(
          (
            name
          ) =>
            name
              .toLowerCase()
              .includes(
                query
              )
        );
      },

      [
        names,
        searchValue,
      ]
    );

  const configuredCount =
    useMemo(
      () => {
        return names.filter(
          (
            name
          ) =>
            rates[
              section
            ][
              name
            ] !==
            null
        ).length;
      },

      [
        names,
        rates,
        section,
      ]
    );

  const isSaving =
    savingSection ===
    section;

  return (
    <section className="shipping-details-card">
      <div className="shipping-details-card-header">
        <div className="shipping-details-card-title">
          <span className="shipping-details-card-icon">
            {icon}
          </span>

          <div>
            <h2>
              {title}
            </h2>

            <p>
              {subtitle}
            </p>
          </div>
        </div>

        <span className="shipping-details-count">
          {configuredCount}/
          {names.length} configured
        </span>
      </div>

      <div className="shipping-details-search">
        <FiSearch />

        <input
          type="search"
          value={
            searchValue
          }
          onChange={(
            event
          ) =>
            onSearchChange(
              event
                .target
                .value
            )
          }
          placeholder={`Search ${label.toLowerCase()}...`}
          aria-label={`Search ${label}`}
          disabled={
            isSaving
          }
        />
      </div>

      <div className="shipping-details-table">
        <div className="shipping-details-table-head">
          <span>
            {label}
          </span>

          <span>
            Shipping ₹
          </span>
        </div>

        <div className="shipping-details-table-body">
          {filteredNames.map(
            (
              name
            ) => {
              const currentValue =
                rates[
                  section
                ][
                  name
                ];

              return (
                <div
                  className="shipping-details-row"
                  key={
                    name
                  }
                >
                  <span className="shipping-details-location-name">
                    {name}
                  </span>

                  <div className="shipping-details-price-field">
                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="decimal"
                      value={
                        currentValue ===
                        null
                          ? ""
                          : currentValue
                      }
                      placeholder="Enter"
                      onChange={(
                        event
                      ) =>
                        onRateChange(
                          section,

                          name,

                          event
                            .target
                            .value
                        )
                      }
                      aria-label={`${name} shipping price`}
                      disabled={
                        isSaving
                      }
                    />
                  </div>
                </div>
              );
            }
          )}

          {filteredNames.length ===
            0 && (
            <div className="shipping-details-empty">
              No matching{" "}
              {label.toLowerCase()}{" "}
              found.
            </div>
          )}
        </div>
      </div>

      <div className="shipping-details-card-footer">
        <p>
          <strong>
            ₹0
          </strong>{" "}
          means free shipping.
          Leave blank if the
          shipping rate is not
          configured.
        </p>

        <button
          type="button"
          className="shipping-details-save-button"
          disabled={
            isSaving
          }
          onClick={() => {
            void onSave(
              section
            );
          }}
        >
          {successSection ===
          section ? (
            <FiCheckCircle />
          ) : (
            <FiSave />
          )}

          <span>
            {isSaving
              ? "Saving..."
              : successSection ===
                  section
                ? "Saved"
                : `Save ${title}`}
          </span>
        </button>
      </div>
    </section>
  );
}

/* =========================================
   SHIPPING DETAILS PAGE
========================================= */

export default function ShippingDetails() {
  const [
    rates,
    setRates,
  ] =
    useState<ShippingRates>(
      () =>
        mergeShippingRates(
          null
        )
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true
    );

  const [
    savingSection,
    setSavingSection,
  ] =
    useState<
      ShippingSection | null
    >(
      null
    );

  const [
    successSection,
    setSuccessSection,
  ] =
    useState<
      ShippingSection | null
    >(
      null
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState(
      ""
    );

  const [
    search,
    setSearch,
  ] =
    useState({
      tamilNadu:
        "",

      india:
        "",

      international:
        "",
    });

  /* =======================================
     LOAD SHIPPING RATES
  ======================================= */

  useEffect(
    () => {
      let cancelled =
        false;

      const loadShippingRates =
        async () => {
          setIsLoading(
            true
          );

          setErrorMessage(
            ""
          );

          try {
            const {
              data,
              error,
            } =
              await supabase
                .from(
                  "website_settings"
                )
                .select(
                  "shipping_rates"
                )
                .eq(
                  "id",
                  "main"
                )
                .maybeSingle();

            if (
              cancelled
            ) {
              return;
            }

            if (
              error
            ) {
              throw error;
            }

            setRates(
              mergeShippingRates(
                data
                  ?.shipping_rates
              )
            );
          } catch (
            error
          ) {
            console.error(
              "Failed to load shipping rates:",

              error
            );

            if (
              !cancelled
            ) {
              setErrorMessage(
                `Shipping rates could not be loaded: ${getErrorMessage(
                  error
                )}`
              );
            }
          } finally {
            if (
              !cancelled
            ) {
              setIsLoading(
                false
              );
            }
          }
        };

      void loadShippingRates();

      return () => {
        cancelled =
          true;
      };
    },

    []
  );

  /* =======================================
     CHANGE RATE
  ======================================= */

  const handleRateChange = (
    section:
      ShippingSection,

    name:
      string,

    value:
      string
  ) => {
    setSuccessSection(
      null
    );

    setErrorMessage(
      ""
    );

    if (
      value ===
      ""
    ) {
      setRates(
        (
          current
        ) => ({
          ...current,

          [section]: {
            ...current[
              section
            ],

            [name]:
              null,
          },
        })
      );

      return;
    }

    const amount =
      Number(
        value
      );

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <
        0
    ) {
      return;
    }

    setRates(
      (
        current
      ) => ({
        ...current,

        [section]: {
          ...current[
            section
          ],

          [name]:
            amount,
        },
      })
    );
  };

  /* =======================================
     SAVE SHIPPING RATES
  ======================================= */

  const handleSave =
    async (
      section:
        ShippingSection
    ) => {
      if (
        savingSection
      ) {
        return;
      }

      setSavingSection(
        section
      );

      setSuccessSection(
        null
      );

      setErrorMessage(
        ""
      );

      try {
        /* =================================
           VERIFY ADMIN SESSION
        ================================= */

        const {
          data: {
            user,
          },

          error:
            userError,
        } =
          await supabase
            .auth
            .getUser();

        if (
          userError ||
          !user
        ) {
          throw new Error(
            "Your administrator session has expired. Please sign in again."
          );
        }

        /* =================================
           VERIFY ADMIN PERMISSION
        ================================= */

        const {
          data:
            isAdmin,

          error:
            adminCheckError,
        } =
          await supabase
            .rpc(
              "is_admin"
            );

        if (
          adminCheckError
        ) {
          throw new Error(
            `Admin verification failed: ${adminCheckError.message}`
          );
        }

        if (
          isAdmin !==
          true
        ) {
          throw new Error(
            "You are not authorized to update shipping rates."
          );
        }

        /* =================================
           SAVE

           Important:
           .select() is used so we can
           confirm the row was really updated.
        ================================= */

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "website_settings"
            )
            .update({
              shipping_rates:
                rates,

              updated_at:
                new Date()
                  .toISOString(),
            })
            .eq(
              "id",
              "main"
            )
            .select(
              "shipping_rates"
            )
            .maybeSingle();

        if (
          error
        ) {
          throw error;
        }

        /*
         * Supabase UPDATE can sometimes
         * return no error when RLS simply
         * prevents the row from matching.
         *
         * Therefore data must exist before
         * we show "Saved".
         */

        if (
          !data
        ) {
          throw new Error(
            "Shipping rates were not saved. Please check the website_settings admin update permission."
          );
        }

        /* =================================
           USE SAVED DB VALUE

           This guarantees UI and database
           stay in sync.
        ================================= */

        setRates(
          mergeShippingRates(
            data
              .shipping_rates
          )
        );

        setSuccessSection(
          section
        );

        window.setTimeout(
          () => {
            setSuccessSection(
              (
                current
              ) =>
                current ===
                section
                  ? null
                  : current
            );
          },

          2500
        );
      } catch (
        error
      ) {
        console.error(
          "Failed to save shipping rates:",

          error
        );

        setErrorMessage(
          `Shipping rates could not be saved: ${getErrorMessage(
            error
          )}`
        );
      } finally {
        setSavingSection(
          null
        );
      }
    };

  /* =======================================
     LOADING
  ======================================= */

  if (
    isLoading
  ) {
    return (
      <div className="shipping-details-loading">
        <FiTruck />

        <span>
          Loading shipping
          details...
        </span>
      </div>
    );
  }

  /* =======================================
     PAGE
  ======================================= */

  return (
    <div className="shipping-details-page">
      <div className="shipping-details-page-header">
        <div>
          <p className="shipping-details-eyebrow">
            Delivery Management
          </p>

          <h1>
            Shipping Details
          </h1>

          <p className="shipping-details-description">
            Set shipping prices
            by Tamil Nadu
            district, Indian
            state or union
            territory, and
            international
            country.
          </p>
        </div>

        <div className="shipping-details-header-note">
          <FiTruck />

          <span>
            These rates will
            be used at
            checkout.
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="shipping-details-error">
          {errorMessage}
        </div>
      )}

      <div className="shipping-details-grid">
        {/* =================================
            TAMIL NADU
        ================================= */}

        <ShippingCard
          title="Tamil Nadu"
          subtitle="Set a delivery charge for all 38 districts."
          section="tamilNadu"
          names={
            TAMIL_NADU_DISTRICTS
          }
          label="District"
          icon={
            <FiMapPin />
          }
          rates={
            rates
          }
          searchValue={
            search
              .tamilNadu
          }
          onSearchChange={(
            value
          ) =>
            setSearch(
              (
                current
              ) => ({
                ...current,

                tamilNadu:
                  value,
              })
            )
          }
          onRateChange={
            handleRateChange
          }
          onSave={
            handleSave
          }
          savingSection={
            savingSection
          }
          successSection={
            successSection
          }
        />

        {/* =================================
            INDIA
        ================================= */}

        <ShippingCard
          title="India"
          subtitle="Set rates for all other Indian states and union territories."
          section="india"
          names={
            INDIA_STATES_AND_UTS
          }
          label="State / UT"
          icon={
            <FiTruck />
          }
          rates={
            rates
          }
          searchValue={
            search
              .india
          }
          onSearchChange={(
            value
          ) =>
            setSearch(
              (
                current
              ) => ({
                ...current,

                india:
                  value,
              })
            )
          }
          onRateChange={
            handleRateChange
          }
          onSave={
            handleSave
          }
          savingSection={
            savingSection
          }
          successSection={
            successSection
          }
        />

        {/* =================================
            INTERNATIONAL
        ================================= */}

        <ShippingCard
          title="International"
          subtitle="Set country-wise international shipping prices."
          section="international"
          names={
            INTERNATIONAL_COUNTRIES
          }
          label="Country"
          icon={
            <FiGlobe />
          }
          rates={
            rates
          }
          searchValue={
            search
              .international
          }
          onSearchChange={(
            value
          ) =>
            setSearch(
              (
                current
              ) => ({
                ...current,

                international:
                  value,
              })
            )
          }
          onRateChange={
            handleRateChange
          }
          onSave={
            handleSave
          }
          savingSection={
            savingSection
          }
          successSection={
            successSection
          }
        />
      </div>
    </div>
  );
}