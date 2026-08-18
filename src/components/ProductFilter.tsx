import {
  useEffect,
  useState,
} from "react";

import {
  FiChevronDown,
  FiFilter,
  FiX,
} from "react-icons/fi";

import { supabase } from "../lib/supabase";

import "./ProductFilter.css";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type StateOption = {
  label: string;
  value: string;
};

export type ProductFilterValues = {
  category: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  minimumRating: number;
  inStockOnly: boolean;
  sortBy:
    | "default"
    | "price-low"
    | "price-high"
    | "rating-high";
};

type ProductFilterProps = {
  mode: "wholesale" | "retail";

  value: ProductFilterValues;

  onChange: (
    nextValue: ProductFilterValues
  ) => void;
};

const defaultFilters: ProductFilterValues = {
  category: "all",
  state: "all",
  minPrice: 0,
  maxPrice: 10000,
  minimumRating: 0,
  inStockOnly: false,
  sortBy: "default",
};

const createFilterValue = (
  value: string
) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function ProductFilter({
  mode,
  value,
  onChange,
}: ProductFilterProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    categories,
    setCategories,
  ] = useState<CategoryOption[]>([]);

  const [
    isCategoriesLoading,
    setIsCategoriesLoading,
  ] = useState(true);

  const [
    states,
    setStates,
  ] = useState<StateOption[]>([]);

  const [
    isStatesLoading,
    setIsStatesLoading,
  ] = useState(true);

  /* =========================
     LOAD CATEGORIES
  ========================= */

  const loadCategories = async () => {
    setIsCategoriesLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        status
      `)
      .eq("status", "active")
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Product filter categories load error:",
        error
      );

      setCategories([]);
      setIsCategoriesLoading(false);

      return;
    }

    const activeCategories =
      (data ?? [])
        .filter(
          (category) =>
            Boolean(
              category.name?.trim()
            ) &&
            Boolean(
              category.slug?.trim()
            )
        )
        .map((category) => ({
          id: category.id,
          name:
            category.name.trim(),
          slug:
            category.slug.trim(),
        }));

    setCategories(
      activeCategories
    );

    setIsCategoriesLoading(false);
  };

  /* =========================
     LOAD STATES FROM PRODUCTS
  ========================= */

  const loadStates = async () => {
    setIsStatesLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(`
        state,
        status
      `)
      .eq("status", "active")
      .not("state", "is", null);

    if (error) {
      console.error(
        "Product filter states load error:",
        error
      );

      setStates([]);
      setIsStatesLoading(false);

      return;
    }

    const stateMap =
      new Map<string, string>();

    (data ?? []).forEach(
      (product) => {
        const stateName =
          String(
            product.state ?? ""
          ).trim();

        if (!stateName) {
          return;
        }

        const stateValue =
          createFilterValue(
            stateName
          );

        if (!stateValue) {
          return;
        }

        if (
          !stateMap.has(
            stateValue
          )
        ) {
          stateMap.set(
            stateValue,
            stateName
          );
        }
      }
    );

    const uniqueStates =
      Array.from(
        stateMap.entries()
      )
        .map(
          ([
            stateValue,
            stateName,
          ]) => ({
            value:
              stateValue,
            label:
              stateName,
          })
        )
        .sort(
          (first, second) =>
            first.label.localeCompare(
              second.label
            )
        );

    setStates(
      uniqueStates
    );

    setIsStatesLoading(false);
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    void loadCategories();
    void loadStates();
  }, []);

  /* =========================
     REFRESH WHEN DRAWER OPENS
  ========================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadCategories();
    void loadStates();
  }, [isOpen]);

  /* =========================
     UPDATE FILTER
  ========================= */

  const updateFilter = <
    Key extends keyof ProductFilterValues,
  >(
    key: Key,
    nextValue: ProductFilterValues[Key]
  ) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  /* =========================
     CLEAR FILTER
  ========================= */

  const clearFilters = () => {
    onChange({
      ...defaultFilters,
    });
  };

  const hasActiveFilters =
    value.category !== "all" ||
    value.state !== "all" ||
    value.minPrice !== 0 ||
    value.maxPrice !== 10000 ||
    value.minimumRating !== 0 ||
    value.inStockOnly ||
    value.sortBy !== "default";

  return (
    <div className="product-filter">

      {/* =========================
          FILTER BUTTON
      ========================= */}

      <button
        type="button"
        className={`filter-button ${
          hasActiveFilters
            ? "filter-button-active"
            : ""
        }`}
        onClick={() =>
          setIsOpen(
            (current) => !current
          )
        }
      >
        <FiFilter />

        Filter

        <FiChevronDown
          className={
            isOpen
              ? "filter-chevron-open"
              : ""
          }
        />
      </button>

      {isOpen && (
        <>
          {/* =========================
              OVERLAY
          ========================= */}

          <div
            className="filter-overlay"
            onClick={() =>
              setIsOpen(false)
            }
          />

          {/* =========================
              FILTER PANEL
          ========================= */}

          <aside className="filter-panel">

            {/* HEADER */}

            <div className="filter-panel-header">
              <div>
                <span>
                  VV SAREES
                </span>

                <h2>
                  Filter Products
                </h2>
              </div>

              <button
                type="button"
                className="filter-close-button"
                onClick={() =>
                  setIsOpen(false)
                }
                aria-label="Close filter"
              >
                <FiX />
              </button>
            </div>

            {/* =========================
                CATEGORY
            ========================= */}

            <div className="filter-field">
              <label
                htmlFor={`${mode}-category`}
              >
                Category
              </label>

              <select
                id={`${mode}-category`}
                value={value.category}
                onChange={(event) =>
                  updateFilter(
                    "category",
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Categories
                </option>

                {isCategoriesLoading ? (
                  <option
                    value=""
                    disabled
                  >
                    Loading categories...
                  </option>
                ) : (
                  categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.slug
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )
                )}
              </select>
            </div>

            {/* =========================
                STATE
            ========================= */}

            <div className="filter-field">
              <label
                htmlFor={`${mode}-state`}
              >
                State
              </label>

              <select
                id={`${mode}-state`}
                value={value.state}
                onChange={(event) =>
                  updateFilter(
                    "state",
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All States
                </option>

                {isStatesLoading ? (
                  <option
                    value=""
                    disabled
                  >
                    Loading states...
                  </option>
                ) : (
                  states.map(
                    (state) => (
                      <option
                        key={
                          state.value
                        }
                        value={
                          state.value
                        }
                      >
                        {
                          state.label
                        }
                      </option>
                    )
                  )
                )}
              </select>
            </div>

            {/* =========================
                PRICE
            ========================= */}

            <div className="filter-field">
              <label>
                Price Range
              </label>

              <div className="filter-price-grid">
                <input
                  type="number"
                  min="0"
                  value={
                    value.minPrice
                  }
                  onChange={(event) =>
                    updateFilter(
                      "minPrice",
                      Number(
                        event.target.value
                      )
                    )
                  }
                  placeholder="Minimum"
                />

                <input
                  type="number"
                  min="0"
                  value={
                    value.maxPrice
                  }
                  onChange={(event) =>
                    updateFilter(
                      "maxPrice",
                      Number(
                        event.target.value
                      )
                    )
                  }
                  placeholder="Maximum"
                />
              </div>
            </div>

            {/* =========================
                RATING
            ========================= */}

            <div className="filter-field">
              <label
                htmlFor={`${mode}-rating`}
              >
                Minimum Rating
              </label>

              <select
                id={`${mode}-rating`}
                value={
                  value.minimumRating
                }
                onChange={(event) =>
                  updateFilter(
                    "minimumRating",
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value={0}>
                  All Ratings
                </option>

                <option value={4}>
                  4 Stars &amp; Above
                </option>

                <option value={3}>
                  3 Stars &amp; Above
                </option>

                <option value={2}>
                  2 Stars &amp; Above
                </option>
              </select>
            </div>

            {/* =========================
                SORT
            ========================= */}

            <div className="filter-field">
              <label
                htmlFor={`${mode}-sort`}
              >
                Sort By
              </label>

              <select
                id={`${mode}-sort`}
                value={
                  value.sortBy
                }
                onChange={(event) =>
                  updateFilter(
                    "sortBy",
                    event.target
                      .value as ProductFilterValues["sortBy"]
                  )
                }
              >
                <option value="default">
                  Recommended
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating-high">
                  Highest Rating
                </option>
              </select>
            </div>

            {/* =========================
                STOCK
            ========================= */}

            <label className="filter-stock-option">
              <input
                type="checkbox"
                checked={
                  value.inStockOnly
                }
                onChange={(event) =>
                  updateFilter(
                    "inStockOnly",
                    event.target.checked
                  )
                }
              />

              <span>
                Show only in-stock products
              </span>
            </label>

            {/* =========================
                ACTIONS
            ========================= */}

            <div className="filter-panel-actions">
              <button
                type="button"
                className="filter-clear-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>

              <button
                type="button"
                className="filter-apply-button"
                onClick={() =>
                  setIsOpen(false)
                }
              >
                Apply Filters
              </button>
            </div>

          </aside>
        </>
      )}
    </div>
  );
}

export {
  defaultFilters,
};