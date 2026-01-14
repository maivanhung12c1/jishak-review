import { IReviewDocument, IReviewMessageDetails } from "@maivanhung12c1/jishak-shared";
import { pool } from "@review/database";
import { publishFanoutMessage } from "@review/queues/review.producer";
import { reviewChannel } from "@review/server";
import { QueryResult } from "pg";

const addReview = async (data: IReviewDocument): Promise<IReviewDocument> => {
  const {
    gigId,
    reviewerId,
    reviewerImage,
    sellerId,
    review,
    rating,
    orderId,
    reviewType,
    reviewerUsername,
    country
  } = data;
  const createAtDate = new Date();
  const { rows } = await pool.query(
    `INSERT INTO reviews(
      gigId,
      reviewerId,
      orderId,
      sellerId,
      review,
      reviewerImage,
      reviewerUsername,
      country,
      reviewType,
      rating,
      createAtDate) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [gigId,
    reviewerId,
    orderId,
    sellerId,
    review,
    reviewerImage,
    reviewerUsername,
    country,
    reviewType,
    rating,
    createAtDate]
  );
  const messageDetails: IReviewMessageDetails = {
    gigId: data.gigId,
    reviewerId: data.reviewerId,
    sellerId: data.sellerId,
    rating: data.rating,
    review: data.review,
    orderId: data.orderId,
    createdAt: `${createAtDate}`,
    type: `${data.reviewType}`
  };
  await publishFanoutMessage(
    reviewChannel,
    'jishak-review',
    JSON.stringify(messageDetails),
    'Review details sent to order and users services'
  )
  return rows[0];
};

const getReviewsByGigId = async (gigId: string): Promise<IReviewDocument[]> => {
  const reviews: QueryResult = await pool.query(
    `SELECT * FROM reviews WHERE reviews.gigId = $1`,
    [gigId]
  );
  return reviews.rows;
}

const getReviewsBySellerId = async (sellerId: string): Promise<IReviewDocument[]> => {
  const reviews: QueryResult = await pool.query(
    `SELECT * FROM reviews WHERE reviews.sellerId = $1 AND reviews.reviewType = '$2'`,
    [sellerId, 'seller-review']
  );
  return reviews.rows;
}


export { addReview, getReviewsByGigId, getReviewsBySellerId };
