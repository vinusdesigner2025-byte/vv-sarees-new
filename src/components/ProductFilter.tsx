import { useState } from "react";
import {
  FiChevronDown,
  FiFilter,
  FiX,
} from "react-icons/fi";

import "./ProductFilter.css";

export type ProductFilterValues = {
  category: string;
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
  minPrice: 0,
  maxPrice: 10000,
  minimumRating: 0,
  inStockOnly: false,
  sortBy: "default",
};

export default function ProductFilter({
  mode,
  value,
  onChange,
}: ProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const clearFilters = () => {
    onChange(defaultFilters);
  };

  const hasActiveFilters =
    value.category !== "all" ||
    value.minPrice !== 0 ||
    value.maxPrice !== 10000 ||
    value.minimumRating !== 0 ||
    value.inStockOnly ||
    value.sortBy !== "default";

  return (
    <div className="product-filter">
      <button
        type="button"
        className={`filter-button ${
          hasActiveFilters
            ? "filter-button-active"
            : ""
        }`}
        onClick={() =>
          setIsOpen((current) => !current)
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
          <div
            className="filter-overlay"
            onClick={() => setIsOpen(false)}
          />

          <aside className="filter-panel">
            <div className="filter-panel-header">
              <div>
                <span>VV SAREES</span>
                <h2>Filter Products</h2>
              </div>

              <button
                type="button"
                className="filter-close-button"
                onClick={() => setIsOpen(false)}
                aria-label="Close filter"
              >
                <FiX />
              </button>
            </div>

            <div className="filter-field">
              <label htmlFor={`${mode}-category`}>
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

                <option value="khadi-cotton">
                  Khadi Cotton
                </option>

                <option value="soft-cotton">
                  Soft Cotton
                </option>

                <option value="linen-cotton">
                  Linen Cotton
                </option>

                <option value="tissue">
                  Tissue Saree
                </option>

                <option value="banarasi-silk">
                  Banarasi Silk
                </option>

                <option value="kanchipuram-silk">
                  Kanchipuram Silk
                </option>
              </select>
            </div>

            <div className="filter-field">
              <label>Price Range</label>

              <div className="filter-price-grid">
                <input
                  type="number"
                  min="0"
                  value={value.minPrice}
                  onChange={(event) =>
                    updateFilter(
                      "minPrice",
                      Number(event.target.value)
                    )
                  }
                  placeholder="Minimum"
                />

                <input
                  type="number"
                  min="0"
                  value={value.maxPrice}
                  onChange={(event) =>
                    updateFilter(
                      "maxPrice",
                      Number(event.target.value)
                    )
                  }
                  placeholder="Maximum"
                />
              </div>
            </div>

            <div className="filter-field">
              <label htmlFor={`${mode}-rating`}>
                Minimum Rating
              </label>

              <select
                id={`${mode}-rating`}
                value={value.minimumRating}
                onChange={(event) =>
                  updateFilter(
                    "minimumRating",
                    Number(event.target.value)
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

            <div className="filter-field">
              <label htmlFor={`${mode}-sort`}>
                Sort By
              </label>

              <select
                id={`${mode}-sort`}
                value={value.sortBy}
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

            <label className="filter-stock-option">
              <input
                type="checkbox"
                checked={value.inStockOnly}
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

            <div className="filter-panel-actions">
              <button
                type="button"
                className="filter-clear-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

              <button
                type="button"
                className="filter-apply-button"
                onClick={() => setIsOpen(false)}
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

export { defaultFilters };