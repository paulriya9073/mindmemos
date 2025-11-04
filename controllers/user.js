const { sendEmail } = require("../middleware/sendEmail");
const Note = require("../models/Note");
const User = require("../models/User")
const crypto=require("crypto")


exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "User already exist"
                });
        }
        user = await User.create({
            username,
            email,
            password,
        });

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        res.status(201).cookie("token", token, options).json({
            success: true,
            user,
            token,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
            .select("+password")
        .populate("notes");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exist",
            })
        }

        const ismatch = await user.matchPassword(password)

        if (!ismatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password",
            })
        };


        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.status(200).cookie("token", token, options).json({
            success: true,
            user,
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res
            .status(200)
            .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
            .json({
                success: true,
                message: "Logged Out"
            });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("notes");
     

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        const { username, email } = req.body

        if (username) {
            user.username = username;
        }
        if (email) {
            user.email = email;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile Updated",
            user,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

};

exports.updatePassword = async (req, res) => {

    try {

        const user = await User.findById(req.user._id).select("+password")

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword)
         {
            res.status(400).json({
                success: false,
                message: "Please enter Old Password and New Password"
            })
        }

        const isMatch = await user.matchPassword(oldPassword);

        if (isMatch) {
            user.password = newPassword;
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Password Updated!"
            })
        }
        res.status(400).json({
            success: false,
            message: "Incorrect Old password",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}




exports.deleteMyProfile = async (req, res) => {

    try {
        const user = await User.findById(req.user._id);
        const notes=user.notes;


        // delete notes from Notes model

        for(let i=0;i<notes.length;i++){
            const note=await Note.findById(notes[i]);
            await note.deleteOne({id: note._id});
        }

    // Logout user after deleting profile
        await user.deleteOne({ id: user._id });

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "Profile Deleted",
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.forgetPassword=async(req,res)=>{
try{

    const {email}=req.body;

    const user=await User.findOne({email})

    if(!user){
        res.status(400).json({
            success:false,
            message:"User not found"
        })
    }

    const resetPasswordToken=await user.getResetToken()

    await user.save();
    
    const resetUrl = `${req.protocol}://${req.get("host")}/reset/password/${resetPasswordToken}`;

    const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

    try {
        await sendEmail({
          email: user.email,
          subject: "Reset Password",
          message,
        });
  
        res.status(200).json({
          success: true,
          message: `Email sent to ${user.email}`,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
  
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }

}

exports.resetPassword=async (req,res)=>{
    try {
        const resetPasswordToken = crypto
          .createHash("sha256")
          .update(req.params.token)
          .digest("hex");
    
        const user = await User.findOne({
          resetPasswordToken,
          resetPasswordExpire: { $gt: Date.now() },
        });
    
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Token is invalid or has expired",
          });
        }
    
        user.password = req.body.password;
    
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
    
        res.status(200).json({
          success: true,
          message: "Password Reset Successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
}

exports.getMyNotes=async(req,res)=>{

    try{
        const user =await User.findById(req.user._id);

         const notes=[];

         for(let i=0; i<user.notes.length;i++)
         {
            const note=await Note.findById(user.notes[i]).populate("owner");

            notes.push(note);
         }

         res.status(200).json({
            success:true,
            notes
         });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

