import { ISellerGig, winstonLogger } from "@maivanhung12c1/jishak-shared";
import { config } from '@review/config';
import { Logger } from "winston";
import { Client } from "@elastic/elasticsearch";
import { CountResponse, GetResponse } from "@elastic/elasticsearch/lib/api/types";
import * as fs from "fs";
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'review_elastic_connection', 'debug', true, config.ELASTIC_SEARCH_USERNAME, config.ELASTIC_SEARCH_PASSWORD, config.ELASTIC_SEARCH_CA);

class ElasticSearch {
  public elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL || 'http://localhost:9200'}`,
      auth: {
        username: config.ELASTIC_SEARCH_USERNAME || 'elastic',
        password: config.ELASTIC_SEARCH_PASSWORD || 'changeme'
      },
      tls: {
        ca: fs.readFileSync(config.ELASTIC_SEARCH_CA || ''),
        rejectUnauthorized: false
      }
    })
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      log.info('review Service - Checking Elasticsearch connection...');
      try {
        const health = await this.elasticSearchClient.cluster.health({});
        log.info(`review Service Elasticsearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        log.error("Connection to Elasticsearch failed", error);
        log.error('error', 'review Service: checkConnection method', error);
      }
    }
  }

  public async checkIfIndexExists(indexName: string): Promise<boolean> {
    const result: boolean = await this.elasticSearchClient.indices.exists({ index: indexName });
    return result;
  }

  public async createIndex(indexName: string): Promise<void> {
    try {
      const result: boolean = await this.checkIfIndexExists(indexName);
      if (result) {
        log.info(`Index ${indexName} already exists`);
      } else {
        await this.elasticSearchClient.indices.create({ index: indexName });
        await this.elasticSearchClient.indices.refresh({ index: indexName });
        log.info(`Index ${indexName} created successfully`);
      }
    } catch (error) {
      log.error(`An error occurred while creating index ${indexName}`);
      log.error('error', 'review Service: createIndex method', error);
    }
  }

  public async getDocumentCount(index: string): Promise<number> {
    try {
      const result: CountResponse = await this.elasticSearchClient.count({index: index});
      return result.count;
    } catch (error) {
      log.error('error', 'review Service: getDocumentById method', error);
      return 0;
    }
  }

  public async getDocumentById(indexName: string, gigId: string): Promise<ISellerGig> {
    try {
      const result: GetResponse = await this.elasticSearchClient.get({
        index: indexName,
        id: gigId
      });
      return result._source as ISellerGig;
    } catch (error) {
      log.error('error', 'review Service: getDocumentById method', error);
      return {} as ISellerGig;
    }
  }

  public async getIndexedData(index: string, itemId: string): Promise<ISellerGig> {
    try {
      const result: GetResponse = await this.elasticSearchClient.get({ index, id: itemId});
      return result._source as ISellerGig;
    } catch (error) {
      log.log('error', 'reviewService elasticsearch getIndexedData() method error:', error);
      return {} as ISellerGig;
    }
  }

  public async addDataToIndex(index: string, itemId: string, gigDocument: unknown): Promise<void> {
    try {
      await this.elasticSearchClient.index({
        index,
        id: itemId,
        document: gigDocument
      })
    } catch (error) {
      log.log('error', 'reviewService elasticsearch addDataToIndex() method error:', error);
    }
  }

  public async updateIndexedData(index: string, itemId: string, gigDocument: unknown): Promise<void> {
    try {
      await this.elasticSearchClient.update({
        index,
        id: itemId,
        doc: gigDocument
      })
    } catch (error) {
      log.log('error', 'reviewService elasticsearch updateIndexedData() method error:', error);
    }
  }

  public async deleteIndexedData(index: string, itemId: string): Promise<void> {
    try {
      await this.elasticSearchClient.delete({
        index,
        id: itemId,
      })
    } catch (error) {
      log.log('error', 'reviewService elasticsearch deleteIndexedData() method error:', error);
    }
  }

}

export const elasticSearch: ElasticSearch = new ElasticSearch();
