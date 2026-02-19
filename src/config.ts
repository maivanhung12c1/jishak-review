import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import path from 'path';
import { server } from 'typescript';
dotenv.config({})

if (process.env.ENABLE_APM === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('elastic-apm-node').start({
    serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'jishak-review',
    serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
    environment: process.env.NODE_ENV || 'development',
    active: true,
    logLevel: 'trace',
    captureBody: 'all',
    errorOnAbortedRequests: true,
    captureErrorLogStackTraces: 'always',
  });
}

class Config {
  public NODE_ENV: string | undefined;
  public CLIENT_URL: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;
  public ELASTIC_SEARCH_USERNAME: string | undefined;
  public ELASTIC_SEARCH_PASSWORD: string | undefined;
  public ELASTIC_SEARCH_CA: string | undefined;
  public GATEWAY_JWT_TOKEN: string | undefined;
  public JWT_TOKEN: string | undefined;
  public API_GATEWAY_URL: string | undefined;
  public DATABASE_HOST: string | undefined;
  public DATABASE_USER: string | undefined;
  public DATABASE_PASSWORD: string | undefined;
  public DATABASE_NAME: string | undefined;
  public PORT: number | undefined;
  public ELASTIC_CLOUD_ID: string | undefined;
  public CLUSTER_TYPE: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
    this.ELASTIC_SEARCH_USERNAME = process.env.ELASTIC_SEARCH_USERNAME || '';
    this.ELASTIC_SEARCH_PASSWORD = process.env.ELASTIC_SEARCH_PASSWORD || '';
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || '1234';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || '';
    this.DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
    this.DATABASE_USER = process.env.DATABASE_USER || 'jishak';
    this.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || 'jishakpw';
    this.DATABASE_NAME = process.env.DATABASE_NAME || 'jishak-review';
    this.PORT = process.env.PORT ? Number(process.env.PORT) : 4007;
    this.ELASTIC_CLOUD_ID = process.env.ELASTIC_CLOUD_ID || '';
    // this.ELASTIC_SEARCH_CA = path.resolve(process.cwd(), `${process.env.ELASTIC_SEARCH_CA}`) || '';
    const caEnv = process.env.ELASTIC_SEARCH_CA?.trim();
    this.ELASTIC_SEARCH_CA = caEnv && caEnv !== 'undefined' && caEnv !== 'null' ? path.resolve(process.cwd(), caEnv) : '';
    this.CLUSTER_TYPE = process.env.CLUSTER_TYPE || 'local';
  }

}

export const config: Config = new Config();
