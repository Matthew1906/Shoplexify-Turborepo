import express from "express";
import multer from "multer";
import { createEditReview, getReviews } from "../controllers/reviews";
import { auth } from "../middlewares";

const formDataHandler = multer();
const router: express.Router = express.Router();

router.get('/:slug', auth, getReviews);
router.post('/', auth, formDataHandler.none(), createEditReview);

export default router;