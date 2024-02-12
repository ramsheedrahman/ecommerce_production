import express from 'express'
import {forgotPasswordController, loginController, registerController, resetPasswordController, testController} from '../controllers/authcontrollers.js';
import { isAdmin, requireSignIn } from '../middilewares/authMiddileware.js';

const router = express.Router();

router.post('/register',registerController)

router.post('/login',loginController)
router.get('/',async (req,res)=>{
   try {
    res.send('hiiii')
   } catch (error) {
    console.log(error);
   }
})

router.post('/forgetpassword',forgotPasswordController)
router.get('/get-auth', requireSignIn,(req,res)=>{
   try {
      res.status(200).send({ok:true})
   } catch (error) {
      console.log(error);
   }
})

router.post('/reset-password/:id',resetPasswordController)
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
   res.status(200).send({ ok: true });
 });

export default router;