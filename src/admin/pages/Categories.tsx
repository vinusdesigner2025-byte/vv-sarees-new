import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  FiEdit2,
  FiFolder,
  FiImage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import "../css/Categories.css";

type CategoryStatus = "active" | "hidden";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageName: string;
  imagePreview: string;
  imagePath: string;
  status: CategoryStatus;
};

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  imageFile: File | null;
  imageName: string;
  imagePreview: string;
  imagePath: string;
  status: CategoryStatus;
};

const emptyForm: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  imageFile: null,
  imageName: "",
  imagePreview: "",
  imagePath: "",
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

const getMessage = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "message" in error
    ? String(error.message)
    : "Unknown error";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | CategoryStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] =
    useState<string | null>(null);
  const [form, setForm] =
    useState<CategoryFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCategories = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Categories fetch error:", error);
      setErrorMessage(`Categories load aagala: ${error.message}`);
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setCategories(
      (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description ?? "",
        imageName: row.image_name ?? "",
        imagePreview: row.image_url ?? "",
        imagePath: row.image_path ?? "",
        status: (row.status ?? "active") as CategoryStatus,
      }))
    );
    setIsLoading(false);
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !search ||
        category.name.toLowerCase().includes(search) ||
        category.slug.toLowerCase().includes(search);
      const matchesStatus =
        statusFilter === "all" ||
        category.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const revokeBlob = (url: string) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const openAddModal = () => {
    revokeBlob(form.imagePreview);
    setEditingCategoryId(null);
    setForm(emptyForm);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    revokeBlob(form.imagePreview);
    setEditingCategoryId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageFile: null,
      imageName: category.imageName,
      imagePreview: category.imagePreview,
      imagePath: category.imagePath,
      status: category.status,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    revokeBlob(form.imagePreview);
    setIsModalOpen(false);
    setEditingCategoryId(null);
    setForm(emptyForm);
  };

  const handleNameChange = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        editingCategoryId === null
          ? createSlug(value)
          : current.slug,
    }));
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !["image/png", "image/jpeg", "image/webp"].includes(
        file.type
      )
    ) {
      alert("PNG, JPG or WEBP image mattum select pannu.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image 5 MB-kulla irukanum.");
      event.target.value = "";
      return;
    }

    setForm((current) => {
      revokeBlob(current.imagePreview);
      return {
        ...current,
        imageFile: file,
        imageName: file.name,
        imagePreview: URL.createObjectURL(file),
      };
    });

    event.target.value = "";
  };

  const removeImage = () => {
    setForm((current) => {
      revokeBlob(current.imagePreview);
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
    const slug = createSlug(form.slug || form.name);

    if (!name) return alert("Category name is required.");
    if (!slug) return alert("Valid category slug is required.");
    if (!form.imagePreview)
      return alert("Category image is required.");

    if (
      categories.some(
        (category) =>
          category.slug === slug &&
          category.id !== editingCategoryId
      )
    ) {
      return alert("This category slug already exists.");
    }

    setIsSaving(true);
    setErrorMessage("");

    let uploadedPath = "";
    let imageUrl = form.imagePreview;
    let imagePath = form.imagePath;
    let imageName = form.imageName;

    try {
      if (form.imageFile) {
        const extension =
          form.imageFile.name.split(".").pop()?.toLowerCase() ||
          "jpg";
        const folder =
          editingCategoryId ?? crypto.randomUUID();
        uploadedPath = `${folder}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("category-images")
          .upload(uploadedPath, form.imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: form.imageFile.type,
          });

        if (uploadError) throw uploadError;

        imageUrl = supabase.storage
          .from("category-images")
          .getPublicUrl(uploadedPath).data.publicUrl;
        imagePath = uploadedPath;
        imageName = form.imageFile.name;
      }

      const payload = {
        name,
        slug,
        description: form.description.trim(),
        image_name: imageName,
        image_url: imageUrl,
        image_path: imagePath,
        status: form.status,
        updated_at: new Date().toISOString(),
      };

      if (editingCategoryId) {
        const oldCategory = categories.find(
          (category) => category.id === editingCategoryId
        );

        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategoryId);

        if (error) throw error;

        if (
          uploadedPath &&
          oldCategory?.imagePath &&
          oldCategory.imagePath !== uploadedPath
        ) {
          await supabase.storage
            .from("category-images")
            .remove([oldCategory.imagePath]);
        }
      } else {
        const { error } = await supabase
          .from("categories")
          .insert(payload);

        if (error) throw error;
      }

      revokeBlob(form.imagePreview);
      setIsModalOpen(false);
      setEditingCategoryId(null);
      setForm(emptyForm);
      await loadCategories();
      alert(
        editingCategoryId
          ? "Category successfully updated!"
          : "Category successfully saved!"
      );
    } catch (error) {
      console.error("Category save error:", error);

      if (uploadedPath) {
        await supabase.storage
          .from("category-images")
          .remove([uploadedPath]);
      }

      setErrorMessage(
        `Category save aagala: ${getMessage(error)}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category?"
      )
    ) {
      return;
    }

    setDeletingId(category.id);
    setErrorMessage("");

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setErrorMessage(`Category delete aagala: ${error.message}`);
      setDeletingId(null);
      return;
    }

    if (category.imagePath) {
      await supabase.storage
        .from("category-images")
        .remove([category.imagePath]);
    }

    setCategories((current) =>
      current.filter((item) => item.id !== category.id)
    );
    setDeletingId(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="categories-page">
      <div className="categories-breadcrumb">
        <span>Catalogue</span>
        <span>/</span>
        <strong>Categories</strong>
      </div>

      <header className="categories-header">
        <div>
          <h1>Categories</h1>
          <p>
            Organise products by saree type such as Khadi
            Cotton, Silk and Linen Cotton.
          </p>
        </div>

        <button
          type="button"
          className="categories-add-button"
          onClick={openAddModal}
        >
          <FiPlus />
          Add Category
        </button>
      </header>

      {errorMessage && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            border: "1px solid #efc7c2",
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

      <section className="categories-content-card">
        <div className="categories-toolbar">
          <div className="categories-search">
            <FiSearch />
            <input
              type="search"
              placeholder="Search category name or slug..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | CategoryStatus
              )
            }
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {isLoading ? (
          <div className="categories-empty-state">
            <div className="categories-empty-icon">
              <FiFolder />
            </div>
            <h2>Loading categories...</h2>
            <p>Supabase-la irundhu categories load aaguthu.</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="categories-empty-state">
            <div className="categories-empty-icon">
              <FiFolder />
            </div>
            <h2>No categories added yet</h2>
            <p>
              Add product categories such as Khadi Cotton,
              Silk, Tissue and Linen Cotton.
            </p>
            <button type="button" onClick={openAddModal}>
              <FiPlus />
              Add First Category
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="categories-empty-state">
            <div className="categories-empty-icon">
              <FiSearch />
            </div>
            <h2>No matching categories</h2>
            <p>
              Change the search term or remove the status
              filter.
            </p>
            <button type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="categories-grid">
            {filteredCategories.map((category) => (
              <article className="category-card" key={category.id}>
                <div className="category-card-image">
                  {category.imagePreview ? (
                    <img
                      src={category.imagePreview}
                      alt={category.name}
                    />
                  ) : (
                    <FiImage />
                  )}
                </div>

                <div className="category-card-body">
                  <div className="category-card-top">
                    <div>
                      <h2>{category.name}</h2>
                      <span>/{category.slug}</span>
                    </div>
                    <span
                      className={`category-status category-status-${category.status}`}
                    >
                      {category.status === "active"
                        ? "Active"
                        : "Hidden"}
                    </span>
                  </div>

                  <p>
                    {category.description ||
                      "No description added."}
                  </p>

                  <div className="category-card-actions">
                    <button
                      type="button"
                      onClick={() => openEditModal(category)}
                      disabled={deletingId === category.id}
                    >
                      <FiEdit2 />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="category-delete-button"
                      onClick={() => void handleDelete(category)}
                      disabled={deletingId === category.id}
                    >
                      <FiTrash2 />
                      {deletingId === category.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div
          className="category-modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="category-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="category-modal-header">
              <div>
                <h2>
                  {editingCategoryId
                    ? "Edit Category"
                    : "Add Category"}
                </h2>
                <p>Add category details and a cover image.</p>
              </div>

              <button
                type="button"
                className="category-modal-close"
                onClick={closeModal}
                disabled={isSaving}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="category-form-grid">
                <div className="category-form-field">
                  <label htmlFor="category-name">
                    Category Name
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    placeholder="Example: Khadi Cotton"
                    value={form.name}
                    disabled={isSaving}
                    onChange={(event) =>
                      handleNameChange(event.target.value)
                    }
                  />
                </div>

                <div className="category-form-field">
                  <label htmlFor="category-slug">Slug</label>
                  <input
                    id="category-slug"
                    type="text"
                    placeholder="khadi-cotton"
                    value={form.slug}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: createSlug(event.target.value),
                      }))
                    }
                  />
                </div>

                <div className="category-form-field category-form-full">
                  <label htmlFor="category-description">
                    Description
                  </label>
                  <textarea
                    id="category-description"
                    rows={4}
                    placeholder="Write a short category description..."
                    value={form.description}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="category-form-field category-form-full">
                  <label>Category Image</label>

                  {form.imagePreview ? (
                    <div className="category-image-preview">
                      <img
                        src={form.imagePreview}
                        alt="Category preview"
                      />

                      <div className="category-image-preview-overlay">
                        <label>
                          <FiUploadCloud />
                          Change Image
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            disabled={isSaving}
                            onChange={handleImageChange}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={removeImage}
                          disabled={isSaving}
                        >
                          <FiTrash2 />
                          Remove
                        </button>
                      </div>

                      <span>{form.imageName}</span>
                    </div>
                  ) : (
                    <label className="category-image-upload">
                      <FiUploadCloud />
                      <strong>Upload Category Image</strong>
                      <small>
                        PNG, JPG or WEBP. Maximum 5 MB.
                      </small>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={isSaving}
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>

                <div className="category-form-field">
                  <label htmlFor="category-status">Status</label>
                  <select
                    id="category-status"
                    value={form.status}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status:
                          event.target.value as CategoryStatus,
                      }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="category-modal-actions">
                <button
                  type="button"
                  className="category-cancel-button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="category-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingCategoryId
                      ? "Update Category"
                      : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}