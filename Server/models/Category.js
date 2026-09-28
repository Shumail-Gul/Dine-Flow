import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {adminId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true,
        index : true
      },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    displayOrder: { type: Number, default: 0 },
    restaurantId: { type: String, default: "default-restaurant" },
  },
  { timestamps: true }
);
categorySchema.index({ adminId : 1, name: 1}, {unique: true})

export default mongoose.model("Category", categorySchema);