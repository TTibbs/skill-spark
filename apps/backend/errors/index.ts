import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  status?: number;
  msg?: string;
  code?: string;
}

export const inputErrorHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).send({ msg: "Invalid input" });
};

export const psqlErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === "23502" || err.code === "22P02" || err.code === "23503") {
    res.status(400).send({ msg: "Bad request" });
  } else next(err);
};

export const customErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

export const serverErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  console.log(err, "<<<<<< ------ Unhandled error");
  res.status(500).send({ msg: "Internal server error" });
};
