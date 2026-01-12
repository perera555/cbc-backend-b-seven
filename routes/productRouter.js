import express from 'express';
import { createProducts, deleteProduct, getProductById, getProducts, updateProduct } from '../controllers/productController.js';


const productRouter = express.Router(); 

productRouter.get("/", getProducts )

productRouter.post("/", createProducts)

productRouter.delete("/:productID", deleteProduct)

productRouter.put("/:productID", updateProduct)

productRouter.get("/:productID", getProductById)


export default productRouter;