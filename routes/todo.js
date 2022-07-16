const express = require("express");
const router = express.Router();

// express-validator

const { body, validationResult } = require("express-validator");

// isAtuhenticated
const { isAuthenticated } = require("../middleware/auth");

// Todo
const Todo = require("../models/Todo");

// ROUTE 1: Get All the Todos
router.get("/allTodos", isAuthenticated, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user });
    res.json(todos);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Add a new Note using: POST "/api/notes/addnote". Login required
router.post(
  "/addTodo",
  isAuthenticated,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description } = req.body;

      // If there are errors, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const todo = new Todo({
        title,
        description,
        user: req.user,
      });
      const savedTodo = await todo.save();
      res.json(savedTodo);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Update an existing Todo using PUT: Login required
router.put("/updateTodo/:id", isAuthenticated, async (req, res) => {
  const { title, description } = req.body;
  try {
    // Create a newTodo object
    const newTodo = {};
    if (title) {
      newTodo.title = title;
    }
    if (description) {
      newTodo.description = description;
    }

    // Find the todo to be updated and update it
    let todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).send("Not Found");
    }

    if (todo.user.toString() !== req.user) {
      return res.status(401).send("Not Allowed");
    }
    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: newTodo },
      { new: true }
    );
    res.json({ todo });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4: Delete an existing Note using: DELETE Login required
router.delete("/deleteTodo/:id", isAuthenticated, async (req, res) => {
  try {
    // Find the note to be delete and delete it
    let todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).send("Not Found");
    }

    // Allow deletion only if user owns this Note
    if (todo.user.toString() !== req.user) {
      return res.status(401).send("Not Allowed");
    }

    todo = await Todo.findByIdAndDelete(req.params.id);
    res.json({ Success: "Todo has been deleted", todo: todo });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// exports
module.exports = router;
