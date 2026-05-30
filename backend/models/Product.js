import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    threshold: {
      type: Number,
      required: true,
      min: 0,
      default: 5
    },
    image: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", reference: "text", category: "text" });

export default mongoose.model("Product", productSchema);
