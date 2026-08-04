export const orders = [
  {
    orderId: "VV2026000123",

    customerName: "Vinodhini",

    orderType: "retail",

    status: "processing",

    payment: "UPI",

    courier: "Delhivery",

    trackingNumber: "DL987654321IN",

    estimatedDelivery: "25 Jul 2026",

    address: {
      name: "Vinodhini",

      phone: "9876543210",

      city: "Chennai",

      state: "Tamil Nadu",

      pincode: "600119",
    },

    timeline: [
      {
        title: "Order Confirmed",

        date: "22 Jul 2026 • 10:20 AM",

        status: "completed",
      },

      {
        title: "Payment Received",

        date: "22 Jul 2026 • 10:22 AM",

        status: "completed",
      },

      {
        title: "Processing",

        date: "Current Status",

        status: "current",
      },

      {
        title: "Packed",

        date: "Pending",

        status: "pending",
      },

      {
        title: "Shipped",

        date: "Pending",

        status: "pending",
      },

      {
        title: "Out for Delivery",

        date: "Pending",

        status: "pending",
      },

      {
        title: "Delivered",

        date: "Pending",

        status: "pending",
      },
    ],
  },
];