import express from "express";
import multer from "multer";
import { createUser, updateUser } from "../controllers/users";
import { auth } from "../middlewares";

const formDataHandler = multer();
const router: express.Router = express.Router();

router.post('/', formDataHandler.none(), createUser);
router.patch("/", auth, formDataHandler.none(), updateUser);

export default router;