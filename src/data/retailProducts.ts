import type { Product } from "./wholesaleProducts";

export const retailProducts: Product[] = [
  {
    id: 1,
    slug: "khadi-cotton-saree",
    name: "Khadi Cotton Saree",
    category: "Cotton Sarees",
    fabric: "Khadi Cotton",
    state: "Tamil Nadu",
    description:
      "A graceful Khadi cotton saree designed for everyday elegance, festivals and special occasions.",
    rating: 4,
    reviews: [
      {
        id: 1,
        reviewerName: "Anitha",
        rating: 5,
        review:
          "The saree is very soft and comfortable. Colour and quality were excellent.",
        date: "14 July 2026",
        verified: true,
      },
    ],
    variants: [
      {
        id: "maroon",
        colorName: "Maroon",
        colorCode: "#7a2130",
        price: 899,
        stock: 12,
        sku: "VV-RT-KC-001-MR",
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
        price: 949,
        stock: 5,
        sku: "VV-RT-KC-001-MU",
        images: [
          "https://placehold.co/900x1100/c49225/ffffff?text=Mustard+Front",
          "https://placehold.co/900x1100/c49225/ffffff?text=Mustard+Pallu",
        ],
      },
      {
        id: "green",
        colorName: "Bottle Green",
        colorCode: "#234f39",
        price: 899,
        stock: 0,
        sku: "VV-RT-KC-001-GR",
        images: [
          "https://placehold.co/900x1100/234f39/ffffff?text=Green+Front",
          "https://placehold.co/900x1100/234f39/ffffff?text=Green+Pallu",
        ],
      },
    ],
  },
];