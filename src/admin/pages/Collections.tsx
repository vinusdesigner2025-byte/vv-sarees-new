import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  FiCalendar,
  FiEdit2,
  FiLayers,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

import "../css/Collections.css";

type CollectionStatus =
  | "active"
  | "scheduled"
  | "hidden";

type CollectionType =
  | "manual"
  | "automatic";

type AutomaticRule =
  | "new-arrival"
  | "featured"
  | "category"
  | "price-below"
  | "price-above";

type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: CollectionType;
  automaticRule: AutomaticRule;
  ruleValue: string;
  imageName: string;
  imagePreview: string;
  imagePath: string;
  startDate: string;
  endDate: string;
  isFeatured: boolean;
  sortOrder: number;
  status: CollectionStatus;
};

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: CollectionType;
  automatic_rule: AutomaticRule | null;
  rule_value: string | null;
  image_name: string | null;
  image_url: string | null;
  image_path: string | null;
  start_date: string | null;
  end_date: string | null;
  is_featured: boolean;
  sort_order: number;
  status: CollectionStatus;
};

type CollectionFormState = {
  name: string;
  slug: string;
  description: string;
  type: CollectionType;
  automaticRule: AutomaticRule;
  ruleValue: string;
  imageFile: File | null;
  imageName: string;
  imagePreview: string;
  imagePath: string;
  startDate: string;
  endDate: string;
  isFeatured: boolean;
  sortOrder: string;
  status: CollectionStatus;
};

const emptyForm: CollectionFormState = {
  name: "",
  slug: "",
  description: "",
  type: "manual",
  automaticRule: "new-arrival",
  ruleValue: "",
  imageFile: null,
  imageName: "",
  imagePreview: "",
  imagePath: "",
  startDate: "",
  endDate: "",
  isFeatured: false,
  sortOrder: "0",
  status: "active",
};

const createSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

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

export default function Collections() {
  const [collections, setCollections] =
    useState<Collection[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | CollectionStatus>("all");

  const [typeFilter, setTypeFilter] =
    useState<"all" | CollectionType>("all");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    editingCollectionId,
    setEditingCollectionId,
  ] = useState<string | null>(null);

  const [form, setForm] =
    useState<CollectionFormState>(emptyForm);

  const loadCollections = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("collections")
      .select(`
        id,
        name,
        slug,
        description,
        type,
        automatic_rule,
        rule_value,
        image_name,
        image_url,
        image_path,
        start_date,
        end_date,
        is_featured,
        sort_order,
        status
      `)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Collections fetch error:",
        error
      );

      setErrorMessage(
        `Collections load aagala: ${error.message}`
      );

      setCollections([]);
      setIsLoading(false);
      return;
    }

    const formattedCollections: Collection[] =
      ((data ?? []) as CollectionRow[]).map(
        (collection) => ({
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          description:
            collection.description ?? "",
          type: collection.type,
          automaticRule:
            collection.automatic_rule ??
            "new-arrival",
          ruleValue:
            collection.rule_value ?? "",
          imageName:
            collection.image_name ?? "",
          imagePreview:
            collection.image_url ?? "",
          imagePath:
            collection.image_path ?? "",
          startDate:
            collection.start_date ?? "",
          endDate:
            collection.end_date ?? "",
          isFeatured:
            collection.is_featured ?? false,
          sortOrder:
            Number(collection.sort_order ?? 0),
          status: collection.status,
        })
      );

    setCollections(formattedCollections);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadCollections();
  }, []);

  const filteredCollections = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return collections.filter((collection) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        collection.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        collection.slug
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        collection.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        collection.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    collections,
    searchTerm,
    statusFilter,
    typeFilter,
  ]);

  const activeCount = useMemo(
    () =>
      collections.filter(
        (collection) =>
          collection.status === "active"
      ).length,
    [collections]
  );

  const scheduledCount = useMemo(
    () =>
      collections.filter(
        (collection) =>
          collection.status === "scheduled"
      ).length,
    [collections]
  );

  const featuredCount = useMemo(
    () =>
      collections.filter(
        (collection) =>
          collection.isFeatured
      ).length,
    [collections]
  );

  const revokePreview = (preview: string) => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
  };

  const resetForm = () => {
    revokePreview(form.imagePreview);
    setForm(emptyForm);
    setEditingCollectionId(null);
  };

  const openAddModal = () => {
    resetForm();
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (
    collection: Collection
  ) => {
    resetForm();

    setEditingCollectionId(collection.id);

    setForm({
      name: collection.name,
      slug: collection.slug,
      description:
        collection.description,
      type: collection.type,
      automaticRule:
        collection.automaticRule,
      ruleValue: collection.ruleValue,
      imageFile: null,
      imageName: collection.imageName,
      imagePreview:
        collection.imagePreview,
      imagePath: collection.imagePath,
      startDate: collection.startDate,
      endDate: collection.endDate,
      isFeatured:
        collection.isFeatured,
      sortOrder: String(
        collection.sortOrder
      ),
      status: collection.status,
    });

    setErrorMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;

    revokePreview(form.imagePreview);
    setIsModalOpen(false);
    setEditingCollectionId(null);
    setForm(emptyForm);
  };

  const handleNameChange = (
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        editingCollectionId === null
          ? createSlug(value)
          : current.slug,
    }));
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      ![
        "image/png",
        "image/jpeg",
        "image/webp",
      ].includes(file.type)
    ) {
      alert(
        "PNG, JPG or WEBP image select pannu."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Image 5 MB-kulla irukanum."
      );

      event.target.value = "";
      return;
    }

    setForm((current) => {
      revokePreview(
        current.imagePreview
      );

      return {
        ...current,
        imageFile: file,
        imageName: file.name,
        imagePreview:
          URL.createObjectURL(file),
      };
    });

    event.target.value = "";
  };

  const removeImage = () => {
    setForm((current) => {
      revokePreview(
        current.imagePreview
      );

      return {
        ...current,
        imageFile: null,
        imageName: "",
        imagePreview: "",
        imagePath: "",
      };
    });
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSaving) return;

    const name = form.name.trim();

    const slug = createSlug(
      form.slug || form.name
    );

    if (!name) {
      alert(
        "Collection name is required."
      );
      return;
    }

    if (!slug) {
      alert(
        "Valid collection slug is required."
      );
      return;
    }

    if (!form.imagePreview) {
      alert(
        "Collection banner image is required."
      );
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      alert(
        "End date cannot be before start date."
      );
      return;
    }

    if (
      form.type === "automatic" &&
      (
        form.automaticRule ===
          "category" ||
        form.automaticRule ===
          "price-below" ||
        form.automaticRule ===
          "price-above"
      ) &&
      !form.ruleValue.trim()
    ) {
      alert(
        "Automatic rule value is required."
      );
      return;
    }

    const duplicateSlug =
      collections.some(
        (collection) =>
          collection.slug === slug &&
          collection.id !==
            editingCollectionId
      );

    if (duplicateSlug) {
      alert(
        "This collection slug already exists."
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    let uploadedImagePath = "";
    let imageUrlToSave =
      form.imagePreview;
    let imageNameToSave =
      form.imageName;
    let imagePathToSave =
      form.imagePath;

    try {
      if (form.imageFile) {
        const extension =
          form.imageFile.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const folderName =
          editingCollectionId ??
          crypto.randomUUID();

        uploadedImagePath =
          `${folderName}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("collection-images")
            .upload(
              uploadedImagePath,
              form.imageFile,
              {
                cacheControl:
                  "3600",
                upsert: false,
                contentType:
                  form.imageFile.type,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("collection-images")
          .getPublicUrl(
            uploadedImagePath
          );

        imageUrlToSave =
          publicUrlData.publicUrl;

        imageNameToSave =
          form.imageFile.name;

        imagePathToSave =
          uploadedImagePath;
      }

      const payload = {
        name,
        slug,
        description:
          form.description.trim(),
        type: form.type,
        automatic_rule:
          form.type === "automatic"
            ? form.automaticRule
            : null,
        rule_value:
          form.type === "automatic"
            ? form.ruleValue.trim()
            : "",
        image_name:
          imageNameToSave,
        image_url:
          imageUrlToSave,
        image_path:
          imagePathToSave,
        start_date:
          form.startDate || null,
        end_date:
          form.endDate || null,
        is_featured:
          form.isFeatured,
        sort_order: Math.max(
          0,
          Number(
            form.sortOrder || 0
          )
        ),
        status:
          form.status,
        updated_at:
          new Date().toISOString(),
      };

      if (editingCollectionId) {
        const existingCollection =
          collections.find(
            (collection) =>
              collection.id ===
              editingCollectionId
          );

        const { error: updateError } =
          await supabase
            .from("collections")
            .update(payload)
            .eq(
              "id",
              editingCollectionId
            );

        if (updateError) {
          throw updateError;
        }

        if (
          uploadedImagePath &&
          existingCollection?.imagePath &&
          existingCollection.imagePath !==
            uploadedImagePath
        ) {
          await supabase.storage
            .from("collection-images")
            .remove([
              existingCollection.imagePath,
            ]);
        }
      } else {
        const { error: insertError } =
          await supabase
            .from("collections")
            .insert(payload);

        if (insertError) {
          throw insertError;
        }
      }

      revokePreview(
        form.imagePreview
      );

      setIsModalOpen(false);
      setEditingCollectionId(null);
      setForm(emptyForm);

      await loadCollections();

      alert(
        editingCollectionId
          ? "Collection successfully updated!"
          : "Collection successfully saved!"
      );
    } catch (error) {
      console.error(
        "Collection save error:",
        error
      );

      if (uploadedImagePath) {
        await supabase.storage
          .from("collection-images")
          .remove([
            uploadedImagePath,
          ]);
      }

      setErrorMessage(
        `Collection save aagala: ${getErrorMessage(
          error
        )}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (
    collectionId: string
  ) => {
    const collectionToDelete =
      collections.find(
        (collection) =>
          collection.id ===
          collectionId
      );

    const shouldDelete =
      window.confirm(
        "Are you sure you want to delete this collection?"
      );

    if (
      !shouldDelete ||
      !collectionToDelete
    ) {
      return;
    }

    setDeletingId(collectionId);
    setErrorMessage("");

    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (error) {
      console.error(
        "Collection delete error:",
        error
      );

      setErrorMessage(
        `Collection delete aagala: ${error.message}`
      );

      setDeletingId(null);
      return;
    }

    if (
      collectionToDelete.imagePath
    ) {
      await supabase.storage
        .from("collection-images")
        .remove([
          collectionToDelete.imagePath,
        ]);
    }

    setCollections((current) =>
      current.filter(
        (collection) =>
          collection.id !==
          collectionId
      )
    );

    setDeletingId(null);

    alert(
      "Collection successfully deleted!"
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const getRuleLabel = (
    collection: Collection
  ) => {
    if (collection.type === "manual") {
      return "Products selected manually";
    }

    if (
      collection.automaticRule ===
      "new-arrival"
    ) {
      return "Automatically includes new arrivals";
    }

    if (
      collection.automaticRule ===
      "featured"
    ) {
      return "Automatically includes featured products";
    }

    if (
      collection.automaticRule ===
      "category"
    ) {
      return `Category: ${
        collection.ruleValue ||
        "Not set"
      }`;
    }

    if (
      collection.automaticRule ===
      "price-below"
    ) {
      return `Price below ₹${
        collection.ruleValue ||
        "0"
      }`;
    }

    return `Price above ₹${
      collection.ruleValue ||
      "0"
    }`;
  };

  return (
    <div className="collections-page">
      <div className="collections-breadcrumb">
        <span>Catalogue</span>
        <span>/</span>
        <strong>Collections</strong>
      </div>

      <header className="collections-header">
        <div>
          <h1>Collections</h1>

          <p>
            Create curated and automatic
            product collections for the
            storefront.
          </p>
        </div>

        <button
          type="button"
          className="collections-add-button"
          onClick={openAddModal}
        >
          <FiPlus />
          Create Collection
        </button>
      </header>

      {errorMessage && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            border:
              "1px solid #efc7c2",
            borderRadius: "10px",
            background: "#fff3f1",
            color: "#a13e35",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {errorMessage}
        </div>
      )}

      <section className="collections-summary-grid">
        <article className="collection-summary-card">
          <FiLayers />

          <div>
            <span>Total Collections</span>
            <strong>
              {collections.length}
            </strong>
          </div>
        </article>

        <article className="collection-summary-card">
          <FiStar />

          <div>
            <span>Featured</span>
            <strong>
              {featuredCount}
            </strong>
          </div>
        </article>

        <article className="collection-summary-card">
          <FiLayers />

          <div>
            <span>Active</span>
            <strong>
              {activeCount}
            </strong>
          </div>
        </article>

        <article className="collection-summary-card">
          <FiCalendar />

          <div>
            <span>Scheduled</span>
            <strong>
              {scheduledCount}
            </strong>
          </div>
        </article>
      </section>

      <section className="collections-content-card">
        <div className="collections-toolbar">
          <div className="collections-search">
            <FiSearch />

            <input
              type="search"
              placeholder="Search collection name or slug..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value as
                  | "all"
                  | CollectionType
              )
            }
            aria-label="Filter by collection type"
          >
            <option value="all">
              All Types
            </option>

            <option value="manual">
              Manual
            </option>

            <option value="automatic">
              Automatic
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | CollectionStatus
              )
            }
            aria-label="Filter by status"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="scheduled">
              Scheduled
            </option>

            <option value="hidden">
              Hidden
            </option>
          </select>
        </div>

        {isLoading ? (
          <div className="collections-empty-state">
            <div className="collections-empty-icon">
              <FiLayers />
            </div>

            <h2>
              Loading collections...
            </h2>

            <p>
              Supabase-la irundhu
              collections load aaguthu.
            </p>
          </div>
        ) : collections.length === 0 ? (
          <div className="collections-empty-state">
            <div className="collections-empty-icon">
              <FiLayers />
            </div>

            <h2>
              No collections created yet
            </h2>

            <p>
              Create manual or automatic
              collections such as New
              Arrivals, Best Sellers,
              Wedding or Festival
              Collections.
            </p>

            <button
              type="button"
              onClick={openAddModal}
            >
              <FiPlus />
              Create First Collection
            </button>
          </div>
        ) : filteredCollections.length ===
          0 ? (
          <div className="collections-empty-state">
            <div className="collections-empty-icon">
              <FiSearch />
            </div>

            <h2>
              No matching collections
            </h2>

            <p>
              Change your search text or
              clear the selected filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="collections-list">
            {filteredCollections.map(
              (collection) => (
                <article
                  className="collection-banner-card"
                  key={collection.id}
                >
                  <div className="collection-banner-image">
                    <img
                      src={
                        collection.imagePreview
                      }
                      alt={
                        collection.name
                      }
                    />

                    {collection.isFeatured && (
                      <span className="collection-featured-badge">
                        <FiStar />
                        Featured
                      </span>
                    )}

                    <span
                      className={`collection-card-status collection-card-status-${collection.status}`}
                    >
                      {collection.status}
                    </span>
                  </div>

                  <div className="collection-banner-content">
                    <div className="collection-banner-heading">
                      <div>
                        <h2>
                          {
                            collection.name
                          }
                        </h2>

                        <span>
                          /
                          {
                            collection.slug
                          }
                        </span>
                      </div>

                      <span
                        className={`collection-type-badge collection-type-${collection.type}`}
                      >
                        {collection.type ===
                        "manual"
                          ? "Manual"
                          : "Automatic"}
                      </span>
                    </div>

                    <p>
                      {collection.description ||
                        "No description added."}
                    </p>

                    <div className="collection-rule-box">
                      <strong>
                        Collection rule
                      </strong>

                      <span>
                        {getRuleLabel(
                          collection
                        )}
                      </span>
                    </div>

                    <div className="collection-meta-grid">
                      <div>
                        <span>
                          Start Date
                        </span>

                        <strong>
                          {collection.startDate ||
                            "Not set"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          End Date
                        </span>

                        <strong>
                          {collection.endDate ||
                            "Not set"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Sort Order
                        </span>

                        <strong>
                          {
                            collection.sortOrder
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="collection-card-actions">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            collection
                          )
                        }
                        disabled={
                          deletingId ===
                          collection.id
                        }
                      >
                        <FiEdit2 />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="collection-delete-button"
                        onClick={() =>
                          void handleDelete(
                            collection.id
                          )
                        }
                        disabled={
                          deletingId ===
                          collection.id
                        }
                      >
                        <FiTrash2 />
                        {deletingId ===
                        collection.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div
          className="collection-modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="collection-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="collection-modal-header">
              <div>
                <h2>
                  {editingCollectionId
                    ? "Edit Collection"
                    : "Create Collection"}
                </h2>

                <p>
                  Configure storefront
                  collection details and
                  product rules.
                </p>
              </div>

              <button
                type="button"
                className="collection-modal-close"
                onClick={closeModal}
                aria-label="Close form"
                disabled={isSaving}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="collection-form-grid">
                <div className="collection-form-field">
                  <label htmlFor="collection-name">
                    Collection Name
                  </label>

                  <input
                    id="collection-name"
                    type="text"
                    placeholder="Example: New Arrivals"
                    value={form.name}
                    disabled={isSaving}
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="collection-form-field">
                  <label htmlFor="collection-slug">
                    Slug
                  </label>

                  <input
                    id="collection-slug"
                    type="text"
                    placeholder="new-arrivals"
                    value={form.slug}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: createSlug(
                          event.target.value
                        ),
                      }))
                    }
                  />
                </div>

                <div className="collection-form-field collection-form-full">
                  <label htmlFor="collection-description">
                    Description
                  </label>

                  <textarea
                    id="collection-description"
                    rows={4}
                    placeholder="Describe this collection..."
                    value={form.description}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="collection-form-field collection-form-full">
                  <label>
                    Collection Banner
                  </label>

                  {form.imagePreview ? (
                    <div className="collection-image-preview">
                      <img
                        src={
                          form.imagePreview
                        }
                        alt="Collection banner preview"
                      />

                      <div className="collection-image-actions">
                        <label>
                          <FiUploadCloud />
                          Change Image

                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            disabled={
                              isSaving
                            }
                            onChange={
                              handleImageChange
                            }
                          />
                        </label>

                        <button
                          type="button"
                          onClick={
                            removeImage
                          }
                          disabled={
                            isSaving
                          }
                        >
                          <FiTrash2 />
                          Remove
                        </button>
                      </div>

                      <span>
                        {
                          form.imageName
                        }
                      </span>
                    </div>
                  ) : (
                    <label className="collection-image-upload">
                      <FiUploadCloud />

                      <strong>
                        Upload Collection Banner
                      </strong>

                      <small>
                        Landscape image
                        recommended. PNG,
                        JPG or WEBP below
                        5 MB.
                      </small>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={
                          isSaving
                        }
                        onChange={
                          handleImageChange
                        }
                      />
                    </label>
                  )}
                </div>

                <div className="collection-form-field">
                  <label htmlFor="collection-type">
                    Collection Type
                  </label>

                  <select
                    id="collection-type"
                    value={form.type}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type:
                          event.target
                            .value as CollectionType,
                      }))
                    }
                  >
                    <option value="manual">
                      Manual
                    </option>

                    <option value="automatic">
                      Automatic
                    </option>
                  </select>
                </div>

                {form.type === "manual" ? (
                  <div className="collection-form-note">
                    <strong>
                      Manual Collection
                    </strong>

                    <span>
                      Products can be
                      selected later.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="collection-form-field">
                      <label htmlFor="automatic-rule">
                        Automatic Rule
                      </label>

                      <select
                        id="automatic-rule"
                        value={
                          form.automaticRule
                        }
                        disabled={isSaving}
                        onChange={(event) =>
                          setForm(
                            (current) => ({
                              ...current,
                              automaticRule:
                                event.target
                                  .value as AutomaticRule,
                              ruleValue:
                                "",
                            })
                          )
                        }
                      >
                        <option value="new-arrival">
                          New Arrival
                          Products
                        </option>

                        <option value="featured">
                          Featured Products
                        </option>

                        <option value="category">
                          Product Category
                        </option>

                        <option value="price-below">
                          Price Below
                        </option>

                        <option value="price-above">
                          Price Above
                        </option>
                      </select>
                    </div>

                    {(form.automaticRule ===
                      "category" ||
                      form.automaticRule ===
                        "price-below" ||
                      form.automaticRule ===
                        "price-above") && (
                      <div className="collection-form-field">
                        <label htmlFor="rule-value">
                          {form.automaticRule ===
                          "category"
                            ? "Category Name"
                            : "Price Value"}
                        </label>

                        <input
                          id="rule-value"
                          type={
                            form.automaticRule ===
                            "category"
                              ? "text"
                              : "number"
                          }
                          min={
                            form.automaticRule ===
                            "category"
                              ? undefined
                              : "0"
                          }
                          placeholder={
                            form.automaticRule ===
                            "category"
                              ? "Example: Khadi Cotton"
                              : "Example: 1000"
                          }
                          value={
                            form.ruleValue
                          }
                          disabled={
                            isSaving
                          }
                          onChange={(event) =>
                            setForm(
                              (current) => ({
                                ...current,
                                ruleValue:
                                  event.target
                                    .value,
                              })
                            )
                          }
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="collection-form-field">
                  <label htmlFor="collection-start">
                    Start Date
                  </label>

                  <input
                    id="collection-start"
                    type="date"
                    value={
                      form.startDate
                    }
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        startDate:
                          event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="collection-form-field">
                  <label htmlFor="collection-end">
                    End Date
                  </label>

                  <input
                    id="collection-end"
                    type="date"
                    value={
                      form.endDate
                    }
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        endDate:
                          event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="collection-form-field">
                  <label htmlFor="collection-order">
                    Display Order
                  </label>

                  <input
                    id="collection-order"
                    type="number"
                    min="0"
                    value={
                      form.sortOrder
                    }
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sortOrder:
                          event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="collection-form-field">
                  <label htmlFor="collection-status">
                    Status
                  </label>

                  <select
                    id="collection-status"
                    value={form.status}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status:
                          event.target
                            .value as CollectionStatus,
                      }))
                    }
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="scheduled">
                      Scheduled
                    </option>

                    <option value="hidden">
                      Hidden
                    </option>
                  </select>
                </div>

                <label className="collection-featured-toggle collection-form-full">
                  <input
                    type="checkbox"
                    checked={
                      form.isFeatured
                    }
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isFeatured:
                          event.target.checked,
                      }))
                    }
                  />

                  <div>
                    <strong>
                      Featured Collection
                    </strong>

                    <span>
                      Display this
                      collection prominently
                      on the website.
                    </span>
                  </div>
                </label>
              </div>

              <div className="collection-modal-actions">
                <button
                  type="button"
                  className="collection-cancel-button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="collection-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingCollectionId
                      ? "Update Collection"
                      : "Save Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}