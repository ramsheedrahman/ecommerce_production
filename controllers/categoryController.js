import categoryschema from "../model/categoryschema.js";
import slugify from "slugify";

export const categorycreateController = async (req, res) => {
  console.log(req.user);
  try {
      const name = req.body.name;
      if (!name) {
          return res.status(400).json({
              success: false,
              message: 'Name is required',
          });
      }

      const existCategory = await categoryschema.findOne({ name });
      if (existCategory) {
          return res.status(400).json({
              success: false,
              message: 'Category Already Exists',
          });
      }

      const category = await new categoryschema({ name, slug: slugify(name) }).save();
      return res.status(201).json({
          success: true,
          message: 'Category Successfully Created',
          category: category,
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          success: false,
          message: 'An error occurred while creating the category',
          error: error,
      });
  }
};

export const categoryUpdateController=async(req,res)=>{
    try {
        const {name}=req.body
        const {id}=req.params
        if(!name){
           return res.status(401).send({message:'Name is required'})
       }
       const category=await categoryschema.findByIdAndUpdate(id,{name,slug:slugify(name)})
       await category.save()
       return res.status(200).send({
           message:'Category Upadated Successfully',
           success:true,
           category
       })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message:"error in update",
            success:false,
            error
        })
    }


}
export const categoryController = async (req, res) => {
    try {
      const category = await categoryschema.find({});
      res.status(200).send({
        success: true,
        message: "All Categories List",
        category,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error while getting all categories",
      });
    }
  };
  export const singleCategoryController = async (req, res) => {
    try {
      const category = await categoryModel.findOne({ slug: req.params.slug });
      res.status(200).send({
        success: true,
        message: "Get SIngle Category SUccessfully",
        category,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error While getting Single Category",
      });
    }
  };
  export const deleteCategoryCOntroller = async (req, res) => {
    try {
      const { id } = req.params;
      await categoryschema.findByIdAndDelete(id);
      res.status(200).send({
        success: true,
        message: "Categry Deleted Successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "error while deleting category",
        error,
      });
    }
  };