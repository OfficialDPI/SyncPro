import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import conversationsRouter from "./conversations";
import workspaceRouter from "./workspace";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(conversationsRouter);
router.use(workspaceRouter);

export default router;
