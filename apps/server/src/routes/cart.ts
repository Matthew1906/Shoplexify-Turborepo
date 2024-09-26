import express from "express";
import multer from "multer";
import { addOrder, checkoutOrders, deleteOrder, deleteOrders, editOrder, getOrder, getOrders } from "../controllers/cart";
import { auth } from "../middlewares";

const formDataHandler = multer();
const router: express.Router = express.Router();

router.get('/', auth, getOrders);
router.post("/:slug", auth, formDataHandler.none(), addOrder);
router.put("/", auth, formDataHandler.none(), checkoutOrders);
router.delete("/", auth, deleteOrders);

router.get("/:slug", auth, getOrder);
router.patch("/:slug", auth, formDataHandler.none(), editOrder);
router.delete("/:slug", auth, deleteOrder)

export default router;