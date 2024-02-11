import userModel from "../model/userSchema.js";
import { hashPassword,comparePassword} from "../helpers/authHelper.js";
import  jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'
import async from "hbs/lib/async.js";
export const registerController = async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;
      //validations
      if (!name) {
        return res.send({ message: "Name is Required" });
      }
      if (!email) {
        return res.send({ message: "Email is Required" });
      }
      if (!password) {
        return res.send({ message: "Password is Required" });
      }
      if (!phone) {
        return res.send({ message: "Phone no is Required" });
      }
      if (!address) {
        return res.send({ message: "Address is Required" });
      }
    
      //check user
      const exisitingUser = await userModel.findOne({ email });
      //exisiting user
      if (exisitingUser) {
        return res.status(200).send({
          success: false,
          message: "Already Register please login",
        });
      }
      //register user
      const hashedPassword = await hashPassword(password);
      //save
      const user = await new userModel({
        name,
        email,
        phone,
        address: {
          area: address.area,
          city: address.city,
          district: address.district,
          state: address.state,
          postalCode: address.postalCode,
        },
        password: hashedPassword,
       
      }).save();
  
      res.status(201).send({
        success: true,
        message: "User Registerd Successfully",
        user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Errro in Registeration",
        error,
      });
    }
  };
  export const loginController = async (req, res) => {
    try {
      const { email, password } = req.body;
      //validation
      if (!email || !password) {
        return res.status(404).send({
          success: false,
          message: "Invalid email or password",
        });
      }
      //check user
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Email is not registerd",
        });
      }
      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.status(200).send({
          success: false,
          message: "Invalid Password",
        });
      }
      //token
      const token = await jwt.sign({ _id: user._id },process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({
        success: true,
        message: "login successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
        token,
        },
        
      );
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in login",
        error,
      });
    }
  };
  export const testController=(req,res)=>{
    try {
      console.log('protected route');
    } catch (error) {
      console.log(error);
    }
 
  }

  export const forgotPasswordController=async(req,res)=>{
    const email=req.body.email
    console.log(email);
    try {
      const validUser=await userModel.findOne({ email });
      if(validUser){
        res.status(200).send({
          success: true,
          message: "Valid email",
        user:validUser})
        const transporter = nodemailer.createTransport({
          service: 'Gmail', // e.g., 'Gmail', 'Outlook', 'Yahoo', etc.
          auth: {
            user: 'ramsheedkk06@gmail.com',
            pass: 'ahyetfzwdgpgxcmc',
          },
        });
        const mailOptions = {
          from: 'ramsheedkk06@gmail.com',
          to: validUser.email,
          subject: 'Password Reset',
          text: `Here is your link for reset password- http://localhost:3000/reset-password/${validUser._id}`
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }
      else{
        console.log('inavlid email');
        return res.status(200).send({
          success: false,
          message: "Invalid Email",
        });      }
  
    } catch (error) {
      return res.send(error.message)
    }

    
   
  }
  export const resetPasswordController=async(req, res)=> {
    const newPassword = req.body.newPassword;
    const id = req.params.id;
  
    try {
      // Find the user by ID
      const user = await userModel.findById(id);
  
      if (!user) {
        return res.status(404).send({success:false, message: "User not found" });
      }
      
      const hashedPassword = await hashPassword(newPassword);

      // Update the user's password
      user.password = hashedPassword;
  
      // Save the updated user
      await user.save();
  
      return res.status(200).send({ success:true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
  