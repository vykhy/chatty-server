import express from "express";
import {
  signup,
  login,
  getUser,
  editUser,
} from "./../controllers/userController.js";
import authenticate from "./../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/get", authenticate, getUser); // Protected route
router.put("/edit", authenticate, editUser); // Protected route

export default router;
