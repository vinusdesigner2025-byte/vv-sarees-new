import { useState } from "react";
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

import "./MyAccountPage.css";

export default function MyAccountPage() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(
    user?.name ?? ""
  );

  const [email, setEmail] = useState(
    user?.email ?? ""
  );

  const [phone, setPhone] = useState("");

  const [addressLine, setAddressLine] =
    useState("");

  const [area, setArea] = useState("");

  const [city, setCity] = useState("");

  const [state, setState] = useState(
    "Tamil Nadu"
  );

  const [pincode, setPincode] =
    useState("");

  const handleSave = () => {
    setIsEditing(false);

    alert("Profile and address updated successfully.");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="my-account-page">
      <ProductHeader mode="retail" />

      <main className="my-account-container">
        <section className="my-account-card">
          <div className="my-account-heading">
            <span>VV SAREES</span>

            <h1>My Account</h1>

            <p>
              View and update your profile and delivery
              address.
            </p>
          </div>

          <div className="my-account-avatar">
            <FiUser />
          </div>

          <section className="my-account-section">
            <div className="my-account-section-title">
              <div>
                <span>Personal Information</span>

                <h2>Profile Details</h2>
              </div>

              <FiUser />
            </div>

            <div className="my-account-form">
              <label>
                <span>Full Name</span>

                <div className="my-account-input">
                  <FiUser />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter full name"
                    disabled={!isEditing}
                  />
                </div>
              </label>

              <label>
                <span>Email Address</span>

                <div className="my-account-input">
                  <FiMail />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter email address"
                    disabled={!isEditing}
                  />
                </div>
              </label>

              <label>
                <span>Phone Number</span>

                <div className="my-account-input">
                  <FiPhone />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="Add phone number"
                    disabled={!isEditing}
                  />
                </div>
              </label>
            </div>
          </section>

          <section className="my-account-section my-account-address-section">
            <div className="my-account-section-title">
              <div>
                <span>Saved Address</span>

                <h2>Delivery Address</h2>
              </div>

              <FiMapPin />
            </div>

            <div className="my-account-address-grid">
              <label className="my-account-address-full">
                <span>Door Number / Street</span>

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
                    disabled={!isEditing}
                  />
                </div>
              </label>

              <label className="my-account-address-full">
                <span>Area / Locality</span>

                <div className="my-account-input">
                  <FiMapPin />

                  <input
                    type="text"
                    value={area}
                    onChange={(event) =>
                      setArea(event.target.value)
                    }
                    placeholder="Area or locality"
                    disabled={!isEditing}
                  />
                </div>
              </label>

              <label>
                <span>City</span>

                <div className="my-account-input">
                  <FiMapPin />

                  <input
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    placeholder="City"
                    disabled={!isEditing}
                  />
                </div>
              </label>

              <label>
                <span>State</span>

                <div className="my-account-input">
                  <FiMapPin />

                  <input
                    type="text"
                    value={state}
                    onChange={(event) =>
                      setState(event.target.value)
                    }
                    placeholder="State"
                    disabled={!isEditing}
                  />
                </div>
              </label>

              <label>
                <span>Pincode</span>

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
                    disabled={!isEditing}
                  />
                </div>
              </label>

              <label>
                <span>Country</span>

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

          <div className="my-account-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="my-account-save-button"
                  onClick={handleSave}
                >
                  <FiSave />
                  Save Changes
                </button>

                <button
                  type="button"
                  className="my-account-cancel-button"
                  onClick={handleCancel}
                >
                  <FiX />
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="my-account-edit-button"
                onClick={() =>
                  setIsEditing(true)
                }
              >
                <FiEdit2 />
                Edit Profile
              </button>
            )}

            <button
              type="button"
              className="my-account-logout-button"
              onClick={handleLogout}
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