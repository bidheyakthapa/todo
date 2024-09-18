const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Sign In APIs
router.post("/signin", async (req, res) => {
  try {
    const { username } = req.body;
    const { email } = req.body;
    const existingEmail = await User.findOne({ email: email });
    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username should have atleast 4 characters" });
    } else if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    await newUser.save();
    return res.status(200).json({ message: "SignIn sucessfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Internal server error" });
  }
});

//Log In
router.get("/login", async (req, res) => {
  const { email, password } = req.body;
  const existingEmail = await User.findOne({ email: email });
  if (!existingEmail) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  bcrypt.compare(password, existingEmail.password, (err, data) => {
    if (data) {
      const authClaims = [{ email: email }, { jti: jwt.sign({}, "tcmTm") }];
      const token = jwt.sign({ authClaims }, "tcmTM", { expiresIn: "2d" });
      res.status(200).json({ id: existingEmail._id, token: token });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  });
});

module.exports = router;
