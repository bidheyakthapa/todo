const router = require("express").Router();
const User = require("../models/user");

const Task = require("../models/task");
const { authenticateToken } = require("./auth");

//createtask
router.post("/createTask", authenticateToken, async (req, res) => {
  try {
    const { title, desc } = req.body;
    const { id } = req.headers;
    const newTask = new Task({ title: title, desc: desc });
    const saveTask = await newTask.save();
    const taskId = saveTask._id;
    await User.findByIdAndUpdate(id, { $push: { tasks: taskId._id } });
    res.status(200).json({ message: "Task created" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Internal server error" });
  }
});

module.exports = router;
