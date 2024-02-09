import express from 'express'
import { isAdmin, requireSignIn } from '../middilewares/authMiddileware.js';
import { categoryController, categoryUpdateController, categorycreateController, deleteCategoryCOntroller, singleCategoryController } from '../controllers/categoryController.js';
const router = express.Router();

router.post('/create-category',requireSignIn,isAdmin,categorycreateController)
router.put('/update-category/:id',requireSignIn,isAdmin,categoryUpdateController)
router.get('/get-category',categoryController)
router.get('/single-category/:slug',singleCategoryController)
router.delete('/delete-category/:id',requireSignIn,isAdmin,deleteCategoryCOntroller)





export default router