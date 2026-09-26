import { useEffect, useMemo, useState } from "react";

import type { FormEvent } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiMapPin,
  FiPackage,
  FiShield,
  FiTruck,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";

import "./CheckoutPage.css";

type CheckoutPageProps = {
  mode: "wholesale" | "retail";
};

type PaymentMethod =
  | "razorpay"
  | "cod";

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;

    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  prefill: {
    name: string;
    email: string;
    contact: string;
  };

  notes: {
    vv_order_id: string;
    vv_order_number: string;
    order_type: string;
  };

  handler: (
    response: RazorpaySuccessResponse
  ) => void | Promise<void>;

  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;

  on: (
    event: "payment.failed",
    callback: (
      response: RazorpayFailureResponse
    ) => void
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

type RazorpayOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
  app_order_id: string;
  order_number: string;
};

type RazorpayVerifyResponse = {
  verified: boolean;
  app_order_id?: string;
  order_number?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  error?: string;
};

type CheckoutCreateResponse = {
  success: boolean;

  order?: {
    id: string;
    orderNumber: string;

    orderType:
      | "wholesale"
      | "retail";

    customerName: string;

    totalQuantity: number;

    subtotal: number;

    shippingCharge: number;

    grandTotal: number;

    paymentMethod: PaymentMethod;

    paymentStatus: string;

    orderStatus: string;
  };

  error?: string;
};

const PAYMENT_METHODS = {
  razorpay: true,
  cod: false,
};

/* =========================================
   SHIPPING TYPES
========================================= */

type ShippingMode =
  | "free"
  | "manual";

type ShippingRule = {
  type?: ShippingMode;

  amount?:
    | number
    | string
    | null;
};

type ShippingDetails = {
  tamilNadu?: ShippingRule;

  withinIndia?:
    ShippingRule & {
      freeLocations?: string[];
    };

  international?: ShippingRule;
};

type ShippingProductRow = {
  slug: string;

  shipping_details:
    | ShippingDetails
    | null;
};

/* =========================================
   MASTER SHIPPING RATES
========================================= */

type ShippingRateMap =
  Record<
    string,
    unknown
  >;

type MasterShippingRates = {
  tamilNadu:
    ShippingRateMap;

  india:
    ShippingRateMap;

  international:
    ShippingRateMap;
};

const EMPTY_MASTER_RATES:
  MasterShippingRates = {
    tamilNadu: {},
    india: {},
    international: {},
  };

/* =========================================
   TAMIL NADU DISTRICTS
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
   INDIA STATES + UNION TERRITORIES
========================================= */

const INDIA_STATES = [
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
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

/* =========================================
   COUNTRIES
========================================= */

const COUNTRIES = [
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
  "India",
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
   LOCATION NORMALIZER
========================================= */

const normalizeLocation = (
  value: unknown
) => {
  const normalized =
    String(
      value ?? ""
    )
      .trim()
      .toLowerCase()
      .replace(
        /&/g,
        "and"
      )
      .replace(
        /[^a-z0-9]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (
    normalized ===
      "bangalore" ||
    normalized ===
      "bengaluru" ||
    normalized ===
      "bangaluru"
  ) {
    return "bengaluru";
  }

  if (
    normalized ===
      "pondicherry" ||
    normalized ===
      "puducherry"
  ) {
    return "puducherry";
  }

  if (
    normalized ===
      "tamilnadu" ||
    normalized ===
      "tamil nadu"
  ) {
    return "tamil nadu";
  }

  return normalized;
};

const isIndiaCountry = (
  value: unknown
) => {
  const normalized =
    normalizeLocation(
      value
    );

  return (
    normalized ===
      "" ||
    normalized ===
      "india" ||
    normalized ===
      "in"
  );
};

/* =========================================
   SPECIAL FREE LOCATION LOGIC
========================================= */

const isFreeIndiaLocation = (
  details:
    | ShippingDetails
    | null
    | undefined,

  city: string,
  state: string
) => {
  const freeLocations =
    details
      ?.withinIndia
      ?.freeLocations;

  if (
    !Array.isArray(
      freeLocations
    ) ||
    freeLocations.length ===
      0
  ) {
    return false;
  }

  const normalizedCity =
    normalizeLocation(
      city
    );

  const normalizedState =
    normalizeLocation(
      state
    );

  return freeLocations.some(
    (location) => {
      const normalizedLocation =
        normalizeLocation(
          location
        );

      return (
        normalizedLocation !==
          "" &&
        (
          normalizedLocation ===
            normalizedCity ||
          normalizedLocation ===
            normalizedState
        )
      );
    }
  );
};

/* =========================================
   MASTER SHIPPING HELPERS
========================================= */

const normalizeMasterRates = (
  value: unknown
): MasterShippingRates => {
  if (
    typeof value !==
      "object" ||
    value === null ||
    Array.isArray(
      value
    )
  ) {
    return {
      ...EMPTY_MASTER_RATES,
    };
  }

  const row =
    value as Record<
      string,
      unknown
    >;

  const getMap = (
    mapValue: unknown
  ): ShippingRateMap => {
    if (
      typeof mapValue !==
        "object" ||
      mapValue === null ||
      Array.isArray(
        mapValue
      )
    ) {
      return {};
    }

    return mapValue as ShippingRateMap;
  };

  return {
    tamilNadu:
      getMap(
        row.tamilNadu
      ),

    india:
      getMap(
        row.india
      ),

    international:
      getMap(
        row.international
      ),
  };
};

const getConfiguredAmount = (
  value: unknown
):
  | number
  | null => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value ===
    "string"
  ) {
    if (
      !value.trim()
    ) {
      return null;
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
      return null;
    }

    return (
      Math.round(
        amount *
          100
      ) /
      100
    );
  }

  if (
    typeof value ===
    "number"
  ) {
    if (
      !Number.isFinite(
        value
      ) ||
      value <
        0
    ) {
      return null;
    }

    return (
      Math.round(
        value *
          100
      ) /
      100
    );
  }

  return null;
};

const findConfiguredRate = (
  map:
    ShippingRateMap,

  location:
    string
):
  | number
  | null => {
  if (
    !location
  ) {
    return null;
  }

  if (
    Object.prototype
      .hasOwnProperty
      .call(
        map,
        location
      )
  ) {
    return getConfiguredAmount(
      map[
        location
      ]
    );
  }

  const wanted =
    normalizeLocation(
      location
    );

  const matchingEntry =
    Object.entries(
      map
    ).find(
      (
        [
          key,
        ]
      ) =>
        normalizeLocation(
          key
        ) ===
        wanted
    );

  if (
    !matchingEntry
  ) {
    return null;
  }

  return getConfiguredAmount(
    matchingEntry[
      1
    ]
  );
};

const getMasterShippingRate = ({
  rates,
  country,
  state,
  district,
}: {
  rates:
    MasterShippingRates;

  country:
    string;

  state:
    string;

  district:
    string;
}):
  | number
  | null => {
  if (
    !isIndiaCountry(
      country
    )
  ) {
    return findConfiguredRate(
      rates
        .international,

      country
    );
  }

  if (
    normalizeLocation(
      state
    ) ===
    "tamil nadu"
  ) {
    return findConfiguredRate(
      rates
        .tamilNadu,

      district
    );
  }

  return findConfiguredRate(
    rates.india,

    state
  );
};

/* =========================================
   PRODUCT SHIPPING RULE

   FREE:
   no shipping charge.

   MANUAL:
   use master Shipping Details rate.

   Puducherry / Bangalore:
   special free location logic is preserved.
========================================= */

const productNeedsManualRate = ({
  details,
  city,
  state,
  country,
}: {
  details:
    | ShippingDetails
    | null
    | undefined;

  city: string;
  state: string;
  country: string;
}) => {
  if (
    !details
  ) {
    return false;
  }

  if (
    !isIndiaCountry(
      country
    )
  ) {
    return (
      details
        .international
        ?.type ===
      "manual"
    );
  }

  const normalizedState =
    normalizeLocation(
      state
    );

  if (
    normalizedState ===
    "tamil nadu"
  ) {
    return (
      details
        .tamilNadu
        ?.type ===
      "manual"
    );
  }

  if (
    isFreeIndiaLocation(
      details,
      city,
      state
    )
  ) {
    return false;
  }

  return (
    details
      .withinIndia
      ?.type ===
    "manual"
  );
};

/* =========================================
   RAZORPAY
========================================= */

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript =
  () => {
    return new Promise<boolean>(
      (resolve) => {
        if (
          window.Razorpay
        ) {
          resolve(
            true
          );

          return;
        }

        const existingScript =
          document.querySelector<HTMLScriptElement>(
            `script[src="${RAZORPAY_SCRIPT_URL}"]`
          );

        if (
          existingScript
        ) {
          existingScript.addEventListener(
            "load",

            () =>
              resolve(
                true
              ),

            {
              once:
                true,
            }
          );

          existingScript.addEventListener(
            "error",

            () =>
              resolve(
                false
              ),

            {
              once:
                true,
            }
          );

          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          RAZORPAY_SCRIPT_URL;

        script.async =
          true;

        script.onload =
          () =>
            resolve(
              true
            );

        script.onerror =
          () =>
            resolve(
              false
            );

        document.body.appendChild(
          script
        );
      }
    );
  };

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

  return "Something went wrong. Please try again.";
};

/* =========================================
   CHECKOUT
========================================= */

export default function CheckoutPage({
  mode,
}: CheckoutPageProps) {
  const navigate =
    useNavigate();

  const isWholesale =
    mode ===
    "wholesale";

  const {
    retailCart,
    wholesaleCart,
  } =
    useShop();

  const cartItems =
    isWholesale
      ? wholesaleCart
      : retailCart;

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "razorpay"
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false
    );

  const [
    submitError,
    setSubmitError,
  ] =
    useState(
      ""
    );

  const [
    shippingDetailsBySlug,
    setShippingDetailsBySlug,
  ] =
    useState<
      Record<
        string,
        ShippingDetails | null
      >
    >(
      {}
    );

  const [
    masterShippingRates,
    setMasterShippingRates,
  ] =
    useState<MasterShippingRates>(
      EMPTY_MASTER_RATES
    );

  const [
    isLoadingShipping,
    setIsLoadingShipping,
  ] =
    useState(
      false
    );

  const [
    shippingPreviewError,
    setShippingPreviewError,
  ] =
    useState(
      ""
    );

  const [
    formData,
    setFormData,
  ] =
    useState({
      fullName:
        "",

      phone:
        "",

      email:
        "",

      addressLine1:
        "",

      addressLine2:
        "",

      country:
        "India",

      state:
        "Tamil Nadu",

      district:
        "",

      city:
        "",

      pincode:
        "",

      deliveryNote:
        "",
    });

  /* =========================================
     LOAD SHIPPING RULES
  ========================================= */

  useEffect(
    () => {
      let cancelled =
        false;

      const productSlugs =
        [
          ...new Set(
            cartItems
              .map(
                (
                  item
                ) =>
                  String(
                    item.slug ??
                      ""
                  ).trim()
              )
              .filter(
                Boolean
              )
          ),
        ];

      if (
        productSlugs.length ===
        0
      ) {
        setShippingDetailsBySlug(
          {}
        );

        setMasterShippingRates(
          EMPTY_MASTER_RATES
        );

        setShippingPreviewError(
          ""
        );

        setIsLoadingShipping(
          false
        );

        return () => {
          cancelled =
            true;
        };
      }

      const loadShipping =
        async () => {
          setIsLoadingShipping(
            true
          );

          setShippingPreviewError(
            ""
          );

          const [
            productResult,
            settingsResult,
          ] =
            await Promise.all(
              [
                supabase
                  .from(
                    "products"
                  )
                  .select(
                    "slug, shipping_details"
                  )
                  .eq(
                    "status",
                    "active"
                  )
                  .in(
                    "slug",
                    productSlugs
                  ),

                supabase
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
                  .maybeSingle(),
              ]
            );

          if (
            cancelled
          ) {
            return;
          }

          if (
            productResult.error
          ) {
            console.error(
              "Product shipping rules load error:",

              productResult.error
            );

            setShippingDetailsBySlug(
              {}
            );

            setShippingPreviewError(
              "Shipping preview could not be loaded. The secure checkout will calculate the final shipping charge."
            );
          } else {
            const rows =
              (
                productResult.data ??
                []
              ) as ShippingProductRow[];

            const nextMap:
              Record<
                string,
                ShippingDetails | null
              > = {};

            rows.forEach(
              (
                row
              ) => {
                nextMap[
                  String(
                    row.slug
                  )
                ] =
                  row.shipping_details ??
                  null;
              }
            );

            setShippingDetailsBySlug(
              nextMap
            );
          }

          if (
            settingsResult.error
          ) {
            console.error(
              "Master shipping rates load error:",

              settingsResult.error
            );

            setMasterShippingRates(
              EMPTY_MASTER_RATES
            );

            setShippingPreviewError(
              "Shipping rates could not be loaded. The secure checkout will calculate the final shipping charge."
            );
          } else {
            setMasterShippingRates(
              normalizeMasterRates(
                settingsResult
                  .data
                  ?.shipping_rates
              )
            );
          }

          setIsLoadingShipping(
            false
          );
        };

      void loadShipping();

      return () => {
        cancelled =
          true;
      };
    },

    [
      cartItems,
    ]
  );

  /* =========================================
     TOTALS
  ========================================= */

  const totalQuantity =
    useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.quantity
            ),

          0
        ),

      [
        cartItems,
      ]
    );

  const subtotal =
    useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.price
            ) *
              Number(
                item.quantity
              ),

          0
        ),

      [
        cartItems,
      ]
    );

  /* =========================================
     SHIPPING

     IMPORTANT:
     Master shipping is charged ONCE per order.
  ========================================= */

  const shippingCalculation =
    useMemo(
      () => {
        let hasManualProduct =
          false;

        for (
          const item of
          cartItems
        ) {
          const slug =
            String(
              item.slug ??
                ""
            ).trim();

          const details =
            shippingDetailsBySlug[
              slug
            ];

          const needsManualRate =
            productNeedsManualRate(
              {
                details,

                city:
                  formData.city,

                state:
                  formData.state,

                country:
                  formData.country,
              }
            );

          if (
            needsManualRate
          ) {
            hasManualProduct =
              true;

            break;
          }
        }

        if (
          !hasManualProduct
        ) {
          return {
            charge:
              0,

            hasManualProduct:
              false,

            isConfigured:
              true,
          };
        }

        const destinationRate =
          getMasterShippingRate(
            {
              rates:
                masterShippingRates,

              country:
                formData.country,

              state:
                formData.state,

              district:
                formData.district,
            }
          );

        if (
          destinationRate ===
          null
        ) {
          return {
            charge:
              0,

            hasManualProduct:
              true,

            isConfigured:
              false,
          };
        }

        return {
          charge:
            Math.round(
              destinationRate *
                100
            ) /
            100,

          hasManualProduct:
            true,

          isConfigured:
            true,
        };
      },

      [
        cartItems,
        shippingDetailsBySlug,
        masterShippingRates,
        formData.city,
        formData.state,
        formData.country,
        formData.district,
      ]
    );

  const shippingCharge =
    shippingCalculation
      .charge;

  const shippingDisplay =
    useMemo(
      () => {
        if (
          isLoadingShipping
        ) {
          return "Calculating...";
        }

        if (
          shippingPreviewError
        ) {
          return "At checkout";
        }

        if (
          shippingCalculation
            .hasManualProduct &&
          !shippingCalculation
            .isConfigured
        ) {
          if (
            formData.country ===
              "India" &&
            formData.state ===
              "Tamil Nadu" &&
            !formData.district
          ) {
            return "Select district";
          }

          return "Not configured";
        }

        if (
          shippingCharge ===
          0
        ) {
          return "Free";
        }

        return `₹${shippingCharge}`;
      },

      [
        isLoadingShipping,
        shippingPreviewError,
        shippingCalculation,
        shippingCharge,
        formData.country,
        formData.state,
        formData.district,
      ]
    );

  const grandTotal =
    Math.round(
      (
        subtotal +
        shippingCharge
      ) *
        100
    ) /
    100;

  /* =========================================
     CONDITIONS
  ========================================= */

  const minimumQuantity =
    isWholesale
      ? 5
      : 1;

  const minimumReached =
    totalQuantity >=
    minimumQuantity;

  const hasOutOfStockItem =
    cartItems.some(
      (
        item
      ) =>
        item.stock <=
          0 ||
        item.quantity >
          item.stock
    );

  const shippingReady =
    Boolean(
      shippingPreviewError
    ) ||
    !shippingCalculation
      .hasManualProduct ||
    shippingCalculation
      .isConfigured;

  const canPlaceOrder =
    cartItems.length >
      0 &&
    minimumReached &&
    !hasOutOfStockItem &&
    !isSubmitting &&
    !isLoadingShipping &&
    shippingReady;

  /* =========================================
     UPDATE FORM
  ========================================= */

  const updateField = (
    field:
      keyof typeof formData,

    value:
      string
  ) => {
    if (
      field ===
      "country"
    ) {
      setFormData(
        (
          current
        ) => ({
          ...current,

          country:
            value,

          state:
            value ===
            "India"
              ? "Tamil Nadu"
              : "",

          district:
            "",

          pincode:
            "",
        })
      );

      return;
    }

    if (
      field ===
      "state"
    ) {
      setFormData(
        (
          current
        ) => ({
          ...current,

          state:
            value,

          district:
            value ===
            "Tamil Nadu"
              ? current.district
              : "",
        })
      );

      return;
    }

    setFormData(
      (
        current
      ) => ({
        ...current,

        [field]:
          value,
      })
    );
  };

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm =
    () => {
      if (
        !formData
          .fullName
          .trim()
      ) {
        alert(
          "Please enter your full name."
        );

        return false;
      }

      const cleanedPhone =
        formData.phone
          .replace(
            /\D/g,
            ""
          );

      if (
        formData.country ===
        "India"
      ) {
        if (
          !/^[0-9]{10}$/.test(
            cleanedPhone
          )
        ) {
          alert(
            "Please enter a valid 10-digit mobile number."
          );

          return false;
        }
      } else if (
        !/^[0-9]{7,15}$/.test(
          cleanedPhone
        )
      ) {
        alert(
          "Please enter a valid phone number."
        );

        return false;
      }

      if (
        !formData
          .email
          .trim()
      ) {
        alert(
          "Please enter your email address."
        );

        return false;
      }

      if (
        !formData
          .addressLine1
          .trim()
      ) {
        alert(
          "Please enter your delivery address."
        );

        return false;
      }

      if (
        !formData.country
      ) {
        alert(
          "Please select your country."
        );

        return false;
      }

      if (
        formData.country ===
          "India" &&
        !formData.state
      ) {
        alert(
          "Please select your state."
        );

        return false;
      }

      if (
        formData.country ===
          "India" &&
        formData.state ===
          "Tamil Nadu" &&
        !formData.district
      ) {
        alert(
          "Please select your district."
        );

        return false;
      }

      if (
        !formData
          .city
          .trim()
      ) {
        alert(
          "Please enter your city."
        );

        return false;
      }

      if (
        formData.country ===
        "India"
      ) {
        if (
          !/^[0-9]{6}$/.test(
            formData
              .pincode
              .trim()
          )
        ) {
          alert(
            "Please enter a valid 6-digit pincode."
          );

          return false;
        }
      } else if (
        !formData
          .pincode
          .trim()
      ) {
        alert(
          "Please enter your postal code."
        );

        return false;
      }

      if (
        cartItems.length ===
        0
      ) {
        alert(
          "Your cart is empty."
        );

        return false;
      }

      if (
        !minimumReached
      ) {
        alert(
          isWholesale
            ? "Wholesale orders require a minimum of 5 sarees."
            : "Please add at least one product to your cart."
        );

        return false;
      }

      if (
        hasOutOfStockItem
      ) {
        alert(
          "Please remove unavailable items or adjust their quantities before checkout."
        );

        return false;
      }

      if (
        shippingCalculation
          .hasManualProduct &&
        !shippingCalculation
          .isConfigured &&
        !shippingPreviewError
      ) {
        alert(
          "Shipping is not configured for this delivery location. Please contact us before placing the order."
        );

        return false;
      }

      return true;
    };

  /* =========================================
     SUBMIT ORDER
  ========================================= */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        !validateForm() ||
        isSubmitting
      ) {
        return;
      }

      setIsSubmitting(
        true
      );

      setSubmitError(
        ""
      );

      let createdOrderId:
        | string
        | null =
        null;

      let createdOrderNumber =
        "";

      let createdGrandTotal =
        0;

      let createdTotalQuantity =
        0;

      let gatewaySuccessReceived =
        false;

      try {
        if (
          paymentMethod ===
          "razorpay"
        ) {
          const razorpayKeyId =
            import.meta.env
              .VITE_RAZORPAY_KEY_ID;

          if (
            !razorpayKeyId
          ) {
            throw new Error(
              "Payment configuration is unavailable. Please try again later."
            );
          }

          const scriptLoaded =
            await loadRazorpayScript();

          if (
            !scriptLoaded
          ) {
            throw new Error(
              "We could not load the secure payment window. Please check your internet connection and try again."
            );
          }
        }

        const {
          data:
            checkoutData,

          error:
            checkoutError,
        } =
          await supabase
            .functions
            .invoke(
              "create-checkout-order",

              {
                body: {
                  orderType:
                    mode,

                  customerName:
                    formData
                      .fullName
                      .trim(),

                  phone:
                    formData
                      .phone
                      .replace(
                        /\D/g,
                        ""
                      ),

                  email:
                    formData
                      .email
                      .trim(),

                  addressLine1:
                    formData
                      .addressLine1
                      .trim(),

                  addressLine2:
                    formData
                      .addressLine2
                      .trim(),

                  country:
                    formData.country,

                  state:
                    formData.state,

                  district:
                    formData.district,

                  city:
                    formData
                      .city
                      .trim(),

                  pincode:
                    formData
                      .pincode
                      .trim(),

                  deliveryNote:
                    formData
                      .deliveryNote
                      .trim(),

                  paymentMethod,

                  items:
                    cartItems.map(
                      (
                        item
                      ) => ({
                        productId:
                          String(
                            item.id
                          ),

                        slug:
                          item.slug,

                        quantity:
                          Number(
                            item.quantity
                          ),

                        colour:
                          item.colour ??
                          "",

                        imageUrl:
                          item.image ??
                          "",
                      })
                    ),
                },
              }
            );

        if (
          checkoutError
        ) {
          throw checkoutError;
        }

        const checkout =
          checkoutData as
            | CheckoutCreateResponse
            | null;

        if (
          !checkout
            ?.success ||
          !checkout
            .order
            ?.id ||
          !checkout
            .order
            .orderNumber
        ) {
          throw new Error(
            checkout?.error ??
              "We could not create your order. Please try again."
          );
        }

        const secureOrder =
          checkout.order;

        const createdOrder =
          {
            id:
              secureOrder.id,

            order_number:
              secureOrder
                .orderNumber,
          };

        createdOrderId =
          createdOrder.id;

        createdOrderNumber =
          createdOrder
            .order_number;

        createdGrandTotal =
          Number(
            secureOrder
              .grandTotal ??
              0
          );

        createdTotalQuantity =
          Number(
            secureOrder
              .totalQuantity ??
              0
          );

        /* =========================================
           RAZORPAY
        ========================================= */

        if (
          paymentMethod ===
          "razorpay"
        ) {
          const {
            data:
              razorpayOrderData,

            error:
              razorpayOrderError,
          } =
            await supabase
              .functions
              .invoke(
                "razorpay-create-order",

                {
                  body: {
                    orderId:
                      createdOrder.id,
                  },
                }
              );

          if (
            razorpayOrderError
          ) {
            throw razorpayOrderError;
          }

          const razorpayOrder =
            razorpayOrderData as
              | RazorpayOrderResponse
              | null;

          if (
            !razorpayOrder
              ?.order_id ||
            !razorpayOrder
              .amount ||
            !razorpayOrder
              .currency
          ) {
            throw new Error(
              "We could not initialize your payment. Please try again."
            );
          }

          const razorpayKeyId =
            import.meta.env
              .VITE_RAZORPAY_KEY_ID;

          const RazorpayConstructor =
            window.Razorpay;

          if (
            !razorpayKeyId ||
            !RazorpayConstructor
          ) {
            throw new Error(
              "The secure payment window is not ready. Please refresh the page and try again."
            );
          }

          await new Promise<void>(
            (
              resolve,
              reject
            ) => {
              let paymentFlowSettled =
                false;

              const finishWithError =
                (
                  error:
                    Error
                ) => {
                  if (
                    paymentFlowSettled
                  ) {
                    return;
                  }

                  paymentFlowSettled =
                    true;

                  reject(
                    error
                  );
                };

              const finishSuccessfully =
                () => {
                  if (
                    paymentFlowSettled
                  ) {
                    return;
                  }

                  paymentFlowSettled =
                    true;

                  resolve();
                };

              const razorpay =
                new RazorpayConstructor(
                  {
                    key:
                      razorpayKeyId,

                    amount:
                      Number(
                        razorpayOrder
                          .amount
                      ),

                    currency:
                      razorpayOrder
                        .currency,

                    name:
                      "VV Sarees",

                    description:
                      `${
                        isWholesale
                          ? "Wholesale"
                          : "Retail"
                      } Order ${
                        createdOrder
                          .order_number
                      }`,

                    order_id:
                      razorpayOrder
                        .order_id,

                    prefill:
                      {
                        name:
                          formData
                            .fullName
                            .trim(),

                        email:
                          formData
                            .email
                            .trim(),

                        contact:
                          formData
                            .phone
                            .replace(
                              /\D/g,
                              ""
                            ),
                      },

                    notes:
                      {
                        vv_order_id:
                          createdOrder.id,

                        vv_order_number:
                          createdOrder
                            .order_number,

                        order_type:
                          mode,
                      },

                    handler:
                      async (
                        response
                      ) => {
                        gatewaySuccessReceived =
                          true;

                        try {
                          const {
                            data:
                              verifyData,

                            error:
                              verifyError,
                          } =
                            await supabase
                              .functions
                              .invoke(
                                "razorpay-verify-payment",

                                {
                                  body: {
                                    app_order_id:
                                      createdOrder.id,

                                    razorpay_order_id:
                                      response
                                        .razorpay_order_id,

                                    razorpay_payment_id:
                                      response
                                        .razorpay_payment_id,

                                    razorpay_signature:
                                      response
                                        .razorpay_signature,
                                  },
                                }
                              );

                          if (
                            verifyError
                          ) {
                            throw verifyError;
                          }

                          const verification =
                            verifyData as
                              | RazorpayVerifyResponse
                              | null;

                          if (
                            !verification
                              ?.verified
                          ) {
                            throw new Error(
                              verification?.error ??
                                "Payment verification failed."
                            );
                          }

                          /* =========================================
                             SHIPROCKET
                          ========================================= */

                          const shiprocketPayload =
                            {
                              app_order_id:
                                createdOrder.id,

                              order_id:
                                createdOrder
                                  .order_number,

                              order_date:
                                new Date()
                                  .toISOString()
                                  .slice(
                                    0,
                                    19
                                  )
                                  .replace(
                                    "T",
                                    " "
                                  ),

                              pickup_location:
                                "work",

                              billing_customer_name:
                                formData
                                  .fullName
                                  .trim(),

                              billing_last_name:
                                "",

                              billing_address:
                                formData
                                  .addressLine1
                                  .trim(),

                              billing_address_2:
                                [
                                  formData
                                    .addressLine2
                                    .trim(),

                                  formData
                                    .district,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    ", "
                                  ),

                              billing_city:
                                formData
                                  .city
                                  .trim(),

                              billing_pincode:
                                formData
                                  .pincode
                                  .trim(),

                              billing_state:
                                formData
                                  .state,

                              billing_country:
                                formData
                                  .country,

                              billing_email:
                                formData
                                  .email
                                  .trim(),

                              billing_phone:
                                formData
                                  .phone
                                  .replace(
                                    /\D/g,
                                    ""
                                  ),

                              shipping_is_billing:
                                true,

                              order_items:
                                cartItems.map(
                                  (
                                    item
                                  ) => ({
                                    name:
                                      item.name,

                                    sku:
                                      item.slug ||
                                      String(
                                        item.id
                                      ),

                                    units:
                                      Number(
                                        item.quantity
                                      ),

                                    selling_price:
                                      Number(
                                        item.price
                                      ),
                                  })
                                ),

                              payment_method:
                                "Prepaid",

                              sub_total:
                                Number(
                                  secureOrder
                                    .subtotal
                                ),

                              length:
                                30,

                              breadth:
                                25,

                              height:
                                5,

                              weight:
                                0.5,
                            };

                          const {
                            data:
                              shiprocketData,

                            error:
                              shiprocketError,
                          } =
                            await supabase
                              .functions
                              .invoke(
                                "shiprocket-create-order",

                                {
                                  body:
                                    shiprocketPayload,
                                }
                              );

                          if (
                            shiprocketError
                          ) {
                            console.error(
                              "Shiprocket order creation failed:",

                              shiprocketError
                            );
                          } else {
                            console.log(
                              "Shiprocket order created:",

                              shiprocketData
                            );
                          }

                          finishSuccessfully();
                        } catch (
                          error
                        ) {
                          finishWithError(
                            new Error(
                              `Your payment response was received, but verification could not be completed: ${getErrorMessage(
                                error
                              )}`
                            )
                          );
                        }
                      },

                    modal:
                      {
                        ondismiss:
                          () => {
                            finishWithError(
                              new Error(
                                `Payment cancelled. Order ${createdOrder.order_number} has been saved and is awaiting payment.`
                              )
                            );
                          },
                      },
                  }
                );

              razorpay.on(
                "payment.failed",

                (
                  response
                ) => {
                  const description =
                    response
                      .error
                      ?.description;

                  finishWithError(
                    new Error(
                      description ||
                        `Payment was unsuccessful. Order ${createdOrder.order_number} has been saved and is awaiting payment.`
                    )
                  );
                }
              );

              razorpay.open();
            }
          );
        }

        /* =========================================
           SUCCESS
        ========================================= */

        navigate(
          `/order-success?order=${encodeURIComponent(
            createdOrder
              .order_number
          )}&mode=${mode}`,

          {
            state: {
              orderId:
                createdOrder.id,

              orderNumber:
                createdOrder
                  .order_number,

              mode,

              customerName:
                formData
                  .fullName
                  .trim(),

              totalQuantity:
                createdTotalQuantity,

              grandTotal:
                createdGrandTotal,

              paymentMethod,
            },
          }
        );
      } catch (
        error
      ) {
        console.error(
          "Checkout order/payment error:",

          error
        );

        if (
          gatewaySuccessReceived &&
          createdOrderId &&
          createdOrderNumber
        ) {
          setSubmitError(
            `Your payment response was received, but verification could not be completed. Please do not make another payment. Order reference: ${createdOrderNumber}. ${getErrorMessage(
              error
            )}`
          );

          navigate(
            `/order-success?order=${encodeURIComponent(
              createdOrderNumber
            )}&mode=${mode}`,

            {
              state: {
                orderId:
                  createdOrderId,

                orderNumber:
                  createdOrderNumber,

                mode,

                customerName:
                  formData
                    .fullName
                    .trim(),

                totalQuantity:
                  createdTotalQuantity,

                grandTotal:
                  createdGrandTotal,

                paymentMethod,
              },
            }
          );

          return;
        }

        setSubmitError(
          createdOrderNumber
            ? `Order ${createdOrderNumber} was created, but payment was not completed. ${getErrorMessage(
                error
              )}`
            : `We could not complete your order. ${getErrorMessage(
                error
              )}`
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="checkout-page">
      <ProductHeader
        mode={
          mode
        }
      />

      <main className="checkout-container">
        <div className="checkout-heading">
          <span>
            VV SAREES
          </span>

          <h1>
            {isWholesale
              ? "Wholesale Checkout"
              : "Retail Checkout"}
          </h1>

          <p>
            Complete your delivery
            details and place your
            order securely.
          </p>
        </div>

        {!minimumReached && (
          <div className="checkout-minimum-warning">
            <FiPackage />

            <span>
              {isWholesale
                ? `Wholesale checkout requires at least 5 sarees. You currently have ${totalQuantity}.`
                : "Add at least one product before checkout."}
            </span>
          </div>
        )}

        {hasOutOfStockItem && (
          <div className="checkout-minimum-warning">
            <FiPackage />

            <span>
              One or more cart
              items are unavailable
              or exceed available
              stock. Go back to cart
              and update them.
            </span>
          </div>
        )}

        {submitError && (
          <div className="checkout-minimum-warning">
            <FiPackage />

            <span>
              {submitError}
            </span>
          </div>
        )}

        {shippingPreviewError && (
          <div className="checkout-minimum-warning">
            <FiTruck />

            <span>
              {shippingPreviewError}
            </span>
          </div>
        )}

        {shippingCalculation
          .hasManualProduct &&
          !shippingCalculation
            .isConfigured &&
          !shippingPreviewError &&
          !isLoadingShipping && (
            <div className="checkout-minimum-warning">
              <FiTruck />

              <span>
                {formData.country ===
                  "India" &&
                formData.state ===
                  "Tamil Nadu" &&
                !formData.district
                  ? "Select your district to calculate the shipping charge."
                  : "Shipping is not configured for this delivery location."}
              </span>
            </div>
          )}

        <form
          className="checkout-layout"
          onSubmit={
            handleSubmit
          }
        >
          <div className="checkout-left">
            {/* CUSTOMER DETAILS */}

            <section className="checkout-card">
              <div className="checkout-card-heading">
                <span className="checkout-step-icon">
                  <FiMapPin />
                </span>

                <div>
                  <span>
                    Step 1
                  </span>

                  <h2>
                    Customer &amp;
                    Delivery Details
                  </h2>
                </div>
              </div>

              <div className="checkout-form-grid">
                <label>
                  <span>
                    Full Name
                  </span>

                  <input
                    type="text"
                    value={
                      formData
                        .fullName
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "fullName",

                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter your full name"
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Phone Number
                  </span>

                  <input
                    type="tel"
                    value={
                      formData.phone
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "phone",

                        event
                          .target
                          .value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            15
                          )
                      )
                    }
                    placeholder={
                      formData.country ===
                      "India"
                        ? "10-digit mobile number"
                        : "Enter phone number"
                    }
                    inputMode="numeric"
                    maxLength={
                      formData.country ===
                      "India"
                        ? 10
                        : 15
                    }
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Email Address
                  </span>

                  <input
                    type="email"
                    value={
                      formData.email
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "email",

                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter your email"
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Address Line 1
                  </span>

                  <input
                    type="text"
                    value={
                      formData
                        .addressLine1
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "addressLine1",

                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Door no, street name"
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Address Line 2
                  </span>

                  <input
                    type="text"
                    value={
                      formData
                        .addressLine2
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "addressLine2",

                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Area, landmark (optional)"
                    disabled={
                      isSubmitting
                    }
                  />
                </label>

                <label>
                  <span>
                    Country
                  </span>

                  <select
                    value={
                      formData.country
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "country",

                        event
                          .target
                          .value
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                    required
                  >
                    {COUNTRIES.map(
                      (
                        country
                      ) => (
                        <option
                          key={
                            country
                          }
                          value={
                            country
                          }
                        >
                          {
                            country
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                {formData.country ===
                "India" ? (
                  <label>
                    <span>
                      State
                    </span>

                    <select
                      value={
                        formData.state
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "state",

                          event
                            .target
                            .value
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      required
                    >
                      {INDIA_STATES.map(
                        (
                          state
                        ) => (
                          <option
                            key={
                              state
                            }
                            value={
                              state
                            }
                          >
                            {
                              state
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>
                ) : (
                  <label>
                    <span>
                      State / Province
                    </span>

                    <input
                      type="text"
                      value={
                        formData.state
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "state",

                          event
                            .target
                            .value
                        )
                      }
                      placeholder="State / Province (optional)"
                      disabled={
                        isSubmitting
                      }
                    />
                  </label>
                )}

                {formData.country ===
                  "India" &&
                  formData.state ===
                    "Tamil Nadu" && (
                    <label>
                      <span>
                        District
                      </span>

                      <select
                        value={
                          formData
                            .district
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            "district",

                            event
                              .target
                              .value
                          )
                        }
                        disabled={
                          isSubmitting
                        }
                        required
                      >
                        <option value="">
                          Select District
                        </option>

                        {TAMIL_NADU_DISTRICTS.map(
                          (
                            district
                          ) => (
                            <option
                              key={
                                district
                              }
                              value={
                                district
                              }
                            >
                              {
                                district
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  )}

                <label>
                  <span>
                    City
                  </span>

                  <input
                    type="text"
                    value={
                      formData.city
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "city",

                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter city"
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    {formData.country ===
                    "India"
                      ? "Pincode"
                      : "Postal Code"}
                  </span>

                  <input
                    type="text"
                    value={
                      formData
                        .pincode
                    }
                    onChange={(
                      event
                    ) => {
                      const nextValue =
                        formData.country ===
                        "India"
                          ? event
                              .target
                              .value
                              .replace(
                                /\D/g,
                                ""
                              )
                              .slice(
                                0,
                                6
                              )
                          : event
                              .target
                              .value
                              .slice(
                                0,
                                16
                              );

                      updateField(
                        "pincode",

                        nextValue
                      );
                    }}
                    placeholder={
                      formData.country ===
                      "India"
                        ? "6-digit pincode"
                        : "Postal code"
                    }
                    inputMode={
                      formData.country ===
                      "India"
                        ? "numeric"
                        : "text"
                    }
                    maxLength={
                      formData.country ===
                      "India"
                        ? 6
                        : 16
                    }
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Delivery
                    Instructions
                  </span>

                  <textarea
                    value={
                      formData
                        .deliveryNote
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "deliveryNote",

                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Landmark or delivery note (optional)"
                    rows={
                      4
                    }
                    disabled={
                      isSubmitting
                    }
                  />
                </label>
              </div>
            </section>

            {/* DELIVERY */}

            <section className="checkout-card">
              <div className="checkout-card-heading">
                <span className="checkout-step-icon">
                  <FiTruck />
                </span>

                <div>
                  <span>
                    Step 2
                  </span>

                  <h2>
                    Delivery Method
                  </h2>
                </div>
              </div>

              <label className="checkout-option-card checkout-option-active">
                <input
                  type="radio"
                  name="delivery"
                  value="standard"
                  defaultChecked
                  disabled={
                    isSubmitting
                  }
                />

                <div>
                  <strong>
                    Standard Delivery
                  </strong>

                  <span>
                    Products marked
                    Free Shipping remain
                    free. Manual shipping
                    is calculated from
                    your district, state
                    or country rate.
                  </span>
                </div>

                <span className="checkout-option-price">
                  {
                    shippingDisplay
                  }
                </span>
              </label>
            </section>

            {/* PAYMENT */}

            <section className="checkout-card">
              <div className="checkout-card-heading">
                <span className="checkout-step-icon">
                  <FiCreditCard />
                </span>

                <div>
                  <span>
                    Step 3
                  </span>

                  <h2>
                    Payment Method
                  </h2>
                </div>
              </div>

              <div className="checkout-payment-options">
                {PAYMENT_METHODS.razorpay && (
                  <label
                    className={`checkout-option-card ${
                      paymentMethod ===
                      "razorpay"
                        ? "checkout-option-active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={
                        paymentMethod ===
                        "razorpay"
                      }
                      onChange={() =>
                        setPaymentMethod(
                          "razorpay"
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                    />

                    <div>
                      <strong>
                        Online Payment
                      </strong>

                      <span>
                        Pay securely
                        using Razorpay.
                        UPI, cards and
                        other available
                        payment methods
                        will open in the
                        checkout.
                      </span>
                    </div>

                    <FiCheckCircle />
                  </label>
                )}

                {PAYMENT_METHODS.cod && (
                  <label
                    className={`checkout-option-card ${
                      paymentMethod ===
                      "cod"
                        ? "checkout-option-active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={
                        paymentMethod ===
                        "cod"
                      }
                      onChange={() =>
                        setPaymentMethod(
                          "cod"
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                    />

                    <div>
                      <strong>
                        Cash on Delivery
                      </strong>

                      <span>
                        Pay when your
                        order is
                        delivered.
                      </span>
                    </div>

                    <FiCheckCircle />
                  </label>
                )}
              </div>

              <div className="checkout-security-note">
                <FiLock />

                <span>
                  Your payment is
                  processed securely
                  through Razorpay.
                </span>
              </div>
            </section>
          </div>

          {/* ORDER SUMMARY */}

          <aside className="checkout-summary">
            <h2>
              Order Summary
            </h2>

            <div className="checkout-summary-items">
              {cartItems.map(
                (
                  item
                ) => (
                  <div
                    className="checkout-summary-item"
                    key={
                      item.id
                    }
                  >
                    <div className="checkout-summary-image">
                      {item.image ? (
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          style={{
                            width:
                              "100%",

                            height:
                              "100%",

                            objectFit:
                              "cover",
                          }}
                        />
                      ) : (
                        "Product Image"
                      )}
                    </div>

                    <div>
                      <strong>
                        {
                          item.name
                        }
                      </strong>

                      <span>
                        {
                          item.colour
                        }
                      </span>

                      <small>
                        Qty:{" "}
                        {
                          item.quantity
                        }
                      </small>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        item.price
                      ) *
                        Number(
                          item.quantity
                        )}
                    </strong>
                  </div>
                )
              )}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>
                Total Sarees
              </span>

              <strong>
                {
                  totalQuantity
                }
              </strong>
            </div>

            <div className="checkout-summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {
                  subtotal
                }
              </strong>
            </div>

            <div className="checkout-summary-row">
              <span>
                Shipping
              </span>

              <strong>
                {
                  shippingDisplay
                }
              </strong>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">
              <span>
                Grand Total
              </span>

              <strong>
                ₹
                {
                  grandTotal
                }
              </strong>
            </div>

            <button
              type="submit"
              className="checkout-place-order"
              disabled={
                !canPlaceOrder
              }
            >
              {isLoadingShipping
                ? "Calculating Shipping..."
                : isSubmitting
                  ? paymentMethod ===
                    "razorpay"
                    ? "Processing Payment..."
                    : "Placing Order..."
                  : paymentMethod ===
                    "razorpay"
                    ? "Pay Securely"
                    : "Place Order"}
            </button>

            <Link
              to={`/${mode}/cart`}
              className="checkout-back-cart"
            >
              Back to Cart
            </Link>

            <div className="checkout-trust-list">
              <div>
                <FiShield />

                <span>
                  100% Secure
                  Checkout
                </span>
              </div>

              <div>
                <FiTruck />

                <span>
                  Safe Delivery
                </span>
              </div>

              <div>
                <FiCheckCircle />

                <span>
                  Verified Order
                  Details
                </span>
              </div>
            </div>
          </aside>
        </form>
      </main>

      <Footer />
    </div>
  );
}