import { review } from "@review/controllers/create";
import { reviewByGigId, reviewBySellerId } from "@review/controllers/get";
import express, { Router } from "express";

const router: Router = express.Router();
const reviewRoutes = (): Router => {
  router.get('/gig/:gigId', reviewByGigId);
  router.get('/seller/:sellerId', reviewBySellerId);
  router.post('/', review);

  return router;
};
export { reviewRoutes };
