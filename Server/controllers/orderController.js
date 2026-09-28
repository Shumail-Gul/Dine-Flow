// import {Order} from "../models/Order.js";

export const getOrders = async (req, res) => {
  try {
    const adminId = req.user ? req.user._id : req.query.adminId;
    if (!adminId) return res.status(400).json({ message: "adminId is required" });

    const orders = await Order.find({ adminId }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { adminId, tableNumber, items, totalAmount } = req.body;
    if (!adminId) return res.status(400).json({ message: "adminId target is required to submit order" });

    const order = await Order.create({
      adminId,
      tableNumber,
      items,
      totalAmount,
    });

    return res.status(201).json(order);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const adminId = req.user ? req.user._id : req.query.adminId;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, ...(adminId ? { adminId } : {}) },
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json(order);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};