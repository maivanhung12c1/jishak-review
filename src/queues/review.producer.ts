import { winstonLogger } from "@maivanhung12c1/jishak-shared";
import { config } from "@review/config";
import { Channel } from "amqplib";
import { Logger } from "winston";
import { createConnection } from "@review/queues/connection";

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'review_service_producer', 'debug', true, config.ELASTIC_SEARCH_USERNAME, config.ELASTIC_SEARCH_PASSWORD, config.ELASTIC_SEARCH_CA);

const publishFanoutMessage = async (channel: Channel, exchangeName: string, message: string, logMessage: string): Promise<void> => {
  try {
    if (!channel) {
      channel = await createConnection() as Channel;
    }
    await channel.assertExchange(exchangeName, 'fanout');
    channel.publish(exchangeName, '', Buffer.from(message));
    log.info(`${logMessage}`);
  } catch (error) {
    log.error('error', `ReviewService publishFanoutMessage() method error: ${error}`);
  }
}

export { publishFanoutMessage };
