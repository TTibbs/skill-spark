import express from "express";
const apiRouter = express.Router();
import endpoints from "../endpoints.json";
import authRouter from "./auth-router";
import usersRouter from "./users-router";
import categoriesRouter from "./categories-router";
import childrenRouter from "./children-router";
import shapesRouter from "./shapes-router";
import wordsRouter from "./words-router";
import achievementsRouter from "./achievements-router";
import choresRouter from "./chores-router";
import premiumRewardsRouter from "./premium-rewards-router";
import familyRewardsRouter from "./family-rewards-router";

apiRouter.get("/", (req, res) => {
  res.status(200).send({ endpoints: endpoints });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/children", childrenRouter);
apiRouter.use("/shapes", shapesRouter);
apiRouter.use("/words", wordsRouter);
apiRouter.use("/achievements", achievementsRouter);
apiRouter.use("/chores", choresRouter);
apiRouter.use("/rewards", familyRewardsRouter);
apiRouter.use("/premium-rewards", premiumRewardsRouter);

export default apiRouter;
