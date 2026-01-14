import { IReviewDocument } from "@maivanhung12c1/jishak-shared";
import { getReviewsByGigId, getReviewsBySellerId } from "@review/services/review.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const reviewByGigId = async (req: Request, res: Response): Promise<void> => {
  const review: IReviewDocument[] = await getReviewsByGigId(`${req.params.gigId}`);
  res.status(StatusCodes.OK).json({message: 'Gig reviews by gig id', review});
};

export const reviewBySellerId = async (req: Request, res: Response): Promise<void> => {
  const review: IReviewDocument[] = await getReviewsBySellerId(`${req.params.sellerId}`);
  res.status(StatusCodes.OK).json({message: 'Gig reviews by seller id', review});
};

