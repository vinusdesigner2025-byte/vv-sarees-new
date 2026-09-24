import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* =========================================
   TYPES
========================================= */

export type ShopMode =
  | "wholesale"
  | "retail";

export type ProductId =
  | string
  | number;

export type ShopProduct = {
  id: ProductId;
  slug: string;
  name: string;
  price: number;
  rating: number;
  stock: number;
  colour?: string;
  image?: string;
};

export type CartItem =
  ShopProduct & {
    quantity: number;
  };

type ShopContextValue = {
  wholesaleWishlist:
    ShopProduct[];

  retailWishlist:
    ShopProduct[];

  wholesaleCart:
    CartItem[];

  retailCart:
    CartItem[];

  addToWishlist: (
    product: ShopProduct,
    mode: ShopMode
  ) => void;

  removeFromWishlist: (
    productId: ProductId,
    mode: ShopMode
  ) => void;

  addToCart: (
    product: ShopProduct,
    mode: ShopMode
  ) => void;

  removeFromCart: (
    productId: ProductId,
    mode: ShopMode
  ) => void;

  updateCartQuantity: (
    productId: ProductId,
    quantity: number,
    mode: ShopMode
  ) => void;

  isInWishlist: (
    productId: ProductId,
    mode: ShopMode
  ) => boolean;

  wholesaleWishlistCount:
    number;

  retailWishlistCount:
    number;

  wholesaleCartCount:
    number;

  retailCartCount:
    number;
};

/* =========================================
   CONTEXT
========================================= */

const ShopContext =
  createContext<
    ShopContextValue | null
  >(null);

type ShopProviderProps = {
  children: ReactNode;
};

/* =========================================
   HELPERS

   Convert IDs to string so:
   123 and "123" are treated as same product.
========================================= */

const getProductKey = (
  productId: ProductId
) => String(productId);

/* =========================================
   PROVIDER
========================================= */

export function ShopProvider({
  children,
}: ShopProviderProps) {
  const [
    wholesaleWishlist,
    setWholesaleWishlist,
  ] = useState<
    ShopProduct[]
  >([]);

  const [
    retailWishlist,
    setRetailWishlist,
  ] = useState<
    ShopProduct[]
  >([]);

  const [
    wholesaleCart,
    setWholesaleCart,
  ] = useState<
    CartItem[]
  >([]);

  const [
    retailCart,
    setRetailCart,
  ] = useState<
    CartItem[]
  >([]);

  /* =====================================
     WISHLIST SETS

     Earlier:
     Every product card used .some()

     Now:
     Set.has() → very fast.
  ===================================== */

  const wholesaleWishlistIds =
    useMemo(
      () =>
        new Set(
          wholesaleWishlist.map(
            (item) =>
              getProductKey(
                item.id
              )
          )
        ),
      [wholesaleWishlist]
    );

  const retailWishlistIds =
    useMemo(
      () =>
        new Set(
          retailWishlist.map(
            (item) =>
              getProductKey(
                item.id
              )
          )
        ),
      [retailWishlist]
    );

  /* =====================================
     ADD / TOGGLE WISHLIST
  ===================================== */

  const addToWishlist =
    useCallback(
      (
        product:
          ShopProduct,
        mode:
          ShopMode
      ) => {
        const setter =
          mode ===
          "wholesale"
            ? setWholesaleWishlist
            : setRetailWishlist;

        const productKey =
          getProductKey(
            product.id
          );

        setter(
          (current) => {
            const index =
              current.findIndex(
                (item) =>
                  getProductKey(
                    item.id
                  ) ===
                  productKey
              );

            /*
              Already exists:
              remove from wishlist.
            */
            if (
              index !== -1
            ) {
              return current.filter(
                (_, itemIndex) =>
                  itemIndex !==
                  index
              );
            }

            /*
              Add new product.
            */
            return [
              ...current,
              product,
            ];
          }
        );
      },
      []
    );

  /* =====================================
     REMOVE WISHLIST
  ===================================== */

  const removeFromWishlist =
    useCallback(
      (
        productId:
          ProductId,
        mode:
          ShopMode
      ) => {
        const setter =
          mode ===
          "wholesale"
            ? setWholesaleWishlist
            : setRetailWishlist;

        const productKey =
          getProductKey(
            productId
          );

        setter(
          (current) =>
            current.filter(
              (item) =>
                getProductKey(
                  item.id
                ) !==
                productKey
            )
        );
      },
      []
    );

  /* =====================================
     ADD TO CART
  ===================================== */

  const addToCart =
    useCallback(
      (
        product:
          ShopProduct,
        mode:
          ShopMode
      ) => {
        const setter =
          mode ===
          "wholesale"
            ? setWholesaleCart
            : setRetailCart;

        const productKey =
          getProductKey(
            product.id
          );

        setter(
          (current) => {
            const existingIndex =
              current.findIndex(
                (item) =>
                  getProductKey(
                    item.id
                  ) ===
                  productKey
              );

            /*
              Existing product:
              increase quantity safely.
            */
            if (
              existingIndex !==
              -1
            ) {
              const existingItem =
                current[
                  existingIndex
                ];

              const stock =
                Math.max(
                  0,
                  Number(
                    existingItem.stock ??
                      0
                  )
                );

              /*
                No stock:
                don't change cart.
              */
              if (
                stock <= 0
              ) {
                return current;
              }

              const nextQuantity =
                Math.min(
                  existingItem.quantity +
                    1,
                  stock
                );

              /*
                Already at maximum stock.
                Avoid creating new array.
              */
              if (
                nextQuantity ===
                existingItem.quantity
              ) {
                return current;
              }

              return current.map(
                (
                  item,
                  index
                ) =>
                  index ===
                  existingIndex
                    ? {
                        ...item,
                        quantity:
                          nextQuantity,
                      }
                    : item
              );
            }

            /*
              New product:
              don't add if out of stock.
            */
            const stock =
              Math.max(
                0,
                Number(
                  product.stock ??
                    0
                )
              );

            if (
              stock <= 0
            ) {
              return current;
            }

            return [
              ...current,
              {
                ...product,
                quantity: 1,
              },
            ];
          }
        );
      },
      []
    );

  /* =====================================
     REMOVE CART ITEM
  ===================================== */

  const removeFromCart =
    useCallback(
      (
        productId:
          ProductId,
        mode:
          ShopMode
      ) => {
        const setter =
          mode ===
          "wholesale"
            ? setWholesaleCart
            : setRetailCart;

        const productKey =
          getProductKey(
            productId
          );

        setter(
          (current) =>
            current.filter(
              (item) =>
                getProductKey(
                  item.id
                ) !==
                productKey
            )
        );
      },
      []
    );

  /* =====================================
     UPDATE CART QUANTITY
  ===================================== */

  const updateCartQuantity =
    useCallback(
      (
        productId:
          ProductId,
        quantity:
          number,
        mode:
          ShopMode
      ) => {
        const setter =
          mode ===
          "wholesale"
            ? setWholesaleCart
            : setRetailCart;

        const productKey =
          getProductKey(
            productId
          );

        setter(
          (current) =>
            current.map(
              (item) => {
                if (
                  getProductKey(
                    item.id
                  ) !==
                  productKey
                ) {
                  return item;
                }

                const stock =
                  Math.max(
                    1,
                    Number(
                      item.stock ??
                        1
                    )
                  );

                const requestedQuantity =
                  Number.isFinite(
                    quantity
                  )
                    ? quantity
                    : 1;

                const safeQuantity =
                  Math.max(
                    1,
                    Math.min(
                      requestedQuantity,
                      stock
                    )
                  );

                /*
                  Quantity same-na old object
                  return pannuvom.
                */
                if (
                  safeQuantity ===
                  item.quantity
                ) {
                  return item;
                }

                return {
                  ...item,
                  quantity:
                    safeQuantity,
                };
              }
            )
        );
      },
      []
    );

  /* =====================================
     WISHLIST LOOKUP

     Set.has() instead of Array.some().
  ===================================== */

  const isInWishlist =
    useCallback(
      (
        productId:
          ProductId,
        mode:
          ShopMode
      ) => {
        const key =
          getProductKey(
            productId
          );

        return mode ===
          "wholesale"
          ? wholesaleWishlistIds.has(
              key
            )
          : retailWishlistIds.has(
              key
            );
      },
      [
        wholesaleWishlistIds,
        retailWishlistIds,
      ]
    );

  /* =====================================
     COUNTS
  ===================================== */

  const wholesaleWishlistCount =
    wholesaleWishlist.length;

  const retailWishlistCount =
    retailWishlist.length;

  /*
    Preserve your existing behaviour:
    cartCount = number of different products,
    not total quantity.
  */
  const wholesaleCartCount =
    wholesaleCart.length;

  const retailCartCount =
    retailCart.length;

  /* =====================================
     MEMOIZED CONTEXT VALUE

     Earlier object was recreated on every
     provider render.

     Now it changes only when actual shop
     state/functions change.
  ===================================== */

  const contextValue =
    useMemo<
      ShopContextValue
    >(
      () => ({
        wholesaleWishlist,
        retailWishlist,

        wholesaleCart,
        retailCart,

        addToWishlist,
        removeFromWishlist,

        addToCart,
        removeFromCart,

        updateCartQuantity,

        isInWishlist,

        wholesaleWishlistCount,
        retailWishlistCount,

        wholesaleCartCount,
        retailCartCount,
      }),
      [
        wholesaleWishlist,
        retailWishlist,

        wholesaleCart,
        retailCart,

        addToWishlist,
        removeFromWishlist,

        addToCart,
        removeFromCart,

        updateCartQuantity,

        isInWishlist,

        wholesaleWishlistCount,
        retailWishlistCount,

        wholesaleCartCount,
        retailCartCount,
      ]
    );

  /* =====================================
     PROVIDER
  ===================================== */

  return (
    <ShopContext.Provider
      value={
        contextValue
      }
    >
      {children}
    </ShopContext.Provider>
  );
}

/* =========================================
   HOOK
========================================= */

export function useShop() {
  const context =
    useContext(
      ShopContext
    );

  if (!context) {
    throw new Error(
      "useShop must be used inside ShopProvider"
    );
  }

  return context;
}