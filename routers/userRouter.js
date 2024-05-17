import express from "express";
import {
  signup,
  login,
  getUser,
  editUser,
  getUsers,
} from "./../controllers/userController.js";
import authenticate from "./../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUser);
router.put("/:id/edit", authenticate, editUser);

export default router;
