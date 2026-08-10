import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

const ShopContext =
  createContext<
    ShopContextValue | null
  >(null);

type ShopProviderProps = {
  children: ReactNode;
};

export function ShopProvider({
  children,
}: ShopProviderProps) {
  const [
    wholesaleWishlist,
    setWholesaleWishlist,
  ] =
    useState<
      ShopProduct[]
    >([]);

  const [
    retailWishlist,
    setRetailWishlist,
  ] =
    useState<
      ShopProduct[]
    >([]);

  const [
    wholesaleCart,
    setWholesaleCart,
  ] =
    useState<
      CartItem[]
    >([]);

  const [
    retailCart,
    setRetailCart,
  ] =
    useState<
      CartItem[]
    >([]);

  const addToWishlist = (
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

    setter(
      (current) => {
        const alreadyExists =
          current.some(
            (item) =>
              item.id ===
              product.id
          );

        if (
          alreadyExists
        ) {
          return current.filter(
            (item) =>
              item.id !==
              product.id
          );
        }

        return [
          ...current,
          product,
        ];
      }
    );
  };

  const removeFromWishlist = (
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

    setter(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            productId
        )
    );
  };

  const addToCart = (
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

    setter(
      (current) => {
        const existingItem =
          current.find(
            (item) =>
              item.id ===
              product.id
          );

        if (
          existingItem
        ) {
          return current.map(
            (item) =>
              item.id ===
              product.id
                ? {
                    ...item,
                    quantity:
                      Math.min(
                        item.quantity +
                          1,
                        item.stock
                      ),
                  }
                : item
          );
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
  };

  const removeFromCart = (
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

    setter(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            productId
        )
    );
  };

  const updateCartQuantity = (
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

    setter(
      (current) =>
        current.map(
          (item) => {
            if (
              item.id !==
              productId
            ) {
              return item;
            }

            const safeQuantity =
              Math.max(
                1,
                Math.min(
                  quantity,
                  item.stock
                )
              );

            return {
              ...item,
              quantity:
                safeQuantity,
            };
          }
        )
    );
  };

  const isInWishlist = (
    productId:
      ProductId,
    mode:
      ShopMode
  ) => {
    const wishlist =
      mode ===
      "wholesale"
        ? wholesaleWishlist
        : retailWishlist;

    return wishlist.some(
      (item) =>
        item.id ===
        productId
    );
  };

  const wholesaleWishlistCount =
    wholesaleWishlist.length;

  const retailWishlistCount =
    retailWishlist.length;

  const wholesaleCartCount =
    useMemo(
      () =>
        wholesaleCart.length,
      [wholesaleCart]
    );

  const retailCartCount =
    useMemo(
      () =>
        retailCart.length,
      [retailCart]
    );

  return (
    <ShopContext.Provider
      value={{
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
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

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