import express from "express";
import { getMetrics, getOrderMetrics, getTopProducts } from "../controllers/admin";
import { admin, auth } from "../middlewares";

const router = express.Router();

router.get("/", auth, admin, getMetrics);
router.get("/products", auth, admin, getTopProducts);
router.get("/transactions", auth, admin, getOrderMetrics)

export default router;