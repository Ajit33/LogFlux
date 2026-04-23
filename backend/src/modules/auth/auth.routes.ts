import { Router }    from "express";
import controller    from "./auth.controller";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

router.get("/status",     controller.status);
router.post("/bootstrap", controller.bootstrap);
router.post("/login",     controller.login);

// Admin only
router.post("/register",    requireAuth, requireAdmin, controller.register);
router.get("/users",        requireAuth, requireAdmin, controller.listUsers);
router.delete("/users/:id", requireAuth, requireAdmin, controller.deleteUser);
router.get("/me",           requireAuth,               controller.me);

export default router;