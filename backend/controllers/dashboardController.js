import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const products = await Product.find();
  const totalStockValue = products.reduce(
    (sum, product) => sum + product.quantity * product.purchasePrice,
    0
  );
  const lowStockCount = products.filter((product) => product.quantity <= product.threshold).length;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlySales = await Sale.aggregate([
    { $match: { date: { $gte: startOfMonth } } },
    {
      $group: {
        _id: { $dayOfMonth: "$date" },
        total: { $sum: "$totalAmount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const topProducts = await Sale.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product",
        quantity: { $sum: "$products.quantity" },
        amount: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }
      }
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$product._id",
        name: "$product.name",
        reference: "$product.reference",
        quantity: 1,
        amount: 1
      }
    }
  ]);

  res.json({
    totalStockValue,
    lowStockCount,
    totalProducts: products.length,
    monthlySales: monthlySales.map((sale) => ({
      day: sale._id,
      total: sale.total,
      count: sale.count
    })),
    topProducts
  });
});
