import { Router, RequestHandler } from "express";
const categoriesRouter = Router();
import { authenticate } from "../middlewares/authMiddleware";
import {
  getWordCategories,
  getWordCategory,
  createWordCategory,
  getChoreCategories,
  getChoreCategory,
  createChoreCategory,
  patchChoreCategory,
  deleteChoreCategory,
} from "../controllers/categories-controller";
import { validateChoreCategoryId } from "../middlewares/validationMiddleware";

categoriesRouter.use(authenticate);

categoriesRouter.get("/word-categories", getWordCategories as RequestHandler);
categoriesRouter.get(
  "/word-categories/:name",
  getWordCategory as RequestHandler
);
categoriesRouter.post("/word-categories", createWordCategory as RequestHandler);
categoriesRouter.get("/chore-categories", getChoreCategories as RequestHandler);
categoriesRouter.get(
  "/chore-categories/:name",
  getChoreCategory as RequestHandler
);
categoriesRouter.post(
  "/chore-categories",
  createChoreCategory as RequestHandler
);
categoriesRouter.patch(
  "/chore-categories/:id",
  validateChoreCategoryId(),
  patchChoreCategory as RequestHandler
);
categoriesRouter.delete(
  "/chore-categories/:id",
  validateChoreCategoryId(),
  deleteChoreCategory as RequestHandler
);

export default categoriesRouter;
