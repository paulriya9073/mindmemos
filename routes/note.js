const express=require("express");
const { isAuthenticated } = require("../middleware/auth");
const { createNotes, updateNote, deleteNote } = require("../controllers/note");


const router=express.Router();


router.route("/newnote").post(isAuthenticated,createNotes);

router.route("/updatenote/:id").put(isAuthenticated,updateNote)

router.route("/deletenote/:id").delete(isAuthenticated,deleteNote)


module.exports=router