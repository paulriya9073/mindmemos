const Note = require("../models/Note");
const User = require("../models/User");

exports.createNotes = async (req, res) => {
  try {
    const { title, content, owner } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please log in first",
      });
    }

    const note = await Note.create({ title, content, owner: req.user._id });

    user.notes.unshift(note);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Note created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const note = await Note.findById(req.params.id);
    const { title, content } = req.body;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please log in first",
      });
    }

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Note not found",
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please log in first",
      });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Note not found",
      });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    await Note.deleteOne({ _id: note._id });

    const index = user.notes.indexOf(req.params.id);
    if (index !== -1) user.notes.splice(index, 1);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addCollaborator=async(req,res)=>{
  try {
    const {noteId,collaboratorEmail}=req.body;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can add collaborators",
      });
    }

    const collaborator = await User.findOne({ email: collaboratorEmail });
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: "User not found with that email",
      });
    }

    if (collaborator._id.toString() === note.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: "Owner cannot be added as a collaborator",
      });
    }

    if (note.collaborators.includes(collaborator._id)) {
      return res.status(400).json({
        success: false,
        message: "This user is already a collaborator",
      });
    }

    note.collaborators.push(collaborator._id);
    await note.save();

    if (collaborator.notes) {
      collaborator.notes.unshift(note._id);
      await collaborator.save();
    }

     res.status(200).json({
      success: true,
      message: "Collaborator added successfully",
    });
 
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.removeCollaborator = async (req, res) => {
  try {
    const { noteId, collaboratorId } = req.body;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const userId = req.user._id.toString();

    // Owner removing any collaborator
    if (note.owner.toString() === userId) {
      if (collaboratorId === note.owner.toString()) {
        return res.status(400).json({
          success: false,
          message: "Owner cannot remove themselves from their own note",
        });
      }

      // Remove collaborator from note
      note.collaborators = note.collaborators.filter(
        (id) => id.toString() !== collaboratorId
      );
      await note.save();

      // Remove note from collaborator's notes array
      const collaborator = await User.findById(collaboratorId);
      if (collaborator) {
        collaborator.notes = collaborator.notes.filter(
          (id) => id.toString() !== noteId.toString()
        );
        await collaborator.save();
      }

      return res.status(200).json({
        success: true,
        message: "Collaborator removed successfully by owner",
      });
    }

    // Collaborator removing themselves
    if (note.collaborators.some((id) => id.toString() === userId)) {
      if (userId !== collaboratorId) {
        return res.status(403).json({
          success: false,
          message: "Collaborators can only remove themselves",
        });
      }

      note.collaborators = note.collaborators.filter(
        (id) => id.toString() !== userId
      );
      await note.save();

      // Remove note from their notes array as well
      const user = await User.findById(userId);
      if (user) {
        user.notes = user.notes.filter(
          (id) => id.toString() !== noteId.toString()
        );
        await user.save();
      }

      return res.status(200).json({
        success: true,
        message: "You have removed yourself as a collaborator",
      });
    }

    return res.status(403).json({
      success: false,
      message: "You are not authorized to modify collaborators for this note",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    
    note.pinned = !note.pinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: note.pinned ? "Note pinned" : "Note unpinned",
      note,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


