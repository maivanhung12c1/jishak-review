import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from "@maivanhung12c1/jishak-shared";
import { config } from "@review/config";
import { Logger } from "winston";
import { Application, json, NextFunction, Request, Response, urlencoded } from "express";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import { verify } from "jsonwebtoken";
import compression from "compression";
import { elasticSearch } from "@review/elasticsearch";
import http from "http";
import { appRoutes } from "@review/routes";
import { Channel } from "amqplib";
import { createConnection } from "@review/queues/connection";
// import { consumerReviewFanoutMessage } from "@review/queues/review.consumer";
import 'express-async-errors';



const SERVER_PORT =  config.PORT;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'review_server', 'debug', true, config.ELASTIC_SEARCH_USERNAME, config.ELASTIC_SEARCH_PASSWORD, config.ELASTIC_SEARCH_CA);

let reviewChannel: Channel;

const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddlewares(app);
  routesMiddlewares(app);
  startQueues();
  startElasticSearch();
  reviewErrorHandler(app);
  startServer(app);
}

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      // origin: config.API_GATEWAY_URL || 'http://localhost:4000',
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    })
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        const payload: IAuthPayload = verify(token, config.JWT_TOKEN!) as IAuthPayload;
        req.currentUser = payload;
      }
    }
    next();
  })
}

const standardMiddlewares = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

const routesMiddlewares = (app: Application): void => {
  appRoutes(app);
}

const startQueues = async (): Promise<void> => {
  reviewChannel = await createConnection() as Channel;
}

const startElasticSearch = (): void => {
  elasticSearch.checkConnection();
  elasticSearch.createIndex('reviews');

}

const reviewErrorHandler = (app: Application): void => {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `reviewService ${error.comingFrom}`, error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
}


const startServer = async (app: Application): Promise<void> => {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`review server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`review server is running on port ${SERVER_PORT}`);
    })
  } catch (error) {
    log.log('error', 'reviewService: startHttpServer error method', error);
  }
};

export { start, reviewChannel };
