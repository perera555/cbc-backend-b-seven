import Product from "../models/product.js";
import Review from "../models/review.js";

/* ================= ADD REVIEW ================= */
export const addReview = async (req, res) => {
  try {
    const { productId, customerName, rating, comment } = req.body;

    const product = await Product.findOne({ productID: productId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.create({
      product: product._id,
      customerName,
      rating,
      comment,
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= GET REVIEWS BY PRODUCT ================= */
export const getReviewsByProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      productID: req.params.productId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Invalid productID",
      });
    }

    const reviews = await Review.find({
      product: product._id,
    }).sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE REVIEW (ADMIN) ================= */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();

    return res.json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getLatestReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("product", "name productID");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

