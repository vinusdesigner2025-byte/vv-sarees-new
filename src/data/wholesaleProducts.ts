export type ProductReview = {
  id: number;
  reviewerName: string;
  rating: number;
  review: string;
  date: string;
  verified: boolean;
};

export type ProductVariant = {
  id: string;
  colorName: string;
  colorCode: string;
  price: number;
  stock: number;
  sku: string;
  images: string[];
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  fabric: string;
  state: string;
  description: string;
  rating: number;
  reviews: ProductReview[];
  variants: ProductVariant[];
};

export const wholesaleProducts: Product[] = [
  {
    id: 1,
    slug: "khadi-cotton-saree",
    name: "Khadi Cotton Saree",
    category: "Cotton Sarees",
    fabric: "Khadi Cotton",
    state: "Tamil Nadu",
    description:
      "A lightweight and elegant Khadi cotton saree, carefully sourced for boutiques, retailers and resellers.",
    rating: 4,
    reviews: [
      {
        id: 1,
        reviewerName: "Priya S",
        rating: 5,
        review:
          "Beautiful fabric and excellent quality. The colour looked exactly like the picture.",
        date: "12 July 2026",
        verified: true,
      },
      {
        id: 2,
        reviewerName: "Keerthana",
        rating: 4,
        review:
          "Soft material and suitable for daily wear. Good wholesale collection.",
        date: "5 July 2026",
        verified: false,
      },
    ],
    variants: [
      {
        id: "maroon",
        colorName: "Maroon",
        colorCode: "#7a2130",
        price: 499,
        stock: 24,
        sku: "VV-WS-KC-001-MR",
        images: [
          "https://placehold.co/900x1100/7a2130/ffffff?text=Maroon+Front",
          "https://placehold.co/900x1100/7a2130/ffffff?text=Maroon+Pallu",
          "https://placehold.co/900x1100/7a2130/ffffff?text=Maroon+Border",
        ],
      },
      {
        id: "mustard",
        colorName: "Mustard",
        colorCode: "#c49225",
        price: 529,
        stock: 0,
        sku: "VV-WS-KC-001-MU",
        images: [
          "https://placehold.co/900x1100/c49225/ffffff?text=Mustard+Front",
          "https://placehold.co/900x1100/c49225/ffffff?text=Mustard+Pallu",
        ],
      },
      {
        id: "green",
        colorName: "Bottle Green",
        colorCode: "#234f39",
        price: 499,
        stock: 8,
        sku: "VV-WS-KC-001-GR",
        images: [
          "https://placehold.co/900x1100/234f39/ffffff?text=Green+Front",
          "https://placehold.co/900x1100/234f39/ffffff?text=Green+Pallu",
        ],
      },
    ],
  },
];