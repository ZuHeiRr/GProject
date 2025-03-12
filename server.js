const express = require('express');
const dotenv= require("dotenv");
const morgan=require('morgan');
dotenv.config({path: "config.env"});
const dbconnection=require("./config/database")
const categoryRoute =require('./routes/categoryRoutes');
const ApiError = require('./utils/apiErrors');
//connect with db
dbconnection();

const app=express();
app.use(express.json());

if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
    console.log(`mode: ${process.env.NODE_ENV}`)
}

//mount routes
app.use('/api/v1/categories',categoryRoute);

app.all('*',(req,res,next)=>{

    //creat error and send it to error handling middleware
    // const err = new Error (`can't find this route ${req.originalUrl}`)
    // next(err.message);
    next(new ApiError(`con't find this route: ${req.originalUrl}`,400))
});

app.use((err,req,res,next)=>{
   err.statusCode=err.statusCode||500;
   err.status=err.status||'error';

   res.status(err.statusCode).json({
    status:err.status,
    error:err,
    message:err.message,
    stack:err.stack,
   })
})


const PORT=process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`listing on port ${PORT}`)
})