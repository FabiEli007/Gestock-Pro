import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMovements = asyncHandler(async (req, res) => {
  const movements = await StockMovement.find()
    .populate("product", "name reference category")
    .populate("user", "name email")
    .sort({ date: -1 });

  res.json(movements);
});

export const createMovement = asyncHandler(async (req, res) => {
  const { product: productId, type, quantity, reason } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  if (type === "OUT" && product.quantity < quantity) {
    res.status(400);
    throw new Error("Stock insuffisant");
  }

  product.quantity += type === "IN" ? quantity : -quantity;
  await product.save();

  const movement = await StockMovement.create({
    product: productId,
    type,
    quantity,
    reason,
    user: req.user._id
  });

  const populatedMovement = await movement.populate("product", "name reference category");
  res.status(201).json(populatedMovement);
});
