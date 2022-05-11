const config = require('../init_config');
const pool = require('../init_db_pool');
const logger = require('../config/logger');
var client;
const bh = require(`../etran/baseHandlerNew`)

if (config.SYSTEM.kafkaConfig.consumer.active) {
    logger.info(`Kafka consumer готов к работе ${config.SYSTEM.kafkaConfig.consumer.nodes}`);

    var kafka = require('kafka-node'),
        Consumer = kafka.Consumer,
        kafkaClient = new kafka.KafkaClient({ kafkaHost: `${config.SYSTEM.kafkaConfig.consumer.nodes}` }),
        consumer = new Consumer(
            kafkaClient,
            [
                {
                    // topic name
                    topic: config.SYSTEM.kafkaConfig.consumer.options.topic,
                    // start offset
                    offset: config.SYSTEM.kafkaConfig.consumer.options.offset,
                    // queue partition
                    partition: config.SYSTEM.kafkaConfig.consumer.options.partition,
                    // auto commit
                    autoCommit: config.SYSTEM.kafkaConfig.consumer.options.autoCommit,
                    // commit interval
                    autoCommitIntervalMs: config.SYSTEM.kafkaConfig.consumer.options.autoCommitIntervalMs,
                    //consumer group id
                    groupId: config.SYSTEM.kafkaConfig.consumer.options.groupId,
                    // The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms
                    fetchMaxWaitMs: config.SYSTEM.kafkaConfig.consumer.options.fetchMaxWaitMs,
                    // This is the minimum number of bytes of messages that must be available to give a response, default 1 byte
                    fetchMinBytes: config.SYSTEM.kafkaConfig.consumer.options.fetchMinBytes,
                    // The maximum bytes to include in the message set for this partition. This helps bound the size of the response.
                    fetchMaxBytes: config.SYSTEM.kafkaConfig.consumer.options.fetchMaxBytes,
                    // If set true, consumer will fetch message from the given offset in the payloads
                    fromOffset: config.SYSTEM.kafkaConfig.consumer.options.fromOffset,
                    // If set to 'buffer', values will be returned as raw buffer objects.
                    encoding: config.SYSTEM.kafkaConfig.consumer.options.encoding,
                    keyEncoding: config.SYSTEM.kafkaConfig.consumer.options.keyEncoding
                }
            ]
        );

    var appRouter = async function () {
        consumer.on('message', async function (message) {

            try {
                client = await pool.connect();
                try {
                    console.log("Считано очередное сообщение");
                    //console.log(message.key)
                    //console.log(message.value)

                    eventResult = await bh.baseHandlerNew(message);

                    if (config.SYSTEM.kafkaConfig.consumer.options.autoCommit !== true) {
                        consumer.commit(function (err, data) { });
                    }
                } finally {
                    await client.release();
                }
            } catch (e) {
                logger.error(e);
            }
        });

        consumer.on(`error`, async function (err) {
            logger.error(`Ошибка при чтении данных из очереди`);
            logger.error(err);
        });
    }
} else {
    var appRouter = async function () {
        logger.info("Consumer kafka выключен");
    }
}


module.exports = appRouter;