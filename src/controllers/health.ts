import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

const health = (_req: Request, res: Response): void => {
  res.status(StatusCodes.OK).send('Review Service is healthy');
}

export { health };
