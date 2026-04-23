import { Router } from "express";
import controller from "./search.controller";

const router = Router();

router.get("/", controller.search);

export default router;