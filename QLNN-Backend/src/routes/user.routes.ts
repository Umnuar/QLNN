import { Router } from "express";
import {
	createUser,
	deleteUser,
	getUsers,
	updatePassword,
	updateUser,
} from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Toàn bộ user routes cần authentication
router.use(authenticateToken);

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/password", updatePassword);

export default router;
