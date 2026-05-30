import express from "express";
import { createMovement, getMovements } from "../controllers/stockController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { stockMovementSchema } from "../utils/validators.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getMovements).post(validate(stockMovementSchema), createMovement);

export default router;
