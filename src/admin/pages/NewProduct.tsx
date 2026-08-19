import {
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiImage,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

import "../css/NewProduct.css";

type VariantImage = {
  id: string;
  file: File;
  preview: string;
};

type ColourVariant = {
  id: string;
  colourName: string;
  colourCode: string;
  sku: string;
  stock: string;
  images: VariantImage[];
};

type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

type ProductDraftVariant = {
  id: string;
  colourName: string;
  colourCode: string;
  sku: string;
  stock: string;
};

type ProductDraft = {
  productName: string;
  category: string;
  state: string;
  description: string;
  retailPrice: string;
  wholesalePrice: string;
  wholesaleMinimum: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  status: string;
  variants: ProductDraftVariant[];
};

const NEW_PRODUCT_DRAFT_KEY =
  "vv-admin-new-product-draft";

const INDIA_REGIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

const createEmptyVariant = (): ColourVariant => ({
  id: crypto.randomUUID(),
  colourName: "",
  colourCode: "#7a3e18",
  sku: "",
  stock: "",
  images: [],
});

const createSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(error.message);
  }

  return "Unknown error";
};

export default function NewProduct() {
  const navigate = useNavigate();

  const [productName, setProductName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [state, setState] =
    useState("");

  const [categories, setCategories] =
    useState<ProductCategory[]>([]);

  const [
    isLoadingCategories,
    setIsLoadingCategories,
  ] = useState(true);

  const [
    categoryError,
    setCategoryError,
  ] = useState("");

  const [description, setDescription] =
    useState("");

  const [retailPrice, setRetailPrice] =
    useState("");

  const [
    wholesalePrice,
    setWholesalePrice,
  ] = useState("");

  const [
    wholesaleMinimum,
    setWholesaleMinimum,
  ] = useState("5");

  const [isFeatured, setIsFeatured] =
    useState(false);

  const [isNewArrival, setIsNewArrival] =
    useState(false);

  const [status, setStatus] =
    useState("active");

  const [isSaving, setIsSaving] =
    useState(false);

  const [variants, setVariants] = useState<
    ColourVariant[]
  >([createEmptyVariant()]);

  const [isDraftLoaded, setIsDraftLoaded] =
    useState(false);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(
        NEW_PRODUCT_DRAFT_KEY
      );

      if (savedDraft) {
        const draft = JSON.parse(
          savedDraft
        ) as Partial<ProductDraft>;

        setProductName(
          typeof draft.productName === "string"
            ? draft.productName
            : ""
        );

        setCategory(
          typeof draft.category === "string"
            ? draft.category
            : ""
        );

        setState(
          typeof draft.state === "string"
            ? draft.state
            : ""
        );

        setDescription(
          typeof draft.description === "string"
            ? draft.description
            : ""
        );

        setRetailPrice(
          typeof draft.retailPrice === "string"
            ? draft.retailPrice
            : ""
        );

        setWholesalePrice(
          typeof draft.wholesalePrice === "string"
            ? draft.wholesalePrice
            : ""
        );

        setWholesaleMinimum(
          typeof draft.wholesaleMinimum === "string"
            ? draft.wholesaleMinimum
            : "5"
        );

        setIsFeatured(
          typeof draft.isFeatured === "boolean"
            ? draft.isFeatured
            : false
        );

        setIsNewArrival(
          typeof draft.isNewArrival === "boolean"
            ? draft.isNewArrival
            : false
        );

        setStatus(
          typeof draft.status === "string"
            ? draft.status
            : "active"
        );

        if (
          Array.isArray(draft.variants) &&
          draft.variants.length > 0
        ) {
          setVariants(
            draft.variants.map((variant) => ({
              id:
                typeof variant.id === "string"
                  ? variant.id
                  : crypto.randomUUID(),
              colourName:
                typeof variant.colourName ===
                "string"
                  ? variant.colourName
                  : "",
              colourCode:
                typeof variant.colourCode ===
                "string"
                  ? variant.colourCode
                  : "#7a3e18",
              sku:
                typeof variant.sku === "string"
                  ? variant.sku
                  : "",
              stock:
                typeof variant.stock === "string"
                  ? variant.stock
                  : "",
              images: [],
            }))
          );
        }
      }
    } catch (error) {
      console.error(
        "New product draft restore error:",
        error
      );
    } finally {
      setIsDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftLoaded || isSaving) {
      return;
    }

    const draft: ProductDraft = {
      productName,
      category,
      state,
      description,
      retailPrice,
      wholesalePrice,
      wholesaleMinimum,
      isFeatured,
      isNewArrival,
      status,
      variants: variants.map((variant) => ({
        id: variant.id,
        colourName: variant.colourName,
        colourCode: variant.colourCode,
        sku: variant.sku,
        stock: variant.stock,
      })),
    };

    try {
      localStorage.setItem(
        NEW_PRODUCT_DRAFT_KEY,
        JSON.stringify(draft)
      );
    } catch (error) {
      console.error(
        "New product draft save error:",
        error
      );
    }
  }, [
    isDraftLoaded,
    isSaving,
    productName,
    category,
    state,
    description,
    retailPrice,
    wholesalePrice,
    wholesaleMinimum,
    isFeatured,
    isNewArrival,
    status,
    variants,
  ]);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError("");

      const { data, error } =
        await supabase
          .from("categories")
          .select("id, name, slug")
          .eq("status", "active")
          .order("name", {
            ascending: true,
          });

      if (error) {
        console.error(
          "Categories load error:",
          error
        );

        setCategoryError(
          `Categories load aagala: ${error.message}`
        );

        setCategories([]);
        setCategory("");
        setIsLoadingCategories(false);
        return;
      }

      const loadedCategories =
        (data ?? []) as ProductCategory[];

      setCategories(loadedCategories);

      if (loadedCategories.length > 0) {
        setCategory(
          (currentCategory) =>
            currentCategory ||
            loadedCategories[0].name
        );
      } else {
        setCategory("");
      }

      setIsLoadingCategories(false);
    };

    void loadCategories();
  }, []);

  const updateVariant = (
    variantId: string,
    field: keyof Omit<
      ColourVariant,
      "id" | "images"
    >,
    value: string
  ) => {
    setVariants((currentVariants) =>
      currentVariants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  };

  const addVariant = () => {
    setVariants((currentVariants) => [
      ...currentVariants,
      createEmptyVariant(),
    ]);
  };

  const removeVariant = (
    variantId: string
  ) => {
    setVariants((currentVariants) => {
      if (currentVariants.length === 1) {
        alert(
          "At least one colour variant is required."
        );

        return currentVariants;
      }

      const variantToRemove =
        currentVariants.find(
          (variant) =>
            variant.id === variantId
        );

      variantToRemove?.images.forEach(
        (image) => {
          URL.revokeObjectURL(
            image.preview
          );
        }
      );

      return currentVariants.filter(
        (variant) =>
          variant.id !== variantId
      );
    });
  };

  const handleImageUpload = (
    variantId: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) return;

    const invalidFile = files.find(
      (file) =>
        ![
          "image/png",
          "image/jpeg",
          "image/webp",
        ].includes(file.type)
    );

    if (invalidFile) {
      alert(
        "JPG, PNG or WEBP image mattum upload pannu."
      );

      event.target.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) =>
        file.size >
        10 * 1024 * 1024
    );

    if (oversizedFile) {
      alert(
        "Oru image maximum 10 MB-kulla irukanum."
      );

      event.target.value = "";
      return;
    }

    const newImages: VariantImage[] =
      files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview:
          URL.createObjectURL(file),
      }));

    setVariants((currentVariants) =>
      currentVariants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              images: [
                ...variant.images,
                ...newImages,
              ],
            }
          : variant
      )
    );

    event.target.value = "";
  };

  const removeImage = (
    variantId: string,
    imageId: string
  ) => {
    setVariants((currentVariants) =>
      currentVariants.map((variant) => {
        if (
          variant.id !== variantId
        ) {
          return variant;
        }

        const imageToRemove =
          variant.images.find(
            (image) =>
              image.id === imageId
          );

        if (imageToRemove) {
          URL.revokeObjectURL(
            imageToRemove.preview
          );
        }

        return {
          ...variant,
          images:
            variant.images.filter(
              (image) =>
                image.id !== imageId
            ),
        };
      })
    );
  };

  const validateForm = () => {
    if (!productName.trim()) {
      alert(
        "Product name is required."
      );

      return false;
    }

    if (!category) {
      alert(
        "First Categories page-la oru active category add pannu."
      );

      return false;
    }

    if (!state) {
      alert(
        "Product state select pannu."
      );

      return false;
    }

    if (
      !retailPrice ||
      Number(retailPrice) <= 0
    ) {
      alert(
        "Enter a valid retail price."
      );

      return false;
    }

    if (
      !wholesalePrice ||
      Number(wholesalePrice) <= 0
    ) {
      alert(
        "Enter a valid wholesale price."
      );

      return false;
    }

    if (
      !wholesaleMinimum ||
      Number(wholesaleMinimum) < 1
    ) {
      alert(
        "Enter a valid wholesale minimum quantity."
      );

      return false;
    }

    for (
      let index = 0;
      index < variants.length;
      index += 1
    ) {
      const variant = variants[index];

      if (
        !variant.colourName.trim()
      ) {
        alert(
          `Enter colour name for variant ${
            index + 1
          }.`
        );

        return false;
      }

      if (!variant.sku.trim()) {
        alert(
          `Enter SKU for ${variant.colourName}.`
        );

        return false;
      }

      if (
        variant.stock === "" ||
        Number(variant.stock) < 0
      ) {
        alert(
          `Enter valid stock for ${variant.colourName}.`
        );

        return false;
      }

      if (
        variant.images.length === 0
      ) {
        alert(
          `Upload at least one image for ${variant.colourName}.`
        );

        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !validateForm() ||
      isSaving
    ) {
      return;
    }

    setIsSaving(true);

    let createdProductId:
      | string
      | null = null;

    const uploadedFilePaths: string[] =
      [];

    try {
      const slugBase =
        createSlug(productName) ||
        "product";

      const slug =
        `${slugBase}-${Date.now()}`;

      const {
        data: product,
        error: productError,
      } = await supabase
        .from("products")
        .insert({
          name: productName.trim(),
          slug,
          category,
          state,
          collection: "",
          description:
            description.trim(),

          retail_price:
            Number(retailPrice),

          wholesale_price:
            Number(wholesalePrice),

          wholesale_minimum:
            Number(wholesaleMinimum),

          status,

          is_featured:
            isFeatured,

          is_new_arrival:
            isNewArrival,

          updated_at:
            new Date().toISOString(),
        })
        .select("id")
        .single();

      if (productError) {
        throw productError;
      }

      if (!product?.id) {
        throw new Error(
          "Product ID create aagala."
        );
      }

      createdProductId = product.id;

      for (
        const variant of variants
      ) {
        const {
          data: savedVariant,
          error: variantError,
        } = await supabase
          .from("product_variants")
          .insert({
            product_id:
              createdProductId,

            colour_name:
              variant.colourName.trim(),

            colour_code:
              variant.colourCode,

            sku:
              variant.sku.trim(),

            stock:
              Number(variant.stock),
          })
          .select("id")
          .single();

        if (variantError) {
          throw variantError;
        }

        if (!savedVariant?.id) {
          throw new Error(
            "Variant ID create aagala."
          );
        }

        for (
          let imageIndex = 0;
          imageIndex <
          variant.images.length;
          imageIndex += 1
        ) {
          const image =
            variant.images[
              imageIndex
            ];

          const extension =
            image.file.name
              .split(".")
              .pop()
              ?.toLowerCase() ||
            "jpg";

          const fileName =
            `${crypto.randomUUID()}.${extension}`;

          const filePath = [
            createdProductId,
            savedVariant.id,
            fileName,
          ].join("/");

          const {
            error: uploadError,
          } =
            await supabase.storage
              .from("product-images")
              .upload(
                filePath,
                image.file,
                {
                  cacheControl:
                    "3600",

                  upsert: false,

                  contentType:
                    image.file.type,
                }
              );

          if (uploadError) {
            throw uploadError;
          }

          uploadedFilePaths.push(
            filePath
          );

          const {
            data: publicUrlData,
          } =
            supabase.storage
              .from("product-images")
              .getPublicUrl(
                filePath
              );

          const {
            error: imageError,
          } = await supabase
            .from("product_images")
            .insert({
              variant_id:
                savedVariant.id,

              image_url:
                publicUrlData.publicUrl,

              display_order:
                imageIndex,
            });

          if (imageError) {
            throw imageError;
          }
        }
      }

      variants.forEach(
        (variant) => {
          variant.images.forEach(
            (image) => {
              URL.revokeObjectURL(
                image.preview
              );
            }
          );
        }
      );

      localStorage.removeItem(
        NEW_PRODUCT_DRAFT_KEY
      );

      alert(
        "Product successfully saved!"
      );

      navigate("/admin/products");
    } catch (error) {
      console.error(
        "Product save error:",
        error
      );

      if (
        uploadedFilePaths.length > 0
      ) {
        await supabase.storage
          .from("product-images")
          .remove(uploadedFilePaths);
      }

      if (createdProductId) {
        await supabase
          .from("products")
          .delete()
          .eq(
            "id",
            createdProductId
          );
      }

      alert(
        `Product save aagala: ${getErrorMessage(
          error
        )}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      className="new-product-page"
      onSubmit={handleSubmit}
    >
      <div className="new-product-topbar">
        <div className="new-product-heading">
          <button
            type="button"
            className="new-product-back"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            aria-label="Back to products"
            disabled={isSaving}
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1>
              Add New Product
            </h1>

            <p>
              Add product information
              and colour variants.
            </p>
          </div>
        </div>

        <div className="new-product-top-actions">
          <button
            type="button"
            className="new-product-cancel"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="new-product-save"
            disabled={
              isSaving ||
              isLoadingCategories ||
              categories.length === 0
            }
          >
            {isSaving
              ? "Saving Product..."
              : "Save Product"}
          </button>
        </div>
      </div>

      {categoryError && (
        <div
          style={{
            marginBottom: "18px",
            border:
              "1px solid #efc7c2",
            borderRadius: "10px",
            background: "#fff3f1",
            color: "#a13e35",
            padding: "12px 14px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {categoryError}
        </div>
      )}

      <div className="new-product-layout">
        <div className="new-product-main">
          <section className="new-product-card">
            <div className="new-product-card-heading">
              <h2>
                Product Information
              </h2>

              <p>
                Enter the general saree
                details.
              </p>
            </div>

            <div className="new-product-form-grid">
              <div className="new-product-field new-product-full">
                <label htmlFor="product-name">
                  Product Name
                </label>

                <input
                  id="product-name"
                  type="text"
                  placeholder="Example: Premium Khadi Cotton Saree"
                  value={productName}
                  disabled={isSaving}
                  onChange={(event) =>
                    setProductName(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="new-product-field">
                <label htmlFor="product-category">
                  Category
                </label>

                <select
                  id="product-category"
                  value={category}
                  disabled={
                    isSaving ||
                    isLoadingCategories ||
                    categories.length === 0
                  }
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                >
                  {isLoadingCategories ? (
                    <option value="">
                      Loading categories...
                    </option>
                  ) : categories.length ===
                    0 ? (
                    <option value="">
                      No active categories
                    </option>
                  ) : (
                    categories.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.name}
                        >
                          {item.name}
                        </option>
                      )
                    )
                  )}
                </select>
              </div>

              <div className="new-product-field">
                <label htmlFor="product-state">
                  State / Union Territory
                </label>

                <select
                  id="product-state"
                  value={state}
                  disabled={isSaving}
                  onChange={(event) =>
                    setState(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select State / UT
                  </option>

                  {INDIA_REGIONS.map(
                    (region) => (
                      <option
                        key={region}
                        value={region}
                      >
                        {region}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="new-product-field">
                <label htmlFor="product-status">
                  Status
                </label>

                <select
                  id="product-status"
                  value={status}
                  disabled={isSaving}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="draft">
                    Draft
                  </option>
                </select>
              </div>

              <div className="new-product-field new-product-full">
                <label htmlFor="product-description">
                  Description
                </label>

                <textarea
                  id="product-description"
                  rows={6}
                  placeholder="Mention fabric, length, blouse piece, wash care and other details..."
                  value={description}
                  disabled={isSaving}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section className="new-product-card">
            <div className="new-product-card-heading">
              <h2>Pricing</h2>

              <p>
                Retail and wholesale
                prices for this product.
              </p>
            </div>

            <div className="new-product-form-grid">
              <div className="new-product-field">
                <label htmlFor="retail-price">
                  Retail Price
                </label>

                <div className="new-product-price-input">
                  <span>₹</span>

                  <input
                    id="retail-price"
                    type="number"
                    min="0"
                    placeholder="799"
                    value={retailPrice}
                    disabled={isSaving}
                    onChange={(event) =>
                      setRetailPrice(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="new-product-field">
                <label htmlFor="wholesale-price">
                  Wholesale Price
                </label>

                <div className="new-product-price-input">
                  <span>₹</span>

                  <input
                    id="wholesale-price"
                    type="number"
                    min="0"
                    placeholder="520"
                    value={
                      wholesalePrice
                    }
                    disabled={isSaving}
                    onChange={(event) =>
                      setWholesalePrice(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="new-product-field">
                <label htmlFor="wholesale-minimum">
                  Wholesale Minimum
                  Quantity
                </label>

                <input
                  id="wholesale-minimum"
                  type="number"
                  min="1"
                  placeholder="5"
                  value={
                    wholesaleMinimum
                  }
                  disabled={isSaving}
                  onChange={(event) =>
                    setWholesaleMinimum(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section className="new-product-card">
            <div className="new-product-card-heading new-product-variant-heading">
              <div>
                <h2>
                  Colours & Images
                </h2>

                <p>
                  Add images separately
                  for every colour.
                </p>
              </div>

              <button
                type="button"
                className="add-colour-button"
                onClick={addVariant}
                disabled={isSaving}
              >
                <FiPlus />
                Add Colour
              </button>
            </div>

            <div className="colour-variant-list">
              {variants.map(
                (
                  variant,
                  variantIndex
                ) => (
                  <article
                    className="colour-variant-card"
                    key={variant.id}
                  >
                    <div className="colour-variant-header">
                      <div className="colour-variant-number">
                        <span
                          style={{
                            backgroundColor:
                              variant.colourCode,
                          }}
                        />

                        <div>
                          <strong>
                            Colour{" "}
                            {variantIndex +
                              1}
                          </strong>

                          <small>
                            {variant.colourName ||
                              "New colour variant"}
                          </small>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="remove-colour-button"
                        onClick={() =>
                          removeVariant(
                            variant.id
                          )
                        }
                        disabled={isSaving}
                        aria-label="Remove colour variant"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="new-product-form-grid">
                      <div className="new-product-field">
                        <label>
                          Colour Name
                        </label>

                        <input
                          type="text"
                          placeholder="Example: Maroon"
                          value={
                            variant.colourName
                          }
                          disabled={
                            isSaving
                          }
                          onChange={(
                            event
                          ) =>
                            updateVariant(
                              variant.id,
                              "colourName",
                              event.target
                                .value
                            )
                          }
                        />
                      </div>

                      <div className="new-product-field">
                        <label>
                          Colour Code
                        </label>

                        <div className="colour-code-field">
                          <input
                            type="color"
                            value={
                              variant.colourCode
                            }
                            disabled={
                              isSaving
                            }
                            onChange={(
                              event
                            ) =>
                              updateVariant(
                                variant.id,
                                "colourCode",
                                event.target
                                  .value
                              )
                            }
                          />

                          <input
                            type="text"
                            value={
                              variant.colourCode
                            }
                            disabled={
                              isSaving
                            }
                            onChange={(
                              event
                            ) =>
                              updateVariant(
                                variant.id,
                                "colourCode",
                                event.target
                                  .value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="new-product-field">
                        <label>SKU</label>

                        <input
                          type="text"
                          placeholder="VV-KHC-MAR-001"
                          value={
                            variant.sku
                          }
                          disabled={
                            isSaving
                          }
                          onChange={(
                            event
                          ) =>
                            updateVariant(
                              variant.id,
                              "sku",
                              event.target
                                .value
                            )
                          }
                        />
                      </div>

                      <div className="new-product-field">
                        <label>
                          Stock
                        </label>

                        <input
                          type="number"
                          min="0"
                          placeholder="20"
                          value={
                            variant.stock
                          }
                          disabled={
                            isSaving
                          }
                          onChange={(
                            event
                          ) =>
                            updateVariant(
                              variant.id,
                              "stock",
                              event.target
                                .value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="variant-images-section">
                      <div className="variant-images-heading">
                        <div>
                          <h3>
                            {variant.colourName ||
                              `Colour ${
                                variantIndex +
                                1
                              }`}{" "}
                            Images
                          </h3>

                          <p>
                            Upload front,
                            pallu, border
                            and close-up
                            images.
                          </p>
                        </div>

                        <span>
                          {
                            variant.images
                              .length
                          }{" "}
                          image
                          {variant.images
                            .length === 1
                            ? ""
                            : "s"}
                        </span>
                      </div>

                      <label className="variant-image-upload">
                        <FiUploadCloud />

                        <strong>
                          Upload Images
                        </strong>

                        <small>
                          JPG, PNG or WEBP.
                          Multiple files
                          allowed.
                        </small>

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          disabled={
                            isSaving
                          }
                          onChange={(
                            event
                          ) =>
                            handleImageUpload(
                              variant.id,
                              event
                            )
                          }
                        />
                      </label>

                      {variant.images
                        .length > 0 ? (
                        <div className="variant-image-grid">
                          {variant.images.map(
                            (
                              image,
                              imageIndex
                            ) => (
                              <div
                                className="variant-image-item"
                                key={
                                  image.id
                                }
                              >
                                <img
                                  src={
                                    image.preview
                                  }
                                  alt={`${
                                    variant.colourName ||
                                    "Colour"
                                  } ${
                                    imageIndex +
                                    1
                                  }`}
                                />

                                {imageIndex ===
                                  0 && (
                                  <span className="main-image-badge">
                                    Main
                                  </span>
                                )}

                                <button
                                  type="button"
                                  disabled={
                                    isSaving
                                  }
                                  onClick={() =>
                                    removeImage(
                                      variant.id,
                                      image.id
                                    )
                                  }
                                  aria-label="Remove image"
                                >
                                  <FiX />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="variant-empty-images">
                          <FiImage />

                          <span>
                            No images
                            uploaded for
                            this colour.
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>

            <button
              type="button"
              className="add-another-colour"
              onClick={addVariant}
              disabled={isSaving}
            >
              <FiPlus />
              Add Another Colour
            </button>
          </section>
        </div>

        <aside className="new-product-sidebar">
          <section className="new-product-card">
            <div className="new-product-card-heading">
              <h2>
                Product Options
              </h2>
            </div>

            <label className="new-product-checkbox">
              <input
                type="checkbox"
                checked={isFeatured}
                disabled={isSaving}
                onChange={(event) =>
                  setIsFeatured(
                    event.target.checked
                  )
                }
              />

              <div>
                <strong>
                  Featured Product
                </strong>

                <span>
                  Display this product
                  in featured collections.
                </span>
              </div>
            </label>

            <label className="new-product-checkbox">
              <input
                type="checkbox"
                checked={isNewArrival}
                disabled={isSaving}
                onChange={(event) =>
                  setIsNewArrival(
                    event.target.checked
                  )
                }
              />

              <div>
                <strong>
                  New Arrival
                </strong>

                <span>
                  Show a new arrival
                  badge on the website.
                </span>
              </div>
            </label>
          </section>

          <section className="new-product-card product-summary-card">
            <h2>
              Product Summary
            </h2>

            <div>
              <span>Colours</span>

              <strong>
                {variants.length}
              </strong>
            </div>

            <div>
              <span>
                Total Images
              </span>

              <strong>
                {variants.reduce(
                  (
                    total,
                    variant
                  ) =>
                    total +
                    variant.images
                      .length,
                  0
                )}
              </strong>
            </div>

            <div>
              <span>
                Total Stock
              </span>

              <strong>
                {variants.reduce(
                  (
                    total,
                    variant
                  ) =>
                    total +
                    Number(
                      variant.stock ||
                        0
                    ),
                  0
                )}
              </strong>
            </div>
          </section>

          <button
            type="submit"
            className="new-product-mobile-save"
            disabled={
              isSaving ||
              isLoadingCategories ||
              categories.length === 0
            }
          >
            {isSaving
              ? "Saving Product..."
              : "Save Product"}
          </button>
        </aside>
      </div>
    </form>
  );
}