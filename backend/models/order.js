
import mongoose from "mongoose";
import crypto from "crypto";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () =>
        `VOGUE-${Date.now()}-${crypto.randomBytes(3)
          .toString("hex")
          .toUpperCase()}`,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: String,
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: String,
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // Payment Method
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE", "DEMO_UPI", "DEMO_CARD"],
      default: "COD",
      required: true,
    },

    // Payment Status
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    // Demo Payment Details
    isDemoPayment: {
      type: Boolean,
      default: false,
    },

    demoPaymentReference: {
      type: String,
      default: "",
    },

    // Old Razorpay Details (kept for compatibility)
    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    paymentVerifiedAt: {
      type: Date,
      default: null,
    },

    paymentFailureReason: {
      type: String,
      default: "",
    },

    // Order Status
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    // Cancellation Details
    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
