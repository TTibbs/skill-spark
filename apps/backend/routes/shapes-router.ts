import { Router, RequestHandler } from "express";
import {
  getShapes,
  getShapeById,
  createShape,
  updateShape,
  deleteShape,
} from "../controllers/shapes-controller";
import { authenticate } from "../middlewares/authMiddleware";
import { validateShapeId } from "../middlewares/validationMiddleware";

const shapesRouter = Router();

shapesRouter.use(authenticate);

shapesRouter.get("/", getShapes as RequestHandler);
shapesRouter.get(
  "/:shapeId",
  validateShapeId(),
  getShapeById as RequestHandler
);
shapesRouter.post("/", createShape as RequestHandler);
shapesRouter.patch(
  "/:shapeId",
  validateShapeId(),
  updateShape as RequestHandler
);
shapesRouter.delete(
  "/:shapeId",
  validateShapeId(),
  deleteShape as RequestHandler
);

export default shapesRouter;
