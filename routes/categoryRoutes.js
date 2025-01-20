const express = require('express');
const {
    getCategories,
    creatCategory,
    getCategory,
    updateCategory,
    deletCategory
} 
=require('../services/categoryService')
const router=express.Router();

router.route('/')
.get(getCategories)
.post(creatCategory);
router.route('/:id').get(getCategory).put(updateCategory).delete(deletCategory);
module.exports=router;