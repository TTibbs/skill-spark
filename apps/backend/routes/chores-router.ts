import { Router, RequestHandler } from "express";
import {
  getChores,
  getChoreById,
  createChore,
  updateChore,
  deleteChore,
} from "../controllers/chores-controller";
import { authenticate } from "../middlewares/authMiddleware";
import { validateChoreId } from "../middlewares/validationMiddleware";

const choresRouter = Router();

choresRouter.use(authenticate);

choresRouter.get("/", getChores as RequestHandler);
choresRouter.post("/", createChore as RequestHandler);
choresRouter.get(
  "/:choreId",
  validateChoreId(),
  getChoreById as RequestHandler
);
choresRouter.patch(
  "/:choreId",
  validateChoreId(),
  updateChore as RequestHandler
);
choresRouter.delete(
  "/:choreId",
  validateChoreId(),
  deleteChore as RequestHandler
);

export default choresRouter;
