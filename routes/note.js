const express=require("express");
const { isAuthenticated } = require("../middleware/auth");
const { createNotes, updateNote, deleteNote, addCollaborator, removeCollaborator, togglePin } = require("../controllers/note");


const router=express.Router();


router.route("/newnote").post(isAuthenticated,createNotes);

router.route("/updatenote/:id").put(isAuthenticated,updateNote)

router.route("/deletenote/:id").delete(isAuthenticated,deleteNote)

router.route("/addcollaborator").post(isAuthenticated,addCollaborator)

router.route("/removecollaborator").post(isAuthenticated,removeCollaborator)

router.route("/pin/:id").put(isAuthenticated, togglePin);


module.exports=router