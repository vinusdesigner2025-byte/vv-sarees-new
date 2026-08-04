import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FiEdit2,
  FiEye,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

import "../css/Products.css";

type ProductStatus =
  | "active"
  | "draft"
  | "out-of-stock";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  collection: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  status: ProductStatus;
  imageUrl: string;
};

type SummaryFilter =
  | "all"
  | ProductStatus;

type ProductImageRow = {
  image_url: string;
  display_order: number;
};

type ProductVariantRow = {
  sku: string;
  stock: number;
  product_images:
    | ProductImageRow[]
    | null;
};

type ProductRow = {
  id: string;
  name: string;
  category: string;
  collection: string | null;
  retail_price: number;
  wholesale_price: number;
  status: string;
  product_variants:
    | ProductVariantRow[]
    | null;
};

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [
    collectionFilter,
    setCollectionFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<SummaryFilter>("all");

  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } =
      await supabase
        .from("products")
        .select(`
          id,
          name,
          category,
          collection,
          retail_price,
          wholesale_price,
          status,
          created_at,
          product_variants (
            sku,
            stock,
            product_images (
              image_url,
              display_order
            )
          )
        `)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Products fetch error:",
        error
      );

      setErrorMessage(
        `Products load aagala: ${error.message}`
      );

      setProducts([]);
      setIsLoading(false);
      return;
    }

    const formattedProducts: Product[] =
      ((data ?? []) as ProductRow[]).map(
        (product) => {
          const variants =
            product.product_variants ??
            [];

          const totalStock =
            variants.reduce(
              (total, variant) =>
                total +
                Number(
                  variant.stock ?? 0
                ),
              0
            );

          const firstVariant =
            variants[0];

          const allImages =
            variants.flatMap(
              (variant) =>
                variant.product_images ??
                []
            );

          const sortedImages =
            [...allImages].sort(
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

          let productStatus:
            ProductStatus;

          if (totalStock === 0) {
            productStatus =
              "out-of-stock";
          } else if (
            product.status === "draft"
          ) {
            productStatus = "draft";
          } else {
            productStatus = "active";
          }

          return {
            id: product.id,
            name: product.name,
            sku:
              firstVariant?.sku ?? "",
            category:
              product.category ?? "",
            collection:
              product.collection ?? "",
            retailPrice: Number(
              product.retail_price ?? 0
            ),
            wholesalePrice: Number(
              product.wholesale_price ?? 0
            ),
            stock: totalStock,
            status: productStatus,
            imageUrl:
              sortedImages[0]
                ?.image_url ?? "",
          };
        }
      );

    setProducts(formattedProducts);
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean)
      )
    );
  }, [products]);

  const collections = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.collection
          )
          .filter(Boolean)
      )
    );
  }, [products]);

  const activeProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          product.status === "active"
      ).length;
    }, [products]);

  const draftProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          product.status === "draft"
      ).length;
    }, [products]);

  const outOfStockProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          product.status ===
            "out-of-stock" ||
          product.stock === 0
      ).length;
    }, [products]);

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            product.name
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            product.sku
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesCategory =
            categoryFilter === "all" ||
            product.category ===
              categoryFilter;

          const matchesCollection =
            collectionFilter ===
              "all" ||
            product.collection ===
              collectionFilter;

          const matchesStatus =
            statusFilter === "all" ||
            product.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesCollection &&
            matchesStatus
          );
        }
      );
    }, [
      products,
      searchTerm,
      categoryFilter,
      collectionFilter,
      statusFilter,
    ]);

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  const getStatusLabel = (
    status: ProductStatus
  ) => {
    if (status === "active") {
      return "Active";
    }

    if (status === "draft") {
      return "Draft";
    }

    return "Out of Stock";
  };

  const handleSummaryFilter = (
    filter: SummaryFilter
  ) => {
    setStatusFilter(filter);
    setSearchTerm("");
    setCategoryFilter("all");
    setCollectionFilter("all");
  };

  const handleDeleteProduct =
    async (productId: string) => {
      const shouldDelete =
        window.confirm(
          "Are you sure you want to delete this product?"
        );

      if (!shouldDelete) {
        return;
      }

      const { error } =
        await supabase
          .from("products")
          .delete()
          .eq("id", productId);

      if (error) {
        console.error(
          "Product delete error:",
          error
        );

        alert(
          `Product delete aagala: ${error.message}`
        );

        return;
      }

      setProducts(
        (currentProducts) =>
          currentProducts.filter(
            (product) =>
              product.id !== productId
          )
      );

      alert(
        "Product successfully deleted!"
      );
    };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setCollectionFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="products-page">
      <div className="products-breadcrumb">
        <span>Catalogue</span>
        <span>/</span>
        <strong>Products</strong>
      </div>

      <header className="products-header">
        <div>
          <h1>Products</h1>

          <p>
            Manage your retail and
            wholesale saree catalogue.
          </p>
        </div>

        <button
          type="button"
          className="add-product-button"
          onClick={() =>
            navigate(
              "/admin/products/new"
            )
          }
        >
          <FiPlus />
          <span>Add Product</span>
        </button>
      </header>

      <section className="products-summary-grid">
        <button
          type="button"
          className={`product-summary-card ${
            statusFilter === "all"
              ? "product-summary-card-selected"
              : ""
          }`}
          onClick={() =>
            handleSummaryFilter("all")
          }
        >
          <div className="product-summary-icon">
            <FiPackage />
          </div>

          <div className="product-summary-content">
            <span>Total Products</span>
            <strong>
              {products.length}
            </strong>
          </div>
        </button>

        <button
          type="button"
          className={`product-summary-card ${
            statusFilter === "active"
              ? "product-summary-card-selected"
              : ""
          }`}
          onClick={() =>
            handleSummaryFilter(
              "active"
            )
          }
        >
          <div className="product-summary-icon">
            <FiPackage />
          </div>

          <div className="product-summary-content">
            <span>
              Active Products
            </span>

            <strong>
              {activeProducts}
            </strong>
          </div>
        </button>

        <button
          type="button"
          className={`product-summary-card ${
            statusFilter ===
            "out-of-stock"
              ? "product-summary-card-selected"
              : ""
          }`}
          onClick={() =>
            handleSummaryFilter(
              "out-of-stock"
            )
          }
        >
          <div className="product-summary-icon">
            <FiPackage />
          </div>

          <div className="product-summary-content">
            <span>Out of Stock</span>

            <strong>
              {outOfStockProducts}
            </strong>
          </div>
        </button>

        <button
          type="button"
          className={`product-summary-card ${
            statusFilter === "draft"
              ? "product-summary-card-selected"
              : ""
          }`}
          onClick={() =>
            handleSummaryFilter(
              "draft"
            )
          }
        >
          <div className="product-summary-icon">
            <FiPackage />
          </div>

          <div className="product-summary-content">
            <span>
              Draft Products
            </span>

            <strong>
              {draftProducts}
            </strong>
          </div>
        </button>
      </section>

      <section className="products-content-card">
        <div className="products-toolbar">
          <div className="products-search">
            <FiSearch />

            <input
              type="search"
              value={searchTerm}
              placeholder="Search by product name or SKU..."
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            aria-label="Filter products by category"
          >
            <option value="all">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  value={category}
                  key={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          <select
            value={collectionFilter}
            onChange={(event) =>
              setCollectionFilter(
                event.target.value
              )
            }
            aria-label="Filter products by collection"
          >
            <option value="all">
              All Collections
            </option>

            {collections.map(
              (collection) => (
                <option
                  value={collection}
                  key={collection}
                >
                  {collection}
                </option>
              )
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as SummaryFilter
              )
            }
            aria-label="Filter products by status"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="out-of-stock">
              Out of Stock
            </option>
          </select>
        </div>

        {isLoading ? (
          <div className="products-empty-state">
            <div className="products-empty-icon">
              <FiPackage />
            </div>

            <h2>
              Loading products...
            </h2>

            <p>
              Supabase-la irundhu
              products load aaguthu.
            </p>
          </div>
        ) : errorMessage ? (
          <div className="products-empty-state">
            <div className="products-empty-icon">
              <FiPackage />
            </div>

            <h2>
              Products load aagala
            </h2>

            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={() =>
                void fetchProducts()
              }
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty-state">
            <div className="products-empty-icon">
              <FiPackage />
            </div>

            <h2>
              No products added yet
            </h2>

            <p>
              Create your first saree
              product with colour
              variants, prices, stock
              and images.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/products/new"
                )
              }
            >
              <FiPlus />
              Add First Product
            </button>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="products-empty-state">
            <div className="products-empty-icon">
              <FiSearch />
            </div>

            <h2>
              No matching products
            </h2>

            <p>
              Change your search text
              or remove the selected
              filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>
                    Collection
                  </th>
                  <th>Retail</th>
                  <th>Wholesale</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product) => (
                    <tr key={product.id}>
                      <td data-label="Product">
                        <div className="product-table-info">
                          <div className="product-table-image">
                            {product.imageUrl ? (
                              <img
                                src={
                                  product.imageUrl
                                }
                                alt={
                                  product.name
                                }
                              />
                            ) : (
                              <FiPackage />
                            )}
                          </div>

                          <div>
                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <span>
                              {product.sku ||
                                "No SKU"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Category">
                        {product.category}
                      </td>

                      <td data-label="Collection">
                        {product.collection ||
                          "—"}
                      </td>

                      <td data-label="Retail">
                        {formatCurrency(
                          product.retailPrice
                        )}
                      </td>

                      <td data-label="Wholesale">
                        {formatCurrency(
                          product.wholesalePrice
                        )}
                      </td>

                      <td data-label="Stock">
                        <span
                          className={
                            product.stock <=
                            5
                              ? "product-stock product-stock-low"
                              : "product-stock"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td data-label="Status">
                        <span
                          className={`product-status product-status-${product.status}`}
                        >
                          {getStatusLabel(
                            product.status
                          )}
                        </span>
                      </td>

                      <td data-label="Actions">
                        <div className="product-table-actions">
                          <button
                            type="button"
                            title="View product"
                            onClick={() =>
                              navigate(
                                `/admin/products/${product.id}`
                              )
                            }
                          >
                            <FiEye />
                          </button>

                          <button
                            type="button"
                            title="Edit product"
                            onClick={() =>
                              navigate(
                                `/admin/products/${product.id}/edit`
                              )
                            }
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="product-delete-action"
                            title="Delete product"
                            onClick={() =>
                              void handleDeleteProduct(
                                product.id
                              )
                            }
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}