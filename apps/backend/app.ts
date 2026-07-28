import express, { Request, Response } from "express";
import cors from "cors";
import apiRouter from "./routes/api-router";
const app = express();
import {
  inputErrorHandler,
  psqlErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} from "./errors";

const clientUrls = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: clientUrls,
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).send({ message: "Welcome to the API!" });
});

app.use("/api", apiRouter);
app.use("/api/*splat", inputErrorHandler);
app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

export default app;
