import  express  from "express";
const  router=express.Router()
import formidable from "express-formidable";
import { isAdmin, requireSignIn } from "../middilewares/authMiddileware.js";
import { createOrder, createProductController, deleteProductController, getAllMonthlySales, getAllOrders, getClientSecrets, getLatestOrders, getOrder, getProductController, getRelatedProducts, getSingleProductController, invoiceDownload, orderCancellaton, orderStatusUpdate, producByCategory, productFiltersController, productPhotoGetController, searchProductController, updateProductController } from "../controllers/productController.js";

router.post('/create-product',requireSignIn,isAdmin,  formidable(),createProductController)
router.get('/get-allproducts',getProductController)
router.get('/get-product/:id',getSingleProductController)
router.put('/update-product/:id',formidable(),updateProductController)
router.delete('/delete-product/:id',deleteProductController)
router.get('/get-productphoto/:id',productPhotoGetController)
router.post('/filter-products',productFiltersController)
router.get("/search/:keyword", searchProductController);
router.get("/get-relatedproducts/:pid/:cid", getRelatedProducts);
router.post('/payment-intent',getClientSecrets)
router.get('/get-productbyCategory/:id',producByCategory)
router.post('/create-order',  requireSignIn,createOrder )
router.get('/get-order-products',requireSignIn,getOrder)
router.put('/cancel-order/:id',requireSignIn,orderCancellaton)
router.get('/get-all-orders',requireSignIn,isAdmin,getAllOrders)
router.get('/get-latest-orders',requireSignIn,isAdmin,getLatestOrders)
router.get('/download-invoice/:id',requireSignIn,invoiceDownload)
router.put('/order-status-update/:id',requireSignIn,isAdmin,orderStatusUpdate)
router.get('/get-monthly-sales',getAllMonthlySales)

  

export default router