const mongoose = require("mongoose")
const bycrpt=require("bcrypt")
const jwt = require("jsonwebtoken");
const crypto=require("crypto")


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "please enter your username"],
        unique: [true, "This Username is not available"],

    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: [true, "Email already exist"],
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false
    },
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note"
        },
    ],

resetPasswordToken:String,
resetPasswordExpire:Date,
});

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password=await bycrpt.hash(this.password,10)
    }
    next();
});

userSchema.methods.matchPassword=async function(password){
    return await bycrpt.compare(password,this.password)
};

userSchema.methods.generateToken=function () {
    return jwt.sign({_id:this._id},process.env.JWT_SECRET)
}

//generate reset token and expire token time

userSchema.methods.getResetToken=function(){

    const resetToken=crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken=crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire=Date.now()+15*60*1000;

     return resetToken;
}

module.exports=new mongoose.model("User",userSchema);