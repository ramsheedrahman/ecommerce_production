import mongoose from "mongoose";
import colors from "colors";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://Ramsheed91:ecom%40123@cluster0.hi3bl1r.mongodb.net/ecommerce");
  

    console.log(
      `Conneted To Mongodb Databse ${conn.connection.host}`.bgMagenta.white
    );
  } catch (error) {
    console.log(`Errro in Mongodb ${error}`.bgRed.white);
    console.log('Retrying MongoDB connection...');
    setTimeout(() => connectDB(), 5000); // Retry after 5 seconds
  }
};

export default connectDB;



