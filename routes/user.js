const express=require("express");
const { register, login, logout, myProfile, updateProfile, deleteMyProfile, updatePassword, getMyNotes, forgetPassword, resetPassword } = require("../controllers/user");
const { isAuthenticated } = require("../middleware/auth");




const router=express.Router();

router.route("/register").post(register)

router.route("/login").post(login)

router.route("/logout").get(logout)

router.route("/myprofile").get(isAuthenticated ,myProfile)

router.route("/update/myprofile").put(isAuthenticated,updateProfile)

router.route("/deleteprofile").delete(isAuthenticated,deleteMyProfile)

router.route("/update/password").put(isAuthenticated,updatePassword)

router.route("/mynotes").get(isAuthenticated,getMyNotes)

router.route("/forget/password").post(forgetPassword)

router.route("/reset/password/:token").post(resetPassword)


module.exports=router