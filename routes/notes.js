const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const router = express.Router();
router.use(express.json());
const { body, validationResult } = require("express-validator");
// Router 1 : Get all notes of an user using : GET /api/notes/notesfetchallnotes . Login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  // Login successful
  try {
    // finding all the notes from database
    const notes = await Notes.find({ user: req.user.id });
    res.json({
      msg: "Notes fetch successfully!",
      note: notes,
    });
  } catch (error) {
    res.json({
      error: "Internal server error!",
    });
  }
});

// Router 2 : Add a note of an user using : POST /api/notes/addnote . Login required
router.post(
  "/addnote",
  fetchUser,
  // Validation check
  [
    body("title").isLength({ min: 1 }).withMessage("Enter valid title"),
    body("description")
      .isLength({ min: 3 })
      .withMessage("Please enter a valid Description"),
  ],
  async (req, res) => {
    // Login successful
    const errors = await validationResult(req);
    // Validation check
    if (!errors.isEmpty()) {
      res.json({
        error: errors.array()[0].msg,
      });
    } else {
      // create a new note with userId
      const userId = req.user.id;
      const { title, description, tag } = req.body;
      try {
        const note = await Notes.create({
          user: userId,
          title: title,
          description: description,
          tag: tag,
        });
        res.json({
          msg: "Notes added successfully!",
          note: note,
        });
      } catch (error) {
        res.json({
          error: "Internal server error!",
        });
      }
    }
  }
);

// Router 3 : Update an existing note of an user using : PUT /api/notes/updatenote . Login required
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  try {
    // Login successful
    const { title, description, tag } = req.body;
    // Create a new Note
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    // Find the user whose note to be updated
    const note = await Notes.findById(req.params.id);
    // Note not exist
    if (!note) {
      res.status(404).json({
        error: "Not Found!",
      });
    }
    // Unauthorized user
    else if (note.user.toString() !== req.user.id) {
      res.status(401).json({
        error: "Not Allowed!",
      });
    }
    // correct user
    else {
      // update Note
      const note = await Notes.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.json({
        msg: "Note updated successfully!",
        note: note,
      });
    }
  } catch (error) {
    res.json({
      error: "Internal server error!",
    });
  }
});

// Router 4 : Delete an existing note of an user using : DELETE /api/notes/deletenote . Login required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    // Note not exist
    if (!note) {
      res.json({
        error: "Not found!",
      });
    }
    // Unauthorized user
    else if (note.user.toString() !== req.user.id) {
      res.status(401).json({
        error: "Not Allowed!",
      });
    }
    // correct user
    else {
      // Deleting note
      const note = await Notes.findByIdAndDelete(req.params.id);
      res.json({
        msg: "Note deleted successfully!",
        note: note,
      });
    }
  } catch (error) {
    res.json({
      error: "Internal server error!",
    });
  }
});
module.exports = router;
