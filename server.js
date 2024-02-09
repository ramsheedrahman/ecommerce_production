import express from 'express'
import dotenv from "dotenv";
import cors from 'cors'
import morgan from "morgan";
import connectDB from './config/Db.js';
import authRoute from './routes/authRoute.js';
import categoryRoute from './routes/categoryRoute.js'
import productsRoute from './routes/productsRoute.js'
import path from 'path'
const app=express()
dotenv.config();
connectDB()
//middelwares
app.use(express.static(path.join(__dirname, './client/build')));
app.use(cors());
app.use(express.json({limit:'10mb'}));
app.use(morgan("dev"));
//routes
app.use("/auth", authRoute);
app.use("/category",categoryRoute);
app.use("/product",productsRoute);

app.use('*',function(req,res){
  res.sendFile(path.join(__dirname, './client/build/index.html'))
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
          console.log(
`Server Running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan
        .white
    );
  });
