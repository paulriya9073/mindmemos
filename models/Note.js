const mongoose=require("mongoose")

const noteSchema=new mongoose.Schema({
    title :{
        type:String,
        required:[true,"Please give a title"],
    },
    content:{
        type:String,
        required:[true,"Write down the note"],
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }



})

module.exports=mongoose.model("Note",noteSchema)