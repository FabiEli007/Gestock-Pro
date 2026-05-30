import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import StockMovement from "../models/StockMovement.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find()
    .populate("products.product", "name reference category")
    .populate("user", "name email")
    .sort({ date: -1 });

  res.json(sales);
});

export const createSale = asyncHandler(async (req, res) => {
  const requestedItems = req.body.products;
  const productIds = requestedItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const saleItems = [];

  for (const item of requestedItems) {
    const product = productMap.get(item.product);

    if (!product) {
      res.status(404);
      throw new Error("Un produit de la vente est introuvable");
    }

    if (product.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Stock insuffisant pour ${product.name}`);
    }

    saleItems.push({
      product: product._id,
      quantity: item.quantity,
      price: item.price ?? product.sellingPrice
    });
  }

  const totalAmount = saleItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const sale = await Sale.create({
    products: saleItems,
    totalAmount,
    user: req.user._id
  });

  for (const item of saleItems) {
    const product = productMap.get(item.product.toString());
    product.quantity -= item.quantity;
    await product.save();

    await StockMovement.create({
      product: product._id,
      type: "OUT",
      quantity: item.quantity,
      reason: "Vente",
      saleId: sale._id,
      user: req.user._id
    });
  }

  const populatedSale = await Sale.findById(sale._id)
    .populate("products.product", "name reference category")
    .populate("user", "name email");

  res.status(201).json(populatedSale);
});
