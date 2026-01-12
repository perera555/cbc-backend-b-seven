import Product from "../models/product.js";
import { isAdmin } from "./userController.js";



export async function createProducts(req, res) {

    if(!isAdmin(req)){
        res.status(403).json({
            message: "Access denied! only admin can create product data"
        })
        return;
    }


    try {
        const productData = req.body;

        const product = new Product(productData)

        await product.save()

        res.status(201).json({
            message: "Product created successfully",
            product: product,
        })
    } catch (err) {
        res.status(500).json({
            message: "Error creating product",
            error: err.message,
        })
    }

}

export async function getProducts(req, res) {

    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving products",
            error: err.message,
        })
    }
}

export async function deleteProduct(req, res) {

    if(!isAdmin(req)){
        res.status(403).json({
            message: "Access denied! only admin can delete product data"
        })
        return;
    }

    try {
        const productID = req.params.productID;
      await Product.deleteOne(
        {productID: productID}
    ); 
        res.status(200).json({
            message: "Product deleted successfully",

           
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error deleting product",
            error: err.message,
        })
    }
}

export async function updateProduct(req, res) {

    if(!isAdmin(req)){
        res.status(403).json({
            message: "Access denied! only admin can update product data"
        })
        return;
    }   

    try {
        const productID = req.params.productID;
        const updateData = req.body;
        await Product.updateOne({productID : productID},
             updateData

        ); 
        res.status(200).json({
            message: "Product updated successfully",
            product: updateData,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error updating product",
            error: err.message,
        })
    }
}

export async function getProductById(req, res) {
    try {
        const productID = req.params.productID;
        
        const product = await Product.findOne({
             productID: productID
             });

        if (product === null) {
            return res.status(404).json(
                { 
                    message: "Product not found"
                 });
        } else  {
        res.status(200).json(product);
        }
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving product  by ID",
            error: err.message,
        });
    }   
}
