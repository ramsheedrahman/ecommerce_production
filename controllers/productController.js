import productSchema from "../model/productSchema.js";
import categoryschema from "../model/categoryschema.js";
import slugify from "slugify";
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid';
import mongoose from "mongoose";
import stripe from 'stripe';
import orderSchema from "../model/oederSchema.js";
const stripeInstance = stripe('sk_test_HpOseewlg7jroZ7Fmu66hUf9005d8TvxWu',{apiVersion: "2023-10-16"});
import createInvoice from '../helpers/pdfGenerator.js'
import { fileURLToPath, URL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));



export const createProductController = async (req, res) => {
    try {
      const { name, description, price, quantity,category,size,color,brand} =
        req.fields;
      const { photo } = req.files;
      //alidation
       

      if (!name) {
        return res.status(500).send({ error: "Name is Required" });
    }
    if (!description) {
        return res.status(500).send({ error: "Description is Required" });
    }
    if (!price) {
        return res.status(500).send({ error: "Price is Required" });
    }
    if (!category) {
        return res.status(500).send({ error: "Category is Required" });
    }
    if (!quantity) {
        return res.status(500).send({ error: "Quantity is Required" });
    }
    
if(photo && photo.size > 1000000){
return res
            .status(500)
            .send({ error: "photo is Required and should be less then 1mb" });
}

const productsData = {
  name,
  description,
  price,
  quantity,
  category,
  brand,
  size: size || "", // Set to an empty string if not provided
  color: color || "", // Set to an empty string if not provided
};
      const products = new productSchema(productsData);
      if (photo) {
        products.photo.data = fs.readFileSync(photo.path);
        products.photo.contentType = photo.type;
        console.log(products.photo.data);
        console.log(products.photo.contentType );
      }
      await products.save();
      res.status(201).send({
        success: true,
        message: "Product Created Successfully",
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error in crearing product",
      });
    }
  };
  export const getProductController = async (req, res) => {
    try {
      const products = await productSchema
        .find({})
        .populate("category")
        .select("-photo")
        .limit(12)
        .sort({ createdAt: -1 });
      res.status(200).send({
        success: true,
        counTotal: products.length,
        message: "ALlProducts ",
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Erorr in getting products",
        error: error.message,
      });
    }
  };
  export const getSingleProductController = async (req, res) => {
    try {
      const product = await productSchema
        .findOne({_id:req.params.id})
        .select("-photo")
        .populate("category");
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "Product not found",
        });
      }
      console.log(product);
      res.status(200).send({
        success: true,
        message: "Single Product Fetched",
        product,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error while getting single product",
        error: error.message,
      });
    }
    
  };
  export const productPhotoGetController=async(req,res)=>{
     try {
      const product= await productSchema.findById(req.params.id).select("photo")
       if(product.photo.data){
        res.set('Content-type',product.photo.contentType)
        return res.status(200).send(product.photo.data)
       }
     } catch (error) {
      return res.status(500).send({
        success:false,
        message:'Error in Get Photo',
        error
      })
     }
  }
  export const deleteProductController = async (req, res) => {
    try {
      await productSchema.findByIdAndDelete(req.params.id)
      res.status(200).send({
        success: true,
        message: "Product Deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error while deleting product",
        error,
      });
    }
  };
  export const updateProductController = async (req, res) => {
    try {
      const { name, description, price, category, quantity, shipping } =
        req.fields;
      const { photo } = req.files;

      //alidation
     
      if (!name) {
        return res.status(500).send({ error: "Name is Required" });
    }
    if (!description) {
        return res.status(500).send({ error: "Description is Required" });
    }
    if (!price) {
        return res.status(500).send({ error: "Price is Required" });
    }
    if (!category) {
        return res.status(500).send({ error: "Category is Required" });
    }
    if (!quantity) {
        return res.status(500).send({ error: "Quantity is Required" });
    }
    if(photo && photo.size > 1000000){
        return res.status(500).send({ error: "photo is Required and should be less then 1mb" });
}
  
const products = await productSchema.findByIdAndUpdate(
  req.params.id,
  { ...req.fields, slug: slugify(name) },
  { new: true }
);
if (!products) {
  return res.status(404).send({
    success: false,
    message: "Product not found",
  });
}

if (photo) {
  products.photo.data = fs.readFileSync(photo.path);
  products.photo.contentType = photo.type;
}
await products.save();

      res.status(201).send({
        success: true,
        message: "Product Updated Successfully",
        products,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send({
        success: false,
        error,
        message: "Error in Updte product",
      });
    }
  };
  export const productFiltersController = async (req, res) => {
    try {
      const { selectedCategories, selectedPrices } = req.body;
      let args = {};
      if (selectedCategories.length > 0) args.category = selectedCategories;
      if (selectedPrices.length) args.price = { $gte: selectedPrices[0], $lte: selectedPrices[1] };
      const products = await productSchema.find(args);
      res.status(200).send({
        success: true,
        products,
      });
      console.log(args);
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error WHile Filtering Products",
        error,
      });
    }
  };
  export const searchProductController = async (req, res) => {
    try {
      const { keyword } = req.params;
      const resutls = await productSchema
        .find({
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        })
        .select("-photo");
      res.json(resutls);
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error In Search Product API",
        error,
      });
    }
  };
  export const getRelatedProducts = async (req, res) => {
    const { pid, cid } = req.params;
    try {
      const relatedProducts = await productSchema
        .find({ category: cid, _id: { $ne: pid } })
        .select('-photo')
        .limit(3)
        .populate('category')
  
      console.log(relatedProducts);
      res.status(200).send({
        success: true,
        relatedProducts,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: 'error while getting related products',
      });
    }
  };
  
  export const getClientSecrets = async (req, res) => {
    const { amount } = req.body;
    const parsedAmount = parseInt(amount, 10);

    try {
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: parsedAmount,
        currency: 'inr',
        payment_method_types: ['card'],
    
      });
  
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went error' ,success:false});
    }
  };
  
  export const createOrder=async(req,res)=>{
    const {cart,paymentIntent,totalQuantity}=req.body
    const orderId=uuidv4();
const shortOrderId=orderId.slice(0, 6);

    console.log(req.body);
    try {
      const originalAmount = paymentIntent.amount / 100;

      const order =await new orderSchema({
        products: cart,
        quantity:totalQuantity,
        payment: {...paymentIntent,originalAmount: originalAmount,
        },
        buyer: req.user._id,
        orderID:shortOrderId

      }).save();

      
      const pdfFilePath = 'C:\\Users\\Lenovo\\Desktop\\ecommerce\\invoices\\809ec1.pdf';
      createInvoice(order, pdfFilePath);

    } catch (error) {
      console.log(error);
    }
    
  }

export const invoiceDownload = async (req, res) => {
  try {
    const {id} = req.params; 
    const pdfFilePath = `C:\\Users\\Lenovo\\Desktop\\ecommerce\\invoices\\${id}.pdf`;

    res.download(pdfFilePath, (error) => {
      if (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          error,
          message: "Error in Invoice Download",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Something goes error",
    });
  }
};

    

  
  export const producByCategory = async (req, res) => {
  try {
    const category = await categoryschema.findOne({ _id:req.params.id});
    const products = await productSchema.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};
export const getOrder=async(req,res)=>{
  try {
   
    const orderProducts= await orderSchema.find({buyer:req.user._id}).populate('products','-photo').populate('buyer','name').sort({ createdAt: -1 });

    res.status(200).send(orderProducts);
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success:false,
      message:'error while getting orders'
    })
  }

}
export const orderCancellaton =async(req,res)=>{
  const {id}=req.params
  const {status}=req.body
  console.log(id);
  try {
    const order = await orderSchema.findOne({ orderID:id });
    console.log(order);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.status !== "Not Process") {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled" });
    }
    order.status =status;
    await order.save()

  } catch (error) {
    console.log(error);
  }
}
export const getAllOrders = async (req, res) => {
  try {
    const allOrders = await orderSchema.find().populate('buyer', 'name').populate('products', '-photo');
    res.status(200).send(allOrders);
  } catch (error) {
    // Send a more detailed error response
    res.status(500).send({
      success: false,
      message: 'Error while getting all orders',
      error: error.message, 
    });
  }
};
export const getLatestOrders=async (req,res)=>{
  try {
    const latestOrders=await orderSchema.find().populate('buyer','name').populate('products','-photo')
    .sort({createdAt:-1}).limit(10)
    res.status(200).send(latestOrders)
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Error while getting latest orders',
      error: error.message,
    });

  }
}

export const orderStatusUpdate =async(req,res)=>{
  const {id}=req.params
  const {status}=req.body
  console.log(id);
  try {
    const order = await orderSchema.findOne({ orderID:id });
    console.log(order);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    order.status =status;
    await order.save()
    return res.status(200).json({ success: true, message: "Status updated" });

  } catch (error) {
    console.log(error);
  }
}
export const getAllMonthlySales = async (req, res) => {
  try {
    const monthlySales = await orderSchema.aggregate([
      { $group: {
        _id: { $month: '$createdAt' },
       totalSales: { $sum: '$payment.amount' }
      }
    }
    ]);

    const salesData = monthlySales.map(({ _id, totalSales }) => ({
      month: getMonthName(_id),
      sales: totalSales,
    }));
    console.log(salesData);
    return res.json(salesData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to retrieve sales data' });
  }
};

function getMonthName(monthNumber) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months[monthNumber - 1];
}


