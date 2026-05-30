import express from "express";
import { createSale, getSales } from "../controllers/saleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { saleSchema } from "../utils/validators.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getSales).post(validate(saleSchema), createSale);

export default router;
