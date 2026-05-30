import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUploadedImageUrl = (req) => {
  if (!req.file) return undefined;
  const baseUrl = process.env.UPLOAD_BASE_URL || `${req.protocol}://${req.get("host")}/uploads`;
  return `${baseUrl}/${req.file.filename}`;
};

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, lowStock } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { reference: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }

  if (category) filter.category = category;

  const products = await Product.find(filter).sort({ createdAt: -1 });
  const filteredProducts =
    lowStock === "true" ? products.filter((product) => product.quantity <= product.threshold) : products;

  res.json(filteredProducts);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const image = getUploadedImageUrl(req) || req.body.image || "";
  const product = await Product.create({ ...req.body, image });

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const image = getUploadedImageUrl(req);
  const payload = image ? { ...req.body, image } : req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

  res.json({ message: "Produit supprime" });
});
