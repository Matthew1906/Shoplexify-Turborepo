import express from "express";
import multer from "multer";
import { loginUser } from "../controllers/users";

const formDataHandler = multer();
const router: express.Router = express.Router();

router.post('/', formDataHandler.none(), loginUser);

export default router;