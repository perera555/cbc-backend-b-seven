import express from "express";
import {
  createProducts,
  deleteProduct,
  getProductById,
  getProducts,
  getProductsBySearch,
  updateProduct,
} from "../controllers/productController.js";

const productRouter = express.Router();

// ✅ GET ALL PRODUCTS
productRouter.get("/", getProducts);

// ✅ SEARCH PRODUCTS (MOVE THIS UP)
productRouter.get("/search/:query", getProductsBySearch);

// ✅ CREATE PRODUCT
productRouter.post("/", createProducts);

// ✅ UPDATE PRODUCT
productRouter.put("/:productID", updateProduct);

// ✅ DELETE PRODUCT
productRouter.delete("/:productID", deleteProduct);

// ✅ GET PRODUCT BY ID (KEEP THIS LAST)
productRouter.get("/:productID", getProductById);

export default productRouter;
