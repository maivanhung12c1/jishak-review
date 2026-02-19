import { Logger } from "winston";
import { config } from "@review/config";
import { winstonLogger } from "@maivanhung12c1/jishak-shared";
import { Pool } from "pg";
import { PollingWatchKind } from "typescript";

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'review_database_server', 'debug', true, config.ELASTIC_SEARCH_USERNAME, config.ELASTIC_SEARCH_PASSWORD, config.ELASTIC_SEARCH_CA);
const pool: Pool = new Pool({
      host: `${config.DATABASE_HOST}`,
      user: `${config.DATABASE_USER}`,
      password: `${config.DATABASE_PASSWORD}`,
      database: `${config.DATABASE_NAME}`,
      port: 5432,
      ...(config.NODE_ENV !== 'development' && config.CLUSTER_TYPE === 'AWS' && { ssl: { rejectUnauthorized: false } }),
    });

pool.on('error', (error: Error) => {
  log.log('error', 'Review Service - Unexpected error on idle database client', error);
  process.exit(-1);
});

const createTableText = `
  CREATE TABLE IF NOT EXISTS public.reviews (
    id SERIAL UNIQUE,
    gigId TEXT NOT NULL,
    reviewerId TEXT NOT NULL,
    orderId TEXT NOT NULL,
    sellerId TEXT NOT NULL,
    review TEXT NOT NULL,
    reviewerImage TEXT NOT NULL,
    reviewerUsername TEXT NOT NULL,
    country TEXT NOT NULL,
    reviewType TEXT NOT NULL,
    rating INTEGER DEFAULT 0 NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_DATE NOT NULL,
    PRIMARY KEY (id)
  );

  CREATE INDEX IF NOT EXISTS gigId_idx ON public.reviews (gigId);
  CREATE INDEX IF NOT EXISTS sellerId_idx ON public.reviews (sellerId);


`;



const databaseConnection = async (): Promise<void> => {
  try {
    await pool.connect();
    log.info('Review Service - Database connection has been established successfully.');
    await pool.query(createTableText);

  } catch (error) {
    log.error('Review Service - Unable to connect to the database.');
    log.log('error', 'Review Service - databaseConnection() method error', error);
  }
}

export { databaseConnection, pool };
