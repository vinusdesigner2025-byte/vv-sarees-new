import {
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

type ExistingImage = {
  id: string;
  kind: "existing";
  url: string;
};

type NewImage = {
  id: string;
  kind: "new";
  file: File;
  url: string;
};

type VariantImage =
  | ExistingImage
  | NewImage;

type ColourVariant = {
  localId: string;
  databaseId: string | null;
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

type ProductImageRow = {
  id: string;
  image_url: string;
  display_order: number | null;
};

type ProductVariantRow = {
  id: string;
  colour_name: string | null;
  colour_code: string | null;
  sku: string | null;
  stock: number | null;
  product_images:
    | ProductImageRow[]
    | null;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  state: string | null;
  collection: string | null;
  description: string | null;
  retail_price: number | null;
  wholesale_price: number | null;
  wholesale_minimum: number | null;
  status: string | null;
  is_featured: boolean | null;
  is_new_arrival: boolean | null;
  product_variants:
    | ProductVariantRow[]
    | null;
};

const createEmptyVariant =
  (): ColourVariant => ({
    localId: crypto.randomUUID(),
    databaseId: null,
    colourName: "",
    colourCode: "#7a3e18",
    sku: "",
    stock: "",
    images: [],
  });

const getErrorMessage = (
  error: unknown
) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(error.message);
  }

  return "Unknown error";
};

function getStoragePathFromPublicUrl(
  publicUrl: string
) {
  const marker =
    "/storage/v1/object/public/product-images/";

  const markerIndex =
    publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  return decodeURIComponent(
    publicUrl.slice(
      markerIndex +
        marker.length
    )
  );
}

export default function EditProduct() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

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

  const [variants, setVariants] =
    useState<ColourVariant[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    const loadCategories =
      async () => {
        setIsLoadingCategories(
          true
        );

        setCategoryError("");

        const {
          data,
          error,
        } =
          await supabase
            .from("categories")
            .select(
              "id, name, slug"
            )
            .eq(
              "status",
              "active"
            )
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

          setIsLoadingCategories(
            false
          );

          return;
        }

        setCategories(
          (data ?? []) as ProductCategory[]
        );

        setIsLoadingCategories(
          false
        );
      };

    void loadCategories();
  }, []);

  useEffect(() => {
    const loadProduct =
      async () => {
        if (!id) {
          setLoadError(
            "Product ID missing."
          );

          setIsLoading(false);

          return;
        }

        setIsLoading(true);
        setLoadError("");

        const {
          data,
          error,
        } =
          await supabase
            .from("products")
            .select(`
              id,
              name,
              slug,
              category,
              state,
              collection,
              description,
              retail_price,
              wholesale_price,
              wholesale_minimum,
              status,
              is_featured,
              is_new_arrival,
              product_variants (
                id,
                colour_name,
                colour_code,
                sku,
                stock,
                product_images (
                  id,
                  image_url,
                  display_order
                )
              )
            `)
            .eq("id", id)
            .single();

        if (error) {
          console.error(
            "Product load error:",
            error
          );

          setLoadError(
            `Product load aagala: ${error.message}`
          );

          setIsLoading(false);

          return;
        }

        const product =
          data as ProductRow;

        setProductName(
          product.name ?? ""
        );

        setCategory(
          product.category ?? ""
        );

        setState(
          product.state ?? ""
        );

        setDescription(
          product.description ?? ""
        );

        setRetailPrice(
          String(
            product.retail_price ??
              ""
          )
        );

        setWholesalePrice(
          String(
            product.wholesale_price ??
              ""
          )
        );

        setWholesaleMinimum(
          String(
            product.wholesale_minimum ??
              5
          )
        );

        setStatus(
          product.status === "draft"
            ? "draft"
            : "active"
        );

        setIsFeatured(
          Boolean(
            product.is_featured
          )
        );

        setIsNewArrival(
          Boolean(
            product.is_new_arrival
          )
        );

        const loadedVariants =
          (
            product.product_variants ??
            []
          ).map<ColourVariant>(
            (variant) => {
              const images =
                [
                  ...(variant.product_images ??
                    []),
                ].sort(
                  (
                    firstImage,
                    secondImage
                  ) =>
                    Number(
                      firstImage.display_order ??
                        0
                    ) -
                    Number(
                      secondImage.display_order ??
                        0
                    )
                );

              return {
                localId:
                  crypto.randomUUID(),

                databaseId:
                  variant.id,

                colourName:
                  variant.colour_name ??
                  "",

                colourCode:
                  variant.colour_code ??
                  "#7a3e18",

                sku:
                  variant.sku ?? "",

                stock: String(
                  variant.stock ?? 0
                ),

                images:
                  images.map(
                    (image) => ({
                      id: image.id,
                      kind:
                        "existing" as const,
                      url:
                        image.image_url,
                    })
                  ),
              };
            }
          );

        setVariants(
          loadedVariants.length > 0
            ? loadedVariants
            : [
                createEmptyVariant(),
              ]
        );

        setIsLoading(false);
      };

    void loadProduct();
  }, [id]);

  const updateVariant = (
    localId: string,
    field: keyof Omit<
      ColourVariant,
      | "localId"
      | "databaseId"
      | "images"
    >,
    value: string
  ) => {
    setVariants(
      (currentVariants) =>
        currentVariants.map(
          (variant) =>
            variant.localId ===
            localId
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant
        )
    );
  };

  const addVariant = () => {
    setVariants(
      (currentVariants) => [
        ...currentVariants,
        createEmptyVariant(),
      ]
    );
  };

  const removeVariant = (
    localId: string
  ) => {
    setVariants(
      (currentVariants) => {
        if (
          currentVariants.length ===
          1
        ) {
          alert(
            "At least one colour variant is required."
          );

          return currentVariants;
        }

        const variantToRemove =
          currentVariants.find(
            (variant) =>
              variant.localId ===
              localId
          );

        variantToRemove?.images.forEach(
          (image) => {
            if (
              image.kind === "new"
            ) {
              URL.revokeObjectURL(
                image.url
              );
            }
          }
        );

        return currentVariants.filter(
          (variant) =>
            variant.localId !==
            localId
        );
      }
    );
  };

  const handleImageUpload = (
    localId: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    const invalidFile =
      files.find(
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

    const oversizedFile =
      files.find(
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

    const newImages:
      NewImage[] =
      files.map((file) => ({
        id: crypto.randomUUID(),
        kind: "new",
        file,
        url:
          URL.createObjectURL(
            file
          ),
      }));

    setVariants(
      (currentVariants) =>
        currentVariants.map(
          (variant) =>
            variant.localId ===
            localId
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
    localId: string,
    imageId: string
  ) => {
    setVariants(
      (currentVariants) =>
        currentVariants.map(
          (variant) => {
            if (
              variant.localId !==
              localId
            ) {
              return variant;
            }

            const image =
              variant.images.find(
                (item) =>
                  item.id ===
                  imageId
              );

            if (
              image?.kind === "new"
            ) {
              URL.revokeObjectURL(
                image.url
              );
            }

            return {
              ...variant,
              images:
                variant.images.filter(
                  (item) =>
                    item.id !==
                    imageId
                ),
            };
          }
        )
    );
  };

  const validateForm = () => {
    if (
      !productName.trim()
    ) {
      alert(
        "Product name is required."
      );

      return false;
    }

    if (!category) {
      alert(
        "Category select pannu."
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
      Number(
        wholesalePrice
      ) <= 0
    ) {
      alert(
        "Enter a valid wholesale price."
      );

      return false;
    }

    if (
      !wholesaleMinimum ||
      Number(
        wholesaleMinimum
      ) < 1
    ) {
      alert(
        "Enter a valid wholesale minimum quantity."
      );

      return false;
    }

    for (
      let index = 0;
      index <
      variants.length;
      index += 1
    ) {
      const variant =
        variants[index];

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

      if (
        !variant.sku.trim()
      ) {
        alert(
          `Enter SKU for ${variant.colourName}.`
        );

        return false;
      }

      if (
        variant.stock === "" ||
        Number(
          variant.stock
        ) < 0
      ) {
        alert(
          `Enter valid stock for ${variant.colourName}.`
        );

        return false;
      }

      if (
        variant.images.length ===
        0
      ) {
        alert(
          `At least one image venum for ${variant.colourName}.`
        );

        return false;
      }
    }

    return true;
  };

  const deleteExistingImage =
    async (
      image: ExistingImage
    ) => {
      const path =
        getStoragePathFromPublicUrl(
          image.url
        );

      if (path) {
        const {
          error:
            storageDeleteError,
        } =
          await supabase.storage
            .from(
              "product-images"
            )
            .remove([path]);

        if (
          storageDeleteError
        ) {
          console.error(
            "Storage image delete warning:",
            storageDeleteError
          );
        }
      }

      const {
        error,
      } =
        await supabase
          .from(
            "product_images"
          )
          .delete()
          .eq(
            "id",
            image.id
          );

      if (error) {
        throw error;
      }
    };

  const saveVariantImages =
    async (
      productId: string,
      variantId: string,
      variant:
        ColourVariant,
      originalImages:
        ProductImageRow[]
    ) => {
      const retainedExistingIds =
        new Set(
          variant.images
            .filter(
              (
                image
              ): image is ExistingImage =>
                image.kind ===
                "existing"
            )
            .map(
              (image) =>
                image.id
            )
        );

      for (
        const originalImage of
        originalImages
      ) {
        if (
          !retainedExistingIds.has(
            originalImage.id
          )
        ) {
          await deleteExistingImage({
            id:
              originalImage.id,
            kind:
              "existing",
            url:
              originalImage.image_url,
          });
        }
      }

      for (
        let index = 0;
        index <
        variant.images.length;
        index += 1
      ) {
        const image =
          variant.images[index];

        if (
          image.kind ===
          "existing"
        ) {
          const {
            error,
          } =
            await supabase
              .from(
                "product_images"
              )
              .update({
                display_order:
                  index,
              })
              .eq(
                "id",
                image.id
              );

          if (error) {
            throw error;
          }

          continue;
        }

        const extension =
          image.file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const fileName =
          `${crypto.randomUUID()}.${extension}`;

        const filePath = [
          productId,
          variantId,
          fileName,
        ].join("/");

        const {
          error:
            uploadError,
        } =
          await supabase.storage
            .from(
              "product-images"
            )
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

        if (
          uploadError
        ) {
          throw uploadError;
        }

        const {
          data:
            publicUrlData,
        } =
          supabase.storage
            .from(
              "product-images"
            )
            .getPublicUrl(
              filePath
            );

        const {
          error:
            imageError,
        } =
          await supabase
            .from(
              "product_images"
            )
            .insert({
              variant_id:
                variantId,
              image_url:
                publicUrlData.publicUrl,
              display_order:
                index,
            });

        if (
          imageError
        ) {
          await supabase.storage
            .from(
              "product-images"
            )
            .remove([
              filePath,
            ]);

          throw imageError;
        }
      }
    };

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        !id ||
        !validateForm() ||
        isSaving
      ) {
        return;
      }

      setIsSaving(true);

      try {
        const {
          data:
            currentProduct,
          error:
            currentProductError,
        } =
          await supabase
            .from(
              "products"
            )
            .select(`
              id,
              product_variants (
                id,
                product_images (
                  id,
                  image_url,
                  display_order
                )
              )
            `)
            .eq(
              "id",
              id
            )
            .single();

        if (
          currentProductError
        ) {
          throw currentProductError;
        }

        const currentVariants =
          (
            currentProduct
              ?.product_variants ??
            []
          ) as Array<{
            id: string;
            product_images:
              ProductImageRow[] | null;
          }>;

        const currentVariantMap =
          new Map(
            currentVariants.map(
              (variant) => [
                variant.id,
                variant,
              ]
            )
          );

        const {
          error:
            productError,
        } =
          await supabase
            .from(
              "products"
            )
            .update({
              name:
                productName.trim(),

              category,

              state,

              description:
                description.trim(),

              retail_price:
                Number(
                  retailPrice
                ),

              wholesale_price:
                Number(
                  wholesalePrice
                ),

              wholesale_minimum:
                Number(
                  wholesaleMinimum
                ),

              status,

              is_featured:
                isFeatured,

              is_new_arrival:
                isNewArrival,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              id
            );

        if (
          productError
        ) {
          throw productError;
        }

        const retainedVariantIds =
          new Set(
            variants
              .filter(
                (variant) =>
                  variant.databaseId
              )
              .map(
                (variant) =>
                  variant.databaseId as string
              )
          );

        for (
          const currentVariant of
          currentVariants
        ) {
          if (
            retainedVariantIds.has(
              currentVariant.id
            )
          ) {
            continue;
          }

          for (
            const image of
            currentVariant.product_images ??
            []
          ) {
            await deleteExistingImage({
              id:
                image.id,
              kind:
                "existing",
              url:
                image.image_url,
            });
          }

          const {
            error:
              variantDeleteError,
          } =
            await supabase
              .from(
                "product_variants"
              )
              .delete()
              .eq(
                "id",
                currentVariant.id
              );

          if (
            variantDeleteError
          ) {
            throw variantDeleteError;
          }
        }

        for (
          const variant of
          variants
        ) {
          let variantId:
            | string
            | null =
            variant.databaseId;

          if (
            variantId
          ) {
            const {
              error:
                variantUpdateError,
            } =
              await supabase
                .from(
                  "product_variants"
                )
                .update({
                  colour_name:
                    variant.colourName.trim(),

                  colour_code:
                    variant.colourCode,

                  sku:
                    variant.sku.trim(),

                  stock:
                    Number(
                      variant.stock
                    ),
                })
                .eq(
                  "id",
                  variantId
                );

            if (
              variantUpdateError
            ) {
              throw variantUpdateError;
            }
          } else {
            const {
              data:
                newVariant,
              error:
                variantInsertError,
            } =
              await supabase
                .from(
                  "product_variants"
                )
                .insert({
                  product_id:
                    id,

                  colour_name:
                    variant.colourName.trim(),

                  colour_code:
                    variant.colourCode,

                  sku:
                    variant.sku.trim(),

                  stock:
                    Number(
                      variant.stock
                    ),
                })
                .select(
                  "id"
                )
                .single();

            if (
              variantInsertError
            ) {
              throw variantInsertError;
            }

            variantId =
              newVariant?.id ??
              null;
          }

          if (
            !variantId
          ) {
            throw new Error(
              "Variant ID missing."
            );
          }

          const originalImages =
            variant.databaseId
              ? currentVariantMap.get(
                  variant.databaseId
                )
                  ?.product_images ??
                []
              : [];

          await saveVariantImages(
            id,
            variantId,
            variant,
            originalImages
          );
        }

        variants.forEach(
          (variant) => {
            variant.images.forEach(
              (image) => {
                if (
                  image.kind ===
                  "new"
                ) {
                  URL.revokeObjectURL(
                    image.url
                  );
                }
              }
            );
          }
        );

        alert(
          "Product successfully updated!"
        );

        navigate(
          "/admin/products"
        );
      } catch (error) {
        console.error(
          "Product update error:",
          error
        );

        alert(
          `Product update aagala: ${getErrorMessage(
            error
          )}`
        );
      } finally {
        setIsSaving(false);
      }
    };

  if (
    isLoading
  ) {
    return (
      <div className="new-product-page">
        <section className="new-product-card">
          <h2>
            Loading Product...
          </h2>
        </section>
      </div>
    );
  }

  if (
    loadError
  ) {
    return (
      <div className="new-product-page">
        <section className="new-product-card">
          <h2>
            Product load aagala
          </h2>

          <p>
            {loadError}
          </p>

          <button
            type="button"
            className="new-product-save"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
          >
            Back to Products
          </button>
        </section>
      </div>
    );
  }

  return (
    <form
      className="new-product-page"
      onSubmit={
        handleSubmit
      }
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
            disabled={
              isSaving
            }
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1>
              Edit Product
            </h1>

            <p>
              Update product information, prices,
              stock, colours and images.
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
            disabled={
              isSaving
            }
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
              ? "Updating Product..."
              : "Update Product"}
          </button>
        </div>
      </div>

      {categoryError && (
        <div
          style={{
            marginBottom:
              "18px",
            border:
              "1px solid #efc7c2",
            borderRadius:
              "10px",
            background:
              "#fff3f1",
            color:
              "#a13e35",
            padding:
              "12px 14px",
            fontSize:
              "12px",
            fontWeight:
              700,
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
                Edit the general saree details.
              </p>
            </div>

            <div className="new-product-form-grid">
              <div className="new-product-field new-product-full">
                <label htmlFor="edit-product-name">
                  Product Name
                </label>

                <input
                  id="edit-product-name"
                  type="text"
                  value={
                    productName
                  }
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event
                  ) =>
                    setProductName(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="new-product-field">
                <label htmlFor="edit-product-category">
                  Category
                </label>

                <select
                  id="edit-product-category"
                  value={
                    category
                  }
                  disabled={
                    isSaving ||
                    isLoadingCategories
                  }
                  onChange={(
                    event
                  ) =>
                    setCategory(
                      event.target.value
                    )
                  }
                >
                  {categories.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.name
                        }
                      >
                        {
                          item.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="new-product-field">
                <label htmlFor="edit-product-state">
                  State / Union Territory
                </label>

                <select
                  id="edit-product-state"
                  value={
                    state
                  }
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event
                  ) =>
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
                        key={
                          region
                        }
                        value={
                          region
                        }
                      >
                        {region}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="new-product-field">
                <label htmlFor="edit-product-status">
                  Status
                </label>

                <select
                  id="edit-product-status"
                  value={
                    status
                  }
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event
                  ) =>
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
                <label htmlFor="edit-product-description">
                  Description
                </label>

                <textarea
                  id="edit-product-description"
                  rows={6}
                  value={
                    description
                  }
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event
                  ) =>
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
              <h2>
                Pricing
              </h2>

              <p>
                Update retail and wholesale pricing.
              </p>
            </div>

            <div className="new-product-form-grid">
              <div className="new-product-field">
                <label htmlFor="edit-retail-price">
                  Retail Price
                </label>

                <div className="new-product-price-input">
                  <span>
                    ₹
                  </span>

                  <input
                    id="edit-retail-price"
                    type="number"
                    min="0"
                    value={
                      retailPrice
                    }
                    disabled={
                      isSaving
                    }
                    onChange={(
                      event
                    ) =>
                      setRetailPrice(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="new-product-field">
                <label htmlFor="edit-wholesale-price">
                  Wholesale Price
                </label>

                <div className="new-product-price-input">
                  <span>
                    ₹
                  </span>

                  <input
                    id="edit-wholesale-price"
                    type="number"
                    min="0"
                    value={
                      wholesalePrice
                    }
                    disabled={
                      isSaving
                    }
                    onChange={(
                      event
                    ) =>
                      setWholesalePrice(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="new-product-field">
                <label htmlFor="edit-wholesale-minimum">
                  Wholesale Minimum Quantity
                </label>

                <input
                  id="edit-wholesale-minimum"
                  type="number"
                  min="1"
                  value={
                    wholesaleMinimum
                  }
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event
                  ) =>
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
                  Colours &amp; Images
                </h2>

                <p>
                  Existing images retain/remove pannalam.
                  Pudhu images-um add pannalam.
                </p>
              </div>

              <button
                type="button"
                className="add-colour-button"
                onClick={
                  addVariant
                }
                disabled={
                  isSaving
                }
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
                    key={
                      variant.localId
                    }
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
                              "Colour variant"}
                          </small>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="remove-colour-button"
                        disabled={
                          isSaving
                        }
                        onClick={() =>
                          removeVariant(
                            variant.localId
                          )
                        }
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
                              variant.localId,
                              "colourName",
                              event.target.value
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
                                variant.localId,
                                "colourCode",
                                event.target.value
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
                                variant.localId,
                                "colourCode",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="new-product-field">
                        <label>
                          SKU
                        </label>

                        <input
                          type="text"
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
                              variant.localId,
                              "sku",
                              event.target.value
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
                              variant.localId,
                              "stock",
                              event.target.value
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
                        </div>

                        <span>
                          {variant.images.length} image
                          {variant.images.length ===
                          1
                            ? ""
                            : "s"}
                        </span>
                      </div>

                      <label className="variant-image-upload">
                        <FiUploadCloud />

                        <strong>
                          Add Images
                        </strong>

                        <small>
                          JPG, PNG or WEBP. Multiple files allowed.
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
                              variant.localId,
                              event
                            )
                          }
                        />
                      </label>

                      {variant.images.length >
                      0 ? (
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
                                    image.url
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
                                      variant.localId,
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
                            No images for this colour.
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
              disabled={
                isSaving
              }
              onClick={
                addVariant
              }
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
                checked={
                  isFeatured
                }
                disabled={
                  isSaving
                }
                onChange={(
                  event
                ) =>
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
                  Display this product in featured collections.
                </span>
              </div>
            </label>

            <label className="new-product-checkbox">
              <input
                type="checkbox"
                checked={
                  isNewArrival
                }
                disabled={
                  isSaving
                }
                onChange={(
                  event
                ) =>
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
                  Show a new arrival badge on the website.
                </span>
              </div>
            </label>
          </section>

          <section className="new-product-card product-summary-card">
            <h2>
              Product Summary
            </h2>

            <div>
              <span>
                Colours
              </span>

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
                    variant.images.length,
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
              ? "Updating Product..."
              : "Update Product"}
          </button>
        </aside>
      </div>
    </form>
  );
}