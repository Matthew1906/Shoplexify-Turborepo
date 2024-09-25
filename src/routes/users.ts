import express from "express";
import multer from "multer";
import { createUser, updateUser } from "../controllers/users";

const formDataHandler = multer();
const router = express.Router();

router.post('/', formDataHandler.none(), createUser);
router.patch("/", formDataHandler.none(), updateUser);

export default router;