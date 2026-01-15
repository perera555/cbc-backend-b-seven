import Product from "../models/product.js";
import Review from "../models/review.js";




// ADD REVIEW
export const addReview = async (req, res) => {
  try {
    const { productId, customerName, rating, comment } = req.body;

    const product = await Product.findOne({
      productID : productId
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.create({
      product: product._id,
      customerName,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET REVIEWS BY PRODUCT
export const getReviewsByProduct = async (req, res) => {
  try {
    const product = await Product.findOne(
        {productID : req.params.productId}
      
    )
    console.log(product)
    if(!product){
      res.status(404).json({
        message : "Invalid productID"
      })
      return
    }
    const reviews = await Review.find({
      product: product._id,
    }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN DELETE REVIEW
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
