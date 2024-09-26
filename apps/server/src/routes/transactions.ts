import express from "express";
import { getTransaction, getTransactions, updateTransactionStatus } from "../controllers/transactions";
import { admin, auth } from "../middlewares";

const router: express.Router = express.Router();

router.get("/", auth, getTransactions);
router.get("/:id", auth, getTransaction);
router.patch("/:id", auth, admin, updateTransactionStatus)

export default router;