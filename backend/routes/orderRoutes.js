
import express from "express";
import jwt from "jsonwebtoken";
import Order from "../models/order.js";
import {
  authenticateUser,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Place a new order
router.post("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired login session",
      });
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    const cleanItems = items.map((item) => ({
      productId: String(item.productId || ""),
      name: String(item.name || ""),
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
      return res.status(400).json({
        success: false,
        message: "Invalid product details",
      });
    }

    const subtotal = cleanItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const shippingCharge = subtotal >= 1999 ? 0 : 99;
    const totalAmount = subtotal + shippingCharge;

    const order = await Order.create({
      userId: decoded.userId,
      items: cleanItems,
      shippingAddress,
      totalAmount,
      paymentMethod: paymentMethod === "ONLINE" ? "ONLINE" : "COD",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to place order",
    });
  }
});

// Get all orders of logged-in user
router.get("/my-orders", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired login session",
      });
    }

    const orders = await Order.find({
      userId: decoded.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
});

// ADMIN: Get all customers' orders
router.get(
  "/admin/all",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error("Admin Fetch Orders Error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to fetch all orders",
      });
    }
  }
);

// ADMIN: Update order status
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
        { orderId: req.params.orderId },
        { $set: { orderStatus: status } },
        { new: true, runValidators: true }
      ).populate("userId", "name email");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Admin Update Status Error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to update order status",
      });
    }
  }
);

// Get a specific order by Order ID
router.get("/:orderId", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    let decoded;

    try {
      const token = authHeader.split(" ")[1];
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired login session",
      });
    }

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

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch order details",
    });
  }
});

export default router;
