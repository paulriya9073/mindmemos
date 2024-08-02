const Note = require("../models/Note");
const User = require("../models/User");

exports.createNotes = async (req, res) => {
    try {

        const {  title, content, owner } = req.body


        let user = await User.findOne(req.user._id);
        if (!user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Login First"
                });
        }

        const note = await Note.create({  title, content, owner:req.user._id })

        await user.notes.unshift(note)
        await user.save();

        res.status(201).json({
            success: true,
            message:"Note created",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }

}

exports.updateNote=async(req,res)=>{
    try {
        let user = await User.findById(req.user._id);
        const note= await Note.findById(req.params.id)
        const {  title, content } = req.body
        if (!user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Login First"
                });
        }
        

        if(!note){
            return res.status(400).json({
                success:false,
                message:"Note not found"
            })
        }

        if (title) {
            note.title = title;
        }
        if (content) {
            note.content=content;
        }

        await note.save();

        res.status(200).json({
            success: true,
            message: "Note Updated",
        
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}

exports.deleteNote=async(req,res)=>{

    try{
        const user= await User.findById(req.user._id)

        if (!user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Login First"
                });
        }

        const note=await Note.findById(req.params.id)

        if(!note){
            res.status(400).json({
                success:false,
                message:"Note not found"
            })
        }
 
        if(note.owner.toString() !== req.user._id.toString()){
            return res.status(400).json({
                success:false,
                message:"Unauthorised!"
            })
        }

        
        await Note.deleteOne({_id: note._id });

        const index = user.notes.indexOf(req.params.id);
        user.notes.splice(index, 1);
    
        await user.save();
    
        res.status(200).json({
          success: true,
          message: "Note deleted",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

