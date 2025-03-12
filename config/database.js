const mongoose=require('mongoose');

const dbconnection=()=>{
    mongoose
    .connect(process.env.DB_URI)
    .then((conn)=>{
        console.log(`Database connected: ${conn.connection.host}`);
    })
    .catch((err)=>{
        console.log(`Database Error: ${err}`);
        process.exit(1);
    });
};
module.exports=dbconnection;