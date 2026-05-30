import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validate.js";
import { productSchema, productUpdateSchema } from "../utils/validators.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getProducts).post(upload.single("image"), validate(productSchema), createProduct);
router
  .route("/:id")
  .get(getProduct)
  .put(upload.single("image"), validate(productUpdateSchema), updateProduct)
  .delete(deleteProduct);

export default router;
