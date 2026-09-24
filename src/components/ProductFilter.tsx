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

/* =====================================================
   TYPES
   ===================================================== */

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

/* =====================================================
   DEFAULT FILTERS
   ===================================================== */

const defaultFilters: ProductFilterValues = {
  category: "all",
  state: "all",
  minPrice: 0,
  maxPrice: 10000,
  minimumRating: 0,
  inStockOnly: false,
  sortBy: "default",
};

/* =====================================================
   CACHE

   Retail → Wholesale navigation-la same categories /
   states thirumba Supabase-la fetch panna vendam.
   ===================================================== */

let cachedCategories:
  CategoryOption[] | null = null;

let cachedStates:
  StateOption[] | null = null;

let categoriesRequest:
  Promise<CategoryOption[]> | null = null;

let statesRequest:
  Promise<StateOption[]> | null = null;

/* =====================================================
   HELPERS
   ===================================================== */

const createFilterValue = (
  value: string
) => {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
};

/* =====================================================
   LOAD CATEGORY OPTIONS

   Only fetch fields actually required.
   ===================================================== */

const fetchCategories =
  async (): Promise<
    CategoryOption[]
  > => {
    if (cachedCategories) {
      return cachedCategories;
    }

    /*
      If another component already started the
      same request, reuse that request.
    */
    if (categoriesRequest) {
      return categoriesRequest;
    }

    categoriesRequest =
      (async () => {
        const {
          data,
          error,
        } = await supabase
          .from("categories")
          .select(`
            id,
            name,
            slug
          `)
          .eq(
            "status",
            "active"
          )
          .order(
            "name",
            {
              ascending: true,
            }
          );

        if (error) {
          throw error;
        }

        const categories:
          CategoryOption[] =
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
            .map(
              (category) => ({
                id:
                  String(
                    category.id
                  ),

                name:
                  String(
                    category.name
                  ).trim(),

                slug:
                  String(
                    category.slug
                  ).trim(),
              })
            );

        cachedCategories =
          categories;

        return categories;
      })();

    try {
      return await categoriesRequest;
    } finally {
      categoriesRequest = null;
    }
  };

/* =====================================================
   LOAD STATES

   Only "state" column is downloaded.
   ===================================================== */

const fetchStates =
  async (): Promise<
    StateOption[]
  > => {
    if (cachedStates) {
      return cachedStates;
    }

    if (statesRequest) {
      return statesRequest;
    }

    statesRequest =
      (async () => {
        const {
          data,
          error,
        } = await supabase
          .from("products")
          .select("state")
          .eq(
            "status",
            "active"
          )
          .not(
            "state",
            "is",
            null
          );

        if (error) {
          throw error;
        }

        const stateMap =
          new Map<
            string,
            string
          >();

        (data ?? []).forEach(
          (product) => {
            const stateName =
              String(
                product.state ??
                  ""
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

        const states =
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
              (
                first,
                second
              ) =>
                first.label.localeCompare(
                  second.label
                )
            );

        cachedStates =
          states;

        return states;
      })();

    try {
      return await statesRequest;
    } finally {
      statesRequest = null;
    }
  };

/* =====================================================
   COMPONENT
   ===================================================== */

export default function ProductFilter({
  mode,
  value,
  onChange,
}: ProductFilterProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  /*
    Draft filters are local.

    User typing price DOES NOT filter every product
    on every keyboard press.

    Products update only after Apply Filters.
  */
  const [
    draftFilters,
    setDraftFilters,
  ] =
    useState<ProductFilterValues>({
      ...value,
    });

  const [
    categories,
    setCategories,
  ] = useState<
    CategoryOption[]
  >(
    cachedCategories ?? []
  );

  const [
    states,
    setStates,
  ] = useState<
    StateOption[]
  >(
    cachedStates ?? []
  );

  const [
    isCategoriesLoading,
    setIsCategoriesLoading,
  ] = useState(false);

  const [
    isStatesLoading,
    setIsStatesLoading,
  ] = useState(false);

  /* =====================================================
     OPEN FILTER

     IMPORTANT:
     No Supabase requests on main product page load.

     Categories / states load only when customer actually
     opens Filter.
     ===================================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /*
      Start every filter session using currently
      applied filters.
    */
    setDraftFilters({
      ...value,
    });

    let cancelled = false;

    /* =========================
       LOAD CATEGORIES
       ========================= */

    if (
      cachedCategories
    ) {
      setCategories(
        cachedCategories
      );
    } else {
      setIsCategoriesLoading(
        true
      );

      void fetchCategories()
        .then(
          (loadedCategories) => {
            if (cancelled) {
              return;
            }

            setCategories(
              loadedCategories
            );
          }
        )
        .catch(
          (error) => {
            console.error(
              "Product filter categories load error:",
              error
            );

            if (!cancelled) {
              setCategories([]);
            }
          }
        )
        .finally(() => {
          if (!cancelled) {
            setIsCategoriesLoading(
              false
            );
          }
        });
    }

    /* =========================
       LOAD STATES
       ========================= */

    if (cachedStates) {
      setStates(
        cachedStates
      );
    } else {
      setIsStatesLoading(
        true
      );

      void fetchStates()
        .then(
          (loadedStates) => {
            if (cancelled) {
              return;
            }

            setStates(
              loadedStates
            );
          }
        )
        .catch(
          (error) => {
            console.error(
              "Product filter states load error:",
              error
            );

            if (!cancelled) {
              setStates([]);
            }
          }
        )
        .finally(() => {
          if (!cancelled) {
            setIsStatesLoading(
              false
            );
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    value,
  ]);

  /* =====================================================
     ESC KEY CLOSE
     ===================================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen]);

  /* =====================================================
     UPDATE DRAFT FILTER

     Does NOT immediately update Retail/Wholesale page.
     ===================================================== */

  const updateDraftFilter = <
    Key extends keyof ProductFilterValues,
  >(
    key: Key,
    nextValue:
      ProductFilterValues[Key]
  ) => {
    setDraftFilters(
      (current) => ({
        ...current,
        [key]: nextValue,
      })
    );
  };

  /* =====================================================
     APPLY FILTERS
     ===================================================== */

  const applyFilters = () => {
    const safeMinimum =
      Number.isFinite(
        draftFilters.minPrice
      )
        ? Math.max(
            0,
            draftFilters.minPrice
          )
        : 0;

    const safeMaximum =
      Number.isFinite(
        draftFilters.maxPrice
      )
        ? Math.max(
            safeMinimum,
            draftFilters.maxPrice
          )
        : 10000;

    onChange({
      ...draftFilters,

      minPrice:
        safeMinimum,

      maxPrice:
        safeMaximum,
    });

    setIsOpen(false);
  };

  /* =====================================================
     CLEAR FILTERS
     ===================================================== */

  const clearFilters = () => {
    const cleared = {
      ...defaultFilters,
    };

    setDraftFilters(
      cleared
    );

    /*
      Clear is intentional action, so apply
      immediately with only ONE parent update.
    */
    onChange(
      cleared
    );
  };

  /* =====================================================
     ACTIVE FILTER INDICATOR
     ===================================================== */

  const hasActiveFilters =
    value.category !== "all" ||
    value.state !== "all" ||
    value.minPrice !== 0 ||
    value.maxPrice !== 10000 ||
    value.minimumRating !== 0 ||
    value.inStockOnly ||
    value.sortBy !== "default";

  /* =====================================================
     PAGE
     ===================================================== */

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
            (current) =>
              !current
          )
        }
        aria-expanded={
          isOpen
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

          <aside
            className="filter-panel"
            aria-label="Product filters"
          >
            {/* =====================
                HEADER
                ===================== */}

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

            {/* =====================
                CATEGORY
                ===================== */}

            <div className="filter-field">
              <label
                htmlFor={`${mode}-category`}
              >
                Category
              </label>

              <select
                id={`${mode}-category`}
                value={
                  draftFilters.category
                }
                onChange={(
                  event
                ) =>
                  updateDraftFilter(
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

            {/* =====================
                STATE
                ===================== */}

            <div className="filter-field">
              <label
                htmlFor={`${mode}-state`}
              >
                State
              </label>

              <select
                id={`${mode}-state`}
                value={
                  draftFilters.state
                }
                onChange={(
                  event
                ) =>
                  updateDraftFilter(
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

            {/* =====================
                PRICE
                ===================== */}

            <div className="filter-field">
              <label>
                Price Range
              </label>

              <div className="filter-price-grid">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={
                    draftFilters.minPrice
                  }
                  onChange={(
                    event
                  ) =>
                    updateDraftFilter(
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
                  inputMode="numeric"
                  value={
                    draftFilters.maxPrice
                  }
                  onChange={(
                    event
                  ) =>
                    updateDraftFilter(
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

            {/* =====================
                RATING
                ===================== */}

            <div className="filter-field">
              <label
                htmlFor={`${mode}-rating`}
              >
                Minimum Rating
              </label>

              <select
                id={`${mode}-rating`}
                value={
                  draftFilters.minimumRating
                }
                onChange={(
                  event
                ) =>
                  updateDraftFilter(
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

            {/* =====================
                SORT
                ===================== */}

            <div className="filter-field">
              <label
                htmlFor={`${mode}-sort`}
              >
                Sort By
              </label>

              <select
                id={`${mode}-sort`}
                value={
                  draftFilters.sortBy
                }
                onChange={(
                  event
                ) =>
                  updateDraftFilter(
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

            {/* =====================
                STOCK
                ===================== */}

            <label className="filter-stock-option">
              <input
                type="checkbox"
                checked={
                  draftFilters.inStockOnly
                }
                onChange={(
                  event
                ) =>
                  updateDraftFilter(
                    "inStockOnly",
                    event.target.checked
                  )
                }
              />

              <span>
                Show only in-stock products
              </span>
            </label>

            {/* =====================
                ACTIONS
                ===================== */}

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
                onClick={
                  applyFilters
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

/* =====================================================
   EXPORT DEFAULT FILTERS
   ===================================================== */

export {
  defaultFilters,
};