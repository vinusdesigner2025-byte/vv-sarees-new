import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

import "./WholesaleAuth.css";

type GstOption =
  | "yes"
  | "no";

export default function WholesaleRegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] =
    useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [businessType, setBusinessType] =
    useState("");

  const [gstRegistered, setGstRegistered] =
    useState<GstOption>("no");

  const [gstin, setGstin] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [
    whatsappNumber,
    setWhatsappNumber,
  ] = useState("");

  const [email, setEmail] =
    useState("");

const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [pincode, setPincode] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const validateForm = () => {
    if (!fullName.trim()) {
      return "Full name is required.";
    }

    if (!companyName.trim()) {
      return "Company / Shop name is required.";
    }

    if (!businessType.trim()) {
      return "Business type is required.";
    }

    if (
      gstRegistered === "yes" &&
      !gstin.trim()
    ) {
      return "GSTIN is required for GST registered businesses.";
    }

    if (!phone.trim()) {
      return "Phone number is required.";
    }

    if (!email.trim()) {
      return "Email is required.";
    }
if (!address.trim()) {
      return "Address is required.";
    }

    if (!city.trim()) {
      return "City is required.";
    }

    if (!state.trim()) {
      return "State is required.";
    }

    if (!pincode.trim()) {
      return "Pincode is required.";
    }

    return "";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setErrorMessage(
        validationError
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const applicationId =
        crypto.randomUUID();

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const {
        error: applicationError,
      } = await supabase
        .from(
          "wholesale_applications"
        )
        .insert({
          id: applicationId,

          full_name:
            fullName.trim(),

          company_name:
            companyName.trim(),

          business_type:
            businessType.trim(),

          gst_registered:
            gstRegistered === "yes",

          gstin:
            gstRegistered === "yes"
              ? gstin
                  .trim()
                  .toUpperCase()
              : null,

          phone:
            phone.trim(),

          whatsapp_number:
            whatsappNumber.trim() ||
            phone.trim(),

          email:
            normalizedEmail,

          address:
            address.trim(),

          city:
            city.trim(),

          state:
            state.trim(),

          pincode:
            pincode.trim(),

          approval_status:
            "pending",
        });

      if (applicationError) {
        console.error(
          "Wholesale insert error:",
          applicationError
        );

        throw new Error(
          applicationError.message
        );
      }

      localStorage.setItem(
        "vv-wholesale-pending-application",
        applicationId
      );

      localStorage.setItem(
        "vv-wholesale-pending-email",
        normalizedEmail
      );

      navigate(
        "/wholesale-pending",
        {
          replace: true,

          state: {
            applicationId,
            email:
              normalizedEmail,
            justSubmitted:
              true,
          },
        }
      );
    } catch (error) {
      console.error(
        "Wholesale registration error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="wholesale-auth-page">
      <section className="wholesale-auth-card wholesale-auth-register-card">
        <div className="wholesale-auth-header">
          <span className="wholesale-auth-eyebrow">
            VV Sarees
          </span>

          <h1>
            Wholesale Registration
          </h1>

          <p>
            Register your business to
            access wholesale pricing and
            bulk-order benefits.
          </p>
        </div>

        {errorMessage && (
          <div className="wholesale-auth-error">
            {errorMessage}
          </div>
        )}

        <form
          className="wholesale-auth-form"
          onSubmit={handleSubmit}
        >
          <div className="wholesale-auth-grid">
            <div className="wholesale-auth-field">
              <label htmlFor="wholesale-full-name">
                Full Name *
              </label>

              <input
                id="wholesale-full-name"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="wholesale-auth-field">
              <label htmlFor="wholesale-company-name">
                Company / Shop Name *
              </label>

              <input
                id="wholesale-company-name"
                type="text"
                value={companyName}
                onChange={(event) =>
                  setCompanyName(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="wholesale-auth-field">
              <label htmlFor="wholesale-business-type">
                Business Type *
              </label>

              <select
                id="wholesale-business-type"
                value={businessType}
                onChange={(event) =>
                  setBusinessType(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
              >
                <option value="">
                  Select Business Type
                </option>

                <option value="Retail Shop">
                  Retail Shop
                </option>

                <option value="Boutique">
                  Boutique
                </option>

                <option value="Reseller">
                  Reseller
                </option>

                <option value="Online Seller">
                  Online Seller
                </option>

                <option value="Wholesaler">
                  Wholesaler
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="wholesale-auth-field">
              <label>
                GST Registered? *
              </label>

              <div className="wholesale-auth-radio-row">
                <label>
                  <input
                    type="radio"
                    name="gstRegistered"
                    value="yes"
                    checked={
                      gstRegistered ===
                      "yes"
                    }
                    onChange={() =>
                      setGstRegistered(
                        "yes"
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                  />

                  Yes
                </label>

                <label>
                  <input
                    type="radio"
                    name="gstRegistered"
                    value="no"
                    checked={
                      gstRegistered ===
                      "no"
                    }
                    onChange={() =>
                      setGstRegistered(
                        "no"
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                  />

                  No
                </label>
              </div>
            </div>

            {gstRegistered ===
              "yes" && (
              <div className="wholesale-auth-field">
                <label htmlFor="wholesale-gstin">
                  GSTIN *
                </label>

                <input
                  id="wholesale-gstin"
                  type="text"
                  value={gstin}
                  onChange={(event) =>
                    setGstin(
                      event.target.value
                        .toUpperCase()
                    )
                  }
                  maxLength={15}
                  disabled={
                    isSubmitting
                  }
                />
              </div>
            )}

            <div className="wholesale-auth-field">
              <label htmlFor="wholesale-phone">
                Phone Number *
              </label>

              <input
                id="wholesale-phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="wholesale-auth-field">
              <label htmlFor="wholesale-whatsapp">
                WhatsApp Number
              </label>

              <input
                id="wholesale-whatsapp"
                type="tel"
                value={
                  whatsappNumber
                }
                onChange={(event) =>
                  setWhatsappNumber(
                    event.target.value
                  )
                }
                placeholder="Leave blank if same as phone"
                disabled={isSubmitting}
              />
            </div>

            <div className="wholesale-auth-field">
              <label htmlFor="wholesale-email">
                Email *
              </label>

              <input
                id="wholesale-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="wholesale-auth-field wholesale-auth-full">
              <label htmlFor="wholesale-address">
                Address *
              </label>

              <textarea
                id="wholesale-address"
                rows={4}
                value={address}
                onChange={(event) =>
                  setAddress(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="wholesale-auth-field">
              <label htmlFor="wholesale-city">
                City *
              </label>

              <input
                id="wholesale-city"
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="wholesale-auth-field">
              <label htmlFor="wholesale-state">
                State *
              </label>

              <input
                id="wholesale-state"
                type="text"
                value={state}
                onChange={(event) =>
                  setState(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="wholesale-auth-field">
              <label htmlFor="wholesale-pincode">
                Pincode *
              </label>

              <input
                id="wholesale-pincode"
                type="text"
                value={pincode}
                onChange={(event) =>
                  setPincode(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="wholesale-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Submitting Application..."
              : "Submit Wholesale Application"}
          </button>
        </form>
      </section>
    </main>
  );
}