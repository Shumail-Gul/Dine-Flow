import mongoose from "mongoose";

const modifierOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  priceDelta: { type: Number, default: 0 },
});

const modifierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [modifierOptionSchema],
});

const menuItemSchema = new mongoose.Schema(
  {
    adminId : {
      type: mongoose.Schema.Types.ObjectId,
      ref : "User",
      required: true,
      index : true
    },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true },
    modifiers: [modifierSchema],
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);