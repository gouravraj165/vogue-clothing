
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import Order from "../models/order.js";

import {
  authenticateUser,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ========================================
// HELPER: VERIFY LOGIN TOKEN
// ========================================

const getLoggedInUser = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Please login first",
    });
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired login session",
    });

    return null;
  }
};

// ========================================
// HELPER: VALIDATE ORDER DETAILS
// ========================================

const validateOrderDetails = (items, shippingAddress) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Your cart is empty" };
  }

  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.phone ||
    !shippingAddress?.address ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.pincode
  ) {
    return {
      error: "Complete shipping address is required",
    };
  }

  const cleanItems = items.map((item) => ({
    productId: String(item.productId || ""),
    name: String(item.name || "").trim(),
    price: Number(item.price),
    quantity: Number(item.quantity),
    image: String(item.image || ""),
  }));

  const invalidItem = cleanItems.some(
    (item) =>
      !item.name ||
      !Number.isFinite(item.price) ||
      item.price <= 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
  );

  if (invalidItem) {
    return { error: "Invalid product details" };
  }

  const subtotal = cleanItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shippingCharge = subtotal >= 1999 ? 0 : 99;

  const totalAmount = Number(
    (subtotal + shippingCharge).toFixed(2)
  );

  return {
    cleanItems,
    shippingAddress,
    totalAmount,
  };
};

// ========================================
// 1. COD: PLACE ORDER
// POST /api/orders
// ========================================

router.post("/", async (req, res) => {
  try {
    const decoded = getLoggedInUser(req, res);
    if (!decoded) return;

    const { items, shippingAddress, paymentMethod } = req.body;

    if (paymentMethod && paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Use the demo payment endpoint for online payment",
      });
    }

    const validated = validateOrderDetails(
      items,
      shippingAddress
    );

    if (validated.error) {
      return res.status(400).json({
        success: false,
        message: validated.error,
      });
    }

    const order = await Order.create({
      userId: decoded.userId,
      items: validated.cleanItems,
      shippingAddress: validated.shippingAddress,
      totalAmount: validated.totalAmount,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      isDemoPayment: false,
      orderStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "COD order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("COD Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to place COD order",
    });
  }
});

// ========================================
// 2. DEMO UPI / CARD PAYMENT
// POST /api/orders/demo-payment
// ========================================

router.post("/demo-payment", async (req, res) => {
  try {
    const decoded = getLoggedInUser(req, res);
    if (!decoded) return;

    const {
      items,
      shippingAddress,
      paymentMethod,
      demoResult,
    } = req.body;

    // Only these two demo payment methods are allowed.
    if (!["DEMO_UPI", "DEMO_CARD"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid demo payment method",
      });
    }

    // User can simulate success or failure.
    if (!["success", "failure"].includes(demoResult)) {
      return res.status(400).json({
        success: false,
        message: "Invalid demo payment result",
      });
    }

    const validated = validateOrderDetails(
      items,
      shippingAddress
    );

    if (validated.error) {
      return res.status(400).json({
        success: false,
        message: validated.error,
      });
    }

    const paymentSuccessful = demoResult === "success";

    const order = await Order.create({
      userId: decoded.userId,
      items: validated.cleanItems,
      shippingAddress: validated.shippingAddress,
      totalAmount: validated.totalAmount,

      paymentMethod,
      paymentStatus: paymentSuccessful ? "Paid" : "Failed",

      isDemoPayment: true,
      demoPaymentReference: `DEMO-${crypto
        .randomBytes(5)
        .toString("hex")
        .toUpperCase()}`,

      paymentVerifiedAt: paymentSuccessful ? new Date() : null,

      paymentFailureReason: paymentSuccessful
        ? ""
        : "Demo payment failure simulated by user",

      orderStatus: paymentSuccessful ? "Confirmed" : "Pending",
    });

    return res.status(201).json({
      success: true,
      isDemoPayment: true,
      message: paymentSuccessful
        ? "Demo payment successful! Order confirmed."
        : "Demo payment failed. No money was deducted.",
      paymentStatus: order.paymentStatus,
      order,
    });
  } catch (error) {
    console.error("Demo Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process demo payment",
    });
  }
});

// ========================================
// 3. GET ALL ORDERS OF LOGGED-IN USER
// GET /api/orders/my-orders
// ========================================

router.get("/my-orders", async (req, res) => {
  try {
    const decoded = getLoggedInUser(req, res);
    if (!decoded) return;

    const orders = await Order.find({
      userId: decoded.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
});

// ========================================
// 4. CUSTOMER: CANCEL OWN ORDER
// PATCH /api/orders/:orderId/cancel
// ========================================

router.patch("/:orderId/cancel", async (req, res) => {
  try {
    const decoded = getLoggedInUser(req, res);
    if (!decoded) return;

    const { cancellationReason } = req.body;

    if (
      typeof cancellationReason !== "string" ||
      !cancellationReason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    if (cancellationReason.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason cannot exceed 300 characters",
      });
    }

    const existingOrder = await Order.findOne({
      orderId: req.params.orderId,
      userId: decoded.userId,
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Real ONLINE paid orders need a refund process.
    // Demo payments can be cancelled because no real money is involved.
    if (
      existingOrder.paymentMethod === "ONLINE" &&
      existingOrder.paymentStatus === "Paid"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This online order has already been paid. Please contact support for cancellation and refund.",
      });
    }

    const canCancelPaidDemo =
      existingOrder.isDemoPayment === true;

    const order = await Order.findOneAndUpdate(
      {
        orderId: req.params.orderId,
        userId: decoded.userId,

        orderStatus: {
          $in: ["Pending", "Confirmed"],
        },

        $or: [
          { paymentStatus: { $ne: "Paid" } },
          { isDemoPayment: true },
          { paymentMethod: "COD" },
        ],
      },
      {
        $set: {
          orderStatus: "Cancelled",
          cancellationReason: cancellationReason.trim(),
          cancelledAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(409).json({
        success: false,
        message: "This order cannot be cancelled",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully!",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel order",
    });
  }
});

// ========================================
// 5. ADMIN: GET ALL CUSTOMERS' ORDERS
// GET /api/orders/admin/all
// ========================================

router.get(
  "/admin/all",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error("Admin Fetch Orders Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch all orders",
      });
    }
  }
);

// ========================================
// 6. ADMIN: UPDATE ORDER STATUS
// PATCH /api/orders/admin/:orderId/status
// ========================================

router.patch(
  "/admin/:orderId/status",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      const { status } = req.body;

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
          allowedStatuses,
        });
      }

      const order = await Order.findOneAndUpdate(
        {
          orderId: req.params.orderId,
        },
        {
          $set: {
            orderStatus: status,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("userId", "name email");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Admin Update Status Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update order status",
      });
    }
  }
);

// ========================================
// 7. GET SPECIFIC ORDER BY ORDER ID
// GET /api/orders/:orderId
// ========================================

router.get("/:orderId", async (req, res) => {
  try {
    const decoded = getLoggedInUser(req, res);
    if (!decoded) return;

    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: decoded.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order details",
    });
  }
});

export default router;
