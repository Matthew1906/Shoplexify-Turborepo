import multer from "multer";
import express from "express";
import { createProduct, getProduct, getProducts, updateProduct, updateProductStock } from "../controllers/products";
import { admin, auth } from "../middlewares";

const formDataHandler = multer();
const router = express.Router();

// Get all products
router.get('/', getProducts);

// Add new product
router.post("/", auth, admin, formDataHandler.none(), createProduct);

// Get one product
router.get("/:slug", getProduct);

// Update product
router.put("/:slug", auth, admin, formDataHandler.none(), updateProduct);

// Update product stock
router.patch("/:slug", auth, admin, formDataHandler.none(), updateProductStock)

export default router;