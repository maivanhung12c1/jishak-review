import client, { Channel, Connection, ChannelModel } from 'amqplib';
import { Logger } from "winston";
import { config } from "@review/config";
import { winstonLogger } from '@maivanhung12c1/jishak-shared';


const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'review_queue_connection', 'debug', true, config.ELASTIC_SEARCH_USERNAME, config.ELASTIC_SEARCH_PASSWORD, config.ELASTIC_SEARCH_CA);
export async function createConnection(): Promise<Channel | undefined> {
  try {
    const channelModel: ChannelModel = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await channelModel.createChannel();
    log.info('Review server connected to RabbitMQ successfully');
    closeConnection(channelModel, channel);
    return channel;
  } catch (error) {
    log.error('error', 'ReviewService createConnection() method error', error);
    return undefined;
  }
}

function closeConnection(channelModel: ChannelModel, channel: Channel): void {
  process.once('SIGINT', async () => {
    await channel.close();
    await channelModel.close();
  });
}
