import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FiEdit2,
  FiHome,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiUser,
  FiX,
} from "react-icons/fi";

import ProductHeader from "../components/ProductHeader";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

import "./MyAccountPage.css";


type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  addressLine: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
};


const emptyProfile: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  addressLine: "",
  area: "",
  city: "",
  state: "Tamil Nadu",
  pincode: "",
};


export default function MyAccountPage() {
  const navigate = useNavigate();

  const {
    user,
    isLoggedIn,
    isAuthLoading,
    logout,
  } = useAuth();


  const [isEditing, setIsEditing] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [addressLine, setAddressLine] =
    useState("");

  const [area, setArea] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("Tamil Nadu");

  const [pincode, setPincode] =
    useState("");


  /*
   * Used for Cancel.
   *
   * When Edit Profile is clicked,
   * we keep a copy of the current
   * saved data here.
   */
  const [savedProfile, setSavedProfile] =
    useState<ProfileForm>(emptyProfile);


  /* =========================================
     REDIRECT IF CUSTOMER IS NOT LOGGED IN
  ========================================= */

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isLoggedIn) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );
    }
  }, [
    isAuthLoading,
    isLoggedIn,
    navigate,
  ]);


  /* =========================================
     LOAD CUSTOMER PROFILE FROM SUPABASE
  ========================================= */

  useEffect(() => {
    if (
      isAuthLoading ||
      !isLoggedIn ||
      !user?.id
    ) {
      return;
    }


    let cancelled = false;


    const loadProfile = async () => {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");


      const {
        data,
        error: profileError,
      } = await supabase
        .from("customer_profiles")
        .select(
          `
            full_name,
            email,
            phone,
            address_line,
            area,
            city,
            state,
            pincode,
            country
          `
        )
        .eq("id", user.id)
        .maybeSingle();


      if (cancelled) {
        return;
      }


      if (profileError) {
        console.error(
          "Profile load error:",
          profileError
        );

        setError(
          "Unable to load your profile. Please try again."
        );

        setIsLoading(false);
        return;
      }


      /*
       * If this customer has never saved
       * a profile before, use Auth data
       * as the starting values.
       */
      const loadedProfile: ProfileForm = {
        name:
          data?.full_name ??
          user.name ??
          "",

        email:
          data?.email ??
          user.email ??
          "",

        phone:
          data?.phone ??
          "",

        addressLine:
          data?.address_line ??
          "",

        area:
          data?.area ??
          "",

        city:
          data?.city ??
          "",

        state:
          data?.state ??
          "Tamil Nadu",

        pincode:
          data?.pincode ??
          "",
      };


      setName(
        loadedProfile.name
      );

      setEmail(
        loadedProfile.email
      );

      setPhone(
        loadedProfile.phone
      );

      setAddressLine(
        loadedProfile.addressLine
      );

      setArea(
        loadedProfile.area
      );

      setCity(
        loadedProfile.city
      );

      setState(
        loadedProfile.state
      );

      setPincode(
        loadedProfile.pincode
      );


      setSavedProfile(
        loadedProfile
      );

      setIsLoading(false);
    };


    void loadProfile();


    return () => {
      cancelled = true;
    };
  }, [
    isAuthLoading,
    isLoggedIn,
    user?.id,
    user?.name,
    user?.email,
  ]);


  /* =========================================
     START EDITING
  ========================================= */

  const handleEdit = () => {
    setError("");
    setSuccessMessage("");

    setSavedProfile({
      name,
      email,
      phone,
      addressLine,
      area,
      city,
      state,
      pincode,
    });

    setIsEditing(true);
  };


  /* =========================================
     CANCEL CHANGES
  ========================================= */

  const handleCancel = () => {
    setName(
      savedProfile.name
    );

    setEmail(
      savedProfile.email
    );

    setPhone(
      savedProfile.phone
    );

    setAddressLine(
      savedProfile.addressLine
    );

    setArea(
      savedProfile.area
    );

    setCity(
      savedProfile.city
    );

    setState(
      savedProfile.state
    );

    setPincode(
      savedProfile.pincode
    );

    setError("");
    setSuccessMessage("");

    setIsEditing(false);
  };


  /* =========================================
     SAVE PROFILE TO SUPABASE
  ========================================= */

  const handleSave = async () => {
    if (!user?.id) {
      setError(
        "Please login again to save your profile."
      );

      return;
    }


    const cleanedName =
      name.trim();

    const cleanedEmail =
      email.trim().toLowerCase();

    const cleanedPhone =
      phone.replace(/\D/g, "");

    const cleanedAddressLine =
      addressLine.trim();

    const cleanedArea =
      area.trim();

    const cleanedCity =
      city.trim();

    const cleanedState =
      state.trim();

    const cleanedPincode =
      pincode.replace(/\D/g, "");


    /* =====================================
       BASIC VALIDATION
    ===================================== */

    if (!cleanedName) {
      setError(
        "Please enter your full name."
      );

      return;
    }


    if (!cleanedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }


    if (
      cleanedPhone &&
      cleanedPhone.length !== 10
    ) {
      setError(
        "Please enter a valid 10-digit phone number."
      );

      return;
    }


    if (
      cleanedPincode &&
      cleanedPincode.length !== 6
    ) {
      setError(
        "Please enter a valid 6-digit pincode."
      );

      return;
    }


    setIsSaving(true);
    setError("");
    setSuccessMessage("");


    /*
     * UPSERT means:
     *
     * Profile doesn't exist -> INSERT
     * Profile already exists -> UPDATE
     */
    const {
      error: saveError,
    } = await supabase
      .from("customer_profiles")
      .upsert(
        {
          id: user.id,

          full_name:
            cleanedName,

          email:
            cleanedEmail,

          phone:
            cleanedPhone ||
            null,

          address_line:
            cleanedAddressLine ||
            null,

          area:
            cleanedArea ||
            null,

          city:
            cleanedCity ||
            null,

          state:
            cleanedState ||
            "Tamil Nadu",

          pincode:
            cleanedPincode ||
            null,

          country:
            "India",

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );


    if (saveError) {
      console.error(
        "Profile save error:",
        saveError
      );

      setError(
        saveError.message
      );

      setIsSaving(false);
      return;
    }


    const updatedProfile: ProfileForm = {
      name:
        cleanedName,

      email:
        cleanedEmail,

      phone:
        cleanedPhone,

      addressLine:
        cleanedAddressLine,

      area:
        cleanedArea,

      city:
        cleanedCity,

      state:
        cleanedState ||
        "Tamil Nadu",

      pincode:
        cleanedPincode,
    };


    setName(
      updatedProfile.name
    );

    setEmail(
      updatedProfile.email
    );

    setPhone(
      updatedProfile.phone
    );

    setAddressLine(
      updatedProfile.addressLine
    );

    setArea(
      updatedProfile.area
    );

    setCity(
      updatedProfile.city
    );

    setState(
      updatedProfile.state
    );

    setPincode(
      updatedProfile.pincode
    );


    setSavedProfile(
      updatedProfile
    );


    setIsEditing(false);

    setSuccessMessage(
      "Profile and delivery address updated successfully."
    );

    setIsSaving(false);
  };


  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = async () => {
    await logout();

    navigate(
      "/",
      {
        replace: true,
      }
    );
  };


  /* =========================================
     AUTH LOADING
  ========================================= */

  if (
    isAuthLoading ||
    !isLoggedIn
  ) {
    return (
      <div className="my-account-page">

        <ProductHeader mode="retail" />

        <main className="my-account-container">

          <section className="my-account-card">

            <div className="my-account-heading">

              <span>
                VV SAREES
              </span>

              <h1>
                My Account
              </h1>

              <p>
                Loading your account...
              </p>

            </div>

          </section>

        </main>

        <Footer />

      </div>
    );
  }


  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="my-account-page">

      <ProductHeader mode="retail" />


      <main className="my-account-container">

        <section className="my-account-card">


          {/* =================================
              HEADING
          ================================= */}

          <div className="my-account-heading">

            <span>
              VV SAREES
            </span>

            <h1>
              My Account
            </h1>

            <p>
              View and update your profile and
              delivery address.
            </p>

          </div>


          {/* =================================
              AVATAR
          ================================= */}

          <div className="my-account-avatar">
            <FiUser />
          </div>


          {/* =================================
              LOADING
          ================================= */}

          {isLoading && (

            <div
              style={{
                margin:
                  "0 0 20px",
                padding:
                  "12px 14px",
                borderRadius:
                  "10px",
                background:
                  "#fff8ec",
                color:
                  "#8b5a32",
                fontSize:
                  "12px",
                textAlign:
                  "center",
              }}
            >
              Loading profile...
            </div>

          )}


          {/* =================================
              ERROR
          ================================= */}

          {error && (

            <div
              style={{
                margin:
                  "0 0 20px",
                padding:
                  "12px 14px",
                borderRadius:
                  "10px",
                background:
                  "#fff1ef",
                color:
                  "#a13e35",
                fontSize:
                  "12px",
                lineHeight:
                  1.5,
              }}
            >
              {error}
            </div>

          )}


          {/* =================================
              SUCCESS
          ================================= */}

          {successMessage && (

            <div
              style={{
                margin:
                  "0 0 20px",
                padding:
                  "12px 14px",
                borderRadius:
                  "10px",
                background:
                  "#eef9f1",
                color:
                  "#2f7a45",
                fontSize:
                  "12px",
                lineHeight:
                  1.5,
              }}
            >
              {successMessage}
            </div>

          )}


          {/* =================================
              PERSONAL INFORMATION
          ================================= */}

          <section className="my-account-section">

            <div className="my-account-section-title">

              <div>

                <span>
                  Personal Information
                </span>

                <h2>
                  Profile Details
                </h2>

              </div>

              <FiUser />

            </div>


            <div className="my-account-form">


              {/* NAME */}

              <label>

                <span>
                  Full Name
                </span>

                <div className="my-account-input">

                  <FiUser />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Enter full name"
                    disabled={
                      !isEditing ||
                      isSaving
                    }
                  />

                </div>

              </label>


              {/* EMAIL */}

              <label>

                <span>
                  Email Address
                </span>

                <div className="my-account-input">

                  <FiMail />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="Enter email address"
                    disabled={
                      !isEditing ||
                      isSaving
                    }
                  />

                </div>

              </label>


              {/* PHONE */}

              <label>

                <span>
                  Phone Number
                </span>

                <div className="my-account-input">

                  <FiPhone />

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="Add phone number"
                    disabled={
                      !isEditing ||
                      isSaving
                    }
                  />

                </div>

              </label>

            </div>

          </section>


          {/* =================================
              DELIVERY ADDRESS
          ================================= */}

          <section
            className="
              my-account-section
              my-account-address-section
            "
          >

            <div className="my-account-section-title">

              <div>

                <span>
                  Saved Address
                </span>

                <h2>
                  Delivery Address
                </h2>

              </div>

              <FiMapPin />

            </div>


            <div className="my-account-address-grid">


              {/* ADDRESS */}

              <label className="my-account-address-full">

                <span>
                  Door Number / Street
                </span>

                <div className="my-account-input">

                  <FiHome />

                  <input
                    type="text"
                    value={addressLine}
                    onChange={(event) =>
                      setAddressLine(
                        event.target.value
                      )
                    }
                    placeholder="Door number and street"
                    disabled={
                      !isEditing ||
                      isSaving
                    }
                  />

                </div>

              </label>


              {/* AREA */}

              <label className="my-account-address-full">

                <span>
                  Area / Locality
                </span>

                <div className="my-account-input">

                  <FiMapPin />

                  <input
                    type="text"
                    value={area}
                    onChange={(event) =>
                      setArea(
                        event.target.value
                      )
                    }
                    placeholder="Area or locality"
                    disabled={
                      !isEditing ||
                      isSaving
                    }
                  />

                </div>

              </label>


              {/* CITY */}

              <label>

                <span>
                  City
                </span>

                <div className="my-account-input">

                  <FiMapPin />

                  <input
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(
                        event.target.value
                      )
                    }
                    placeholder="City"
                    disabled={
                      !isEditing ||
                      isSaving
                    }
                  />

                </div>

              </label>


              {/* STATE */}

              <label>

                <span>
                  State
                </span>

                <div className="my-account-input">

                  <FiMapPin />

                  <input
                    type="text"
                    value={state}
                    onChange={(event) =>
                      setState(
                        event.target.value
                      )
                    }
                    placeholder="State"
                    disabled={
                      !isEditing ||
                      isSaving
                    }
                  />

                </div>

              </label>


              {/* PINCODE */}

              <label>

                <span>
                  Pincode
                </span>

                <div className="my-account-input">

                  <FiMapPin />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(event) =>
                      setPincode(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="6-digit pincode"
                    disabled={
                      !isEditing ||
                      isSaving
                    }
                  />

                </div>

              </label>


              {/* COUNTRY */}

              <label>

                <span>
                  Country
                </span>

                <div className="my-account-input">

                  <FiMapPin />

                  <input
                    type="text"
                    value="India"
                    disabled
                  />

                </div>

              </label>

            </div>

          </section>


          {/* =================================
              ACTIONS
          ================================= */}

          <div className="my-account-actions">

            {isEditing ? (

              <>

                <button
                  type="button"
                  className="my-account-save-button"
                  onClick={() =>
                    void handleSave()
                  }
                  disabled={
                    isSaving
                  }
                >
                  <FiSave />

                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </button>


                <button
                  type="button"
                  className="my-account-cancel-button"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    isSaving
                  }
                >
                  <FiX />

                  Cancel
                </button>

              </>

            ) : (

              <button
                type="button"
                className="my-account-edit-button"
                onClick={
                  handleEdit
                }
                disabled={
                  isLoading
                }
              >
                <FiEdit2 />

                Edit Profile
              </button>

            )}


            <button
              type="button"
              className="my-account-logout-button"
              onClick={() =>
                void handleLogout()
              }
              disabled={
                isSaving
              }
            >
              <FiLogOut />

              Logout
            </button>

          </div>

        </section>

      </main>


      <Footer />

    </div>
  );
}