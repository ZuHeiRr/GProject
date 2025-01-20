const { default: slugify } = require('slugify');
const CategoryModel = require('../models/categoryModel');
const asyncHandler=require('express-async-handler');
const categoryModel = require('../models/categoryModel');


//@desc Getlist of category
//@route GET/api/v1/categories
//@access public
exports.getCategories =asyncHandler(async(req, res) => {
  const page =req.query.page *1 || 1;
  const limit = req.query.limit *1 ||5;
  const skip= (page-1)*limit;

  const categories=await categoryModel.find({}).skip(skip).limit(limit);
  res.status(200).json({results:categories.length,page,data:categories})
  
 res.send()
  
});


//@desc get spacific category by id
//@route GET /api/v1/categories/:id
//@access public
exports.getCategory=asyncHandler(async(req,res)=>{
  const{id}=req.params;
  const category=await categoryModel.findById(id);
  if(!category){
    res.status(404).json({msg:`No category for this id ${id}`});
  }
  res.status(200).json({data:category});
})


//@desc Creagt category
//@route POST /api/v1/categories
//@access Private
exports.creatCategory=asyncHandler(async(req,res)=>{
  const name =req.body.name;
  const category= await CategoryModel.create({name,slug:slugify(name)});
  res.status(201).json({data:category});
});

//@desc update spacific category
//@route PUT /api/v1/categories/:id
//@access private
 exports.updateCategory=asyncHandler(async(req,res)=>{
  const {id}=req.params;
  const {name}=req.body
  const category=await categoryModel.findByIdAndUpdate({_id:id},{name,slug:slugify(name)},{new:true});
  if(!category){
    res.status(404).json({msg:`No category for this id ${id}`});
  }
  res.status(200).json({data:category});
 });


 //@desc delet spacific category
//@route DELET /api/v1/categories/:id
//@access private
exports.deletCategory=asyncHandler(async(req,res)=>{
  const {id}=req.params;
  const {name}=req.body
  const category=await categoryModel.findByIdAndDelete(id);
  if(!category){
    res.status(404).json({msg:`No category for this id ${id}`});
  }
  res.status(204).json({msg:"category deleted successfully"});
 })