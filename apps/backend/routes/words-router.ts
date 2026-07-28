import { Router, RequestHandler } from "express";
import {
  getWords,
  createWord,
  getWordById,
  updateWord,
  deleteWord,
} from "../controllers/words-controller";
import { authenticate } from "../middlewares/authMiddleware";
import { validateWordId } from "../middlewares/validationMiddleware";

const wordsRouter = Router();

wordsRouter.use(authenticate);

wordsRouter.get("/", getWords as RequestHandler);
wordsRouter.post("/", createWord as RequestHandler);
wordsRouter.get("/:wordId", validateWordId(), getWordById as RequestHandler);
wordsRouter.patch("/:wordId", validateWordId(), updateWord as RequestHandler);
wordsRouter.delete("/:wordId", validateWordId(), deleteWord as RequestHandler);

export default wordsRouter;
