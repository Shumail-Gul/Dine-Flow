// Server/models/Order.js

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
 
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  selectedModifiers: [String],
});

const orderSchema = new mongoose.Schema(
  { adminId : {
    type: mongoose.Schema.Types.ObjectId,
    ref : "User",
    required: true,
    index : true
  },
    tableNumber: { type: Number, required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);