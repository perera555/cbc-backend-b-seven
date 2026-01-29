import express from "express";
import { addReview, deleteReview, getLatestReviews, getReviewsByProduct } from "../controllers/reviewController.js";


const reviewRouter = express.Router();

reviewRouter.post("/", addReview);

reviewRouter.get("/:productId", getReviewsByProduct);

reviewRouter.get("/latest", getLatestReviews);

reviewRouter.delete("/:reviewId", deleteReview); // ADMIN


export default reviewRouter;


