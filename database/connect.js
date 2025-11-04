const mongoose=require("mongoose")

exports.connectDatabase=()=>{
mongoose
    .connect(process.env.MONGO_URL)
    .then((con)=>console.log(`Database Conected :${con.connection.host}`))
    .catch((e)=>console.log(e))
}